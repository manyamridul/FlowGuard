const Button = ({
  children = "Button",
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  size = "md",
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:brightness-110 disabled:opacity-60",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:bg-slate-900",
    outline: "border border-slate-600 bg-slate-800 text-slate-200 hover:border-blue-400 hover:bg-slate-700 hover:text-white disabled:opacity-50",
    danger: "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/20 hover:brightness-110 disabled:opacity-60",
    ghost: "text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`fg-button inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
