import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';

interface ToastProps extends ToastMessage {
  onClose: () => void;
  duration?: number; // Duration in milliseconds before auto-closing
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const typeStyles = {
    success: 'bg-green-600 border-green-700',
    error: 'bg-red-600 border-red-700',
    info: 'bg-blue-600 border-blue-700',
    warning: 'bg-yellow-600 border-yellow-700',
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white flex items-center justify-between space-x-4
                  ${typeStyles[type]} border-l-4 transform transition-all ease-out duration-300
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
      role="alert"
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};