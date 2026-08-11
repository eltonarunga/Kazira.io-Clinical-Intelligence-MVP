import React, { useState } from 'react';
import { 
  DebtItem, 
  RecoveryLogEntry, 
  BaselineConfig 
} from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  BarChart3, 
  Calendar, 
  Info,
  ShieldCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { exportRecoveryLogbookToCSV } from '../utils/exportCsv';

interface RecoveryLogbookProps {
  debts: DebtItem[];
  logEntries: RecoveryLogEntry[];
  baselineConfig: BaselineConfig;
  onUpdateBaselineConfig?: (updated: BaselineConfig) => void;
}

const RecoveryLogbook: React.FC<RecoveryLogbookProps> = ({
  debts,
  logEntries,
  baselineConfig,
  onUpdateBaselineConfig
}) => {
  const [filterAttribution, setFilterAttribution] = useState<'all' | 'kazira_flagged' | 'manually_identified'>('all');
  const [isEditingBaseline, setIsEditingBaseline] = useState(false);

  // Baseline Form State
  const [baselineWeeks, setBaselineWeeks] = useState(baselineConfig.baselineWeeks || 12);
  const [preLeakageRate, setPreLeakageRate] = useState(baselineConfig.preKaziraLeakageRateKes || 380000);
  const [startDate, setStartDate] = useState(baselineConfig.startDate || '2026-03-01');

  // Compute Logbook Entries dynamically from debts + historical log entries
  const allEntries: RecoveryLogEntry[] = [
    ...logEntries,
    ...debts.map((d) => ({
      id: `LOG-${d.id}`,
      debtItemId: d.id,
      patientRef: d.patientRef,
      procedureName: d.procedureName,
      detectedKes: d.estimatedKes,
      actionedKes: d.status !== 'pending' ? d.estimatedKes : 0,
      collectedKes: d.status === 'collected' ? (d.amountCollectedKes || d.estimatedKes) : 0,
      attribution: d.attribution,
      date: d.resolvedAt || d.datePerformed,
      status: d.status,
      invoiceRef: d.invoiceRef,
      resolutionNote: d.resolutionNote || (d.status === 'collected' ? 'Verified invoice payment' : '')
    }))
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i); // deduplicate by id

  // Filter entries
  const filteredEntries = allEntries.filter((e) => {
    if (filterAttribution === 'all') return true;
    return e.attribution === filterAttribution;
  });

  // Calculate Running Totals
  const totalDetected = filteredEntries.reduce((sum, e) => sum + e.detectedKes, 0);
  const totalActioned = filteredEntries.reduce((sum, e) => sum + e.actionedKes, 0);
  const totalCollected = filteredEntries.reduce((sum, e) => sum + e.collectedKes, 0);

  // Kazira-Attributed Recovery Total strictly
  const kaziraAttributedCollected = allEntries
    .filter((e) => e.attribution === 'kazira_flagged' && e.status === 'collected')
    .reduce((sum, e) => sum + e.collectedKes, 0);

  // Estimated Monthly Kazira Subscription Cost
  const estimatedPlatformFeeKes = 45000;
  const netRecoveryKes = Math.max(0, totalCollected - estimatedPlatformFeeKes);
  const roiMultiplier = totalCollected > 0 ? (totalCollected / estimatedPlatformFeeKes).toFixed(1) : '0';

  // Pre/Post Comparison Math
  const currentWeeklyLeakageKes = Math.max(0, preLeakageRate - (kaziraAttributedCollected / 4)); // weekly rate post Kazira
  const leakageReductionPct = preLeakageRate > 0 
    ? Math.round(((preLeakageRate - currentWeeklyLeakageKes) / preLeakageRate) * 100)
    : 0;

  const handleSaveBaseline = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BaselineConfig = {
      startDate,
      endDate: new Date().toISOString().split('T')[0],
      baselineWeeks: Number(baselineWeeks),
      preKaziraLeakageRateKes: Number(preLeakageRate)
    };
    if (onUpdateBaselineConfig) {
      onUpdateBaselineConfig(updated);
    }
    setIsEditingBaseline(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-accent" />
            Financial Recovery Logbook
          </h2>
          <p className="text-sm text-ink3 mt-1">
            Running totals of unbilled leakage detected, actioned, and collected since subscription start date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportRecoveryLogbookToCSV(filteredEntries, baselineConfig)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border2 hover:border-accent text-ink rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download size={15} className="text-accent" /> Export Logbook CSV
          </button>
        </div>
      </div>

      {/* THREE COLUMN RUNNING TOTALS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DETECTED */}
        <div className="bg-surface p-5 rounded-2xl border border-border2 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-ink3 uppercase tracking-wider">
            <span>1. Detected Revenue Leakage</span>
            <span className="p-1 bg-amber-50 text-amber-700 rounded-lg">
              <Info size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-ink">
            KES {totalDetected.toLocaleString()}
          </p>
          <p className="text-xs text-ink3">Total value of all unbilled gaps identified</p>
        </div>

        {/* ACTIONED */}
        <div className="bg-surface p-5 rounded-2xl border border-border2 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-ink3 uppercase tracking-wider">
            <span>2. Actioned & Escalated</span>
            <span className="p-1 bg-blue-50 text-blue-700 rounded-lg">
              <BarChart3 size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-ink">
            KES {totalActioned.toLocaleString()}
          </p>
          <p className="text-xs text-ink3">Invoices issued or claims resubmitted</p>
        </div>

        {/* COLLECTED */}
        <div className="bg-surface p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <span>3. Verified Collected Funds</span>
            <span className="p-1 bg-emerald-100 text-emerald-800 rounded-lg">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold font-mono text-emerald-800">
            KES {totalCollected.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold pt-1">
            <span>Kazira Attributed:</span>
            <span className="font-mono font-bold">KES {kaziraAttributedCollected.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* NET RECOVERY & ROI LINE (ROBUST PROOF FOR CLINIC OWNER AT MONTH 3) */}
      <div className="bg-gradient-to-r from-accent/10 via-surface to-accent/10 p-5 rounded-2xl border border-accent/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-accent text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              Net ROI Proof Line
            </span>
            <span className="text-xs font-bold text-ink3">Subscription Since: {baselineConfig.startDate}</span>
          </div>
          <h3 className="text-xl font-bold text-ink font-serif flex items-center gap-2">
            Net Value Recovered: <span className="font-mono text-accent">KES {netRecoveryKes.toLocaleString()}</span>
          </h3>
          <p className="text-xs text-ink3">
            Calculated as Collected Revenue (KES {totalCollected.toLocaleString()}) minus Platform Operating Cost (KES {estimatedPlatformFeeKes.toLocaleString()}).
          </p>
        </div>

        <div className="text-right bg-surface p-3.5 rounded-xl border border-border2 min-w-[200px] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink3">Demonstrated ROI</div>
          <div className="text-3xl font-mono font-black text-emerald-600 flex items-center justify-end gap-1">
            <TrendingUp size={24} /> {roiMultiplier}x
          </div>
          <div className="text-[11px] text-ink3 font-medium">Return on Kazira Platform</div>
        </div>
      </div>

      {/* ATTRIBUTION & BASELINE COMPARISON PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Period Comparison Card */}
        <div className="bg-surface p-5 rounded-2xl border border-border2 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-accent" size={18} />
              <h3 className="font-bold text-ink text-sm font-serif">Pre/Post Baseline Comparison</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingBaseline(!isEditingBaseline)}
              className="text-xs text-accent font-bold hover:underline"
            >
              {isEditingBaseline ? 'Close' : 'Configure Baseline'}
            </button>
          </div>

          {isEditingBaseline ? (
            <form onSubmit={handleSaveBaseline} className="space-y-3 bg-surface2 p-3.5 rounded-xl border border-border2">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Baseline Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1 bg-surface border border-border2 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Baseline Comparison Duration (Weeks)</label>
                <input
                  type="number"
                  value={baselineWeeks}
                  onChange={(e) => setBaselineWeeks(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-surface border border-border2 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Pre-Kazira Est. Weekly Leakage (KES)</label>
                <input
                  type="number"
                  value={preLeakageRate}
                  onChange={(e) => setPreLeakageRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-surface border border-border2 rounded text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-accent text-white text-xs font-bold rounded hover:bg-accent2"
              >
                Save Baseline Period
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border2">
                <span className="text-ink3">Baseline Comparison Period:</span>
                <span className="font-bold font-mono text-ink">{baselineConfig.baselineWeeks} Weeks Pre-Kazira</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border2">
                <span className="text-ink3">Pre-Kazira Weekly Leakage Rate:</span>
                <span className="font-bold font-mono text-rose-600">KES {baselineConfig.preKaziraLeakageRateKes?.toLocaleString()} / wk</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border2">
                <span className="text-ink3">Current Est. Weekly Leakage Rate:</span>
                <span className="font-bold font-mono text-emerald-600">KES {Math.round(currentWeeklyLeakageKes).toLocaleString()} / wk</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-ink3 font-semibold">Unbilled Leakage Reduction:</span>
                <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  -{leakageReductionPct}% Lower
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Strict Attribution Rules Card */}
        <div className="bg-surface p-5 rounded-2xl border border-border2 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck className="text-accent" size={18} />
            <h3 className="font-bold text-ink text-sm font-serif">Attribution & Verification Rules</h3>
          </div>
          <div className="space-y-2.5 text-xs text-ink2 leading-relaxed">
            <div className="p-2.5 bg-accent-light/50 border border-accent/20 rounded-xl space-y-1">
              <span className="font-bold text-accent inline-flex items-center gap-1">
                <Sparkles size={12} /> kazira_flagged (Auto-Detected)
              </span>
              <p className="text-[11px] text-ink3">
                Flags generated directly by Kazira audit engine. Only these items count toward Kazira-attributed recovery totals.
              </p>
            </div>

            <div className="p-2.5 bg-surface2 border border-border2 rounded-xl space-y-1">
              <span className="font-bold text-ink3 inline-flex items-center gap-1">
                <Building2 size={12} /> manually_identified (Self-Logged)
              </span>
              <p className="text-[11px] text-ink3">
                Items logged manually by clinic administrators. Kept in the recovery logbook for complete record keeping but excluded from Kazira attribution totals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & LOGBOOK TABLE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-bold text-ink font-serif text-lg">Logbook Entries</h3>

          <div className="flex items-center gap-2 bg-surface2 p-1 rounded-xl border border-border2 text-xs">
            <button
              type="button"
              onClick={() => setFilterAttribution('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterAttribution === 'all' ? 'bg-surface text-ink shadow-sm' : 'text-ink3 hover:text-ink'
              }`}
            >
              All Sources
            </button>
            <button
              type="button"
              onClick={() => setFilterAttribution('kazira_flagged')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterAttribution === 'kazira_flagged' ? 'bg-accent text-white shadow-sm' : 'text-ink3 hover:text-ink'
              }`}
            >
              Kazira Flagged Only
            </button>
            <button
              type="button"
              onClick={() => setFilterAttribution('manually_identified')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterAttribution === 'manually_identified' ? 'bg-surface text-ink shadow-sm' : 'text-ink3 hover:text-ink'
              }`}
            >
              Manual Logs
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border2 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface2/80 text-ink3 uppercase font-bold text-[10px] tracking-wider border-b border-border2">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Patient Ref</th>
                  <th className="px-4 py-3">Procedure / Service</th>
                  <th className="px-4 py-3">Detected (KES)</th>
                  <th className="px-4 py-3">Actioned (KES)</th>
                  <th className="px-4 py-3">Collected (KES)</th>
                  <th className="px-4 py-3">Attribution</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Invoice Ref / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border2">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-ink3 italic">
                      No recovery entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-surface2/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-ink whitespace-nowrap">
                        {entry.date}
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-ink">
                        {entry.patientRef}
                      </td>

                      <td className="px-4 py-3 font-semibold text-ink max-w-[220px]">
                        {entry.procedureName}
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-amber-700 whitespace-nowrap">
                        KES {entry.detectedKes.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        KES {entry.actionedKes.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-emerald-700 whitespace-nowrap">
                        KES {entry.collectedKes.toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        {entry.attribution === 'kazira_flagged' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-light text-accent rounded-full text-[10px] font-bold">
                            <Sparkles size={10} /> Kazira
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface2 text-ink3 rounded-full text-[10px] font-bold">
                            Manual
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          entry.status === 'collected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          entry.status === 'dismissed' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                          entry.status === 'escalated' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {entry.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-ink2 text-[11px] max-w-[200px] truncate">
                        {entry.invoiceRef && <span className="font-mono font-bold text-emerald-700 mr-1.5">[{entry.invoiceRef}]</span>}
                        {entry.resolutionNote || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryLogbook;
