import React from 'react';
import { CheckCircle, AlertCircle, Info, Send, ShieldCheck, Cpu, X } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'warn' | 'info' | 'sms' | 'audit';
}

interface ToastBannerProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const renderIcon = () => {
    switch (toast.type) {
      case 'warn':
        return <AlertCircle className="text-secondary" size={18} />;
      case 'sms':
        return <Send className="text-secondary" size={18} />;
      case 'audit':
        return <Cpu className="text-primary" size={18} />;
      case 'info':
        return <Info className="text-primary" size={18} />;
      case 'success':
      default:
        return <CheckCircle className="text-primary" size={18} />;
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 transition-opacity duration-200"
      role="alert"
    >
      <div className="px-3.5 py-3 rounded-md bg-surface-container-lowest text-on-surface flex items-start gap-3 border border-outline-variant/40 max-w-md">
        <div className="mt-0.5 shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">
            {toast.title}
          </p>
          <p className="font-label-mono text-[11px] text-on-surface-variant mt-0.5 leading-snug">
            {toast.message}
          </p>
        </div>
        <button 
          onClick={onDismiss}
          className="text-on-surface-variant hover:text-on-surface p-0.5 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default ToastBanner;
