import React from 'react';
import Button from './Button';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onClearHistory: () => void;
  onClose: () => void;
}

const DataManagement: React.FC<Props> = ({ onClearHistory, onClose }) => {
  const handleExport = () => {
    try {
      const historyData = localStorage.getItem('kazira_history');
      if (!historyData) {
        toast.error('No data to export.');
        return;
      }

      const blob = new Blob([historyData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kazira-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully.');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data.');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      onClearHistory();
      toast.success('All data has been permanently deleted.');
      onClose();
    }
  };

  return (
    <div className="text-ink3 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-ink mb-2 font-serif">Data Export</h3>
        <p className="text-sm mb-4">
          Download a copy of all your generated reports and history in JSON format. This fulfills your right to data portability under GDPR.
        </p>
        <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2">
          <Download size={16} /> Export My Data
        </Button>
      </div>

      <div className="pt-6 border-t border-border2">
        <h3 className="text-lg font-bold text-warn mb-2 font-serif flex items-center gap-2">
          <AlertTriangle size={20} /> Danger Zone
        </h3>
        <p className="text-sm mb-4">
          Permanently delete all your data, including report history and preferences, from this browser. This fulfills your right to erasure (Right to be Forgotten) under GDPR.
        </p>
        <Button 
          variant="secondary" 
          onClick={handleDelete} 
          className="flex items-center gap-2 text-warn hover:bg-warn/10 hover:border-warn"
        >
          <Trash2 size={16} /> Delete All My Data
        </Button>
      </div>
    </div>
  );
};

export default DataManagement;
