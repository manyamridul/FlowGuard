import { useState, useMemo, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import Table from "../../components/Tables/Table";
import Modal from "../../components/Modal/Modal";
import Badge from "../../components/Badge/Badge";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  getUsers,
} from "../../services/api";

import {
  SDLC_PHASES,
  sdlcLabel,
  inferSdlcFromStatus,
  getProjectSdlc,
  getProjectPercent,
  getWorkDone,
  getAssignedIds,
  getDomainCapacity,
  getProjectManagerName,
  getUserDisplayName,
  mergeProjectExtras,
  deleteProjectExtras,
} from "../../utils/projectExtras";

const emptyProject = {
  name: "",
  description: "",
  status: "PLANNING",
  priority: "MEDIUM",
  start_date: "",
  due_date: "",
  sdlc: "REQUIREMENTS",
  percentComplete: "",
};

const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const ProjectForm = ({
  formData,
  setFormData,
  saving,
  apiError,
  onSubmit,
  submitLabel,
  onCancel,
}) => (
  <div className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Project Name
      </label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) =>
          setFormData({
            ...formData,
            name: e.target.value,
          })
        }
        className={fieldClass}
        placeholder="Enter project name"
        disabled={saving}
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Description
      </label>
      <textarea
        value={formData.description}
        onChange={(e) =>
          setFormData({
            ...formData,
            description: e.target.value,
          })
        }
        rows={3}
        className={fieldClass}
        placeholder="Project description"
        disabled={saving}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value,
              sdlc: inferSdlcFromStatus(e.target.value),
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={saving}
        >
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          SDLC Phase
        </label>
        <select
          value={formData.sdlc}
          onChange={(e) =>
            setFormData({
              ...formData,
              sdlc: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={saving}
        >
          {SDLC_PHASES.map((phase) => (
            <option key={phase.value} value={phase.value}>
              {phase.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) =>
            setFormData({
              ...formData,
              priority: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={saving}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          % Complete
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.percentComplete}
          onChange={(e) =>
            setFormData({
              ...formData,
              percentComplete: e.target.value,
            })
          }
          className={fieldClass}
          placeholder="Auto from tasks / SDLC"
          disabled={saving}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) =>
            setFormData({
              ...formData,
              start_date: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={saving}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) =>
            setFormData({
              ...formData,
              due_date: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={saving}
        />
      </div>
    </div>

    {apiError && (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        {apiError}
      </div>
    )}

    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button onClick={onSubmit} disabled={saving || !formData.name.trim()}>
        {saving ? "Saving..." : submitLabel}
      </Button>
    </div>
  </div>
);

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [extrasVersion, setExtrasVersion] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sdlcFilter, setSdlcFilter] = useState("All");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [formData, setFormData] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setApiError("");

      const [projectData, taskData, userData] = await Promise.all([
        getProjects(),
        getTasks().catch(() => []),
        getUsers().catch(() => []),
      ]);

      setProjects(projectData.results || projectData || []);
      setTasks(
        Array.isArray(taskData) ? taskData : taskData?.results || []
      );
      setUsers(
        Array.isArray(userData) ? userData : userData?.results || []
      );
    } catch (error) {
      console.error("Failed to load projects:", error);
      setApiError(
        error.response?.data?.detail || "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshExtras = () => setExtrasVersion((value) => value + 1);

  const persistExtras = (projectId, form) => {
    mergeProjectExtras(projectId, {
      sdlc: form.sdlc || inferSdlcFromStatus(form.status),
      percentComplete:
        form.percentComplete === "" || form.percentComplete == null
          ? undefined
          : Number(form.percentComplete),
    });
    refreshExtras();
  };

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const searchValue = search.toLowerCase().trim();
      const sdlc = getProjectSdlc(project);

      const matchSearch =
        !searchValue ||
        project.name?.toLowerCase().includes(searchValue) ||
        project.description?.toLowerCase().includes(searchValue) ||
        project.created_by_name?.toLowerCase().includes(searchValue) ||
        String(project.id).includes(searchValue);

      const matchStatus =
        statusFilter === "All" || project.status === statusFilter;

      const matchSdlc = sdlcFilter === "All" || sdlc === sdlcFilter;

      return matchSearch && matchStatus && matchSdlc;
    });
  }, [projects, search, statusFilter, sdlcFilter, extrasVersion]);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      setApiError("");

      const createdProject = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
      });

      persistExtras(createdProject.id, formData);
      setProjects((prev) => [createdProject, ...prev]);
      setFormData(emptyProject);
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Create project failed:", error);
      setApiError(
        error.response?.data?.detail || "Failed to create project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId || !formData.name.trim()) return;

    try {
      setSaving(true);
      setApiError("");

      const updatedProject = await updateProject(editingId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
      });

      persistExtras(editingId, formData);
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingId ? updatedProject : project
        )
      );
      setFormData(emptyProject);
      setEditingId(null);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Update project failed:", error);
      setApiError(
        error.response?.data?.detail || "Failed to update project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setSaving(true);
      setApiError("");
      await deleteProject(deletingId);
      deleteProjectExtras(deletingId);
      setProjects((prev) =>
        prev.filter((project) => project.id !== deletingId)
      );
      setDeletingId(null);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Delete project failed:", error);
      setApiError(
        error.response?.data?.detail || "Failed to delete project."
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "PLANNING",
      priority: project.priority || "MEDIUM",
      start_date: project.start_date || "",
      due_date: project.due_date || "",
      sdlc: getProjectSdlc(project),
      percentComplete: getProjectPercent(project, tasks),
    });
    setApiError("");
    setIsEditOpen(true);
  };

  const openDetails = (project) => {
    setSelectedProject(project);
    getDomainCapacity(project, users, tasks);
    refreshExtras();
    setIsDetailsOpen(true);
  };

  const resetForm = () => {
    setFormData(emptyProject);
    setEditingId(null);
    setApiError("");
  };

  const badgeVariant = (value) => {
    if (value === "COMPLETED" || value === "MAINTENANCE") return "success";
    if (value === "PLANNING" || value === "REQUIREMENTS") return "info";
    if (value === "FEASIBILITY_STUDY") return "info";
    if (value === "ACTIVE" || value === "DEVELOPMENT") return "primary";
    if (value === "ON_HOLD" || value === "TESTING") return "warning";
    if (value === "CANCELLED" || value === "CRITICAL") return "danger";
    if (value === "DESIGN" || value === "DEPLOYMENT") return "purple";
    if (value === "HIGH") return "warning";
    if (value === "MEDIUM") return "primary";
    return "default";
  };

  const displayStatus = (value) => {
    const labels = {
      PLANNING: "Planning",
      ACTIVE: "Active",
      ON_HOLD: "On Hold",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return labels[value] || value;
  };

  const displayPriority = (value) => {
    const labels = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "Critical",
    };
    return labels[value] || value;
  };

  const toggleAssignee = (project, domainKey, userId) => {
    const current = getAssignedIds(project);
    const already = current[domainKey].includes(String(userId));
    const nextIds = {
      ...current,
      [domainKey]: already
        ? current[domainKey].filter((id) => id !== String(userId))
        : [...current[domainKey], String(userId)],
    };

    mergeProjectExtras(project.id, { assignedIds: nextIds });
    refreshExtras();
  };

  const updateWorkDone = (project, domainKey, value) => {
    const workDone = {
      ...getWorkDone(project),
      [domainKey]: Math.min(100, Math.max(0, Number(value) || 0)),
    };
    mergeProjectExtras(project.id, { workDone });
    refreshExtras();
  };

  const updateManagerName = (project, managerName) => {
    mergeProjectExtras(project.id, { managerName });
    refreshExtras();
  };

  const detailsProject =
    projects.find((project) => project.id === selectedProject?.id) ||
    selectedProject;

  const domainCapacity = detailsProject
    ? getDomainCapacity(detailsProject, users, tasks)
    : [];

  const workDone = detailsProject ? getWorkDone(detailsProject) : {};

  const rows = filtered.map((project) => {
    const percent = getProjectPercent(project, tasks);
    const sdlc = getProjectSdlc(project);

    return [
      <span key={`id-${project.id}`} className="font-mono text-xs text-slate-300">
        #{project.id}
      </span>,
      <div key={`name-${project.id}`}>
        <p className="font-medium text-slate-100">{project.name}</p>
        <p className="text-xs text-slate-400">
          {project.description
            ? project.description.slice(0, 50) +
              (project.description.length > 50 ? "..." : "")
            : "No description"}
        </p>
      </div>,
      <div key={`pct-${project.id}`} className="min-w-[120px]">
        <div className="mb-1 flex justify-between text-xs text-slate-300">
          <span>{percent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-sky-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>,
      <Badge key={`sdlc-${project.id}`} variant={badgeVariant(sdlc)}>
        {sdlcLabel(sdlc)}
      </Badge>,
      <Badge key={`priority-${project.id}`} variant={badgeVariant(project.priority)}>
        {displayPriority(project.priority)}
      </Badge>,
      <span key={`due-${project.id}`} className="text-sm text-slate-300">
        {project.due_date || "Not set"}
      </span>,
      <Badge key={`status-${project.id}`} variant={badgeVariant(project.status)}>
        {displayStatus(project.status)}
      </Badge>,
      <div key={`actions-${project.id}`} className="flex gap-1">
        <button
          type="button"
          onClick={() => openDetails(project)}
          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
          title="Project details"
        >
          <FiEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => openEdit(project)}
          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
          title="Edit project"
          disabled={saving}
        >
          <FiEdit2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setDeletingId(project.id);
            setApiError("");
            setIsDeleteOpen(true);
          }}
          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Delete project"
          disabled={saving}
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>,
    ];
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? "project" : "projects"}{" "}
            · SDLC, progress, and team capacity
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <FiPlus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {apiError &&
        !isCreateOpen &&
        !isEditOpen &&
        !isDeleteOpen && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, name, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sdlcFilter}
            onChange={(e) => setSdlcFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All SDLC phases</option>
            {SDLC_PHASES.map((phase) => (
              <option key={phase.value} value={phase.value}>
                {phase.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-800/80 p-8 text-center">
            <p className="text-sm text-slate-400">Loading projects...</p>
          </div>
        ) : filtered.length > 0 ? (
          <Table
            headers={[
              "Project ID",
              "Project Name",
              "% Complete",
              "SDLC",
              "Priority",
              "Due Date",
              "Status",
              "Actions",
            ]}
            rows={rows}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-800/80 p-8 text-center">
            <p className="text-lg font-semibold text-slate-100">
              No projects available yet
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Create a project to get started.
            </p>
          </div>
        )}
      </Card>

      <Modal
        title="Create Project"
        isOpen={isCreateOpen}
        onClose={() => {
          if (!saving) {
            setIsCreateOpen(false);
            resetForm();
          }
        }}
        size="lg"
      >
        <ProjectForm
          formData={formData}
          setFormData={setFormData}
          saving={saving}
          apiError={apiError}
          onSubmit={handleCreate}
          submitLabel="Create Project"
          onCancel={() => {
            if (!saving) {
              setIsCreateOpen(false);
              resetForm();
            }
          }}
        />
      </Modal>

      <Modal
        title="Edit Project"
        isOpen={isEditOpen}
        onClose={() => {
          if (!saving) {
            setIsEditOpen(false);
            resetForm();
          }
        }}
        size="lg"
      >
        <ProjectForm
          formData={formData}
          setFormData={setFormData}
          saving={saving}
          apiError={apiError}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
          onCancel={() => {
            if (!saving) {
              setIsEditOpen(false);
              resetForm();
            }
          }}
        />
      </Modal>

      <Modal
        title={detailsProject ? detailsProject.name : "Project details"}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedProject(null);
        }}
        size="3xl"
      >
        {detailsProject && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-xs text-slate-400">Project ID</p>
                <p className="mt-1 font-mono text-sm text-white">
                  #{detailsProject.id}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-xs text-slate-400">SDLC phase</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {sdlcLabel(getProjectSdlc(detailsProject))}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-xs text-slate-400">Timeline</p>
                <p className="mt-1 text-sm text-white">
                  {detailsProject.start_date || "Not set"} →{" "}
                  {detailsProject.due_date || "Not set"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <p className="text-xs text-slate-400">% Complete</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {getProjectPercent(detailsProject, tasks)}%
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Project manager
              </label>
              <input
                type="text"
                defaultValue={getProjectManagerName(detailsProject, users)}
                onBlur={(e) =>
                  updateManagerName(detailsProject, e.target.value.trim())
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">
                Team by domain · assigned vs free
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {domainCapacity.map((domain) => (
                  <div
                    key={domain.key}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-white">{domain.label}</p>
                      <p className="text-xs text-slate-400">
                        {domain.assigned} assigned · {domain.free} free ·{" "}
                        {domain.total} total
                      </p>
                    </div>
                    <p className="mb-3 text-xs text-slate-400">
                      {domain.total} people in this domain. {domain.assigned}{" "}
                      are on this project, so {domain.free} are free.
                    </p>
                    <div className="mb-3">
                      <label className="mb-1 block text-xs text-slate-400">
                        Work done ({workDone[domain.key] || 0}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={workDone[domain.key] || 0}
                        onChange={(e) =>
                          updateWorkDone(
                            detailsProject,
                            domain.key,
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="max-h-36 space-y-1 overflow-y-auto">
                      {domain.pool.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No {domain.label.toLowerCase()} members yet. Set
                          department on Users.
                        </p>
                      ) : (
                        domain.pool.map((user) => {
                          const assigned = getAssignedIds(
                            detailsProject
                          )[domain.key].includes(String(user.id));
                          return (
                            <label
                              key={user.id}
                              className="flex items-center gap-2 text-xs text-slate-200"
                            >
                              <input
                                type="checkbox"
                                checked={assigned}
                                onChange={() =>
                                  toggleAssignee(
                                    detailsProject,
                                    domain.key,
                                    user.id
                                  )
                                }
                              />
                              <span>
                                {getUserDisplayName(user)}
                                {assigned ? " · assigned" : " · free"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Delete Project"
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!saving) {
            setIsDeleteOpen(false);
            setDeletingId(null);
            setApiError("");
          }
        }}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this project? This action cannot be
          undone.
        </p>
        {apiError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {apiError}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setDeletingId(null);
              setApiError("");
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            {saving ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
