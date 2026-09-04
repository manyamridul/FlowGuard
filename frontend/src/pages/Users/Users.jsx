import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiEdit2,
  FiMail,
  FiGrid,
  FiList,
  FiRefreshCw,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import Table from "../../components/Tables/Table";
import Modal from "../../components/Modal/Modal";
import Badge from "../../components/Badge/Badge";

import { getUsers, updateUser } from "../../services/api";

const Users = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [userList, setUserList] = useState([]);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [viewMode, setViewMode] = useState("grid");

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "VIEWER",
    department: "",
    status: "ACTIVE",
  });

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      // DRF may return either:
      // [ ...users ]
      // OR
      // { results: [ ...users ] }

      const users = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setUserList(users);
    } catch (err) {
      console.error("Failed to load users:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load users.";

      setError(message);
      setUserList([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD USERS ON PAGE OPEN
  // =========================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return userList.filter((u) => {
      const name =
        u.name ||
        `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
        u.username ||
        "";

      const email = u.email || "";

      const matchSearch =
        !searchValue ||
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue) ||
        (u.username || "").toLowerCase().includes(searchValue);

      const matchRole =
        roleFilter === "All" ||
        u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [userList, search, roleFilter]);

  // =========================================================
  // ROLE DISPLAY
  // =========================================================

  const roleLabel = (role) => {
    const roles = {
      ADMIN: "Admin",
      MANAGER: "Manager",
      DEVELOPER: "Developer",
      TESTER: "Tester",
      VIEWER: "Viewer",
    };

    return roles[role] || role || "Viewer";
  };

  // =========================================================
  // STATUS DISPLAY
  // =========================================================

  const statusLabel = (status) => {
    const statuses = {
      ACTIVE: "Active",
      AWAY: "Away",
      OFFLINE: "Offline",
    };

    return statuses[status] || status || "Offline";
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const badgeVariant = (status) => {
    if (status === "ACTIVE") return "success";

    if (status === "AWAY") return "warning";

    return "default";
  };

  // =========================================================
  // AVATAR
  // =========================================================

  const getInitials = (user) => {
    const name =
      user.name ||
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.username ||
      "U";

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  // =========================================================
  // AVATAR COLORS
  // =========================================================

  const getAvatarColor = (user) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-cyan-500",
      "bg-red-500",
    ];

    const id = Number(user.id) || 0;

    return colors[id % colors.length];
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit = (user) => {
    setEditingUser(user);

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: user.role || "VIEWER",
      department: user.department || "",
      status: user.status || "ACTIVE",
    });

    setIsEditOpen(true);
  };

  // =========================================================
  // CLOSE EDIT
  // =========================================================

  const closeEdit = () => {
    if (saving) return;

    setIsEditOpen(false);
    setEditingUser(null);
  };

  // =========================================================
  // SAVE USER
  // =========================================================

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      setError("");

      const updatedUser = await updateUser(
        editingUser.id,
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          status: formData.status,
        }
      );

      // Update local list immediately
      setUserList((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...updatedUser,
              }
            : user
        )
      );

      setIsEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        Object.values(err?.response?.data || {})
          .flat()
          .join(" ") ||
        "Unable to update user.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // TABLE ROWS
  // =========================================================

  const tableRows = filtered.map((user) => [
    <div
      key={`avatar-${user.id}`}
      className="flex items-center gap-3"
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${getAvatarColor(
          user
        )}`}
      >
        {getInitials(user)}
      </div>

      <span className="font-medium text-gray-900">
        {user.name ||
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username}
      </span>
    </div>,

    user.email,

    roleLabel(user.role),

    user.department || "—",

    <Badge
      key={`status-${user.id}`}
      variant={badgeVariant(user.status)}
    >
      {statusLabel(user.status)}
    </Badge>,

    <Button
      key={`edit-${user.id}`}
      variant="ghost"
      size="sm"
      onClick={() => openEdit(user)}
    >
      <FiEdit2 className="h-4 w-4" />
      Edit
    </Button>,
  ]);

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Team Members
          </h1>

          <p className="text-sm text-gray-500">
            {loading
              ? "Loading users..."
              : `${filtered.length} users`}
          </p>
        </div>

        <div className="flex gap-2">

          {/* GRID BUTTON */}

          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2 ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title="Grid view"
          >
            <FiGrid className="h-5 w-5" />
          </button>

          {/* LIST BUTTON */}

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-2 ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title="List view"
          >
            <FiList className="h-5 w-5" />
          </button>

        </div>
      </div>

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row">

        {/* SEARCH */}

        <div className="relative flex-1">

          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />

        </div>

        {/* ROLE FILTER */}

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="All">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="DEVELOPER">Developer</option>
          <option value="TESTER">Tester</option>
          <option value="VIEWER">Viewer</option>
        </select>

        {/* REFRESH */}

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          title="Refresh users"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadUsers}
              className="font-medium underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <Card>
          <div className="flex min-h-[180px] items-center justify-center">
            <div className="text-center">

              <FiRefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />

              <p className="mt-3 text-sm text-gray-500">
                Loading team members...
              </p>

            </div>
          </div>
        </Card>
      ) : viewMode === "grid" ? (

        /* ===================================================
           GRID VIEW
        =================================================== */

        filtered.length > 0 ? (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filtered.map((user) => (

              <Card
                key={user.id}
                className="text-center"
              >

                {/* AVATAR */}

                <div
                  className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ${getAvatarColor(
                    user
                  )}`}
                >
                  {getInitials(user)}
                </div>

                {/* NAME */}

                <h3 className="font-semibold text-gray-900">
                  {user.name ||
                    `${user.first_name || ""} ${
                      user.last_name || ""
                    }`.trim() ||
                    user.username}
                </h3>

                {/* ROLE */}

                <p className="text-sm text-gray-500">
                  {roleLabel(user.role)}
                </p>

                {/* EMAIL */}

                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-400">
                  <FiMail className="h-3 w-3" />

                  {user.email}
                </p>

                {/* BADGES */}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">

                  <Badge
                    variant={badgeVariant(user.status)}
                  >
                    {statusLabel(user.status)}
                  </Badge>

                  {user.department && (
                    <Badge variant="default">
                      {user.department}
                    </Badge>
                  )}

                </div>

                {/* EDIT */}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => openEdit(user)}
                >
                  <FiEdit2 className="h-3 w-3" />

                  Edit Profile
                </Button>

              </Card>
            ))}

          </div>

        ) : (

          /* EMPTY */

          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

            <p className="text-lg font-semibold text-slate-700">
              No users available
            </p>

            <p className="mt-2 text-sm text-slate-500">
              No users match your current search or filter.
            </p>

          </div>
        )

      ) : (

        /* ===================================================
           LIST VIEW
        =================================================== */

        <Card>

          {filtered.length > 0 ? (

            <Table
              headers={[
                "User",
                "Email",
                "Role",
                "Department",
                "Status",
                "Actions",
              ]}
              rows={tableRows}
            />

          ) : (

            <div className="p-8 text-center text-sm text-slate-500">
              No user records available.
            </div>

          )}

        </Card>
      )}

      {/* =====================================================
          EDIT USER MODAL
      ===================================================== */}

      <Modal
        title="Edit Profile"
        isOpen={isEditOpen}
        onClose={closeEdit}
        size="lg"
      >

        <div className="space-y-4">

          {/* FIRST + LAST NAME */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>

              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_name: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />

            </div>

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>

              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    last_name: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />

            </div>

          </div>

          {/* EMAIL */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />

          </div>

          {/* ROLE + DEPARTMENT */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >

                <option value="ADMIN">
                  Admin
                </option>

                <option value="MANAGER">
                  Manager
                </option>

                <option value="DEVELOPER">
                  Developer
                </option>

                <option value="TESTER">
                  Tester
                </option>

                <option value="VIEWER">
                  Viewer
                </option>

              </select>

            </div>

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Department
              </label>

              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select domain</option>
                {formData.department &&
                  ![
                    "Frontend",
                    "Backend",
                    "Database",
                    "QA",
                  ].includes(formData.department) && (
                    <option value={formData.department}>
                      {formData.department}
                    </option>
                  )}
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="QA">QA & Testers</option>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >

              <option value="ACTIVE">
                Active
              </option>

              <option value="AWAY">
                Away
              </option>

              <option value="OFFLINE">
                Offline
              </option>

            </select>

          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-2">

            <Button
              variant="outline"
              onClick={closeEdit}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

          </div>

        </div>

      </Modal>

    </div>
  );
};

export default Users;