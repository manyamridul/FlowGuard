const STORAGE_KEY = "flowguard-project-extras";

export const SDLC_PHASES = [
  { value: "REQUIREMENTS", label: "Requirements Gathering" },
  { value: "FEASIBILITY_STUDY", label: "Feasibility Study" },
  { value: "DESIGN", label: "Design" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "TESTING", label: "Testing" },
  { value: "DEPLOYMENT", label: "Deployment" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export const DOMAINS = [
  { key: "FRONTEND", label: "Frontend" },
  { key: "BACKEND", label: "Backend" },
  { key: "DATABASE", label: "Database" },
  { key: "QA", label: "QA & Testers" },
];

const SDLC_PROGRESS = {
  REQUIREMENTS: 8,
  FEASIBILITY_STUDY: 18,
  DESIGN: 32,
  DEVELOPMENT: 55,
  TESTING: 78,
  DEPLOYMENT: 92,
  MAINTENANCE: 100,
};

const WORK_BY_SDLC = {
  REQUIREMENTS: { FRONTEND: 4, BACKEND: 4, DATABASE: 6, QA: 2 },
  FEASIBILITY_STUDY: { FRONTEND: 8, BACKEND: 8, DATABASE: 12, QA: 4 },
  DESIGN: { FRONTEND: 22, BACKEND: 18, DATABASE: 28, QA: 10 },
  DEVELOPMENT: { FRONTEND: 58, BACKEND: 52, DATABASE: 48, QA: 22 },
  TESTING: { FRONTEND: 82, BACKEND: 78, DATABASE: 74, QA: 70 },
  DEPLOYMENT: { FRONTEND: 95, BACKEND: 94, DATABASE: 90, QA: 88 },
  MAINTENANCE: { FRONTEND: 100, BACKEND: 100, DATABASE: 100, QA: 100 },
};

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const sdlcLabel = (value) =>
  SDLC_PHASES.find((phase) => phase.value === value)?.label || value || "—";

export const inferSdlcFromStatus = (status) => {
  if (status === "COMPLETED") return "MAINTENANCE";
  if (status === "ON_HOLD") return "DESIGN";
  if (status === "ACTIVE") return "DEVELOPMENT";
  if (status === "CANCELLED") return "REQUIREMENTS";
  return "REQUIREMENTS";
};

export const getProjectExtras = (projectId) => {
  if (projectId == null) return {};
  return readStore()[String(projectId)] || {};
};

export const saveProjectExtras = (projectId, updates) => {
  if (projectId == null) return {};

  const store = readStore();
  const key = String(projectId);
  const next = {
    ...store[key],
    ...updates,
  };

  store[key] = next;
  writeStore(store);
  return next;
};

export const mergeProjectExtras = (projectId, updates) => {
  return saveProjectExtras(projectId, {
    ...getProjectExtras(projectId),
    ...updates,
  });
};

export const deleteProjectExtras = (projectId) => {
  const store = readStore();
  delete store[String(projectId)];
  writeStore(store);
};

export const getUserDisplayName = (user) => {
  if (!user) return "Unknown";

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.username || user.email || "Unknown";
};

export const getUserDomain = (user) => {
  const department = String(user?.department || "").toLowerCase();
  const role = String(user?.role || "").toUpperCase();

  if (
    department.includes("front") ||
    department.includes("ui") ||
    department.includes("react")
  ) {
    return "FRONTEND";
  }

  if (
    department.includes("back") ||
    department.includes("api") ||
    department.includes("server")
  ) {
    return "BACKEND";
  }

  if (
    department.includes("data") ||
    department.includes("dba") ||
    department.includes("sql") ||
    department === "db"
  ) {
    return "DATABASE";
  }

  if (
    department.includes("qa") ||
    department.includes("test") ||
    department.includes("quality") ||
    role === "TESTER"
  ) {
    return "QA";
  }

  if (role === "DEVELOPER") {
    return "FRONTEND";
  }

  return null;
};

export const groupUsersByDomain = (users = []) => {
  const grouped = {
    FRONTEND: [],
    BACKEND: [],
    DATABASE: [],
    QA: [],
  };

  users.forEach((user) => {
    const domain = getUserDomain(user);
    if (domain && grouped[domain]) {
      grouped[domain].push(user);
    }
  });

  return grouped;
};

export const getProjectSdlc = (project) => {
  const stored = getProjectExtras(project?.id).sdlc;
  return stored || inferSdlcFromStatus(project?.status);
};

export const getTaskCompletionPercent = (projectId, tasks = []) => {
  const projectTasks = tasks.filter((task) => {
    const taskProject = task.project?.id ?? task.project;
    return String(taskProject) === String(projectId);
  });

  if (!projectTasks.length) return null;

  const done = projectTasks.filter((task) => task.status === "DONE").length;
  return Math.round((done / projectTasks.length) * 100);
};

export const getProjectPercent = (project, tasks = []) => {
  const stored = getProjectExtras(project?.id).percentComplete;
  if (stored != null && stored !== "") {
    return Number(stored);
  }

  const fromTasks = getTaskCompletionPercent(project?.id, tasks);
  if (fromTasks != null) return fromTasks;

  return SDLC_PROGRESS[getProjectSdlc(project)] || 0;
};

export const getWorkDone = (project) => {
  const stored = getProjectExtras(project?.id).workDone;
  if (stored && typeof stored === "object") {
    return {
      FRONTEND: Number(stored.FRONTEND) || 0,
      BACKEND: Number(stored.BACKEND) || 0,
      DATABASE: Number(stored.DATABASE) || 0,
      QA: Number(stored.QA) || 0,
    };
  }

  return (
    WORK_BY_SDLC[getProjectSdlc(project)] || WORK_BY_SDLC.REQUIREMENTS
  );
};

export const getAssignedIds = (project) => {
  const stored = getProjectExtras(project?.id).assignedIds || {};

  return {
    FRONTEND: (stored.FRONTEND || []).map(String),
    BACKEND: (stored.BACKEND || []).map(String),
    DATABASE: (stored.DATABASE || []).map(String),
    QA: (stored.QA || []).map(String),
  };
};

const uniqueIds = (values) =>
  Array.from(new Set(values.map(String).filter(Boolean)));

export const seedAssignedIds = (project, users = [], tasks = []) => {
  const existing = getProjectExtras(project?.id).assignedIds;
  if (existing) {
    return getAssignedIds(project);
  }

  const grouped = groupUsersByDomain(users);
  const assigned = {
    FRONTEND: [],
    BACKEND: [],
    DATABASE: [],
    QA: [],
  };

  tasks.forEach((task) => {
    const taskProject = task.project?.id ?? task.project;
    if (String(taskProject) !== String(project?.id)) return;

    const assigneeId = task.assigned_to?.id ?? task.assigned_to;
    if (!assigneeId) return;

    const user = users.find((item) => String(item.id) === String(assigneeId));
    const domain = getUserDomain(user);
    if (domain) {
      assigned[domain].push(String(assigneeId));
    }
  });

  DOMAINS.forEach(({ key }) => {
    const pool = grouped[key] || [];
    if (assigned[key].length === 0 && pool.length > 0) {
      const take = Math.max(1, Math.ceil(pool.length / 2));
      assigned[key] = pool.slice(0, take).map((user) => String(user.id));
    } else {
      assigned[key] = uniqueIds(assigned[key]);
    }
  });

  mergeProjectExtras(project.id, { assignedIds: assigned });
  return assigned;
};

export const getDomainCapacity = (project, users = [], tasks = []) => {
  const grouped = groupUsersByDomain(users);
  const assignedIds = seedAssignedIds(project, users, tasks);

  return DOMAINS.map(({ key, label }) => {
    const pool = grouped[key] || [];
    const assignedSet = new Set(assignedIds[key] || []);
    const assignedPeople = pool.filter((user) =>
      assignedSet.has(String(user.id))
    );
    const freePeople = pool.filter(
      (user) => !assignedSet.has(String(user.id))
    );

    return {
      key,
      label,
      total: pool.length,
      assigned: assignedPeople.length,
      free: freePeople.length,
      assignedPeople,
      freePeople,
      pool,
    };
  });
};

export const getProjectManagerName = (project, users = []) => {
  const stored = getProjectExtras(project?.id).managerName;
  if (stored) return stored;

  const manager = users.find(
    (user) =>
      String(user.role || "").toUpperCase() === "MANAGER" ||
      String(user.role || "").toUpperCase() === "ADMIN"
  );

  return (
    getUserDisplayName(manager) ||
    project?.created_by_name ||
    "Not assigned"
  );
};
