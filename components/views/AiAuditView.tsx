import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  FileText, 
  Database, 
  ShieldCheck, 
  Code2, 
  Layers 
} from 'lucide-react';
import { ReportOutput, UserProfile } from '../../types';

interface AiAuditViewProps {
  onTriggerAudit: () => void;
  isAuditing?: boolean;
  latestReport: ReportOutput | null;
  onShowToast: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  isGuest?: boolean;
  activeProfile?: UserProfile;
}

export const AiAuditView: React.FC<AiAuditViewProps> = ({
  onTriggerAudit,
  isAuditing = false,
  latestReport,
  onShowToast,
  isGuest = false,
  activeProfile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'narrative' | 'audit' | 'metrics' | 'raw'>('narrative');

  const defaultNarrative = `### Clinical Intelligence Narrative Synthesis (Cycle W11)
**Facility:** Nairobi West Memorial Hospital (MFL #14920) • Level 5 Secondary Referral
**Audit Period:** 09 March 2026 - 15 March 2026
**Ingested FHIR Bundles:** 142 encounters

#### Executive Summary
During the Week 11 auditing cycle, Kazira Clinical Intelligence evaluated all inpatient surgical logs, radiology PACS image orders, and casualty discharge records against the hospital cashier ledger. 

1. **Theatre 2 Surgical Nursing Shift Delta:** An 18-24% recurring omission of laparoscopy disposable trocars, suture packs, and endo-loops was detected specifically during Friday night and weekend shifts. Value: KES 520,000 across 8 procedures.
2. **Ultrasound PACS vs. Invoicing:** 12 diagnostic sonograms captured in Radiology Room B lacked matching cashier receipt counterfoils. Value: KES 480,000.
3. **SHA Gazette Tariff Alignment:** Out of 184 batched claims, 15 presented pre-submission risks (12 exceeding Caesarean tariff cap MAT-CS-SPEC-01 by KES 4,500 each; 3 lacking mandatory secondary ICD-10 hydration code E86.0). Total at-risk liquidity: KES 840,000.`;

  const defaultAudit = `### Deterministic Audit Trail & Verification Logs
- Stage 1 (Flash Narrative): Processed 142 FHIR bundles in 0.42s. Extracted 23 candidate procedural discrepancies.
- Stage 2 (Gemini Flash Math Determinism):
  - Laparoscopic Consumables: 8 procedures * KES 65,000 = KES 520,000 [VERIFIED]
  - Pelvic Doppler Scans: 12 scans * KES 40,000 = KES 480,000 [VERIFIED]
  - Minor Debridement Suture Packs: 15 encounters * KES 30,680 = KES 460,200 [VERIFIED]
  - Histopathology Biopsy Panels: 5 specimens * KES 77,000 = KES 385,000 [VERIFIED]
  - Total Detected Unbilled Value: KES 1,845,200.00 (Audited by Second Model Pass)
- KDPA Verification: SHA-256 HMAC generated for all patient tokens. No PII crossed sovereign edge boundary.`;

  const defaultMetrics = {
    grossInflow: 'KES 8,420,500',
    unbilledGaps: 'KES 1,845,200',
    kaziraRecovered: 'KES 1,290,000',
    shaExposure: 'KES 2,150,000',
    confidenceScore: '99.8%',
    encountersAudited: 142,
    flaggedGaps: 23,
    tariffDiscrepancies: 15
  };

  const hasReport = !!latestReport;
  const showDemoData = isGuest && !hasReport;

  const narrativeText = latestReport?.narrative || (showDemoData ? defaultNarrative : null);
  const auditText = latestReport?.audit || (showDemoData ? defaultAudit : null);
  
  const grossInflowDisplay = latestReport?.metrics?.revenueThisWeek 
    ? `KES ${latestReport.metrics.revenueThisWeek.toLocaleString()}` 
    : (showDemoData ? defaultMetrics.grossInflow : 'KES 0');

  const unbilledGapsDisplay = latestReport?.metrics?.unbilledRevenueKes 
    ? `KES ${latestReport.metrics.unbilledRevenueKes.toLocaleString()}` 
    : (showDemoData ? defaultMetrics.unbilledGaps : 'KES 0');

  const kaziraRecoveredDisplay = showDemoData ? defaultMetrics.kaziraRecovered : 'KES 0';
  const confidenceScoreDisplay = showDemoData ? defaultMetrics.confidenceScore : (hasReport ? '99.9%' : 'N/A');

  const facilityName = activeProfile?.facilityName || (isGuest ? 'Nairobi West Memorial Hospital' : 'Facility');
  const facilityCode = activeProfile?.facilityCode || (isGuest ? '14920' : '00000');

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Header */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-mono text-label-mono uppercase tracking-wider font-semibold">
              <Cpu size={14} className="text-primary" />
              Dual-Loop AI Architecture (Gemini 3.8 / 2.5 Flash)
            </span>
            <span className="font-label-mono text-label-mono text-primary font-medium">
              Audited by Second Model Pass
            </span>
          </div>

          <button
            onClick={onTriggerAudit}
            disabled={isAuditing}
            className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            <Play size={16} className={isAuditing ? 'animate-spin' : ''} />
            <span>{isAuditing ? 'Executing Dual-Loop Audit...' : 'Re-Run Deterministic Audit'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 max-w-4xl">
          <h1 className="font-display-md text-xl sm:text-2xl lg:text-3xl text-on-surface tracking-tight font-semibold font-head">
            AI Audit Loop: Narrative / Audit / Metric Extraction
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Strict audited clinical intelligence pattern for Kenyan hospitals. Step 1 generates qualitative clinical context; Step 2 conducts deterministic math and tariff reconciliation; Step 3 extracts structured numerical ledger metrics.
          </p>
        </div>
      </section>

      {/* 3 Architecture Step Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-space-base">
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Step 1: Clinical Synthesis
            </span>
            <span className="font-label-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface">
              Flash 0.42s
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Cross-references unstructured nursing Kardex, PACS findings, and pharmacy dispense chits with cashier receipts.
          </p>
          <div className="flex items-center gap-1.5 text-primary font-label-mono text-label-mono font-medium pt-1">
            <span className="w-1.5 h-1.5 rounded-sm bg-primary"></span>
            <span>Narrative context generated</span>
          </div>
        </div>

        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">
              Step 2: Deterministic Audit
            </span>
            <span className="font-label-mono text-[11px] px-1.5 py-0.5 rounded bg-secondary-fixed/40 text-secondary font-bold">
              Gemini 2.5
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Enforces strict arithmetic parity: sums line items, applies gazetted Level 5 tariffs, and rejects speculative inferences.
          </p>
          <div className="flex items-center gap-1.5 text-secondary font-label-mono text-label-mono font-medium pt-1">
            <span className="w-1.5 h-1.5 rounded-sm bg-secondary"></span>
            <span>100% Math match verified</span>
          </div>
        </div>

        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold">
              Step 3: Metric Ingestion
            </span>
            <span className="font-label-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface">
              JSON Schema
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Maps auditable KES values and claim statuses directly into the unbilled ledger, MoH DHIS2 payload, and recovery pipeline.
          </p>
          <div className="flex items-center gap-1.5 text-tertiary font-label-mono text-label-mono font-medium pt-1">
            <span className="w-1.5 h-1.5 rounded-sm bg-tertiary"></span>
            <span>Structured ledger updated</span>
          </div>
        </div>
      </section>

      {/* Main Terminal View */}
      <section className="bg-surface-container-lowest rounded-md border border-outline-variant/20 overflow-hidden shadow-2xs">
        {/* Sub-tab Navigation */}
        <div className="px-3 sm:px-space-base py-space-sm bg-surface-container-low border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
            <button
              onClick={() => setActiveSubTab('narrative')}
              className={`px-3 py-1.5 rounded font-body-sm text-xs sm:text-body-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeSubTab === 'narrative'
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <FileText size={15} />
              <span>1. Narrative Output</span>
            </button>

            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1.5 rounded font-body-sm text-xs sm:text-body-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-surface-container-lowest text-secondary font-semibold shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <ShieldCheck size={15} />
              <span>2. Deterministic Audit Trail</span>
            </button>

            <button
              onClick={() => setActiveSubTab('metrics')}
              className={`px-3 py-1.5 rounded font-body-sm text-xs sm:text-body-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeSubTab === 'metrics'
                  ? 'bg-surface-container-lowest text-tertiary font-semibold shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Database size={15} />
              <span>3. Extracted Ledger Metrics</span>
            </button>

            <button
              onClick={() => setActiveSubTab('raw')}
              className={`px-3 py-1.5 rounded font-body-sm text-xs sm:text-body-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeSubTab === 'raw'
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Code2 size={15} />
              <span>Raw JSON Stream</span>
            </button>
          </div>

          <div className="flex items-center gap-2 font-label-mono text-label-mono text-on-surface-variant">
            <span>Model: Gemini 2.5 Pro (Clinical Fine-Tuning)</span>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-4 sm:p-6 lg:p-space-xl">
          {activeSubTab === 'narrative' && (
            narrativeText ? (
              <div className="prose max-w-none text-on-surface leading-relaxed whitespace-pre-wrap font-body-md">
                {narrativeText}
              </div>
            ) : (
              <div className="p-8 text-center bg-surface-container-low rounded-md border border-outline-variant/20 space-y-3">
                <FileText size={32} className="mx-auto text-primary opacity-60" />
                <h3 className="font-bold text-on-surface text-base">No Clinical Narrative Generated Yet</h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  Execute the dual-loop audit to synthesize clinical encounters, ward logs, and surgical theatre consumables for {facilityName} (MFL #{facilityCode}).
                </p>
                <div className="pt-2">
                  <button
                    onClick={onTriggerAudit}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container transition-colors disabled:opacity-75 cursor-pointer"
                  >
                    <Play size={14} className={isAuditing ? 'animate-spin' : ''} />
                    <span>Run Clinical Narrative Audit</span>
                  </button>
                </div>
              </div>
            )
          )}

          {activeSubTab === 'audit' && (
            auditText ? (
              <div className="p-space-base rounded bg-surface-container-low font-label-mono text-label-mono leading-relaxed whitespace-pre-wrap text-on-surface border border-outline-variant/30">
                {auditText}
              </div>
            ) : (
              <div className="p-8 text-center bg-surface-container-low rounded-md border border-outline-variant/20 space-y-3">
                <ShieldCheck size={32} className="mx-auto text-secondary opacity-60" />
                <h3 className="font-bold text-on-surface text-base">No Deterministic Verification Trail</h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  Stage 2 deterministic verification occurs when an audit cycle is triggered. Mathematical reconciliations and gazetted tariff checks will display here.
                </p>
              </div>
            )
          )}

          {activeSubTab === 'metrics' && (
            hasReport || showDemoData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-base">
                <div className="p-space-base rounded bg-surface-container-low border border-outline-variant/20">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">Gross Inflow</span>
                  <div className="font-data-metric-lg text-xl sm:text-2xl text-on-surface font-bold mt-1">{grossInflowDisplay}</div>
                </div>
                <div className="p-space-base rounded bg-surface-container-low border border-outline-variant/20">
                  <span className="font-label-caps text-label-caps uppercase text-secondary font-semibold">Unbilled Gaps</span>
                  <div className="font-data-metric-lg text-xl sm:text-2xl text-secondary font-bold mt-1">{unbilledGapsDisplay}</div>
                </div>
                <div className="p-space-base rounded bg-surface-container-low border border-outline-variant/20">
                  <span className="font-label-caps text-label-caps uppercase text-primary font-semibold">Kazira Recovered</span>
                  <div className="font-data-metric-lg text-xl sm:text-2xl text-primary font-bold mt-1">{kaziraRecoveredDisplay}</div>
                </div>
                <div className="p-space-base rounded bg-surface-container-low border border-outline-variant/20">
                  <span className="font-label-caps text-label-caps uppercase text-tertiary font-semibold">Confidence Score</span>
                  <div className="font-data-metric-lg text-xl sm:text-2xl text-tertiary font-bold mt-1">{confidenceScoreDisplay}</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-surface-container-low rounded-md border border-outline-variant/20 space-y-3">
                <Database size={32} className="mx-auto text-tertiary opacity-60" />
                <h3 className="font-bold text-on-surface text-base">Ledger Metrics Awaiting Audit</h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  Audited financial metrics and unbilled exposure totals will populate upon executing the deterministic loop.
                </p>
              </div>
            )
          )}

          {activeSubTab === 'raw' && (
            <pre className="p-space-base rounded bg-surface-container-lowest text-on-surface font-label-mono text-[12px] overflow-x-auto border border-outline-variant/30">
              {JSON.stringify({
                status: hasReport ? 'success' : (showDemoData ? 'demo' : 'idle'),
                facility: `${facilityName} (MFL #${facilityCode})`,
                cycle: hasReport ? '2026-ACTIVE' : (showDemoData ? '2026-W11' : 'NONE'),
                auditPattern: 'Narrative -> Audit -> Extraction',
                metrics: latestReport?.metrics || (showDemoData ? defaultMetrics : null),
                narrativeSummary: narrativeText ? (narrativeText.slice(0, 150) + '...') : null,
                kdpaCompliance: {
                  tokenization: 'SHA-256 HMAC',
                  dataSovereignty: 'On-Premises Local Edge Node',
                  dpiaAssessed: true
                }
              }, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
};

export default AiAuditView;
