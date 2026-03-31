import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation | Kazira Clinical Intelligence',
  description: 'Learn how to use Kazira to grow your dental practice',
}

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8">Documentation & Help Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-3 text-blue-600">
            <li><a href="#connecting" className="hover:underline">Connecting your Practice Management Software</a></li>
            <li><a href="#dashboard" className="hover:underline">Understanding your Dashboard</a></li>
            <li><a href="#team" className="hover:underline">Inviting Team Members</a></li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Revenue Intelligence</h2>
          <ul className="space-y-3 text-blue-600">
            <li><a href="#metrics" className="hover:underline">Key Metrics Explained</a></li>
            <li><a href="#reports" className="hover:underline">Automated Weekly Reports</a></li>
            <li><a href="#forecasting" className="hover:underline">Revenue Forecasting</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 prose prose-blue max-w-none">
        <h2 id="connecting">Connecting your Practice Management Software</h2>
        <p>Kazira integrates seamlessly with major practice management systems. Navigate to <strong>Settings &gt; Integrations</strong> to authorize the connection. Data sync typically takes 15-30 minutes for the initial load.</p>
        
        <h2 id="dashboard">Understanding your Dashboard</h2>
        <p>Your dashboard provides a real-time view of your clinic's financial health. Pay special attention to the <strong>Production vs. Collection</strong> chart to identify potential cash flow issues early.</p>
        
        <h2 id="support">Need more help?</h2>
        <p>If you can't find what you're looking for, please reach out to our support team at <a href="mailto:support@kazira.io">support@kazira.io</a>.</p>
      </div>
    </div>
  )
}
