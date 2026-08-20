import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-border2">
        <div className="p-4 sm:p-5 border-b border-border2 flex justify-between items-center bg-surface2/40">
          <h2 className="text-lg font-bold font-serif text-ink tracking-tight">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-surface3 rounded-lg"><X size={18} /></Button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
