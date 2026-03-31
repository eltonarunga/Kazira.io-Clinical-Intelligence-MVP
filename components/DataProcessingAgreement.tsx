import React from 'react';

const DataProcessingAgreement: React.FC = () => {
  return (
    <div className="prose prose-sm max-w-none text-ink3">
      <h3 className="text-lg font-bold text-ink mb-4 font-serif">Data Processing Agreement (DPA)</h3>
      <p className="mb-4">Last updated: March 31, 2026</p>
      
      <p className="mb-4">This Data Processing Agreement ("DPA") forms part of the Terms of Service between Kazira Clinical Intelligence ("Data Processor") and the Clinic ("Data Controller").</p>

      <h4 className="font-bold text-ink mt-6 mb-2">1. Scope of Processing</h4>
      <p className="mb-4">The Data Processor will process data solely for the purpose of providing the Kazira Clinical Intelligence service, which includes analyzing clinic revenue, missed billing, and generating reports.</p>

      <h4 className="font-bold text-ink mt-6 mb-2">2. Data Types</h4>
      <p className="mb-4">The Data Controller agrees to only provide anonymized financial and operational data. The Data Controller must not provide any Protected Health Information (PHI) or Personally Identifiable Information (PII).</p>

      <h4 className="font-bold text-ink mt-6 mb-2">3. Security Measures</h4>
      <p className="mb-4">The Data Processor implements appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including encryption in transit and at rest.</p>

      <h4 className="font-bold text-ink mt-6 mb-2">4. Sub-processors</h4>
      <p className="mb-4">The Data Processor may use Google (Gemini API) as a sub-processor for generating narrative reports and auditing data. The Data Processor ensures that any sub-processor is bound by obligations equivalent to those in this DPA.</p>

      <h4 className="font-bold text-ink mt-6 mb-2">5. Data Deletion</h4>
      <p className="mb-4">Upon termination of the service, or upon written request by the Data Controller, the Data Processor will delete all processed data within 30 days, unless required by law to retain it.</p>
    </div>
  );
};

export default DataProcessingAgreement;
