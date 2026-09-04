import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// REQUEST INTERCEPTOR
// Attach access token to protected API requests
// =========================================================

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(
      "flowguard-access-token"
    );

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// RESPONSE INTERCEPTOR
// Automatically refresh expired access token
// =========================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh/")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem(
      "flowguard-refresh-token"
    );

    if (!refreshToken) {
      clearAuthentication();

      window.location.replace("/login");

      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken = response.data.access;

      if (!newAccessToken) {
        throw new Error(
          "New access token was not received."
        );
      }

      localStorage.setItem(
        "flowguard-access-token",
        newAccessToken
      );

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthentication();

      window.location.replace("/login");

      return Promise.reject(refreshError);
    }
  }
);

// =========================================================
// CLEAR AUTHENTICATION
// =========================================================

export const clearAuthentication = () => {
  localStorage.removeItem(
    "flowguard-access-token"
  );

  localStorage.removeItem(
    "flowguard-refresh-token"
  );

  localStorage.removeItem(
    "flowguard-user"
  );

  localStorage.removeItem("token");
  localStorage.removeItem("flowguard-auth");
};

// =========================================================
// LOGIN
// =========================================================

export const loginUser = async (credentials) => {
  try {
    const response = await api.post(
      "/auth/login/",
      {
        email: credentials.email
          .trim()
          .toLowerCase(),

        password: credentials.password,
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Invalid email or password.";

    throw new Error(message);
  }
};

// =========================================================
// REGISTER
// =========================================================

export const registerUser = async (userData) => {
  try {
    const response = await api.post(
      "/auth/register/",
      userData
    );

    return response.data;
  } catch (error) {
    const data = error.response?.data;

    if (data && typeof data === "object") {
      const firstError = Object.values(data)[0];

      const message = Array.isArray(firstError)
        ? firstError[0]
        : data.detail || data.message || firstError;

      throw new Error(
        typeof message === "string"
          ? message
          : "Unable to create account."
      );
    }

    throw new Error("Unable to create account.");
  }
};

// =========================================================
// LOGOUT
// =========================================================

export const logoutUser = () => {
  clearAuthentication();
};

// =========================================================
// CURRENT USER
// =========================================================

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me/");

  return response.data;
};

// =========================================================
// USER SETTINGS
// =========================================================

// Get current user's settings
export const getUserSettings = async () => {
  const response = await api.get(
    "/users/settings/"
  );

  return response.data;
};

// Update current user's settings
export const updateUserSettings = async (
  settingsData
) => {
  const response = await api.patch(
    "/users/settings/",
    settingsData
  );

  return response.data;
};

// =========================================================
// DASHBOARD
// =========================================================

export const getDashboardData = async () => {
  const response = await api.get(
    "/dashboard/summary/"
  );

  return response.data;
};

// =========================================================
// PROJECTS
// =========================================================

export const getProjects = async () => {
  const response = await api.get("/projects/");

  return response.data;
};

// =========================================================
// CREATE PROJECT
// =========================================================

export const createProject = async (projectData) => {
  const response = await api.post(
    "/projects/",
    projectData
  );

  return response.data;
};

// =========================================================
// UPDATE PROJECT
// =========================================================

export const updateProject = async (
  projectId,
  projectData
) => {
  const response = await api.patch(
    `/projects/${projectId}/`,
    projectData
  );

  return response.data;
};

// =========================================================
// DELETE PROJECT
// =========================================================

export const deleteProject = async (projectId) => {
  await api.delete(
    `/projects/${projectId}/`
  );

  return true;
};

// =========================================================
// WORKFLOWS
// =========================================================

export const getWorkflows = async () => {
  const response = await api.get("/workflows/");

  return response.data;
};

export const createWorkflow = async (workflowData) => {
  const response = await api.post(
    "/workflows/",
    workflowData
  );

  return response.data;
};

export const updateWorkflow = async (
  workflowId,
  workflowData
) => {
  const response = await api.patch(
    `/workflows/${workflowId}/`,
    workflowData
  );

  return response.data;
};

export const deleteWorkflow = async (workflowId) => {
  await api.delete(
    `/workflows/${workflowId}/`
  );

  return true;
};

// =========================================================
// BUGS
// =========================================================

export const getBugs = async () => {
  const response = await api.get("/bugs/");

  return response.data;
};

export const createBug = async (bugData) => {
  console.log("Sending bug:", bugData);
  console.log("API URL:", `${API_BASE_URL}/bugs/`);

  const response = await api.post(
    "/bugs/",
    bugData
  );

  console.log("Bug API response:", response.data);

  return response.data;
};

export const updateBug = async (
  bugId,
  bugData
) => {
  const response = await api.patch(
    `/bugs/${bugId}/`,
    bugData
  );

  return response.data;
};

export const deleteBug = async (bugId) => {
  await api.delete(
    `/bugs/${bugId}/`
  );

  return true;
};

// =========================================================
// KNOWLEDGE BASE
// =========================================================

export const getKnowledgeArticles = async () => {
  const response = await api.get(
    "/knowledge/"
  );

  return response.data;
};

export const createKnowledgeArticle = async (
  articleData
) => {
  const response = await api.post(
    "/knowledge/",
    articleData
  );

  return response.data;
};

export const updateKnowledgeArticle = async (
  articleId,
  articleData
) => {
  const response = await api.patch(
    `/knowledge/${articleId}/`,
    articleData
  );

  return response.data;
};

export const deleteKnowledgeArticle = async (
  articleId
) => {
  await api.delete(
    `/knowledge/${articleId}/`
  );

  return true;
};

// =========================================================
// TASKS
// =========================================================

export const getTasks = async () => {
  const response = await api.get("/tasks/");

  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post(
    "/tasks/",
    taskData
  );

  return response.data;
};

export const updateTask = async (
  taskId,
  taskData
) => {
  const response = await api.patch(
    `/tasks/${taskId}/`,
    taskData
  );

  return response.data;
};

export const deleteTask = async (taskId) => {
  await api.delete(
    `/tasks/${taskId}/`
  );

  return true;
};

// =========================================================
// USERS
// =========================================================

export const getUsers = async () => {
  const response = await api.get("/users/");

  return response.data;
};

export const updateUser = async (
  userId,
  userData
) => {
  const response = await api.patch(
    `/users/${userId}/`,
    userData
  );

  return response.data;
};

// =========================================================
// ACTIVITY LOGS
// =========================================================

export const getActivityLogs = async () => {
  const response = await api.get(
    "/activity-logs/"
  );

  return response.data;
};

// =========================================================
// AI SPRINT ASSISTANT
// =========================================================

export const askAISprintAssistant = async (
  message
) => {
  const response = await api.post(
    "/ai-assistant/",
    {
      message,
    }
  );

  return response.data;
};

// =========================================================
// DEFAULT API
// =========================================================

export default api;