import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Building2, User, Mail, Phone, MapPin, CreditCard } from "lucide-react"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const clinicId = (session.user as any).clinicId
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId }
  })

  if (!clinic) {
    return <div>Clinic not found</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clinic Profile */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-500" />
                Clinic Profile
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                  <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-900">
                    {clinic.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                  <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {clinic.owner_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {clinic.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {clinic.phone || 'Not provided'}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {clinic.location || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-500" />
                Email Preferences
              </h2>
              <p className="text-sm text-slate-500 mt-1">Manage when you receive your automated weekly reports.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Weekly Report Delivery</p>
                  <p className="text-sm text-slate-500">Receive a summary of revenue and missed billing.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Day</label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option>Sunday Evening</option>
                  <option>Monday Morning</option>
                  <option>Friday Evening</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-500" />
                Subscription
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  clinic.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                  clinic.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {clinic.subscription_status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-slate-500">Tier</span>
                <span className="text-sm font-semibold text-slate-900 capitalize">
                  {clinic.subscription_tier}
                </span>
              </div>
              
              <div className="pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 text-center mb-4">
                  Need to change your plan or update billing details?
                </p>
                <button className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
