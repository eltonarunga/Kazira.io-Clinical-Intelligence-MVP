
import React from 'react';
import { FileText, CheckCircle2, Info, List, Table, Zap } from 'lucide-react';

const DataInputGuide: React.FC = () => {
  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2 text-blue-800 font-bold border-b border-blue-100 pb-3">
        <Info size={20} />
        <h3 className="uppercase tracking-tight text-sm">Data Input Blueprint</h3>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
            1
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Gather Key Metrics</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collect stats for the current and previous week: Revenue (Procedures vs Consults), 
              Appointment counts, Capacity, and Practitioner performance (Patients seen vs targets).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
            2
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Choose Your Format</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Our Narrative Agent accepts two primary formats for maximum analysis accuracy:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col items-center text-center gap-2">
                <List size={16} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-700 uppercase">Markdown</span>
                <p className="text-[9px] text-slate-500 italic">Best for narrative context & notes</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col items-center text-center gap-2">
                <Table size={16} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-700 uppercase">CSV</span>
                <p className="text-[9px] text-slate-500 italic">Best for raw numerical dumps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-blue-200">
            3
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Instant Start: Load Sample
              <Zap size={14} className="text-yellow-500 fill-current" />
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              New to Kazira? Click the <span className="font-bold text-blue-600 underline">"Load Sample"</span> button in the input header. 
              This populates the area with a gold-standard data set, allowing you to see exactly how specific the system can be.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-blue-100">
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase">
          <CheckCircle2 size={12} />
          Analysis Ready: Narrative + Audit Agents
        </div>
      </div>
    </div>
  );
};

export default DataInputGuide;
