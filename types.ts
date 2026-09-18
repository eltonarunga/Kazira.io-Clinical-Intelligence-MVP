export interface ClinicData {
  raw: string;
}

export type UserRole = 'facility_admin' | 'county_health' | 'moh' | 'guest';

export type FacilityType = 'private' | 'public_faith';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  role: UserRole;
  facilityName: string;
  facilityCode: string;
  facilityType: FacilityType;
  avatarMonogram: string;
  avatarColor?: string;
  isGuest?: boolean;
  department?: string;
  phone?: string;
  permissions: string[];
}

export type NavTab = 
  | 'overview' 
  | 'debts' 
  | 'sha_claims' 
  | 'ai_audit' 
  | 'integrations' 
  | 'profile';

export interface ReportOutput {
  narrative: string;
  audit?: string;
  metrics?: MetricSummary;
  timestamp: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_NARRATIVE = 'GENERATING_NARRATIVE',
  AUDITING = 'AUDITING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface MetricSummary {
  revenueThisWeek: number;
  revenueLastWeek: number;
  utilization: number;
  cancellations: number;
  procedureMix: { name: string; value: number }[];
  practitionerPerformance: { name: string; patients: number }[];
  shaClaimVolume?: number;
  shaReimbursementPendingKes?: number;
  unbilledRevenueKes?: number;
}

export type OnboardingStep = 
  | 'WELCOME'
  | 'DPIA_COMPLIANCE'
  | 'BASELINE_CONFIG'
  | 'DATA_INPUT'
  | 'GENERATE'
  | 'PROCESSING'
  | 'REPORT_OVERVIEW'
  | 'EXEC_SUMMARY'
  | 'WHY_CHANGED'
  | 'RISKS'
  | 'ACTIONS'
  | 'COMPLETED'
  | 'HIDDEN';

export interface IntegrationStatus {
  dhis2Sync: {
    lastSynced?: string;
    status: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
    refId?: string;
  };
  fhirConnect: {
    connected: boolean;
    lastFetch?: string;
    totalEncountersFetched: number;
  };
  smsAlerts: {
    enabled: boolean;
    lastSent?: string;
  };
}

// =========================================
// DEBT, RECOVERIES & ATTRIBUTION SCHEMAS
// =========================================

export type FlagAttribution = 'kazira_flagged' | 'manually_identified';

export type ClaimStatus = 'unsubmitted' | 'submitted' | 'approved' | 'rejected' | 'resubmitted';

export type FlagStatus = 'pending' | 'collected' | 'dismissed' | 'escalated';

export type DismissalReasonCode = 
  | 'already_invoiced'
  | 'patient_refused'
  | 'write_off'
  | 'data_error'
  | 'duplicate';

export interface DebtItem {
  id: string;
  patientRef: string; // e.g., "PAT-ANON-8923"
  procedureName: string;
  datePerformed: string;
  gapType: string; // e.g., "Unbilled Consultation", "Unbilled Lab Panel", "Missing SHA ID"
  estimatedKes: number;
  insurer?: string; // e.g., "SHA", "Jubilee", "AAR", "NHIF", "Out-of-Pocket"
  claimRef?: string;
  submissionDate?: string;
  claimStatus?: ClaimStatus;
  daysOutstanding: number;
  status: FlagStatus;
  attribution: FlagAttribution;
  // Resolution details
  resolvedAt?: string;
  resolutionReason?: DismissalReasonCode;
  resolutionNote?: string;
  amountCollectedKes?: number;
  invoiceRef?: string;
  escalatedTo?: string;
  department?: string;
  doctorName?: string;
  icd10Code?: string;
  notes?: string;
}

export interface RecoveryLogEntry {
  id: string;
  debtItemId: string;
  patientRef: string;
  procedureName: string;
  detectedKes: number;
  actionedKes: number;
  collectedKes: number;
  attribution: FlagAttribution;
  date: string;
  status: FlagStatus;
  invoiceRef?: string;
  resolutionNote?: string;
}

export interface BaselineConfig {
  startDate: string;
  endDate: string;
  baselineWeeks: number; // default 12 weeks
  preKaziraLeakageRateKes: number; // estimated pre-Kazira weekly leakage rate
  hospitalName?: string;
}

// =========================================
// SOCIAL HEALTH AUTHORITY (SHA) CLAIMS
// =========================================

export interface ShaClaim {
  id: string;
  memberId: string;
  diagnosis: string;
  icdCode: string;
  tariffCode: string;
  tariffName: string;
  originalAmount: number;
  cappedAmount: number;
  status: 'Ready' | 'Action Required' | 'Disputed';
  issueType?: 'tariff_cap' | 'missing_icd' | 'preauth_missing';
  issueDescription?: string;
  recommendedFix?: string;
}

export const INITIAL_SHA_CLAIMS: ShaClaim[] = [
  {
    id: 'SHA-CLM-9811',
    memberId: 'SHA-90821-K',
    diagnosis: 'Single delivery by caesarean section',
    icdCode: 'O82.0',
    tariffCode: 'MAT-CS-SPEC-01',
    tariffName: 'Inpatient Surgical Maternity',
    originalAmount: 49500,
    cappedAmount: 45000,
    status: 'Action Required',
    issueType: 'tariff_cap',
    issueDescription: 'Itemized total exceeds SHA tariff cap by KES 4,500.',
    recommendedFix: 'Cap at standard KES 45,000 tariff'
  },
  {
    id: 'SHA-CLM-9815',
    memberId: 'SHA-43102-L',
    diagnosis: 'Infectious gastroenteritis and colitis',
    icdCode: 'A09',
    tariffCode: 'PED-IP-02',
    tariffName: 'Inpatient Pediatrics',
    originalAmount: 22000,
    cappedAmount: 22000,
    status: 'Action Required',
    issueType: 'missing_icd',
    issueDescription: 'Missing mandatory secondary dehydration code E86.0 for inpatient claim.',
    recommendedFix: 'Add E86.0 (Dehydration)'
  },
  {
    id: 'SHA-CLM-9824',
    memberId: 'SHA-77190-M',
    diagnosis: 'Hemodialysis maintenance cycle',
    icdCode: 'Z49.1',
    tariffCode: 'REN-DIAL-04',
    tariffName: 'Renal Dialysis Session',
    originalAmount: 78500,
    cappedAmount: 78500,
    status: 'Action Required',
    issueType: 'preauth_missing',
    issueDescription: 'Biometric authorization token missing from emergency intake.',
    recommendedFix: 'Send pre-auth SMS request to patient'
  },
  {
    id: 'SHA-CLM-9790',
    memberId: 'SHA-11029-P',
    diagnosis: 'General gynecological examination',
    icdCode: 'Z01.419',
    tariffCode: 'GYN-OP-01',
    tariffName: 'Outpatient Specialist Clinic',
    originalAmount: 12000,
    cappedAmount: 12000,
    status: 'Ready'
  },
  {
    id: 'SHA-CLM-9784',
    memberId: 'SHA-66410-Q',
    diagnosis: 'Type 2 diabetes with ophthalmic complications',
    icdCode: 'E11.3',
    tariffCode: 'MED-OP-03',
    tariffName: 'Chronic Care Clinic',
    originalAmount: 8500,
    cappedAmount: 8500,
    status: 'Ready'
  }
];
