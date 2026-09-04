import { useEffect, useMemo, useState } from "react";
import {
  getDashboardData,
  getProjects,
  getTasks,
  getUsers,
} from "../../services/api";
import Chart from "../../components/Charts/Chart";
import Table from "../../components/Tables/Table";
import Badge from "../../components/Badge/Badge";
import {
  getProjectPercent,
  getProjectSdlc,
  getWorkDone,
  sdlcLabel,
  groupUsersByDomain,
} from "../../utils/projectExtras";

const isHighPriority = (priority) =>
  priority === "HIGH" || priority === "CRITICAL";

const inDueDateRange = (dueDate, filter) => {
  if (filter === "All" || !filter) return true;
  if (!dueDate) return filter === "unset";

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  if (filter === "overdue") return due < today;
  if (filter === "this_week") return due >= today && due <= weekEnd;
  if (filter === "this_month") return due >= today && due <= monthEnd;
  if (filter === "unset") return false;
  return true;
};

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dueDateFilter, setDueDateFilter] = useState("All");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const [dashboard, projectData, taskData, userData] =
          await Promise.all([
            getDashboardData(),
            getProjects().catch(() => []),
            getTasks().catch(() => []),
            getUsers().catch(() => []),
          ]);

        setReportData(dashboard);
        setProjects(
          Array.isArray(projectData)
            ? projectData
            : projectData?.results || []
        );
        setTasks(
          Array.isArray(taskData) ? taskData : taskData?.results || []
        );
        setUsers(
          Array.isArray(userData) ? userData : userData?.results || []
        );
      } catch (err) {
        console.error("Failed to load reports:", err);
        setError(
          err.response?.data?.detail || "Unable to load reports data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchPriority =
        priorityFilter === "All" ||
        (priorityFilter === "HIGH_CRITICAL" &&
          isHighPriority(project.priority));

      const matchDue = inDueDateRange(project.due_date, dueDateFilter);

      return matchPriority && matchDue;
    });
  }, [projects, priorityFilter, dueDateFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Loading reports...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Track project performance and team productivity
          </p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <h2 className="text-xl font-semibold text-red-700">
            Unable to load reports
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const dashboardProjects = reportData?.projects || {};
  const dashboardTasks = reportData?.tasks || {};
  const bugs = reportData?.bugs || {};

  const totalProjects = dashboardProjects.total || projects.length;
  const activeProjects = dashboardProjects.active || 0;
  const completedProjects = dashboardProjects.completed || 0;
  const onHoldProjects = dashboardProjects.on_hold || 0;

  const totalTasks = dashboardTasks.total || tasks.length;
  const todoTasks = dashboardTasks.todo || 0;
  const inProgressTasks = dashboardTasks.in_progress || 0;
  const reviewTasks = dashboardTasks.review || 0;
  const doneTasks = dashboardTasks.done || 0;
  const blockedTasks = dashboardTasks.blocked || 0;

  const totalBugs = bugs.total || 0;
  const openBugs = bugs.open || 0;
  const bugInProgress = bugs.in_progress || 0;
  const resolvedBugs = bugs.resolved || 0;
  const closedBugs = bugs.closed || 0;
  const reopenedBugs = bugs.reopened || 0;

  const projectCompletion =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

  const taskCompletion =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const activeProjectPercentage =
    totalProjects > 0
      ? Math.round((activeProjects / totalProjects) * 100)
      : 0;

  const onHoldPercentage =
    totalProjects > 0
      ? Math.round((onHoldProjects / totalProjects) * 100)
      : 0;

  const workTotals = filteredProjects.reduce(
    (acc, project) => {
      const work = getWorkDone(project);
      acc.FRONTEND += work.FRONTEND || 0;
      acc.BACKEND += work.BACKEND || 0;
      acc.count += 1;
      return acc;
    },
    { FRONTEND: 0, BACKEND: 0, count: 0 }
  );

  const frontendPercent = workTotals.count
    ? Math.round(workTotals.FRONTEND / workTotals.count)
    : 0;
  const backendPercent = workTotals.count
    ? Math.round(workTotals.BACKEND / workTotals.count)
    : 0;

  const domainGroups = groupUsersByDomain(users);
  const memberChart = [
    { label: "Frontend", value: domainGroups.FRONTEND.length, color: "#3b82f6" },
    { label: "Backend", value: domainGroups.BACKEND.length, color: "#22c55e" },
    { label: "Database", value: domainGroups.DATABASE.length, color: "#f59e0b" },
    { label: "QA", value: domainGroups.QA.length, color: "#8b5cf6" },
  ];

  const summary = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: "📁",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: "✓",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Completed Tasks",
      value: doneTasks,
      icon: "✓",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Open Bugs",
      value: openBugs,
      icon: "!",
      color: "bg-red-50 text-red-600",
    },
  ];

  const projectStats = [
    {
      label: "Active Projects",
      value: activeProjects,
      percentage: activeProjectPercentage,
      color: "#3b82f6",
    },
    {
      label: "Completed Projects",
      value: completedProjects,
      percentage: projectCompletion,
      color: "#22c55e",
    },
    {
      label: "On Hold",
      value: onHoldProjects,
      percentage: onHoldPercentage,
      color: "#f97316",
    },
  ];

  const taskStats = [
    { label: "To Do", value: todoTasks, color: "text-slate-700" },
    { label: "In Progress", value: inProgressTasks, color: "text-blue-600" },
    { label: "Review", value: reviewTasks, color: "text-purple-600" },
    { label: "Done", value: doneTasks, color: "text-green-600" },
    { label: "Blocked", value: blockedTasks, color: "text-red-600" },
  ];

  const bugStats = [
    { label: "Open", value: openBugs, color: "text-red-600", bg: "bg-red-50" },
    {
      label: "In Progress",
      value: bugInProgress,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: resolvedBugs,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Closed",
      value: closedBugs,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      label: "Reopened",
      value: reopenedBugs,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const sheetRows = filteredProjects.map((project) => [
    `#${project.id}`,
    project.name,
    `${getProjectPercent(project, tasks)}%`,
    sdlcLabel(getProjectSdlc(project)),
    <Badge
      key={`p-${project.id}`}
      variant={
        project.priority === "CRITICAL"
          ? "danger"
          : project.priority === "HIGH"
          ? "warning"
          : "primary"
      }
    >
      {project.priority}
    </Badge>,
    project.due_date || "Not set",
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Track project performance, SDLC progress, and team capacity
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="All">All priorities</option>
          <option value="HIGH_CRITICAL">High / Critical only</option>
        </select>

        <select
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="All">All due dates</option>
          <option value="overdue">Overdue</option>
          <option value="this_week">Due this week</option>
          <option value="this_month">Due this month</option>
          <option value="unset">No due date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Project sheet
          </h3>
          <p className="text-sm text-slate-500">
            {filteredProjects.length} projects matching current filters
          </p>
        </div>
        {filteredProjects.length > 0 ? (
          <Table
            headers={[
              "Project ID",
              "Project Name",
              "% Complete",
              "SDLC",
              "Priority",
              "Due Date",
            ]}
            rows={sheetRows}
          />
        ) : (
          <p className="text-sm text-slate-500">
            No projects match the selected filters.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Frontend vs Backend completion
          </h3>
          <Chart
            type="hbar"
            data={[
              { label: "Frontend", value: frontendPercent, color: "#3b82f6" },
              { label: "Backend", value: backendPercent, color: "#22c55e" },
            ]}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Members by domain
          </h3>
          <Chart type="bar" data={memberChart} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Project Completion
              </h3>
              <p className="text-sm text-slate-500">Current project status</p>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {projectCompletion}%
            </div>
          </div>
          <div className="space-y-5">
            {projectStats.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-800">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Task Completion
              </h3>
              <p className="text-sm text-slate-500">
                Current task distribution
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {taskCompletion}%
            </div>
          </div>
          <div className="space-y-3">
            {taskStats.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Bug Statistics
            </h3>
            <p className="text-sm text-slate-500">
              Current bug status across your projects
            </p>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalBugs}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {bugStats.map((item) => (
            <div key={item.label} className={`rounded-xl p-4 ${item.bg}`}>
              <p className={`text-sm font-medium ${item.color}`}>
                {item.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Live analytics:</span> Filters apply
          to the project sheet and frontend/backend charts. High/Critical and
          due date are the two report filters requested for review.
        </p>
      </div>
    </div>
  );
};

export default Reports;
