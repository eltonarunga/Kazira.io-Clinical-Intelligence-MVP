import React from 'react';

const DataInputGuide: React.FC = () => {
  return (
    <div className="text-sm text-ink3 space-y-2">
      <p><strong>Format:</strong> CSV, TSV, or plain text.</p>
      <p><strong>Required Fields:</strong> Revenue, Appointments, Cancellations.</p>
      <p><strong>Optional Fields:</strong> Practitioner details, Procedure types.</p>
    </div>
  );
};

export default DataInputGuide;
