import React from 'react';
import { FileCheck, ShieldCheck, Lock, Server } from 'lucide-react';

const DataProcessingAgreement: React.FC = () => {
  return (
    <div className="space-y-6 text-ink2">
      <div className="bg-accent-pale p-5 rounded-xl border border-accent/20">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="text-accent" size={22} />
          <h3 className="text-xl font-bold text-ink font-serif">Data Processing Agreement (DPA)</h3>
        </div>
        <p className="text-xs text-ink3">KDPA 2019 & GDPR Data Processor Agreement &bull; Last updated: April 3, 2026</p>
      </div>

      <div className="space-y-4 text-sm">
        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <ShieldCheck className="text-accent" size={16} /> 1. Scope & Purpose of Processing
          </h4>
          <p className="text-xs text-ink3 leading-relaxed">
            Kazira Clinical Intelligence acts as a Data Processor on behalf of the Health Facility (Data Controller) solely to identify revenue variance, audit billing completeness, and compute SHA claims performance.
          </p>
        </section>

        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <Lock className="text-accent" size={16} /> 2. Technical & Organizational Measures
          </h4>
          <p className="text-xs text-ink3 leading-relaxed">
            All data at rest is encrypted using AES-256, and data in transit is protected via TLS 1.3. Patient IDs undergo irreversible one-way SHA-256 cryptographic hashing prior to analytics execution.
          </p>
        </section>

        <section className="bg-surface2/50 p-4 rounded-xl border border-border2">
          <h4 className="font-bold text-ink font-serif text-base mb-2 flex items-center gap-2">
            <Server className="text-accent" size={16} /> 3. Data Sovereignty & Kenyan Hosting
          </h4>
          <p className="text-xs text-ink3 leading-relaxed">
            For public and faith-based healthcare facilities, data processing adheres to Kenya Data Protection Act 2019 data localisation mandates.
          </p>
        </section>
      </div>
    </div>
  );
};

export default DataProcessingAgreement;
