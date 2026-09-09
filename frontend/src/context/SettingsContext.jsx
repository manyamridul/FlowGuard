import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SettingsContext = createContext(null);

//const API_URL = "http://127.0.0.1:8001/api/users/settings/";
const API_URL =
  `${window.location.protocol}//${window.location.hostname}:8001/api/users/settings/`;

const defaultSettings = {
  workspace_name: "Flow Guard",
  language: "English",
  timezone: "UTC+5:30 (IST)",
  date_format: "MM/DD/YYYY",
  week_start: "Monday",

  email_notifications: true,
  push_notifications: true,
  task_assigned: true,
  task_completed: false,
  bug_reported: true,
  project_updates: true,
  weekly_digest: false,
  mention_alerts: true,

  appearance: "DARK",
  accent_color: "blue",
  compact_mode: false,
  sidebar_collapsed: false,

  two_factor_enabled: false,
};

const getToken = () => {
  return localStorage.getItem("flowguard-access-token");
};

const applySettingsToUI = (settings) => {
  if (!settings) return;

  const root = document.documentElement;
  const body = document.body;

  const accent = settings.accent_color || "blue";

  root.classList.remove("theme-light", "theme-dark", "theme-system");
  body.classList.remove("theme-light", "theme-dark", "theme-system");

  root.classList.add("theme-dark");
  body.classList.add("theme-dark");
  root.setAttribute("data-theme", "dark");

  // Apply accent
  root.setAttribute("data-accent", accent);
  body.setAttribute("data-accent", accent);

  // Compact mode
  if (settings.compact_mode) {
    root.classList.add("compact-mode");
    body.classList.add("compact-mode");
  } else {
    root.classList.remove("compact-mode");
    body.classList.remove("compact-mode");
  }

  // Sidebar
  if (settings.sidebar_collapsed) {
    root.classList.add("sidebar-collapsed");
    body.classList.add("sidebar-collapsed");
  } else {
    root.classList.remove("sidebar-collapsed");
    body.classList.remove("sidebar-collapsed");
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.warn("Settings authentication expired.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load settings (${response.status})`
        );
      }

      const data = await response.json();

      const mergedSettings = {
        ...defaultSettings,
        ...data,
      };

      setSettings(mergedSettings);
      applySettingsToUI(mergedSettings);
    } catch (err) {
      console.error("Settings load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = (updates) => {
    setSettings((previous) => {
      const updated = {
        ...previous,
        ...updates,
      };

      // Apply immediately BEFORE saving
      applySettingsToUI(updated);

      return updated;
    });

    setSaved(false);
  };

  const saveSettings = async () => {
    const token = getToken();

    if (!token) {
      setError("You are not authenticated.");
      return false;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      // Apply immediately
      applySettingsToUI(settings);

      const response = await fetch(API_URL, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.status === 401) {
        throw new Error(
          "Authentication expired. Please login again."
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.detail ||
            `Failed to save settings (${response.status})`
        );
      }

      const data = await response.json();

      const updatedSettings = {
        ...settings,
        ...data,
      };

      setSettings(updatedSettings);

      // IMPORTANT:
      // Apply the settings returned by backend
      applySettingsToUI(updatedSettings);

      setSaved(true);

      return true;
    } catch (err) {
      console.error("Settings save error:", err);
      setError(err.message || "Failed to save settings.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    applySettingsToUI(defaultSettings);
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    applySettingsToUI(settings);
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        saving,
        saved,
        error,
        updateSettings,
        saveSettings,
        reloadSettings: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
};

export default SettingsContext;