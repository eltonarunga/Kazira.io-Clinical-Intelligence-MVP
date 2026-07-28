export type Language = 'en' | 'sw';

export interface TranslationSchema {
  appName: string;
  reportMVP: string;
  systemOnline: string;
  role: string;
  facilityAdmin: string;
  countyHealth: string;
  moh: string;
  settings: string;
  history: string;
  reload: string;
  inputStage: string;
  dragDropOrPaste: string;
  uploadBtn: string;
  loadSampleBtn: string;
  clearBtn: string;
  placeholderText: string;
  lines: string;
  chars: string;
  dataReady: string;
  awaitingInput: string;
  generateBtn: string;
  bestPractices: string;
  operationalIntelligence: string;
  auditVerification: string;
  auditVerificationDesc: string;
  smartCausality: string;
  smartCausalityDesc: string;
  integrationHelp: string;
  integrationHelpDesc: string;
  restartTour: string;
  revenueThisWeek: string;
  utilization: string;
  cancellations: string;
  practitionerPerformance: string;
  procedureMix: string;
  trustScore: string;
  verificationPassed: string;
  logicCheckVerified: string;
  auditOutput: string;
  nextMilestone: string;
  milestoneGoal: string;
  progress: string;
  scrollToTop: string;
  dpiaSigned: string;
  dpiaVerificationRequired: string;
  dpiaVerificationAlert: string;
  dpiaCheckLabel: string;
  dpiaUploadAction: string;
  dpiaNoFlowAlert: string;
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    appName: "Kazira Clinical Intelligence",
    reportMVP: "Report MVP",
    systemOnline: "SYSTEM ONLINE",
    role: "Role:",
    facilityAdmin: "Facility Admin",
    countyHealth: "County Health Dept",
    moh: "SHA / MoH",
    settings: "Settings",
    history: "History",
    reload: "Reload",
    inputStage: "Input Stage",
    dragDropOrPaste: "Paste, Load, or Drop Files",
    uploadBtn: "Upload",
    loadSampleBtn: "Load Sample",
    clearBtn: "Clear",
    placeholderText: "Paste clinic metrics here or drop a file (CSV, Markdown, Text)...",
    lines: "Lines",
    chars: "Chars",
    dataReady: "Data Ready",
    awaitingInput: "Awaiting Input",
    generateBtn: "Analyze & Generate",
    bestPractices: "Input Best Practices",
    operationalIntelligence: "Operational Intelligence",
    auditVerification: "Audit Verification",
    auditVerificationDesc: "Every claim is audited by a separate logic engine to prevent mathematical hallucination.",
    smartCausality: "Smart Causality",
    smartCausalityDesc: "Identifies exactly why revenue dropped, from cancellations to specific practitioner performance gaps.",
    integrationHelp: "Integration Help",
    integrationHelpDesc: "Kazira works best with weekly CSV exports from your PMS (Practice Management System).",
    restartTour: "Restart Concept Tour",
    revenueThisWeek: "Revenue This Week",
    utilization: "Clinic Utilization",
    cancellations: "Cancellations",
    practitionerPerformance: "Practitioner Performance",
    procedureMix: "Procedure Mix",
    trustScore: "Audit Trust Score",
    verificationPassed: "Verification: Passed",
    logicCheckVerified: "Logic: Verified",
    auditOutput: "Audit Agent Output",
    nextMilestone: "Next Milestone",
    milestoneGoal: "Goal: $35k Weekly Revenue",
    progress: "Progress",
    scrollToTop: "Scroll to top and start over",
    dpiaSigned: "Data Protection Impact Assessment (DPIA) Registered",
    dpiaVerificationRequired: "KDPA Compliance Verification Required",
    dpiaVerificationAlert: "As mandated by the Kenya Data Protection Act 2019, public facilities must verify that a valid DPIA has been completed and registered with the Office of the Data Protection Commissioner (ODPC) before any patient records can be handled or processed.",
    dpiaCheckLabel: "I confirm that our facility has signed, completed, and registered our Data Protection Impact Assessment (DPIA) with the ODPC.",
    dpiaUploadAction: "Upload Registation Certificate (PDF/Image)",
    dpiaNoFlowAlert: "CRITICAL COMPLIANCE NOTICE: Data flows are completely blocked for this facility until the DPIA confirmation check is checked."
  },
  sw: {
    appName: "Kazira Clinical Intelligence",
    reportMVP: "MVP ya Ripoti",
    systemOnline: "MFUMO UKO MTANDAONI",
    role: "Kazi:",
    facilityAdmin: "Msimamizi wa Kituo",
    countyHealth: "Idara ya Afya ya Kaunti",
    moh: "Mamlaka ya Afya ya Kitaifa (SHA)",
    settings: "Mipangilio",
    history: "Historia",
    reload: "Pakia Pia",
    inputStage: "Sehemu ya Kuingiza Data",
    dragDropOrPaste: "Bandika, Pakia, au Vuta Faili Hapa",
    uploadBtn: "Pakia Faili",
    loadSampleBtn: "Data ya Mfano",
    clearBtn: "Futa Zote",
    placeholderText: "Bandika vipimo vya kliniki yako hapa au buruta faili (CSV, Markdown, Maandishi)...",
    lines: "Mistari",
    chars: "Herufi",
    dataReady: "Data Iko Tayari",
    awaitingInput: "Kusubiri Kuingizwa",
    generateBtn: "Changanua na Utengeneze Ripoti",
    bestPractices: "Mbinu Bora za Kuingiza Data",
    operationalIntelligence: "Ujasusi wa Uendeshaji",
    auditVerification: "Uhakiki wa Ukaguzi",
    auditVerificationDesc: "Kila dai linakaguliwa na injini tofauti ya mantiki ili kuzuia makosa au dhana potofu ya AI.",
    smartCausality: "Uchambuzi wa Sababu",
    smartCausalityDesc: "Hutambua haswa kwa nini mapato yalishuka, kutoka kwa miadi iliyofutwa hadi utendaji wa mtaalamu.",
    integrationHelp: "Msaada wa Ushirikiano",
    integrationHelpDesc: "Kazira hufanya kazi vizuri zaidi ikiwa na mauzo ya kila wiki ya CSV kutoka mfumo wako wa usimamizi wa kliniki.",
    restartTour: "Anzisha Ziara ya Mafunzo",
    revenueThisWeek: "Mapato ya Juma Hili",
    utilization: "Ufanisi wa Kliniki",
    cancellations: "Waliofuta Miadi",
    practitionerPerformance: "Utendaji wa Madaktari",
    procedureMix: "Aina za Matibabu",
    trustScore: "Kiwango cha Uaminifu",
    verificationPassed: "Uhakiki: Umepita",
    logicCheckVerified: "Mantiki: Imethibitishwa",
    auditOutput: "Tokeo la Ukaguzi wa AI",
    nextMilestone: "Lengo Linalofuata",
    milestoneGoal: "Lengo: Mapato ya $35k Kila Wiki",
    progress: "Maendeleo",
    scrollToTop: "Rudi Juu na Uanze Upya",
    dpiaSigned: "Tathmini ya Athari za Kulinda Data (DPIA) Imesajiliwa",
    dpiaVerificationRequired: "Uthibitisho wa Sheria ya KDPA Unahitajika",
    dpiaVerificationAlert: "Kama inavyoamriwa na Sheria ya Kulinda Data ya Kenya ya 2019, vituo vya umma lazima vithibitishe kuwa Tathmini ya Athari za Kulinda Data (DPIA) imekamilika na kusajiliwa na Ofisi ya Kamishna wa Kulinda Data (ODPC) kabla ya rekodi za wagonjwa kushughulikiwa.",
    dpiaCheckLabel: "Nathibitisha kuwa kituo chetu kimekamilisha, kimetia saini, na kusajili Tathmini yetu ya Athari za Kulinda Data (DPIA) na ODPC.",
    dpiaUploadAction: "Pakia Cheti cha Usajili wa DPIA (PDF/Picha)",
    dpiaNoFlowAlert: "ILANI MUHIMU: Mtiririko wa data umezuiwa kabisa kwa kituo hiki hadi utakapothibitisha usajili wa DPIA hapo juu."
  }
};
