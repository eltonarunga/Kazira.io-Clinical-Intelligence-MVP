import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="relative bg-surface rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col border border-outline-variant/30 shadow-2xl z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/70">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold font-headline-sm text-on-surface tracking-tight">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 focus-visible:outline-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
