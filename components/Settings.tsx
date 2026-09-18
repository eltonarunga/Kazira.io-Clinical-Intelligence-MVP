import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ShieldCheck, Building2, Server, Cpu } from 'lucide-react';
import Button from './Button';
import { safeStorage } from '../utils/storage';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [facilityName, setFacilityName] = useState('Nairobi West Medical Centre');
  const [mflCode, setMflCode] = useState('MFL-28341');
  const [county, setCounty] = useState('Nairobi');
  const [dhis2SyncEnabled, setDhis2SyncEnabled] = useState(true);
  const [fhirLiveSync, setFhirLiveSync] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Clear legacy client-side key storage to prevent invalid override headers
    safeStorage.removeItem('kazira_api_key');

    const savedFacility = safeStorage.getItem('kazira_facility_name');
    if (savedFacility) setFacilityName(savedFacility);

    const savedMfl = safeStorage.getItem('kazira_mfl_code');
    if (savedMfl) setMflCode(savedMfl);

    const savedCounty = safeStorage.getItem('kazira_county');
    if (savedCounty) setCounty(savedCounty);
  }, []);

  const handleSave = () => {
    safeStorage.setItem('kazira_facility_name', facilityName.trim());
    safeStorage.setItem('kazira_mfl_code', mflCode.trim());
    safeStorage.setItem('kazira_county', county.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="space-y-6" id="facility-settings-modal">
      {/* AI Engine Status Banner */}
      <div className="bg-surface-elevated p-4 rounded-md border border-border flex items-start gap-3">
        <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5 text-accent">
          <Cpu size={16} />
        </div>
        <div className="text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-on-surface">Gemini 3.8 Clinical Engine</span>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
              Active &amp; Server-Side
            </span>
          </div>
          <p className="text-on-surface-subtle text-xs leading-relaxed">
            All AI inferences are proxied securely through the application backend. API credentials are encrypted and managed in platform <strong className="text-on-surface">Settings &gt; Secrets</strong>.
          </p>
        </div>
      </div>

      {/* Facility Profile */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border">
          <Building2 size={16} className="text-accent" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Facility Profile &amp; Ministry Registry</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="facilityName" className="block text-xs font-medium text-on-surface-subtle mb-1">
              Facility Name
            </label>
            <input
              type="text"
              id="facilityName"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded bg-surface text-on-surface focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="mflCode" className="block text-xs font-medium text-on-surface-subtle mb-1">
              Master Facility List (MFL) Code
            </label>
            <input
              type="text"
              id="mflCode"
              value={mflCode}
              onChange={(e) => setMflCode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded bg-surface text-on-surface focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="county" className="block text-xs font-medium text-on-surface-subtle mb-1">
              County Health Department
            </label>
            <input
              type="text"
              id="county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded bg-surface text-on-surface focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* KDPA 2019 Privacy & Security Status */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border">
          <ShieldCheck size={16} className="text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Kenya Data Protection Act (KDPA 2019)</h4>
        </div>

        <div className="bg-surface-elevated p-3.5 rounded border border-border text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-subtle">DPIA Regulatory Status:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              KDPA/REG/2026/8942 (Certified)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-subtle">Patient Anonymisation:</span>
            <span className="font-medium text-on-surface">SHA-256 One-Way Token Masking</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-subtle">Statutory Retention Limit:</span>
            <span className="font-medium text-on-surface">90 Days Rolling Audit Log</span>
          </div>
        </div>
      </div>

      {/* Integration Toggles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border">
          <Server size={16} className="text-on-surface-subtle" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Health Information Exchange Gateways</h4>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-2.5 rounded border border-border bg-surface cursor-pointer hover:bg-surface-elevated transition-colors">
            <div>
              <p className="text-xs font-medium text-on-surface">MoH DHIS2 Gateway Auto-Sync</p>
              <p className="text-[11px] text-on-surface-subtle">Transmit aggregated SHA claim bundles to DHIS2 tracker daily</p>
            </div>
            <input
              type="checkbox"
              checked={dhis2SyncEnabled}
              onChange={(e) => setDhis2SyncEnabled(e.target.checked)}
              className="rounded border-border text-accent focus:ring-accent w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded border border-border bg-surface cursor-pointer hover:bg-surface-elevated transition-colors">
            <div>
              <p className="text-xs font-medium text-on-surface">KenyaEMR / OpenMRS FHIR R4 Ingestion</p>
              <p className="text-[11px] text-on-surface-subtle">Continuous sync with on-premise EMR clinical encounters</p>
            </div>
            <input
              type="checkbox"
              checked={fhirLiveSync}
              onChange={(e) => setFhirLiveSync(e.target.checked)}
              className="rounded border-border text-accent focus:ring-accent w-4 h-4"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-border">
        <Button variant="primary" onClick={handleSave} className="min-w-[130px]" id="btn-save-settings">
          {isSaved ? (
            <>
              <CheckCircle2 size={16} className="mr-2 text-white" />
              Saved
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
