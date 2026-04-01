import React, { useState, useEffect } from 'react';
import { Key, Save, AlertCircle } from 'lucide-react';
import Button from './Button';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('kazira_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('kazira_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('kazira_api_key');
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent-light/50 p-4 rounded-xl border border-accent/20 flex gap-3">
        <AlertCircle className="text-accent shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-ink2">
          <p className="font-bold mb-1">Bring Your Own Key (BYOK)</p>
          <p>To use Kazira on Vercel, please provide your own Google Gemini API key. Your key is stored locally in your browser and never sent to our servers.</p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent hover:underline mt-2 inline-block font-medium">
            Get an API key from Google AI Studio &rarr;
          </a>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="apiKey" className="block text-sm font-bold text-ink2">
          Gemini API Key
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key size={16} className="text-ink3" />
          </div>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border2 rounded-lg bg-surface focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
            placeholder="AIzaSy..."
          />
        </div>
        <p className="text-xs text-ink3">Leave blank to use the default environment key (if available).</p>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button variant="primary" onClick={handleSave} className="min-w-[120px]">
          {isSaved ? 'Saved!' : <><Save size={16} className="mr-2" /> Save Settings</>}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
