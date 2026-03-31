import React from 'react';

const AcceptableUsePolicy: React.FC = () => {
  return (
    <div className="prose prose-sm max-w-none text-ink3">
      <h3 className="text-lg font-bold text-ink mb-4 font-serif">Acceptable Use Policy</h3>
      <p className="mb-4">Last updated: March 31, 2026</p>
      
      <h4 className="font-bold text-ink mt-6 mb-2">1. Prohibited Activities</h4>
      <p className="mb-4">You may not use Kazira Clinical Intelligence to:</p>
      <ul className="list-disc pl-5 mb-4 space-y-1">
        <li>Violate any applicable laws or regulations.</li>
        <li>Process sensitive patient data (PHI/PII) without proper anonymization.</li>
        <li>Attempt to bypass or exploit any security mechanisms.</li>
        <li>Reverse engineer, decompile, or disassemble the software.</li>
        <li>Use the service for any illegal, harmful, or fraudulent purpose.</li>
      </ul>

      <h4 className="font-bold text-ink mt-6 mb-2">2. Data Input Requirements</h4>
      <p className="mb-4">Users are responsible for ensuring that any data uploaded to the platform is fully anonymized and stripped of Personally Identifiable Information (PII) before processing.</p>

      <h4 className="font-bold text-ink mt-6 mb-2">3. Enforcement</h4>
      <p className="mb-4">We reserve the right to suspend or terminate access to the service for any user who violates this Acceptable Use Policy, without prior notice.</p>
    </div>
  );
};

export default AcceptableUsePolicy;
