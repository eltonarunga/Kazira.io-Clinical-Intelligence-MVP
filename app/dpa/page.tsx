export default function DPAPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Data Processing Agreement</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          This Data Processing Agreement ("DPA") forms part of the Terms of Service between Kazira Clinical Intelligence and the Customer.
        </p>
        <h2>1. Definitions</h2>
        <p>
          "Personal Data" means any information relating to an identified or identifiable natural person.
        </p>
        <h2>2. Processing of Personal Data</h2>
        <p>
          We process Personal Data on your behalf as necessary to provide the Services.
        </p>
        {/* Add more DPA content here */}
      </div>
    </div>
  )
}
