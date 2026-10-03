import { MetricSummary } from '../types';
import { safeStorage } from '../utils/storage';

const getClientHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const token = safeStorage.getItem('kazira_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const generateNarrativeReport = async (data: string): Promise<string> => {
  const response = await fetch('/api/ai/narrative', {
    method: 'POST',
    headers: getClientHeaders(),
    body: JSON.stringify({ data, text: data })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status}) while generating executive narrative.`);
  }

  const result = await response.json();
  return result.narrative || 'Failed to generate narrative.';
};

export const auditReport = async (data: string, narrative: string): Promise<string> => {
  const response = await fetch('/api/ai/audit', {
    method: 'POST',
    headers: getClientHeaders(),
    body: JSON.stringify({ data, text: data, narrative })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status}) while auditing report.`);
  }

  const result = await response.json();
  return result.audit || result.auditedReport || 'Failed to audit report.';
};

export const extractMetrics = async (data: string): Promise<MetricSummary> => {
  const response = await fetch('/api/ai/extract-metrics', {
    method: 'POST',
    headers: getClientHeaders(),
    body: JSON.stringify({ data, text: data })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status}) while extracting structured metrics.`);
  }

  const result = await response.json();
  return result.metrics || {
    revenueThisWeek: 0,
    revenueLastWeek: 0,
    utilization: 0,
    cancellations: 0,
    unbilledRevenueKes: 0,
    shaReimbursementPendingKes: 0,
    shaClaimVolume: 0,
    procedureMix: [],
    practitionerPerformance: []
  };
};

