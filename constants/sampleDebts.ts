import { DebtItem, BaselineConfig, RecoveryLogEntry } from '../types';

export const DEFAULT_BASELINE_CONFIG: BaselineConfig = {
  startDate: '2026-03-01',
  endDate: '2026-05-24',
  baselineWeeks: 12,
  preKaziraLeakageRateKes: 380000 // Average KES 380,000 weekly unbilled leakage prior to Kazira
};

export const INITIAL_DEBT_ITEMS: DebtItem[] = [
  {
    id: 'DEBT-101',
    patientRef: 'ANON-PAT-8812',
    procedureName: 'Obstetric Ultrasound Scan & Doppler',
    datePerformed: '2026-06-18',
    gapType: 'Unbilled Procedure',
    estimatedKes: 14500,
    insurer: 'SHA',
    claimRef: 'SHA-CLM-2026-8812',
    submissionDate: '2026-06-19',
    claimStatus: 'rejected',
    daysOutstanding: 23,
    status: 'pending',
    attribution: 'kazira_flagged'
  },
  {
    id: 'DEBT-102',
    patientRef: 'ANON-PAT-9034',
    procedureName: 'Pediatric Specialist Consultation',
    datePerformed: '2026-06-20',
    gapType: 'Unbilled Consultation',
    estimatedKes: 6500,
    insurer: 'Jubilee Health',
    claimRef: 'JUB-883921',
    submissionDate: '2026-06-21',
    claimStatus: 'submitted',
    daysOutstanding: 21,
    status: 'pending',
    attribution: 'kazira_flagged'
  },
  {
    id: 'DEBT-103',
    patientRef: 'ANON-PAT-7120',
    procedureName: 'Minor Surgical Wound Debridement',
    datePerformed: '2026-06-12',
    gapType: 'Unbilled Procedure Item',
    estimatedKes: 28000,
    insurer: 'AAR Insurance',
    claimRef: 'AAR-771822',
    submissionDate: '2026-06-14',
    claimStatus: 'approved',
    daysOutstanding: 29,
    status: 'collected',
    attribution: 'kazira_flagged',
    resolvedAt: '2026-06-28',
    amountCollectedKes: 28000,
    invoiceRef: 'INV-2026-0941'
  },
  {
    id: 'DEBT-104',
    patientRef: 'ANON-PAT-6450',
    procedureName: 'Full Blood Count & Lipid Profile',
    datePerformed: '2026-06-22',
    gapType: 'Unbilled Lab Diagnostic',
    estimatedKes: 8200,
    insurer: 'Self-Pay',
    daysOutstanding: 19,
    status: 'escalated',
    attribution: 'kazira_flagged',
    escalatedTo: 'Head of Billing & Receivables'
  },
  {
    id: 'DEBT-105',
    patientRef: 'ANON-PAT-5290',
    procedureName: 'Dental Scaling & Root Planing',
    datePerformed: '2026-06-15',
    gapType: 'Duplicate Entry',
    estimatedKes: 12000,
    insurer: 'NHIF / SHA',
    daysOutstanding: 26,
    status: 'dismissed',
    attribution: 'manually_identified',
    resolvedAt: '2026-06-17',
    resolutionReason: 'duplicate',
    resolutionNote: 'Verified already invoiced under claim SHA-CLM-2026-4401'
  },
  {
    id: 'DEBT-106',
    patientRef: 'ANON-PAT-4112',
    procedureName: 'Antenatal Panel & Vitamin Supplements',
    datePerformed: '2026-06-24',
    gapType: 'Unbilled Pharmacy Item',
    estimatedKes: 9500,
    insurer: 'SHA',
    claimRef: 'SHA-CLM-2026-9912',
    submissionDate: '2026-06-25',
    claimStatus: 'submitted',
    daysOutstanding: 17,
    status: 'pending',
    attribution: 'kazira_flagged'
  }
];

export const INITIAL_RECOVERY_ENTRIES: RecoveryLogEntry[] = [
  {
    id: 'REC-001',
    debtItemId: 'DEBT-103',
    patientRef: 'ANON-PAT-7120',
    procedureName: 'Minor Surgical Wound Debridement',
    detectedKes: 28000,
    actionedKes: 28000,
    collectedKes: 28000,
    attribution: 'kazira_flagged',
    date: '2026-06-28',
    status: 'collected',
    invoiceRef: 'INV-2026-0941',
    resolutionNote: 'Full payment received from AAR Insurance'
  },
  {
    id: 'REC-002',
    debtItemId: 'DEBT-101',
    patientRef: 'ANON-PAT-8812',
    procedureName: 'Obstetric Ultrasound Scan & Doppler',
    detectedKes: 14500,
    actionedKes: 14500,
    collectedKes: 0,
    attribution: 'kazira_flagged',
    date: '2026-06-19',
    status: 'pending',
    resolutionNote: 'SHA Claim rejected due to missing beneficiary code. Resubmission in progress.'
  },
  {
    id: 'REC-003',
    debtItemId: 'DEBT-104',
    patientRef: 'ANON-PAT-6450',
    procedureName: 'Full Blood Count & Lipid Profile',
    detectedKes: 8200,
    actionedKes: 8200,
    collectedKes: 0,
    attribution: 'kazira_flagged',
    date: '2026-06-25',
    status: 'escalated',
    resolutionNote: 'Escalated to Head of Billing for direct patient follow up'
  }
];
