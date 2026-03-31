import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">Could not find requested resource. The page might have been moved or deleted.</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
