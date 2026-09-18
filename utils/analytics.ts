// Kazira Analytics Engine - KDPA 2019 Sovereign Privacy Standards
// Tracks interface telemetry without collecting Personally Identifiable Information (PII)

import { safeStorage } from './storage';

export type EventName = 
  | 'app_launched'
  | 'page_view'
  | 'cta_clicked'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'audit_triggered'
  | 'audit_completed'
  | 'audit_failed'
  | 'debt_resolved'
  | 'debt_added'
  | 'claim_resubmitted'
  | 'report_exported'
  | 'history_viewed'
  | 'legal_document_viewed'
  | 'faq_viewed'
  | 'feedback_submitted'
  | 'data_deleted'
  | 'briefing_shared';

interface EventProperties {
  tab?: string;
  ctaName?: string;
  consent?: string;
  source?: string;
  category?: string;
  status?: string;
  amountKes?: number;
  provider?: string;
  durationMs?: number;
  [key: string]: any;
}

// Check whether analytics telemetry is permitted under user's cookie consent
export const isAnalyticsPermitted = (): boolean => {
  const consent = safeStorage.getItem('kazira_cookie_consent');
  const analyticsPref = safeStorage.getItem('kazira_cookie_analytics');
  if (consent === 'accepted_all') return true;
  if (analyticsPref === 'true') return true;
  return false;
};

export const trackEvent = (eventName: EventName, properties?: EventProperties) => {
  // Always sanitize to ensure no patient PII is accidentally passed
  const sanitizedProps = { ...(properties || {}) };
  delete sanitizedProps.patientName;
  delete sanitizedProps.idNumber;
  delete sanitizedProps.phoneNumber;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Kazira Analytics] ${eventName}`, sanitizedProps);
  }

  // Respect user privacy consent
  if (!isAnalyticsPermitted() && eventName !== 'app_launched') {
    return;
  }

  // Push to dataLayer if present (for Google Tag Manager or hospital enterprise analytics)
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...sanitizedProps
    });
  }
};

export const trackPageView = (tab: string) => {
  trackEvent('page_view', { tab });
};

export const trackCtaClick = (ctaName: string, source: string) => {
  trackEvent('cta_clicked', { ctaName, source });
};

export default {
  trackEvent,
  trackPageView,
  trackCtaClick,
  isAnalyticsPermitted
};
