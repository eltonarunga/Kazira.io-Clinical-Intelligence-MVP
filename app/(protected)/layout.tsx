import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Flag, FileText, Settings, LogOut } from "lucide-react"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900">Kazira</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-blue-600">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/flags" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-blue-600">
            <Flag className="w-5 h-5" />
            Billing Flags
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-blue-600">
            <FileText className="w-5 h-5" />
            Weekly Reports
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 hover:text-blue-600">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700">
            <div className="flex-1 truncate">
              <p className="truncate font-semibold">{session.user?.name}</p>
              <p className="truncate text-xs text-slate-500">{session.user?.email}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="mt-2 flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
