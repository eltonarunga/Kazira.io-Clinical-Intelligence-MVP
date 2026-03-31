import { PrismaClient } from '@prisma/client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Current status of Kazira Clinical Intelligence systems',
}

const prisma = new PrismaClient()

export const revalidate = 60 // Revalidate every minute

export default async function StatusPage() {
  let dbStatus = 'Operational'
  let dbLatency = 0
  
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Date.now() - start
  } catch (error) {
    dbStatus = 'Degraded'
  }

  const allOperational = dbStatus === 'Operational'

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">System Status</h1>
      
      <div className={`p-6 rounded-lg mb-8 text-white ${allOperational ? 'bg-green-600' : 'bg-yellow-600'}`}>
        <h2 className="text-2xl font-semibold">
          {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
        </h2>
        <p className="mt-2 opacity-90">Last updated: {new Date().toLocaleString()}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Services</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          <li className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">Web Application</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 font-medium">Operational</span>
            </div>
          </li>
          <li className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">Database</span>
              {dbStatus === 'Operational' && (
                <span className="ml-3 text-sm text-gray-500">{dbLatency}ms</span>
              )}
            </div>
            <div className="flex items-center">
              <span className={dbStatus === 'Operational' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                {dbStatus}
              </span>
            </div>
          </li>
          <li className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">Authentication</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 font-medium">Operational</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
