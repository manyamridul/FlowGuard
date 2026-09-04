import { useEffect, useState, useCallback } from "react";
import {
  FiEdit2,
  FiMail,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiCheckSquare,
  FiFolder,
  FiAlertCircle,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import Modal from "../../components/Modal/Modal";
import Badge from "../../components/Badge/Badge";


// ============================================================
// BACKEND
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8001/api";


// ============================================================
// PROFILE STATS
// ============================================================

const profileStats = [
  {
    label: "Projects Led",
    value: 4,
    icon: FiFolder,
    color: "text-blue-600",
  },
  {
    label: "Tasks Completed",
    value: 47,
    icon: FiCheckSquare,
    color: "text-green-600",
  },
  {
    label: "Bugs Resolved",
    value: 12,
    icon: FiAlertCircle,
    color: "text-orange-600",
  },
  {
    label: "Team Size",
    value: 8,
    icon: FiBriefcase,
    color: "text-purple-600",
  },
];


// ============================================================
// DEFAULT USER
// ============================================================

const defaultUser = {
  id: null,
  username: "",
  name: "",
  email: "",
  first_name: "",
  last_name: "",
  role: "",
  department: "",
  status: "ACTIVE",
  created_at: null,
};


// ============================================================
// PROFILE COMPONENT
// ============================================================

const Profile = () => {
  const [user, setUser] = useState(defaultUser);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
  });


  // ==========================================================
  // GET JWT TOKEN
  // ==========================================================

  const getToken = () => {
    return localStorage.getItem("flowguard-access-token");
  };


  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${API_BASE_URL}/users/me/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail ||
          "Unable to load profile."
        );
      }

      const data = await response.json();

      setUser(data);

      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        department: data.department || "",
      });

    } catch (err) {
      console.error("PROFILE LOAD ERROR:", err);

      setError(
        err.message ||
        "Unable to load your profile."
      );

    } finally {
      setIsLoading(false);
    }
  }, []);


  // ==========================================================
  // LOAD PROFILE ON PAGE OPEN
  // ==========================================================

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);


  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const openEditProfile = () => {
    setSuccess("");
    setError("");

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      department: user.department || "",
    });

    setIsEditOpen(true);
  };


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("You are not logged in.");
      }

      if (!user.id) {
        throw new Error("User ID was not found.");
      }

      const email = formData.email.trim().toLowerCase();

      if (!email) {
        throw new Error("Email cannot be empty.");
      }

      const response = await fetch(
        `${API_BASE_URL}/users/${user.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: email,
            department: formData.department.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("PROFILE UPDATE ERROR:", data);

        throw new Error(
          data.detail ||
          data.email?.[0] ||
          data.first_name?.[0] ||
          data.last_name?.[0] ||
          data.department?.[0] ||
          "Unable to update profile."
        );
      }


      // --------------------------------------------------------
      // Update React state
      // --------------------------------------------------------

      setUser(data);


      // --------------------------------------------------------
      // Update localStorage user
      // --------------------------------------------------------

      localStorage.setItem(
        "flowguard-user",
        JSON.stringify(data)
      );


      // --------------------------------------------------------
      // Update form
      // --------------------------------------------------------

      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        department: data.department || "",
      });


      setIsEditOpen(false);

      setSuccess("Profile updated successfully.");

    } catch (err) {
      console.error("PROFILE SAVE ERROR:", err);

      setError(
        err.message ||
        "Unable to update profile."
      );

    } finally {
      setIsSaving(false);
    }
  };


  // ==========================================================
  // FORMAT NAME
  // ==========================================================

  const displayName =
    user.name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username ||
    "User";


  // ==========================================================
  // AVATAR LETTER
  // ==========================================================

  const avatar =
    displayName.charAt(0).toUpperCase() || "U";


  // ==========================================================
  // STATUS
  // ==========================================================

  const statusText =
    user.status === "ACTIVE"
      ? "Active"
      : user.status === "AWAY"
      ? "Away"
      : user.status === "OFFLINE"
      ? "Offline"
      : user.status || "Active";


  // ==========================================================
  // JOINED DATE
  // ==========================================================

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        }
      )
    : "—";


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* ======================================================
          SUCCESS / ERROR
      ====================================================== */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* ======================================================
          PROFILE HEADER
      ====================================================== */}

      <Card
        className="overflow-hidden"
        noPadding
      >

        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />


        <div className="relative px-6 pb-6">

          {/* Main profile row */}

          <div className="-mt-12 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex items-end gap-4">

              {/* Avatar */}

              <div
                className="
                  flex
                  h-24
                  w-24
                  items-center
                  justify-center
                  rounded-2xl
                  border-4
                  border-white
                  bg-slate-300
                  text-2xl
                  font-bold
                  text-white
                  shadow-lg
                "
              >
                {avatar}
              </div>


              {/* Name */}

              <div className="pb-1">

                <h1 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h1>

                <p className="text-gray-500">
                  {user.role || "User"}
                </p>

                <Badge
                  variant={
                    user.status === "ACTIVE"
                      ? "success"
                      : "default"
                  }
                  className="mt-1"
                >
                  {statusText}
                </Badge>

              </div>

            </div>


            {/* Edit */}

            <Button onClick={openEditProfile}>
              <FiEdit2 className="h-4 w-4" />
              Edit Profile
            </Button>

          </div>


          {/* User information */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiMail className="h-4 w-4 text-gray-400" />
              {user.email || "—"}
            </div>


            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiBriefcase className="h-4 w-4 text-gray-400" />
              {user.department || "—"}
            </div>


            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiMapPin className="h-4 w-4 text-gray-400" />
              India
            </div>


            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiCalendar className="h-4 w-4 text-gray-400" />
              Joined {joinedDate}
            </div>

          </div>

        </div>

      </Card>


      {/* ======================================================
          PROFILE STATS
      ====================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {profileStats.map((stat) => {

          const Icon = stat.icon;

          return (
            <Card key={stat.label}>

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <p
                    className={`text-2xl font-bold ${stat.color}`}
                  >
                    {stat.value}
                  </p>

                </div>

                <Icon
                  className={`h-8 w-8 ${stat.color} opacity-30`}
                />

              </div>

            </Card>
          );

        })}

      </div>


      {/* ======================================================
          RECENT ACTIVITY
      ====================================================== */}

      <Card title="Recent Activity">

        <div className="space-y-4">

          <p className="text-sm text-gray-500">
            No recent activity.
          </p>

        </div>

      </Card>


      {/* ======================================================
          EDIT PROFILE MODAL
      ====================================================== */}

      <Modal
        title="Edit Profile"
        isOpen={isEditOpen}
        onClose={() => {
          if (!isSaving) {
            setIsEditOpen(false);
          }
        }}
        size="lg"
      >

        <div className="space-y-4">


          {/* First + Last Name */}

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>

              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="First name"
              />

            </div>


            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>

              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Last name"
              />

            </div>

          </div>


          {/* Email */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="email@example.com"
            />

          </div>


          {/* Role */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>

            <input
              type="text"
              value={user.role || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
            />

            <p className="mt-1 text-xs text-gray-400">
              Role is managed by an administrator.
            </p>

          </div>


          {/* Department */}

          <div>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Department
            </label>

            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Engineering"
            />

          </div>


          {/* Buttons */}

          <div className="flex justify-end gap-3 pt-2">

            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>

          </div>

        </div>

      </Modal>

    </div>
  );
};


export default Profile;