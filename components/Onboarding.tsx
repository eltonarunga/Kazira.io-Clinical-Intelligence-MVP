import React, { useEffect, useState } from 'react';
import { OnboardingStep } from '../types';
import { 
  ShieldCheck, 
  FileText, 
  Zap, 
  RefreshCw, 
  BarChart3, 
  ClipboardCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Lock,
  Upload,
  ShieldAlert,
  Sparkles,
  Building2,
  Check
} from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { safeStorage } from '../utils/storage';

interface OnboardingProps {
  currentStep: OnboardingStep;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  segment?: 'private' | 'public';
  lang?: Language;
}

const TOUR_STEPS = (lang: Language): Record<string, { title: string; subtitle: string; description: string; icon: React.ElementType; tag: string }> => ({
  WELCOME: {
    title: lang === 'sw' ? "Karibu Kazira Clinical Intelligence" : "Welcome to Kazira Clinical Intelligence",
    subtitle: "Healthcare Revenue Recovery & Sovereign Compliance",
    description: lang === 'sw' 
      ? "Zuia upotevu wa mapato na ufuatilie utendaji wa kliniki yako kiotomatiki. Hebu tufanye ziara ya haraka kuona jinsi Kazira inavyobadilisha data yako kuwa maarifa ya kivitendo."
      : "Automate unbilled clinical procedure gap recovery, verify SHA claims against sovereign tariffs, and ensure 100% KDPA 2019 data protection compliance.",
    icon: ShieldCheck,
    tag: "Getting Started"
  },
  DPIA_COMPLIANCE: {
    title: lang === 'sw' ? "Ulinzi wa Data & DPIA" : "KDPA 2019 Data Privacy & DPIA Governance",
    subtitle: "Kenya Data Protection Act 2019 Mandate",
    description: lang === 'sw'
      ? "Kwa vituo vya afya, utambulisho bandia (pseudonymisation) wa wagonjwa ni lazima. Hakikisha tathmini yako ya sheria ya kulinda data ya Kenya imekamilika kabla ya kupitisha data."
      : "All clinical encounters are irreversibly tokenized via SHA-256 HMAC prior to LLM processing. Patient identifiers never leave your sovereign facility perimeter.",
    icon: Lock,
    tag: "Data Privacy"
  },
  BASELINE_CONFIG: {
    title: lang === 'sw' ? "Kipindi cha Msingi Cha Kulinganisha" : "Define Pre-Kazira Historical Baseline",
    subtitle: "Counterfactual Benchmark for Proof of Recovery",
    description: lang === 'sw'
      ? "Weka muda wa kulinganisha wa kliniki yako kabla ya Kazira (kawaida wiki 12). Hii inatumika kuhesabu viwango vya ulinganifu na kuonyesha uthibitisho wa kurejesha mapato."
      : "Define your facility's pre-Kazira unbilled leakage benchmark (default 12 weeks). This establishes the mathematical baseline used to attribute recovered revenue.",
    icon: BarChart3,
    tag: "Attribution Baseline"
  },
  DATA_INPUT: {
    title: lang === 'sw' ? "1. Weka Data Yako" : "1. Ingest Clinical & Billing Records",
    subtitle: "KenyaEMR, OpenMRS, or Billing CSV Feed",
    description: lang === 'sw'
      ? "Bandika tu vipimo vyako vya kila wiki, pakia faili ya CSV, au unganisha moja kwa moja na KenyaEMR kupitia FHIR REST API."
      : "Ingest weekly operational logs via automated KenyaEMR FHIR endpoints, DHIS2 aggregate connectors, or encrypted local CSV billing exports.",
    icon: FileText,
    tag: "Data Pipeline"
  },
  GENERATE: {
    title: lang === 'sw' ? "2. Changanua & Tengeneza" : "2. Dual-Agent AI Narrative & Audit",
    subtitle: "Gemini 3.8 Dual-Loop Verification Architecture",
    description: lang === 'sw'
      ? "Wakala wa Kwanza anaandika maelezo ya kliniki, ilhali Wakala wa Pili anathibitisha hesabu na kuzuia makosa kabla ya kuonyesha ripoti."
      : "Our Narrative Agent synthesizes clinical notes while an independent Audit Agent verifies tariffs and calculations to eliminate AI hallucinations.",
    icon: Zap,
    tag: "AI Architecture"
  },
  REPORT_OVERVIEW: {
    title: lang === 'sw' ? "3. Dashibodi ya Mapato" : "3. Executive Revenue Recovery Dashboard",
    subtitle: "Real-Time Leakage Metrics & Outstanding Balances",
    description: lang === 'sw'
      ? "Pata muhtasari wa kuona papo hapo wa mapato yaliyookolewa, asilimia ya utatuzi wa madeni, na hadhi ya madai ya SHA."
      : "Monitor cumulative revenue recovered, historical benchmark attribution, aging accounts receivable, and top leaking clinical specialties.",
    icon: BarChart3,
    tag: "Clinical Dashboard"
  },
  RISKS: {
    title: lang === 'sw' ? "4. Orodha ya Mapengo Yasiyoandikishwa" : "4. Unbilled Gap Ledger & Receivables",
    subtitle: "Doctor Attribution & Automated Reconciliation",
    description: lang === 'sw'
      ? "Gundua mara moja taratibu zilizofanywa hospitalini bila kuingizwa kwenye ankara (k.m. Ultrasound, Minor Surgery, Specialist Consult)."
      : "Directly action unbilled procedures flagged by Kazira. Mark encounters as resolved upon invoicing, link payment receipts, or escalate to department heads.",
    icon: AlertTriangle,
    tag: "Revenue Recovery"
  },
  ACTIONS: {
    title: lang === 'sw' ? "5. Uko Tayari Kuanza!" : "5. You're Ready to Recover Revenue!",
    subtitle: "Mission-Critical Sovereign Intelligence for Kenya",
    description: lang === 'sw'
      ? "Mfumo wako umesanidiwa kikamilifu. Bofya Anza Sasa ili kuingia kwenye dashibodi na kuanza ukaguzi wa kwanza."
      : "Your facility workspace is configured and ready. Click Get Started below to begin unbilled gap recovery and SHA claims scrubbing.",
    icon: CheckCircle2,
    tag: "Launch"
  }
});

