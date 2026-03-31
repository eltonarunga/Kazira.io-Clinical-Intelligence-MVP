import fs from 'fs'
import path from 'path'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'See what is new in Kazira Clinical Intelligence',
}

export default function ChangelogPage() {
  let changelogContent = 'No changelog available.'
  
  try {
    const filePath = path.join(process.cwd(), 'CHANGELOG.md')
    changelogContent = fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.error('Failed to read CHANGELOG.md', error)
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <div className="prose prose-blue max-w-none">
        <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-6 rounded-lg border border-gray-200">
          {changelogContent}
        </pre>
      </div>
    </div>
  )
}
