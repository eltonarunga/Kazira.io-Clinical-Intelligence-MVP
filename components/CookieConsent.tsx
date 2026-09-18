import React, { useState, useEffect } from 'react';
import { Shield, X, Check, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { safeStorage } from '../utils/storage';
import { trackEvent } from '../utils/analytics';

interface CookieConsentProps {
  onOpenPrivacy?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consent = safeStorage.getItem('kazira_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    safeStorage.setItem('kazira_cookie_consent', 'accepted_all');
    safeStorage.setItem('kazira_cookie_analytics', 'true');
    trackEvent('app_launched', { consent: 'accepted_all' });
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    safeStorage.setItem('kazira_cookie_consent', 'essential_only');
    safeStorage.setItem('kazira_cookie_analytics', 'false');
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    safeStorage.setItem('kazira_cookie_consent', analyticsEnabled ? 'accepted_all' : 'essential_only');
    safeStorage.setItem('kazira_cookie_analytics', String(analyticsEnabled));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      role="region" 
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md bg-surface border border-outline-variant/30 rounded-lg shadow-2xl z-50 p-4 sm:p-5 text-on-surface animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md bg-surface/98"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield size={14} />
          </div>
          <h3 className="font-semibold text-sm text-on-surface tracking-tight">
            KDPA &amp; Privacy Preferences
          </h3>
        </div>
        <button 
          onClick={handleEssentialOnly}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors cursor-pointer"
          aria-label="Dismiss cookie notice"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body Notice */}
      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
        Kazira uses strictly necessary technical tokens to maintain hospital session security and KDPA 2019 offline ledger caching. Non-essential telemetry is fully pseudonymised.
      </p>

      {/* Expandable Preferences Drawer */}
      {showDetails && (
        <div className="bg-surface-container/60 rounded p-3 mb-3 text-xs space-y-2.5 border border-outline-variant/20 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-primary" />
              <span className="font-medium text-on-surface">Strictly Necessary</span>
            </div>
            <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">Always Active</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Session tokens, cryptographic pseudonymisation salts, and local ledger synchronization keys.
          </p>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-medium text-on-surface">Clinical UX Telemetry</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={analyticsEnabled} 
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-8 h-4 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Aggregated, anonymous latency and feature usage telemetry without patient data.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        {showDetails ? (
          <button
            onClick={handleSaveCustom}
            className="w-full sm:flex-1 py-2 px-3 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Save Preferences
          </button>
        ) : (
          <>
            <button
              onClick={handleAcceptAll}
              className="w-full sm:flex-1 py-2 px-3 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Accept All
            </button>
            <button
              onClick={handleEssentialOnly}
              className="w-full sm:flex-1 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium rounded border border-outline-variant/20 transition-colors cursor-pointer"
            >
              Essential Only
            </button>
          </>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-on-surface-variant hover:text-on-surface underline py-1 px-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          {showDetails ? 'Hide Details' : 'Preferences'}
        </button>
      </div>

      {/* Footer Link to Privacy Policy */}
      {onOpenPrivacy && (
        <div className="mt-2.5 pt-2 border-t border-outline-variant/15 text-center">
          <button
            onClick={onOpenPrivacy}
            className="text-[11px] text-primary hover:underline font-medium"
          >
            Read our full KDPA Privacy Policy
          </button>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;
