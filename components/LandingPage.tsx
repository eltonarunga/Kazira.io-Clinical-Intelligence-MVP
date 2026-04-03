import React, { useState, useEffect } from 'react';
import { ArrowRight, Building2, Landmark } from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  segment: 'private' | 'public';
  setSegment: (segment: 'private' | 'public') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, segment, setSegment }) => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Animate leakage bar on load
    const fill = document.querySelector('.leakage-bar-fill') as HTMLElement;
    if (fill) {
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = '75%'; }, 100);
    }
  }, [segment, activeSection]);

  const [roiProcs, setRoiProcs] = useState(80);
  const [roiVal, setRoiVal] = useState(6500);
  const [roiLeak, setRoiLeak] = useState(18);

  const recovered = Math.round((roiProcs * roiVal * roiLeak / 100) / 100) * 100;
  const ratio = (recovered / 12000).toFixed(1);

  return (
    <div className="min-h-screen bg-surface text-ink font-sans">
      <style>{`
        .hero-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--color-accent);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        
        .leakage-bar-fill {
          transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
        }
        
        .section-active .stat-num { animation: countIn 0.6s ease-out; }
        @keyframes countIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* NAV */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border2 bg-surface">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 9.5H10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="font-serif text-[17px] tracking-[-0.3px] text-ink leading-none">Kazira</div>
            <div className="text-[11px] text-ink3 tracking-[0.05em] -mt-0.5">Clinical Intelligence</div>
          </div>
        </div>
        <div className="hidden md:flex gap-1">
          {['overview', 'dashboard', 'roadmap', 'metrics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all capitalize ${
                activeSection === tab ? 'text-accent bg-accent-light' : 'text-ink3 hover:text-ink hover:bg-surface2'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button 
          onClick={onLaunchApp}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-ink text-white rounded-full text-[13px] font-medium hover:bg-ink2 transition-colors"
        >
          Launch MVP <ArrowRight size={14} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto pb-12">
        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="section-active animate-in fade-in duration-500">
            
            {/* Segment Toggle */}
            <div className="flex justify-center mt-8 mb-2">
              <div className="bg-surface2 p-1 rounded-full inline-flex">
                <button 
                  onClick={() => setSegment('private')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${segment === 'private' ? 'bg-white text-ink shadow-sm' : 'text-ink3 hover:text-ink2'}`}
                >
                  <Building2 size={16} /> Private Clinics
                </button>
                <button 
                  onClick={() => setSegment('public')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${segment === 'public' ? 'bg-white text-ink shadow-sm' : 'text-ink3 hover:text-ink2'}`}
                >
                  <Landmark size={16} /> Public / SHA Facilities
                </button>
              </div>
            </div>

            <div className="pt-8 pb-10 px-7 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent text-accent text-[11px] font-semibold tracking-[0.08em] uppercase mb-5">
                <span className="hero-badge-dot"></span>
                Active Development · Nairobi, Kenya
              </div>
              <h1 className="font-serif text-[38px] leading-[1.15] tracking-[-0.8px] text-ink mb-4">
                {segment === 'private' 
                  ? <><span className="block">Clinics don't know where they're</span> <em className="italic text-accent2">losing money.</em> We tell them.</>
                  : <><span className="block">Public facilities struggle with</span> <em className="italic text-accent2">SHA claims.</em> We recover them.</>
                }
              </h1>
              <p className="text-[15px] text-ink3 leading-[1.65] max-w-[520px] mx-auto">
                {segment === 'public' && "Empowering facility administrators and county health departments to sustain services and improve SHA reimbursement accuracy."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mx-6 mb-8">
              <div className="bg-surface border border-border2 rounded-xl p-4 text-center">
                <span className="font-mono text-[26px] font-medium text-accent block mb-1 stat-num">15–30%</span>
                <div className="text-[11px] text-ink3 leading-[1.3]">
                  {segment === 'private' ? 'Revenue lost to billing gaps per clinic' : 'SHA claims rejected or unsubmitted'}
                </div>
              </div>
              <div className="bg-surface border border-border2 rounded-xl p-4 text-center">
                <span className="font-mono text-[26px] font-medium text-accent block mb-1 stat-num">
                  {segment === 'private' ? 'KES 20k+' : '100%'}
                </span>
                <div className="text-[11px] text-ink3 leading-[1.3]">
                  {segment === 'private' ? 'Avg. recoverable billing per month' : 'Kenya Data Protection Act Compliant'}
                </div>
              </div>
              <div className="bg-surface border border-border2 rounded-xl p-4 text-center">
                <span className="font-mono text-[26px] font-medium text-accent block mb-1 stat-num">Weekly</span>
                <div className="text-[11px] text-ink3 leading-[1.3]">
                  {segment === 'private' ? 'Automated reports. No asking required.' : 'Reports for Admins & County Health'}
                </div>
              </div>
            </div>

            <div className="px-6 mb-3.5">
              <h2 className="font-serif text-[22px] tracking-[-0.4px] text-ink">The Problem</h2>
              <p className="text-[13px] text-ink3 mt-1">
                {segment === 'private' 
                  ? 'Revenue leakage is structural — clinics are operationally blind, not negligent.'
                  : 'SHA reimbursement gaps threaten public facility sustainability. The data is siloed.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 px-6 mb-7">
              <div className="rounded-xl p-4 relative overflow-hidden bg-warn-light border border-warn/20">
                <div className="absolute top-3 right-3.5 font-mono text-[22px] font-medium opacity-10 text-ink">01</div>
                <h4 className="text-[13px] font-semibold text-ink mb-1">Unbilled procedures</h4>
                <p className="text-[12px] text-ink3 leading-[1.45]">
                  {segment === 'private' 
                    ? 'Treatments performed but never invoiced — invisible without a cross-check system.'
                    : 'Treatments performed but never mapped to SHA benefit schedule codes.'}
                </p>
              </div>
              <div className="rounded-xl p-4 relative overflow-hidden bg-warn-light border border-warn/20">
                <div className="absolute top-3 right-3.5 font-mono text-[22px] font-medium opacity-10 text-ink">02</div>
                <h4 className="text-[13px] font-semibold text-ink mb-1">
                  {segment === 'private' ? 'No-show follow-up gap' : 'Disconnected Stakeholders'}
                </h4>
                <p className="text-[12px] text-ink3 leading-[1.45]">
                  {segment === 'private'
                    ? 'Missed appointments rarely trigger rebooking — lost revenue walks out the door.'
                    : 'Facility clerks, administrators, and county health departments lack a unified view.'}
                </p>
              </div>
              <div className="rounded-xl p-4 relative overflow-hidden bg-gold-light border border-gold/20">
                <div className="absolute top-3 right-3.5 font-mono text-[22px] font-medium opacity-10 text-ink">03</div>
                <h4 className="text-[13px] font-semibold text-ink mb-1">
                  {segment === 'private' ? 'Monthly finance reviews' : 'Offline Environments'}
                </h4>
                <p className="text-[12px] text-ink3 leading-[1.45]">
                  {segment === 'private'
                    ? "Owners see numbers once a month — problems compound before they're spotted."
                    : "County facilities with unreliable internet struggle to sync claims data."}
                </p>
              </div>
              <div className="rounded-xl p-4 relative overflow-hidden bg-gold-light border border-gold/20">
                <div className="absolute top-3 right-3.5 font-mono text-[22px] font-medium opacity-10 text-ink">04</div>
                <h4 className="text-[13px] font-semibold text-ink mb-1">
                  {segment === 'private' ? 'Disconnected systems' : 'Data Privacy Compliance'}
                </h4>
                <p className="text-[12px] text-ink3 leading-[1.45]">
                  {segment === 'private'
                    ? 'No link between clinical activity and the billing stack — gaps are invisible by design.'
                    : 'Patient pseudonymisation and local data residency are strict requirements.'}
                </p>
              </div>
            </div>

            <div className="mx-6 mb-7 bg-surface border border-border2 rounded-xl p-4.5">
              <div className="text-[13px] font-semibold mb-3.5 text-ink2">
                {segment === 'private' ? 'Typical private clinic revenue picture' : 'Typical public facility SHA claims picture'}
              </div>
              <div className="relative h-9 rounded-md overflow-hidden bg-surface2 mb-2.5">
                <div className="absolute left-0 top-0 bottom-0 bg-accent2 rounded-md flex items-center pl-2.5 text-[12px] font-semibold text-white leakage-bar-fill" style={{ width: '75%' }}>
                  {segment === 'private' ? 'Captured · 75%' : 'Claimed · 75%'}
                </div>
                <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-r from-warn/15 to-warn/30 border-l-[1.5px] border-dashed border-warn/50 flex items-center justify-center text-[11px] text-warn font-semibold" style={{ width: '25%' }}>
                  {segment === 'private' ? 'Lost · 25%' : 'Unclaimed · 25%'}
                </div>
              </div>
              <div className="flex gap-4 text-[11px] text-ink3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent2"></span>
                  {segment === 'private' ? 'Revenue collected' : 'SHA Reimbursement'}
                </span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warn"></span>
                  {segment === 'private' ? 'Missed billing leakage' : 'Rejected / Unsubmitted'}
                </span>
              </div>
            </div>

            <div className="px-6 mb-3.5 mt-2">
              <h2 className="font-serif text-[22px] tracking-[-0.4px] text-ink">The Solution</h2>
              <p className="text-[13px] text-ink3 mt-1">
                {segment === 'private' 
                  ? 'Three things. Clean. No autonomous agents. No complexity theatre.'
                  : 'Multi-tenant architecture. SHA tariff mapping. Offline-first.'}
              </p>
            </div>

            <div className="px-6 mb-7">
              <div className="flex gap-3.5 py-3.5 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-accent-light border border-accent text-accent text-[12px] font-semibold flex items-center justify-center shrink-0 mt-px">1</div>
                <div>
                  <h4 className="text-[13px] font-semibold text-ink mb-1">
                    {segment === 'private' ? 'Missed billing detection' : 'SHA Tariff Mapping'}
                  </h4>
                  <p className="text-[12px] text-ink3 leading-[1.45]">
                    {segment === 'private'
                      ? 'Compares every procedure logged against every invoice raised — flags every gap automatically, before money walks out the door.'
                      : 'Procedure codes are automatically mapped to SHA benefit schedule codes to ensure accurate reimbursement claims.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3.5 py-3.5 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-accent-light border border-accent text-accent text-[12px] font-semibold flex items-center justify-center shrink-0 mt-px">2</div>
                <div>
                  <h4 className="text-[13px] font-semibold text-ink mb-1">
                    {segment === 'private' ? 'Revenue tracking' : 'County-Level Aggregation'}
                  </h4>
                  <p className="text-[12px] text-ink3 leading-[1.45]">
                    {segment === 'private'
                      ? 'Daily, weekly, and monthly revenue trends benchmarked against clinic-specific targets — owners see the picture in seconds, not at month-end.'
                      : 'A government oversight dashboard provides county health departments with aggregate views of procedures and claims accuracy.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3.5 py-3.5">
                <div className="w-7 h-7 rounded-full bg-accent-light border border-accent text-accent text-[12px] font-semibold flex items-center justify-center shrink-0 mt-px">3</div>
                <div>
                  <h4 className="text-[13px] font-semibold text-ink mb-1">
                    {segment === 'private' ? 'Automated weekly report' : 'Accessible Reporting'}
                  </h4>
                  <p className="text-[12px] text-ink3 leading-[1.45]">
                    {segment === 'private'
                      ? 'A plain-language summary every week: exactly where money was lost, what caused it, and what to act on. Delivered. No prompting required.'
                      : 'Swahili-language interface and SMS delivery options ensure facility billing clerks and administrators can act on insights, even offline.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center px-6 py-4 text-[11px] text-ink3 italic">
            </div>
          </div>
        )}

        {/* DASHBOARD PREVIEW */}
        {activeSection === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <div className="px-6 pt-6 pb-3">
              <div className="font-serif text-[22px] tracking-[-0.4px] mb-1">Live clinic view</div>
              <div className="text-[12px] text-ink3">Sample dashboard — Dr. Wanjiku Dental, Westlands · Week ending 22 March 2025</div>
            </div>

            <div className="grid grid-cols-4 gap-2 px-6 mb-3">
              <div className="bg-surface2 rounded-md p-2.5 pb-2">
                <div className="text-[10px] text-ink3 mb-1 uppercase tracking-[0.06em]">Revenue this week</div>
                <div className="font-mono text-[17px] font-medium text-accent2">82,400</div>
                <div className="text-[10px] text-accent2 mt-0.5">▲ 11% vs last week</div>
              </div>
              <div className="bg-surface2 rounded-md p-2.5 pb-2">
                <div className="text-[10px] text-ink3 mb-1 uppercase tracking-[0.06em]">Missed billing</div>
                <div className="font-mono text-[17px] font-medium text-warn">18,200</div>
                <div className="text-[10px] text-warn mt-0.5">▼ 3 unmatched procedures</div>
              </div>
              <div className="bg-surface2 rounded-md p-2.5 pb-2">
                <div className="text-[10px] text-ink3 mb-1 uppercase tracking-[0.06em]">Patients seen</div>
                <div className="font-mono text-[17px] font-medium text-ink">47</div>
                <div className="text-[10px] text-ink3 mt-0.5">This week</div>
              </div>
              <div className="bg-surface2 rounded-md p-2.5 pb-2">
                <div className="text-[10px] text-ink3 mb-1 uppercase tracking-[0.06em]">Collection rate</div>
                <div className="font-mono text-[17px] font-medium text-accent2">82%</div>
                <div className="text-[10px] text-accent2 mt-0.5">Target: 90%</div>
              </div>
            </div>

            <div className="mx-6 mb-3 bg-surface border border-border2 rounded-xl p-3.5">
              <div className="text-[12px] font-semibold text-ink2 mb-3">Daily revenue · current week (KES)</div>
              <div className="flex items-end gap-[3px] h-[90px]">
                <div className="flex-1 rounded-t-[3px] bg-accent-light relative hover:bg-accent2 transition-colors cursor-pointer" style={{ height: '55%' }} title="Mon"><div className="absolute top-0 left-0 right-0 rounded-t-[3px] bg-warn/25 border-t-2 border-dashed border-warn/60" style={{ height: '22%' }}></div></div>
                <div className="flex-1 rounded-t-[3px] bg-accent-light relative hover:bg-accent2 transition-colors cursor-pointer" style={{ height: '72%' }} title="Tue"><div className="absolute top-0 left-0 right-0 rounded-t-[3px] bg-warn/25 border-t-2 border-dashed border-warn/60" style={{ height: '15%' }}></div></div>
                <div className="flex-1 rounded-t-[3px] bg-accent-light relative hover:bg-accent2 transition-colors cursor-pointer" style={{ height: '48%' }} title="Wed"><div className="absolute top-0 left-0 right-0 rounded-t-[3px] bg-warn/25 border-t-2 border-dashed border-warn/60" style={{ height: '28%' }}></div></div>
                <div className="flex-1 rounded-t-[3px] bg-accent relative hover:bg-accent2 transition-colors cursor-pointer" style={{ height: '90%' }} title="Thu"><div className="absolute top-0 left-0 right-0 rounded-t-[3px] bg-warn/25 border-t-2 border-dashed border-warn/60" style={{ height: '10%' }}></div></div>
                <div className="flex-1 rounded-t-[3px] bg-accent-light relative hover:bg-accent2 transition-colors cursor-pointer" style={{ height: '65%' }} title="Fri"><div className="absolute top-0 left-0 right-0 rounded-t-[3px] bg-warn/25 border-t-2 border-dashed border-warn/60" style={{ height: '18%' }}></div></div>
              </div>
              <div className="flex justify-between mt-1.5 px-0.5 text-[10px] text-ink3">
                <span>Mon</span><span>Tue</span><span>Wed</span><span className="text-accent font-semibold">Thu ↑</span><span>Fri</span>
              </div>
              <div className="flex gap-4 mt-2.5 text-[10px] text-ink3">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-accent-light"></span>Collected revenue</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-warn/25 border-t-2 border-dashed border-warn/60"></span>Missed billing</span>
              </div>
            </div>

            <div className="px-6 mb-4">
              <div className="text-[12px] font-semibold text-ink2 mb-2">Billing alerts this week</div>
              <div className="bg-warn-light border border-warn/30 border-l-[3px] border-l-warn rounded-md p-2.5 mb-2 text-[12px] text-ink2">
                <strong className="text-warn">Alert:</strong> Scaling + polishing (Patient #2341) — procedure logged 18 Mar, no invoice raised. Estimated: KES 6,500
              </div>
              <div className="bg-warn-light border border-warn/30 border-l-[3px] border-l-warn rounded-md p-2.5 mb-2 text-[12px] text-ink2">
                <strong className="text-warn">Alert:</strong> Composite filling (Patient #2289) — material cost recorded, no procedure billed. Estimated: KES 8,200
              </div>
              <div className="bg-warn-light border border-warn/30 border-l-[3px] border-l-warn rounded-md p-2.5 mb-2 text-[12px] text-ink2">
                <strong className="text-warn">Alert:</strong> Consultation follow-up (Patient #2367) — appointment completed, no charge captured. Estimated: KES 3,500
              </div>
            </div>

            <div className="mx-6 mb-7 bg-surface border border-border2 rounded-xl overflow-hidden">
              <div className="bg-accent p-3 flex justify-between items-center text-white">
                <div>
                  <div className="text-[13px] font-semibold mb-px">Weekly Revenue Report</div>
                  <div className="text-[11px] opacity-65">Week of 17–22 March 2025 · Dr. Wanjiku Dental</div>
                </div>
                <div className="bg-white/20 text-[10px] font-semibold px-2 py-1 rounded-full tracking-[0.06em]">AUTO-GENERATED</div>
              </div>
              <div className="p-4">
                <div className="text-[13px] text-ink2 leading-[1.6] border-b border-border pb-3 mb-3">
                  Your clinic collected <strong>KES 82,400</strong> this week — up 11% on last week. However, our system identified <strong>KES 18,200 in unbilled procedures</strong>. Here is exactly where the gaps are and what to action:
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start text-[12px]">
                    <div className="text-ink2 flex-1 pr-3">Scaling + polishing (18 Mar) — procedure in clinical log, no invoice raised</div>
                    <div className="font-mono font-medium text-warn whitespace-nowrap">–KES 6,500</div>
                  </div>
                  <div className="flex justify-between items-start text-[12px]">
                    <div className="text-ink2 flex-1 pr-3">Composite filling (20 Mar) — materials charged, procedure unbilled</div>
                    <div className="font-mono font-medium text-warn whitespace-nowrap">–KES 8,200</div>
                  </div>
                  <div className="flex justify-between items-start text-[12px]">
                    <div className="text-ink2 flex-1 pr-3">Consultation follow-up (22 Mar) — appointment complete, no charge</div>
                    <div className="font-mono font-medium text-warn whitespace-nowrap">–KES 3,500</div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border2 flex justify-between items-center font-semibold text-[13px]">
                  <span>Total recoverable this week</span>
                  <span className="font-mono text-[16px] text-warn">KES 18,200</span>
                </div>
              </div>
            </div>

            <div className="mx-6 mb-6 bg-surface border border-border2 rounded-xl p-4.5">
              <div className="text-[13px] font-semibold text-ink mb-3.5">Revenue recovery calculator</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[12px] text-ink3 min-w-[130px]">Monthly procedures</div>
                <input type="range" className="flex-1 accent-accent" min="20" max="300" value={roiProcs} onChange={e => setRoiProcs(parseInt(e.target.value))} />
                <div className="font-mono text-[13px] text-accent min-w-[70px] text-right">{roiProcs}</div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[12px] text-ink3 min-w-[130px]">Avg. procedure value (KES)</div>
                <input type="range" className="flex-1 accent-accent" min="2000" max="20000" step="500" value={roiVal} onChange={e => setRoiVal(parseInt(e.target.value))} />
                <div className="font-mono text-[13px] text-accent min-w-[70px] text-right">{roiVal.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[12px] text-ink3 min-w-[130px]">Estimated leakage rate</div>
                <input type="range" className="flex-1 accent-accent" min="5" max="30" value={roiLeak} onChange={e => setRoiLeak(parseInt(e.target.value))} />
                <div className="font-mono text-[13px] text-accent min-w-[70px] text-right">{roiLeak}%</div>
              </div>
              <div className="bg-accent-pale border border-accent/20 rounded-md p-3.5 mt-1">
                <div className="text-[11px] text-ink3 uppercase tracking-[0.07em] mb-1">Estimated monthly recovery</div>
                <div className="font-mono text-[24px] font-medium text-accent">KES {recovered.toLocaleString()}</div>
                <div className="text-[11px] text-ink3 mt-1">At a KES 12,000/mo subscription, that's a <span className="font-semibold text-accent">{ratio}×</span> return on investment.</div>
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP */}
        {activeSection === 'roadmap' && (
          <div className="animate-in fade-in duration-500">
            <div className="px-6 pt-6 pb-5">
              <div className="font-serif text-[22px] tracking-[-0.4px] mb-1">From idea to execution</div>
              <div className="text-[12px] text-ink3">
                {segment === 'private' 
                  ? 'Consulting funds the product. Product becomes the business.'
                  : 'Validating the public sector gap. Securing government partnerships.'}
              </div>
            </div>
            <div className="px-6 pb-7">
              <div className="grid grid-cols-[100px_1fr] gap-4 mb-5 relative">
                <div className="absolute left-[49px] top-8 bottom-[-20px] w-[1.5px] bg-border2"></div>
                <div className="text-right pt-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.06em] uppercase bg-accent-light text-accent border border-accent/50">Now</div>
                  <div className="text-[10px] text-ink3 mt-1">Months 0–6</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface outline outline-[1.5px] outline-accent absolute left-[45px] top-2.5"></div>
                <div className="bg-surface border border-border2 rounded-xl p-3.5">
                  <h4 className="text-[13px] font-semibold text-ink mb-1.5">
                    {segment === 'private' ? 'Validate through NanostrategyKE' : 'Government Partnership Engagement'}
                  </h4>
                  <p className="text-[12px] text-ink3 leading-[1.5]">
                    {segment === 'private' 
                      ? 'Run 3–5 paid clinic audits. Quantify missed billing per clinic. Every engagement produces at least one concrete product insight.'
                      : 'MoH and county health engagement is a Month 1 priority. Secure a Letter of Support / MoU with a county health department.'}
                  </p>
                  <ul className="pl-3.5 mt-1.5 list-disc text-[12px] text-ink3 leading-[1.45]">
                    {segment === 'private' ? (
                      <>
                        <li className="mb-0.5">Build case studies with real KES numbers</li>
                        <li className="mb-0.5">Validate willingness to pay (target: KES 8k–15k/mo)</li>
                        <li className="mb-0.5">Recruit first 3 pilot beta clients</li>
                        <li className="mb-0.5">Consulting capped at 60% of founder time after month 6</li>
                      </>
                    ) : (
                      <>
                        <li className="mb-0.5">Audit data validates the public facility billing gap</li>
                        <li className="mb-0.5">Define cross-subsidy model from commercial revenue</li>
                        <li className="mb-0.5">Prepare for future grant rounds with county MoUs</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 mb-5 relative">
                <div className="absolute left-[49px] top-8 bottom-[-20px] w-[1.5px] bg-border2"></div>
                <div className="text-right pt-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.06em] uppercase bg-accent-light text-accent border border-accent/50">Build</div>
                  <div className="text-[10px] text-ink3 mt-1">Months 3–9</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface outline outline-[1.5px] outline-accent absolute left-[45px] top-2.5"></div>
                <div className="bg-surface border border-border2 rounded-xl p-3.5">
                  <h4 className="text-[13px] font-semibold text-ink mb-1.5">MVP — Kazira Clinical Intelligence</h4>
                  <p className="text-[12px] text-ink3 leading-[1.5]">
                    {segment === 'private' 
                      ? 'Ship the core three features. No autonomous agents. Accuracy over sophistication.'
                      : 'Ship the core detection engine with strict data residency and pseudonymisation.'}
                  </p>
                  <ul className="pl-3.5 mt-1.5 list-disc text-[12px] text-ink3 leading-[1.45]">
                    {segment === 'private' ? (
                      <>
                        <li className="mb-0.5">Missed billing detection engine</li>
                        <li className="mb-0.5">Revenue trend dashboard (daily / weekly / monthly)</li>
                        <li className="mb-0.5">Automated weekly plain-language report (LLM-powered)</li>
                        <li className="mb-0.5">Stack: React · Node.js · PostgreSQL · Vercel</li>
                      </>
                    ) : (
                      <>
                        <li className="mb-0.5">Kenya Data Protection Act 2019 DPIA compliance built-in</li>
                        <li className="mb-0.5">Kenya-hosted infrastructure for data residency</li>
                        <li className="mb-0.5">Role-based access: Facility Admin vs County Health vs MoH</li>
                        <li className="mb-0.5">Swahili-language interface and SMS report delivery</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 mb-5 relative">
                <div className="absolute left-[49px] top-8 bottom-[-20px] w-[1.5px] bg-border2"></div>
                <div className="text-right pt-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.06em] uppercase bg-gold-light text-gold border border-gold/50">Next</div>
                  <div className="text-[10px] text-ink3 mt-1">Months 9–18</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-gold border-2 border-surface outline outline-[1.5px] outline-gold absolute left-[45px] top-2.5"></div>
                <div className="bg-surface border border-border2 rounded-xl p-3.5">
                  <h4 className="text-[13px] font-semibold text-ink mb-1.5">
                    {segment === 'private' ? 'Scale to 20 paying clients' : 'Scale to 20 public/faith-based facilities'}
                  </h4>
                  <p className="text-[12px] text-ink3 leading-[1.5]">
                    {segment === 'private' 
                      ? 'Convert pilot clients to monthly SaaS subscriptions. Target KES 300k+ aggregate recovered revenue across client base.'
                      : 'Deploy across county facilities. Implement core integrations for seamless SHA claims reporting.'}
                  </p>
                  <ul className="pl-3.5 mt-1.5 list-disc text-[12px] text-ink3 leading-[1.45]">
                    {segment === 'private' ? (
                      <>
                        <li className="mb-0.5">Standard pricing: KES 15k–25k/mo</li>
                        <li className="mb-0.5">Expand from dental to general outpatient clinics</li>
                        <li className="mb-0.5">Identify the second feature clinic owners will pay for</li>
                        <li className="mb-0.5">Embed AI skills learning into at least one workflow</li>
                      </>
                    ) : (
                      <>
                        <li className="mb-0.5">KenyaEMR (FHIR API) and OpenMRS (REST API) integrations</li>
                        <li className="mb-0.5">DHIS2 API integration for SHA aggregate claims reporting</li>
                        <li className="mb-0.5">Bulk pricing negotiated at the county level</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-4 relative">
                <div className="text-right pt-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.06em] uppercase bg-surface2 text-ink3 border border-border2">Pipeline</div>
                  <div className="text-[10px] text-ink3 mt-1">24m+</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-ink3 border-2 border-surface outline outline-[1.5px] outline-ink3 absolute left-[45px] top-2.5"></div>
                <div className="bg-surface border border-border2 rounded-xl p-3.5">
                  <h4 className="text-[13px] font-semibold text-ink mb-1.5">DentRx · KaziX · Platform expansion</h4>
                  <p className="text-[12px] text-ink3 leading-[1.5]">Once 20 paying clients and KES 500k+ MRR. Not before. These are documented and parked.</p>
                  <ul className="pl-3.5 mt-1.5 list-disc text-[12px] text-ink3 leading-[1.45]">
                    <li className="mb-0.5">DentRx — contraindication and drug interaction agent at point of care</li>
                    <li className="mb-0.5">KaziX — workflow automation for broader East African SMEs</li>
                    <li className="mb-0.5">AI skills learning platform as standalone offering</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* METRICS */}
        {activeSection === 'metrics' && (
          <div className="animate-in fade-in duration-500">
            <div className="px-6 pt-6 pb-5">
              <div className="font-serif text-[22px] tracking-[-0.4px] mb-1">The only numbers that matter</div>
              <div className="text-[12px] text-ink3">Three metrics. Everything else is noise until these are healthy.</div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 px-6 mb-7">
              <div className="rounded-xl border border-border2 p-4 bg-surface border-t-[2.5px] border-t-accent">
                <div className="text-[18px] mb-2.5">👥</div>
                <h4 className="text-[13px] font-semibold text-ink mb-1">
                  {segment === 'private' ? 'Active clinic users' : 'Enrolled facilities'}
                </h4>
                <p className="text-[11px] text-ink3 leading-[1.4]">
                  {segment === 'private' 
                    ? 'Weekly logins. Proof the product is being used, not just purchased.'
                    : 'Facilities actively submitting SHA claims through the platform.'}
                </p>
                <div className="mt-2.5 font-mono text-[15px] font-medium text-accent2">
                  {segment === 'private' ? '20 clinics by month 18' : '20 public/faith-based facilities'}
                </div>
              </div>
              <div className="rounded-xl border border-border2 p-4 bg-surface border-t-[2.5px] border-t-warn">
                <div className="text-[18px] mb-2.5">💰</div>
                <h4 className="text-[13px] font-semibold text-ink mb-1">
                  {segment === 'private' ? 'Revenue recovered' : 'SHA Claims Pipeline'}
                </h4>
                <p className="text-[11px] text-ink3 leading-[1.4]">
                  {segment === 'private' 
                    ? 'KES recovered per clinic per month. Proof that the product actually works.'
                    : 'Reimbursement improvement is a primary outcome metric.'}
                </p>
                <div className="mt-2.5 font-mono text-[15px] font-medium text-accent2">
                  {segment === 'private' ? 'KES 300k+ aggregate' : '95%+ claims accuracy'}
                </div>
              </div>
              <div className="rounded-xl border border-border2 p-4 bg-surface border-t-[2.5px] border-t-gold">
                <div className="text-[18px] mb-2.5">📈</div>
                <h4 className="text-[13px] font-semibold text-ink mb-1">
                  {segment === 'private' ? 'MRR' : 'Cross-subsidy Health'}
                </h4>
                <p className="text-[11px] text-ink3 leading-[1.4]">
                  {segment === 'private' 
                    ? 'Monthly recurring SaaS revenue. Proof that the business works.'
                    : 'Commercial private-clinic revenue funding subsidised public deployments.'}
                </p>
                <div className="mt-2.5 font-mono text-[15px] font-medium text-accent2">
                  {segment === 'private' ? 'KES 500k+ MRR' : 'Sustainable scale'}
                </div>
              </div>
            </div>

            <div className="mx-6 mb-4 bg-accent rounded-xl p-5 text-white">
              <div className="text-[10px] tracking-[0.1em] uppercase opacity-60 mb-2">18-month north star</div>
              <div className="font-serif text-[20px] leading-[1.35] mb-3">
                {segment === 'private' 
                  ? '20 paying clinics. KES 300k recovered. A roadmap built from client requests, not assumptions.'
                  : '20 public facilities. Integrated with KenyaEMR & DHIS2. Sustaining services through accurate SHA claims.'}
              </div>
              <div className="text-[12px] opacity-70">
                {segment === 'private' 
                  ? 'And a clear answer to: what is the second feature clinic owners will pay for?'
                  : 'And a clear model for scaling across all 47 counties.'}
              </div>
            </div>

            <div className="mx-6 mb-4">
              <div className="font-serif text-[18px] tracking-[-0.3px] mb-3">The founder advantage</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-border2 rounded-xl p-4 bg-surface">
                  <div className="w-9 h-9 rounded-full bg-accent-light border border-accent/50 flex items-center justify-center text-[13px] text-accent mb-2.5">🦷</div>
                  <h4 className="text-[13px] font-semibold text-ink mb-1">Domain insider</h4>
                  <p className="text-[11px] text-ink3 leading-[1.5]">A practicing dental surgeon — understands clinical workflows from the inside, not from user research.</p>
                </div>
                <div className="border border-border2 rounded-xl p-4 bg-surface">
                  <div className="w-9 h-9 rounded-full bg-accent-light border border-accent/50 flex items-center justify-center text-[13px] text-accent mb-2.5">🤝</div>
                  <h4 className="text-[13px] font-semibold text-ink mb-1">Peer credibility</h4>
                  <p className="text-[11px] text-ink3 leading-[1.5]">Trusted by clinic owners as a colleague, not a software vendor — direct access to the initial customer segment.</p>
                </div>
                <div className="border border-border2 rounded-xl p-4 bg-surface">
                  <div className="w-9 h-9 rounded-full bg-accent-light border border-accent/50 flex items-center justify-center text-[13px] text-accent mb-2.5">🔍</div>
                  <h4 className="text-[13px] font-semibold text-ink mb-1">Billing pattern depth</h4>
                  <p className="text-[11px] text-ink3 leading-[1.5]">Can identify billing gaps a non-clinical founder simply would not recognise — it's invisible to outsiders.</p>
                </div>
                <div className="border border-border2 rounded-xl p-4 bg-surface">
                  <div className="w-9 h-9 rounded-full bg-accent-light border border-accent/50 flex items-center justify-center text-[13px] text-accent mb-2.5">⏱️</div>
                  <h4 className="text-[13px] font-semibold text-ink mb-1">Temporary edge</h4>
                  <p className="text-[11px] text-ink3 leading-[1.5]">This advantage must be converted to product depth and relationships before better-capitalised competitors arrive.</p>
                </div>
              </div>
            </div>

            <div className="text-center px-6 py-4 text-[11px] text-ink3 italic">
              Kazira · East Africa's AI workflow intelligence platform · Starting with healthcare.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
