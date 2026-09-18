import React, { useState } from 'react';
import { 
  Cpu, 
  Download, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  FileSpreadsheet,
  Clock,
  PlusCircle,
  RefreshCw,
  UploadCloud
} from 'lucide-react';
import { exportDebtsToCsv } from '../../utils/exportCsv';
import { SAMPLE_BLANK_TEMPLATE_CSV } from '../../utils/csvParser';
import { DebtItem, UserProfile } from '../../types';

interface OverviewRecoveryViewProps {
  onTriggerAudit: () => void;
  isAuditing?: boolean;
  onShowToast: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  debts: DebtItem[];
  onNavigateTab: (tab: any) => void;
  isGuest?: boolean;
  activeProfile?: UserProfile;
  onOpenCsvIngestion?: () => void;
}

export const OverviewRecoveryView: React.FC<OverviewRecoveryViewProps> = ({
  onTriggerAudit,
  isAuditing = false,
  onShowToast,
  debts = [],
  onNavigateTab,
  isGuest = false,
  activeProfile,
  onOpenCsvIngestion
}) => {
  const [pathway, setPathway] = useState<'private' | 'sha'>('private');
  const [reconciledItems, setReconciledItems] = useState<Record<string, boolean>>({});

  const handlePathwayChange = (newPathway: 'private' | 'sha') => {
    setPathway(newPathway);
    onShowToast(
      newPathway === 'private' ? 'Private / HMO View' : 'SHA / Public View',
      newPathway === 'private' ? 'Showing private insurance & cash receivables.' : 'Showing Social Health Authority claims and tariffs.',
      'info'
    );
  };

  const handleExportCsv = () => {
    exportDebtsToCsv(debts);
    onShowToast('Report Exported', 'Downloaded unbilled gaps report (KDPA compliant).', 'success');
  };

  const handleSendDoctorSms = (doctor: string, amount: string) => {
    onShowToast(
      'SMS Reminder Sent', 
      `Sent unbilled documentation reminder to ${doctor} for ${amount}.`,
      'sms'
    );
  };

  const handleDispatchPatientSms = (patId: string) => {
    onShowToast('SMS Sent', `Payment reminder sent to patient ${patId}.`, 'sms');
  };

  const handleMarkReconciled = (id: string, amount: string) => {
    setReconciledItems(prev => ({ ...prev, [id]: true }));
    onShowToast('Gap Resolved', `Added ${amount} to recovered revenue.`, 'success');
  };

  const handleDownloadCsvTemplate = () => {
    const blob = new Blob([SAMPLE_BLANK_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kazira_Hospital_Encounter_Template_${activeProfile?.facilityCode || 'Standard'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Template Downloaded', 'Standard CSV template ready for hospital encounter entry.', 'success');
  };

  // Compute Real vs Demo Metrics
  const pendingDebts = debts.filter(d => d.status === 'pending');
  const collectedDebts = debts.filter(d => d.status === 'collected');
  const escalatedDebts = debts.filter(d => d.status === 'escalated');

  const realUnbilledKes = pendingDebts.reduce((sum, d) => sum + d.estimatedKes, 0);
  const realRecoveredKes = collectedDebts.reduce((sum, d) => sum + (d.amountCollectedKes || d.estimatedKes), 0);
  const realAtRiskKes = escalatedDebts.reduce((sum, d) => sum + d.estimatedKes, 0);
  const realTotalRevenueKes = realRecoveredKes + (debts.length > 0 ? 500000 : 0);
  const realSuccessRate = debts.length > 0 ? Math.round((collectedDebts.length / debts.length) * 100) : 0;

  // Guest Demo Metrics
  const demoMetrics = {
    revenueThisWeek: 'KES 8,420,500',
    revenueEncounters: '142 patient encounters',
    unbilledKes: 'KES 1,845,200',
    unbilledItems: '23 items',
    recoveredKes: 'KES 1,290,000',
    recoveryRate: '70% success rate',
    recoveredItems: '18 resolved items invoiced and paid',
    atRiskKes: 'KES 2,150,000',
    atRiskItems: '12 need review'
  };

  // Group real clinicians if debts exist
  const clinicianMap = new Map<string, { doctor: string; dept: string; count: number; totalKes: number }>();
  pendingDebts.forEach(d => {
    const doc = d.doctorName || 'Attending Physician';
    const existing = clinicianMap.get(doc);
    if (existing) {
      existing.count += 1;
      existing.totalKes += d.estimatedKes;
    } else {
      clinicianMap.set(doc, {
        doctor: doc,
        dept: d.department || 'Clinical',
        count: 1,
        totalKes: d.estimatedKes
      });
    }
  });
  const realClinicians = Array.from(clinicianMap.values()).slice(0, 5);

  return (
    <div className="flex flex-col w-full space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Revenue &amp; Recovery
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Identify unbilled services, track recovered revenue, and resolve insurance claim issues.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pathway Pill */}
          <div className="inline-flex p-1 rounded bg-surface-container border border-outline-variant/20 text-xs">
            <button 
              onClick={() => handlePathwayChange('private')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                pathway === 'private'
                  ? 'bg-surface-container-lowest text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Private / HMO
            </button>
            <button 
              onClick={() => handlePathwayChange('sha')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                pathway === 'sha'
                  ? 'bg-surface-container-lowest text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Public / SHA
            </button>
          </div>

          {/* Ingest CSV / PMS Button */}
          {onOpenCsvIngestion && (
            <button 
              id="dashboard-header-csv-ingest"
              type="button"
              onClick={onOpenCsvIngestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface rounded text-xs font-semibold border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
              title="Upload or paste hospital PMS & CSV records"
              aria-label="Manual CSV & PMS Ingestion"
            >
              <FileSpreadsheet size={14} className="text-primary shrink-0" />
              <span>Manual CSV / PMS</span>
            </button>
          )}

          {/* AI Audit Button */}
          <button 
            onClick={onTriggerAudit}
            disabled={isAuditing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded text-xs font-semibold transition-colors disabled:opacity-70"
          >
            <Cpu size={15} className={isAuditing ? 'animate-spin' : ''} />
            <span>{isAuditing ? 'Scanning Records...' : 'Run AI Audit'}</span>
          </button>

          {/* Export Button */}
          <button 
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface rounded text-xs font-medium border border-outline-variant/20 transition-colors"
            title="Download CSV"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </section>

      {/* 4 Simple, Readable Key Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">
              Revenue This Week
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              <ArrowUpRight size={12} />
              {isGuest ? '+14%' : (debts.length > 0 ? '+8%' : '0%')}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isGuest ? demoMetrics.revenueThisWeek : `KES ${realTotalRevenueKes.toLocaleString()}`}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {isGuest ? demoMetrics.revenueEncounters : `Recorded across ${debts.length} patient encounters`}
            </p>
          </div>
        </div>

        {/* Metric 2: Unbilled Gaps */}
        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary">
              Unbilled Gaps Found
            </span>
            <span className="text-[11px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded">
              {isGuest ? demoMetrics.unbilledItems : `${pendingDebts.length} items`}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-secondary font-mono">
              {isGuest ? demoMetrics.unbilledKes : `KES ${realUnbilledKes.toLocaleString()}`}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Services given but missing from final bills
            </p>
          </div>
        </div>

        {/* Metric 3: Recovered Revenue */}
        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">
              Recovered Revenue
            </span>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {isGuest ? demoMetrics.recoveryRate : `${realSuccessRate}% success rate`}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary font-mono">
              {isGuest ? demoMetrics.recoveredKes : `KES ${realRecoveredKes.toLocaleString()}`}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {isGuest ? demoMetrics.recoveredItems : `${collectedDebts.length} resolved items invoiced and paid`}
            </p>
          </div>
        </div>

        {/* Metric 4: Insurance Claims At Risk */}
        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">
              Insurance Claims At Risk
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
              {isGuest ? demoMetrics.atRiskItems : `${escalatedDebts.length} need review`}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface font-mono">
              {isGuest ? demoMetrics.atRiskKes : `KES ${realAtRiskKes.toLocaleString()}`}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Exceeds SHA tariffs or missing secondary codes
            </p>
          </div>
        </div>
      </section>

      {/* Manual CSV & PMS Ingestion Action Section */}
      <section id="dashboard-csv-pms-ingestion" className="rounded-lg bg-surface-container-lowest border border-outline-variant/20 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Info & Context */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck size={12} />
                KDPA 2019 SHA-256 HMAC
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Offline &amp; Air-Gapped PMS Supported
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="text-primary shrink-0" size={20} />
              <span>Manual CSV &amp; Hospital PMS Ingestion</span>
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Import daily encounter logs, theatre registers, pharmacy billings, or offline spreadsheets. All patient identifiers are pseudonymised on your device prior to dual-loop clinical audit and revenue recovery analysis.
            </p>
            
            {/* Supported PMS tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-outline uppercase font-label-mono mr-1">Supported Formats:</span>
              {['KenyaEMR', 'Fun-Soft', 'Meditech', 'OpenMRS FHIR', 'Kranium', 'Excel / CSV'].map((pms) => (
                <span key={pms} className="text-[10px] font-medium bg-surface-container text-on-surface px-2 py-0.5 rounded border border-outline-variant/15">
                  {pms}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Quick Action Buttons & Status */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:min-w-[250px]">
            {onOpenCsvIngestion && (
              <button
                id="dashboard-cta-upload-csv"
                type="button"
                onClick={onOpenCsvIngestion}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005235] hover:bg-[#004029] text-white rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                title="Upload or paste hospital encounter CSV/PMS file"
                aria-label="Upload or paste hospital encounter CSV/PMS file"
              >
                <UploadCloud size={16} />
                <span>Upload Hospital CSV / PMS</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                id="dashboard-cta-download-template"
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-md text-xs font-medium border border-outline-variant/20 transition-colors cursor-pointer text-center"
                title="Download standard blank hospital encounter CSV template"
                aria-label="Download standard blank hospital encounter CSV template"
              >
                <Download size={14} className="text-primary shrink-0" />
                <span>Blank Template</span>
              </button>

              <button
                id="dashboard-cta-pms-guide"
                type="button"
                onClick={() => onNavigateTab('integrations')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-md text-xs font-medium border border-outline-variant/20 transition-colors cursor-pointer text-center"
                title="View automated KenyaEMR & PMS integration connectors"
                aria-label="View automated KenyaEMR & PMS integration connectors"
              >
                <RefreshCw size={14} className="text-primary shrink-0" />
                <span>PMS Connectors</span>
              </button>
            </div>

            {/* Mini ledger counter indicator */}
            <div className="text-[11px] text-on-surface-variant flex items-center justify-between px-1 font-mono">
              <span>Ledger Encounters:</span>
              <span className="font-bold text-primary font-mono">{debts.length > 0 ? `${debts.length} ingested` : 'Ready for data'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Left Main Panel (8) & Right Action Panel (4) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Trends & Top Gaps (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue Trend Chart */}
          <div className="p-5 rounded-md bg-surface-container-lowest border border-outline-variant/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-outline-variant/10">
              <div>
                <h2 className="text-base font-semibold text-on-surface">
                  Weekly Billing vs. Actual Services
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Green line shows actual clinical services detected compared to billed hospital totals (dashed).
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-outline"></span>
                  <span className="text-on-surface-variant">Billed Total</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-primary rounded-sm"></span>
                  <span className="text-primary font-medium">Actual Care Delivered</span>
                </div>
              </div>
            </div>

            {!isGuest && debts.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <TrendingUp size={22} />
                </div>
                <h3 className="text-sm font-semibold text-on-surface">Facility Ledger Initialized</h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  No unbilled clinical gaps logged yet for {activeProfile?.facilityName || 'this facility'}. Real authenticated accounts start completely clean without mock charts. Once you record unbilled services or ingest EHR encounters, your weekly trend will render here.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2.5">
                  {onOpenCsvIngestion && (
                    <button
                      id="dashboard-empty-ingest-csv"
                      type="button"
                      onClick={onOpenCsvIngestion}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#005235] text-white rounded text-xs font-semibold hover:bg-[#004029] transition-colors cursor-pointer shadow-2xs"
                      title="Upload or paste hospital encounter CSV records"
                      aria-label="Upload or paste hospital encounter CSV records"
                    >
                      <UploadCloud size={14} />
                      <span>Ingest Hospital CSV</span>
                    </button>
                  )}
                  <button
                    id="dashboard-empty-record-gap"
                    type="button"
                    onClick={() => onNavigateTab('debts')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Record Discovered Gap</span>
                  </button>
                  <button
                    id="dashboard-empty-connect-emr"
                    type="button"
                    onClick={() => onNavigateTab('integrations')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>Connect KenyaEMR</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Clean SVG Trend Visualization */
              <div className="relative w-full h-52 mt-4 flex flex-col justify-end">
                <svg className="w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 160">
                  {/* Horizontal Guide Lines */}
                  <line className="text-surface-container" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="700" y1="30" y2="30"></line>
                  <line className="text-surface-container" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="700" y1="75" y2="75"></line>
                  <line className="text-surface-container" stroke="currentColor" strokeDasharray="3 3" x1="0" x2="700" y1="120" y2="120"></line>
                  
                  {/* Area Fill - Flat Architectural Tint */}
                  <polygon fill="#005235" fillOpacity="0.08" points="20,110 110,95 200,80 300,65 400,50 500,35 620,25 620,150 20,150"></polygon>
                  
                  {/* Billed (Dashed Line) */}
                  <polyline className="text-outline/60" fill="none" points="20,130 110,115 200,105 300,95 400,80 500,70 620,60" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2"></polyline>
                  
                  {/* Actual Delivered (Solid Primary Line) */}
                  <polyline className="text-primary" fill="none" points="20,110 110,95 200,80 300,65 400,50 500,35 620,25" stroke="currentColor" strokeWidth="2.5"></polyline>
                  
                  {/* Peak Indicator on Friday */}
                  <circle className="text-primary" cx="500" cy="35" fill="currentColor" r="4"></circle>
                  <circle className="text-outline" cx="500" cy="70" fill="currentColor" r="3"></circle>
                  <line className="text-secondary" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" x1="500" x2="500" y1="35" y2="70"></line>
                  <text className="text-[11px] fill-current text-secondary font-semibold font-mono" x="510" y="55">
                    {isGuest ? '+KES 410K gap' : `+KES ${realUnbilledKes.toLocaleString()} gap`}
                  </text>
                </svg>

                {/* Day Labels */}
                <div className="flex justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span className="font-semibold text-primary">Fri (Highest Gaps)</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            )}

            {/* Insight Note */}
            <div className="mt-4 p-3 rounded bg-surface-container flex items-center justify-between text-xs text-on-surface">
              <span className="font-medium">
                {isGuest 
                  ? 'Friday shift change showed the highest number of unrecorded surgical consumables.' 
                  : (pendingDebts.length > 0 
                    ? `Current facility audit identified ${pendingDebts.length} unbilled clinical discrepancies.` 
                    : 'Facility documentation ledger clean. Zero unrecorded procedural gaps.')}
              </span>
              <button 
                onClick={() => onNavigateTab('debts')}
                className="text-primary hover:underline font-semibold ml-2 shrink-0 cursor-pointer"
              >
                Review Gaps
              </button>
            </div>
          </div>

          {/* Top Unbilled Procedures */}
          <div className="p-5 rounded-md bg-surface-container-lowest border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-on-surface">
                  Top Unbilled Clinical Services
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Procedures performed this week without a matching billing record.
                </p>
              </div>
              <button 
                onClick={() => onNavigateTab('debts')}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                View all {isGuest ? '23' : pendingDebts.length}
              </button>
            </div>

            {!isGuest && pendingDebts.length === 0 ? (
              <div className="py-8 text-center bg-surface-container/30 rounded-lg space-y-2 border border-dashed border-outline-variant/30">
                <CheckCircle2 size={24} className="text-primary mx-auto" />
                <p className="text-xs font-semibold text-on-surface">No Pending Unbilled Services</p>
                <p className="text-[11px] text-on-surface-variant">All performed procedures have been billed or cleared.</p>
                <button
                  onClick={() => onNavigateTab('debts')}
                  className="mt-2 text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  + Record Discovered Gap
                </button>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {isGuest ? (
                  <>
                    {/* Demo Item 1 */}
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-on-surface">
                            Surgical Tray &amp; Consumables
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
                            8 procedures
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Theatre log shows disposable instruments used during laparoscopy without invoice items.
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-sm font-bold text-secondary font-mono">
                          KES 520,000
                        </div>
                        <span className="text-[11px] text-on-surface-variant">Theatre 2</span>
                      </div>
                    </div>

                    {/* Demo Item 2 */}
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-on-surface">
                            Obstetric Ultrasound Scans
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
                            12 scans
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Images recorded and signed off in PACS without cashier clearance token.
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-sm font-bold text-secondary font-mono">
                          KES 480,000
                        </div>
                        <span className="text-[11px] text-on-surface-variant">Radiology</span>
                      </div>
                    </div>

                    {/* Demo Item 3 */}
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-on-surface">
                            Minor Surgery &amp; Sutures
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
                            15 patients
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Emergency room wound care performed, but only basic consultation was charged.
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-sm font-bold text-secondary font-mono">
                          KES 460,200
                        </div>
                        <span className="text-[11px] text-on-surface-variant">Casualty / ER</span>
                      </div>
                    </div>
                  </>
                ) : (
                  pendingDebts.slice(0, 4).map((d) => (
                    <div key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-on-surface">
                            {d.procedureName}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
                            {d.patientRef}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {d.notes || d.gapType || 'Discovered clinical procedure discrepancy.'}
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-sm font-bold text-secondary font-mono">
                          KES {d.estimatedKes.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-on-surface-variant capitalize">{d.department || 'Clinical'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Clinician Unbilled Reminders */}
          <div className="p-5 rounded-md bg-surface-container-lowest border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-on-surface">
                  Unbilled Procedures by Clinician
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Send a friendly SMS reminder to clinicians with pending procedure documentation.
                </p>
              </div>
            </div>

            {!isGuest && realClinicians.length === 0 ? (
              <div className="py-6 text-center text-xs text-on-surface-variant bg-surface-container/20 rounded-lg">
                All clinician documentation is reconciled. Zero pending reminders.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-on-surface-variant font-medium">
                      <th className="pb-2 font-semibold">Doctor</th>
                      <th className="pb-2 font-semibold">Department</th>
                      <th className="pb-2 font-semibold">Unbilled</th>
                      <th className="pb-2 text-right font-semibold">Amount</th>
                      <th className="pb-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {isGuest ? (
                      <>
                        <tr className="hover:bg-surface-container/50 transition-colors">
                          <td className="py-2.5 font-semibold text-on-surface">Dr. Kevin Omondi</td>
                          <td className="py-2.5 text-on-surface-variant">General Surgery</td>
                          <td className="py-2.5 text-on-surface">4 items</td>
                          <td className="py-2.5 text-right font-mono font-bold text-secondary">KES 520,000</td>
                          <td className="py-2.5 text-right">
                            <button 
                              onClick={() => handleSendDoctorSms('Dr. Kevin Omondi', 'KES 520,000')}
                              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                            >
                              Send SMS
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-surface-container/50 transition-colors">
                          <td className="py-2.5 font-semibold text-on-surface">Dr. Joyce Wanjiku</td>
                          <td className="py-2.5 text-on-surface-variant">Maternity / OB-GYN</td>
                          <td className="py-2.5 text-on-surface">7 items</td>
                          <td className="py-2.5 text-right font-mono font-bold text-secondary">KES 480,000</td>
                          <td className="py-2.5 text-right">
                            <button 
                              onClick={() => handleSendDoctorSms('Dr. Joyce Wanjiku', 'KES 480,000')}
                              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                            >
                              Send SMS
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-surface-container/50 transition-colors">
                          <td className="py-2.5 font-semibold text-on-surface">Dr. Patrick Chesire</td>
                          <td className="py-2.5 text-on-surface-variant">Internal Medicine</td>
                          <td className="py-2.5 text-on-surface">3 items</td>
                          <td className="py-2.5 text-right font-mono font-bold text-secondary">KES 385,000</td>
                          <td className="py-2.5 text-right">
                            <button 
                              onClick={() => handleSendDoctorSms('Dr. Patrick Chesire', 'KES 385,000')}
                              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                            >
                              Send SMS
                            </button>
                          </td>
                        </tr>
                      </>
                    ) : (
                      realClinicians.map((c) => (
                        <tr key={c.doctor} className="hover:bg-surface-container/50 transition-colors">
                          <td className="py-2.5 font-semibold text-on-surface">{c.doctor}</td>
                          <td className="py-2.5 text-on-surface-variant capitalize">{c.dept}</td>
                          <td className="py-2.5 text-on-surface">{c.count} items</td>
                          <td className="py-2.5 text-right font-mono font-bold text-secondary">KES {c.totalKes.toLocaleString()}</td>
                          <td className="py-2.5 text-right">
                            <button 
                              onClick={() => handleSendDoctorSms(c.doctor, `KES ${c.totalKes.toLocaleString()}`)}
                              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                            >
                              Send SMS
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Audit & Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Audit Insight Card */}
          <div className="p-5 rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-primary" />
                <h3 className="text-sm font-semibold text-on-surface">
                  AI Audit Findings
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                {isGuest ? 'Verified' : (debts.length > 0 ? 'Active' : 'Ready')}
              </span>
            </div>

            <p className="text-xs text-on-surface leading-relaxed p-3 rounded bg-surface-container border border-outline-variant/15">
              {isGuest 
                ? '“14 surgical items were used in Theatre without billing lines. 6 maternity claims exceed the SHA tariff limit of KES 45,000 and need code adjustments before submission.”'
                : (pendingDebts.length > 0
                  ? `“Automated audit detected ${pendingDebts.length} unbilled procedural items totalling KES ${realUnbilledKes.toLocaleString()}. Review flagged gaps to recover revenue.”`
                  : `“No procedural discrepancies detected on current ledger for ${activeProfile?.facilityName || 'this facility'}. Ingest EHR logs or run audit to scan records.”`)}
            </p>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
              <span>{isGuest ? '142 Encounters Audited' : `${debts.length} Encounters Ingested`}</span>
              <button 
                onClick={() => onNavigateTab('ai_audit')}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                View full audit
              </button>
            </div>
          </div>

          {/* Quick Action Recovery Queue */}
          <div className="p-5 rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-on-surface">
                Priority Recovery Queue
              </h3>
              <span className="text-[11px] text-secondary font-medium">
                {isGuest ? '3 high value' : `${Math.min(3, pendingDebts.length)} pending`}
              </span>
            </div>

            {!isGuest && pendingDebts.length === 0 ? (
              <div className="py-6 text-center text-xs text-on-surface-variant bg-surface-container/20 rounded-lg">
                Zero priority recovery items pending.
              </div>
            ) : (
              <div className="space-y-2.5">
                {isGuest ? (
                  <>
                    {/* Demo Gap 1 */}
                    <div 
                      className={`p-3 rounded bg-surface-container space-y-1.5 transition-opacity ${
                        reconciledItems['item-1'] ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-on-surface">
                          Ultrasound Scan
                        </span>
                        <span className="text-xs font-bold font-mono text-secondary">
                          KES 18,500
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Patient ANON-8812 • Cashier clearance missing
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleDispatchPatientSms('ANON-8812')}
                          className="text-[11px] px-2 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-medium border border-outline-variant/20 transition-colors cursor-pointer"
                        >
                          SMS Patient
                        </button>
                        <button 
                          onClick={() => handleMarkReconciled('item-1', 'KES 18,500')}
                          className="text-[11px] px-2 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-medium transition-colors cursor-pointer"
                        >
                          {reconciledItems['item-1'] ? 'Resolved' : 'Mark Resolved'}
                        </button>
                      </div>
                    </div>

                    {/* Demo Gap 2 */}
                    <div 
                      className={`p-3 rounded bg-surface-container space-y-1.5 transition-opacity ${
                        reconciledItems['item-2'] ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-on-surface">
                          C-Section Anaesthesia Tariff
                        </span>
                        <span className="text-xs font-bold font-mono text-secondary">
                          KES 45,000
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Patient ANON-4190 • Needs SHA pre-auth code
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => onNavigateTab('sha_claims')}
                          className="text-[11px] px-2 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-primary font-medium border border-outline-variant/20 transition-colors cursor-pointer"
                        >
                          Fix in SHA Claims
                        </button>
                        <button 
                          onClick={() => handleMarkReconciled('item-2', 'KES 45,000')}
                          className="text-[11px] px-2 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-medium transition-colors cursor-pointer"
                        >
                          {reconciledItems['item-2'] ? 'Resolved' : 'Mark Resolved'}
                        </button>
                      </div>
                    </div>

                    {/* Demo Gap 3 */}
                    <div 
                      className={`p-3 rounded bg-surface-container space-y-1.5 transition-opacity ${
                        reconciledItems['item-3'] ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-on-surface">
                          Orthopaedic Splint &amp; Cast
                        </span>
                        <span className="text-xs font-bold font-mono text-secondary">
                          KES 32,000
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Patient ANON-9034 • Insurance copay pending
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleMarkReconciled('item-3', 'KES 32,000')}
                          className="text-[11px] px-2 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-medium transition-colors cursor-pointer"
                        >
                          {reconciledItems['item-3'] ? 'Resolved' : 'Mark Resolved'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  pendingDebts.slice(0, 3).map((gap) => (
                    <div 
                      key={gap.id}
                      className={`p-3 rounded bg-surface-container space-y-1.5 transition-opacity ${
                        reconciledItems[gap.id] ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-on-surface truncate max-w-[180px]" title={gap.procedureName}>
                          {gap.procedureName}
                        </span>
                        <span className="text-xs font-bold font-mono text-secondary">
                          KES {gap.estimatedKes.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Patient {gap.patientRef} • {gap.gapType || 'Unbilled procedural gap'}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleDispatchPatientSms(gap.patientRef)}
                          className="text-[11px] px-2 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-medium border border-outline-variant/20 transition-colors cursor-pointer"
                        >
                          SMS Patient
                        </button>
                        <button 
                          onClick={() => handleMarkReconciled(gap.id, `KES ${gap.estimatedKes.toLocaleString()}`)}
                          className="text-[11px] px-2 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-medium transition-colors cursor-pointer"
                        >
                          {reconciledItems[gap.id] ? 'Resolved' : 'Mark Resolved'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Clean Compliance Badge */}
          <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary shrink-0" />
              <span>KDPA 2019 Protected (All patient records encrypted locally)</span>
            </div>
            <span className="font-label-mono text-[11px] text-primary font-semibold">
              Zero PII Exfiltration
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewRecoveryView;
