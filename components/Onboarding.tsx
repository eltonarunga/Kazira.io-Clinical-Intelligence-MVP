import React, { useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';

interface OnboardingProps {
  currentStep: OnboardingStep;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const TOUR_STEPS: Record<string, { title: string; description: string; icon: React.ElementType; color: string; bgPattern: string }> = {
  WELCOME: {
    title: "Welcome to Kazira",
    description: "Stop revenue leakage and track clinic performance automatically. Let's take a quick tour of how Kazira transforms raw data into actionable insights.",
    icon: ShieldCheck,
    color: "text-accent bg-accent-light",
    bgPattern: "from-accent-light/50 to-transparent"
  },
  DATA_INPUT: {
    title: "1. Input Your Data",
    description: "Simply paste your weekly clinic metrics, upload a CSV, or drop a file. Kazira handles messy data effortlessly.",
    icon: FileText,
    color: "text-blue-600 bg-blue-100",
    bgPattern: "from-blue-100/50 to-transparent"
  },
  GENERATE: {
    title: "2. Analyze & Generate",
    description: "Click generate to let our AI agents process your data. We look for anomalies, missed billing, and performance trends.",
    icon: Zap,
    color: "text-amber-600 bg-amber-100",
    bgPattern: "from-amber-100/50 to-transparent"
  },
  PROCESSING: {
    title: "3. Dual-Agent Verification",
    description: "Our Narrative Agent writes the report, while our Audit Agent independently verifies the math and logic to prevent hallucinations.",
    icon: RefreshCw,
    color: "text-purple-600 bg-purple-100",
    bgPattern: "from-purple-100/50 to-transparent"
  },
  REPORT_OVERVIEW: {
    title: "4. The Dashboard",
    description: "Get an instant visual overview of your weekly revenue, patient volume, and key performance indicators.",
    icon: BarChart3,
    color: "text-emerald-600 bg-emerald-100",
    bgPattern: "from-emerald-100/50 to-transparent"
  },
  EXEC_SUMMARY: {
    title: "5. Executive Summary",
    description: "Read a concise, plain-English summary of your clinic's weekly performance, tailored for busy owners.",
    icon: ClipboardCheck,
    color: "text-indigo-600 bg-indigo-100",
    bgPattern: "from-indigo-100/50 to-transparent"
  },
  WHY_CHANGED: {
    title: "6. Root Cause Analysis",
    description: "Kazira tells you exactly *why* numbers changed. Did revenue drop due to cancellations, or a specific practitioner's schedule?",
    icon: Search,
    color: "text-cyan-600 bg-cyan-100",
    bgPattern: "from-cyan-100/50 to-transparent"
  },
  RISKS: {
    title: "7. Risk Detection",
    description: "Identify potential revenue leakage, unbilled procedures, and operational bottlenecks before they become costly problems.",
    icon: AlertTriangle,
    color: "text-rose-600 bg-rose-100",
    bgPattern: "from-rose-100/50 to-transparent"
  },
  ACTIONS: {
    title: "8. Actionable Next Steps",
    description: "Get clear, prioritized recommendations on what to fix this week to improve your bottom line.",
    icon: CheckCircle2,
    color: "text-accent2 bg-accent-pale",
    bgPattern: "from-accent-pale/80 to-transparent"
  }
};

const STEP_ORDER: OnboardingStep[] = [
  'WELCOME', 'DATA_INPUT', 'GENERATE', 'PROCESSING', 'REPORT_OVERVIEW', 
  'EXEC_SUMMARY', 'WHY_CHANGED', 'RISKS', 'ACTIONS'
];

const Onboarding: React.FC<OnboardingProps> = ({ currentStep, onNext, onPrev, onClose }) => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep === 'HIDDEN' || currentStep === 'COMPLETED') return;
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, currentIndex, onNext, onPrev, onClose]);

  if (currentStep === 'HIDDEN' || currentStep === 'COMPLETED') return null;

  const stepData = TOUR_STEPS[currentStep];
  if (!stepData) return null;

  const Icon = stepData.icon;
  const progress = ((currentIndex + 1) / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-surface rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
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
          <div className="flex justify-between items-start mb-8">
            <div className={`p-5 rounded-2xl ${stepData.color} shadow-sm ring-4 ring-white`}>
              <Icon size={36} strokeWidth={2.5} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-ink3 hover:text-ink hover:bg-surface2 rounded-full transition-colors"
              aria-label="Close tour"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-ink mb-4 font-serif tracking-tight">
            {stepData.title}
          </h2>
          
          <p className="text-ink2 text-lg leading-relaxed mb-10 min-h-[90px]">
            {stepData.description}
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-border2">
            <button 
              onClick={onClose} 
              className="text-sm font-bold text-ink3 hover:text-ink transition-colors"
            >
              Skip Tour
            </button>
            
            <div className="flex gap-3 items-center">
              <div className="text-xs font-bold text-ink3 uppercase tracking-widest mr-2 hidden sm:block">
                {currentIndex + 1} / {totalSteps}
              </div>
              {currentIndex > 0 && (
                <Button variant="ghost" onClick={onPrev} className="text-ink2 hover:bg-surface2 px-3" title="Previous (Left Arrow)">
                  <ArrowLeft size={18} />
                </Button>
              )}
              <Button variant="primary" onClick={onNext} className="min-w-[120px] shadow-md shadow-accent/20" title="Next (Right Arrow)">
                {currentIndex === totalSteps - 1 ? 'Get Started' : (
                  <>Next <ArrowRight size={16} className="ml-2" /></>
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
