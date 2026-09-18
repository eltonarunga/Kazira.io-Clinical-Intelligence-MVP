import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  FileCheck, 
  Key, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint,
  FileSpreadsheet
} from 'lucide-react';
import { sha256Mask } from '../../utils/kdpaMasking';

interface ComplianceViewProps {
  onShowToast: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ onShowToast }) => {
  const [testInput, setTestInput] = useState('John Ochieng (ID 34982103)');
  const [tokenResult, setTokenResult] = useState('ANON-PAT-9F1A-77C2');

  const handleTestTokenize = (e: React.FormEvent) => {
    e.preventDefault();
    const hash = sha256Mask(testInput);
    const shortToken = `ANON-PAT-${hash.slice(0, 4).toUpperCase()}-${hash.slice(4, 8).toUpperCase()}`;
    setTokenResult(shortToken);
    onShowToast('KDPA Token Generated', `Client-side SHA-256 HMAC tokenized: ${shortToken}. Zero PII transmitted.`, 'success');
  };

  const handleDownloadDpiaCert = () => {
    onShowToast('DPIA Certificate Downloaded', 'Office of the Data Protection Commissioner (ODPC) Kenya certificate downloaded.', 'success');
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Header */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-mono text-label-mono uppercase tracking-wider font-semibold">
              <Lock size={14} className="text-primary" />
              Kenya Data Protection Act 2019
            </span>
            <span className="font-label-mono text-label-mono text-primary font-medium">
              Section 31 &amp; Section 50 Strict Compliance
            </span>
          </div>

          <button
            onClick={handleDownloadDpiaCert}
            className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            <span>Download DPIA Certificate (ODPC)</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 max-w-4xl">
          <h1 className="font-display-md text-2xl sm:text-3xl lg:text-4xl text-on-surface tracking-tight font-semibold">
            KDPA 2019 Sovereign Telemetry &amp; Data Protection Hub
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Full compliance framework enforcing patient pseudonymisation, local sovereign residency, and deterministic audit trails under the Office of the Data Protection Commissioner (ODPC) Kenya.
          </p>
        </div>
      </section>

      {/* 4 Compliance Pillars Strip */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-base">
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Client-Side Tokenization
            </span>
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <div className="font-data-metric-md text-xl font-bold text-on-surface">SHA-256 HMAC</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Zero patient names, national IDs, or raw phone numbers ever leave the local hospital intranet.
          </p>
        </div>

        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Data Residency
            </span>
            <Lock size={18} className="text-primary" />
          </div>
          <div className="font-data-metric-md text-xl font-bold text-on-surface">Kenya Sovereign</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            All AI processing operates via private VPC peering with zero multi-tenant overseas data leakage.
          </p>
        </div>

        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              DPIA Assessment
            </span>
            <FileCheck size={18} className="text-primary" />
          </div>
          <div className="font-data-metric-md text-xl font-bold text-on-surface">ODPC Certified</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Full Data Protection Impact Assessment registered under Certificate #ODPC-DPIA-2025-0842.
          </p>
        </div>

        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Audit Transparency
            </span>
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <div className="font-data-metric-md text-xl font-bold text-on-surface">Deterministic</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Every billing recommendation is cryptographically signed and auditable by hospital clinical governance.
          </p>
        </div>
      </section>

      {/* Live Interactive Client-Side Tokenization Sandbox */}
      <section className="p-space-lg rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Interactive Test Sandbox
            </span>
            <h2 className="font-display-sm text-xl text-on-surface font-semibold">
              Live Client-Side Pseudonymisation Engine
            </h2>
          </div>
          <span className="font-label-mono text-label-mono px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold">
            In-Browser Execution (Zero Network I/O)
          </span>
        </div>

        <form onSubmit={handleTestTokenize} className="grid grid-cols-1 lg:grid-cols-12 gap-space-base items-end">
          <div className="lg:col-span-6 space-y-1">
            <label className="font-label-caps text-[11px] uppercase text-on-surface-variant font-semibold">
              Raw Patient Identifier (Simulated Local Input)
            </label>
            <input 
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low rounded text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="lg:col-span-4 space-y-1">
            <label className="font-label-caps text-[11px] uppercase text-primary font-semibold">
              Generated Sovereign Token (Zero PII)
            </label>
            <div className="px-3 py-2 bg-surface-container rounded text-primary font-label-mono text-label-mono font-bold select-all border border-outline-variant/20">
              {tokenResult}
            </div>
          </div>

          <div className="lg:col-span-2">
            <button 
              type="submit"
              className="w-full py-2 px-3 bg-primary text-on-primary rounded font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
            >
              Generate Token
            </button>
          </div>
        </form>

        <p className="font-label-mono text-[11px] text-on-surface-variant">
          Notice: The cryptographic hash algorithm maps each patient to an irreversible, non-invertible token. The lookup table is stored exclusively on Nairobi West Memorial's offline HSM vault.
        </p>
      </section>

      {/* Statutory Regulatory Ledger */}
      <section className="p-space-lg rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-space-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
              Legal Telemetry
            </span>
            <h2 className="font-display-sm text-xl text-on-surface font-semibold">
              Statutory Compliance Checklist (KDPA 2019)
            </h2>
          </div>
          <span className="font-label-mono text-label-mono text-primary font-semibold">
            Status: 100% Compliant
          </span>
        </div>

        <div className="space-y-space-xs font-body-sm text-body-sm">
          <div className="p-space-sm rounded bg-surface-container-low flex items-start justify-between gap-space-sm">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-sm bg-primary shrink-0 mt-1.5"></span>
              <div>
                <span className="font-semibold text-on-surface">Section 25: Principles of Data Protection</span>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Processed lawfully, fairly, and in a transparent manner. Collected strictly for clinical billing reconciliation.
                </p>
              </div>
            </div>
            <span className="font-label-mono text-[11px] text-primary font-bold uppercase shrink-0">Pass</span>
          </div>

          <div className="p-space-sm rounded bg-surface-container-low flex items-start justify-between gap-space-sm">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-sm bg-primary shrink-0 mt-1.5"></span>
              <div>
                <span className="font-semibold text-on-surface">Section 31: Data Protection Impact Assessment (DPIA)</span>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Required prior to processing sensitive personal data involving healthcare operations and automated screening.
                </p>
              </div>
            </div>
            <span className="font-label-mono text-[11px] text-primary font-bold uppercase shrink-0">Pass</span>
          </div>

          <div className="p-space-sm rounded bg-surface-container-low flex items-start justify-between gap-space-sm">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-sm bg-primary shrink-0 mt-1.5"></span>
              <div>
                <span className="font-semibold text-on-surface">Section 44: Health Data Special Safeguards</span>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Access restricted to registered medical practitioners (KMPDC) and authenticated hospital billing officers.
                </p>
              </div>
            </div>
            <span className="font-label-mono text-[11px] text-primary font-bold uppercase shrink-0">Pass</span>
          </div>

          <div className="p-space-sm rounded bg-surface-container-low flex items-start justify-between gap-space-sm">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-sm bg-primary shrink-0 mt-1.5"></span>
              <div>
                <span className="font-semibold text-on-surface">Section 50: Cross-Border Processing Safeguards</span>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  Prohibits transferring health data outside Kenya without proof of adequate safeguards and prior ODPC authorization.
                </p>
              </div>
            </div>
            <span className="font-label-mono text-[11px] text-primary font-bold uppercase shrink-0">Pass</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComplianceView;
