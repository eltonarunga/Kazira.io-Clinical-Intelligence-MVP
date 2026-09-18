import React from 'react';
import { Scale, FileText, AlertTriangle, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

export const TermsOfService: React.FC = () => (
  <div className="space-y-6 text-on-surface" id="terms-of-service-content">
    {/* Header Banner */}
    <div className="bg-surface-container p-5 rounded-md border border-outline-variant/30 flex items-start gap-3.5">
      <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
        <Scale size={22} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold font-headline-sm text-on-surface">Terms of Service</h2>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded border border-primary/20">
            Healthcare Standard v2.6
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Last Revised: September 13, 2026 • Master Subscription &amp; Clinical Use Agreement
        </p>
      </div>
    </div>

    <div className="space-y-5 text-xs text-on-surface-variant leading-relaxed">
      {/* 1. Acceptance & Permitted Use */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          1. Acceptance of Terms &amp; Authorized Facility Use
        </h3>
        <p>
          By accessing or deploying Kazira Clinical Intelligence ("the Service"), your healthcare institution ("Customer", "Facility") agrees to be bound by these Terms of Service. Access is granted exclusively to licensed healthcare facilities registered under the Kenya Master Facility List (MFL) and authorized clinical and administrative personnel.
        </p>
      </section>

      {/* 2. Clinical Non-Interference */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600" />
          2. Clinical Decision Support &amp; Billing Accuracy Boundary
        </h3>
        <p>
          Kazira provides administrative, diagnostic coding, and financial intelligence tools. <strong>The Service does not practice medicine, formulate diagnoses, or prescribe treatments.</strong> All clinical care remains the sole fiduciary responsibility of the attending medical practitioner. While Kazira identifies billing discrepancies and unbilled procedures, the final verification and sign-off of claims submitted to the Social Health Authority (SHA) or private insurers rests with the facility's licensed billing officers.
        </p>
      </section>

      {/* 3. Customer Data Obligations */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          3. Compliance with Kenya Data Protection Act (KDPA 2019)
        </h3>
        <p>
          The Customer warrants that it has lawful authority under Section 29 of the KDPA 2019 to process patient data and that all encounter data synchronized with Kazira adheres to the mandatory cryptographic pseudonymisation standards outlined in our Data Processing Agreement (DPA). Customer shall not disable pseudonymisation gates or inject unmasked PII into non-encrypted fields.
        </p>
      </section>

      {/* 4. SLA & Uptime */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <CheckCircle2 size={16} className="text-primary" />
          4. Service Availability &amp; Offline Resiliency
        </h3>
        <p>
          Kazira maintains a 99.9% scheduled uptime Service Level Agreement (SLA) for core ledger and gateway services. The application includes offline-first local caching to ensure hospital billing desks can continue documenting gap resolutions during internet connectivity disruptions.
        </p>
      </section>

      {/* 5. Governing Law */}
      <section className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/20 space-y-2">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Building2 size={16} className="text-primary" />
          5. Governing Law &amp; Dispute Resolution
        </h3>
        <p>
          These Terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any dispute arising out of or in connection with these Terms shall be resolved through good-faith executive escalation, followed if necessary by arbitration under the Nairobi Centre for International Arbitration (NCIA) Rules.
        </p>
      </section>
    </div>
  </div>
);

export default TermsOfService;