const STEP_ORDER: OnboardingStep[] = [
  'WELCOME', 'DPIA_COMPLIANCE', 'BASELINE_CONFIG', 'DATA_INPUT', 'GENERATE', 'REPORT_OVERVIEW', 'RISKS', 'ACTIONS'
];

export const Onboarding: React.FC<OnboardingProps> = ({ 
  currentStep, 
  onNext, 
  onPrev, 
  onClose, 
  segment = 'private', 
  lang = 'en' 
}) => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length;
  const t = translations[lang];

  // DPIA Verification state specifically for compliance step
  const [dpiaChecked, setDpiaChecked] = useState(() => {
    return safeStorage.getItem('kazira_dpia_verified') === 'true';
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(() => {
    return safeStorage.getItem('kazira_dpia_filename');
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep === 'HIDDEN' || currentStep === 'COMPLETED') return;
      if (e.key === 'ArrowRight') {
        if (segment === 'public' && currentStep === 'DPIA_COMPLIANCE' && !dpiaChecked) {
          return;
        }
        onNext();
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, currentIndex, onNext, onPrev, onClose, segment, dpiaChecked]);

  if (currentStep === 'HIDDEN' || currentStep === 'COMPLETED') return null;

  const stepData = TOUR_STEPS(lang)[currentStep];
  if (!stepData) return null;

  const Icon = stepData.icon;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  const isNextDisabled = segment === 'public' && currentStep === 'DPIA_COMPLIANCE' && !dpiaChecked;

  const handleDpiaCheckChange = (checked: boolean) => {
    setDpiaChecked(checked);
    safeStorage.setItem('kazira_dpia_verified', checked ? 'true' : 'false');
  };

  const simulateDpiaUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadedFile("KDPA_DPIA_CERTIFICATE_REG_4839.pdf");
      safeStorage.setItem('kazira_dpia_filename', "KDPA_DPIA_CERTIFICATE_REG_4839.pdf");
      setDpiaChecked(true);
      safeStorage.setItem('kazira_dpia_verified', 'true');
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Kazira Onboarding Tour"
    >
      <div className="bg-surface rounded-xl max-w-xl w-full border border-outline-variant/30 overflow-hidden relative shadow-2xl">
        
        {/* Progress Bar */}
        <div className="relative h-1.5 bg-surface-container w-full">
          <div 
            className="absolute top-0 left-0 h-full bg-[#005235] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Icon size={24} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {stepData.tag}
                </span>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Step {currentIndex + 1} of {totalSteps}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors cursor-pointer"
              aria-label="Close walkthrough"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-1 font-serif tracking-tight">
            {stepData.title}
          </h2>
          <p className="text-xs font-medium text-primary mb-3">
            {stepData.subtitle}
          </p>
          
          <p className="text-on-surface-variant text-sm leading-relaxed mb-5">
            {stepData.description}
          </p>

          {/* Step-Specific Interactive Customizations */}
          {currentStep === 'BASELINE_CONFIG' && (
            <div className="my-4 p-4 rounded-lg border border-emerald-300 bg-emerald-50/50 space-y-3">
              <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Facility Pre-Kazira Historical Baseline
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-950 block mb-1">
                  Comparison Window Duration
                </label>
                <select
                  value={safeStorage.getItem('kazira_baseline_weeks') || '12'}
                  onChange={(e) => safeStorage.setItem('kazira_baseline_weeks', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded text-xs font-bold text-on-surface"
                >
                  <option value="4">4 Weeks Pre-Kazira</option>
                  <option value="8">8 Weeks Pre-Kazira</option>
                  <option value="12">12 Weeks Pre-Kazira (Recommended Standard)</option>
                  <option value="24">24 Weeks Pre-Kazira</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-950 block mb-1">
                  Est. Pre-Kazira Weekly Unbilled Leakage (KES)
                </label>
                <input
                  type="number"
                  defaultValue={safeStorage.getItem('kazira_baseline_rate') || '380000'}
                  onChange={(e) => safeStorage.setItem('kazira_baseline_rate', e.target.value)}
                  placeholder="e.g. 380000"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded text-xs font-mono font-bold text-on-surface"
                />
              </div>
            </div>
          )}

          {currentStep === 'DPIA_COMPLIANCE' && (
            <div className="my-4 p-4 rounded-lg border border-primary/20 bg-surface-container-low space-y-3">
              <div className="flex gap-2 items-start">
                <ShieldCheck className="text-primary shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-xs text-on-surface font-bold uppercase tracking-wider">
                    KDPA 2019 Sovereign Tokenization Guarantee
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                    Direct patient identifiers (Names, National IDs, Phone numbers) are transformed into irreversible cryptographic HMAC-SHA256 tokens before leaving your local memory boundary.
                  </p>
                </div>
              </div>

              {/* Explicit Acknowledgment Checkbox */}
              <label className="flex gap-2.5 items-start cursor-pointer select-none pt-2 border-t border-outline-variant/15">
                <input 
                  type="checkbox" 
                  checked={dpiaChecked} 
                  onChange={(e) => handleDpiaCheckChange(e.target.checked)} 
                  className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 shrink-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-on-surface leading-snug">
                  I confirm that our healthcare facility adheres to the Kenya Data Protection Act 2019 health data processing principles.
                </span>
              </label>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-5 border-t border-outline-variant/20 mt-4">
            <button 
              onClick={onClose} 
              className="text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider cursor-pointer"
            >
              {lang === 'sw' ? 'Ruka Ziara' : 'Skip Tour'}
            </button>
            
            <div className="flex gap-2.5 items-center">
              {currentIndex > 0 && (
                <button
                  onClick={onPrev} 
                  className="px-3 py-2 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-container text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  title="Previous Step"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
              )}
              <button 
                onClick={onNext} 
                disabled={isNextDisabled}
                className="px-4 py-2 bg-[#005235] hover:bg-[#004029] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {currentIndex === totalSteps - 1 ? (
                  <span>Get Started</span>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
