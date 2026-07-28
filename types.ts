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
