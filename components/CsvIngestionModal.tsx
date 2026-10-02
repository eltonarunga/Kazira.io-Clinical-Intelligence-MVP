import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Sparkles, 
  Check, 
  Copy, 
  X,
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import { 
  parseAndAnonymizeCSV, 
  convertCSVToDebtItems, 
  SAMPLE_THEATRE_CSV, 
  SAMPLE_SHA_CLAIMS_CSV, 
  SAMPLE_OUTPATIENT_CSV, 
  SAMPLE_BLANK_TEMPLATE_CSV,
  CSVParseResult 
} from '../utils/csvParser';
import { DebtItem } from '../types';

interface CsvIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestDebts: (items: DebtItem[]) => Promise<void> | void;
  onTriggerAudit?: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  isGuest?: boolean;
  facilityName?: string;
  facilityCode?: string;
}

export const CsvIngestionModal: React.FC<CsvIngestionModalProps> = ({
  isOpen,
  onClose,
  onIngestDebts,
  onTriggerAudit,
  onShowToast,
  isGuest = false,
  facilityName = 'Nairobi West Memorial Hospital',
  facilityCode = 'MFL #14920'
}) => {
  const [csvText, setCsvText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'templates'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triggerAiAudit, setTriggerAiAudit] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Real-time RFC 4180 parsing and KDPA pseudonymisation evaluation
  const parseResult: CSVParseResult | null = csvText.trim() 
    ? parseAndAnonymizeCSV(csvText) 
    : null;

  const convertedItems = parseResult?.allRows && parseResult.allRows.length > 0
    ? convertCSVToDebtItems(parseResult.allRows)
    : [];

  const totalDetectedKes = convertedItems.reduce((acc, curr) => acc + (curr.estimatedKes || 0), 0);

  const handleFileRead = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.tsv') && !file.name.endsWith('.txt')) {
      onShowToast('Unsupported File Type', 'Please upload a .csv, .tsv, or plain text export file.', 'warn');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCsvText(content);
        setActiveTab('paste');
        onShowToast('File Loaded', `Read ${file.name} successfully. Review parsed columns below.`, 'success');
      }
    };
    reader.onerror = () => {
      onShowToast('Read Error', 'Could not read the uploaded file.', 'warn');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDownloadTemplate = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Template Downloaded', `Saved ${filename} to your computer.`, 'info');
  };

  const handleCopyTemplate = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    setCopiedTemplate(label);
    setTimeout(() => setCopiedTemplate(null), 2500);
    onShowToast('Copied to Clipboard', `Sample ${label} copied.`, 'info');
  };

  const handleLoadSample = (sample: string, label: string) => {
    setCsvText(sample);
    setActiveTab('paste');
    onShowToast('Preset Loaded', `Loaded sample data for ${label}.`, 'info');
  };

  const handleCommitIngestion = async () => {
    if (convertedItems.length === 0) {
      onShowToast('No Records Found', 'Please provide valid CSV rows containing clinical or billing lines.', 'warn');
      return;
    }

    try {
      setIsSubmitting(true);
      await onIngestDebts(convertedItems);
      if (triggerAiAudit && onTriggerAudit) {
        onTriggerAudit();
      }
      onClose();
    } catch (err: any) {
      console.error('Ingestion error:', err);
      onShowToast('Ingestion Error', 'Failed to commit parsed records. Please check the format.', 'warn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 flex flex-col my-auto max-h-[92vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex items-start justify-between bg-surface-container-low/60 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-on-surface">
                  Manual CSV &amp; PMS Ingestion
                </h2>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed">
                  {facilityCode}
                </span>
                {isGuest && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Guest Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Ingest hospital encounters, theatre logs, and outpatient records into <strong className="text-on-surface">{facilityName}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* KDPA 2019 Sovereign Guarantee Bar */}
        <div className="px-4 sm:px-5 py-2 bg-emerald-50 border-b border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">
              <strong>KDPA 2019 Sovereign Ingestion:</strong> All patient names, phone numbers, and IDs are pseudonymised client-side before submission.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            SHA-256 Masked
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Ingestion Source Tabs */}
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'upload'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <UploadCloud size={14} />
                <span>Upload<span className="hidden sm:inline"> File (.csv / .tsv)</span></span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'paste'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <FileText size={14} />
                <span>Paste<span className="hidden sm:inline"> Raw Text / CSV</span></span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'templates'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Layers size={14} />
                <span>Templates<span className="hidden sm:inline"> &amp; Presets</span></span>
              </button>
            </div>

            {csvText.trim() && (
              <button
                type="button"
                onClick={() => setCsvText('')}
                className="text-xs text-on-surface-variant hover:text-red-700 flex items-center gap-1 cursor-pointer"
                title="Clear input"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* TAB 1: File Dropzone */}
          {activeTab === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-primary bg-primary/5 scale-[0.99]' 
                  : 'border-outline-variant/40 hover:border-primary/60 bg-surface-container-low/40 hover:bg-surface-container-low'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileRead(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <UploadCloud size={24} />
              </div>
              <h3 className="text-sm font-bold text-on-surface">
                Click to browse or drag and drop your clinical CSV
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                Supports standard comma-separated (.csv), tab-separated (.tsv), and plain text exports from KenyaEMR, Kranium, Funsoft, or Excel.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-on-surface-variant font-mono">
                <span>RFC 4180 Compliant</span>
                <span>•</span>
                <span>Max 10,000 Encounters per Batch</span>
              </div>
            </div>
          )}

          {/* TAB 2: Paste Raw Text / CSV */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>Paste comma-delimited or tab-separated text directly from your spreadsheet:</span>
                <span className="font-mono text-[11px]">{csvText.length} characters</span>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Patient ID,Encounter Date,Department,Attending Clinician,Procedure,Tariff Code,Fee (KES),Insurer,Billing Note&#10;PAT-8812,2026-09-14,Theatre,Dr. Kevin Omondi,Emergency C-Section Consumables,SURG-CS-02,45000,SHA,Disposable trocars omitted"
                rows={7}
                className="w-full p-3 font-mono text-xs bg-surface-container-lowest border border-outline-variant/30 rounded-lg focus:border-primary focus:outline-hidden text-on-surface leading-relaxed placeholder:text-outline-variant"
              />
            </div>
          )}

          {/* TAB 3: Sample Presets & Starter Template */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Preset 1: Theatre Consumables */}
                <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Theatre Log
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">8 rows</span>
                    </div>
                    <h4 className="text-xs font-bold text-on-surface mt-1.5">Theatre &amp; Surgical Packs</h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Surgical consumables, anesthesia packs, and omitted trocar kits.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/15">
                    <button
                      type="button"
                      onClick={() => handleLoadSample(SAMPLE_THEATRE_CSV, 'Theatre Consumables')}
                      className="flex-1 py-1 px-2 rounded bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Load Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(SAMPLE_THEATRE_CSV, 'Theatre Consumables')}
                      className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                      title="Copy CSV"
                    >
                      {copiedTemplate === 'Theatre Consumables' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Preset 2: SHA Claims */}
                <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        SHA Claims
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">6 rows</span>
                    </div>
                    <h4 className="text-xs font-bold text-on-surface mt-1.5">SHA National Tariffs</h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Missing pre-authorizations, biometric lags, and specialist consult gaps.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/15">
                    <button
                      type="button"
                      onClick={() => handleLoadSample(SAMPLE_SHA_CLAIMS_CSV, 'SHA Claims')}
                      className="flex-1 py-1 px-2 rounded bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Load Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(SAMPLE_SHA_CLAIMS_CSV, 'SHA Claims')}
                      className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                      title="Copy CSV"
                    >
                      {copiedTemplate === 'SHA Claims' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Preset 3: Outpatient */}
                <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                        Outpatient
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">5 rows</span>
                    </div>
                    <h4 className="text-xs font-bold text-on-surface mt-1.5">Outpatient &amp; Minor OR</h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Wound suturing, foreign body removals, and diagnostic ECG lines.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/15">
                    <button
                      type="button"
                      onClick={() => handleLoadSample(SAMPLE_OUTPATIENT_CSV, 'Outpatient')}
                      className="flex-1 py-1 px-2 rounded bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Load Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(SAMPLE_OUTPATIENT_CSV, 'Outpatient')}
                      className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                      title="Copy CSV"
                    >
                      {copiedTemplate === 'Outpatient' ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Download Starter Template */}
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Download size={16} className="text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-on-surface block">
                      Download Blank Kazira Ingestion Template (.csv)
                    </span>
                    <span className="text-on-surface-variant text-[11px]">
                      Pre-formatted headers for Patient ID, Date, Department, Doctor, Service, and KES Amount.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(SAMPLE_BLANK_TEMPLATE_CSV, 'Kazira_Ingestion_Template.csv')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant/30 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download size={13} />
                  <span>Download .csv</span>
                </button>
              </div>
            </div>
          )}

          {/* REAL-TIME CSV PARSER AUDIT & PREVIEW */}
          {parseResult && (
            <div className="space-y-3 pt-2 border-t border-outline-variant/20">
              
              {/* Parse Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant block font-medium">Valid Records</span>
                  <span className="text-lg font-bold text-on-surface font-mono">
                    {parseResult.rowCount} encounters
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant block font-medium">Data Quality Score</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-lg font-bold font-mono text-primary">
                      {parseResult.dataQualityScore}%
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      parseResult.dataQualityScore >= 80 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {parseResult.dataQualityScore >= 80 ? 'Optimal' : 'Needs Review'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant block font-medium">KDPA Pseudonymized</span>
                  <span className="text-lg font-bold text-emerald-800 font-mono">
                    {parseResult.anonymizedCount} tokens
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant block font-medium">Total Unbilled Value</span>
                  <span className="text-lg font-bold text-primary font-mono">
                    KES {totalDetectedKes.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Header Detection Pills */}
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/15 flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-[11px] font-bold text-on-surface-variant">Detected Columns:</span>
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  {parseResult.columnHeaders.map((header) => (
                    <span 
                      key={header}
                      className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono border border-outline-variant/20"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              {/* Warning box if any */}
              {parseResult.warnings.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Parsing Warnings:</span>
                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[11px]">
                      {parseResult.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tabular Ingestion Preview */}
              <div className="border border-outline-variant/30 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-on-surface">
                  <span>Standardized Record Preview ({Math.min(convertedItems.length, 5)} of {convertedItems.length})</span>
                  <span className="text-[10px] font-mono text-on-surface-variant">Ready for Ledger Insertion</span>
                </div>
                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-surface-container text-on-surface-variant font-medium sticky top-0">
                      <tr>
                        <th className="p-2 border-b border-outline-variant/20">Patient Ref</th>
                        <th className="p-2 border-b border-outline-variant/20">Department</th>
                        <th className="p-2 border-b border-outline-variant/20">Procedure</th>
                        <th className="p-2 border-b border-outline-variant/20">Attending Doctor</th>
                        <th className="p-2 border-b border-outline-variant/20 text-right">Fee (KES)</th>
                        <th className="p-2 border-b border-outline-variant/20">Insurer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15 font-mono text-[11px]">
                      {convertedItems.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="p-2 font-bold text-primary">{item.patientRef}</td>
                          <td className="p-2 capitalize font-sans">{item.department}</td>
                          <td className="p-2 font-sans font-medium text-on-surface">{item.procedureName}</td>
                          <td className="p-2 font-sans">{item.doctorName}</td>
                          <td className="p-2 text-right font-bold text-primary">
                            KES {item.estimatedKes.toLocaleString()}
                          </td>
                          <td className="p-2 font-sans">{item.insurer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optional: Trigger AI Audit on Commit */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={triggerAiAudit}
                    onChange={(e) => setTriggerAiAudit(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-on-surface block">
                      Trigger Dual-Loop Gemini AI Audit on Commit
                    </span>
                    <span className="text-on-surface-variant text-[11px]">
                      Runs arithmetic parity checks and categorizes revenue leakage immediately.
                    </span>
                  </div>
                </label>
                <Sparkles size={16} className="text-primary shrink-0 ml-2" />
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/20 bg-surface-container-low/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCommitIngestion}
            disabled={isSubmitting || convertedItems.length === 0}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Clock size={15} className="animate-spin" />
                <span>Ingesting into Sovereign Store...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>
                  Commit {convertedItems.length > 0 ? `${convertedItems.length} Records` : 'CSV Batch'} to Ledger
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CsvIngestionModal;
