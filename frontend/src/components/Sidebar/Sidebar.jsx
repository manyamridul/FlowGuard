import { NavLink } from "react-router-dom";
import {
  FiLayout,
  FiFolder,
  FiGitBranch,
  FiCheckSquare,
  FiAlertCircle,
  FiUsers,
  FiBook,
  FiBarChart2,
  FiActivity,
  FiCpu,
  FiSettings,
  FiUser,
  FiChevronRight,
  FiZap,
} from "react-icons/fi";
import Logo from "../Logo/Logo";

const mainNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiLayout },
  { to: "/projects", label: "Projects", icon: FiFolder },
  { to: "/workflow", label: "Workflow", icon: FiGitBranch },
  { to: "/tasks", label: "Tasks", icon: FiCheckSquare },
  { to: "/bugs", label: "Bugs", icon: FiAlertCircle },
  { to: "/users", label: "Users", icon: FiUsers },
];

const workspaceItems = [
  { to: "/knowledge-base", label: "Knowledge Base", icon: FiBook },
  { to: "/reports", label: "Reports", icon: FiBarChart2 },
  { to: "/activity-logs", label: "Activity Logs", icon: FiActivity },
];

const bottomItems = [
  { to: "/ai-sprint-assistant", label: "AI Sprint Assistant", icon: FiCpu, ai: true },
  { to: "/settings", label: "Settings", icon: FiSettings },
  { to: "/profile", label: "Profile", icon: FiUser },
];

const SidebarLink = ({ item, onNavigate }) => {
  const { to, label, icon: Icon, ai } = item;

  if (ai) {
    return (
      <NavLink
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `sidebar-nav-link group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-all duration-300 ${
            isActive
              ? "bg-white/20 text-white shadow-lg shadow-blue-500/15 ring-1 ring-white/25"
              : "text-blue-50 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-blue-500/10"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-sky-300/20 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:bg-sky-300/30" />

            <span
              className={`sidebar-nav-icon relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-300 text-blue-800 shadow-md shadow-blue-500/20 transition-all duration-300 ${
                isActive
                  ? "scale-105"
                  : "group-hover:scale-110 group-hover:rotate-3"
              }`}
            >
              <Icon className="h-[17px] w-[17px]" />
            </span>

            <span className="relative flex-1 min-w-0">
              <span className="block truncate text-sm font-semibold">
                {label}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[10px] text-blue-200">
                <FiZap className="h-3 w-3 text-amber-500" />
                Intelligent planning
              </span>
            </span>

            <span className="relative rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-white transition-transform duration-300 group-hover:scale-105">
              AI
            </span>

            <FiChevronRight className="relative h-4 w-4 -translate-x-1 text-blue-200/50 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </>
        )}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `sidebar-nav-link group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-white/20 text-white shadow-lg shadow-blue-500/15 ring-1 ring-white/25"
            : "text-blue-100 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-blue-500/10"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-sky-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <span
            className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all duration-300 ${
              isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
            }`}
          />

          <span
            className={`sidebar-nav-icon relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
              isActive
                ? "bg-white text-blue-600 shadow-sm"
                : "bg-white/15 text-blue-100 group-hover:bg-white/25 group-hover:text-white"
            } ${isActive ? "scale-105" : "group-hover:scale-110 group-hover:rotate-3"}`}
          >
            <Icon className="h-[17px] w-[17px]" />
          </span>

          <span className="relative flex-1 truncate">{label}</span>

          <FiChevronRight
            className={`relative h-4 w-4 transition-all duration-300 ${
              isActive
                ? "translate-x-0 text-white opacity-100"
                : "-translate-x-1 text-blue-200/50 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
            }`}
          />
        </>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen = false, onNavigate }) => {
  return (
    <aside
      className={`
        fixed left-0 top-0 z-40
        flex h-screen w-64 flex-col
        border-r border-white/10
        bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
        shadow-[8px_0_40px_rgba(0,0,0,0.45)]
        ${isOpen ? "sidebar-open" : ""}
      `}
    >
      <div className="relative flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        <div className="pointer-events-none absolute left-6 top-2 h-10 w-24 rounded-full bg-sky-300/30 blur-2xl" />

        <div className="group relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-500/25">
            <Logo size={22} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-bold tracking-tight text-white">
                FlowGuard
              </span>
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                Pro
              </span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium tracking-wide text-blue-200">
              Workflow intelligence
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-6">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/80">
            Workspace
          </p>
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/80">
            Insights
          </p>
          <ul className="space-y-1">
            {workspaceItems.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/80">
            Intelligence
          </p>
          <SidebarLink
            item={bottomItems.find((item) => item.ai)}
            onNavigate={onNavigate}
          />
        </div>

        <div>
          <ul className="space-y-1">
            {bottomItems
              .filter((item) => !item.ai)
              .map((item) => (
                <li key={item.to}>
                  <SidebarLink item={item} onNavigate={onNavigate} />
                </li>
              ))}
          </ul>
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="group rounded-xl border border-white/15 bg-white/10 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300 transition-transform duration-300 group-hover:scale-110">
              <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-emerald-400 ring-2 ring-indigo-800" />
              <FiActivity className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                Workspace Online
              </p>
              <p className="mt-0.5 text-[10px] text-blue-200">
                All systems operational
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[9px] font-medium tracking-wide text-blue-200/50">
          FLOWGUARD • WORKFLOW PLATFORM
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
