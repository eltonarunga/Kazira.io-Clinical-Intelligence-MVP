import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  AlertCircle, 
  Hospital, 
  Compass, 
  Check, 
  Sun, 
  Moon, 
  Database,
  Lock,
  Layers,
  Sparkles,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, FacilityType } from '../../types';
import { sanitizeInput } from '../../utils/sanitize';
import { apiService } from '../../services/apiService';
import { 
  signInWithGooglePopup, 
  fetchUserProfile, 
  saveUserProfile 
} from '../../services/firebase';
import { KaziraEmblem } from '../KaziraLogo';

export type AuthTab = 'google' | 'guest';

interface SignInViewProps {
  onSignIn: (profile: UserProfile) => void;
  onSignInAsGuest: () => void;
  onSignUp?: (newProfile: UserProfile) => void;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  registeredProfiles?: UserProfile[];
  initialTab?: AuthTab;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// All 47 Counties of Kenya (Constitution of Kenya 2010 First Schedule)
const ALL_KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

const getInitials = (name: string): string => {
  const cleaned = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const SignInView: React.FC<SignInViewProps> = ({
  onSignIn,
  onSignInAsGuest,
  onSignUp,
  onShowToast,
  registeredProfiles = [],
  initialTab = 'google',
  theme = 'light',
  onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab === 'guest' ? 'guest' : 'google');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google First-Time Facility Setup Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUserTemp, setGoogleUserTemp] = useState<any>(null);
  const [googleFacName, setGoogleFacName] = useState('');
  const [googleMflCode, setGoogleMflCode] = useState('');
  const [googleFacType, setGoogleFacType] = useState<FacilityType>('private');
  const [googleCounty, setGoogleCounty] = useState('Nairobi');
  const [googleAdminTitle, setGoogleAdminTitle] = useState('Chief Medical Officer & Facility Admin');
  const [isSubmittingSetup, setIsSubmittingSetup] = useState(false);

  // Handle Google Sign In / Sign Up
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const user = await signInWithGooglePopup();
      const idToken = await user.getIdToken();
      
      // Look up existing user profile directly in Cloud Firestore
      let profile = await fetchUserProfile(user.uid);
      
      if (!profile && user.email) {
        // Check registered profiles fallback
        const match = registeredProfiles.find(p => p.email.toLowerCase() === user.email?.toLowerCase());
        if (match) {
          profile = {
            ...match,
            id: user.uid,
            email: user.email,
            name: user.displayName || match.name
          };
          await saveUserProfile(profile);
          await apiService.loginWithFirebaseIdToken(idToken, profile).catch(() => {});
          onSignIn(profile);
          if (onShowToast) {
            onShowToast('Google Authentication', `Welcome, ${profile.name}. Facility cloud database synced.`, 'success');
          }
          return;
        }
      }

      if (profile) {
        // Authenticate with server backend using verified Firebase ID Token
        await apiService.loginWithFirebaseIdToken(idToken, profile).catch(() => {});
        onSignIn(profile);
        if (onShowToast) {
          onShowToast('Welcome Back', `Authenticated as ${profile.name} (${profile.facilityName}).`, 'success');
        }
      } else {
        // First-time Google user: prompt for hospital facility details
        setGoogleUserTemp(user);
        setGoogleFacName('');
        setGoogleMflCode('');
        setGoogleFacType('private');
        setGoogleCounty('Nairobi');
        setGoogleAdminTitle('Chief Medical Officer & Facility Admin');
        setShowGoogleModal(true);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google Auth Error:', err);
        setError(err.message || 'Unable to complete Google authentication. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Complete Google Registration with Facility Onboarding
  const handleCompleteGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUserTemp) return;

    const cleanFac = sanitizeInput(googleFacName).trim();
    const cleanMfl = sanitizeInput(googleMflCode).trim();
    const cleanTitle = sanitizeInput(googleAdminTitle).trim() || 'Chief Medical Officer & Facility Admin';

    if (!cleanFac || !cleanMfl) {
      setError('Please provide your facility name and KMHFL code.');
      return;
    }

    setIsSubmittingSetup(true);
    try {
      const mflDigits = cleanMfl.replace(/[^0-9]/g, '');
      const formattedMfl = cleanMfl.toUpperCase().startsWith('MFL') 
        ? cleanMfl.toUpperCase() 
        : `MFL #${mflDigits || cleanMfl}`;

      const newProfile: UserProfile = {
        id: googleUserTemp.uid,
        name: googleUserTemp.displayName || 'Healthcare Administrator',
        title: cleanTitle,
        email: googleUserTemp.email || 'admin@facility.co.ke',
        role: 'facility_admin',
        facilityName: cleanFac,
        facilityCode: formattedMfl,
        facilityType: googleFacType,
        avatarMonogram: getInitials(googleUserTemp.displayName || 'FA'),
        avatarColor: googleFacType === 'private' ? 'bg-[#005235] text-white' : 'bg-indigo-700 text-white',
        isGuest: false,
        department: `${googleCounty} County Clinical Services`,
        phone: googleUserTemp.phoneNumber || '+254 700 000 000',
        permissions: [
          'Full Revenue Cycle Management',
          'Unbilled Gap Debt Resolution',
          'SHA Claim Verification & Submission',
          'Deterministic AI Dual-Loop Execution',
          'Firestore Cloud Database Synchronization'
        ]
      };

      // Persist to Cloud Firestore database
      await saveUserProfile(newProfile);

      // Register with backend server using verified token
      const idToken = await googleUserTemp.getIdToken();
      await apiService.registerFacility(newProfile, undefined, idToken).catch(() => {});

      if (onSignUp) {
        onSignUp(newProfile);
      } else {
        onSignIn(newProfile);
      }

      setShowGoogleModal(false);
      if (onShowToast) {
        onShowToast(
          'Facility Onboarded',
          `Welcome to Kazira, ${newProfile.name.split(' ')[0]}! ${newProfile.facilityName} is initialized and connected to the cloud database.`,
          'success'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Error configuring facility profile.');
    } finally {
      setIsSubmittingSetup(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E0E] text-ink dark:text-[#F5F5F3] flex flex-col justify-center items-center p-3 sm:p-6 antialiased transition-colors duration-200">
      
      {/* Top Floating Controls Bar */}
      <div className="w-full max-w-xl flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-ink2 dark:text-zinc-400 font-medium">
          <Database size={14} className="text-[#005235] dark:text-emerald-400" />
          <span>Cloud Database • KDPA 2019 Sovereign Node</span>
        </div>

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#171717] hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs text-ink dark:text-[#F5F5F3] font-medium transition-all shadow-2xs cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} className="text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-zinc-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors duration-200">
        
        {/* Top Institutional Header Banner */}
        <div className="p-6 sm:p-7 bg-[#005235] text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            {/* Kazira Healthcare Shield Emblem */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md border border-white/50 flex items-center justify-center mb-3 p-2 transition-transform duration-200 hover:scale-105">
              <KaziraEmblem size={64} className="w-full h-full" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-head">
              Kazira Clinical Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md font-medium">
              Kenyan Healthcare Revenue Recovery &amp; SHA Compliance
            </p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-28 h-28 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 2-Way Navigation Tabs: Google Auth & Guest Sandbox */}
        <div className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-zinc-800 p-2 sm:p-3">
          <div className="grid grid-cols-2 gap-2 bg-white dark:bg-[#121212] p-1 rounded-xl border border-gray-200 dark:border-zinc-800">
            {/* 1. Google Authentication Tab */}
            <button
              type="button"
              id="auth-tab-google"
              onClick={() => {
                setActiveTab('google');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-[#005235] text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Google Sign In / Sign Up</span>
            </button>

            {/* 2. Guest Access Tab */}
            <button
              type="button"
              id="auth-tab-guest"
              onClick={() => {
                setActiveTab('guest');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guest'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              <Compass size={15} className="shrink-0" />
              <span>Guest Sandbox</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="p-5 sm:p-8 bg-white dark:bg-[#141414]">
          
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: GOOGLE SIGN IN & SIGN UP                              */}
          {/* ============================================================ */}
          {activeTab === 'google' && (
            <div className="space-y-5">
              {/* Primary Google Action Button */}
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-3.5 px-5 bg-white dark:bg-[#1C1C1C] hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-100 border border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 min-h-[48px] active:scale-[0.99]"
              >
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span>{isGoogleLoading ? 'Connecting to Google Authentication...' : 'Continue with Google'}</span>
              </button>

              {/* Informational Pillars & Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-zinc-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#005235] dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span>Existing Facilities</span>
                  </div>
                  <p className="text-[11px] text-ink2 dark:text-zinc-400 leading-relaxed">
                    Instantly restores your facility's receivables ledger, unbilled gap items, and SHA claims history.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-zinc-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Hospital size={14} />
                    <span>New Facility Registration</span>
                  </div>
                  <p className="text-[11px] text-ink2 dark:text-zinc-400 leading-relaxed">
                    First-time Google users configure their hospital KMHFL code and classification in a quick 1-minute setup.
                  </p>
                </div>
              </div>

              {/* Security & Verification Callout */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[#005235] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-950 dark:text-emerald-300 leading-relaxed">
                  <strong className="font-semibold">Statutory KDPA 2019 Sovereign Guard:</strong> User identities are cryptographically mapped to facility partitions. No third-party passwords or unencrypted clinical data are ever stored.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: GUEST SANDBOX ACCESS                                  */}
          {/* ============================================================ */}
          {activeTab === 'guest' && (
            <div className="space-y-5">
              {/* Guest Launch Card */}
              <div className="p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Compass size={18} className="text-amber-700 dark:text-amber-400" />
                    <span className="text-sm font-bold text-amber-950 dark:text-amber-100">
                      Synthetic Demo Clinic (MFL #DEMO-01)
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-300/80 leading-relaxed">
                    Pre-loaded with 142 simulated Kenyan FHIR encounters, KES 3.42M in unbilled procedural gaps (theatre, ultrasound, minor surgery), and verified SHA claims.
                  </p>
                </div>

                <button
                  type="button"
                  id="guest-sandbox-btn"
                  onClick={onSignInAsGuest}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px] active:scale-[0.99]"
                >
                  <Compass size={16} />
                  <span>Launch Sandbox Guest Mode</span>
                </button>
              </div>

              {/* Sandbox Boundary Guarantees */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-zinc-800 space-y-2 text-xs text-ink2 dark:text-zinc-400">
                <div className="font-semibold text-ink dark:text-zinc-200 flex items-center gap-1.5">
                  <Lock size={13} className="text-[#005235] dark:text-emerald-400" />
                  <span>Sandbox Isolation Architecture</span>
                </div>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside">
                  <li>Sessions operate strictly in the isolated <code className="font-mono text-ink dark:text-zinc-300">MFL #DEMO-01</code> partition.</li>
                  <li>Real hospital records, clinical debts, and SHA submissions are isolated and protected.</li>
                  <li>Full read-only parity across dual-loop AI audits, KES calculations, and exportable reports.</li>
                </ul>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('google')}
                  className="text-xs font-semibold text-[#005235] dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Ready to connect your facility with Google SSO?</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Statutory KDPA Compliance Footer */}
          <div id="signin-kdpa-footer" className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-ink2 dark:text-zinc-400 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#005235] dark:text-emerald-400 shrink-0" />
              <span className="font-medium">KDPA 2019 Section 31 Sovereign Tokenization</span>
            </div>
            <span className="font-mono text-[11px] text-gray-400 dark:text-zinc-500">Nairobi Cloud Node • Zero Password Storage</span>
          </div>
        </div>
      </div>

      {/* Google Sign-In: First-Time Facility Setup Modal */}
      {showGoogleModal && googleUserTemp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-full bg-[#005235]/10 text-[#005235] dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                {getInitials(googleUserTemp.displayName || 'G')}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-ink dark:text-zinc-100 truncate">
                  Welcome, {googleUserTemp.displayName || 'Doctor'}
                </h3>
                <p className="text-xs text-ink2 dark:text-zinc-400 truncate">
                  {googleUserTemp.email}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-ink2 dark:text-zinc-300 leading-relaxed">
                Connect your Google account to your Kenyan health facility to initialize your cloud ledger and SHA tariffs:
              </p>
            </div>

            <form onSubmit={handleCompleteGoogleRegistration} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                  Facility Official Name *
                </label>
                <input
                  type="text"
                  value={googleFacName}
                  onChange={(e) => setGoogleFacName(e.target.value)}
                  placeholder="e.g. Nairobi West Memorial Hospital"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                    KMHFL / MFL Code *
                  </label>
                  <input
                    type="text"
                    value={googleMflCode}
                    onChange={(e) => setGoogleMflCode(e.target.value)}
                    placeholder="e.g. 14920"
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                    Facility Model
                  </label>
                  <select
                    value={googleFacType}
                    onChange={(e) => setGoogleFacType(e.target.value as FacilityType)}
                    className="w-full px-2.5 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-ink dark:text-zinc-100"
                  >
                    <option value="private">Private (RCM)</option>
                    <option value="public_faith">Public/Faith (SHA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                  Administrator Title / Role
                </label>
                <input
                  type="text"
                  value={googleAdminTitle}
                  onChange={(e) => setGoogleAdminTitle(e.target.value)}
                  placeholder="e.g. Chief Medical Officer & Lead Administrator"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                  County Location
                </label>
                <select
                  value={googleCounty}
                  onChange={(e) => setGoogleCounty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-ink dark:text-zinc-100"
                >
                  {ALL_KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c} County</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSetup}
                  className="px-4 py-2.5 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60 shadow-xs flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{isSubmittingSetup ? 'Saving Setup...' : 'Complete & Launch Workspace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInView;
