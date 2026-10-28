'use client';

import { useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ENDPOINTS = [
  {
    id: 'get-markets',
    method: 'GET',
    path: '/api/v2/markets',
    scope: 'READ_ONLY',
    desc: 'Retrieve live price data for all supported tokens (BTCP, ETHP, SOLP, USDTP).',
    curl: (base) =>
      `curl ${base}/api/v2/markets \\\n  -H "Authorization: pdx_id_<YOUR_ID>:<YOUR_SECRET>"`,
    response: JSON.stringify({
      success: true,
      data: [
        { symbol: 'BTCP', price: 98234.12, change24h: 2.41, volume24h: 41200000000 },
        { symbol: 'ETHP', price: 3841.55,  change24h: -0.87 },
      ],
    }, null, 2),
  },
  {
    id: 'get-market-symbol',
    method: 'GET',
    path: '/api/v2/markets/:symbol',
    scope: 'READ_ONLY',
    desc: 'Get price data for a single token. Replace :symbol with BTCP, ETHP, SOLP, or USDTP.',
    curl: (base) =>
      `curl ${base}/api/v2/markets/BTCP \\\n  -H "Authorization: pdx_id_<YOUR_ID>:<YOUR_SECRET>"`,
    response: JSON.stringify({
      success: true,
      data: { symbol: 'BTCP', price: 98234.12, change24h: 2.41 },
    }, null, 2),
  },
  {
    id: 'get-portfolio',
    method: 'GET',
    path: '/api/v2/portfolio',
    scope: 'READ_ONLY',
    desc: 'Get on-chain token balances and USD portfolio value for the key owner.',
    curl: (base) =>
      `curl ${base}/api/v2/portfolio \\\n  -H "Authorization: pdx_id_<YOUR_ID>:<YOUR_SECRET>"`,
    response: JSON.stringify({
      success: true,
      data: [
        { symbol: 'USDTP', balance: '10000.0', price: 1, usdValue: '10000.00' },
        { symbol: 'BTCP',  balance: '0.5',     price: 98234.12, usdValue: '49117.06' },
      ],
    }, null, 2),
  },
  {
    id: 'post-trade',
    method: 'POST',
    path: '/api/v2/trade',
    scope: 'TRADE',
    desc: 'Execute a buy or sell trade atomically. No MetaMask or signature step required — the server handles execution on your behalf.',
    curl: (base) =>
      `curl -X POST ${base}/api/v2/trade \\\n  -H "Authorization: pdx_id_<YOUR_ID>:<YOUR_SECRET>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"token":"BTCP","side":"BUY","amount":"0.1"}'`,
    requestBody: JSON.stringify({ token: 'BTCP', side: 'BUY', amount: '0.1' }, null, 2),
    response: JSON.stringify({
      success: true,
      data: {
        txHash: '0xabc123…',
        blockNumber: 7812345,
        token: 'BTCP',
        side: 'BUY',
        amount: '0.1',
        price: 98234.12,
        usdValue: '9823.41',
      },
    }, null, 2),
  },
];

const METHOD_COLORS = {
  GET:  { bg: 'rgba(15,15,15,0.05)', color: '#555' },
  POST: { bg: 'rgba(15,15,15,0.88)', color: '#fff' },
};

const SCOPE_COLORS = {
  READ_ONLY: { bg: 'rgba(15,15,15,0.04)', color: '#666', border: '1px solid rgba(15,15,15,0.1)' },
  TRADE:     { bg: 'rgba(15,15,15,0.04)', color: '#555', border: '1px solid rgba(15,15,15,0.1)' },
};

export default function ApiDocs() {
  const [open, setOpen] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const copyCode = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {ENDPOINTS.map((ep) => {
        const isOpen     = !!open[ep.id];
        const methodStyle = METHOD_COLORS[ep.method] ?? METHOD_COLORS.GET;
        const scopeStyle  = SCOPE_COLORS[ep.scope] ?? SCOPE_COLORS.READ_ONLY;
        const curlText   = ep.curl(BASE_URL);
        const isCopied   = copiedId === ep.id;

        return (
          <div
            key={ep.id}
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(15,15,15,0.08)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Header row — click to expand */}
            <button
              id={`api-doc-${ep.id}`}
              onClick={() => toggle(ep.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              {/* Method badge */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: methodStyle.bg,
                  color: methodStyle.color,
                  flexShrink: 0,
                  border: ep.method === 'GET' ? '1px solid rgba(15,15,15,0.1)' : 'none',
                }}
              >
                {ep.method}
              </span>

              {/* Path */}
              <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#0F0F0F', flex: 1, wordBreak: 'break-all' }}>
                {ep.path}
              </code>

              {/* Scope pill */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  flexShrink: 0,
                  ...scopeStyle,
                }}
              >
                {ep.scope === 'READ_ONLY' ? 'Read Only' : 'Trade'}
              </span>

              {/* Chevron */}
              <span style={{ color: '#aaa', fontSize: '12px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                ▾
              </span>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div
                style={{
                  borderTop: '1px solid rgba(15,15,15,0.06)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Description */}
                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, margin: 0 }}>
                  {ep.desc}
                </p>

                {/* Request body (if applicable) */}
                {ep.requestBody && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Request Body
                    </p>
                    <pre
                      style={{
                        margin: 0,
                        padding: '14px 16px',
                        background: 'rgba(15,15,15,0.04)',
                        border: '1px solid rgba(15,15,15,0.08)',
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#0F0F0F',
                        overflowX: 'auto',
                        lineHeight: 1.6,
                      }}
                    >
                      {ep.requestBody}
                    </pre>
                  </div>
                )}

                {/* cURL example */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', margin: 0 }}>
                      cURL Example
                    </p>
                    <button
                      onClick={() => copyCode(ep.id, curlText)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(15,15,15,0.14)',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: isCopied ? '#16a34a' : '#555',
                        fontFamily: 'inherit',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {isCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '14px 16px',
                      background: '#0F0F0F',
                      borderRadius: '10px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#E8E6E2',
                      overflowX: 'auto',
                      lineHeight: 1.7,
                    }}
                  >
                    {curlText}
                  </pre>
                </div>

                {/* Example response */}
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Example Response
                  </p>
                  <pre
                    style={{
                      margin: 0,
                      padding: '14px 16px',
                      background: 'rgba(15,15,15,0.03)',
                      border: '1px solid rgba(15,15,15,0.08)',
                      borderRadius: '10px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#444',
                      overflowX: 'auto',
                      lineHeight: 1.6,
                    }}
                  >
                    {ep.response}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
