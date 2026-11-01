import { useEffect, useRef } from "react";
import { X, Check, Info, Trash2, AlertCircle } from "lucide-react";
import { useGame } from "../GameContext";
export default function ModalDialog() {
  const { modal, closeModal, toast } = useGame();
  const ref = useRef(null),
    closeRef = useRef(closeModal);
  useEffect(() => {
    closeRef.current = closeModal;
  }, [closeModal]);
  useEffect(() => {
    if (!modal) return;
    const dialog = ref.current,
      previous = document.activeElement,
      overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.querySelector(".dialog-actions button")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [modal]);
  const Icon = modal?.isDanger ? Trash2 : Info;
  return (
    <>
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "error" ? <AlertCircle /> : <Check />}
          <span>{toast.message}</span>
        </div>
      )}
      {modal && (
        <dialog
          ref={ref}
          className={`app-dialog ${modal.isDanger ? "dialog-danger" : ""}`}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          onCancel={(e) => {
            e.preventDefault();
            closeRef.current(false);
          }}
          onClick={(e) => {
            if (e.target === ref.current && modal.type === "alert")
              closeModal(true);
          }}
        >
          <div className="dialog-body">
            <button
              className="dialog-close"
              aria-label="Закрыть"
              onClick={() => closeModal(false)}
            >
              <X />
            </button>
            <div className="dialog-symbol">
              <Icon />
            </div>
            <h2 id="dialog-title">{modal.title || "Внимание"}</h2>
            <p id="dialog-description">{modal.message}</p>
            <div className="dialog-actions">
              {modal.type === "confirm" && (
                <button
                  className="btn-secondary"
                  autoFocus
                  onClick={() => closeModal(false)}
                >
                  {modal.cancelText || "Отмена"}
                </button>
              )}
              <button
                className={`btn-primary ${modal.isDanger ? "btn-danger" : ""}`}
                onClick={() => closeModal(true)}
              >
                {modal.confirmText || "Понятно"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
