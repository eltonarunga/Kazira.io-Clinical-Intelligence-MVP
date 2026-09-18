import React, { useState } from 'react';
import { 
  User, 
  Building, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  LogOut, 
  UserCheck, 
  Key, 
  Bell, 
  Server, 
  Save, 
  ArrowRight, 
  Sparkles,
  Award,
  FileCheck,
  Smartphone,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { DEFAULT_PROFILE } from '../../constants/profiles';

interface ProfileViewProps {
  activeProfile: UserProfile;
  profiles?: UserProfile[];
  onUpdateProfile: (updated: UserProfile) => void;
  onSwitchProfile: (profile: UserProfile) => void;
  onSignOut: () => void;
  onSignInAsGuest: () => void;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  activeProfile,
  profiles,
  onUpdateProfile,
  onSwitchProfile,
  onSignOut,
  onSignInAsGuest,
  onShowToast
}) => {
  // Form edit states
  const [name, setName] = useState(activeProfile.name);
  const [title, setTitle] = useState(activeProfile.title);
  const [email, setEmail] = useState(activeProfile.email);
  const [phone, setPhone] = useState(activeProfile.phone || '+254 722 849 102');
  const [department, setDepartment] = useState(activeProfile.department || 'Clinical Administration');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  // Sync state if active profile changes externally
  React.useEffect(() => {
    setName(activeProfile.name);
    setTitle(activeProfile.title);
    setEmail(activeProfile.email);
    setPhone(activeProfile.phone || '+254 722 849 102');
    setDepartment(activeProfile.department || 'Clinical Administration');
  }, [activeProfile.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: UserProfile = {
      ...activeProfile,
      name,
      title,
      email,
      phone,
      department
    };

    setTimeout(() => {
      onUpdateProfile(updated);
      setIsSaving(false);
      if (onShowToast) {
        onShowToast('Profile Updated', 'Your practitioner credentials and contact details have been saved.', 'success');
      }
    }, 400);
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'guest':
        return {
          title: 'Guest Sandbox Evaluator',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          desc: 'Read-only access to synthetic FHIR clinical encounters and unbilled recovery benchmarks.'
        };
      case 'county_health':
        return {
          title: 'County Health Director / MoH Liaison',
          badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          desc: 'County-wide epidemiological oversight, DHIS2 aggregate reporting, and public health analytics.'
        };
      case 'moh':
        return {
          title: 'Ministry of Health Oversight Inspector',
          badge: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          desc: 'National statutory health tariff compliance and KDPA sovereign audit inspection.'
        };
      case 'facility_admin':
      default:
        return {
          title: 'Facility Chief Medical Officer / Admin',
          badge: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          desc: 'Full administrative rights over unbilled gap ledgers, SHA pre-authorizations, and doctor attributions.'
        };
    }
  };

  const roleInfo = getRoleDisplay(activeProfile.role);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner & Identity Card */}
      <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar Monogram */}
            <div 
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-sm border border-outline-variant/20 ${
                activeProfile.avatarColor || 'bg-[#005235] text-white'
              }`}
            >
              {activeProfile.avatarMonogram}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight truncate">
                  {activeProfile.name}
                </h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${roleInfo.badge}`}>
                  {activeProfile.isGuest ? 'Guest Sandbox' : roleInfo.title}
                </span>
              </div>

              <p className="text-sm font-medium text-on-surface-variant mb-1">
                {activeProfile.title} • <span className="text-on-surface font-semibold">{activeProfile.facilityName}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-outline">
                <span className="font-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant/20 font-medium">
                  {activeProfile.facilityCode}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  <ShieldCheck size={14} />
                  KDPA 2019 Sovereign Verified
                </span>
                <span>•</span>
                <span className="truncate">{activeProfile.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Session Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/15">
            {activeProfile.isGuest ? (
              <button
                onClick={() => onSwitchProfile(DEFAULT_PROFILE)}
                className="px-3.5 py-2 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck size={14} />
                <span>Switch to Facility Admin</span>
              </button>
            ) : (
              <button
                onClick={onSignInAsGuest}
                className="px-3.5 py-2 bg-surface hover:bg-surface-container text-on-surface border border-outline-variant/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <User size={14} className="text-amber-600" />
                <span>Demo as Guest</span>
              </button>
            )}

            <button
              onClick={() => setIsSignOutConfirmOpen(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Dialogue */}
      {isSignOutConfirmOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface rounded-xl max-w-md w-full border border-outline-variant/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 text-rose-700">
                <LogOut size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">Confirm Sign Out</h2>
                <p className="text-xs text-on-surface-variant">Are you sure you want to end your current session?</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
              Signing out will lock your local encryption vault and require authentication with your facility credentials or guest access to re-enter.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsSignOutConfirmOpen(false)}
                className="px-3.5 py-2 bg-surface hover:bg-surface-container text-on-surface border border-outline-variant/30 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsSignOutConfirmOpen(false);
                  onSignOut();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Grid: Profile Settings & Statutory Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Editable Identity & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity & Contact Card */}
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <User size={18} className="text-primary" />
                <h2 className="text-base font-bold text-on-surface">Practitioner Details &amp; Contact</h2>
              </div>
              <span className="text-[11px] text-outline font-mono">KDPA Sec. 31 Regulated</span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Full Legal / Professional Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Official Clinical / Executive Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Work Email (KDPA Notification Endpoint)
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-2.5 text-outline" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Mobile Phone (Africa's Talking SMS Dispatch)
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-2.5 text-outline" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Department / Unit
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notification & Dispatch Preferences */}
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <h2 className="text-base font-bold text-on-surface">Clinical Alert &amp; SMS Dispatch</h2>
              </div>
              <span className="text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                Africa's Talking Gateway Active
              </span>
            </div>

            <div className="space-y-3">
              <label className="flex items-start justify-between p-3 rounded-lg border border-outline-variant/25 hover:bg-surface-container-low cursor-pointer transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-on-surface">Urgent Procedural Gap SMS Alerts</div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Receive instant SMS notifications when unbilled high-risk procedures (Ultrasound, Surgeries &gt; KES 10,000) are flagged by the AI engine.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </label>

              <label className="flex items-start justify-between p-3 rounded-lg border border-outline-variant/25 hover:bg-surface-container-low cursor-pointer transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-on-surface">Daily SHA Claims Reconciliation Digest</div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Send end-of-day summary of submitted SHA claims, biometric pre-authorizations, and tariff compliance rates to your email.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigestEnabled}
                  onChange={(e) => setEmailDigestEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Assigned Permissions Matrix */}
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
              <Key size={18} className="text-primary" />
              <h2 className="text-base font-bold text-on-surface">Granted Role Permissions</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeProfile.permissions.map((perm, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center gap-2 text-xs text-on-surface font-medium"
                >
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Statutory Facility Credentials & Switcher */}
        <div className="space-y-6">
          
          {/* Institutional Statutory Credentials */}
          <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <Award size={18} className="text-primary" />
              <h2 className="text-base font-bold text-on-surface">Statutory Registrations</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="text-[11px] text-outline font-semibold block uppercase tracking-wider">
                  Master Facility List (MoH)
                </span>
                <span className="font-bold text-on-surface font-mono text-sm">
                  {activeProfile.facilityCode}
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Verified Level 5 Hospital Entry
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="text-[11px] text-outline font-semibold block uppercase tracking-wider">
                  KMPDC Practice License
                </span>
                <span className="font-bold text-on-surface font-mono text-sm">
                  KMPDC-LIC-2026-9921
                </span>
                <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                  Active &amp; In Good Standing
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                <span className="text-[11px] text-outline font-semibold block uppercase tracking-wider">
                  KDPA ODPC Registration
                </span>
                <span className="font-bold text-on-surface font-mono text-sm">
                  ODPC-CERT-2024-8831
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Designated Data Controller &amp; Processor
                </span>
              </div>
            </div>
          </div>

          {/* Sovereign Node Telemetry */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-5 space-y-2.5 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2 text-on-surface font-bold">
              <Server size={15} className="text-primary" />
              <span>Sovereign Perimeter Telemetry</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-outline">Region:</span>
                <span className="text-on-surface font-medium">Nairobi DC (KeNIC-IX)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">HMAC Tokenizer:</span>
                <span className="text-emerald-700 font-medium">SHA-256 Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Session Timeout:</span>
                <span className="text-on-surface font-medium">8 Hours Inactivity</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileView;
