
import React from 'react';
import { FileText, CheckCircle2, Info, List, Table, Zap } from 'lucide-react';

const DataInputGuide: React.FC = () => {
  return (
    <div className="bg-surface2 border border-border2 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2 text-ink2 font-bold border-b border-border2 pb-3">
        <Info size={20} className="text-accent" />
        <h3 className="uppercase tracking-tight text-sm">Data Input Blueprint</h3>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-accent/20">
            1
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-ink2 text-sm">Gather Key Metrics</h4>
            <p className="text-xs text-ink3 leading-relaxed">
              Collect stats for the current and previous week: Revenue (Procedures vs Consults), 
              Appointment counts, Capacity, and Practitioner performance (Patients seen vs targets).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-accent/20">
            2
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-ink2 text-sm">Choose Your Format</h4>
            <p className="text-xs text-ink3 leading-relaxed mb-2">
              Our Narrative Agent accepts two primary formats for maximum analysis accuracy:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface p-3 rounded-lg border border-border2 flex flex-col items-center text-center gap-2">
                <List size={16} className="text-accent" />
                <span className="text-[10px] font-bold text-ink2 uppercase">Markdown</span>
                <p className="text-[9px] text-ink3 italic">Best for narrative context & notes</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border2 flex flex-col items-center text-center gap-2">
                <Table size={16} className="text-accent" />
                <span className="text-[10px] font-bold text-ink2 uppercase">CSV</span>
                <p className="text-[9px] text-ink3 italic">Best for raw numerical dumps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-accent/20">
            3
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-ink2 text-sm flex items-center gap-2">
              Instant Start: Load Sample
              <Zap size={14} className="text-gold fill-current" />
            </h4>
            <p className="text-xs text-ink3 leading-relaxed">
              New to Kazira? Click the <span className="font-bold text-accent underline">"Load Sample"</span> button in the input header. 
              This populates the area with a gold-standard data set, allowing you to see exactly how specific the system can be.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-accent2 uppercase">
          <CheckCircle2 size={12} />
          Analysis Ready: Narrative + Audit Agents
        </div>
      </div>
    </div>
  );
};

export default DataInputGuide;
