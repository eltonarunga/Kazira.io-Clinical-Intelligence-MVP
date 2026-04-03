import React from 'react';
import { Shield, Eye, Database, Server, UserCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => (
  <div className="space-y-8 text-ink2">
    <div className="bg-accent-pale p-6 rounded-xl border border-accent/20">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="text-accent" size={24} />
        <h2 className="text-xl font-bold text-ink">Privacy Policy</h2>
      </div>
      <p className="text-sm text-ink3">Last Updated: April 3, 2026</p>
      <p className="mt-4 text-sm">
        Your privacy is critically important to us. This Privacy Policy explains how Kazira Clinical Intelligence collects, uses, and protects your information when you use our Service.
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <Database size={18} className="text-accent" />
          1. Data We Process
        </h3>
        <p className="text-sm leading-relaxed mb-3">
          We process the clinical and financial data you input into the Service to generate insights and reports. <strong>Crucially, you must ensure that all patient data is pseudonymised or anonymised before inputting it into the Service.</strong> We do not ask for, nor do we want, Personally Identifiable Information (PII) of your patients.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <Server size={18} className="text-accent" />
          2. Data Storage and Residency
        </h3>
        <p className="text-sm leading-relaxed">
          For our public sector and SHA facility users, we adhere to strict data residency requirements. Data processed by Kazira is stored and processed within servers located in Kenya, in compliance with the Kenya Data Protection Act 2019. We employ industry-standard security measures to protect data in transit and at rest.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <Eye size={18} className="text-accent" />
          3. How We Use Your Information
        </h3>
        <p className="text-sm leading-relaxed mb-3">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>Provide, operate, and maintain our Service;</li>
          <li>Improve, personalize, and expand our Service;</li>
          <li>Understand and analyze how you use our Service;</li>
          <li>Develop new products, services, features, and functionality;</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <UserCheck size={18} className="text-accent" />
          4. Your Rights and DPIA
        </h3>
        <p className="text-sm leading-relaxed">
          Under the Kenya Data Protection Act 2019, you have rights regarding your data. For public facilities, completing a Data Protection Impact Assessment (DPIA) is a mandatory step in our onboarding process to ensure compliance before any data flows through our systems.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
          <Shield size={18} className="text-accent" />
          5. Changes to This Privacy Policy
        </h3>
        <p className="text-sm leading-relaxed">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.
        </p>
      </section>
    </div>
  </div>
);

export default PrivacyPolicy;
