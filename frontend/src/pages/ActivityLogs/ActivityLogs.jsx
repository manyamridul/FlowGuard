import { useEffect, useMemo, useState } from "react";

import {
  FiCheckSquare,
  FiAlertCircle,
  FiFolder,
  FiUserPlus,
  FiGitBranch,
  FiFilter,
  FiActivity,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Badge from "../../components/Badge/Badge";

import { getActivityLogs } from "../../services/api";


// =========================================================
// ACTIVITY TYPE CONFIG
// =========================================================

const typeConfig = {
  task_created: {
    icon: FiCheckSquare,
    color: "bg-blue-100 text-blue-600",
    label: "Task Created",
    badge: "primary",
  },

  task_updated: {
    icon: FiCheckSquare,
    color: "bg-indigo-100 text-indigo-600",
    label: "Task Updated",
    badge: "primary",
  },

  task_deleted: {
    icon: FiCheckSquare,
    color: "bg-red-100 text-red-600",
    label: "Task Deleted",
    badge: "danger",
  },

  bug_created: {
    icon: FiAlertCircle,
    color: "bg-red-100 text-red-600",
    label: "Bug Created",
    badge: "danger",
  },

  bug_updated: {
    icon: FiAlertCircle,
    color: "bg-orange-100 text-orange-600",
    label: "Bug Updated",
    badge: "warning",
  },

  bug_deleted: {
    icon: FiAlertCircle,
    color: "bg-red-100 text-red-600",
    label: "Bug Deleted",
    badge: "danger",
  },

  bug_status_changed: {
    icon: FiAlertCircle,
    color: "bg-green-100 text-green-600",
    label: "Bug Status Changed",
    badge: "success",
  },

  project_created: {
    icon: FiFolder,
    color: "bg-blue-100 text-blue-600",
    label: "Project Created",
    badge: "primary",
  },

  project_updated: {
    icon: FiFolder,
    color: "bg-purple-100 text-purple-600",
    label: "Project Updated",
    badge: "purple",
  },

  project_deleted: {
    icon: FiFolder,
    color: "bg-red-100 text-red-600",
    label: "Project Deleted",
    badge: "danger",
  },

  report_created: {
    icon: FiActivity,
    color: "bg-blue-100 text-blue-600",
    label: "Report Created",
    badge: "primary",
  },

  report_updated: {
    icon: FiActivity,
    color: "bg-purple-100 text-purple-600",
    label: "Report Updated",
    badge: "purple",
  },

  report_deleted: {
    icon: FiActivity,
    color: "bg-red-100 text-red-600",
    label: "Report Deleted",
    badge: "danger",
  },

  workflow_created: {
    icon: FiGitBranch,
    color: "bg-blue-100 text-blue-600",
    label: "Workflow Created",
    badge: "primary",
  },

  workflow_updated: {
    icon: FiGitBranch,
    color: "bg-orange-100 text-orange-600",
    label: "Workflow Updated",
    badge: "warning",
  },

  workflow_deleted: {
    icon: FiGitBranch,
    color: "bg-red-100 text-red-600",
    label: "Workflow Deleted",
    badge: "danger",
  },

  user_login: {
    icon: FiUserPlus,
    color: "bg-green-100 text-green-600",
    label: "User Login",
    badge: "success",
  },

  activity: {
    icon: FiActivity,
    color: "bg-slate-100 text-slate-600",
    label: "Activity",
    badge: "default",
  },
};


// =========================================================
// CONVERT BACKEND ACTIVITY TO FRONTEND TYPE
// =========================================================

const getActivityType = (activity) => {
  const entityType = String(
    activity.entity_type || ""
  ).toUpperCase();

  const action = String(
    activity.action || ""
  ).toUpperCase();

  // =====================================================
  // TASK
  // =====================================================

  if (entityType === "TASK") {
    if (action === "CREATE") {
      return "task_created";
    }

    if (action === "UPDATE") {
      return "task_updated";
    }

    if (action === "DELETE") {
      return "task_deleted";
    }
  }

  // =====================================================
  // BUG
  // =====================================================

  if (entityType === "BUG") {
    if (action === "CREATE") {
      return "bug_created";
    }

    if (action === "UPDATE") {
      return "bug_updated";
    }

    if (action === "DELETE") {
      return "bug_deleted";
    }

    if (action === "STATUS_CHANGE") {
      return "bug_status_changed";
    }
  }

  // =====================================================
  // PROJECT
  // =====================================================

  if (entityType === "PROJECT") {
    if (action === "CREATE") {
      return "project_created";
    }

    if (action === "UPDATE") {
      return "project_updated";
    }

    if (action === "DELETE") {
      return "project_deleted";
    }
  }

  // =====================================================
  // REPORT
  // =====================================================

  if (entityType === "REPORT") {
    if (action === "CREATE") {
      return "report_created";
    }

    if (action === "UPDATE") {
      return "report_updated";
    }

    if (action === "DELETE") {
      return "report_deleted";
    }
  }

  // =====================================================
  // WORKFLOW
  // =====================================================

  if (entityType === "WORKFLOW") {
    if (action === "CREATE") {
      return "workflow_created";
    }

    if (action === "UPDATE") {
      return "workflow_updated";
    }

    if (action === "DELETE") {
      return "workflow_deleted";
    }
  }

  // =====================================================
  // LOGIN
  // =====================================================

  if (action === "LOGIN") {
    return "user_login";
  }

  // =====================================================
  // FALLBACK
  // =====================================================

  return "activity";
};


// =========================================================
// FORMAT DATE
// =========================================================

const formatDateTime = (value) => {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};


// =========================================================
// COMPONENT
// =========================================================

const ActivityLogs = () => {

  const [activities, setActivities] = useState([]);

  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =======================================================
  // LOAD ACTIVITY LOGS
  // =======================================================

  useEffect(() => {

    const fetchActivities = async () => {

      try {

        setLoading(true);

        setError("");

        const data = await getActivityLogs();


        // Django REST Framework can return
        // either an array or paginated { results: [] }

        const results = Array.isArray(data)
          ? data
          : data?.results || [];


        setActivities(results);

      } catch (err) {

        console.error(
          "Failed to load activity logs:",
          err
        );

        setActivities([]);

        setError(
          err.response?.data?.detail ||
          "Unable to load activity logs."
        );

      } finally {

        setLoading(false);

      }
    };


    fetchActivities();

  }, []);


  // =======================================================
  // FILTER ACTIVITIES
  // =======================================================

  const filtered = useMemo(() => {

    if (filter === "All") {
      return activities;
    }

    return activities.filter(
      (activity) =>
        getActivityType(activity) === filter
    );

  }, [activities, filter]);


  // =======================================================
  // FILTER OPTIONS
  // =======================================================

  const filterOptions = [
  {
    value: "All",
    label: "All Activities",
  },

  {
    value: "task_created",
    label: "Task Created",
  },

  {
    value: "task_updated",
    label: "Task Updated",
  },

  {
    value: "task_deleted",
    label: "Task Deleted",
  },

  {
    value: "bug_created",
    label: "Bug Created",
  },

  {
    value: "bug_updated",
    label: "Bug Updated",
  },

  {
    value: "bug_deleted",
    label: "Bug Deleted",
  },

  {
    value: "bug_status_changed",
    label: "Bug Status Changed",
  },

  {
    value: "project_created",
    label: "Project Created",
  },

  {
    value: "project_updated",
    label: "Project Updated",
  },

  {
    value: "project_deleted",
    label: "Project Deleted",
  },

  {
    value: "report_created",
    label: "Report Created",
  },

  {
    value: "report_updated",
    label: "Report Updated",
  },

  {
    value: "report_deleted",
    label: "Report Deleted",
  },

  {
    value: "workflow_created",
    label: "Workflow Created",
  },

  {
    value: "workflow_updated",
    label: "Workflow Updated",
  },

  {
    value: "workflow_deleted",
    label: "Workflow Deleted",
  },

  {
    value: "user_login",
    label: "User Login",
  },
];


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">

          Loading activity logs...

        </div>

      </div>
    );

  }


  // =======================================================
  // MAIN UI
  // =======================================================

  return (

    <div className="space-y-6 p-4 sm:p-6">


      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Activity Logs
          </h1>

          <p className="text-sm text-gray-500">
            Timeline of all team activities
          </p>

        </div>


        <div className="flex items-center gap-2">

          <FiFilter className="h-4 w-4 text-gray-400" />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >

            {filterOptions.map((option) => (

              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>

            ))}

          </select>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">

          {error}

        </div>

      )}


      {/* ACTIVITY TIMELINE */}

      <Card>

        <div className="relative">

          {filtered.length > 0 && (

            <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200" />

          )}


          <div className="space-y-6">

            {filtered.length > 0 ? (

              filtered.map((activity) => {

                const type =
                  getActivityType(activity);

                const config =
                  typeConfig[type] ||
                  typeConfig.activity;

                const Icon = config.icon;


                return (

                  <div
                    key={activity.id}
                    className="relative flex gap-4 pl-14"
                  >


                    {/* ICON */}

                    <div
                      className={`absolute left-3 flex h-7 w-7 items-center justify-center rounded-full ${config.color}`}
                    >

                      <Icon className="h-3.5 w-3.5" />

                    </div>


                    {/* ACTIVITY CONTENT */}

                    <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-4">


                      <div className="mb-2 flex flex-wrap items-center gap-2">

                        <Badge variant={config.badge}>
                          {config.label}
                        </Badge>

                        <span className="text-xs text-gray-400">
                          {formatDateTime(
                            activity.created_at
                          )}
                        </span>

                      </div>


                      <p className="text-sm text-gray-700">

                        <span className="font-semibold text-gray-900">
                          {activity.username ||
                            "Unknown User"}
                        </span>

                        {" "}

                        {activity.description}

                      </p>


                      {activity.project_name && (

                        <p className="mt-1 text-xs text-gray-500">

                          Project:{" "}
                          {activity.project_name}

                        </p>

                      )}

                    </div>

                  </div>

                );

              })

            ) : (

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

                <p className="text-lg font-semibold text-slate-700">
                  No activity logs available
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Recent activity will appear here after
                  actions are performed in FlowGuard.
                </p>

              </div>

            )}

          </div>

        </div>

      </Card>

    </div>

  );

};


export default ActivityLogs;