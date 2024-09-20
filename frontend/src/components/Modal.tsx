import * as React from "react";
import "../styles/Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const handleEscape = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal__background" onClick={handleBackdropClick}>
      <div className="modal__body">
        <div className="modal__header">
          <h2 className="modal__header_title">{title}</h2>
          <button onClick={onClose} className="modal__header_close_button">
            &times;
          </button>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
