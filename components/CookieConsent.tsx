import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { safeStorage } from '../utils/storage';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = safeStorage.getItem('kazira_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    safeStorage.setItem('kazira_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    safeStorage.setItem('kazira_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-surface border border-border2 rounded-xl shadow-2xl z-[100] p-5 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-ink text-sm">We value your privacy</h3>
        <button onClick={handleDecline} className="text-ink3 hover:text-ink transition-colors">
          <X size={16} />
        </button>
      </div>
      <p className="text-xs text-ink3 mb-4 leading-relaxed">
        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" size="sm" className="flex-1 text-xs" onClick={handleAccept}>
          Accept
        </Button>
        <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={handleDecline}>
          Decline
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
