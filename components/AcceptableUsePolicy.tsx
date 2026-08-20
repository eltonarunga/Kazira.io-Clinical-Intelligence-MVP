import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

const AcceptableUsePolicy: React.FC = () => {
  return (
    <div className="space-y-6 text-ink2">
      <div className="bg-accent-pale p-5 rounded-xl border border-accent/20">
        <div className="flex items-center gap-3 mb-2">
          <AlertOctagon className="text-accent" size={22} />
          <h3 className="text-xl font-bold text-ink font-serif">Acceptable Use Policy</h3>
        </div>
        <p className="text-xs text-ink3">Last updated: April 3, 2026</p>
      </div>

      <div className="space-y-5 text-sm">
        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <ShieldAlert className="text-warn" size={16} /> 1. Prohibited Activities
          </h4>
          <p className="text-xs text-ink3 mb-2">You may not use Kazira Clinical Intelligence to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-ink3">
            <li>Violate any Kenyan or international healthcare data protection regulations.</li>
            <li>Upload unmasked patient identifiers (PII/PHI) without utilizing our built-in pseudonymisation tools.</li>
            <li>Attempt unauthorized access, reverse engineering, or penetration testing against platform APIs.</li>
            <li>Use the platform for fraudulent claim submission or falsification of audit logs.</li>
          </ul>
        </section>

        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <CheckCircle2 className="text-accent" size={16} /> 2. Clinical Data Responsibilities
          </h4>
          <p className="text-xs text-ink3 leading-relaxed">
            Clinic administrators are responsible for ensuring that all uploaded data complies with local institutional health ethics approvals and KDPA 2019 compliance mandates.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AcceptableUsePolicy;
