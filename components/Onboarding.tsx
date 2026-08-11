import React, { useEffect, useState } from 'react';
import { OnboardingStep } from '../types';
import Button from './Button';
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
  ShieldAlert
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

const TOUR_STEPS = (lang: Language): Record<string, { title: string; description: string; icon: React.ElementType; color: string; bgPattern: string }> => ({
  WELCOME: {
    title: lang === 'sw' ? "Karibu Kazira" : "Welcome to Kazira",
    description: lang === 'sw' 
      ? "Zuia upotevu wa mapato na ufuatilie utendaji wa kliniki yako kiotomatiki. Hebu tufanye ziara ya haraka kuona jinsi Kazira inavyobadilisha data yako kuwa maarifa ya kivitendo."
      : "Stop revenue leakage and track clinic performance automatically. Let's take a quick tour of how Kazira transforms raw data into actionable insights.",
    icon: ShieldCheck,
    color: "text-accent bg-accent-light",
    bgPattern: "from-accent-light/50 to-transparent"
  },
  DPIA_COMPLIANCE: {
    title: lang === 'sw' ? "Ulinzi wa Data & DPIA" : "Data Privacy & DPIA Compliance",
    description: lang === 'sw'
      ? "Kwa vituo vya umma, utambulisho bandia (pseudonymisation) wa wagonjwa ni lazima. Hakikisha tathmini yako ya sheria ya kulinda data ya Kenya (KDPA 2019) imekamilika kabla ya kupitisha data."
      : "For public facilities, patient pseudonymisation is strictly mandatory. Ensure your Kenya Data Protection Act (KDPA 2019) DPIA is verified and registered with ODPC.",
    icon: Lock,
    color: "text-indigo-600 bg-indigo-100",
    bgPattern: "from-indigo-100/50 to-transparent"
  },
  BASELINE_CONFIG: {
    title: lang === 'sw' ? "Kipindi cha Msingi Cha Kulinganisha" : "Define Pre-Kazira Baseline Period",
    description: lang === 'sw'
      ? "Weka muda wa kulinganisha wa kliniki yako kabla ya Kazira (kawaida wiki 12). Hii inatumika kuhesabu viwango vya ulinganifu na kuonyesha uthibitisho wa kurejesha mapato."
      : "Define your facility's pre-Kazira comparison window (default 12 weeks). This baseline powers your pre/post leakage rate comparison and attribution evidence.",
    icon: BarChart3,
    color: "text-emerald-600 bg-emerald-100",
    bgPattern: "from-emerald-100/50 to-transparent"
  },
  DATA_INPUT: {
    title: lang === 'sw' ? "1. Weka Data Yako" : "1. Input Your Data",
    description: lang === 'sw'
      ? "Bandika tu vipimo vyako vya kila wiki, pakia faili ya CSV, au buruta faili hapa. Kazira inashughulikia data iliyovurugika kwa urahisi."
      : "Simply paste your weekly clinic metrics, upload a CSV, or drop a file. Kazira handles messy data effortlessly.",
    icon: FileText,
    color: "text-blue-600 bg-blue-100",
    bgPattern: "from-blue-100/50 to-transparent"
  },
  GENERATE: {
    title: lang === 'sw' ? "2. Changanua & Tengeneza" : "2. Analyze & Generate",
    description: lang === 'sw'
      ? "Bofya kitufe cha kutengeneza ili kuruhusu mawakala wetu wa AI kuchakata data yako. Tunatafuta kasoro, makosa ya ankara, na mwelekeo wa utendaji."
      : "Click generate to let our AI agents process your data. We look for anomalies, missed billing, and performance trends.",
    icon: Zap,
    color: "text-amber-600 bg-amber-100",
    bgPattern: "from-amber-100/50 to-transparent"
  },
  PROCESSING: {
    title: lang === 'sw' ? "3. Uhakiki wa Wakala-Mwili" : "3. Dual-Agent Verification",
    description: lang === 'sw'
      ? "Wakala wetu wa Maelezo anaandika ripoti, ilhali Wakala wa Ukaguzi anathibitisha hesabu na mantiki kwa kujitegemea ili kuzuia mawazo potofu ya AI."
      : "Our Narrative Agent writes the report, while our Audit Agent independently verifies the math and logic to prevent hallucinations.",
    icon: RefreshCw,
    color: "text-purple-600 bg-purple-100",
    bgPattern: "from-purple-100/50 to-transparent"
  },
  REPORT_OVERVIEW: {
    title: lang === 'sw' ? "4. Dashibodi" : "4. The Dashboard",
    description: lang === 'sw'
      ? "Pata muhtasari wa kuona papo hapo wa mapato yako ya kila wiki, idadi ya wagonjwa, na viashiria vikuu vya utendaji."
      : "Get an instant visual overview of your weekly revenue, patient volume, and key performance indicators.",
    icon: BarChart3,
    color: "text-emerald-600 bg-emerald-100",
    bgPattern: "from-emerald-100/50 to-transparent"
  },
  EXEC_SUMMARY: {
    title: lang === 'sw' ? "5. Muhtasari wa Mtendaji" : "5. Executive Summary",
    description: lang === 'sw'
      ? "Soma muhtasari thabiti na wa Kiswahili/Kingereza sahili kuhusu utendaji wa kila wiki wa kliniki yako, uliopangiliwa kwa wamiliki wenye shughuli nyingi."
      : "Read a concise, plain-language summary of your clinic's weekly performance, tailored for busy health administrators.",
    icon: ClipboardCheck,
    color: "text-indigo-600 bg-indigo-100",
    bgPattern: "from-indigo-100/50 to-transparent"
  },
  WHY_CHANGED: {
    title: lang === 'sw' ? "6. Uchambuzi wa Chanzo mikuu" : "6. Root Cause Analysis",
    description: lang === 'sw'
      ? "Kazira inakuambia haswa *kwa nini* nambari zilibadilika. Je, mapato yalishuka kwa sababu ya kughairiwa kwa huduma, au ratiba ya mtaalamu fulani?"
      : "Kazira tells you exactly *why* numbers changed. Did revenue drop due to cancellations, or a specific practitioner's schedule?",
    icon: Search,
    color: "text-cyan-600 bg-cyan-100",
    bgPattern: "from-cyan-100/50 to-transparent"
  },
  RISKS: {
    title: lang === 'sw' ? "7. Ugunduzi wa Hatari za Mapato" : "7. Risk Detection",
    description: lang === 'sw'
      ? "Tambua upotevu unaowezekana wa mapato, matibabu ambayo hayajalipiwa, na mianya ya kiutendaji kabla hayajawa matatizo makubwa ya kifedha."
      : "Identify potential revenue leakage, unbilled procedures, and operational bottlenecks before they become costly problems.",
    icon: AlertTriangle,
    color: "text-rose-600 bg-rose-100",
    bgPattern: "from-rose-100/50 to-transparent"
  },
  ACTIONS: {
    title: lang === 'sw' ? "8. Hatua Zifuatazo Kivitendo" : "8. Actionable Next Steps",
    description: lang === 'sw'
      ? "Pata mapendekezo yaliyo wazi na yenye kipaumbele kuhusu kile cha kurekebisha juma hili ili kuboresha mapato ya kituo chako."
      : "Get clear, prioritized recommendations on what to fix this week to improve your facility's bottom line.",
    icon: CheckCircle2,
    color: "text-accent2 bg-accent-pale",
    bgPattern: "from-accent-pale/80 to-transparent"
  }
});

