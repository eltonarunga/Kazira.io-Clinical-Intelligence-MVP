export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-blue">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p className="mb-4">We collect information you provide directly to us when you create an account, use our services, or communicate with us.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Information Sharing</h2>
        <p className="mb-4">We do not share your personal information with third parties except as described in this privacy policy or with your consent.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Security</h2>
        <p className="mb-4">We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Contact Us</h2>
        <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at support@kazira.com.</p>
      </div>
    </div>
  )
}
