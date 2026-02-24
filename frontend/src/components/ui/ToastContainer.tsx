import { X } from "lucide-react";
import { useToast } from "../../hooks/useToast.tsx";

const typeClasses = {
  success: "border-success bg-green-50 text-success",
  error: "border-danger bg-red-50 text-danger",
  info: "border-primary bg-primary-soft text-primary",
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-md ${typeClasses[t.type]}`}
        >
          <span className="text-sm font-medium">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-auto rounded p-0.5 hover:opacity-70"
            aria-label="Закрыть уведомление"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
