import React, { useState } from 'react';
import { ShieldCheck, FileSpreadsheet, Server, Database, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { PRIVATE_CLINIC_DATA, PUBLIC_FACILITY_CLINIC_DATA } from '../constants';
import { fhirService } from '../services/fhirService';
import { parseAndAnonymizeCSV } from '../utils/csvParser';
import { toast } from 'sonner';

interface DataInputGuideProps {
  onLoadPreset?: (data: string) => void;
  currentDataLength?: number;
}

const DataInputGuide: React.FC<DataInputGuideProps> = ({ onLoadPreset, currentDataLength }) => {
  const [isFetchingFhir, setIsFetchingFhir] = useState(false);

  const handleFetchFhir = async () => {
    setIsFetchingFhir(true);
    try {
      const bundle = await fhirService.fetchRecentEncounters(25);
      const csvData = fhirService.convertEncountersToClinicData(bundle);
      if (onLoadPreset) {
        onLoadPreset(csvData);
        toast.success(`Fetched ${bundle.total} encounters from KenyaEMR / OpenMRS FHIR endpoint!`);
      }
    } catch (err: any) {
      toast.error('Failed to pull OpenMRS FHIR encounters: ' + err.message);
    } finally {
      setIsFetchingFhir(false);
    }
  };

  return (
    <div className="bg-surface2/80 border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h4 className="text-sm font-bold text-ink font-serif">KDPA 2019 Compliant Data Ingestion</h4>
        </div>
        <span className="text-[11px] font-mono bg-accent-light text-accent px-2 py-0.5 rounded-full font-semibold border border-accent/20">
          Automated Pseudonymisation Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-ink2">
        <div className="p-2.5 bg-surface border border-border2 rounded-lg space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-ink">
            <FileSpreadsheet className="w-4 h-4 text-accent" /> CSV / TSV & Plain Text
          </div>
          <p className="text-ink3 leading-snug">
            PapaParse validated. Auto-detects Procedures, Fees, Doctor names, and SHA claim codes.
          </p>
        </div>

        <div className="p-2.5 bg-surface border border-border2 rounded-lg space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-ink">
            <Server className="w-4 h-4 text-accent" /> KenyaEMR / OpenMRS FHIR
          </div>
          <p className="text-ink3 leading-snug">
            Pull live HL7 FHIR R4 encounter bundles directly from local EHR servers.
          </p>
        </div>
      </div>

      {onLoadPreset && (
        <div className="pt-1 border-t border-border space-y-2">
          <div className="text-xs font-semibold text-ink2 flex items-center justify-between">
            <span>Quick Sample Datasets:</span>
            {currentDataLength ? (
              <span className="text-[11px] font-mono text-ink3">({currentDataLength.toLocaleString()} characters)</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onLoadPreset(PRIVATE_CLINIC_DATA);
                toast.success('Loaded Private Clinic Revenue Leakage dataset!');
              }}
              className="flex items-center gap-1.5 text-xs font-medium bg-surface hover:bg-surface3 border border-border2 hover:border-accent text-ink px-3 py-1.5 rounded-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Private Clinic Sample (Leakage)
            </button>

            <button
              type="button"
              onClick={() => {
                onLoadPreset(PUBLIC_FACILITY_CLINIC_DATA);
                toast.success('Loaded Public Facility SHA Claim dataset!');
              }}
              className="flex items-center gap-1.5 text-xs font-medium bg-surface hover:bg-surface3 border border-border2 hover:border-accent text-ink px-3 py-1.5 rounded-lg transition-all"
            >
              <Database className="w-3.5 h-3.5 text-accent" />
              Public Facility Sample (SHA/DHIS2)
            </button>

            <button
              type="button"
              onClick={handleFetchFhir}
              disabled={isFetchingFhir}
              className="flex items-center gap-1.5 text-xs font-medium bg-accent-light hover:bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-lg transition-all font-semibold disabled:opacity-50"
            >
              <Server className="w-3.5 h-3.5" />
              {isFetchingFhir ? 'Fetching FHIR R4 Bundle...' : 'Import OpenMRS Encounters'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataInputGuide;
