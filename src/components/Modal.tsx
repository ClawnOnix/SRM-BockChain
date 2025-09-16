import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 pt-16 relative min-w-[340px] max-w-[95vw] flex flex-col items-center justify-center">
        <button
          className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="white" stroke="#ef4444" strokeWidth="2" />
            <path d="M11 11L21 21M21 11L11 21" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="w-full flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
