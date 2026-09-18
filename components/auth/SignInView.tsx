import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  ArrowRight,
  UserPlus,
  LogIn,
  Building2,
  CheckCircle2,
  AlertCircle,
  Hospital,
  Compass,
  Check
} from 'lucide-react';
import { UserProfile, FacilityType } from '../../types';
import { PROFILES, DEFAULT_PROFILE, GUEST_PROFILE } from '../../constants/profiles';
import { sanitizeInput } from '../../utils/sanitize';
import { apiService } from '../../services/apiService';
import { KaziraEmblem } from '../KaziraLogo';

export type AuthTab = 'signin' | 'signup' | 'guest';

interface SignInViewProps {
  onSignIn: (profile: UserProfile) => void;
  onSignInAsGuest: () => void;
  onSignUp?: (newProfile: UserProfile) => void;
  onShowToast?: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  registeredProfiles?: UserProfile[];
  initialTab?: AuthTab;
}

const KENYAN_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Uasin Gishu',
  'Kiambu',
  'Machakos',
  'Meru',
  'Kilifi',
  'Kakamega',
  'Nyeri',
  'Kisii',
  'Garissa',
  'Embu',
  'Kajiado',
  'Kericho',
  'Nandi',
  'Kitui',
  'Bungoma',
  'Trans Nzoia'
];

