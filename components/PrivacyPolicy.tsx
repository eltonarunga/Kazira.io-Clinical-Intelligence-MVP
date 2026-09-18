import React from 'react';
import { Shield, Eye, Database, Server, UserCheck, Lock, FileCheck2, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => (
  <div className="space-y-6 text-on-surface" id="privacy-policy-content">
    {/* Header Banner */}
    <div className="bg-surface-container p-5 rounded-md border border-outline-variant/30 flex items-start gap-3.5">
      <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
        <Shield size={22} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold font-headline-sm text-on-surface">Privacy Policy &amp; KDPA Compliance</h2>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded border border-primary/20">
            KDPA 2019 Certified
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Effective Date: September 13, 2026 • Governed by the Kenya Data Protection Act (No. 24 of 2019)
        </p>
      </div>
    </div>

    <div className="space-y-5 text-xs text-on-surface-variant leading-relaxed">
      {/* 1. Core Commitment & Roles */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Database size={16} className="text-primary" />
          1. Data Controller vs. Data Processor Distinction
        </h3>
        <p>
          In accordance with Section 2 of the Kenya Data Protection Act 2019 (KDPA):
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>The Healthcare Facility</strong> (Hospital, Clinic, or County Health Department) serves as the <em>Data Controller</em>, maintaining primary ownership, patient consent, and fiduciary clinical custody over all medical and billing records.
          </li>
          <li>
            <strong>Kazira Clinical Intelligence</strong> acts solely as a designated <em>Data Processor</em>, processing pseudonymised encounter metrics strictly for unbilled gap detection, SHA claims validation, and financial intelligence.
          </li>
        </ul>
      </section>

      {/* 2. Cryptographic Pseudonymisation Standard */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Lock size={16} className="text-primary" />
          2. Zero Direct PII Ingestion &amp; Cryptographic Masking
        </h3>
        <p>
          Kazira adheres to a strict zero-PII architectural mandate. Direct patient identifiers (including National ID numbers, full patient names, mobile phone numbers, and physical residential addresses) are never stored in unencrypted format:
        </p>
        <div className="bg-surface-container p-3 rounded font-mono text-[11px] text-on-surface space-y-1">
          <div>• Direct Ingestion: Encrypted locally or pseudonymised at boundary</div>
          <div>• One-way Cryptographic Masking: SHA-256 tokenization (e.g. PAT-9281-K)</div>
          <div>• Insurer Member Token: Transmitted strictly over TLS 1.3 to MoH / SHA gateway</div>
        </div>
      </section>

      {/* 3. Sovereign Data Residency */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Server size={16} className="text-primary" />
          3. Sovereign Data Residency within Kenya
        </h3>
        <p>
          To ensure strict compliance with KDPA Section 48 (Transfers of Sensitive Personal Data outside Kenya), all persistent database stores and audit ledgers are housed within certified Kenyan tier-III data centers or sovereign cloud facilities. Encrypted data backups do not leave national borders.
        </p>
      </section>

      {/* 4. Retention & Data Vault */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <FileCheck2 size={16} className="text-primary" />
          4. Retention Schedules &amp; Statutory DPIA
        </h3>
        <p>
          Encounter audit snapshots and weekly intelligence dossiers are retained for a rolling <strong>90-day statutory reconciliation period</strong>, after which encounter traces are purged or aggregated into non-reversible clinical metrics. Public facilities undergo a mandatory Data Protection Impact Assessment (DPIA) filed with the Office of the Data Protection Commissioner (ODPC).
        </p>
      </section>

      {/* 5. Data Subject Rights & DPO Contact */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <UserCheck size={16} className="text-primary" />
          5. Data Subject Rights &amp; Data Protection Officer (DPO)
        </h3>
        <p>
          Data subjects may exercise statutory rights to access, rectification, objection, and erasure through their attending healthcare facility. Facilities can trigger cryptographic purge requests directly within the <strong>Data Vault</strong>.
        </p>
        <div className="pt-2 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-on-surface font-medium">
            <Mail size={14} className="text-primary" />
            <span>Data Protection Office: dpo@kazira.io</span>
          </div>
          <span className="text-on-surface-variant">ODPC Registration Ref: ODPC/REG/2026/0419</span>
        </div>
      </section>
    </div>
  </div>
);

export default PrivacyPolicy;
