import { useEffect, useState } from "react";
import {
  FiSettings,
  FiBell,
  FiSun,
  FiUser,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";

import {
  getUserSettings,
  updateUserSettings,
  getCurrentUser,
} from "../../services/api";

// =========================================================
// TABS
// =========================================================

const tabs = [
  {
    id: "general",
    label: "General",
    icon: FiSettings,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: FiBell,
  },
  {
    id: "theme",
    label: "Theme",
    icon: FiSun,
  },
  {
    id: "account",
    label: "Account",
    icon: FiUser,
  },
];

// =========================================================
// SETTINGS
// =========================================================

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =======================================================
  // GENERAL
  // =======================================================

  const [general, setGeneral] = useState({
    workspaceName: "Flow Guard",
    language: "English",
    timezone: "UTC+5:30 (IST)",
    dateFormat: "MM/DD/YYYY",
    weekStart: "Monday",
  });

  // =======================================================
  // NOTIFICATIONS
  // =======================================================

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskAssigned: true,
    taskCompleted: false,
    bugReported: true,
    projectUpdates: true,
    weeklyDigest: false,
    mentionAlerts: true,
  });

  // =======================================================
  // THEME
  // =======================================================

  const [theme, setTheme] = useState({
    appearance: "dark",
    accentColor: "blue",
    compactMode: false,
    sidebarCollapsed: false,
  });

  // =======================================================
  // ACCOUNT
  // =======================================================

  const [account, setAccount] = useState({
    displayName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
  });

  // =======================================================
  // LOAD SETTINGS + USER
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const [settingsData, userData] =
          await Promise.all([
            getUserSettings(),
            getCurrentUser(),
          ]);

        if (!mounted) return;

        // ===================================================
        // GENERAL
        // ===================================================

        setGeneral({
          workspaceName:
            settingsData.workspace_name ||
            "Flow Guard",

          language:
            settingsData.language ||
            "English",

          timezone:
            settingsData.timezone ||
            "UTC+5:30 (IST)",

          dateFormat:
            settingsData.date_format ||
            "MM/DD/YYYY",

          weekStart:
            settingsData.week_start ||
            "Monday",
        });

        // ===================================================
        // NOTIFICATIONS
        // ===================================================

        setNotifications({
          emailNotifications:
            settingsData.email_notifications ??
            true,

          pushNotifications:
            settingsData.push_notifications ??
            true,

          taskAssigned:
            settingsData.task_assigned ??
            true,

          taskCompleted:
            settingsData.task_completed ??
            false,

          bugReported:
            settingsData.bug_reported ??
            true,

          projectUpdates:
            settingsData.project_updates ??
            true,

          weeklyDigest:
            settingsData.weekly_digest ??
            false,

          mentionAlerts:
            settingsData.mention_alerts ??
            true,
        });

        // ===================================================
        // THEME
        // ===================================================

        setTheme({
          appearance:
            String(
              settingsData.appearance ||
                "LIGHT"
            ).toLowerCase(),

          accentColor:
            settingsData.accent_color ||
            "blue",

          compactMode:
            settingsData.compact_mode ??
            false,

          sidebarCollapsed:
            settingsData.sidebar_collapsed ??
            false,
        });

        // ===================================================
        // ACCOUNT
        // ===================================================

        setAccount({
          displayName:
            userData.name ||
            `${userData.first_name || ""} ${
              userData.last_name || ""
            }`.trim() ||
            userData.username ||
            "",

          email:
            userData.email || "",

          currentPassword: "",
          newPassword: "",
          confirmPassword: "",

          twoFactor:
            settingsData.two_factor_enabled ??
            false,
        });
      } catch (err) {
        console.error(
          "Settings loading error:",
          err
        );

        if (!mounted) return;

        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            err.message ||
            "Unable to load your settings."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  // =======================================================
  // SAVE SETTINGS
  // =======================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      // =====================================================
      // BACKEND PAYLOAD
      // =====================================================

      const settingsData = {
        // General
        workspace_name:
          general.workspaceName.trim(),

        language:
          general.language.trim(),

        timezone:
          general.timezone.trim(),

        date_format:
          general.dateFormat,

        week_start:
          general.weekStart,

        // Notifications
        email_notifications:
          notifications.emailNotifications,

        push_notifications:
          notifications.pushNotifications,

        task_assigned:
          notifications.taskAssigned,

        task_completed:
          notifications.taskCompleted,

        bug_reported:
          notifications.bugReported,

        project_updates:
          notifications.projectUpdates,

        weekly_digest:
          notifications.weeklyDigest,

        mention_alerts:
          notifications.mentionAlerts,

        // Appearance
        appearance:
          String(
            theme.appearance || "light"
          ).toUpperCase(),

        accent_color:
          theme.accentColor,

        compact_mode:
          theme.compactMode,

        sidebar_collapsed:
          theme.sidebarCollapsed,

        // Security
        two_factor_enabled:
          account.twoFactor,
      };

      // =====================================================
      // UPDATE THROUGH api.js
      // =====================================================

      const updatedSettings =
        await updateUserSettings(
          settingsData
        );

      // =====================================================
      // SYNC GENERAL FROM BACKEND
      // =====================================================

      setGeneral({
        workspaceName:
          updatedSettings.workspace_name ||
          general.workspaceName,

        language:
          updatedSettings.language ||
          general.language,

        timezone:
          updatedSettings.timezone ||
          general.timezone,

        dateFormat:
          updatedSettings.date_format ||
          general.dateFormat,

        weekStart:
          updatedSettings.week_start ||
          general.weekStart,
      });

      // =====================================================
      // SYNC NOTIFICATIONS FROM BACKEND
      // =====================================================

      setNotifications({
        emailNotifications:
          updatedSettings.email_notifications ??
          notifications.emailNotifications,

        pushNotifications:
          updatedSettings.push_notifications ??
          notifications.pushNotifications,

        taskAssigned:
          updatedSettings.task_assigned ??
          notifications.taskAssigned,

        taskCompleted:
          updatedSettings.task_completed ??
          notifications.taskCompleted,

        bugReported:
          updatedSettings.bug_reported ??
          notifications.bugReported,

        projectUpdates:
          updatedSettings.project_updates ??
          notifications.projectUpdates,

        weeklyDigest:
          updatedSettings.weekly_digest ??
          notifications.weeklyDigest,

        mentionAlerts:
          updatedSettings.mention_alerts ??
          notifications.mentionAlerts,
      });

      // =====================================================
      // SYNC THEME FROM BACKEND
      // =====================================================

      setTheme({
        appearance:
          String(
            updatedSettings.appearance ||
              theme.appearance
          ).toLowerCase(),

        accentColor:
          updatedSettings.accent_color ||
          theme.accentColor,

        compactMode:
          updatedSettings.compact_mode ??
          theme.compactMode,

        sidebarCollapsed:
          updatedSettings.sidebar_collapsed ??
          theme.sidebarCollapsed,
      });

      // =====================================================
      // SYNC SECURITY
      // =====================================================

      setAccount((previous) => ({
        ...previous,

        twoFactor:
          updatedSettings.two_factor_enabled ??
          previous.twoFactor,
      }));

      // =====================================================
      // SUCCESS
      // =====================================================

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error(
        "Settings save error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Unable to save your settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // NOTIFICATION TOGGLE
  // =======================================================

  const toggleNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-sm text-gray-500">
          Loading your settings...
        </div>
      </div>
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="text-sm text-gray-500">
          Manage your workspace preferences
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex flex-col gap-6 lg:flex-row">

        {/* ===================================================
            TABS
        =================================================== */}

        <div className="flex gap-2 overflow-x-auto lg:w-48 lg:flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================================================
            CONTENT CARD
        =================================================== */}

        <Card className="flex-1">

          {/* =================================================
              GENERAL
          ================================================= */}

          {activeTab === "general" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                General Settings
              </h3>

              {/* Workspace */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Workspace Name
                </label>

                <input
                  type="text"
                  value={
                    general.workspaceName
                  }
                  onChange={(e) =>
                    setGeneral({
                      ...general,
                      workspaceName:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Language + Timezone */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Language
                  </label>

                  <select
                    value={
                      general.language
                    }
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        language:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option>
                      English
                    </option>
                    <option>
                      Hindi
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Timezone
                  </label>

                  <select
                    value={
                      general.timezone
                    }
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        timezone:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option>
                      UTC+5:30 (IST)
                    </option>
                    <option>
                      UTC+0 (GMT)
                    </option>
                    <option>
                      UTC-5 (EST)
                    </option>
                    <option>
                      UTC-8 (PST)
                    </option>
                  </select>
                </div>

              </div>

              {/* Date + Week */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Date Format
                  </label>

                  <select
                    value={
                      general.dateFormat
                    }
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        dateFormat:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option>
                      MM/DD/YYYY
                    </option>
                    <option>
                      DD/MM/YYYY
                    </option>
                    <option>
                      YYYY-MM-DD
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Week Starts On
                  </label>

                  <select
                    value={
                      general.weekStart
                    }
                    onChange={(e) =>
                      setGeneral({
                        ...general,
                        weekStart:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option>
                      Monday
                    </option>
                    <option>
                      Sunday
                    </option>
                  </select>
                </div>

              </div>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : saved
                  ? "Saved!"
                  : "Save Changes"}
              </Button>
            </form>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeTab === "notifications" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h3>

              {[
                {
                  key: "emailNotifications",
                  label:
                    "Email Notifications",
                  desc:
                    "Receive notifications via email",
                },
                {
                  key: "pushNotifications",
                  label:
                    "Push Notifications",
                  desc:
                    "Browser push notifications",
                },
                {
                  key: "taskAssigned",
                  label:
                    "Task Assigned",
                  desc:
                    "When a task is assigned to you",
                },
                {
                  key: "taskCompleted",
                  label:
                    "Task Completed",
                  desc:
                    "When a task you're watching is completed",
                },
                {
                  key: "bugReported",
                  label:
                    "Bug Reported",
                  desc:
                    "When a new bug is reported",
                },
                {
                  key: "projectUpdates",
                  label:
                    "Project Updates",
                  desc:
                    "When projects you're part of are updated",
                },
                {
                  key: "weeklyDigest",
                  label:
                    "Weekly Digest",
                  desc:
                    "Weekly summary of activity",
                },
                {
                  key: "mentionAlerts",
                  label:
                    "Mention Alerts",
                  desc:
                    "When someone mentions you",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>

                    <p className="text-xs text-gray-500">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      toggleNotification(
                        item.key
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications[item.key]
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        notifications[item.key]
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : saved
                  ? "Saved!"
                  : "Save Changes"}
              </Button>
            </form>
          )}

          {/* =================================================
              THEME
          ================================================= */}

          {activeTab === "theme" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Theme Settings
              </h3>

              {/* Appearance */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Appearance
                </label>

                <div className="flex flex-wrap gap-3">
                  {[
                    "light",
                    "dark",
                    "system",
                  ].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setTheme({
                          ...theme,
                          appearance:
                            mode,
                        })
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-sm capitalize transition-colors ${
                        theme.appearance ===
                        mode
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Accent Color
                </label>

                <div className="flex gap-3">
                  {[
                    {
                      name: "blue",
                      color:
                        "bg-blue-500",
                    },
                    {
                      name: "purple",
                      color:
                        "bg-purple-500",
                    },
                    {
                      name: "green",
                      color:
                        "bg-green-500",
                    },
                    {
                      name: "orange",
                      color:
                        "bg-orange-500",
                    },
                    {
                      name: "red",
                      color:
                        "bg-red-500",
                    },
                  ].map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={`Select ${color.name} accent`}
                      onClick={() =>
                        setTheme({
                          ...theme,
                          accentColor:
                            color.name,
                        })
                      }
                      className={`h-8 w-8 rounded-full ${
                        color.color
                      } ${
                        theme.accentColor ===
                        color.name
                          ? "ring-2 ring-gray-400 ring-offset-2"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Compact + Sidebar */}

              {[
                {
                  key: "compactMode",
                  label: "Compact Mode",
                  desc:
                    "Reduce spacing in the UI",
                },
                {
                  key: "sidebarCollapsed",
                  label:
                    "Collapsed Sidebar",
                  desc:
                    "Start with sidebar collapsed",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>

                    <p className="text-xs text-gray-500">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setTheme({
                        ...theme,
                        [item.key]:
                          !theme[item.key],
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      theme[item.key]
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        theme[item.key]
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : saved
                  ? "Saved!"
                  : "Save Changes"}
              </Button>
            </form>
          )}

          {/* =================================================
              ACCOUNT
          ================================================= */}

          {activeTab === "account" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Account Settings
              </h3>

              {/* Display Name */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Display Name
                </label>

                <input
                  type="text"
                  value={
                    account.displayName
                  }
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      displayName:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={account.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Email changes are managed through your account profile.
                </p>
              </div>

              {/* Current Password */}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Current Password
                </label>

                <input
                  type="password"
                  value={
                    account.currentPassword
                  }
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      currentPassword:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={
                      account.newPassword
                    }
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        newPassword:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={
                      account.confirmPassword
                    }
                    onChange={(e) =>
                      setAccount({
                        ...account,
                        confirmPassword:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>

              </div>

              {/* Two Factor */}

              <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Two-Factor Authentication
                  </p>

                  <p className="text-xs text-gray-500">
                    Add an extra layer of security
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAccount({
                      ...account,
                      twoFactor:
                        !account.twoFactor,
                    })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    account.twoFactor
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      account.twoFactor
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>

              </div>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : saved
                  ? "Saved!"
                  : "Save Changes"}
              </Button>

            </form>
          )}

        </Card>
      </div>
    </div>
  );
};

export default Settings;