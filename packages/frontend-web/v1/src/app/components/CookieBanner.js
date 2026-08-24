'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pd_cookies_accepted';

const subscribe = (callback) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

const getSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true;
  }
};

const getServerSnapshot = () => true;

export default function CookieBanner() {
  const isAccepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (isAccepted || dismissed) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${mounted ? '0' : '16px'})`,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: 9999,
        width: 'calc(100vw - 32px)',
        maxWidth: '480px',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(15,15,15,0.1)',
          borderRadius: '16px',
          padding: '12px 14px 12px 14px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Icon */}
        <span
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(15,15,15,0.06)',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>

        {/* Text */}
        <p
          style={{
            flex: 1,
            fontSize: '12.5px',
            lineHeight: '1.5',
            color: '#444',
            margin: 0,
            minWidth: 0,
          }}
        >
          PaperDEX uses essential session cookies for wallet authentication.{' '}
          <span style={{ color: '#999' }}>No tracking or ads.</span>
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#888',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'color 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={accept}
            style={{
              background: '#111111',
              color: '#fff',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = '#111')}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}