export interface ClinicData {
  raw: string;
}

export type UserRole = 'facility_admin' | 'county_health' | 'moh';

export type FacilityType = 'private' | 'public_faith';

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
}
