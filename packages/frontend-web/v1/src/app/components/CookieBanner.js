'use client';

import { useState, useSyncExternalStore } from 'react';

const subscribe = (callback) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getSnapshot = () => {
  try {
    return localStorage.getItem('pd_cookies_accepted') === '1';
  } catch {
    return true;
  }
};

const getServerSnapshot = () => true;

export default function CookieBanner() {
  const isAccepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  if (isAccepted || dismissed) return null;

  const accept = () => {
    try {
      localStorage.setItem('pd_cookies_accepted', '1');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-[#111111]/[0.08] p-5 rounded-2xl shadow-lg animate-hero-1 flex flex-col gap-4">
      <p className="text-xs text-[#555555] leading-relaxed font-normal">
        PaperDEX uses essential session cookies solely for wallet authentication. No tracking or ads.
      </p>

      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-[#777777] hover:text-[#111111] px-3 py-1.5 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button
          onClick={accept}
          className="text-xs font-medium px-4 py-1.5 bg-[#111111] text-white rounded-full hover:bg-[#333333] transition-colors cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
