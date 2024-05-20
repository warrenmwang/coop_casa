import React, { useRef, useEffect } from 'react';
import '../styles/modal.css';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode; // Accept any valid React node as children
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.classList.add('scale-in');
    }

    // Function to handle the escape key press
    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    // Add event listener for the escape key
    window.addEventListener('keydown', handleEscapeKeyPress);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleEscapeKeyPress);
    };
  }, []);

  const closeModal = () => {
    if (modalContentRef.current) {
      modalContentRef.current.classList.remove('scale-in');
      modalContentRef.current.classList.add('scale-out');
    }
    setTimeout(() => onClose(), 150); // Match the duration of the scale-out animation
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalContentRef}
        className="modal-content relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white transition-transform duration-200"
      >
        {children}
        <div className="items-center px-4 py-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;