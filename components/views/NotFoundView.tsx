import React from 'react';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { NavTab } from '../../types';

interface NotFoundViewProps {
  onNavigateHome: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigateHome, onNavigateTab }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <FileQuestion size={32} />
      </div>
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 rounded mb-2">
        HTTP 404 • Resource Not Found
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
        Clinical View Unavailable
      </h1>
      <p className="text-sm text-on-surface-variant max-w-md mt-2">
        The requested clinical ledger or compliance module could not be located in this sovereign tenant workspace.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Home size={16} />
          <span>Return to Dashboard</span>
        </button>
        <button
          onClick={() => onNavigateTab('debts')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface rounded-lg text-sm font-medium border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Go to Unbilled Gaps</span>
        </button>
      </div>
    </div>
  );
};
