export default function AUPPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Acceptable Use Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          This Acceptable Use Policy ("AUP") outlines the acceptable use of Kazira Clinical Intelligence services.
        </p>
        <h2>1. Prohibited Activities</h2>
        <p>
          You may not use the Services to:
        </p>
        <ul>
          <li>Violate any laws or regulations.</li>
          <li>Infringe on the intellectual property rights of others.</li>
          <li>Transmit malware or other harmful code.</li>
          <li>Engage in abusive or harassing behavior.</li>
        </ul>
        {/* Add more AUP content here */}
      </div>
    </div>
  )
}
