import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ open, onClose, title, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-0 shadow-xl shadow-black/50 backdrop:bg-overlay"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-sm p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Закрыть"
          tabIndex={0}
        >
          <X size={20} />
        </button>
      </div>
      <div className="px-6 py-4 text-neutral-200">{children}</div>
    </dialog>
  );
};

export default Modal;
