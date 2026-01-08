
import React from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  MousePointer2, 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { OnboardingStep } from '../types';
import Button from './Button';

interface StepContent {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId?: string;
  position?: 'center' | 'bottom-right' | 'top-right' | 'target';
}

const ONBOARDING_STEPS: Record<OnboardingStep, StepContent> = {
  WELCOME: {
    title: "Welcome to Kazira.io",
    description: "Meet your new Autonomous Clinic Analyst. Kazira replaces hours of manual business analysis with an AI-driven executive intelligence engine.",
    icon: <Zap className="text-yellow-400" size={32} />,
    position: 'center'
  },
  DATA_INPUT: {
    title: "Step 1: Data Ingestion",
    description: "Feed the engine. You can paste raw numbers, CSV data, or even notes about your week. Try clicking 'Load Sample' to see how it looks.",
    icon: <MousePointer2 className="text-blue-500" size={24} />,
    targetId: 'data-input-area',
    position: 'target'
  },
  GENERATE: {
    title: "Step 2: Activate the Agents",
    description: "Click 'Generate Report' to trigger the Narrative and Audit agents. One writes the strategy; the other verifies the math.",
    icon: <Sparkles className="text-purple-500" size={24} />,
    targetId: 'generate-btn',
    position: 'target'
  },
  PROCESSING: {
    title: "The Agents are working...",
    description: "The Narrative Agent is synthesizing causal links while the Audit Agent cross-references metrics for 100% reliability.",
    icon: <ShieldAlert className="text-orange-500" size={24} />,
    position: 'center'
  },
  REPORT_OVERVIEW: {
    title: "Your Intelligence is Ready",
    description: "Kazira has converted your raw data into a strategic action plan. Let's tour the key insights.",
    icon: <BarChart3 className="text-emerald-500" size={24} />,
    position: 'center'
  },
  EXEC_SUMMARY: {
    title: "Executive Summary",
    description: "Instant context. Are you up or down? By how much? And the single biggest reason why.",
    icon: <CheckCircle2 className="text-blue-500" size={24} />,
    targetId: 'exec-summary',
    position: 'target'
  },
  WHY_CHANGED: {
    title: "Causal Insights",
    description: "We don't just show 'What'. We explain 'Why' by connecting metrics—like how a specific practitioner's schedule impacted total revenue.",
    icon: <BarChart3 className="text-indigo-500" size={24} />,
    targetId: 'why-changed',
    position: 'target'
  },
  RISKS: {
    title: "Risk Radar",
    description: "Operational hazards identified with dollar-impact estimates and confidence scores.",
    icon: <ShieldAlert className="text-rose-500" size={24} />,
    targetId: 'at-risk',
    position: 'target'
  },
  ACTIONS: {
    title: "The Action Plan",
    description: "No generic advice. These are 2-3 specific instructions for your team to recover lost revenue this week.",
    icon: <CheckCircle2 className="text-emerald-500" size={24} />,
    targetId: 'next-steps',
    position: 'target'
  },
  COMPLETED: {
    title: "Ready to Scale",
    description: "You're all set. Use Kazira weekly to keep your clinic at peak performance. Start analyzing your real data now!",
    icon: <Zap className="text-yellow-400" size={32} />,
    position: 'center'
  },
  HIDDEN: {
    title: "",
    description: "",
    icon: null
  }
};

interface OnboardingProps {
  currentStep: OnboardingStep;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ currentStep, onNext, onPrev, onClose }) => {
  if (currentStep === 'HIDDEN') return null;

  const stepInfo = ONBOARDING_STEPS[currentStep];
  const stepKeys = Object.keys(ONBOARDING_STEPS) as OnboardingStep[];
  const currentIndex = stepKeys.indexOf(currentStep);
  const totalSteps = stepKeys.length - 2; // Subtract WELCOME/COMPLETED or HIDDEN logic if needed, but let's just keep it simple

  const isCenter = stepInfo.position === 'center';
  
  const getPositionStyles = (): React.CSSProperties => {
    if (isCenter) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    if (stepInfo.targetId) {
      const el = document.getElementById(stepInfo.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          top: `${rect.bottom + window.scrollY + 20}px`,
          left: `${rect.left + window.scrollX}px`,
          maxWidth: '350px'
        };
      }
    }
    
    return { bottom: '40px', right: '40px', maxWidth: '350px' };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed Backdrop - Only for centered steps */}
      {isCenter && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto" />}
      
      {/* The Guide Card */}
      <div 
        className="absolute bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 pointer-events-auto animate-in fade-in zoom-in duration-300"
        style={getPositionStyles()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl">
              {stepInfo.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{stepInfo.title}</h3>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            {stepInfo.description}
          </p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex gap-1">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-1.5 rounded-full ${currentIndex === i ? 'bg-blue-600 w-4' : 'bg-slate-200'} transition-all`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentIndex > 0 && (
                <Button variant="ghost" size="sm" onClick={onPrev}>
                  <ChevronLeft size={16} /> Back
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={onNext}>
                {currentStep === 'COMPLETED' ? 'Finish' : 'Next'} <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlighting Target */}
      {stepInfo.targetId && (
        <div 
          className="absolute ring-[4px] ring-blue-500 ring-offset-4 rounded-xl pointer-events-none transition-all duration-500 ease-in-out"
          style={{
            top: `${document.getElementById(stepInfo.targetId)?.getBoundingClientRect().top! + window.scrollY}px`,
            left: `${document.getElementById(stepInfo.targetId)?.getBoundingClientRect().left! + window.scrollX}px`,
            width: `${document.getElementById(stepInfo.targetId)?.getBoundingClientRect().width}px`,
            height: `${document.getElementById(stepInfo.targetId)?.getBoundingClientRect().height}px`,
          }}
        />
      )}
    </div>
  );
};

export default Onboarding;
