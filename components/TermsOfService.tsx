import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="space-y-4 text-sm text-slate-600">
      <p><strong>Last Updated: March 16, 2026</strong></p>
      <p>Welcome to Kazira.io. By accessing or using our application, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.</p>
      
      <h3 className="text-lg font-bold text-slate-800 mt-6">1. Prohibited Activities and Security</h3>
      <p>The security and integrity of Kazira.io are of paramount importance. You agree not to engage in any of the following prohibited activities:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Unauthorized Scraping and Data Mining:</strong> You shall not use any automated system, including but not limited to "robots," "spiders," or "offline readers," to access the service in a manner that sends more request messages to our servers than a human can reasonably produce in the same period.</li>
        <li><strong>Vulnerability Testing:</strong> You are strictly prohibited from probing, scanning, or testing the vulnerability of any Kazira.io system, network, or application. Penetration testing without explicit prior written consent from Kazira.io is strictly forbidden.</li>
        <li><strong>Security Circumvention:</strong> You shall not breach or attempt to breach security or authentication measures, nor shall you attempt to bypass any measures we may use to prevent or restrict access to the service.</li>
        <li><strong>Reverse Engineering:</strong> You shall not decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the service.</li>
      </ul>
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg mt-4">
        <p className="font-bold text-red-800 m-0">Legal Repercussions</p>
        <p className="text-red-700 mt-1">Violation of these security rules may result in immediate termination of your access and civil or criminal liability. We will investigate occurrences that may involve such violations and may involve, and cooperate with, law enforcement authorities in prosecuting users who are involved in such violations.</p>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mt-6">2. Intellectual Property</h3>
      <p>The service and its original content, features, and functionality are and will remain the exclusive property of Kazira.io and its licensors. The service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

      <h3 className="text-lg font-bold text-slate-800 mt-6">3. Limitation of Liability</h3>
      <p>In no event shall Kazira.io, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>

      <h3 className="text-lg font-bold text-slate-800 mt-6">4. Governing Law</h3>
      <p>These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.</p>
    </div>
  );
};

export default TermsOfService;
