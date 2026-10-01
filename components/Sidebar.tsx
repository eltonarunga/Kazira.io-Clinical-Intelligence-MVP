import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  ShieldCheck, 
  Cpu, 
  Network, 
  X,
  History,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Building,
  Check
} from 'lucide-react';
import { NavTab, UserProfile } from '../types';
import { KaziraMonogram, KaziraEmblem } from './KaziraLogo';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isDesktopOpen?: boolean;
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
  onOpenFaq?: () => void;
  onOpenDataVault?: () => void;
  onOpenCsvIngestion?: () => void;
  onTriggerAudit?: () => void;
  isAuditing?: boolean;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  historyCount?: number;
  recoveredTotal?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
  isDesktopOpen = true,
  activeProfile,
  profiles = [],
  onSwitchProfile,
  onSignOut,
  onNavigateToProfile,
  onOpenSettings,
  onToggleHistory,
  onOpenCsvIngestion,
  historyCount = 0,
  theme = 'light',
  onToggleTheme
}) => {
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  // Minimalist Core Navigation
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

  const handleAction = (action?: () => void) => {
    if (action) action();
    if (onCloseMobile) onCloseMobile();
  };

  const facilityShort = activeProfile 
    ? activeProfile.facilityName.split(' ')[0] + ' ' + (activeProfile.facilityName.split(' ')[1] || '')
    : 'Nairobi West';

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-ink/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Minimalist Sidebar Drawer */}
      <aside 
        id="app-sidebar-drawer"
        className={`fixed left-0 top-0 h-screen w-sidebar-width bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-zinc-800 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${isDesktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Top Header: Brand Mark & Facility Context */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 shrink-0">
          <button 
            onClick={() => handleSelect('overview')}
            className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-85 transition-opacity min-w-0"
            title="Kazira Clinical Intelligence"
          >
            <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center p-0.5 shadow-2xs shrink-0">
              <KaziraEmblem size={24} className="w-full h-full" />
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-head text-base text-ink dark:text-zinc-100 font-bold tracking-tight">
                Kazira
              </span>
              <span className="text-gray-300 dark:text-zinc-600 text-xs">/</span>
              <span className="text-xs text-ink2 dark:text-zinc-400 font-medium truncate max-w-[120px]" title={activeProfile?.facilityName}>
                {facilityShort}
              </span>
            </div>
          </button>
          
          <div className="flex items-center gap-1">
            {onToggleTheme && (
              <button
                id="sidebar-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                className="p-1.5 text-gray-500 hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode (primarily white)' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-zinc-600" />}
              </button>
            )}
            
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-gray-500 hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                aria-label="Close menu"
                title="Close menu"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Body Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-6">
          
          {/* Workspaces Section */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-2 pb-2 font-mono">
              Workspaces
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left text-xs font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-[#005235] text-white shadow-xs'
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/60 hover:text-ink dark:hover:text-white'
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

          {/* Quick Actions (Minimalist 3 items) */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-2 pb-1 font-mono">
              Quick Tools
            </div>
            
            {onOpenCsvIngestion && (
              <button
                type="button"
                onClick={() => handleAction(onOpenCsvIngestion)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer text-left"
              >
                <FileSpreadsheet size={15} className="shrink-0 text-gray-400 dark:text-zinc-500" />
                <span className="truncate">Ingest CSV / Records</span>
              </button>
            )}

            {onToggleHistory && (
              <button
                type="button"
                onClick={() => handleAction(onToggleHistory)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <History size={15} className="shrink-0 text-gray-400 dark:text-zinc-500" />
                  <span className="truncate">Audit History</span>
                </div>
                {historyCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold">
                    {historyCount}
                  </span>
                )}
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => handleAction(onOpenSettings)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer text-left"
              >
                <SettingsIcon size={15} className="shrink-0 text-gray-400 dark:text-zinc-500" />
                <span className="truncate">Facility Settings</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Pinned Profile & Sign Out Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-[#141414] shrink-0 space-y-2">
          {/* Profile Row */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleAction(onNavigateToProfile)}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group flex-1"
              title="View practitioner profile"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${activeProfile?.avatarColor || 'bg-[#005235] text-white'}`}>
                {activeProfile?.avatarMonogram || 'AM'}
              </div>
              <div className="min-w-0 truncate">
                <span className="text-xs font-bold text-ink dark:text-zinc-100 block truncate group-hover:text-[#005235] dark:group-hover:text-emerald-400 transition-colors">
                  {activeProfile?.name || 'Practitioner'}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 block truncate font-mono">
                  {activeProfile?.facilityCode || 'MFL #14920'}
                </span>
              </div>
            </button>

            {onSignOut && (
              <button
                type="button"
                onClick={() => handleAction(onSignOut)}
                className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer shrink-0"
                title="Sign out of facility session"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          {/* Optional Profile Switcher (Compact Dropdown) */}
          {profiles.length > 1 && onSwitchProfile && (
            <div className="pt-1 border-t border-gray-200/50 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                className="w-full flex items-center justify-between py-1 text-[10px] font-medium text-gray-500 dark:text-zinc-400 hover:text-ink dark:hover:text-zinc-200 cursor-pointer"
              >
                <span>Switch Facility / Account ({profiles.length})</span>
                <ChevronDown size={11} className={`transition-transform ${showProfileSwitcher ? 'rotate-180' : ''}`} />
              </button>

              {showProfileSwitcher && (
                <div className="mt-1 space-y-0.5 max-h-[110px] overflow-y-auto">
                  {profiles.map((p) => {
                    const isCurrent = p.id === activeProfile.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSwitchProfile(p);
                          setShowProfileSwitcher(false);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between p-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                          isCurrent 
                            ? 'bg-[#005235]/10 text-[#005235] dark:text-emerald-400 font-semibold' 
                            : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="truncate text-[11px]">{p.facilityName}</span>
                        {isCurrent && <Check size={11} className="shrink-0 ml-1 text-[#005235] dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
