'use client';
import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between z-50">
      <p className="text-sm mb-4 sm:mb-0">
        We use cookies to improve your experience and for analytics. By continuing to use our site, you accept our use of cookies.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => {
            localStorage.setItem('cookie-consent', 'true');
            setShow(false);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
