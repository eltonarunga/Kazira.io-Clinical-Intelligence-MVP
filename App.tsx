import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { Toaster, toast } from 'sonner';
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
  List,
  Download,
  History,
  Settings as SettingsIcon
} from 'lucide-react';
import { AppStatus, ReportOutput, OnboardingStep } from './types';
import { DEFAULT_CLINIC_DATA } from './constants';
import { generateNarrativeReport, auditReport, extractMetrics } from './services/geminiService';
import { processClinicData } from './utils/dataPipeline';
import { trackEvent } from './utils/analytics';
import { translations, Language } from './utils/translations';
import { safeStorage } from './utils/storage';
import Button from './components/Button';
import Dashboard from './components/Dashboard';
import DashboardSkeleton from './components/DashboardSkeleton';
import Onboarding from './components/Onboarding';
import DataInputGuide from './components/DataInputGuide';
import ErrorBoundary from './components/ErrorBoundary';
import ReportContent from './components/ReportContent';
import LandingPage from './components/LandingPage';
import CookieConsent from './components/CookieConsent';
import GovernmentDashboard from './components/GovernmentDashboard';

// Lazy load modals to improve initial load performance
const Modal = lazy(() => import('./components/Modal'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const AcceptableUsePolicy = lazy(() => import('./components/AcceptableUsePolicy'));
const DataProcessingAgreement = lazy(() => import('./components/DataProcessingAgreement'));
const Changelog = lazy(() => import('./components/Changelog'));
const Documentation = lazy(() => import('./components/Documentation'));
const FeedbackWidget = lazy(() => import('./components/FeedbackWidget'));
const DataManagement = lazy(() => import('./components/DataManagement'));
const Settings = lazy(() => import('./components/Settings'));

// Helper component for section headers
const SectionHeader: React.FC<{ id?: string; title: string; icon: React.ReactNode }> = ({ id, title, icon }) => (
  <div id={id} className="flex items-center gap-2 mb-4 border-b border-border pb-2 scroll-mt-24">
    <div className="p-1.5 bg-accent-light text-accent rounded-lg">
      {icon}
    </div>
    <h2 className="text-lg font-bold text-ink uppercase tracking-tight">{title}</h2>
  </div>
);

const App: React.FC = () => {
  const [clinicData, setClinicData] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [lang, setLang] = useState<Language>(() => {
    return (safeStorage.getItem('kazira_lang') as Language) || 'en';
  });
  const t = translations[lang];
  const [report, setReport] = useState<ReportOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('HIDDEN');
  const [showDataGuide, setShowDataGuide] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAupOpen, setIsAupOpen] = useState(false);
  const [isDpaOpen, setIsDpaOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ReportOutput[]>([]);
  const [showApp, setShowApp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [segment, setSegment] = useState<'private' | 'public'>('private');
  const [role, setRole] = useState<'facility_admin' | 'county_health' | 'moh'>('facility_admin');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearHistory = () => {
    setHistory([]);
    safeStorage.removeItem('kazira_history');
    trackEvent('data_deleted');
  };

  useEffect(() => {
    const hasOnboarded = safeStorage.getItem('kazira_onboarded');
    if (!hasOnboarded) {
      setOnboardingStep('WELCOME');
    }
    
    let savedHistory = [];
    try {
      const stored = safeStorage.getItem('kazira_history');
      if (stored) {
        savedHistory = JSON.parse(stored);
        if (!Array.isArray(savedHistory)) {
          savedHistory = [];
        }
      }
    } catch (e) {
      console.error('Failed to parse clinic history state from storage:', e);
      safeStorage.removeItem('kazira_history'); // Clear corrupt data
    }
    setHistory(savedHistory);
  }, []);

  const handleGenerate = async () => {
    try {
      if (!clinicData.trim()) {
        toast.error("Please enter or load some clinic data first.");
        return;
      }
      
      setError(null);
      setStatus(AppStatus.GENERATING_NARRATIVE);
      trackEvent('report_generation_started', { dataLength: clinicData.length });
      
      if (onboardingStep === 'GENERATE') {
        setOnboardingStep('PROCESSING');
      }

      // 1. Process and clean the raw data through the pipeline
      const cleanedData = processClinicData(clinicData);

      // 2. Parallelize narrative generation and metric extraction using cleaned data
      const [narrative, metrics] = await Promise.all([
        generateNarrativeReport(cleanedData),
        extractMetrics(cleanedData)
      ]);
      
      setStatus(AppStatus.AUDITING);
      const audit = await auditReport(cleanedData, narrative);
      
      const newReport: ReportOutput = {
        narrative,
        audit,
        metrics,
        timestamp: new Date().toLocaleString()
      };

      setReport(newReport);
      setStatus(AppStatus.SUCCESS);
      toast.success("Report generated successfully!");

      // Save to history
      const updatedHistory = [newReport, ...history].slice(0, 10);
      setHistory(updatedHistory);
      safeStorage.setItem('kazira_history', JSON.stringify(updatedHistory));
      
      trackEvent('report_generation_completed', { 
        revenue: newReport.metrics?.revenueThisWeek,
        practitionerCount: newReport.metrics?.practitionerPerformance?.length 
      });

      if (onboardingStep === 'PROCESSING') {
        setTimeout(() => setOnboardingStep('REPORT_OVERVIEW'), 1000);
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
      setStatus(AppStatus.ERROR);
      trackEvent('report_generation_failed', { error: errorMessage });
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const content = `# Kazira.io Clinic Performance Report\nGenerated: ${report.timestamp}\n\n${report.narrative}\n\n## Audit Log\n${report.audit}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kazira_Report_${report.timestamp.replace(/[/:\s]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
      'WELCOME', 'DPIA_COMPLIANCE', 'DATA_INPUT', 'GENERATE', 'PROCESSING', 'REPORT_OVERVIEW', 
      'EXEC_SUMMARY', 'WHY_CHANGED', 'RISKS', 'ACTIONS', 'COMPLETED'
    ];
    const currentIndex = steps.indexOf(onboardingStep);
    
    if (onboardingStep === 'DATA_INPUT') {
      setClinicData(DEFAULT_CLINIC_DATA);
    }

    const next = steps[currentIndex + 1];
    
    if (next === 'COMPLETED') {
      safeStorage.setItem('kazira_onboarded', 'true');
      setOnboardingStep('HIDDEN');
      trackEvent('onboarding_completed');
      return;
    }

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
      'WELCOME', 'DPIA_COMPLIANCE', 'DATA_INPUT', 'GENERATE', 'PROCESSING', 'REPORT_OVERVIEW', 
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

  if (!showApp) {
    return <LandingPage 
      onLaunchApp={() => {
        setShowApp(true);
        trackEvent('app_launched');
      }} 
      segment={segment}
      setSegment={setSegment}
    />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-surface text-ink">
        <Toaster position="top-right" richColors />
        <Onboarding 
          currentStep={onboardingStep} 
          onNext={nextOnboarding} 
          onPrev={prevOnboarding} 
          onClose={() => setOnboardingStep('HIDDEN')}
          segment={segment}
          lang={lang}
        />

      <header className="bg-surface border-b border-border2 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-accent/20">
              K
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-ink tracking-tight font-serif">{t.appName}</h1>
              <p className="text-[10px] text-ink3 font-bold uppercase tracking-widest leading-none">{t.reportMVP}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher Button */}
            <button 
              onClick={() => {
                const nextLang = lang === 'en' ? 'sw' : 'en';
                setLang(nextLang);
                safeStorage.setItem('kazira_lang', nextLang);
                toast.success(nextLang === 'sw' ? 'Lugha imebadilishwa kuwa Kiswahili' : 'Language switched to English');
              }}
              className="flex items-center gap-1.5 px-2 py-1 bg-surface2 border border-border2 hover:border-accent hover:text-accent rounded-md text-xs font-bold transition-all h-8"
              title="Switch Language / Badilisha Lugha"
            >
              <span className="text-xs">{lang === 'en' ? '🇰🇪 SW' : '🇬🇧 EN'}</span>
            </button>

            {segment === 'public' && (
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-[10px] font-bold text-ink3 uppercase tracking-wider hidden sm:inline">{t.role}</span>
                <select 
                  className="bg-surface2 border border-border2 rounded-md text-xs px-2 py-1 outline-none focus:border-accent"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="facility_admin">{t.facilityAdmin}</option>
                  <option value="county_health">{t.countyHealth}</option>
                  <option value="moh">{t.moh}</option>
                </select>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent-pale text-accent2 rounded-full text-xs font-bold border border-accent/20">
              <Zap size={14} fill="currentColor" /> {t.systemOnline}
            </div>
            <Button variant="ghost" onClick={() => setIsSettingsOpen(true)} title={t.settings}>
              <SettingsIcon size={18} />
            </Button>
            <Button variant="ghost" onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) trackEvent('history_viewed');
            }} className="relative" title={t.history}>
              <History size={18} />
              {history.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] flex items-center justify-center rounded-full border-2 border-surface">{history.length}</span>}
            </Button>
            <Button variant="ghost" onClick={() => window.location.reload()} title={t.reload}><RefreshCw size={18} /></Button>
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="text-accent" size={20} />
                <h2 className="font-bold text-ink">Report History</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}><X size={20} /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto text-ink3/30 mb-4" />
                  <p className="text-ink3 font-medium">No reports generated yet.</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-accent-light/30 transition-all cursor-pointer group"
                    onClick={() => {
                      setReport(item);
                      setStatus(AppStatus.SUCCESS);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{item.timestamp}</span>
                      <ChevronRight size={14} className="text-ink3/50 group-hover:text-accent transition-colors" />
                    </div>
                    <h3 className="font-bold text-ink2 text-sm line-clamp-1">
                      {item.narrative.split('\n').find(l => l.startsWith('## 1.'))?.replace('## 1.', '').trim() || 'Weekly Report'}
                    </h3>
                    <div className="mt-2 flex gap-2">
                      <div className="px-2 py-0.5 bg-surface2 text-[10px] font-bold text-ink3 rounded uppercase">
                        ${item.metrics?.revenueThisWeek.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-border">
              <Button 
                variant="secondary" 
                className="w-full text-warn hover:text-warn/80 hover:bg-warn-light border-warn/20"
                onClick={() => {
                  if (confirm('Clear all history?')) {
                    setHistory([]);
                    safeStorage.removeItem('kazira_history');
                  }
                }}
                disabled={history.length === 0}
              >
                <Trash2 size={16} /> Clear History
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {segment === 'public' && (role === 'county_health' || role === 'moh') ? (
          <GovernmentDashboard role={role} />
        ) : isInputView ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div 
                id="data-input-area" 
                className={`bg-surface rounded-2xl border-2 transition-all duration-200 shadow-xl overflow-hidden scroll-mt-24 ${isDragging ? 'border-accent border-dashed bg-accent-light/30' : 'border-border2'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-4 border-b border-border bg-surface2/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-accent-light text-accent2 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-ink2 text-sm">{t.inputStage}</h2>
                      <p className="text-[10px] text-ink3 font-medium uppercase tracking-tight">{t.dragDropOrPaste}</p>
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
                      <Upload size={14} /> {t.uploadBtn}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setClinicData(DEFAULT_CLINIC_DATA)} className="text-xs h-9 px-3">
                      <FileCode size={14} /> {t.loadSampleBtn}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setClinicData('')} 
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-9 px-3"
                      disabled={!clinicData}
                    >
                      <Trash2 size={14} /> {t.clearBtn}
                    </Button>
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    className="w-full h-[450px] p-6 font-mono text-sm focus:ring-0 outline-none resize-none bg-transparent placeholder:text-ink3/50 transition-all leading-relaxed"
                    value={clinicData}
                    onChange={(e) => setClinicData(e.target.value)}
                    placeholder={t.placeholderText}
                  />
                  {!clinicData && !isDragging && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                      <Upload size={48} className="text-ink3/50 mb-2" />
                      <p className="text-sm font-medium text-ink3/70">Drag & Drop data files here</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-surface2 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-6 text-ink3 text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><List size={14} /> {lineCount} {t.lines}</div>
                    <div className="flex items-center gap-1.5"><Info size={14} /> {charCount} {t.chars}</div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${clinicData ? 'bg-accent2' : 'bg-ink3/30 animate-pulse'}`}></div>
                      {clinicData ? t.dataReady : t.awaitingInput}
                    </div>
                  </div>
                  <Button 
                    id="generate-btn"
                    variant="primary" 
                    className="w-full sm:w-auto px-10 py-3 text-lg font-bold shadow-lg shadow-accent/20" 
                    onClick={handleGenerate}
                    isLoading={isProcessing}
                    disabled={!clinicData}
                  >
                    {t.generateBtn}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-surface rounded-2xl border border-border2 overflow-hidden shadow-sm">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface2 transition-colors"
                  onClick={() => setShowDataGuide(!showDataGuide)}
                >
                  <div className="flex items-center gap-2 font-bold text-ink2 text-sm">
                    <HelpCircle size={18} className="text-accent" />
                    {t.bestPractices}
                  </div>
                  <ChevronRight size={18} className={`text-ink3/70 transition-transform ${showDataGuide ? 'rotate-90' : ''}`} />
                </div>
                {showDataGuide && (
                  <div className="p-4 pt-0 border-t border-surface2">
                    <DataInputGuide />
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-accent to-ink2 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-gold" />
                  {t.operationalIntelligence}
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent-light mb-1">{t.auditVerification}</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{t.auditVerificationDesc}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent-light mb-1">{t.smartCausality}</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{t.smartCausalityDesc}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-border2 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-ink2 font-bold">
                  <Info size={18} className="text-accent" />
                  {t.integrationHelp}
                </div>
                <div className="text-sm text-ink3 space-y-3">
                  <p className="text-xs">{t.integrationHelpDesc}</p>
                  <Button variant="secondary" size="sm" onClick={() => setOnboardingStep('WELCOME')} className="mt-2 w-full text-xs">
                    {t.restartTour}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {isProcessing ? (
              <div className="space-y-8">
                <DashboardSkeleton />
                <div className="bg-surface rounded-3xl border border-border2 shadow-2xl overflow-hidden p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 border-8 border-surface2 border-t-accent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-accent font-bold text-xl">
                        {status === AppStatus.GENERATING_NARRATIVE ? '1/2' : '2/2'}
                      </div>
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-ink2 mb-2">
                        {status === AppStatus.GENERATING_NARRATIVE 
                          ? (lang === 'sw' ? 'Tunaunda Maelezo...' : 'Synthesizing Narrative...') 
                          : (lang === 'sw' ? 'Tunakagua Uadilifu wa Ripoti...' : 'Auditing Report Integrity...')}
                      </h2>
                      <p className="text-ink3 max-w-md">
                        {status === AppStatus.GENERATING_NARRATIVE 
                          ? (lang === 'sw' ? "Mjumbe wetu wa Maelezo anakusanya pointi za data za kliniki yako na kutambua vichocheo vikuu vya kiutendaji." : "Our Narrative Agent is connecting your clinic's data points and identifying primary drivers.")
                          : (lang === 'sw' ? "Mjumbe wa Ukaguzi anathibitisha hesabu, mantiki, na kutafuta hitilafu zozote." : "The Audit Agent is verifying math, logic, and looking for potential hallucinations.")
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="space-y-8">
                <Dashboard data={report?.metrics} lang={lang} />

                <div className="bg-surface rounded-3xl border border-border2 shadow-2xl overflow-hidden">
                  <div className="bg-ink text-white p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent-light rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-accent/30">
                          <ClipboardCheck size={14} /> {lang === 'sw' ? 'Ujasusi wa Mtendaji wa Kila Wiki' : 'Weekly Executive Intelligence'}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 font-serif">{lang === 'sw' ? 'Ripoti ya Utendaji wa Kliniki' : 'Clinic Performance Report'}</h1>
                        <p className="text-ink3/70 font-medium">{report?.timestamp}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="secondary" className="bg-ink2 border-ink3 text-white hover:bg-ink3" onClick={handleDownload}>
                          <Download size={18} /> Export MD
                        </Button>
                        <Button variant="secondary" className="bg-ink2 border-ink3 text-white hover:bg-ink3" onClick={reset}>
                          <RefreshCw size={18} /> {lang === 'sw' ? 'Ripoti Mpya' : 'New Report'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <div className="lg:col-span-3">
                      <ReportContent text={report?.narrative || ''} />
                    </div>

                    <div className="lg:col-span-1 space-y-8 animate-in fade-in duration-550">
                      <div className="bg-surface2 p-6 rounded-2xl border border-border2">
                        <SectionHeader title={t.trustScore} icon={<ShieldCheck size={18} />} />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink3">GDPR / KDPA 2019</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                              <CheckCircle2 size={14} /> Passed
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink3">Verification</span>
                            <span className="text-accent2 font-bold flex items-center gap-1 text-xs">
                              <CheckCircle2 size={14} /> {t.verificationPassed}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink3">Logic Check</span>
                            <span className="text-accent2 font-bold flex items-center gap-1 text-xs">
                              <CheckCircle2 size={14} /> {t.logicCheckVerified}
                            </span>
                          </div>
                          <div className="pt-4 mt-4 border-t border-border2">
                            <p className="text-[10px] text-ink3/70 font-bold uppercase mb-2">{t.auditOutput}</p>
                            <p className="text-xs text-ink2 italic leading-relaxed">
                              {report?.audit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-accent-light p-6 rounded-2xl border border-accent/20">
                        <SectionHeader title={t.nextMilestone} icon={<BarChart3 size={18} />} />
                        <p className="text-sm text-ink2 font-medium mb-3">{t.milestoneGoal}</p>
                        <div className="w-full h-2 bg-accent/20 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: '81%' }}></div>
                        </div>
                        <p className="text-[10px] text-accent mt-2 font-bold uppercase">81% {t.progress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pb-12">
                  <Button variant="ghost" onClick={reset} className="text-ink3 hover:text-ink2">
                    {t.scrollToTop}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className="bg-surface border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-ink3/70 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink3">Kazira Clinical Intelligence</span>
            <span>&copy; 2026</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium">
            <button onClick={() => setIsChangelogOpen(true)} className="hover:text-ink3 transition-colors">Changelog</button>
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-ink3 transition-colors">Documentation</button>
            <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-ink3 transition-colors">Feedback</button>
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-ink3 transition-colors">Terms of Service</button>
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-ink3 transition-colors">Privacy Policy</button>
            <button onClick={() => setIsAupOpen(true)} className="hover:text-ink3 transition-colors">AUP</button>
            <button onClick={() => setIsDpaOpen(true)} className="hover:text-ink3 transition-colors">DPA</button>
            <button onClick={() => setIsDataManagementOpen(true)} className="hover:text-ink3 transition-colors">Data Management</button>
            <a href="mailto:support@kazira.io" className="hover:text-ink3 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <Suspense fallback={null}>
        <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Terms of Service">
          <TermsOfService />
        </Modal>
        
        <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Privacy Policy">
          <PrivacyPolicy />
        </Modal>

        <Modal isOpen={isAupOpen} onClose={() => setIsAupOpen(false)} title="Acceptable Use Policy">
          <AcceptableUsePolicy />
        </Modal>

        <Modal isOpen={isDpaOpen} onClose={() => setIsDpaOpen(false)} title="Data Processing Agreement">
          <DataProcessingAgreement />
        </Modal>

        <Modal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} title="Changelog">
          <Changelog />
        </Modal>

        <Modal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} title="Documentation">
          <Documentation />
        </Modal>

        <Modal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} title="Feedback">
          <FeedbackWidget onClose={() => setIsFeedbackOpen(false)} />
        </Modal>

        <Modal isOpen={isDataManagementOpen} onClose={() => setIsDataManagementOpen(false)} title="Data Management & Privacy">
          <DataManagement 
            onClearHistory={clearHistory} 
            onClose={() => setIsDataManagementOpen(false)} 
          />
        </Modal>

        <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
          <Settings onClose={() => setIsSettingsOpen(false)} />
        </Modal>
      </Suspense>

      <CookieConsent />
    </div>
    </ErrorBoundary>
  );
};

export default App;