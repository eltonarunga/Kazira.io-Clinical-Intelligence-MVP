import React, { useState } from 'react';
import { BarChart3, Users, Activity, AlertTriangle, ShieldCheck, Map, Send, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';
import { dhis2Service } from '../services/dhis2Service';
import { smsService } from '../services/smsService';
import { toast } from 'sonner';

interface GovernmentDashboardProps {
  role: 'county_health' | 'moh';
}

const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({ role }) => {
  const isNational = role === 'moh';
  const [isPushingDhis2, setIsPushingDhis2] = useState(false);
  const [lastDhis2Ref, setLastDhis2Ref] = useState<string | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);

  const handlePushToDHIS2 = async () => {
    setIsPushingDhis2(true);
    try {
      const payload = dhis2Service.buildSHAPayload('MFL-28341', '2026W25', {
        shaClaimsTotal: isNational ? 142500 : 12400,
        shaReimbursementValue: isNational ? 89500000 : 8680000,
        rejectionRatePercent: 1.8,
        primaryCareSubmissions: isNational ? 98000 : 8400
      });
      const res = await dhis2Service.pushSHAClaims(payload);
      setLastDhis2Ref(res.referenceId);
      toast.success(`DHIS2 Sync Complete! Ref: ${res.referenceId}. ${res.importCount.imported} metrics updated.`);
    } catch (err: any) {
      toast.error('DHIS2 Transmission failed: ' + err.message);
    } finally {
      setIsPushingDhis2(false);
    }
  };

  const handleBroadcastSMS = async () => {
    setIsSendingSms(true);
    try {
      const msg = smsService.formatSHAReceipt(
        isNational ? 'MFL-NATIONAL-HUB' : 'MFL-28341',
        isNational ? 14250 : 1240,
        isNational ? 89500000 : 8680000,
        lastDhis2Ref || 'DHIS2-98421'
      );
      const res = await smsService.sendSMS(msg);
      toast.success(`SMS Weekly Digest Broadcasted to Health Directors via Africa's Talking! (Ref: ${res.messageId})`);
    } catch (err: any) {
      toast.error('SMS broadcast error: ' + err.message);
    } finally {
      setIsSendingSms(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
        <div>
          <h2 className="text-2xl font-bold font-serif text-ink tracking-tight">
            {isNational ? 'National SHA Oversight Dashboard' : 'County Health Aggregate & SHA Gateway'}
          </h2>
          <p className="text-sm text-ink3 mt-1">
            {isNational ? 'Ministry of Health / SHA National Command Center' : 'Nairobi County Facility SHA Claims & DHIS2 Sync'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePushToDHIS2}
            disabled={isPushingDhis2}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent2 transition-all disabled:opacity-50"
          >
            {isPushingDhis2 ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            {isPushingDhis2 ? 'Syncing DHIS2...' : 'Transmit SHA Aggregate'}
          </button>

          <button
            type="button"
            onClick={handleBroadcastSMS}
            disabled={isSendingSms}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border2 hover:border-accent text-ink rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            <Smartphone size={14} className="text-accent" />
            {isSendingSms ? 'Sending SMS...' : 'Broadcast SMS Digest'}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <ShieldCheck size={14} /> KDPA 2019 DPIA COMPLIANT
          </div>
        </div>
      </div>

      {lastDhis2Ref && (
        <div className="p-3 bg-accent-light border border-accent/30 rounded-xl flex items-center justify-between text-xs text-accent font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Latest DHIS2 Transmission Reference: <strong className="font-mono">{lastDhis2Ref}</strong></span>
          </div>
          <span className="font-mono text-[11px] text-accent/80">{new Date().toLocaleTimeString()}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Map size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">Facilities Enrolled</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '1,432' : '84'}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">↑ 12 added this month</div>
        </div>
        
        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent-light text-accent rounded-lg"><Activity size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">SHA Aggregate Claims</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '142.5k' : '12.4k'}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">98.2% DHIS2 acceptance rate</div>
        </div>

        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">Anomalies / Rejections</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '3,402' : '214'}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">Requires county clerk review</div>
        </div>

        <div className="bg-surface border border-border2 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
            <div className="text-xs font-bold text-ink3 uppercase tracking-wider">Pseudonymised Encounters</div>
          </div>
          <div className="text-2xl font-mono font-bold text-ink">{isNational ? '890k' : '45k'}</div>
          <div className="text-xs text-ink3 font-medium mt-1">OpenMRS FHIR R4 Bundle</div>
        </div>
      </div>

      <div className="bg-surface border border-border2 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-surface2/30 flex items-center justify-between">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" />
            {isNational ? 'County SHA Performance Breakdown' : 'Sub-County Level 4/5 Facility Performance'}
          </h3>
          <span className="text-xs text-ink3 font-mono">Live DHIS2 Status</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface2/50 text-xs uppercase text-ink3 font-bold">
              <tr>
                <th className="px-6 py-3">{isNational ? 'County' : 'Facility'}</th>
                <th className="px-6 py-3">SHA Claims</th>
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
