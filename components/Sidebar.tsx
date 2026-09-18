import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  ShieldCheck, 
  Cpu, 
  Network, 
  X,
  HelpCircle,
  Building,
  User,
  History,
  Share2,
  Check,
  Settings as SettingsIcon,
  Compass,
  Database,
  Sparkles,
  Activity,
  LogOut,
  UserCheck,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { NavTab, UserProfile } from '../types';
import { KaziraEmblem } from './KaziraLogo';

export interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isDesktopOpen?: boolean;
  onOpenFaq?: () => void;
  activeProfile: UserProfile;
  profiles?: UserProfile[];
  onSwitchProfile?: (profile: UserProfile) => void;
  onSignInAsGuest?: () => void;
  onSignOut?: () => void;
  onNavigateToProfile?: () => void;
  onRestartOnboarding?: () => void;
  serverOnline?: boolean | null;
  onOpenServerStatus?: () => void;
  onOpenSettings?: () => void;
  onToggleHistory?: () => void;
  onOpenDataVault?: () => void;
  onOpenCsvIngestion?: () => void;
  onTriggerAudit?: () => void;
  isAuditing?: boolean;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  historyCount?: number;
  recoveredTotal?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
  isDesktopOpen = true,
  onOpenFaq,
  activeProfile,
  profiles = [],
  onSwitchProfile,
  onSignInAsGuest,
  onSignOut,
  onNavigateToProfile,
  onRestartOnboarding,
  serverOnline = true,
  onOpenServerStatus,
  onOpenSettings,
  onToggleHistory,
  onOpenDataVault,
  onOpenCsvIngestion,
  onTriggerAudit,
  isAuditing = false,
  onShowToast,
  historyCount = 0,
  recoveredTotal = 'KES 3,420,000'
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Dashboard', icon: <TrendingUp size={18} /> },
    { id: 'debts', label: 'Unbilled Gaps', icon: <FileSpreadsheet size={18} /> },
    { id: 'sha_claims', label: 'Insurance & SHA', icon: <ShieldCheck size={18} /> },
    { id: 'ai_audit', label: 'AI Audit', icon: <Cpu size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Network size={18} /> },
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handleActionClick = (action?: () => void) => {
    if (action) action();
    if (onCloseMobile) onCloseMobile();
  };

  const handleShareBriefing = async () => {
    const shareData = {
      title: 'Kazira Clinical Intelligence Briefing',
      text: `${activeProfile.facilityName}: KES ${recoveredTotal} recovered with 100% KDPA compliance.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onShowToast) {
          onShowToast('Briefing Shared', 'Clinical intelligence dossier shared successfully.', 'success');
        }
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(
        `Kazira Clinical Intelligence Dossier - ${activeProfile.facilityName}\nRecovered: ${recoveredTotal} | KDPA 2019 Sovereign Verified\n${window.location.href}`
      );
      setIsCopied(true);
      if (onShowToast) {
        onShowToast('Link Copied', 'Executive briefing link copied to clipboard.', 'success');
      }
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      if (onShowToast) {
        onShowToast('Share Notice', 'Direct share unavailable in iframe; link ready.', 'info');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'guest':
        return { label: 'Guest Sandbox', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'county_health':
        return { label: 'County Health', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'moh':
        return { label: 'MoH Oversight', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'facility_admin':
      default:
        return { label: 'Facility Admin', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
    }
  };

  const roleBadge = getRoleBadge(activeProfile.role);
  const facilityShort = activeProfile 
    ? activeProfile.facilityName.split(' ')[0] + ' ' + (activeProfile.facilityName.split(' ')[1] || '')
    : 'Nairobi West';

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-ink/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sovereign Sidebar Navigation Drawer & Shortcuts Menu */}
      <aside 
        id="app-sidebar-drawer"
        className={`fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${isDesktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
        role="navigation"
        aria-label="Main Navigation and System Shortcuts"
      >
        {/* Top Brand & Facility Header */}
        <div className="h-16 px-space-base flex items-center justify-between border-b border-outline-variant/20 shrink-0">
          <button 
            onClick={() => handleSelect('overview')}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity min-w-0"
            title="Kazira Clinical Intelligence - Return to Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center p-1 shadow-2xs shrink-0">
              <KaziraEmblem size={24} className="w-full h-full" />
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-headline-sm text-base text-on-surface font-bold tracking-tight">
                Kazira
              </span>
              <span className="text-outline-variant text-xs">/</span>
              <span className="text-xs text-on-surface-variant font-medium truncate max-w-[120px]" title={activeProfile?.facilityName || 'Nairobi West Memorial'}>
                {facilityShort}
              </span>
            </div>
          </button>
          
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md cursor-pointer transition-colors"
              aria-label="Close menu"
              title="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Content: Navigation, AI Engine, Shortcuts, Profile */}
        <div className="flex-1 overflow-y-auto min-h-0 px-space-sm py-space-sm space-y-4">
          
          {/* SECTION 1: Primary Navigation Links */}
          <div>
            <div className="text-[10px] font-bold text-outline uppercase tracking-wider px-2 pb-1.5 font-label-mono">
              Workspaces
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-space-sm px-3 py-2 rounded-lg transition-all text-left font-body-sm text-sm cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SECTION 2: Clinical Control & AI Engine (Moved from Shortcut Menu) */}
          <div className="pt-2 border-t border-outline-variant/15 space-y-2">
            <div className="text-[10px] font-bold text-outline uppercase tracking-wider px-2 font-label-mono">
              Clinical Control &amp; AI Engine
            </div>

            {/* Run Dual-Loop AI Audit Button */}
            {onTriggerAudit && (
              <button
                id="shortcut-run-audit"
                type="button"
                onClick={() => handleActionClick(onTriggerAudit)}
                disabled={isAuditing}
                className="w-full min-h-[42px] py-2.5 px-3 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-between shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden select-none"
                title="Trigger automated clinical narrative and arithmetic audit"
                aria-label="Trigger automated clinical narrative and arithmetic audit"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isAuditing ? (
                    <Cpu size={15} className="animate-spin text-amber-300 shrink-0" />
                  ) : (
                    <Sparkles size={15} className="text-amber-300 shrink-0" />
                  )}
                  <span className="truncate">{isAuditing ? 'Auditing Encounters...' : 'Run AI Audit'}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 bg-black/20 px-1.5 py-0.5 rounded shrink-0">
                  Gemini
                </span>
              </button>
            )}

            {/* Recovered Total Metric Capsule */}
            <div id="sidebar-metric-recovered" className="min-h-[42px] px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-2 min-w-0">
                <Activity size={15} className="text-primary shrink-0" />
                <div className="min-w-0 truncate">
                  <span className="text-on-surface-variant text-[10px] block leading-none">Total Recovered</span>
                  <span className="font-bold text-primary font-mono text-xs leading-tight block truncate">{recoveredTotal}</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                {activeProfile.isGuest ? '81% Rate' : 'Verified'}
              </span>
            </div>

            {/* Server & Sovereign Status */}
            {onOpenServerStatus && (
              <button
                id="shortcut-server-status"
                type="button"
                onClick={() => handleActionClick(onOpenServerStatus)}
                className="w-full min-h-[42px] px-3 py-2 rounded-lg hover:bg-surface-container text-left transition-colors flex items-center justify-between text-xs cursor-pointer border border-outline-variant/15 hover:border-outline-variant/30 bg-surface/60 select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                title="View sovereign server node telemetry"
                aria-label="View sovereign server node telemetry"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${serverOnline ? 'bg-primary animate-pulse' : 'bg-amber-500'}`} />
                  <div className="min-w-0 truncate">
                    <span className="font-medium text-on-surface block text-xs truncate">
                      {serverOnline ? 'Sovereign Node Online' : 'Offline Vault Synced'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block truncate">Nairobi DC • KDPA 2019</span>
                  </div>
                </div>
                <ChevronDown size={13} className="-rotate-90 text-outline shrink-0" />
              </button>
            )}
          </div>

          {/* SECTION 3: Shortcuts & Operational Tools (Moved from Shortcut Menu) */}
          <div className="pt-2 border-t border-outline-variant/15 space-y-2">
            <div className="text-[10px] font-bold text-outline uppercase tracking-wider px-2 font-label-mono">
              Shortcuts &amp; Tools
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Audit History */}
              {onToggleHistory && (
                <button
                  id="shortcut-history"
                  type="button"
                  onClick={() => handleActionClick(onToggleHistory)}
                  className="h-10 min-h-[40px] px-2.5 flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface hover:bg-surface-container hover:border-outline-variant/50 text-on-surface transition-all duration-150 cursor-pointer shadow-2xs group text-left w-full select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                  title="View previous AI audit logs"
                  aria-label="View previous AI audit logs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-surface-container-high/80 border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary group-hover:text-primary-container transition-colors">
                      <History size={13} />
                    </div>
                    <span className="text-xs font-medium text-on-surface truncate">History</span>
                  </div>
                  {historyCount > 0 && (
                    <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1 leading-none">
                      {historyCount}
                    </span>
                  )}
                </button>
              )}

              {/* Ingest CSV */}
              {onOpenCsvIngestion && (
                <button
                  id="shortcut-ingest-csv"
                  type="button"
                  onClick={() => handleActionClick(onOpenCsvIngestion)}
                  className="h-10 min-h-[40px] px-2.5 flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface hover:bg-surface-container hover:border-outline-variant/50 text-on-surface transition-all duration-150 cursor-pointer shadow-2xs group text-left w-full select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                  title="Ingest hospital encounter CSV records"
                  aria-label="Ingest hospital encounter CSV records"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-surface-container-high/80 border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary group-hover:text-primary-container transition-colors">
                      <FileSpreadsheet size={13} />
                    </div>
                    <span className="text-xs font-medium text-on-surface truncate">Ingest CSV</span>
                  </div>
                </button>
              )}

              {/* Data Vault */}
              {onOpenDataVault && (
                <button
                  id="shortcut-data-vault"
                  type="button"
                  onClick={() => handleActionClick(onOpenDataVault)}
                  className="h-10 min-h-[40px] px-2.5 flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface hover:bg-surface-container hover:border-outline-variant/50 text-on-surface transition-all duration-150 cursor-pointer shadow-2xs group text-left w-full select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                  title="KDPA Sovereign Data Vault"
                  aria-label="Open KDPA Sovereign Data Vault"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-surface-container-high/80 border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary group-hover:text-primary-container transition-colors">
                      <Database size={13} />
                    </div>
                    <span className="text-xs font-medium text-on-surface truncate">Data Vault</span>
                  </div>
                </button>
              )}

              {/* Settings */}
              {onOpenSettings && (
                <button
                  id="shortcut-settings"
                  type="button"
                  onClick={() => handleActionClick(onOpenSettings)}
                  className="h-10 min-h-[40px] px-2.5 flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface hover:bg-surface-container hover:border-outline-variant/50 text-on-surface transition-all duration-150 cursor-pointer shadow-2xs group text-left w-full select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                  title="Facility configuration and tariffs"
                  aria-label="Open Facility Configuration and Settings"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-surface-container-high/80 border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary group-hover:text-primary-container transition-colors">
                      <SettingsIcon size={13} />
                    </div>
                    <span className="text-xs font-medium text-on-surface truncate">Settings</span>
                  </div>
                </button>
              )}

              {/* Take Tour */}
              {onRestartOnboarding && (
                <button
                  id="shortcut-take-tour"
                  type="button"
                  onClick={() => handleActionClick(onRestartOnboarding)}
                  className="h-10 min-h-[40px] px-2.5 flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface hover:bg-surface-container hover:border-outline-variant/50 text-on-surface transition-all duration-150 cursor-pointer shadow-2xs group text-left w-full select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                  title="Restart onboarding walkthrough"
                  aria-label="Restart Onboarding Guided Tour"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-surface-container-high/80 border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary group-hover:text-primary-container transition-colors">
                      <Compass size={13} />
                    </div>
                    <span className="text-xs font-medium text-on-surface truncate">Take Tour</span>
                  </div>
                </button>
              )}

              {/* Knowledge Base & FAQ */}
              {onOpenFaq && (
                <button
                  id="shortcut-faq"
                  type="button"
                  onClick={() => handleActionClick(onOpenFaq)}
                  className="h-10 min-h-[40px] px-2.5 flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface hover:bg-surface-container hover:border-outline-variant/50 text-on-surface transition-all duration-150 cursor-pointer shadow-2xs group text-left w-full select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                  title="KDPA and SHA Claims FAQ"
                  aria-label="Open System FAQ and Clinical Knowledge Base"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-surface-container-high/80 border border-outline-variant/20 flex items-center justify-center shrink-0 text-primary group-hover:text-primary-container transition-colors">
                      <HelpCircle size={13} />
                    </div>
                    <span className="text-xs font-medium text-on-surface truncate">FAQ &amp; Help</span>
                  </div>
                </button>
              )}

              {/* Share Briefing (Span 2) */}
              <button
                id="shortcut-share-briefing"
                type="button"
                onClick={handleShareBriefing}
                className="col-span-2 h-10 min-h-[40px] px-2.5 flex items-center justify-between rounded-lg border border-outline-variant/25 bg-surface hover:bg-surface-container hover:border-outline-variant/50 text-on-surface transition-all duration-150 cursor-pointer shadow-2xs group text-left w-full select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden"
                title="Share or copy executive dossier link"
                aria-label="Share or copy executive dossier link"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    isCopied 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-surface-container-high/80 text-primary border-outline-variant/20 group-hover:text-primary-container'
                  }`}>
                    {isCopied ? <Check size={13} /> : <Share2 size={13} />}
                  </div>
                  <span className={`text-xs font-medium truncate ${isCopied ? 'text-emerald-800 font-semibold' : 'text-on-surface'}`}>
                    {isCopied ? 'Link Copied to Clipboard!' : 'Share Briefing Dossier'}
                  </span>
                </div>
                <span className={`text-[10px] font-mono shrink-0 ml-1.5 px-1.5 py-0.5 rounded border transition-colors ${
                  isCopied
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'text-outline bg-surface-container-high/60 border-outline-variant/20'
                }`}>
                  {isCopied ? 'COPIED' : 'KDPA'}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 4: Session, Evaluator Switcher & Profile (Moved from Shortcut Menu) */}
          <div className="pt-2 border-t border-outline-variant/15 space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider font-label-mono">
                Session &amp; Account
              </span>
              {onSignOut && (
                <button
                  onClick={() => handleActionClick(onSignOut)}
                  className="text-[11px] text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  title="Sign out of facility session"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

            {/* Profile Overview Card */}
            <div 
              onClick={() => {
                if (onNavigateToProfile) onNavigateToProfile();
                else handleSelect('profile');
              }}
              className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer group"
              title="Click to view full practitioner profile"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                      activeProfile.avatarColor || 'bg-primary text-white'
                    }`}
                  >
                    {activeProfile.avatarMonogram}
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {activeProfile.name}
                      </span>
                      <ArrowRight size={11} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <span className="text-[10px] text-on-surface-variant block truncate">
                      {activeProfile.title}
                    </span>
                  </div>
                </div>

                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>

              {/* Facility & KDPA MFL tag */}
              <div className="mt-2 pt-1.5 border-t border-outline-variant/15 flex items-center justify-between text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-1.5 truncate">
                  <Building size={12} className="text-primary shrink-0" />
                  <span className="truncate text-[10px] font-medium">{activeProfile.facilityName}</span>
                </div>
                <span className="font-mono text-[9px] text-primary shrink-0 font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                  {activeProfile.facilityCode}
                </span>
              </div>
            </div>

            {/* Guest Sandbox Mode Fast Toggle */}
            {activeProfile.isGuest ? (
              <div id="shortcut-guest-toggle" className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-950 text-[11px]">Guest Sandbox Active</span>
                  <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1 rounded">Simulation</span>
                </div>
                {profiles.length > 0 && onSwitchProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchProfile(profiles[0]);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full py-1 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserCheck size={12} />
                    <span>Switch to Facility Admin</span>
                  </button>
                )}
              </div>
            ) : (
              onSignInAsGuest && (
                <div id="shortcut-guest-toggle" className="px-2 py-1.5 bg-surface rounded-lg border border-outline-variant/15 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant text-[11px]">Want sandbox mode?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onSignInAsGuest();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="text-primary font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span>Guest Mode</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              )
            )}

            {/* Profile Switcher Toggle & List */}
            {profiles.length > 1 && onSwitchProfile && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-medium text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <span>Switch Role / Facility ({profiles.length})</span>
                  <ChevronDown size={12} className={`transition-transform ${showProfileSwitcher ? 'rotate-180' : ''}`} />
                </button>

                {showProfileSwitcher && (
                  <div className="mt-1 space-y-1 max-h-[120px] overflow-y-auto pr-1">
                    {profiles.map((p) => {
                      const isCurrent = p.id === activeProfile.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSwitchProfile(p);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                            isCurrent 
                              ? 'bg-primary/10 border border-primary/30 text-on-surface font-semibold' 
                              : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${p.avatarColor || 'bg-primary text-white'}`}>
                              {p.avatarMonogram}
                            </div>
                            <div className="truncate">
                              <span className="block truncate text-[11px] leading-tight font-medium text-on-surface">
                                {p.name}
                              </span>
                              <span className="block text-[9px] text-outline truncate leading-tight">
                                {p.title}
                              </span>
                            </div>
                          </div>
                          {isCurrent && (
                            <Check size={12} className="text-primary shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Sovereign Footer */}
        <div className="p-space-sm border-t border-outline-variant/20 bg-surface-container-low shrink-0 flex items-center justify-between text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium text-on-surface text-[10px]">
              {activeProfile?.isGuest ? 'Sandbox Active' : 'KDPA Protected'}
            </span>
          </div>
          <span className="font-label-mono text-[10px] text-outline">v2.8.3</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

