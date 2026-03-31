import { getSession } from "@/lib/auth"
import { getDashboardSummary, getRevenueTrend, getFlags } from "@/app/data"
import { detectBillingGaps, resolveFlag } from "@/app/actions"
import { redirect } from "next/navigation"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { TrendChart } from './TrendChart'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const clinicId = (session.user as any).clinicId
  const summary = await getDashboardSummary(clinicId, 'week')
  const trend = await getRevenueTrend(clinicId, 'week')
  const openFlags = await getFlags(clinicId, 'open')

  if (summary.procedures_count === 0 && summary.period_revenue_kes === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-blue-50 p-4 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Kazira Clinical Intelligence</h1>
        <p className="text-lg text-slate-600 max-w-xl mb-8">
          You're all set up! To start seeing insights and detecting billing gaps, you need to connect your clinic's data or log your first procedure.
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Connect PMS Integration
          </button>
          <button className="bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
            View Sample Data
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Revenue Dashboard</h1>
        <form action={async () => {
          'use server'
          await detectBillingGaps(clinicId)
        }}>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">
            Run Detection Now
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Revenue This Week</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">KES {summary.period_revenue_kes.toLocaleString()}</p>
          <p className={`text-sm mt-2 ${summary.vs_previous_period_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.vs_previous_period_percent >= 0 ? '+' : ''}{summary.vs_previous_period_percent.toFixed(1)}% vs last week
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Missed Billing Detected</p>
          <p className="text-3xl font-bold text-red-600 mt-2">KES {summary.missed_billing_kes.toLocaleString()}</p>
          <p className="text-sm mt-2 text-slate-500">{summary.open_flags_count} open flags</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Collection Rate</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{summary.collection_rate_percent.toFixed(1)}%</p>
          <p className="text-sm mt-2 text-slate-500">Of total potential revenue</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Procedures Performed</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{summary.procedures_count}</p>
          <p className="text-sm mt-2 text-slate-500">{summary.invoices_issued} invoices issued</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend (Last 7 Days)</h2>
        <div className="h-80 w-full">
          {/* We need a client component for Recharts */}
          <TrendChart data={trend} />
        </div>
      </div>

      {/* Open Flags */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Action Required: Open Billing Flags</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {openFlags.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No open billing flags. Great job!
            </div>
          ) : (
            openFlags.slice(0, 5).map(flag => (
              <div key={flag.id} className="p-6 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {flag.flag_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {flag.procedure.procedure_name} for {flag.procedure.patient.name} ({flag.procedure.patient.patient_ref})
                    </p>
                    <p className="text-sm font-semibold text-red-600 mt-1">
                      Estimated Gap: KES {Number(flag.estimated_gap_kes).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={async () => {
                    'use server'
                    await resolveFlag(flag.id, 'resolved')
                  }}>
                    <button type="submit" className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100">
                      <CheckCircle2 className="w-4 h-4" /> Resolve
                    </button>
                  </form>
                  <form action={async () => {
                    'use server'
                    await resolveFlag(flag.id, 'dismissed')
                  }}>
                    <button type="submit" className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-md hover:bg-slate-100">
                      <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
        {openFlags.length > 5 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
            <a href="/flags" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all {openFlags.length} open flags
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
