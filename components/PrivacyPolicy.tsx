import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="space-y-4 text-sm text-slate-600">
      <p><strong>Last Updated: March 16, 2026</strong></p>
      <p>At Kazira.io, we take your privacy and the security of your clinic data seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you use our application.</p>

      <h3 className="text-lg font-bold text-slate-800 mt-6">1. Data Collection and Processing</h3>
      <p>We collect the clinic data you input into our system solely for the purpose of generating analytical reports.</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>PII Redaction:</strong> To protect patient privacy, our system employs an automated data processing pipeline that redacts common Personally Identifiable Information (PII) such as email addresses, phone numbers, and Social Security Numbers before processing.</li>
        <li><strong>Data Minimization:</strong> We only process the data necessary to provide the service. We strongly encourage you to remove all patient names and sensitive health information before uploading.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-800 mt-6">2. Third-Party AI Processors</h3>
      <p>To generate insights, your sanitized data is securely transmitted to Google's Gemini AI models via API. By using our service, you consent to this processing.</p>
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mt-4">
        <p className="font-bold text-blue-800 m-0">AI Training Policy</p>
        <p className="text-blue-700 mt-1">We do not permit our AI partners to use your submitted data to train their foundational models. Your data is used exclusively for generating your specific report.</p>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mt-6">3. Data Retention</h3>
      <p>We retain your generated reports locally on your device using your browser's `localStorage`. We do not store your raw clinic data on our servers beyond the immediate processing required to generate your report.</p>

      <h3 className="text-lg font-bold text-slate-800 mt-6">4. Security Measures and Prohibitions</h3>
      <p>We implement a variety of security measures to maintain the safety of your data. However, no method of transmission over the Internet, or method of electronic storage, is 100% secure.</p>
      <p className="font-bold text-slate-800">As detailed in our Terms of Service, any unauthorized scraping, vulnerability testing, or security circumvention of Kazira.io is strictly prohibited and will be met with legal action.</p>

      <h3 className="text-lg font-bold text-slate-800 mt-6">5. Changes to This Privacy Policy</h3>
      <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
    </div>
  );
};

export default PrivacyPolicy;
