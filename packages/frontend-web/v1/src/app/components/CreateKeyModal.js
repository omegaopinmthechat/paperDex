'use client';

import { useState, useRef } from 'react';
import { createApiKey } from '../actions/apiKeys';

const EXPIRY_OPTIONS = [
  { value: '7d',    label: '7 days' },
  { value: '30d',   label: '30 days' },
  { value: '180d',  label: '6 months' },
  { value: 'never', label: 'Never expire' },
];

const SCOPE_OPTIONS = [
  { value: 'READ_ONLY', label: 'Read Only', desc: 'Access market data and portfolio. Cannot execute trades.' },
  { value: 'TRADE',     label: 'Trade',     desc: 'Full access: market data, portfolio, and buy/sell execution.' },
];

export default function CreateKeyModal({ onCreated, onClose }) {
  const [name, setName]           = useState('');
  const [scope, setScope]         = useState('READ_ONLY');
  const [expiresIn, setExpiresIn] = useState('30d');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [created, setCreated]     = useState(null);   // { id, secret, ... } — shown once
  const [copied, setCopied]       = useState(false);
  const secretRef                 = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter a name for this key.'); return; }
    setLoading(true);
    setError(null);
    const result = await createApiKey({ name: name.trim(), scope, expiresIn });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    } else {
      setCreated(result.data);
    }
  };

  const handleCopy = () => {
    const text = `${created.id}:${created.secret}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDone = () => {
    onCreated?.(created);
    onClose?.();
  };

  return (
    /* Backdrop */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,15,15,0.32)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#FEFCF8',
          border: '1px solid rgba(15,15,15,0.1)',
          borderRadius: '24px',
          padding: '36px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
          animation: 'gsFadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* ── SUCCESS VIEW ── */}
        {created ? (
          <>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>
                Key Created Successfully
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.02em', color: '#0F0F0F', marginBottom: '6px' }}>
                Save your secret now.
              </h2>
              <p style={{ fontSize: '13px', color: '#c0392b', lineHeight: 1.6 }}>
                This secret will <strong>never be shown again</strong>. Copy it and store it securely before closing.
              </p>
            </div>

            {/* Key ID */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Key ID
              </label>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#0F0F0F',
                  background: 'rgba(15,15,15,0.04)',
                  border: '1px solid rgba(15,15,15,0.1)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  userSelect: 'all',
                  wordBreak: 'break-all',
                }}
              >
                {created.id}
              </div>
            </div>

            {/* Secret */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Secret Key
              </label>
              <div
                ref={secretRef}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: '#0F0F0F',
                  background: 'rgba(15,15,15,0.04)',
                  border: '1px solid rgba(15,15,15,0.1)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  userSelect: 'all',
                  wordBreak: 'break-all',
                }}
              >
                {created.secret}
              </div>
            </div>

            {/* Usage hint */}
            <div
              style={{
                background: 'rgba(15,15,15,0.03)',
                border: '1px solid rgba(15,15,15,0.07)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '24px',
                fontSize: '12px',
                color: '#666',
                lineHeight: 1.7,
              }}
            >
              <strong>How to use: </strong>Pass as the Authorization header:<br />
              <code style={{ fontFamily: 'monospace', color: '#0F0F0F' }}>
                Authorization: {created.id}:{created.secret.slice(0, 20)}…
              </code>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1,
                  background: copied ? '#16a34a' : '#0F0F0F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '13px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy Full Credentials'}
              </button>
              <button
                onClick={handleDone}
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#0F0F0F',
                  border: '1px solid rgba(15,15,15,0.2)',
                  borderRadius: '9999px',
                  padding: '13px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {"I've saved it — Done"}
              </button>
            </div>
          </>
        ) : (
          /* ── CREATE FORM ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Developer API
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.02em', color: '#0F0F0F' }}>
                  New API Key
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '22px', lineHeight: 1, padding: '0 2px' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name */}
              <div>
                <label
                  htmlFor="key-name"
                  style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '7px', letterSpacing: '0.04em' }}
                >
                  Key Name
                </label>
                <input
                  id="key-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. my trading bot"
                  maxLength={64}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid rgba(15,15,15,0.15)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    background: '#fff',
                    color: '#0F0F0F',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              </div>

              {/* Scope */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '10px', letterSpacing: '0.04em' }}>
                  Permissions
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SCOPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '14px 16px',
                        border: `1.5px solid ${scope === opt.value ? '#0F0F0F' : 'rgba(15,15,15,0.1)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: scope === opt.value ? 'rgba(15,15,15,0.03)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value={opt.value}
                        checked={scope === opt.value}
                        onChange={() => setScope(opt.value)}
                        style={{ marginTop: '2px', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F0F0F', marginBottom: '2px' }}>{opt.label}</div>
                        <div style={{ fontSize: '12px', color: '#777', lineHeight: 1.5 }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '10px', letterSpacing: '0.04em' }}>
                  Expiry
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {EXPIRY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '11px 14px',
                        border: `1.5px solid ${expiresIn === opt.value ? '#0F0F0F' : 'rgba(15,15,15,0.1)'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: expiresIn === opt.value ? 600 : 400,
                        color: '#0F0F0F',
                        background: expiresIn === opt.value ? 'rgba(15,15,15,0.03)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="expiresIn"
                        value={opt.value}
                        checked={expiresIn === opt.value}
                        onChange={() => setExpiresIn(opt.value)}
                        style={{ flexShrink: 0 }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontSize: '13px', color: '#c0392b', lineHeight: 1.5 }}>{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="gs-btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              >
                {loading ? 'Creating…' : 'Generate API Key'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
