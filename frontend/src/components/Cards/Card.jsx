const Card = ({ title, children, className = "", action, noPadding = false }) => {
  return (
    <div
      className={`fg-card-static group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/25 hover:shadow-[0_18px_40px_rgba(37,99,235,0.18)] ${noPadding ? "" : "p-4"} ${className}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-400/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-400/20" />

      {(title || action) && (
        <div
          className={`relative flex items-center justify-between ${noPadding ? "border-b border-slate-200 px-4 py-3" : "mb-4"}`}
        >
          {title && (
            <h3 className="fg-card-title text-sm font-semibold tracking-wide text-white">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      <div className={`relative ${noPadding && (title || action) ? "p-4" : ""}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
