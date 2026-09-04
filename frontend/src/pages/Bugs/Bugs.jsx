import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiAlertTriangle,
  FiEdit2,
  FiTrash2,
  FiBook,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import Table from "../../components/Tables/Table";
import Modal from "../../components/Modal/Modal";
import Badge from "../../components/Badge/Badge";

import {
  getBugs,
  createBug,
  updateBug,
  deleteBug,
  getProjects,
  getUsers,
} from "../../services/api";


const emptyBug = {
  title: "",
  description: "",
  severity: "MEDIUM",
  status: "OPEN",
  priority: "MEDIUM",
  project: "",
  workflow: "",
  assigned_to: "",
};


const STATUS_LABELS = {
  OPEN: "Bug Raised",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};


const SEVERITY_LABELS = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};





const Bugs = () => {
  const navigate = useNavigate();

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState(emptyBug);
  const [editBug, setEditBug] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");


  // =========================================================
  // LOAD BUGS, PROJECTS AND USERS
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          bugsData,
          projectsData,
          usersData,
        ] = await Promise.all([
          getBugs(),
          getProjects(),
          getUsers(),
        ]);

        setBugs(
          Array.isArray(bugsData)
            ? bugsData
            : bugsData?.results || []
        );

        setProjects(
          Array.isArray(projectsData)
            ? projectsData
            : projectsData?.results || []
        );

        setUsers(
          Array.isArray(usersData)
            ? usersData
            : usersData?.results || []
        );

      } catch (err) {
        console.error("Failed to load bug data:", err);

        setError(
          err.response?.data?.detail ||
          "Failed to load bugs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  // =========================================================
  // FILTER
  // =========================================================

  const filtered = useMemo(() => {
    return bugs.filter((bug) => {
      const matchSearch =
        bug.title
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchSeverity =
        severityFilter === "All" ||
        bug.severity === severityFilter;

      const matchStatus =
        statusFilter === "All" ||
        bug.status === statusFilter;

      return (
        matchSearch &&
        matchSeverity &&
        matchStatus
      );
    });
  }, [
    bugs,
    search,
    severityFilter,
    statusFilter,
  ]);


  // =========================================================
  // REPORT BUG
  // =========================================================

  const handleReport = async () => {
    if (!formData.title.trim()) {
      return;
    }

    if (!formData.project) {
      setError("Please select a project.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        severity: formData.severity,
        priority: formData.priority,
        project: Number(formData.project),
      };

      if (formData.workflow) {
        payload.workflow = Number(formData.workflow);
      }

      if (formData.assigned_to) {
        payload.assigned_to = Number(
          formData.assigned_to
        );
      }

      console.log("BUG PAYLOAD:", payload);

      const newBug = await createBug(payload);

      console.log("BUG CREATED:", newBug);

      setBugs((previous) => [
        newBug,
        ...previous,
      ]);

      setFormData(emptyBug);
      setIsReportOpen(false);

    } catch (err) {
      console.error("Failed to create bug:", err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstError = Object.values(data)[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : String(firstError)
        );
      } else {
        setError(
          "Failed to create bug."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };


    // =========================================================
  // EDIT BUG
  // =========================================================

  const handleEditOpen = (bug) => {
    setError("");
    setEditBug(bug);

    setFormData({
      title: bug.title || "",
      description: bug.description || "",
      severity: bug.severity || "MEDIUM",
      status: bug.status || "OPEN",
      priority: bug.priority || "MEDIUM",
      project: bug.project ? String(bug.project) : "",
      workflow: bug.workflow ? String(bug.workflow) : "",
      assigned_to: bug.assigned_to
        ? String(bug.assigned_to)
        : "",
    });

    setIsEditOpen(true);
  };


  const handleEdit = async () => {
    if (!editBug || !formData.title.trim()) {
      return;
    }

    if (!formData.project) {
      setError("Please select a project.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        severity: formData.severity,
        priority: formData.priority,
        project: Number(formData.project),
      };

      if (formData.workflow) {
        payload.workflow = Number(formData.workflow);
      } else {
        payload.workflow = null;
      }

      if (formData.assigned_to) {
        payload.assigned_to = Number(formData.assigned_to);
      } else {
        payload.assigned_to = null;
      }

      const updatedBug = await updateBug(
        editBug.id,
        payload
      );

      setBugs((previous) =>
        previous.map((bug) =>
          bug.id === editBug.id
            ? updatedBug
            : bug
        )
      );

      setIsEditOpen(false);
      setEditBug(null);
      setFormData(emptyBug);

      if (payload.status === "CLOSED") {
        const addToKnowledge = window.confirm(
          "Bug closed. Add this to the Knowledge Base?"
        );

        if (addToKnowledge) {
          navigate("/knowledge-base", {
            state: {
              fromBug: {
                title: updatedBug.title || payload.title,
                description: updatedBug.description || payload.description,
                project: updatedBug.project || payload.project,
              },
            },
          });
        }
      }

    } catch (err) {
      console.error("Failed to update bug:", err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstError = Object.values(data)[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : String(firstError)
        );
      } else {
        setError("Failed to update bug.");
      }

    } finally {
      setSubmitting(false);
    }
  };


  // =========================================================
  // DELETE BUG
  // =========================================================

  const handleDelete = async (bug) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${bug.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteBug(bug.id);

      setBugs((previous) =>
        previous.filter(
          (item) => item.id !== bug.id
        )
      );

    } catch (err) {
      console.error("Failed to delete bug:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to delete bug."
      );

    } finally {
      setDeleting(false);
    }
  };


  // =========================================================
  // BADGE
  // =========================================================

  const badgeVariant = (value) => {
    if (
      value === "CRITICAL"
    ) {
      return "danger";
    }

    if (
      value === "HIGH"
    ) {
      return "warning";
    }

    if (
      value === "RESOLVED"
    ) {
      return "success";
    }

    if (
      value === "IN_PROGRESS"
    ) {
      return "primary";
    }

    return "default";
  };


  // =========================================================
  // TABLE ROWS
  // =========================================================

  const rows = filtered.map((bug) => [
    <div
      key={`title-${bug.id}`}
      className="flex items-center gap-2"
    >
      <FiAlertTriangle
        className={`h-4 w-4 shrink-0 ${
          bug.severity === "CRITICAL"
            ? "text-red-500"
            : bug.severity === "HIGH"
            ? "text-orange-500"
            : "text-yellow-500"
        }`}
      />

      <span className="font-medium text-gray-900">
        {bug.title}
      </span>
    </div>,

    <Badge
      key={`severity-${bug.id}`}
      variant={badgeVariant(bug.severity)}
    >
      {SEVERITY_LABELS[bug.severity] ||
        bug.severity}
    </Badge>,

    <Badge
      key={`status-${bug.id}`}
      variant={badgeVariant(bug.status)}
    >
      {STATUS_LABELS[bug.status] ||
        bug.status}
    </Badge>,

    bug.project_name || "Unassigned",

    <div
      key={`assignee-${bug.id}`}
      className="flex items-center gap-2"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-xs font-medium text-white">
        {bug.assigned_to_username
          ? bug.assigned_to_username
              .charAt(0)
              .toUpperCase()
          : "U"}
      </div>

      <span className="text-sm">
        {bug.assigned_to_username ||
          "Unassigned"}
      </span>
    </div>,

    bug.reported_by_username ||
      "Unknown",

    bug.created_at
      ? new Date(
          bug.created_at
        ).toLocaleDateString()
      : "Not set",

    <div
      key={`actions-${bug.id}`}
      className="flex items-center gap-2"
    >
      {bug.status === "CLOSED" && (
        <button
          type="button"
          onClick={() =>
            navigate("/knowledge-base", {
              state: {
                fromBug: {
                  title: bug.title,
                  description: bug.description,
                  project: bug.project,
                },
              },
            })
          }
          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
          title="Add to Knowledge Base"
        >
          <FiBook className="h-4 w-4" />
        </button>
      )}

      <button
        type="button"
        onClick={() => handleEditOpen(bug)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
        title="Edit bug"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handleDelete(bug)}
        disabled={deleting}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        title="Delete bug"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>,
    ]);


  // =========================================================
  // COUNTS
  // =========================================================

  const openCount = bugs.filter(
    (bug) => bug.status === "OPEN"
  ).length;

  const criticalCount = bugs.filter(
    (bug) => bug.severity === "CRITICAL"
  ).length;

  const inProgressCount = bugs.filter(
    (bug) => bug.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = bugs.filter(
    (bug) => bug.status === "RESOLVED"
  ).length;


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bugs
          </h1>

          <p className="text-sm text-gray-500">
            {filtered.length} bugs ·{" "}
            {openCount} raised ·{" "}
            {criticalCount} critical
          </p>
        </div>

        <Button
          onClick={() => {
            setError("");
            setFormData(emptyBug);
            setIsReportOpen(true);
          }}
        >
          <FiPlus className="h-4 w-4" />
          Report Bug
        </Button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}


      {/* STAT CARDS */}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

        {[
          {
            label: "Total Bugs",
            value: bugs.length,
            color: "text-gray-900",
          },
          {
            label: "Bug Raised",
            value: openCount,
            color: "text-red-600",
          },
          {
            label: "In Progress",
            value: inProgressCount,
            color: "text-blue-600",
          },
          {
            label: "Resolved",
            value: resolvedCount,
            color: "text-green-600",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">
              {stat.label}
            </p>

            <p
              className={`text-2xl font-bold ${stat.color}`}
            >
              {stat.value}
            </p>
          </Card>
        ))}

      </div>


      {/* TABLE */}

      <Card>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">

            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search bugs..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />

          </div>


          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="All">
              All
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

          </select>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="All">
              All
            </option>

            <option value="OPEN">
              Bug Raised
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="CLOSED">
              Closed
            </option>

            <option value="REOPENED">
              Reopened
            </option>

          </select>

        </div>


        {loading ? (

          <div className="p-8 text-center text-sm text-gray-500">
            Loading bugs...
          </div>

        ) : filtered.length > 0 ? (

          <Table
            headers={[
              "Bug",
              "Severity",
              "Status",
              "Project",
              "Assignee",
              "Reported By",
              "Created",
              "Actions",
            ]}
            rows={rows}
          />

        ) : (

          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-800/80 p-8 text-center">

            <p className="text-lg font-semibold text-slate-100">
              No bugs reported yet
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Bug reports will appear here once created.
            </p>

          </div>

        )}

      </Card>


      {/* REPORT BUG MODAL */}

      <Modal
        title="Report Bug"
        isOpen={isReportOpen}
        onClose={() =>
          setIsReportOpen(false)
        }
        size="lg"
      >

        <div className="space-y-4">

          {/* TITLE */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bug Title
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Describe the bug"
            />

          </div>


          {/* DESCRIPTION */}

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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Describe the bug in detail"
            />

          </div>


          {/* SEVERITY + PRIORITY */}

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Severity
              </label>

              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >

                <option value="CRITICAL">
                  Critical
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="LOW">
                  Low
                </option>

              </select>

            </div>


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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >

                <option value="CRITICAL">
                  Critical
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="LOW">
                  Low
                </option>

              </select>

            </div>

          </div>


          {/* PROJECT */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Project
            </label>

            <select
              value={formData.project}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project: e.target.value,
                  workflow: "",
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >

              <option value="">
                Select project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}

            </select>

          </div>


          {/* WORKFLOW */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Workflow
            </label>

            <select
              value={formData.workflow}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workflow: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              disabled={!formData.project}
            >

              <option value="">
                No workflow
              </option>

              

            </select>

            <p className="mt-1 text-xs text-gray-500">
              Workflow selection will be enabled after we connect the workflow list.
            </p>

          </div>


          {/* ASSIGNEE */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assign Developer
            </label>

            <select
              value={formData.assigned_to}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assigned_to: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >

              <option value="">
                Unassigned
              </option>

              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.username ||
                    user.email}
                </option>
              ))}

            </select>

          </div>


          {/* ACTIONS */}

          <div className="flex justify-end gap-3">

            <Button
              variant="outline"
              onClick={() =>
                setIsReportOpen(false)
              }
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleReport}
              disabled={
                submitting ||
                !formData.title.trim() ||
                !formData.project
              }
            >
              {submitting
                ? "Reporting..."
                : "Report Bug"}
            </Button>

          </div>

        </div>

      </Modal>

            {/* EDIT BUG MODAL */}

      <Modal
        title="Edit Bug"
        isOpen={isEditOpen}
        onClose={() => {
          if (!submitting) {
            setIsEditOpen(false);
          }
        }}
        size="lg"
      >
        <div className="space-y-4">

          {/* TITLE */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bug Title
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Describe the bug"
            />
          </div>


          {/* DESCRIPTION */}

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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Describe the bug in detail"
            />
          </div>


          {/* SEVERITY + PRIORITY */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Severity
              </label>

              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>


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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

          </div>


          {/* STATUS */}

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
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="OPEN">Bug Raised</option>
              <option value="IN_PROGRESS">
                In Progress
              </option>
              <option value="RESOLVED">
                Resolved
              </option>
              <option value="CLOSED">
                Closed
              </option>
              <option value="REOPENED">
                Reopened
              </option>
            </select>
          </div>


          {/* PROJECT */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Project
            </label>

            <select
              value={formData.project}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project: e.target.value,
                  workflow: "",
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">
                Select project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>
          </div>


          {/* ASSIGNEE */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assign Developer
            </label>

            <select
              value={formData.assigned_to}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assigned_to: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">
                Unassigned
              </option>

              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.username || user.email}
                </option>
              ))}
            </select>
          </div>


          {/* ACTIONS */}

          <div className="flex justify-end gap-3">

            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleEdit}
              disabled={
                submitting ||
                !formData.title.trim() ||
                !formData.project
              }
            >
              {submitting
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </div>

        </div>
      </Modal>

      

    </div>
  );
};


export default Bugs;