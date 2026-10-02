import React from 'react';
import { 
  Menu,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { UserProfile, NavTab } from '../types';
import { KaziraMonogram, KaziraEmblem } from './KaziraLogo';

export interface AppHeaderProps {
  onToggleMobileSidebar: () => void;
  activeProfile: UserProfile;
  profiles?: UserProfile[];
  onSwitchProfile?: (profile: UserProfile) => void;
  onSignInAsGuest?: () => void;
  onSignOut?: () => void;
  onNavigateToProfile: () => void;
  onNavigateHome?: () => void;
  activeTab?: NavTab;
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
  shaPendingTotal?: string;
  isDesktopSidebarOpen?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleMobileSidebar,
  activeProfile,
  onNavigateToProfile,
  onNavigateHome,
  activeTab,
  isDesktopSidebarOpen = true,
  theme = 'light',
  onToggleTheme,
  onSignOut
}) => {
  return (
    <header 
      id="app-header"
      role="banner"
      aria-label="Kazira Clinical Intelligence Header"
      className={`fixed top-0 left-0 ${isDesktopSidebarOpen ? 'lg:left-sidebar-width' : 'lg:left-0'} right-0 h-14 sm:h-16 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-outline-variant/20 z-40 px-3 sm:px-6 flex items-center justify-between gap-3 transition-[left] duration-300`}
    >
      {/* LEFT: Hamburger Menu Trigger & Brand Identity */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          id="hamburger-menu-trigger"
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center border border-transparent hover:border-outline-variant/30 active:scale-95"
          aria-label="Toggle Navigation Drawer & Shortcuts"
          title="Open Menu & Shortcuts"
        >
          <Menu size={20} />
        </button>

        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 text-left cursor-pointer hover:opacity-85 transition-opacity"
          title="Kazira Clinical Intelligence - Return to Dashboard"
          aria-label="Kazira Clinical Intelligence Home"
        >
          {/* Kazira Official Brand Mark: Healthcare Shield & Caduceus Emblem */}
          <div 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface border border-line flex items-center justify-center p-0.5 shrink-0 shadow-2xs"
            aria-hidden="true"
          >
            <KaziraEmblem size={24} className="w-full h-full" />
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
            <span className="font-headline-sm text-base sm:text-lg font-bold text-on-surface tracking-tight font-head">
              Kazira
            </span>
            <span className="hidden sm:inline text-outline-variant text-xs">•</span>
            <span className="text-xs text-on-surface-variant font-medium hidden sm:inline truncate max-w-[140px] md:max-w-[220px] lg:max-w-[320px]" title={`${activeProfile?.facilityName || 'Facility'} (${activeProfile?.facilityCode || ''})`}>
              {activeProfile?.facilityName || 'Nairobi West Memorial Hospital'}
            </span>
          </div>
        </button>
      </div>

      {/* RIGHT: Theme Toggle & Profile Button */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {onToggleTheme && (
          <button
            id="theme-mode-toggle"
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center border border-outline-variant/25 hover:border-outline-variant/50 bg-surface/50 active:scale-95"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode (primarily white)' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-ink2 hover:text-ink" />
            )}
          </button>
        )}

        <button
          id="profile-shortcut-trigger"
          onClick={onNavigateToProfile}
          title={`View Profile: ${activeProfile?.name || 'Administrator'}`}
          aria-label={`Open profile page for ${activeProfile?.name || 'Administrator'}`}
          className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-3 py-1 rounded-full border transition-all cursor-pointer select-none min-h-[40px] sm:min-h-[44px] active:scale-98 ${
            activeTab === 'profile' 
              ? 'bg-primary/15 border-primary ring-2 ring-primary/30 shadow-xs text-on-surface' 
              : 'bg-surface-container/60 hover:bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/40'
          }`}
        >
          {/* Avatar Monogram */}
          <div 
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
              activeProfile?.avatarColor || 'bg-[#005235] text-white'
            }`}
            aria-hidden="true"
          >
            {activeProfile?.avatarMonogram || 'AM'}
          </div>

          {/* Profile Name & Role (Desktop) */}
          <div className="hidden md:flex flex-col text-left pr-0.5">
            <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[130px] lg:max-w-[180px]">
              {(activeProfile?.name || 'Dr. Amina Mutua').split(',')[0]}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-on-surface-variant leading-none font-medium truncate max-w-[120px]">
                {activeProfile?.isGuest ? 'Guest Sandbox' : (activeProfile?.facilityCode || 'MFL #14920')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            </div>
          </div>
        </button>

        {onSignOut && (
          <button
            id="header-signout-btn"
            type="button"
            onClick={onSignOut}
            className="p-2 rounded-lg text-rose-700 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center border border-transparent hover:border-rose-200 dark:hover:border-rose-900 active:scale-95"
            aria-label="Sign out or switch facility account"
            title="Sign out / Switch Facility"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
