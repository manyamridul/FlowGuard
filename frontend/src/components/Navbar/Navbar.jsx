import { FiBell, FiLogOut, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/api";
import Logo from "../Logo/Logo";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:px-6">

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="rounded-xl p-2 text-white/80 transition-all duration-200 hover:bg-white/15 hover:text-white lg:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400/20 sm:h-10 sm:w-10">
          <Logo size={22} />
        </div>

        <div className="min-w-0">
          <p className="hidden text-[11px] uppercase tracking-[0.2em] text-blue-100 sm:block">
            Workspace
          </p>

          <span className="truncate text-base font-semibold text-white sm:text-lg">
            Flow Guard
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

        <button
          type="button"
          className="rounded-xl p-2 text-white/80 transition-all duration-200 hover:bg-white/15 hover:text-white sm:p-2.5"
          aria-label="Notifications"
        >
          <FiBell className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-2.5 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:border-blue-400 hover:bg-blue-600 hover:text-white sm:px-3"
        >
          <FiLogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>
    </header>
  );
};

export default Navbar;
