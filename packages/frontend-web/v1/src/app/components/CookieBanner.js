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
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#000', borderTop: '2px solid #00ff41',
      padding: '20px 32px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#00ff41', fontSize: '20px', fontWeight: 900 }}>⬛ COOKIES</span>
        <span style={{ color: '#fff', fontSize: '13px', maxWidth: '520px', lineHeight: 1.6 }}>
          PaperDEX uses cookies to save your session and keep you logged in.
          No tracking. No ads. Just auth.
        </span>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={accept}
          style={{
            background: '#00ff41', color: '#000', border: 'none',
            padding: '10px 28px', fontFamily: 'inherit', fontWeight: 900,
            fontSize: '13px', cursor: 'pointer', letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          ACCEPT
        </button>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'transparent', color: '#00ff41',
            border: '2px solid #00ff41', padding: '10px 20px',
            fontFamily: 'inherit', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}
        >
          DISMISS
        </button>
      </div>
    </div>
  );
}
