import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiFolder,
  FiCheckSquare,
  FiAlertCircle,
  FiPlus,
  FiActivity,
  FiArrowUpRight,
  FiTrendingUp,
} from "react-icons/fi";

import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import { getDashboardData } from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("flowguard-user") || "{}"
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardData();

        console.log("Dashboard API response:", data);

        setDashboard(data);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="page-enter flex min-h-[70vh] items-center justify-center p-6">
        <div className="fg-glass flex flex-col items-center rounded-2xl px-10 py-8 shadow-xl">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-semibold text-slate-700">
            Loading your workspace
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Preparing your FlowGuard dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="page-enter p-4 sm:p-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-6 shadow-sm text-red-100">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FiAlertCircle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-red-800">
                Dashboard Error
              </h2>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const projects = dashboard.projects || {};
  const tasks = dashboard.tasks || {};
  const bugs = dashboard.bugs || {};

  return (
    <div className="min-h-full space-y-7 p-4 sm:p-6 lg:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 shadow-xl shadow-black/40 sm:p-7">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-300/30 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="status-dot status-dot-active" />
              Workspace Online
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back,{" "}
              <span className="text-sky-200">
                {user.first_name || user.username || "User"}
              </span>
              !
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Here's what's happening with your FlowGuard workspace today.
              Stay on top of projects, tasks, and engineering health.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <Button
              onClick={() => navigate("/projects")}
              className="fg-button border-0 bg-white text-blue-700 shadow-lg shadow-blue-900/20 hover:bg-sky-50"
            >
              <FiPlus className="h-4 w-4" />
              New Project
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/tasks")}
              className="fg-button border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <FiPlus className="h-4 w-4" />
              New Task
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/reports")}
              className="fg-button border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              View Reports
              <FiArrowUpRight className="h-4 w-4" />
            </Button>

          </div>
        </div>
      </section>

      {/* =================================================
          MAIN STATS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* PROJECTS */}

        <div className="fg-card group relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-950/80 p-5">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/60 blur-2xl transition-all duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Projects
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
                {projects.total}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-blue-600">
                  {projects.active}
                </span>
                <span className="text-slate-400">
                  active projects
                </span>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FiFolder className="h-5 w-5" />
            </div>

          </div>

          <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 group-hover:w-full" />
          </div>
        </div>

        {/* TASKS */}

        <div className="fg-card group relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950/80 p-5">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-100/60 blur-2xl transition-all duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Tasks
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
                {tasks.total}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-indigo-600">
                  {tasks.in_progress}
                </span>
                <span className="text-slate-400">
                  in progress
                </span>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FiCheckSquare className="h-5 w-5" />
            </div>

          </div>

          <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 group-hover:w-full" />
          </div>
        </div>

        {/* COMPLETED */}

        <div className="fg-card group relative overflow-hidden bg-gradient-to-br from-slate-900 to-emerald-950/70 p-5">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl transition-all duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Completed Tasks
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
                {tasks.done}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-emerald-600">
                  {tasks.review}
                </span>
                <span className="text-slate-400">
                  under review
                </span>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FiActivity className="h-5 w-5" />
            </div>

          </div>

          <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700 group-hover:w-full" />
          </div>
        </div>

        {/* BUGS */}

        <div className="fg-card group relative overflow-hidden bg-gradient-to-br from-slate-900 to-rose-950/70 p-5">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100/60 blur-2xl transition-all duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Open Bugs
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-100">
                {bugs.open}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-red-600">
                  {bugs.in_progress}
                </span>
                <span className="text-slate-400">
                  in progress
                </span>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FiAlertCircle className="h-5 w-5" />
            </div>

          </div>

          <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-700 group-hover:w-full" />
          </div>
        </div>

      </div>

      {/* =================================================
          PROJECT + TASK OVERVIEW
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* PROJECT OVERVIEW */}

        <Card
          title="Project Overview"
          className="fg-card-static overflow-hidden"
        >
          <div className="space-y-1">

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.18)]" />

                <span className="fg-overview-label text-sm">
                  Active Projects
                </span>
              </div>

              <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-bold text-blue-300">
                {projects.active}
              </span>

            </div>

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]" />

                <span className="fg-overview-label text-sm">
                  Completed Projects
                </span>
              </div>

              <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300">
                {projects.completed}
              </span>

            </div>

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.18)]" />

                <span className="fg-overview-label text-sm">
                  On Hold
                </span>
              </div>

              <span className="rounded-lg bg-orange-500/20 px-3 py-1 text-sm font-bold text-orange-300">
                {projects.on_hold}
              </span>

            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border-t border-slate-700/60 px-3 pt-4">

              <span className="fg-card-title font-semibold">
                Total
              </span>

              <span className="fg-card-title text-lg font-bold">
                {projects.total}
              </span>

            </div>

          </div>
        </Card>

        {/* TASK OVERVIEW */}

        <Card
          title="Task Overview"
          className="fg-card-static overflow-hidden"
        >
          <div className="space-y-1">

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <span className="fg-overview-label text-sm">
                To Do
              </span>

              <span className="rounded-lg bg-slate-700 px-3 py-1 text-sm font-bold text-slate-100">
                {tasks.todo}
              </span>

            </div>

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <span className="fg-overview-label text-sm">
                In Progress
              </span>

              <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-bold text-blue-300">
                {tasks.in_progress}
              </span>

            </div>

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <span className="fg-overview-label text-sm">
                Review
              </span>

              <span className="rounded-lg bg-indigo-500/20 px-3 py-1 text-sm font-bold text-indigo-300">
                {tasks.review}
              </span>

            </div>

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <span className="fg-overview-label text-sm">
                Done
              </span>

              <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300">
                {tasks.done}
              </span>

            </div>

            <div className="fg-overview-row group flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:bg-slate-800">

              <span className="fg-overview-label text-sm">
                Blocked
              </span>

              <span className="rounded-lg bg-red-500/20 px-3 py-1 text-sm font-bold text-red-300">
                {tasks.blocked}
              </span>

            </div>

          </div>
        </Card>

      </div>

      {/* =================================================
          BUG OVERVIEW
      ================================================= */}

      <Card
        title="Bug Overview"
        className="fg-card-static overflow-hidden"
      >

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

          {/* TOTAL */}

          <div className="group rounded-2xl border border-slate-700 bg-slate-800 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total
              </p>

              <FiAlertCircle className="h-4 w-4 text-slate-500 transition-transform duration-300 group-hover:scale-110" />
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {bugs.total}
            </p>

          </div>

          {/* OPEN */}

          <div className="group rounded-2xl border border-red-500/30 bg-red-950/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

            <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
              Open
            </p>

            <p className="mt-3 text-2xl font-bold text-red-300">
              {bugs.open}
            </p>

          </div>

          {/* IN PROGRESS */}

          <div className="group rounded-2xl border border-blue-500/30 bg-blue-950/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
              In Progress
            </p>

            <p className="mt-3 text-2xl font-bold text-blue-300">
              {bugs.in_progress}
            </p>

          </div>

          {/* RESOLVED */}

          <div className="group rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Resolved
            </p>

            <p className="mt-3 text-2xl font-bold text-emerald-300">
              {bugs.resolved}
            </p>

          </div>

          {/* REOPENED */}

          <div className="group rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">

            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
              Reopened
            </p>

            <p className="mt-3 text-2xl font-bold text-indigo-300">
              {bugs.reopened}
            </p>

          </div>

        </div>

      </Card>

      {/* =================================================
          FOOTER INSIGHT
      ================================================= */}

      <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 shadow-lg shadow-black/30">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
          <FiTrendingUp className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            Workspace activity is being monitored
          </p>

          <p className="mt-0.5 text-xs text-blue-100">
            Keep projects, tasks and bugs moving to maintain healthy delivery flow.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;