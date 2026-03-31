import { getSession } from "@/lib/auth"
import { getFlags } from "@/app/data"
import { resolveFlag } from "@/app/actions"
import { redirect } from "next/navigation"
import { AlertCircle, CheckCircle2, XCircle, Filter } from "lucide-react"
import Link from "next/link"

export default async function FlagsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const clinicId = (session.user as any).clinicId
  const currentStatus = searchParams.status || 'all'
  const flags = await getFlags(clinicId, currentStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Billing Flags</h1>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          <Link 
            href="/flags?status=all" 
            className={`px-3 py-1.5 text-sm font-medium rounded-sm ${currentStatus === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All
          </Link>
          <Link 
            href="/flags?status=open" 
            className={`px-3 py-1.5 text-sm font-medium rounded-sm ${currentStatus === 'open' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Open
          </Link>
          <Link 
            href="/flags?status=resolved" 
            className={`px-3 py-1.5 text-sm font-medium rounded-sm ${currentStatus === 'resolved' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Resolved
          </Link>
          <Link 
            href="/flags?status=dismissed" 
            className={`px-3 py-1.5 text-sm font-medium rounded-sm ${currentStatus === 'dismissed' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dismissed
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200">
          {flags.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No flags found for this status.
            </div>
          ) : (
            flags.map(flag => (
              <div key={flag.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {flag.status === 'open' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {flag.status === 'resolved' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {flag.status === 'dismissed' && <XCircle className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {flag.flag_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        flag.status === 'open' ? 'bg-red-50 text-red-700' :
                        flag.status === 'resolved' ? 'bg-green-50 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {flag.procedure.procedure_name} for {flag.procedure.patient.name} ({flag.procedure.patient.patient_ref})
                    </p>
                    <p className="text-sm text-slate-500">
                      Date: {new Date(flag.procedure.performed_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-2">
                      Estimated Gap: KES {Number(flag.estimated_gap_kes).toLocaleString()}
                    </p>
                    {flag.resolution_note && (
                      <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                        Note: {flag.resolution_note}
                      </p>
                    )}
                  </div>
                </div>
                
                {flag.status === 'open' && (
                  <div className="flex gap-2 sm:self-center">
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
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