const getInitials = (name: string): string => {
  const cleaned = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const SignInView: React.FC<SignInViewProps> = ({
  onSignIn,
  onSignInAsGuest,
  onSignUp,
  onShowToast,
  registeredProfiles = [],
  initialTab = 'signin'
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  // Sign In Form States
  const [emailOrMfl, setEmailOrMfl] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign Up Form States (Zero-Mock Registration)
  const [regFacilityName, setRegFacilityName] = useState('');
  const [regMflCode, setRegMflCode] = useState('');
  const [regFacilityType, setRegFacilityType] = useState<FacilityType>('private');
  const [regCounty, setRegCounty] = useState('Nairobi');
  const [regAdminName, setRegAdminName] = useState('');
  const [regAdminTitle, setRegAdminTitle] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [kdpaAccepted, setKdpaAccepted] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const allAvailableProfiles = [...PROFILES, ...registeredProfiles];

  // 1. Handle Sign In
  const handleCustomSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanIdentifier = sanitizeInput(emailOrMfl);
    if (!cleanIdentifier) {
      setError('Please provide a valid facility work email or MFL code.');
      setIsLoading(false);
      return;
    }

    try {
      // Authenticate with sovereign backend token generator
      await apiService.login(cleanIdentifier, password);

      // Match against known and custom registered profiles
      const matched = allAvailableProfiles.find(p => 
        p.email.toLowerCase() === cleanIdentifier.toLowerCase() || 
        p.facilityCode.toLowerCase() === cleanIdentifier.toLowerCase() ||
        p.facilityCode.replace(/[^0-9]/g, '') === cleanIdentifier.replace(/[^0-9]/g, '')
      );

      if (matched) {
        onSignIn(matched);
        if (onShowToast) {
          onShowToast('Authentication Successful', `Welcome back, ${matched.name}. Secure session established.`, 'success');
        }
      } else {
        // Create an authenticated authenticated session profile on the fly
        const syntheticProfile: UserProfile = {
          id: `user-${cleanIdentifier.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'facility'}`,
          name: cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : `Facility Admin (${cleanIdentifier})`,
          title: 'Facility Lead & Administrator',
          email: cleanIdentifier.includes('@') ? cleanIdentifier : `admin@${cleanIdentifier}.co.ke`,
          role: 'facility_admin',
          facilityName: cleanIdentifier.includes('@') ? 'Registered Healthcare Facility' : `Facility ${cleanIdentifier}`,
          facilityCode: cleanIdentifier.toUpperCase().startsWith('MFL') ? cleanIdentifier.toUpperCase() : `MFL #${cleanIdentifier}`,
          facilityType: 'private',
          avatarMonogram: 'FA',
          avatarColor: 'bg-[#005235] text-white',
          isGuest: false,
          department: 'Executive Administration & Billing',
          phone: '+254 700 000 000',
          permissions: [
            'Full Revenue Cycle Management',
            'Unbilled Gap Debt Resolution',
            'SHA Claim Verification & Submission',
            'Deterministic AI Dual-Loop Execution'
          ]
        };
        onSignIn(syntheticProfile);
        if (onShowToast) {
          onShowToast('Facility Authenticated', `Session established for ${syntheticProfile.facilityName}.`, 'success');
        }
      }
    } catch (err) {
      setError('Unable to authenticate facility credentials. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Sign Up (Register New Facility)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    const cleanFacName = sanitizeInput(regFacilityName);
    const cleanMfl = sanitizeInput(regMflCode);
    const cleanAdminName = sanitizeInput(regAdminName);
    const cleanEmail = sanitizeInput(regEmail);

    if (!cleanFacName || !cleanMfl || !cleanAdminName || !cleanEmail) {
      setSignUpError('Please fill in all required facility and administrator fields.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setSignUpError('Facility security PIN/password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setSignUpError('Passwords do not match. Please verify.');
      return;
    }

    if (!kdpaAccepted) {
      setSignUpError('You must acknowledge KDPA 2019 statutory data protection terms.');
      return;
    }

    setIsLoading(true);

    try {
      const formattedMfl = cleanMfl.toUpperCase().startsWith('MFL') 
        ? cleanMfl.toUpperCase() 
        : `MFL #${cleanMfl.replace(/[^0-9]/g, '') || cleanMfl}`;

      const newProfile: UserProfile = {
        id: `user-fac-${Date.now()}-${cleanMfl.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
        name: cleanAdminName,
        title: regAdminTitle.trim() || (regFacilityType === 'private' ? 'Chief Medical Officer & Facility Admin' : 'Medical Superintendent & Admin'),
        email: cleanEmail,
        role: 'facility_admin',
        facilityName: cleanFacName,
        facilityCode: formattedMfl,
        facilityType: regFacilityType,
        avatarMonogram: getInitials(cleanAdminName),
        avatarColor: regFacilityType === 'private' ? 'bg-[#005235] text-white' : 'bg-indigo-700 text-white',
        isGuest: false,
        department: `${regCounty} County Clinical Services`,
        phone: regPhone.trim() || '+254 700 000 000',
        permissions: regFacilityType === 'private' 
          ? [
              'Full Revenue Cycle Management',
              'Unbilled Gap Debt Resolution',
              'SHA Claim Verification & Submission',
              'Deterministic AI Dual-Loop Execution',
              'Facility Gateway & EMR Configuration'
            ]
          : [
              'Public Facility SHA Claims Verification',
              'MoH DHIS2 Aggregate Reporting',
              'OpenMRS FHIR Encounter Ingestion',
              'KDPA 2019 Sovereign Data Governance'
            ]
      };

      // Authenticate and register with server backend endpoint
      await apiService.registerFacility(newProfile, regPassword);

      if (onSignUp) {
        onSignUp(newProfile);
      } else {
        onSignIn(newProfile);
      }

      if (onShowToast) {
        onShowToast(
          'Facility Registered Successfully',
          `Welcome to Kazira, ${newProfile.name.split(',')[0]}! ${newProfile.facilityName} is initialized with zero mock data.`,
          'success'
        );
      }
    } catch (err) {
      setSignUpError('Unable to complete registration. Please verify your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 sm:p-6 antialiased">
      {/* Container Card */}
      <div className="w-full max-w-2xl bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Sovereign Header Banner */}
        <div className="p-6 sm:p-7 bg-[#005235] text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            {/* Geometric Sovereign Mark */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg border border-white/40 flex items-center justify-center mb-3.5 p-2 sm:p-2.5 transition-transform duration-200 hover:scale-105">
              <KaziraEmblem size={64} className="w-full h-full" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Kazira Clinical Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md font-medium tracking-normal">
              Kenya Healthcare Revenue Recovery
            </p>
          </div>

          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 3-Way Navigation Tabs (Sign In / Sign Up / Guest Access) */}
        <div className="bg-surface-container border-b border-outline-variant/20 p-2 sm:p-3">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-surface p-1 rounded-xl border border-outline-variant/30">
            {/* 1. Sign In Tab */}
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-[#005235] text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <LogIn size={14} className="shrink-0" />
              <span>Sign In</span>
            </button>

            {/* 2. Sign Up Tab */}
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => {
                setActiveTab('signup');
                setSignUpError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-[#005235] text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <UserPlus size={14} className="shrink-0" />
              <span>Sign Up</span>
            </button>

            {/* 3. Guest Access Tab */}
            <button
              type="button"
              id="auth-tab-guest"
              onClick={() => {
                setActiveTab('guest');
                setError(null);
                setSignUpError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guest'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-500/10'
              }`}
            >
              <span>Guest Access</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 sm:p-8">
          
          {/* ============================================================ */}
          {/* TAB 1: SIGN IN                                               */}
          {/* ============================================================ */}
          {activeTab === 'signin' && (
            <div className="space-y-6">
              <div className="border-b border-outline-variant/15 pb-4">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Sign In to Facility</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Enter your registered hospital work email or Master Facility List (MFL) code.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-error/10 border border-error/30 text-error text-xs rounded-lg font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleCustomSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Facility Work Email or MFL Number
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-outline" />
                    <input
                      type="text"
                      id="signin-email-or-mfl"
                      value={emailOrMfl}
                      onChange={(e) => setEmailOrMfl(e.target.value)}
                      placeholder="e.g. 14920 or a.mutua@nairobiwestmed.co.ke"
                      className="w-full pl-9 pr-3 py-2.5 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-on-surface">
                      Security PIN / Password
                    </label>
                    <span className="text-[11px] text-outline">
                      Encrypted session
                    </span>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-outline" />
                    <input
                      type="password"
                      id="signin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="signin-submit-btn"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <Key size={14} />
                  <span>{isLoading ? 'Authenticating Sovereign Session...' : 'Sign In to Facility Workspace'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SIGN UP                                               */}
          {/* ============================================================ */}
          {activeTab === 'signup' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-outline-variant/15 pb-4">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Register Kenyan Healthcare Facility</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Onboard your hospital or clinic with sovereign KDPA 2019 compliance &amp; clean slate ledgers.
                  </p>
                </div>
              </div>

              {signUpError && (
                <div className="p-3 bg-error/10 border border-error/30 text-error text-xs rounded-lg font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                {/* Row 1: Facility Name & MFL Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Facility Name *
                    </label>
                    <div className="relative">
                      <Hospital size={15} className="absolute left-3 top-3 text-outline" />
                      <input
                        type="text"
                        id="signup-facility-name"
                        value={regFacilityName}
                        onChange={(e) => setRegFacilityName(e.target.value)}
                        placeholder="e.g. St. Jude Mission Hospital"
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      MFL Code *
                    </label>
                    <input
                      type="text"
                      id="signup-mfl-code"
                      value={regMflCode}
                      onChange={(e) => setRegMflCode(e.target.value)}
                      placeholder="e.g. 19402"
                      className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Facility Type & County */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Facility Operational Model *
                    </label>
                    <select
                      id="signup-facility-type"
                      value={regFacilityType}
                      onChange={(e) => setRegFacilityType(e.target.value as FacilityType)}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="private">Private Clinic / Hospital (RCM &amp; Leakage Focus)</option>
                      <option value="public_faith">Public / Faith-Based Facility (SHA &amp; DHIS2 Focus)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      County Location *
                    </label>
                    <select
                      id="signup-county"
                      value={regCounty}
                      onChange={(e) => setRegCounty(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {KENYAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>{c} County</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Admin Name & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Lead Clinical / Admin Name *
                    </label>
                    <input
                      type="text"
                      id="signup-admin-name"
                      value={regAdminName}
                      onChange={(e) => setRegAdminName(e.target.value)}
                      placeholder="e.g. Dr. Peter Otieno, MBChB"
                      className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Official Role / Title
                    </label>
                    <input
                      type="text"
                      id="signup-admin-title"
                      value={regAdminTitle}
                      onChange={(e) => setRegAdminTitle(e.target.value)}
                      placeholder="e.g. Chief Medical Officer &amp; Facility Admin"
                      className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Row 4: Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Official Facility Work Email *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-2.5 text-outline" />
                      <input
                        type="email"
                        id="signup-email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="admin@facility.co.ke"
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      id="signup-phone"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+254 700 123 456"
                      className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Row 5: PIN/Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Access Security PIN / Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-2.5 text-outline" />
                      <input
                        type="password"
                        id="signup-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Confirm Security PIN / Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-2.5 text-outline" />
                      <input
                        type="password"
                        id="signup-confirm-password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-xs font-medium text-on-surface focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* KDPA 2019 Section 31 Compliance Checkbox */}
                <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      id="signup-kdpa-consent"
                      checked={kdpaAccepted}
                      onChange={(e) => setKdpaAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50"
                      required
                    />
                    <span className="text-xs text-on-surface leading-relaxed">
                      I certify statutory authority to register this healthcare facility and consent to Kazira sovereign data processing protocols, one-way SHA-256 patient pseudonymisation, and strict <strong>KDPA 2019 Section 31</strong> standards.
                    </span>
                  </label>
                </div>

                {/* Sign Up Submit Button */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <Building2 size={15} />
                  <span>{isLoading ? 'Registering Facility Node...' : 'Register Facility & Launch Clean Workspace'}</span>
                </button>
              </form>

              {/* Sign Up Footer Cross Links */}
              <div className="pt-3 border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="text-on-surface-variant">
                  Already registered your facility?
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Sign In to Existing Account</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: GUEST ACCESS                                          */}
          {/* ============================================================ */}
          {activeTab === 'guest' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-outline-variant/15 pb-4">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Guest Evaluator Sandbox</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Explore unbilled revenue detection, AI clinical audits, and SHA tariffs with synthetic demo data.
                  </p>
                </div>
              </div>

              {/* Quick Guest Evaluator Sandbox Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-950">
                      Standard Sandbox Guest Mode
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed max-w-md">
                    Instant access without credentials. Loaded with synthetic Kenyan FHIR encounters, KES 3.42M unbilled gap ledger benchmarks, and deterministic AI audit simulations.
                  </p>
                </div>

                <button
                  type="button"
                  id="guest-sandbox-btn"
                  onClick={onSignInAsGuest}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer text-center shrink-0 min-h-[44px] flex items-center justify-center gap-2"
                >
                  <Compass size={14} />
                  <span>Launch Sandbox Guest</span>
                </button>
              </div>

              {/* Or Select a Specific Evaluator Persona */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Or Select An Evaluator Archetype
                  </span>
                  <span className="text-[11px] text-outline font-mono">
                    Preloaded Test Scenarios
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Persona 1: Dr. Amina Mutua */}
                  <button
                    type="button"
                    onClick={() => onSignIn(PROFILES[0])}
                    className="p-3.5 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 hover:border-primary text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#005235] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          AM
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                            Dr. Amina Mutua
                          </div>
                          <div className="text-[10px] text-on-surface-variant truncate">
                            Chief Medical Officer
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-on-surface truncate">
                        Nairobi West Memorial
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2">
                        Private Hospital RCM • Surgical &amp; Inpatient unbilled gap recovery.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] font-mono text-outline">
                      <span>MFL #14920</span>
                      <ArrowRight size={12} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Persona 2: David Kiprop */}
                  <button
                    type="button"
                    onClick={() => onSignIn(PROFILES[3] || PROFILES[0])}
                    className="p-3.5 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 hover:border-primary text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          DK
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                            David Kiprop, CPA
                          </div>
                          <div className="text-[10px] text-on-surface-variant truncate">
                            CFO &amp; Billing Lead
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-on-surface truncate">
                        Eldoret Doctors Plaza
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2">
                        Private Practice • Aging AR recovery, doctor fees, automated debt SMS.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] font-mono text-outline">
                      <span>MFL #18204</span>
                      <ArrowRight size={12} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Persona 3: Dr. Jane Kerubo */}
                  <button
                    type="button"
                    onClick={() => onSignIn(PROFILES[1])}
                    className="p-3.5 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 hover:border-primary text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          JK
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                            Dr. Jane Kerubo
                          </div>
                          <div className="text-[10px] text-on-surface-variant truncate">
                            County Health Director
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-on-surface truncate">
                        Nairobi County Health
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2">
                        Public &amp; FBO Oversight • SHA claim verification, OpenMRS FHIR, DHIS2.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] font-mono text-outline">
                      <span>MOH-NRB-HQ</span>
                      <ArrowRight size={12} className="text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Guest Footer Cross Links */}
              <div className="pt-3 border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="text-on-surface-variant">
                  Ready to connect your own healthcare facility?
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="font-semibold text-on-surface hover:text-primary cursor-pointer"
                  >
                    Sign In
                  </button>
                  <span className="text-outline">•</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Sign Up Facility</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sovereign KDPA Compliance Footer (Present on all tabs) */}
          <div id="signin-kdpa-footer" className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant/85 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary shrink-0" />
              <span className="font-medium">KDPA 2019 Section 31 Sovereign Tokenization</span>
            </div>
            <span className="font-label-mono text-[11px] text-outline">Nairobi DC Node • Zero Cloud Spillover</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInView;

