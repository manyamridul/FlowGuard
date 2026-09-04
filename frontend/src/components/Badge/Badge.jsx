const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-700 text-slate-100",
    primary: "bg-blue-500/20 text-blue-300",
    success: "bg-emerald-500/20 text-emerald-300",
    warning: "bg-amber-500/20 text-amber-300",
    danger: "bg-red-500/20 text-red-300",
    info: "bg-cyan-500/20 text-cyan-300",
    purple: "bg-purple-500/20 text-purple-300",
    orange: "bg-orange-500/20 text-orange-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
