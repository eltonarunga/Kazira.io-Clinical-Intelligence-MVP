import React from 'react';
import { History, Tag, CheckCircle2 } from 'lucide-react';

const Changelog: React.FC = () => {
  return (
    <div className="space-y-6 text-ink2">
      <div className="bg-accent-pale p-5 rounded-xl border border-accent/20">
        <div className="flex items-center gap-3 mb-2">
          <History className="text-accent" size={22} />
          <h3 className="text-xl font-bold text-ink font-serif">Changelog</h3>
        </div>
        <p className="text-xs text-ink3">Historical record of releases and architectural updates for Kazira.</p>
      </div>

      <div className="space-y-6 text-sm">
        <div className="bg-surface2/50 p-5 rounded-xl border border-border2 space-y-3">
          <div className="flex items-center justify-between border-b border-border2 pb-2">
            <span className="font-bold text-ink font-serif flex items-center gap-1.5 text-base">
              <Tag size={16} className="text-accent" /> v1.2.0 — Production Financial Architecture
            </span>
            <span className="text-xs font-mono text-ink3">April 3, 2026</span>
          </div>
          <ul className="space-y-2 text-xs text-ink3">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
              <span><strong>Unified Design Language System:</strong> Codified color tokens, typography scales, card geometry, and modal standards.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
              <span><strong>Receivables & Debt Ledger:</strong> Added line-item debt resolution tracking with manual/automatic attribution tags.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
              <span><strong>Recovery Logbook & ROI Demonstration:</strong> Added pre/post baseline comparison formulas, running collected totals, and CSV export.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
              <span><strong>Consistent KES Currency:</strong> Strict prefixing across all charts, tables, cards, and modal components.</span>
            </li>
          </ul>
        </div>

        <div className="bg-surface2/30 p-5 rounded-xl border border-border2 space-y-3">
          <div className="flex items-center justify-between border-b border-border2 pb-2">
            <span className="font-bold text-ink font-serif flex items-center gap-1.5 text-base">
              <Tag size={16} className="text-ink3" /> v1.0.0 — Initial Release
            </span>
            <span className="text-xs font-mono text-ink3">March 31, 2026</span>
          </div>
          <ul className="space-y-2 text-xs text-ink3">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-ink3 shrink-0 mt-0.5" />
              <span><strong>Dual-Agent Architecture:</strong> Narrative generation paired with mathematical audit verification.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-ink3 shrink-0 mt-0.5" />
              <span><strong>Public/Private Split:</strong> Dedicated views for clinic owners and county health directors.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
