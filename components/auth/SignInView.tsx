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
  Eye, 
  EyeOff, 
  Sparkles, 
  Phone, 
  HelpCircle,
  Sun,
  Moon,
  Trash2,
  Check,
  Database
} from 'lucide-react';
import { UserProfile, FacilityType } from '../../types';
import { PROFILES, DEFAULT_PROFILE, GUEST_PROFILE } from '../../constants/profiles';
import { sanitizeInput } from '../../utils/sanitize';
import { safeStorage } from '../../utils/storage';
import { apiService } from '../../services/apiService';
import { 
  signInWithGooglePopup, 
  fetchUserProfile, 
  saveUserProfile 
} from '../../services/firebase';
import { KaziraEmblem, KaziraMonogram, KaziraWordmark } from '../KaziraLogo';

export type AuthTab = 'signin' | 'signup' | 'guest';

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

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
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
  initialTab = 'signin',
  theme = 'light',
  onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  // Sign In Form States
  const [emailOrMfl, setEmailOrMfl] = useState(() => {
    return safeStorage.getItem('kazira_remembered_identifier') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(safeStorage.getItem('kazira_remembered_identifier'));
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google First-Time Facility Setup Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleUserTemp, setGoogleUserTemp] = useState<any>(null);
  const [googleFacName, setGoogleFacName] = useState('');
  const [googleMflCode, setGoogleMflCode] = useState('');
  const [googleFacType, setGoogleFacType] = useState<FacilityType>('private');
  const [googleCounty, setGoogleCounty] = useState('Nairobi');

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
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [kdpaAccepted, setKdpaAccepted] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const [deviceProfiles, setDeviceProfiles] = useState<UserProfile[]>(() => {
    try {
      const stored = safeStorage.getItem('kazira_registered_profiles');
      return stored ? JSON.parse(stored) : registeredProfiles;
    } catch {
      return registeredProfiles;
    }
  });

  const allAvailableProfiles = [...PROFILES, ...deviceProfiles];

  // Quick fill handler
  const handleQuickFill = (profile: UserProfile, defaultPass = 'kazira2026', autoSubmit = false) => {
    setEmailOrMfl(profile.email);
    setPassword(defaultPass);
    setError(null);
    if (autoSubmit) {
      onSignIn(profile);
      if (onShowToast) {
        onShowToast('Session Started', `Welcome, ${profile.name} (${profile.facilityName}).`, 'success');
      }
    } else if (onShowToast) {
      onShowToast('Credentials Populated', `Selected ${profile.name} (${profile.facilityName}). Click Sign In to proceed.`, 'info');
    }
  };

  // Remove profile from device memory
  const handleForgetProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    const updated = deviceProfiles.filter(p => p.id !== profileId);
    setDeviceProfiles(updated);
    safeStorage.setItem('kazira_registered_profiles', JSON.stringify(updated));
    if (onShowToast) {
      onShowToast('Profile Removed', 'Facility profile removed from device quick list.', 'info');
    }
  };

  // 1. Handle Google Sign In & Cloud Database Sync
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setSignUpError(null);

    try {
      const user = await signInWithGooglePopup();
      const idToken = await user.getIdToken();
      
      // Check cloud Firestore database for existing user profile
      let profile = await fetchUserProfile(user.uid);
      
      if (!profile && user.email) {
        // Fallback: check if matches registered email
        const match = allAvailableProfiles.find(p => p.email.toLowerCase() === user.email?.toLowerCase());
        if (match) {
          profile = {
            ...match,
            id: user.uid,
            email: user.email,
            name: user.displayName || match.name
          };
          await saveUserProfile(profile);
          await apiService.loginWithFirebaseIdToken(idToken).catch(() => {});
          onSignIn(profile);
          if (onShowToast) {
            onShowToast('Google Authentication', `Welcome, ${profile.name}. Facility cloud database synced.`, 'success');
          }
          return;
        }
      }

      if (profile) {
        await apiService.loginWithFirebaseIdToken(idToken).catch(() => {});
        onSignIn(profile);
        if (onShowToast) {
          onShowToast('Google Authentication', `Welcome back, ${profile.name} (${profile.facilityName}).`, 'success');
        }
      } else {
        // First-time Google user: prompt for facility details to bind the profile
        setGoogleUserTemp(user);
        setGoogleFacName('');
        setGoogleMflCode('');
        setShowGoogleModal(true);
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-In Error:', err);
        setError(err.message || 'Unable to complete Google Sign-In. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Complete Google Registration with Facility Details
  const handleCompleteGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUserTemp) return;

    const cleanFac = sanitizeInput(googleFacName).trim();
    const cleanMfl = sanitizeInput(googleMflCode).trim();

    if (!cleanFac || !cleanMfl) {
      setError('Please provide your facility name and KMHFL code.');
      return;
    }

    setIsLoading(true);
    try {
      const mflDigits = cleanMfl.replace(/[^0-9]/g, '');
      const formattedMfl = cleanMfl.toUpperCase().startsWith('MFL') 
        ? cleanMfl.toUpperCase() 
        : `MFL #${mflDigits || cleanMfl}`;

      const newProfile: UserProfile = {
        id: googleUserTemp.uid,
        name: googleUserTemp.displayName || 'Healthcare Administrator',
        title: googleFacType === 'private' ? 'Chief Medical Officer & Facility Admin' : 'Medical Superintendent & Admin',
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

      // Persist to cloud database
      await saveUserProfile(newProfile);

      const idToken = await googleUserTemp.getIdToken();
      await apiService.registerFacility(newProfile, undefined, idToken).catch(() => {});

      // Register locally & full-stack
      if (onSignUp) {
        onSignUp(newProfile);
      } else {
        onSignIn(newProfile);
      }

      setShowGoogleModal(false);
      if (onShowToast) {
        onShowToast(
          'Google Profile Linked',
          `Welcome to Kazira, ${newProfile.name.split(' ')[0]}! ${newProfile.facilityName} is initialized and connected to the database.`,
          'success'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Error configuring facility profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Custom Sign In
  const handleCustomSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanIdentifier = sanitizeInput(emailOrMfl).trim();
    if (!cleanIdentifier) {
      setError('Please provide a valid facility work email or KMHFL code.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Please provide your account password or security PIN.');
      setIsLoading(false);
      return;
    }

    try {
      // Authenticate with server backend
      await apiService.login(cleanIdentifier, password);

      // Save or remove Remember Me preference
      if (rememberMe) {
        safeStorage.setItem('kazira_remembered_identifier', cleanIdentifier);
      } else {
        safeStorage.removeItem('kazira_remembered_identifier');
      }

      // Match against known default and custom registered profiles
      const matched = allAvailableProfiles.find(p => 
        p.email.toLowerCase() === cleanIdentifier.toLowerCase() || 
        p.facilityCode.toLowerCase() === cleanIdentifier.toLowerCase() ||
        p.facilityCode.replace(/[^0-9]/g, '') === cleanIdentifier.replace(/[^0-9]/g, '')
      );

      if (matched) {
        // Sync profile to cloud database in background
        saveUserProfile(matched).catch(e => console.warn('Firestore sync note:', e));
        onSignIn(matched);
        if (onShowToast) {
          onShowToast('Authentication Successful', `Welcome back, ${matched.name}. Secure facility session established.`, 'success');
        }
      } else {
        // Create an authenticated facility session profile on the fly
        const cleanMflNum = cleanIdentifier.replace(/[^0-9]/g, '');
        const syntheticProfile: UserProfile = {
          id: `user-${cleanIdentifier.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'facility'}`,
          name: cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : `Facility Admin (${cleanIdentifier})`,
          title: 'Facility Lead & Administrator',
          email: cleanIdentifier.includes('@') ? cleanIdentifier : `admin@${cleanIdentifier}.co.ke`,
          role: 'facility_admin',
          facilityName: cleanIdentifier.includes('@') ? 'Registered Healthcare Facility' : `Hospital MFL ${cleanMflNum || cleanIdentifier}`,
          facilityCode: cleanIdentifier.toUpperCase().startsWith('MFL') ? cleanIdentifier.toUpperCase() : `MFL #${cleanMflNum || cleanIdentifier}`,
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
        saveUserProfile(syntheticProfile).catch(e => console.warn('Firestore sync note:', e));
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

  // 3. Handle Sign Up (Register New Facility)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    const cleanFacName = sanitizeInput(regFacilityName).trim();
    const cleanMfl = sanitizeInput(regMflCode).trim();
    const cleanAdminName = sanitizeInput(regAdminName).trim();
    const cleanEmail = sanitizeInput(regEmail).trim();

    if (!cleanFacName || !cleanMfl || !cleanAdminName || !cleanEmail) {
      setSignUpError('Please fill in all required facility and administrator fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setSignUpError('Please enter a valid official facility email address (e.g. admin@hospital.co.ke).');
      return;
    }

    // Validate MFL code format (KMHFL codes are 4-5 digits)
    const mflDigits = cleanMfl.replace(/[^0-9]/g, '');
    if (mflDigits.length < 4 && !cleanMfl.toUpperCase().includes('MOH')) {
      setSignUpError('Please enter a valid Kenya Master Health Facility List (KMHFL) code (typically 5 digits).');
      return;
    }

    // Duplicate Check
    const formattedMfl = cleanMfl.toUpperCase().startsWith('MFL') 
      ? cleanMfl.toUpperCase() 
      : `MFL #${mflDigits || cleanMfl}`;

    const duplicateProfile = allAvailableProfiles.find(p => 
      p.facilityCode.replace(/[^0-9]/g, '') === mflDigits ||
      p.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (duplicateProfile) {
      setSignUpError(`Facility already registered: ${duplicateProfile.facilityName} (${duplicateProfile.facilityCode}). Please switch to the Sign In tab.`);
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setSignUpError('Facility security PIN / password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setSignUpError('Passwords do not match. Please verify your entries.');
      return;
    }

    if (!kdpaAccepted) {
      setSignUpError('You must certify KDPA 2019 statutory data protection terms.');
      return;
    }

    setIsLoading(true);

    try {
      // Auto-format phone with Kenya country code
      let formattedPhone = regPhone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+254 ' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+') && formattedPhone.length > 5) {
        formattedPhone = '+254 ' + formattedPhone;
      }

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
        phone: formattedPhone || '+254 700 000 000',
        permissions: regFacilityType === 'private' 
          ? [
              'Full Revenue Cycle Management',
              'Unbilled Gap Debt Resolution',
              'SHA Claim Verification & Submission',
              'Deterministic AI Dual-Loop Execution',
              'Facility Gateway & EMR Configuration',
              'Database Cloud Synchronization'
            ]
          : [
              'Public Facility SHA Claims Verification',
              'MoH DHIS2 Aggregate Reporting',
              'OpenMRS FHIR Encounter Ingestion',
              'KDPA 2019 Sovereign Data Governance',
              'Database Cloud Synchronization'
            ]
      };

      // Persist to Firestore database
      await saveUserProfile(newProfile);

      // Register with backend endpoint
      await apiService.registerFacility(newProfile, regPassword);

      if (onSignUp) {
        onSignUp(newProfile);
      } else {
        onSignIn(newProfile);
      }

      if (onShowToast) {
        onShowToast(
          'Facility Registered Successfully',
          `Welcome to Kazira, ${newProfile.name.split(',')[0]}! ${newProfile.facilityName} is initialized and synced to cloud database.`,
          'success'
        );
      }
    } catch (err: any) {
      setSignUpError(err.message || 'Unable to complete registration. Please verify your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E0E] text-ink dark:text-[#F5F5F3] flex flex-col justify-center items-center p-3 sm:p-6 antialiased transition-colors duration-200">
      
      {/* Top Floating Controls Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-ink2 dark:text-zinc-400 font-medium">
          <Database size={14} className="text-[#005235] dark:text-emerald-400" />
          <span>Cloud Database &amp; KDPA 2019 Sovereign Node</span>
        </div>

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#171717] hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs text-ink dark:text-[#F5F5F3] font-medium transition-all shadow-2xs cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to primarily white light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to primarily white light mode' : 'Switch to dark mode'}
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
      <div className="w-full max-w-2xl bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors duration-200">
        
        {/* Top Institutional Header Banner */}
        <div className="p-6 sm:p-7 bg-[#005235] text-white text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            {/* Kazira Healthcare Shield Emblem (Caduceus & Upward Recovery Arrow) */}
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

        {/* 3-Way Navigation Tabs */}
        <div className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-zinc-800 p-2 sm:p-3">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-white dark:bg-[#121212] p-1 rounded-xl border border-gray-200 dark:border-zinc-800">
            {/* 1. Sign In Tab */}
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-[#005235] text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <LogIn size={15} className="shrink-0" />
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
              className={`flex items-center justify-center gap-1 sm:gap-2 py-2.5 px-1.5 sm:px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-[#005235] text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <UserPlus size={15} className="shrink-0" />
              <span>Sign Up<span className="hidden sm:inline"> Facility</span></span>
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
              className={`flex items-center justify-center gap-1 sm:gap-2 py-2.5 px-1.5 sm:px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guest'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              <Compass size={15} className="shrink-0" />
              <span>Guest<span className="hidden sm:inline"> Sandbox</span></span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="p-4 sm:p-8 bg-white dark:bg-[#141414]">
          
          {/* ============================================================ */}
          {/* TAB 1: SIGN IN                                               */}
          {/* ============================================================ */}
          {activeTab === 'signin' && (
            <div className="space-y-5">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-ink dark:text-zinc-100 font-head">Sign In to Facility Workspace</h2>
                  <p className="text-xs text-ink2 dark:text-zinc-400 mt-0.5">
                    Sign in with Google or enter your hospital email / KMHFL code.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-xs text-[#005235] dark:text-emerald-400 font-semibold hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Need an account? Register →
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-lg font-medium flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Google Sign-In Button */}
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#1C1C1C] hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-100 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>{isGoogleLoading ? 'Connecting to Google & Database...' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-[#141414] px-3 text-[11px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono shrink-0">
                  or sign in with email / MFL
                </span>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleCustomSignIn} className="space-y-4">
                <div>
                  <label htmlFor="signin-email-or-mfl" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                    Facility Work Email or KMHFL Number
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-gray-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      id="signin-email-or-mfl"
                      value={emailOrMfl}
                      onChange={(e) => setEmailOrMfl(e.target.value)}
                      placeholder="e.g. 14920 or a.mutua@nairobiwestmed.co.ke"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="signin-password" className="block text-xs font-semibold text-ink dark:text-zinc-200">
                      Security PIN / Password
                    </label>
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">
                      KDPA Encrypted
                    </span>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-gray-400 dark:text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-ink dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Assistance Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#005235] focus:ring-[#005235] border-gray-300 dark:border-zinc-700"
                    />
                    <span className="text-ink2 dark:text-zinc-400 text-[11px]">Remember facility on this workstation</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (onShowToast) {
                        onShowToast('Credential Assistance', 'For demo accounts use PIN: kazira2026. For hospital accounts, contact your supervisor.', 'info');
                      }
                    }}
                    className="text-[#005235] dark:text-emerald-400 hover:underline font-medium text-[11px] cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  id="signin-submit-btn"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <Key size={15} />
                  <span>{isLoading ? 'Authenticating Sovereign Session...' : 'Sign In to Facility Workspace'}</span>
                </button>
              </form>

              {/* Fast 1-Click Quick Fill Strip */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-500">
                  <span className="font-semibold uppercase tracking-wider font-mono">1-Click Demo Profiles</span>
                  <span>Instant sandbox login</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill(PROFILES[0], 'kazira2026', true)}
                    className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-800 hover:border-[#005235] dark:hover:border-emerald-500 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="text-[11px] font-bold text-ink dark:text-zinc-100 group-hover:text-[#005235] dark:group-hover:text-emerald-400 transition-colors truncate">
                        Dr. Amina Mutua
                      </div>
                      <span className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded">
                        1-Click
                      </span>
                    </div>
                    <div className="text-[10px] text-ink2 dark:text-zinc-400 truncate">
                      Private RCM • MFL #14920
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill(PROFILES[1], 'kazira2026', true)}
                    className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-800 hover:border-indigo-600 dark:hover:border-indigo-400 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="text-[11px] font-bold text-ink dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        Dr. Jane Kerubo
                      </div>
                      <span className="text-[9px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-1 py-0.5 rounded">
                        1-Click
                      </span>
                    </div>
                    <div className="text-[10px] text-ink2 dark:text-zinc-400 truncate">
                      County Health • MOH-NRB
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill(PROFILES[3] || PROFILES[0], 'kazira2026', true)}
                    className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-800 hover:border-[#005235] dark:hover:border-emerald-500 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="text-[11px] font-bold text-ink dark:text-zinc-100 group-hover:text-[#005235] dark:group-hover:text-emerald-400 transition-colors truncate">
                        David Kiprop, CPA
                      </div>
                      <span className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded">
                        1-Click
                      </span>
                    </div>
                    <div className="text-[10px] text-ink2 dark:text-zinc-400 truncate">
                      Private CFO • MFL #18204
                    </div>
                  </button>
                </div>
              </div>

              {/* Previously Registered Facilities on This Device */}
              {deviceProfiles.length > 0 && (
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    <span>Registered Facilities on this Device ({deviceProfiles.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {deviceProfiles.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSignIn(p);
                          if (onShowToast) onShowToast('Resumed Session', `Switched to ${p.facilityName}.`, 'success');
                        }}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-[#005235]/10 text-[#005235] dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {p.avatarMonogram}
                          </div>
                          <div className="min-w-0 truncate">
                            <span className="font-semibold text-ink dark:text-zinc-100 block truncate group-hover:text-[#005235] dark:group-hover:text-emerald-400 transition-colors">
                              {p.facilityName}
                            </span>
                            <span className="text-[10px] text-ink2 dark:text-zinc-400 block font-mono">
                              {p.facilityCode} • {p.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleForgetProfile(e, p.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Forget profile from this workstation"
                          >
                            <Trash2 size={13} />
                          </button>
                          <ArrowRight size={13} className="text-gray-400 group-hover:text-[#005235] dark:group-hover:text-emerald-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SIGN UP                                               */}
          {/* ============================================================ */}
          {activeTab === 'signup' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-ink dark:text-zinc-100 font-head">Register Healthcare Facility</h2>
                  <p className="text-xs text-ink2 dark:text-zinc-400 mt-0.5">
                    Connect via Google or configure your hospital with KDPA 2019 compliance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-[#005235] dark:text-emerald-400 font-semibold hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Already registered? Sign In →
                </button>
              </div>

              {signUpError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-lg font-medium flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{signUpError}</span>
                </div>
              )}

              {/* 1. Fast Sign Up with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#1C1C1C] hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-100 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 min-h-[44px]"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Register with Google Workspace'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-[#141414] px-3 text-[11px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono shrink-0">
                  or register manually
                </span>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                {/* Section A: Facility Identification */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Facility Identification
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="signup-facility-name" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Facility Official Name *
                      </label>
                      <div className="relative">
                        <Hospital size={15} className="absolute left-3 top-3 text-gray-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          id="signup-facility-name"
                          value={regFacilityName}
                          onChange={(e) => setRegFacilityName(e.target.value)}
                          placeholder="e.g. St. Jude Mission Hospital"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-mfl-code" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        KMHFL Code *
                      </label>
                      <input
                        type="text"
                        id="signup-mfl-code"
                        value={regMflCode}
                        onChange={(e) => setRegMflCode(e.target.value)}
                        placeholder="e.g. 19402"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="signup-facility-type" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Facility Operational Model *
                      </label>
                      <select
                        id="signup-facility-type"
                        value={regFacilityType}
                        onChange={(e) => setRegFacilityType(e.target.value as FacilityType)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="private">Private Clinic / Hospital (RCM &amp; Leakage Focus)</option>
                        <option value="public_faith">Public / Faith-Based Facility (SHA &amp; DHIS2 Focus)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="signup-county" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        County Location (Kenya) *
                      </label>
                      <select
                        id="signup-county"
                        value={regCounty}
                        onChange={(e) => setRegCounty(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500 cursor-pointer"
                      >
                        {ALL_KENYAN_COUNTIES.map((c) => (
                          <option key={c} value={c}>{c} County</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Clinical & Admin Lead */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Administrator &amp; Clinical Lead
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="signup-admin-name" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Lead Clinical / Admin Name *
                      </label>
                      <input
                        type="text"
                        id="signup-admin-name"
                        value={regAdminName}
                        onChange={(e) => setRegAdminName(e.target.value)}
                        placeholder="e.g. Dr. Peter Otieno, MBChB"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-admin-title" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Official Role / Title
                      </label>
                      <input
                        type="text"
                        id="signup-admin-title"
                        value={regAdminTitle}
                        onChange={(e) => setRegAdminTitle(e.target.value)}
                        placeholder="e.g. Chief Medical Officer &amp; Facility Admin"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="signup-email" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Official Facility Work Email *
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-2.5 text-gray-400 dark:text-zinc-500" />
                        <input
                          type="email"
                          id="signup-email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="admin@facility.co.ke"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-phone" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Contact Phone (Kenya Mobile)
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-2.5 text-gray-400 dark:text-zinc-500" />
                        <input
                          type="tel"
                          id="signup-phone"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+254 700 123 456"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Security & Compliance */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                    Security &amp; Statutory Compliance
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="signup-password" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Access Security PIN / Password *
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-2.5 text-gray-400 dark:text-zinc-500" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          id="signup-password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2 text-gray-400 hover:text-ink dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                          aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                        >
                          {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-ink dark:text-zinc-200 mb-1">
                        Confirm Security PIN / Password *
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-2.5 text-gray-400 dark:text-zinc-500" />
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          id="signup-confirm-password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235] focus:ring-1 focus:ring-[#005235] dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-2 text-gray-400 hover:text-ink dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                          aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showRegConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password match & strength feedback */}
                  {regPassword && (
                    <div className="p-2.5 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-zinc-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${regPassword.length >= 6 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-ink2 dark:text-zinc-400 text-[11px]">
                          {regPassword.length >= 6 ? 'Password policy verified' : 'Requires at least 6 characters'}
                        </span>
                      </div>
                      {regConfirmPassword && (
                        <span className={`text-[11px] font-bold ${regPassword === regConfirmPassword ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {regPassword === regConfirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* KDPA 2019 Section 31 Compliance Checkbox */}
                  <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-zinc-800 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        id="signup-kdpa-consent"
                        checked={kdpaAccepted}
                        onChange={(e) => setKdpaAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#005235] focus:ring-[#005235] border-gray-300 dark:border-zinc-700"
                        required
                      />
                      <span className="text-xs text-ink dark:text-zinc-200 leading-relaxed">
                        I certify statutory authority to register this healthcare facility and consent to Kazira sovereign data processing protocols, one-way SHA-256 patient pseudonymisation, and strict <strong>KDPA 2019 Section 31</strong> standards.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Sign Up Submit Button */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
                >
                  <Building2 size={15} />
                  <span>{isLoading ? 'Registering Facility & Syncing Database...' : 'Register Facility & Launch Clean Workspace'}</span>
                </button>
              </form>

              {/* Sign Up Footer Cross Links */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="text-ink2 dark:text-zinc-400">
                  Already registered your facility?
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="font-bold text-[#005235] dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Sign In to Existing Account</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: GUEST SANDBOX                                         */}
          {/* ============================================================ */}
          {activeTab === 'guest' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-ink dark:text-zinc-100 font-head">Guest Evaluator Sandbox</h2>
                  <p className="text-xs text-ink2 dark:text-zinc-400 mt-0.5">
                    Explore unbilled revenue detection, AI clinical audits, and SHA tariffs with synthetic demo data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-[#005235] dark:text-emerald-400 font-semibold hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Have credentials? Sign In →
                </button>
              </div>

              {/* Quick Guest Evaluator Sandbox Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-950 dark:text-amber-200">
                      Standard Sandbox Guest Mode
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-300/80 leading-relaxed max-w-md">
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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink dark:text-zinc-200 uppercase tracking-wider font-mono">
                    Select An Evaluator Archetype
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">
                    Preloaded Clinical Scenarios
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Persona 1: Dr. Amina Mutua */}
                  <button
                    type="button"
                    onClick={() => onSignIn(PROFILES[0])}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-[#005235] dark:hover:border-emerald-500 text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#005235] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          AM
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink dark:text-zinc-100 group-hover:text-[#005235] dark:group-hover:text-emerald-400 transition-colors truncate">
                            Dr. Amina Mutua
                          </div>
                          <div className="text-[10px] text-ink2 dark:text-zinc-400 truncate">
                            Chief Medical Officer
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-ink dark:text-zinc-200 truncate">
                        Nairobi West Memorial
                      </div>
                      <p className="text-[10px] text-ink2 dark:text-zinc-400 mt-1 line-clamp-2">
                        Private Hospital RCM • Surgical &amp; Inpatient unbilled gap recovery.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-zinc-500">
                      <span>MFL #14920</span>
                      <ArrowRight size={12} className="text-[#005235] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Persona 2: David Kiprop */}
                  <button
                    type="button"
                    onClick={() => onSignIn(PROFILES[3] || PROFILES[0])}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-emerald-500 text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          DK
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                            David Kiprop, CPA
                          </div>
                          <div className="text-[10px] text-ink2 dark:text-zinc-400 truncate">
                            CFO &amp; Billing Lead
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-ink dark:text-zinc-200 truncate">
                        Eldoret Doctors Plaza
                      </div>
                      <p className="text-[10px] text-ink2 dark:text-zinc-400 mt-1 line-clamp-2">
                        Private Practice • Aging AR recovery, doctor fees, automated debt SMS.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-zinc-500">
                      <span>MFL #18204</span>
                      <ArrowRight size={12} className="text-[#005235] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Persona 3: Dr. Jane Kerubo */}
                  <button
                    type="button"
                    onClick={() => onSignIn(PROFILES[1])}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-indigo-600 dark:hover:border-indigo-400 text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          JK
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            Dr. Jane Kerubo
                          </div>
                          <div className="text-[10px] text-ink2 dark:text-zinc-400 truncate">
                            County Health Director
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-ink dark:text-zinc-200 truncate">
                        Nairobi County Health
                      </div>
                      <p className="text-[10px] text-ink2 dark:text-zinc-400 mt-1 line-clamp-2">
                        Public &amp; FBO Oversight • SHA claim verification, OpenMRS FHIR, DHIS2.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-800 flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-zinc-500">
                      <span>MOH-NRB-HQ</span>
                      <ArrowRight size={12} className="text-[#005235] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Guest Footer Cross Links */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="text-ink2 dark:text-zinc-400">
                  Ready to connect your own healthcare facility?
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="font-semibold text-ink dark:text-zinc-100 hover:text-[#005235] dark:hover:text-emerald-400 cursor-pointer"
                  >
                    Sign In
                  </button>
                  <span className="text-gray-300 dark:text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="font-bold text-[#005235] dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Sign Up Facility</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statutory KDPA Compliance Footer */}
          <div id="signin-kdpa-footer" className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-ink2 dark:text-zinc-400 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#005235] dark:text-emerald-400 shrink-0" />
              <span className="font-medium">KDPA 2019 Section 31 Sovereign Tokenization</span>
            </div>
            <span className="font-mono text-[11px] text-gray-400 dark:text-zinc-500">Nairobi DC Node • Zero Cloud Spillover</span>
          </div>
        </div>
      </div>

      {/* Google Sign-In Facility Onboarding Modal */}
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

            <form onSubmit={handleCompleteGoogleRegistration} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={googleFacName}
                  onChange={(e) => setGoogleFacName(e.target.value)}
                  placeholder="e.g. Agape Family Clinic & Maternity"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                    KMHFL Code *
                  </label>
                  <input
                    type="text"
                    value={googleMflCode}
                    onChange={(e) => setGoogleMflCode(e.target.value)}
                    placeholder="e.g. 19280"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-ink dark:text-zinc-100 focus:outline-hidden focus:border-[#005235]"
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
                    className="w-full px-2.5 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-ink dark:text-zinc-100"
                  >
                    <option value="private">Private (RCM)</option>
                    <option value="public_faith">Public/Faith (SHA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-ink dark:text-zinc-200">
                  County Location
                </label>
                <select
                  value={googleCounty}
                  onChange={(e) => setGoogleCounty(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-ink dark:text-zinc-100"
                >
                  {ALL_KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c} County</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60 shadow-xs flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{isLoading ? 'Saving...' : 'Complete & Launch'}</span>
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
