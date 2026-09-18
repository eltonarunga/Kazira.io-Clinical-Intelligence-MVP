import { DebtItem, RecoveryLogEntry, BaselineConfig, ReportOutput, ShaClaim, UserProfile } from '../types';
import { safeStorage } from '../utils/storage';
import { INITIAL_DEBT_ITEMS, INITIAL_RECOVERY_ENTRIES, DEFAULT_BASELINE_CONFIG } from '../constants/sampleDebts';

export interface SystemStatus {
  status: string;
  version: string;
  uptime: number;
  compliance: {
    kdpa2019: string;
    dpiaStatus: string;
    pseudonymisationMethod: string;
    dataRetentionLimitDays: number;
  };
  aiEngine: {
    provider: string;
    narrativeModel: string;
    auditModel: string;
    isConfigured: boolean;
  };
  integrations: {
    dhis2Endpoint: string;
    fhirEndpoint: string;
    smsGateway: string;
  };
  stats: {
    totalDebtsTracked: number;
    pendingDebtsCount: number;
    recoveryLogEntries: number;
    storedReportsCount: number;
  };
  timestamp: string;
}

export class ApiService {
  private getHeaders(isGuest: boolean = true, facilityCode?: string): Record<string, string> {
    const token = safeStorage.getItem('kazira_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-is-guest': isGuest ? 'true' : 'false',
      'x-facility-code': facilityCode || 'MFL #14920'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Authentication
  public async login(emailOrMfl: string, password?: string, role?: string): Promise<{ success: boolean; token?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMfl, password, role })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          safeStorage.setItem('kazira_auth_token', data.token);
        }
        return data;
      }
    } catch (e) {
      console.warn('[ApiService] Server login request failed');
    }
    return { success: false };
  }

  // Register New Facility & Admin
  public async registerFacility(profile: UserProfile, password?: string): Promise<{ success: boolean; profile?: UserProfile; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        if (data.token) {
          safeStorage.setItem('kazira_auth_token', data.token);
        }
        return data;
      }
      return { success: false, error: data.error || 'Failed to register facility.' };
    } catch (e: any) {
      console.warn('[ApiService] Server registration request failed:', e);
      return { success: false, error: e.message || 'Network error during facility registration.' };
    }
  }

  // Fetch Registered Profiles from Server
  public async fetchRegisteredProfiles(): Promise<UserProfile[]> {
    try {
      const res = await fetch('/api/auth/profiles');
      if (res.ok) {
        const data = await res.json();
        if (data.profiles && Array.isArray(data.profiles)) {
          return data.profiles;
        }
      }
    } catch (e) {
      console.warn('[ApiService] Fetching registered profiles failed:', e);
    }
    return [];
  }

  // Check Backend Health
  public async checkBackendHealth(): Promise<{ online: boolean; uptimeSeconds?: number; environment?: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return { online: data.status === 'ok', uptimeSeconds: data.uptimeSeconds, environment: data.environment };
      }
    } catch (e) {
      // Backend offline or unreachable
    }
    return { online: false };
  }

  // System Health
  public async getSystemStatus(isGuest: boolean = true, facilityCode?: string): Promise<SystemStatus | null> {
    try {
      const res = await fetch(`/api/system/status?isGuest=${isGuest}&facilityCode=${encodeURIComponent(facilityCode || 'MFL #14920')}`, {
        headers: this.getHeaders(isGuest, facilityCode)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[ApiService] Backend system/status unreachable, running in client-offline mode');
    }
    return null;
  }

  // Debts (Multi-tenant Partitioned: Real users get NO mock data, Guests get sandbox feel)
  public async fetchDebts(isGuest: boolean = true, facilityCode?: string): Promise<DebtItem[]> {
    const cacheKey = isGuest ? 'kazira_guest_debts' : `kazira_real_debts_${facilityCode || 'MFL #14920'}`;
    
    try {
      const res = await fetch(`/api/debts?isGuest=${isGuest}&facilityCode=${encodeURIComponent(facilityCode || 'MFL #14920')}`, {
        headers: this.getHeaders(isGuest, facilityCode)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.debts && Array.isArray(data.debts)) {
          safeStorage.setItem(cacheKey, JSON.stringify(data.debts));
          return data.debts;
        }
      }
    } catch (e) {
      console.warn('[ApiService] Failed to fetch debts from server, checking local cache');
    }

    // Check cached partition
    const cached = safeStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }

    // Strict separation: Guest gets demo items to feel the system; Real users get empty list!
    return isGuest ? INITIAL_DEBT_ITEMS : [];
  }

  public async saveDebtItem(item: DebtItem, isGuest: boolean = true, facilityCode?: string): Promise<DebtItem> {
    const cacheKey = isGuest ? 'kazira_guest_debts' : `kazira_real_debts_${facilityCode || 'MFL #14920'}`;
    try {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const data = await res.json();
        return data.debt || item;
      }
    } catch (e) {
      console.warn('[ApiService] Server debt save failed, cached locally');
    }
    return item;
  }

  public async saveDebtItemsBatch(items: DebtItem[], isGuest: boolean = true, facilityCode?: string): Promise<DebtItem[]> {
    const cacheKey = isGuest ? 'kazira_guest_debts' : `kazira_real_debts_${facilityCode || 'MFL #14920'}`;
    try {
      const res = await fetch('/api/debts/batch', {
        method: 'POST',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        const data = await res.json();
        const current = await this.fetchDebts(isGuest, facilityCode);
        const merged = [...items, ...current.filter(c => !items.some(i => i.id === c.id))];
        safeStorage.setItem(cacheKey, JSON.stringify(merged));
        return data.debts || items;
      }
    } catch (e) {
      console.warn('[ApiService] Server batch debt save failed, caching locally');
    }
    const current = await this.fetchDebts(isGuest, facilityCode);
    const merged = [...items, ...current.filter(c => !items.some(i => i.id === c.id))];
    safeStorage.setItem(cacheKey, JSON.stringify(merged));
    return items;
  }

  public async updateDebtItem(id: string, updates: Partial<DebtItem>, isGuest: boolean = true, facilityCode?: string): Promise<DebtItem | null> {
    try {
      const res = await fetch(`/api/debts/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        return data.debt;
      }
    } catch (e) {
      console.warn('[ApiService] Server debt update failed');
    }
    return null;
  }

  public async deleteDebtItem(id: string, isGuest: boolean = true, facilityCode?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(isGuest, facilityCode)
      });
      return res.ok;
    } catch (e) {
      console.warn('[ApiService] Server debt deletion failed');
      return false;
    }
  }

  // Recovery Log (Real users get NO mock logs, Guests get demo logs)
  public async fetchRecoveryLog(isGuest: boolean = true, facilityCode?: string): Promise<RecoveryLogEntry[]> {
    const cacheKey = isGuest ? 'kazira_guest_recovery' : `kazira_real_recovery_${facilityCode || 'MFL #14920'}`;

    try {
      const res = await fetch(`/api/recovery-log?isGuest=${isGuest}&facilityCode=${encodeURIComponent(facilityCode || 'MFL #14920')}`, {
        headers: this.getHeaders(isGuest, facilityCode)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.entries && Array.isArray(data.entries)) {
          safeStorage.setItem(cacheKey, JSON.stringify(data.entries));
          return data.entries;
        }
      }
    } catch (e) {
      console.warn('[ApiService] Failed to fetch recovery log from server, checking cache');
    }

    const cached = safeStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return isGuest ? INITIAL_RECOVERY_ENTRIES : [];
  }

  public async saveRecoveryEntry(entry: RecoveryLogEntry, isGuest: boolean = true, facilityCode?: string): Promise<RecoveryLogEntry> {
    try {
      const res = await fetch('/api/recovery-log', {
        method: 'POST',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        const data = await res.json();
        return data.entry || entry;
      }
    } catch (e) {
      console.warn('[ApiService] Server recovery entry save failed');
    }
    return entry;
  }

  // Baseline Config
  public async fetchBaselineConfig(isGuest: boolean = true, facilityCode?: string): Promise<BaselineConfig> {
    try {
      const res = await fetch(`/api/baseline-config?isGuest=${isGuest}&facilityCode=${encodeURIComponent(facilityCode || 'MFL #14920')}`, {
        headers: this.getHeaders(isGuest, facilityCode)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) return data.config;
      }
    } catch (e) {
      console.warn('[ApiService] Baseline config fetch failed, using default');
    }
    return DEFAULT_BASELINE_CONFIG;
  }

  public async updateBaselineConfig(config: Partial<BaselineConfig>, isGuest: boolean = true, facilityCode?: string): Promise<BaselineConfig> {
    try {
      const res = await fetch('/api/baseline-config', {
        method: 'PUT',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify(config)
      });
      if (res.ok) {
        const data = await res.json();
        return data.config;
      }
    } catch (e) {
      console.warn('[ApiService] Baseline config update failed');
    }
    return { ...DEFAULT_BASELINE_CONFIG, ...config };
  }

  // Reports
  public async fetchReports(isGuest: boolean = true, facilityCode?: string): Promise<ReportOutput[]> {
    try {
      const res = await fetch(`/api/reports?isGuest=${isGuest}&facilityCode=${encodeURIComponent(facilityCode || 'MFL #14920')}`, {
        headers: this.getHeaders(isGuest, facilityCode)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reports && Array.isArray(data.reports)) return data.reports;
      }
    } catch (e) {
      console.warn('[ApiService] Reports fetch failed');
    }
    return [];
  }

  public async saveReport(report: ReportOutput, isGuest: boolean = true, facilityCode?: string): Promise<void> {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify(report)
      });
    } catch (e) {
      console.warn('[ApiService] Report server persistence failed');
    }
  }

  // Outbound DHIS2
  public async pushDHIS2Sync(payload: {
    mflCode: string;
    period: string;
    metrics: {
      shaClaimsTotal: number;
      shaReimbursementValue: number;
      rejectionRatePercent: number;
      primaryCareSubmissions: number;
    };
  }) {
    const res = await fetch('/api/dhis2/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sync with DHIS2 gateway');
    }
    return await res.json();
  }

  // Inbound FHIR
  public async fetchFHIREncounters(count: number = 20) {
    const res = await fetch(`/api/fhir/encounters?count=${count}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch FHIR encounters');
    }
    return await res.json();
  }

  // SMS
  public async dispatchSMS(recipient: string, message: string, category?: string) {
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, message, category })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dispatch SMS notification');
    }
    return await res.json();
  }

  // ==========================================
  // SHA CLAIMS (Multi-Tenant Partitioned)
  // ==========================================
  public async fetchClaims(isGuest: boolean = true, facilityCode?: string): Promise<ShaClaim[]> {
    const cacheKey = isGuest ? 'kazira_guest_claims' : `kazira_sha_claims_${facilityCode || 'MFL #14920'}`;
    try {
      const res = await fetch(`/api/claims?isGuest=${isGuest}&facilityCode=${encodeURIComponent(facilityCode || 'MFL #14920')}`, {
        headers: this.getHeaders(isGuest, facilityCode)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.claims && Array.isArray(data.claims)) {
          safeStorage.setItem(cacheKey, JSON.stringify(data.claims));
          return data.claims;
        }
      }
    } catch (e) {
      console.warn('[ApiService] Server claims fetch failed, loading local storage cache');
    }

    const cached = safeStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Parse error
      }
    }
    return [];
  }

  public async saveClaim(claim: ShaClaim, isGuest: boolean = true, facilityCode?: string): Promise<ShaClaim> {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify(claim)
      });
      if (res.ok) {
        const data = await res.json();
        return data.claim || claim;
      }
    } catch (e) {
      console.warn('[ApiService] Server claim save failed');
    }
    return claim;
  }

  public async updateClaim(id: string, updates: Partial<ShaClaim>, isGuest: boolean = true, facilityCode?: string): Promise<ShaClaim | null> {
    try {
      const res = await fetch(`/api/claims/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: this.getHeaders(isGuest, facilityCode),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        return data.claim || null;
      }
    } catch (e) {
      console.warn('[ApiService] Server claim update failed');
    }
    return null;
  }

  public async deleteClaim(id: string, isGuest: boolean = true, facilityCode?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/claims/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getHeaders(isGuest, facilityCode)
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn('[ApiService] Server claim deletion failed');
    }
    return false;
  }
}

export const apiService = new ApiService();
