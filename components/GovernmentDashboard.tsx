import React from 'react';
import { BarChart3, Users, Activity, AlertTriangle, ShieldCheck, Map } from 'lucide-react';

interface GovernmentDashboardProps {
  role: 'county_health' | 'moh';
}

const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({ role }) => {
  const isNational = role === 'moh';
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-ink tracking-tight">
            {isNational ? 'National SHA Oversight' : 'County Health Aggregate'}
          </h2>
          <p className="text-sm text-ink3 mt-1">
            {isNational ? 'Ministry of Health / SHA National View' : 'Nairobi County Facility Performance'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
          <ShieldCheck size={14} /> DPIA COMPLIANT
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Map size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">Facilities</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '1,432' : '84'}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">↑ 12 added this month</div>
        </div>
        
        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-light text-accent rounded-lg"><Activity size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">SHA Claims</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '142.5k' : '12.4k'}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">98.2% acceptance rate</div>
        </div>

        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">Anomalies</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '3,402' : '214'}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">Requires review</div>
        </div>

        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">Patients</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '890k' : '45k'}</div>
          <div className="text-xs text-ink3 font-medium mt-1">Pseudonymised records</div>
        </div>
      </div>

      <div className="bg-surface border border-border2 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-surface2/30">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" />
            {isNational ? 'County Performance Breakdown' : 'Facility Performance Breakdown'}
          </h3>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface2/50 text-xs uppercase text-ink3 font-bold">
              <tr>
                <th className="px-6 py-3">{isNational ? 'County' : 'Facility'}</th>
                <th className="px-6 py-3">Claims Submitted</th>
                <th className="px-6 py-3">Acceptance Rate</th>
                <th className="px-6 py-3">Anomalies</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border2">
              {[
                { name: isNational ? 'Nairobi' : 'Kenyatta National Hospital', claims: '45,200', rate: '99.1%', anomalies: '12', status: 'Optimal' },
                { name: isNational ? 'Mombasa' : 'Pumwani Maternity', claims: '28,100', rate: '98.5%', anomalies: '45', status: 'Optimal' },
                { name: isNational ? 'Kisumu' : 'Mbagathi Hospital', claims: '19,400', rate: '94.2%', anomalies: '128', status: 'Review' },
                { name: isNational ? 'Nakuru' : 'Mama Lucy Kibaki', claims: '15,800', rate: '91.0%', anomalies: '342', status: 'Warning' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface2/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-ink">{row.name}</td>
                  <td className="px-6 py-4 font-mono text-ink2">{row.claims}</td>
                  <td className="px-6 py-4 font-mono text-ink2">{row.rate}</td>
                  <td className="px-6 py-4 font-mono text-amber-600">{row.anomalies}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      row.status === 'Optimal' ? 'bg-emerald-50 text-emerald-600' :
                      row.status === 'Review' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
