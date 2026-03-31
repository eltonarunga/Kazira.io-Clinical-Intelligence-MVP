import React from 'react';

const Changelog: React.FC = () => {
  return (
    <div className="prose prose-sm max-w-none text-ink3">
      <h3 className="text-lg font-bold text-ink mb-4 font-serif">Changelog</h3>
      <p className="mb-4">All notable changes to Kazira Clinical Intelligence will be documented here.</p>
      
      <div className="mb-8">
        <h4 className="font-bold text-ink mt-6 mb-2">v1.0.0 - March 31, 2026</h4>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li><strong>Initial Release:</strong> Kazira Clinical Intelligence MVP launched.</li>
          <li><strong>Data Ingestion:</strong> Support for raw text, CSV, and Markdown data input.</li>
          <li><strong>Narrative Generation:</strong> AI-powered weekly executive narrative reports.</li>
          <li><strong>Audit Verification:</strong> Cross-referencing and auditing for mathematical accuracy.</li>
          <li><strong>Metrics Extraction:</strong> Structured KPIs (Revenue, Utilization, Cancellations).</li>
          <li><strong>Interactive Dashboard:</strong> Responsive charts for visualizing extracted metrics.</li>
          <li><strong>Report History:</strong> Local browser storage for the last 10 generated reports.</li>
          <li><strong>Export Functionality:</strong> Download generated narrative and audit logs as Markdown.</li>
          <li><strong>Interactive Onboarding:</strong> Guided tour for new users.</li>
        </ul>
      </div>
    </div>
  );
};

export default Changelog;
