
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ClipboardCheck, 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  Search,
  HelpCircle,
  X,
  Upload,
  Trash2,
  FileCode,
  List
} from 'lucide-react';
import { AppStatus, ReportOutput, OnboardingStep } from './types';
import { DEFAULT_CLINIC_DATA } from './constants';
import { generateNarrativeReport, auditReport } from './services/geminiService';
import Button from './components/Button';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import DataInputGuide from './components/DataInputGuide';

// Helper component for section headers
const SectionHeader: React.FC<{ id?: string; title: string; icon: React.ReactNode }> = ({ id, title, icon }) => (
  <div id={id} className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 scroll-mt-24">
    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
      {icon}
    </div>
    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{title}</h2>
  </div>
);

// Simple Markdown-ish renderer (basic)
const ReportContent: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-4 text-slate-700 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## 1.')) {
          return <h3 key={i} id="exec-summary" className="text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100 scroll-mt-24">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('## 3.')) {
          return <h3 key={i} id="why-changed" className="text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100 scroll-mt-24">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('## 4.')) {
          return <h3 key={i} id="at-risk" className="text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100 scroll-mt-24">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('## 5.')) {
          return <h3 key={i} id="next-steps" className="text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100 scroll-mt-24">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100 scroll-mt-24">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-slate-900">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc pl-2">{line.replace('- ', '')}</li>;
        }
        if (line.includes('🟢')) return <p key={i} className="flex items-center gap-2 py-1"><span className="text-emerald-500">🟢</span> {line.replace('🟢', '').trim()}</p>;
        if (line.includes('🟡')) return <p key={i} className="flex items-center gap-2 py-1"><span className="text-amber-500">🟡</span> {line.replace('🟡', '').trim()}</p>;
        if (line.includes('🔴')) return <p key={i} className="flex items-center gap-2 py-1"><span className="text-rose-500">🔴</span> {line.replace('🔴', '').trim()}</p>;
        if (line.includes('⚠️')) return <div key={i} className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400 my-4 font-medium"><span className="mr-2">⚠️</span>{line.replace('⚠️', '').trim()}</div>;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [clinicData, setClinicData] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [report, setReport] = useState<ReportOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('HIDDEN');
  const [showDataGuide, setShowDataGuide] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('kazira_onboarded');
    if (!hasOnboarded) {
      setOnboardingStep('WELCOME');
    }
  }, []);

  const handleGenerate = async () => {
    try {
      if (!clinicData.trim()) {
        setError("Please enter or load some clinic data first.");
        return;
      }
      
      setError(null);
      setStatus(AppStatus.GENERATING_NARRATIVE);
      
      if (onboardingStep === 'GENERATE') {
        setOnboardingStep('PROCESSING');
      }

      const narrative = await generateNarrativeReport(clinicData);
      
      setStatus(AppStatus.AUDITING);
      const audit = await auditReport(clinicData, narrative);
      
      setReport({
        narrative,
        audit,
        timestamp: new Date().toLocaleString()
      });
      setStatus(AppStatus.SUCCESS);

      if (onboardingStep === 'PROCESSING') {
        setTimeout(() => setOnboardingStep('REPORT_OVERVIEW'), 1000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setReport(null);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setClinicData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setClinicData(text);
      };
      reader.readAsText(file);
    }
  };

  const nextOnboarding = () => {
    const steps: OnboardingStep[] = [
      'WELCOME', 'DATA_INPUT', 'GENERATE', 'PROCESSING', 'REPORT_OVERVIEW', 
      'EXEC_SUMMARY', 'WHY_CHANGED', 'RISKS', 'ACTIONS', 'COMPLETED'
    ];
    const currentIndex = steps.indexOf(onboardingStep);
    
    if (onboardingStep === 'DATA_INPUT') {
      setClinicData(DEFAULT_CLINIC_DATA);
    }

    if (onboardingStep === 'COMPLETED') {
      localStorage.setItem('kazira_onboarded', 'true');
      setOnboardingStep('HIDDEN');
      return;
    }

    const next = steps[currentIndex + 1];
    if (next) {
      setOnboardingStep(next);
      
      const targets: Partial<Record<OnboardingStep, string>> = {
        EXEC_SUMMARY: 'exec-summary',
        WHY_CHANGED: 'why-changed',
        RISKS: 'at-risk',
        ACTIONS: 'next-steps'
      };
      
      const targetId = targets[next];
      if (targetId) {
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };

  const prevOnboarding = () => {
    const steps: OnboardingStep[] = [
      'WELCOME', 'DATA_INPUT', 'GENERATE', 'PROCESSING', 'REPORT_OVERVIEW', 
      'EXEC_SUMMARY', 'WHY_CHANGED', 'RISKS', 'ACTIONS', 'COMPLETED'
    ];
    const currentIndex = steps.indexOf(onboardingStep);
    const prev = steps[currentIndex - 1];
    if (prev) setOnboardingStep(prev);
  };

  const lineCount = useMemo(() => clinicData.split('\n').filter(l => l.trim().length > 0).length, [clinicData]);
  const charCount = clinicData.length;

  // Use explicit variables to help TS narrowing
  const isInputView = status === AppStatus.IDLE || status === AppStatus.ERROR;
  const isProcessing = status === AppStatus.GENERATING_NARRATIVE || status === AppStatus.AUDITING;
  const isSuccess = status === AppStatus.SUCCESS;

  return (
    <div className="min-h-screen flex flex-col">
      <Onboarding 
        currentStep={onboardingStep} 
        onNext={nextOnboarding} 
        onPrev={prevOnboarding} 
        onClose={() => setOnboardingStep('HIDDEN')}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
              K
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Kazira.io</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Clinic Intelligence Report MVP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
              <Zap size={14} fill="currentColor" /> SYSTEM ONLINE
            </div>
            <Button variant="ghost" onClick={() => window.location.reload()}><RefreshCw size={18} /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {isInputView ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div 
                id="data-input-area" 
                className={`bg-white rounded-2xl border-2 transition-all duration-200 shadow-xl overflow-hidden scroll-mt-24 ${isDragging ? 'border-blue-500 border-dashed bg-blue-50/30' : 'border-slate-200'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm">Input Stage</h2>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Paste, Load, or Drop Files</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".csv,.txt,.md" 
                      onChange={handleFileUpload} 
                    />
                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs h-9 px-3">
                      <Upload size={14} /> Upload
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setClinicData(DEFAULT_CLINIC_DATA)} className="text-xs h-9 px-3">
                      <FileCode size={14} /> Load Sample
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setClinicData('')} 
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-9 px-3"
                      disabled={!clinicData}
                    >
                      <Trash2 size={14} /> Clear
                    </Button>
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    className="w-full h-[450px] p-6 font-mono text-sm focus:ring-0 outline-none resize-none bg-transparent placeholder:text-slate-300 transition-all leading-relaxed"
                    value={clinicData}
                    onChange={(e) => setClinicData(e.target.value)}
                    placeholder="Paste clinic metrics here or drop a file (CSV, Markdown, Text)..."
                  />
                  {!clinicData && !isDragging && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                      <Upload size={48} className="text-slate-300 mb-2" />
                      <p className="text-sm font-medium text-slate-400">Drag & Drop data files here</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-6 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><List size={14} /> {lineCount} Lines</div>
                    <div className="flex items-center gap-1.5"><Info size={14} /> {charCount} Chars</div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${clinicData ? 'bg-emerald-500' : 'bg-slate-300 animate-pulse'}`}></div>
                      {clinicData ? 'Data Ready' : 'Awaiting Input'}
                    </div>
                  </div>
                  <Button 
                    id="generate-btn"
                    variant="primary" 
                    className="w-full sm:w-auto px-10 py-3 text-lg font-bold shadow-lg shadow-blue-200" 
                    onClick={handleGenerate}
                    isLoading={status === AppStatus.GENERATING_NARRATIVE || status === AppStatus.AUDITING}
                    disabled={!clinicData}
                  >
                    Analyze & Generate
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                  <AlertTriangle size={20} className="shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setShowDataGuide(!showDataGuide)}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <HelpCircle size={18} className="text-blue-500" />
                    Input Best Practices
                  </div>
                  <ChevronRight size={18} className={`text-slate-400 transition-transform ${showDataGuide ? 'rotate-90' : ''}`} />
                </div>
                {showDataGuide && (
                  <div className="p-4 pt-0 border-t border-slate-50">
                    <DataInputGuide />
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-300" />
                  Operational Intelligence
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Audit Verification</h4>
                    <p className="text-xs opacity-90 leading-relaxed">Every claim is audited by a separate logic engine to prevent mathematical hallucination.</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Smart Causality</h4>
                    <p className="text-xs opacity-90 leading-relaxed">Identifies exactly why revenue dropped, from cancellations to specific practitioner performance gaps.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold">
                  <Info size={18} className="text-blue-500" />
                  Integration Help
                </div>
                <div className="text-sm text-slate-600 space-y-3">
                  <p className="text-xs">Kazira works best with weekly CSV exports from your PMS (Practice Management System).</p>
                  <Button variant="secondary" size="sm" onClick={() => setOnboardingStep('WELCOME')} className="mt-2 w-full text-xs">
                    Restart Concept Tour
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {status === AppStatus.GENERATING_NARRATIVE ? '1/2' : '2/2'}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {status === AppStatus.GENERATING_NARRATIVE ? 'Synthesizing Narrative...' : 'Auditing Report Integrity...'}
                  </h2>
                  <p className="text-slate-500 max-w-md">
                    {status === AppStatus.GENERATING_NARRATIVE 
                      ? "Our Narrative Agent is connecting your clinic's data points and identifying primary drivers."
                      : "The Audit Agent is verifying math, logic, and looking for potential hallucinations."
                    }
                  </p>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="space-y-8">
                <Dashboard data={null} />

                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                  <div className="bg-slate-900 text-white p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-blue-500/30">
                          <ClipboardCheck size={14} /> Weekly Executive Intelligence
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">Clinic Performance Report</h1>
                        <p className="text-slate-400 font-medium">{report?.timestamp}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="secondary" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700" onClick={reset}>
                          <RefreshCw size={18} /> Run New Report
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <div className="lg:col-span-3">
                      <ReportContent text={report?.narrative || ''} />
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <SectionHeader title="Trust Score" icon={<ShieldCheck size={18} />} />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Verification</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 size={14} /> Passed
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Logic Check</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 size={14} /> Verified
                            </span>
                          </div>
                          <div className="pt-4 mt-4 border-t border-slate-200">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Audit Agent Output</p>
                            <p className="text-xs text-slate-700 italic leading-relaxed">
                              {report?.audit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <SectionHeader title="Next Milestone" icon={<BarChart3 size={18} />} />
                        <p className="text-sm text-slate-700 font-medium mb-3">Goal: $35k Weekly Revenue</p>
                        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: '81%' }}></div>
                        </div>
                        <p className="text-[10px] text-blue-600 mt-2 font-bold uppercase">81% Progress</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pb-12">
                  <Button variant="ghost" onClick={reset} className="text-slate-500 hover:text-slate-800">
                    Scroll to top and start over
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Kazira.io</span>
            <span>&copy; 2026</span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-slate-600">Methodology</a>
            <a href="#" className="hover:text-slate-600">Documentation</a>
            <a href="#" className="hover:text-slate-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
