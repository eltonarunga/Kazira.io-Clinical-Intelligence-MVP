export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-blue">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="mb-4">By accessing or using our services, you agree to be bound by these Terms of Service.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Use of Services</h2>
        <p className="mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
        <p className="mb-4">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Intellectual Property</h2>
        <p className="mb-4">All content and materials available on our services are the property of Kazira Clinical Intelligence or its licensors.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Limitation of Liability</h2>
        <p className="mb-4">In no event shall Kazira Clinical Intelligence be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
      </div>
    </div>
  )
}
