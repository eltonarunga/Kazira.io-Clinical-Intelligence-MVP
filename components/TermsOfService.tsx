import React from 'react';
import { Shield, FileText, AlertTriangle, Scale, Lock } from 'lucide-react';

const TermsOfService: React.FC = () => (
  <div className="space-y-8 text-ink2">
    <div className="bg-accent-pale p-6 rounded-xl border border-accent/20">
      <div className="flex items-center gap-3 mb-2">
        <Scale className="text-accent" size={24} />
        <h2 className="text-xl font-bold text-ink">Terms of Service</h2>
      </div>
      <p className="text-sm text-ink3">Last Updated: April 3, 2026</p>
      <p className="mt-4 text-sm">
        Welcome to Kazira Clinical Intelligence. By accessing or using our application, you agree to be bound by these Terms of Service. Please read them carefully.
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <FileText size={18} className="text-accent" />
          1. Acceptance of Terms
        </h3>
        <p className="text-sm leading-relaxed">
          By accessing or using Kazira Clinical Intelligence ("the Service"), you agree to these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <Shield size={18} className="text-accent" />
          2. Use License
        </h3>
        <p className="text-sm leading-relaxed mb-3">
          Permission is granted to temporarily download one copy of the materials (information or software) on Kazira's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>modify or copy the materials;</li>
          <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>attempt to decompile or reverse engineer any software contained on Kazira's website;</li>
          <li>remove any copyright or other proprietary notations from the materials; or</li>
          <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <Lock size={18} className="text-accent" />
          3. Data Privacy & Security
        </h3>
        <p className="text-sm leading-relaxed">
          You are responsible for ensuring that any data you input into the Service complies with applicable data protection laws, including the Kenya Data Protection Act 2019. You must pseudonymise or anonymise patient data before processing. Kazira acts as a Data Processor and does not claim ownership over your data.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-accent" />
          4. Disclaimer
        </h3>
        <p className="text-sm leading-relaxed">
          The materials on Kazira's website are provided on an 'as is' basis. Kazira makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <p className="text-sm leading-relaxed mt-2">
          The Service provides AI-generated insights based on the data you provide. These insights are for informational purposes only and should not replace professional medical, legal, or financial advice.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <Scale size={18} className="text-accent" />
          5. Limitations
        </h3>
        <p className="text-sm leading-relaxed">
          In no event shall Kazira or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Kazira's website, even if Kazira or a Kazira authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>
      </section>
    </div>
  </div>
);

export default TermsOfService;
