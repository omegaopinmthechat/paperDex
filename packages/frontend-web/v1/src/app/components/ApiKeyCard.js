'use client';

import { useState } from 'react';
import { revokeApiKey } from '../actions/apiKeys';

const SCOPE_LABEL = {
  READ_ONLY: 'Read Only',
  TRADE:     'Trade',
};

const SCOPE_COLORS = {
  READ_ONLY: { bg: 'rgba(15,15,15,0.05)', color: '#555' },
  TRADE:     { bg: 'rgba(15,15,15,0.88)', color: '#fff' },
};

function relativeTime(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return 'just now';
  if (hours < 1)  return `${mins}m ago`;
  if (days < 1)   return `${hours}h ago`;
  return `${days}d ago`;
}

function expiryLabel(expiresAt, revokedAt) {
  if (revokedAt) return { text: 'Revoked', urgent: true };
  if (!expiresAt) return { text: 'Never expires', urgent: false };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return { text: 'Expired', urgent: true };
  const days = Math.ceil(diff / 86400000);
  if (days <= 3) return { text: `Expires in ${days}d`, urgent: true };
  return { text: `Expires in ${days}d`, urgent: false };
}

export default function ApiKeyCard({ apiKey, onRevoked }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const isInactive = !!apiKey.revokedAt || (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date());
  const scopeStyle = SCOPE_COLORS[apiKey.scope] ?? SCOPE_COLORS.READ_ONLY;
  const expiry     = expiryLabel(apiKey.expiresAt, apiKey.revokedAt);

  const handleRevoke = async () => {
    setLoading(true);
    setError(null);
    const result = await revokeApiKey(apiKey.id);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setConfirming(false);
    } else {
      onRevoked?.(apiKey.id);
    }
  };

  return (
    <div
      style={{
        background: isInactive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(15,15,15,0.08)',
        borderRadius: '16px',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        opacity: isInactive ? 0.55 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Left: key info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F' }}>
            {apiKey.name}
          </span>
          {/* Scope pill */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: scopeStyle.bg,
              color: scopeStyle.color,
              border: apiKey.scope === 'TRADE' ? 'none' : '1px solid rgba(15,15,15,0.1)',
            }}
          >
            {SCOPE_LABEL[apiKey.scope]}
          </span>
          {/* Expiry badge */}
          <span
            style={{
              fontSize: '11px',
              color: expiry.urgent ? '#c0392b' : '#888',
              fontWeight: expiry.urgent ? 600 : 400,
            }}
          >
            {expiry.text}
          </span>
        </div>

        {/* Key ID (monospace, truncated) */}
        <span style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
          {apiKey.id}
        </span>

        {/* Last used */}
        <span style={{ fontSize: '11px', color: '#aaa' }}>
          {apiKey.lastUsedAt
            ? `Last used ${relativeTime(apiKey.lastUsedAt)}`
            : 'Never used'}
          {' · '}
          Created {new Date(apiKey.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        {error && (
          <span style={{ fontSize: '12px', color: '#c0392b' }}>{error}</span>
        )}
      </div>

      {/* Right: revoke button */}
      {!isInactive && (
        confirming ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#c0392b', fontWeight: 500 }}>Revoke this key?</span>
            <button
              onClick={handleRevoke}
              disabled={loading}
              style={{
                background: '#c0392b',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Revoking…' : 'Yes, revoke'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                background: 'transparent',
                color: '#666',
                border: '1px solid rgba(15,15,15,0.14)',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{
              background: 'transparent',
              color: '#c0392b',
              border: '1px solid rgba(192,57,43,0.25)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Revoke
          </button>
        )
      )}
    </div>
  );
}
