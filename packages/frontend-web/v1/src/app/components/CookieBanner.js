'use client';

import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('pd_cookies_accepted')) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('pd_cookies_accepted', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-[#111111]/[0.08] p-5 rounded-2xl shadow-lg animate-hero-1 flex flex-col gap-4">
      <p className="text-xs text-[#555555] leading-relaxed font-normal">
        PaperDEX uses essential session cookies solely for wallet authentication. No tracking or ads.
      </p>

      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => setVisible(false)}
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


