import React from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Lock, 
  Phone, 
  Mail, 
  Database, 
  MessageSquareQuote,
  Sparkles,
  GitBranch,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';
import { KaziraEmblem } from './KaziraLogo';

interface AppFooterProps {
  activeProfile: UserProfile;
  serverOnline?: boolean | null;
  onOpenDocs: () => void;
  onOpenFaq: () => void;
  onOpenChangelog: () => void;
  onOpenDpa: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onOpenFeedback: () => void;
  onOpenDataManagement: () => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  activeProfile,
  serverOnline = true,
  onOpenDocs,
  onOpenFaq,
  onOpenChangelog,
  onOpenDpa,
  onOpenTerms,
  onOpenPrivacy,
  onOpenFeedback,
  onOpenDataManagement
}) => {
  // Format facility code cleanly without duplicate 'MFL #'
  const cleanMfl = activeProfile.facilityCode
    ? activeProfile.facilityCode.replace(/^(MFL\s*#?\s*)+/i, 'MFL #')
    : 'MFL #14920';

  const facilityTypeLabel = activeProfile.isGuest
    ? 'Sandbox Evaluator'
    : activeProfile.facilityType === 'private'
    ? 'Private RCM Facility'
    : 'Public / Faith-Based Facility';

  return (
    <footer id="app-institutional-footer" className="w-full border-t border-outline-variant/20 bg-surface-container-lowest/90 backdrop-blur-xs py-6 sm:py-8 mt-auto text-on-surface-variant transition-colors">
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-gutter-desktop space-y-6">
        
        {/* Main Footer Block: Brand Context & Navigation Groups */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/15">
          
          {/* Left Column: Brand, Facility Context & KDPA Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-center p-0.5 shrink-0">
                <KaziraEmblem size={20} className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-md font-bold text-on-surface text-sm tracking-tight font-head">
                    Kazira
                  </span>
                  <span className="text-[10px] font-label-mono font-medium px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                    v2.7
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant/80 font-body">
                  Clinical Intelligence &amp; Revenue Assurance
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-outline-variant/30 mx-1" />

            {/* Active Facility Context Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/25 text-xs text-on-surface font-medium">
                <Building2 size={13} className="text-primary shrink-0" />
                <span className="font-semibold">{cleanMfl}</span>
                <span className="text-outline">•</span>
                <span className="truncate max-w-[180px] sm:max-w-[240px] text-on-surface-variant">
                  {activeProfile.facilityName}
                </span>
              </div>

              {/* KDPA Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                <span>KDPA 2019 Sovereign</span>
              </div>
            </div>
          </div>

          {/* Right Column: Grouped Action Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-body">
            {/* Resources Group */}
            <div className="flex items-center gap-4">
              <button 
                id="footer-nav-faq"
                onClick={onOpenFaq} 
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-semibold text-primary"
              >
                <HelpCircle size={13} />
                <span>System FAQ</span>
              </button>
              <button 
                id="footer-nav-docs"
                onClick={onOpenDocs} 
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                <FileText size={13} />
                <span>API &amp; Docs</span>
              </button>
              <button 
                id="footer-nav-changelog"
                onClick={onOpenChangelog} 
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                <GitBranch size={13} />
                <span>Changelog</span>
              </button>
            </div>

            <div className="hidden sm:block h-3.5 w-px bg-outline-variant/30" />

            {/* Legal & Governance */}
            <div className="flex items-center gap-4">
              <button 
                id="footer-nav-privacy"
                onClick={onOpenPrivacy} 
                className="hover:text-on-surface transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <button 
                id="footer-nav-terms"
                onClick={onOpenTerms} 
                className="hover:text-on-surface transition-colors cursor-pointer"
              >
                Terms
              </button>
              <button 
                id="footer-nav-dpa"
                onClick={onOpenDpa} 
                className="hover:text-on-surface transition-colors cursor-pointer"
              >
                KDPA DPA
              </button>
            </div>

            <div className="hidden md:block h-3.5 w-px bg-outline-variant/30" />

            {/* Support Tools */}
            <div className="flex items-center gap-3">
              <button 
                id="footer-nav-feedback"
                onClick={onOpenFeedback} 
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 text-on-surface-variant hover:text-on-surface"
              >
                <MessageSquareQuote size={13} />
                <span>Feedback</span>
              </button>
              <button 
                id="footer-nav-vault"
                onClick={onOpenDataManagement} 
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 text-on-surface-variant hover:text-on-surface"
              >
                <Database size={13} />
                <span>Data Vault</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Secondary Sub-line: Copyright, Direct Support, & Security Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant/75 font-body">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Kazira Health Technologies Ltd.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Built for Kenyan Health Systems</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-body">
            <a 
              id="footer-contact-tel"
              href="tel:+254700000000" 
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Phone size={12} className="text-primary/70" />
              <span>+254 700 000 000</span>
            </a>
            <span className="text-outline/40">•</span>
            <a 
              id="footer-contact-email"
              href="mailto:support@kazira.io" 
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Mail size={12} className="text-primary/70" />
              <span>support@kazira.io</span>
            </a>
            <span className="text-outline/40">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-label-mono text-outline">
              <CheckCircle2 size={11} className="text-emerald-600" />
              <span>Sovereign Local Node</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default AppFooter;
