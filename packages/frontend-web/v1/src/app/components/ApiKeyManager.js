'use client';

import { useState } from 'react';
import ApiKeyCard from './ApiKeyCard';
import CreateKeyModal from './CreateKeyModal';

export default function ApiKeyManager({ initialKeys = [] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [showModal, setShowModal] = useState(false);

  // Active = not revoked and not expired
  const activeCount = keys.filter(
    (k) => !k.revokedAt && (!k.expiresAt || new Date(k.expiresAt) > new Date()),
  ).length;

  const isLimitReached = activeCount >= 3;

  const handleCreated = (newKeyData) => {
    // newKeyData has id, name, scope, expiresAt, createdAt, secret
    const newEntry = {
      id: newKeyData.id,
      name: newKeyData.name,
      scope: newKeyData.scope,
      expiresAt: newKeyData.expiresAt,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: newKeyData.createdAt || new Date().toISOString(),
    };
    setKeys((prev) => [newEntry, ...prev]);
  };

  const handleRevoked = (keyId) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, revokedAt: new Date().toISOString() } : k)),
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(15, 15, 15, 0.08)',
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#0F0F0F',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Active API Keys
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: isLimitReached ? 'rgba(192, 57, 43, 0.1)' : 'rgba(15, 15, 15, 0.06)',
                color: isLimitReached ? '#c0392b' : '#555',
                border: isLimitReached ? '1px solid rgba(192, 57, 43, 0.2)' : 'none',
              }}
            >
              {activeCount}/3 active
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '6px', marginBottom: 0 }}>
            Programmatic credentials for automated bots and external services.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowModal(true)}
            disabled={isLimitReached}
            title={isLimitReached ? 'Maximum of 3 active keys reached. Revoke an existing key first.' : 'Generate a new API key'}
            style={{
              background: isLimitReached ? 'rgba(15, 15, 15, 0.12)' : '#0F0F0F',
              color: isLimitReached ? '#888' : '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLimitReached ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'inherit',
            }}
          >
            <span>+</span>
            <span>New API Key</span>
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {keys.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px dashed rgba(15, 15, 15, 0.15)',
              borderRadius: '20px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🔑</div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F0F0F', marginBottom: '6px' }}>
              No API Keys Yet
            </h3>
            <p style={{ fontSize: '13px', color: '#777', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              Generate an API key with Read-Only or Trade permissions to connect algorithmic trading bots, automated scripts, or portfolio trackers.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: '#0F0F0F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Generate your first key
            </button>
          </div>
        ) : (
          keys.map((apiKey) => (
            <ApiKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onRevoked={handleRevoked}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CreateKeyModal
          onCreated={handleCreated}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
