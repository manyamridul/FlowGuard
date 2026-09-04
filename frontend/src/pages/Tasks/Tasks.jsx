import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import Table from "../../components/Tables/Table";
import Modal from "../../components/Modal/Modal";
import Badge from "../../components/Badge/Badge";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getProjects,
  getWorkflows,
  getUsers,
} from "../../services/api";

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const STATUS_LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
  BLOCKED: "Blocked",
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const priorityColors = {
  CRITICAL: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-yellow-500",
  LOW: "border-l-gray-400",
};

const emptyTask = {
  title: "",
  description: "",
  project: "",
  workflow: "",
  status: "TODO",
  priority: "MEDIUM",
  assigned_to: "",
  due_date: "",
};

const TaskForm = ({
  formData,
  setFormData,
  projects,
  availableWorkflows,
  users,
  saving,
  onSubmit,
  submitLabel,
  onCancel,
  onProjectChange,
}) => (
  <div className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Task Title
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
        placeholder="Enter task title"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Project
        </label>
        <select
          value={formData.project}
          onChange={(e) => onProjectChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

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
          disabled={!formData.project}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
        >
          <option value="">Select workflow</option>
          {availableWorkflows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.title}
            </option>
          ))}
        </select>
      </div>
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
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        placeholder="Describe the task..."
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
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
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
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Assignee
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
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || user.username || user.email}
            </option>
          ))}
        </select>
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
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </div>

    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        disabled={
          saving ||
          !formData.title.trim() ||
          !formData.project ||
          !formData.workflow
        }
      >
        {saving ? "Saving..." : submitLabel}
      </Button>
    </div>
  </div>
);

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState(emptyTask);

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        tasksResponse,
        projectsResponse,
        workflowsResponse,
        usersResponse,
      ] = await Promise.all([
        getTasks(),
        getProjects(),
        getWorkflows(),
        getUsers(),
      ]);

      setTasks(normalizeList(tasksResponse));
      setProjects(normalizeList(projectsResponse));
      setWorkflows(normalizeList(workflowsResponse));
      setUsers(normalizeList(usersResponse));
    } catch (err) {
      console.error("Failed to load task data:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // FILTERED WORKFLOWS
  // =========================================================

  const availableWorkflows = useMemo(() => {
    if (!formData.project) {
      return [];
    }

    return workflows.filter(
      (workflow) =>
        Number(workflow.project) === Number(formData.project)
    );
  }, [workflows, formData.project]);

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        task.title?.toLowerCase().includes(searchValue) ||
        task.project_name?.toLowerCase().includes(searchValue) ||
        task.workflow_title?.toLowerCase().includes(searchValue);

      const matchStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchPriority =
        priorityFilter === "All" ||
        task.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // =========================================================
  // CREATE TASK
  // =========================================================

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      return;
    }

    if (!formData.project) {
      setError("Please select a project.");
      return;
    }

    if (!formData.workflow) {
      setError("Please select a workflow.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        project: Number(formData.project),
        workflow: Number(formData.workflow),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to
          ? Number(formData.assigned_to)
          : null,
        due_date: formData.due_date || null,
      };

      const createdTask = await createTask(payload);

      setTasks((prev) => [
        createdTask,
        ...prev,
      ]);

      setFormData(emptyTask);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create task."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT TASK
  // =========================================================

  const handleEdit = async () => {
    if (!editingId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        project: Number(formData.project),
        workflow: Number(formData.workflow),
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to
          ? Number(formData.assigned_to)
          : null,
        due_date: formData.due_date || null,
      };

      const updatedTask = await updateTask(
        editingId,
        payload
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingId
            ? updatedTask
            : task
        )
      );

      setFormData(emptyTask);
      setEditingId(null);
      setIsEditOpen(false);
    } catch (err) {
      console.error("Failed to update task:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to update task."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const handleDelete = async () => {
    if (!deletingId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteTask(deletingId);

      setTasks((prev) =>
        prev.filter(
          (task) => task.id !== deletingId
        )
      );

      setDeletingId(null);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete task:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete task."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit = (task) => {
    setEditingId(task.id);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      project: task.project || "",
      workflow: task.workflow || "",
      status: task.status || "TODO",
      priority: task.priority || "MEDIUM",
      assigned_to: task.assigned_to || "",
      due_date: task.due_date || "",
    });

    setError("");
    setIsEditOpen(true);
  };

  // =========================================================
  // PROJECT CHANGE
  // =========================================================

  const handleProjectChange = (projectId) => {
    setFormData((prev) => ({
      ...prev,
      project: projectId,
      workflow: "",
    }));
  };

  // =========================================================
  // BADGE
  // =========================================================

  const badgeVariant = (value) => {
    if (value === "DONE") return "success";
    if (value === "IN_PROGRESS") return "primary";
    if (value === "REVIEW") return "info";
    if (value === "BLOCKED") return "danger";

    if (value === "CRITICAL") return "danger";
    if (value === "HIGH") return "warning";
    if (value === "MEDIUM") return "primary";

    return "default";
  };

  // =========================================================
  // TASK FORM
  // =========================================================

  // =========================================================
  // TABLE ROWS
  // =========================================================

  const rows = filtered.map((task) => [
    <div
      key={`title-${task.id}`}
      className={`border-l-4 pl-2 ${
        priorityColors[task.priority] ||
        "border-l-gray-400"
      }`}
    >
      <p className="font-medium text-gray-900">
        {task.title}
      </p>

      {task.workflow_title && (
        <p className="text-xs text-gray-500">
          {task.workflow_title}
        </p>
      )}
    </div>,

    task.project_name || "Unassigned",

    <Badge
      key={`status-${task.id}`}
      variant={badgeVariant(task.status)}
    >
      {STATUS_LABELS[task.status] ||
        task.status}
    </Badge>,

    <Badge
      key={`priority-${task.id}`}
      variant={badgeVariant(task.priority)}
    >
      {PRIORITY_LABELS[task.priority] ||
        task.priority}
    </Badge>,

    <div
      key={`assignee-${task.id}`}
      className="flex items-center gap-2"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-xs font-medium text-white">
        {(
          task.assigned_to_username ||
          "U"
        )
          .charAt(0)
          .toUpperCase()}
      </div>

      <span className="text-sm text-gray-700">
        {task.assigned_to_username ||
          "Unassigned"}
      </span>
    </div>,

    task.due_date || "Not set",

    <div
      key={`actions-${task.id}`}
      className="flex gap-2"
    >
      <button
        type="button"
        onClick={() => openEdit(task)}
        className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => {
          setDeletingId(task.id);
          setError("");
          setIsDeleteOpen(true);
        }}
        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>,
  ]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6 p-4 sm:p-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tasks
          </h1>

          <p className="text-sm text-gray-500">
            {filtered.length} tasks
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData(emptyTask);
            setError("");
            setIsCreateOpen(true);
          }}
        >
          <FiPlus className="h-4 w-4" />
          Create Task
        </Button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card>

        {/* FILTERS */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">

            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="All">
              All Statuses
            </option>

            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              )
            )}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
          >
            <option value="All">
              All Priorities
            </option>

            {PRIORITY_OPTIONS.map(
              (priority) => (
                <option
                  key={priority.value}
                  value={priority.value}
                >
                  {priority.label}
                </option>
              )
            )}
          </select>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading tasks...
          </div>
        ) : filtered.length > 0 ? (
          <Table
            headers={[
              "Task",
              "Project",
              "Status",
              "Priority",
              "Assignee",
              "Due Date",
              "Actions",
            ]}
            rows={rows}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-800/80 p-8 text-center">
            <p className="text-lg font-semibold text-slate-100">
              No tasks available yet
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Create a task to get started.
            </p>
          </div>
        )}

      </Card>

      {/* CREATE */}

      <Modal
        title="Create Task"
        isOpen={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        size="lg"
      >
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          projects={projects}
          availableWorkflows={availableWorkflows}
          users={users}
          saving={saving}
          onSubmit={handleCreate}
          submitLabel="Create Task"
          onProjectChange={handleProjectChange}
          onCancel={() => {
            setIsCreateOpen(false);
            setError("");
          }}
        />
      </Modal>

      {/* EDIT */}

      <Modal
        title="Edit Task"
        isOpen={isEditOpen}
        onClose={() =>
          setIsEditOpen(false)
        }
        size="lg"
      >
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          projects={projects}
          availableWorkflows={availableWorkflows}
          users={users}
          saving={saving}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
          onProjectChange={handleProjectChange}
          onCancel={() => {
            setIsEditOpen(false);
            setError("");
          }}
        />
      </Modal>

      {/* DELETE */}

      <Modal
        title="Delete Task"
        isOpen={isDeleteOpen}
        onClose={() =>
          setIsDeleteOpen(false)
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this
          task?
        </p>

        <div className="mt-4 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={() =>
              setIsDeleteOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving
              ? "Deleting..."
              : "Delete"}
          </Button>

        </div>
      </Modal>

    </div>
  );
};

export default Tasks;