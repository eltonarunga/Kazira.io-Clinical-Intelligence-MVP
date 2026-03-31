import { getSession } from "@/lib/auth"
import { getReports } from "@/app/data"
import { generateWeeklyReport } from "@/app/actions"
import { redirect } from "next/navigation"
import { FileText, Calendar, CheckCircle2, Clock } from "lucide-react"

export default async function ReportsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const clinicId = (session.user as any).clinicId
  const reports = await getReports(clinicId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Weekly Reports</h1>
        
        <form action={async () => {
          'use server'
          await generateWeeklyReport(clinicId)
        }}>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">
            Generate Report
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1 space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500">
              No reports generated yet.
            </div>
          ) : (
            reports.map(report => (
              <a 
                key={report.id} 
                href={`/reports/${report.id}`}
                className="block bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Week of {new Date(report.week_start).toLocaleDateString()}
                  </div>
                  {report.report_status === 'sent' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div>
                    <p className="text-slate-500">Revenue</p>
                    <p className="font-semibold text-slate-900">KES {Number(report.total_revenue_kes).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Missed</p>
                    <p className="font-semibold text-red-600">KES {Number(report.missed_billing_kes).toLocaleString()}</p>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>

        {/* Report Preview (Empty State) */}
        <div className="lg:col-span-2 hidden lg:flex bg-white rounded-xl border border-slate-200 shadow-sm items-center justify-center p-12 text-center text-slate-500">
          <div>
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900">Select a report</p>
            <p className="mt-1">Choose a weekly report from the list to view its contents.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
