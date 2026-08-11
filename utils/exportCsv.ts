import { DebtItem, RecoveryLogEntry, BaselineConfig } from '../types';

/**
 * Utility function to convert JavaScript object array to CSV string and download it
 */
const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportDebtListToCSV = (items: DebtItem[]) => {
  const headers = [
    'Debt ID',
    'Patient Ref',
    'Procedure / Service',
    'Date Performed',
    'Billing Gap Type',
    'Estimated Value (KES)',
    'Insurer',
    'Claim Reference',
    'Claim Status',
    'Days Outstanding',
    'Status',
    'Attribution Source',
    'Invoice Ref',
    'Amount Collected (KES)',
    'Resolution Reason',
    'Notes'
  ];

  const rows = items.map((item) => [
    item.id,
    item.patientRef,
    item.procedureName,
    item.datePerformed,
    item.gapType,
    item.estimatedKes,
    item.insurer || 'Self-Pay',
    item.claimRef || 'N/A',
    item.claimStatus || 'unsubmitted',
    item.daysOutstanding,
    item.status.toUpperCase(),
    item.attribution === 'kazira_flagged' ? 'Kazira Auto-Flagged' : 'Manual Entry',
    item.invoiceRef || 'N/A',
    item.amountCollectedKes || 0,
    item.resolutionReason || 'N/A',
    item.resolutionNote || ''
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`Kazira_Debt_Receivables_${dateStr}.csv`, headers, rows);
};

export const exportRecoveryLogbookToCSV = (entries: RecoveryLogEntry[], baseline?: BaselineConfig) => {
  const headers = [
    'Entry ID',
    'Date Actioned',
    'Patient Ref',
    'Procedure / Service',
    'Detected Value (KES)',
    'Actioned Value (KES)',
    'Collected Value (KES)',
    'Status',
    'Attribution',
    'Invoice Reference',
    'Notes'
  ];

  const rows = entries.map((e) => [
    e.id,
    e.date,
    e.patientRef,
    e.procedureName,
    e.detectedKes,
    e.actionedKes,
    e.collectedKes,
    e.status.toUpperCase(),
    e.attribution === 'kazira_flagged' ? 'Kazira Auto-Flagged' : 'Manual Log',
    e.invoiceRef || 'N/A',
    e.resolutionNote || ''
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`Kazira_Recovery_Logbook_${dateStr}.csv`, headers, rows);
};
