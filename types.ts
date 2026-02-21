
export interface ClinicData {
  raw: string;
}

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
}

export type OnboardingStep = 
  | 'WELCOME'
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
