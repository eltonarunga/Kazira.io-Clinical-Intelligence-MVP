import React from 'react';
import { BookOpen, FileSpreadsheet, Activity, ShieldCheck, Mail } from 'lucide-react';

const Documentation: React.FC = () => {
  return (
    <div className="space-y-6 text-ink2">
      <div className="bg-accent-pale p-5 rounded-xl border border-accent/20">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-accent" size={22} />
          <h3 className="text-xl font-bold text-ink font-serif">Help Center & Documentation</h3>
        </div>
        <p className="text-xs text-ink3">Operational guide for private clinics and public healthcare facilities.</p>
      </div>

      <div className="space-y-5 text-sm">
        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <Activity className="text-accent" size={16} /> 1. Getting Started
          </h4>
          <p className="text-ink3 leading-relaxed text-xs">
            Kazira ingests raw clinical and billing records (via CSV, TSV, text, or OpenMRS FHIR) and automatically identifies unbilled procedures, missed follow-ups, and SHA reimbursement bottlenecks.
          </p>
        </section>

        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <FileSpreadsheet className="text-accent" size={16} /> 2. Supported Data Formats & Ingestion
          </h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-ink3">
            <li><strong className="text-ink">CSV / Excel Exports:</strong> Export directly from your Practice Management System (PMS). Recommended fields: Date, Procedure, Practitioner, Fee (KES), and Claim Status.</li>
            <li><strong className="text-ink">Raw Text / Clinical Notes:</strong> Unstructured daily shift reports or triage logs are automatically parsed using Gemini AI.</li>
            <li><strong className="text-ink">KenyaEMR / OpenMRS FHIR R4:</strong> Connect directly to facility EHRs for automated encounter synchronization.</li>
          </ul>
        </section>

        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <ShieldCheck className="text-accent" size={16} /> 3. Data Governance & Privacy
          </h4>
          <p className="text-xs text-ink3 leading-relaxed">
            All data ingestion pipelines include automated client-side pseudonymisation complying strictly with the Kenya Data Protection Act (KDPA 2019). No unmasked patient identifiers are transmitted.
          </p>
        </section>

        <section className="p-4 bg-surface rounded-xl border border-border2 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-ink text-xs mb-0.5">Need Technical Support?</h4>
            <p className="text-[11px] text-ink3">Our clinical integration engineering team is available 24/7.</p>
          </div>
          <a
            href="mailto:support@kazira.io"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent/90 transition-colors shadow-sm"
          >
            <Mail size={14} /> Contact Support
          </a>
        </section>
      </div>
    </div>
  );
};

export default Documentation;
