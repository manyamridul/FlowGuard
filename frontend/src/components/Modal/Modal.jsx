import { FiX } from "react-icons/fi";

const Modal = ({
  title = "Modal",
  isOpen = false,
  onClose,
  children,
  footer,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${sizes[size] || sizes.md} max-h-[min(90vh,100%)] overflow-y-auto rounded-lg bg-slate-900 text-slate-100 shadow-xl ring-1 ring-slate-700`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
              aria-label="Close"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