const STEP_ORDER: OnboardingStep[] = [
  'WELCOME', 'DPIA_COMPLIANCE', 'BASELINE_CONFIG', 'DATA_INPUT', 'GENERATE', 'PROCESSING', 'REPORT_OVERVIEW', 
  'EXEC_SUMMARY', 'WHY_CHANGED', 'RISKS', 'ACTIONS'
];

const Onboarding: React.FC<OnboardingProps> = ({ 
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

  // DPIA Verification state specifically for public facility compliance block
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
          return; // Blocked
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

  // Next button is disabled for public facility in DPIA step if they haven't verified DPIA
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
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-surface rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Decorative Background Gradient */}
        <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${stepData.bgPattern} opacity-60 pointer-events-none`} />

        {/* Header / Progress */}
        <div className="relative h-1.5 bg-surface2 w-full z-10">
          <div 
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-500 ease-out rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${stepData.color} shadow-sm ring-4 ring-white`}>
              <Icon size={28} strokeWidth={2.5} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-ink3 hover:text-ink hover:bg-surface2 rounded-full transition-colors"
              aria-label="Close tour"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-3 font-serif tracking-tight">
            {stepData.title}
          </h2>
          
          <p className="text-ink2 text-sm leading-relaxed mb-6">
            {stepData.description}
          </p>

          {/* Baseline Configuration Form */}
          {currentStep === 'BASELINE_CONFIG' && (
            <div className="my-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3 animate-in fade-in duration-300">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Facility Pre-Kazira Historical Baseline
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-950 block mb-1">
                  Baseline Period Duration (Weeks)
                </label>
                <select
                  value={safeStorage.getItem('kazira_baseline_weeks') || '12'}
                  onChange={(e) => safeStorage.setItem('kazira_baseline_weeks', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-ink"
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
                  className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-ink"
                />
              </div>
            </div>
          )}
          {segment === 'public' && currentStep === 'DPIA_COMPLIANCE' && (
            <div className="my-6 p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-2 items-start">
                <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-rose-900 font-semibold uppercase tracking-wider">
                  {t.dpiaVerificationRequired}
                </div>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                {t.dpiaVerificationAlert}
              </p>

              {/* Pseudo File Upload */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-100">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white border-rose-200 text-rose-700 hover:bg-rose-50 text-xs" 
                  onClick={simulateDpiaUpload}
                  disabled={isUploading}
                >
                  <Upload size={14} className="mr-1.5" /> 
                  {isUploading ? (lang === 'sw' ? 'Inapakia...' : 'Uploading...') : t.dpiaUploadAction}
                </Button>
                {uploadedFile && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1 font-mono border border-emerald-200">
                    <CheckCircle2 size={12} /> {uploadedFile}
                  </span>
                )}
              </div>

              {/* Explicit Acknowledgment Checkbox */}
              <label className="flex gap-3 items-start cursor-pointer select-none pt-2">
                <input 
                  type="checkbox" 
                  checked={dpiaChecked} 
                  onChange={(e) => handleDpiaCheckChange(e.target.checked)} 
                  className="mt-1 rounded border-rose-300 text-rose-600 focus:ring-rose-500 h-4 w-4 shrink-0 transition-colors cursor-pointer"
                />
                <span className="text-xs font-medium text-rose-950 leading-relaxed">
                  {t.dpiaCheckLabel}
                </span>
              </label>

              {!dpiaChecked && (
                <div className="text-[10px] uppercase font-bold text-rose-600 tracking-tight animate-pulse pt-1">
                  {t.dpiaNoFlowAlert}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-border2">
            <button 
              onClick={onClose} 
              className="text-xs font-bold text-ink3 hover:text-ink transition-colors uppercase tracking-wider"
            >
              {lang === 'sw' ? 'Ruka Ziara' : 'Skip Tour'}
            </button>
            
            <div className="flex gap-3 items-center">
              <div className="text-xs font-bold text-ink3 uppercase tracking-widest mr-2 hidden sm:block">
                {currentIndex + 1} / {totalSteps}
              </div>
              {currentIndex > 0 && (
                <Button variant="ghost" onClick={onPrev} className="text-ink2 hover:bg-surface2 px-2.5 py-1" title="Previous">
                  <ArrowLeft size={16} />
                </Button>
              )}
              <Button 
                variant={isNextDisabled ? "secondary" : "primary"} 
                onClick={onNext} 
                className={`min-w-[110px] shadow-sm text-xs py-2 ${isNextDisabled ? 'opacity-50 cursor-not-allowed bg-surface3 text-ink4 border-border' : ''}`}
                disabled={isNextDisabled}
                title={isNextDisabled ? "KDPA registration is required to unlock onboarding" : "Next"}
              >
                {currentIndex === totalSteps - 1 ? (lang === 'sw' ? 'Anza Sasa' : 'Get Started') : (
                  <span className="flex items-center justify-center gap-1">
                    {lang === 'sw' ? 'Mbele' : 'Next'} <ArrowRight size={14} />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
