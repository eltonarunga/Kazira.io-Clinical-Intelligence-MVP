import { getSession } from "@/lib/auth"
import { getReports } from "@/app/data"
import { redirect } from "next/navigation"
import { Calendar, CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const clinicId = (session.user as any).clinicId
  const reports = await getReports(clinicId)
  const report = reports.find(r => r.id === params.id)

  if (!report) {
    return (
      <div className="text-center p-12">
        <h1 className="text-2xl font-bold text-slate-900">Report not found</h1>
        <Link href="/reports" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to reports
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/reports" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Weekly Report</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-medium text-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
              Week of {new Date(report.week_start).toLocaleDateString()} to {new Date(report.week_end).toLocaleDateString()}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Generated on {new Date(report.generated_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${
              report.report_status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.report_status === 'sent' ? (
                <><CheckCircle2 className="w-4 h-4" /> Delivered</>
              ) : (
                <><Clock className="w-4 h-4" /> Draft</>
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-200">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <p className="text-xl font-bold text-slate-900 mt-1">KES {Number(report.total_revenue_kes).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Missed Billing</p>
            <p className="text-xl font-bold text-red-600 mt-1">KES {Number(report.missed_billing_kes).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Procedures</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{report.procedures_count}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Invoices</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{report.invoices_count}</p>
          </div>
        </div>

        <div className="p-8 prose prose-slate max-w-none prose-h1:text-2xl prose-h2:text-xl prose-a:text-blue-600">
          <Markdown remarkPlugins={[remarkGfm]}>
            {report.report_text || '*No report text available.*'}
          </Markdown>
        </div>
      </div>
    </div>
  )
}
