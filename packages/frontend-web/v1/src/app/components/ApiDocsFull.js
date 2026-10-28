'use client';

import { useState } from 'react';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ENDPOINTS_DATA = [
  {
    id: 'get-markets',
    method: 'GET',
    path: '/api/v2/markets',
    category: 'Market Data',
    title: 'Get All Markets',
    scope: 'READ_ONLY',
    desc: 'Retrieve real-time market data for all supported tokens on PaperDEX, including spot prices, 24-hour price changes, and 24-hour trading volumes.',
    rateLimit: '300 req / 15 min',
    parameters: [],
    snippets: {
      curl: `curl -X GET "${BASE_URL}/api/v2/markets" \\
  -H "Authorization: pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>"`,
      python: `import requests

url = "${BASE_URL}/api/v2/markets"
headers = {
    "Authorization": "pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>"
}

response = requests.get(url, headers=headers)
print(response.json())`,
      javascript: `const res = await fetch('${BASE_URL}/api/v2/markets', {
  headers: {
    'Authorization': 'pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>'
  }
});
const data = await res.json();
console.log(data);`,
    },
    response: {
      success: true,
      data: [
        {
          symbol: "BTCP",
          name: "Bitcoin Paper",
          price: 98450.25,
          change24h: 3.12,
          volume24h: 42500000000,
          sparkline: [96200, 97100, 96800, 98450.25]
        },
        {
          symbol: "ETHP",
          name: "Ethereum Paper",
          price: 3890.10,
          change24h: -0.45,
          volume24h: 18200000000,
          sparkline: [3920, 3905, 3880, 3890.10]
        },
        {
          symbol: "SOLP",
          name: "Solana Paper",
          price: 215.80,
          change24h: 5.64,
          volume24h: 6800000000,
          sparkline: [204, 208, 212, 215.80]
        },
        {
          symbol: "USDTP",
          name: "Tether Paper USD",
          price: 1.0,
          change24h: 0.0,
          volume24h: 85000000000,
          sparkline: [1.0, 1.0, 1.0, 1.0]
        }
      ]
    }
  },
  {
    id: 'get-market-symbol',
    method: 'GET',
    path: '/api/v2/markets/:symbol',
    category: 'Market Data',
    title: 'Get Single Market',
    scope: 'READ_ONLY',
    desc: 'Retrieve current price, percentage change, and volume details for a specific trading asset.',
    rateLimit: '300 req / 15 min',
    parameters: [
      { name: 'symbol', type: 'string', in: 'path', required: true, desc: 'Token symbol (BTCP, ETHP, SOLP, USDTP)' }
    ],
    snippets: {
      curl: `curl -X GET "${BASE_URL}/api/v2/markets/BTCP" \\
  -H "Authorization: pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>"`,
      python: `import requests

url = "${BASE_URL}/api/v2/markets/BTCP"
headers = {
    "Authorization": "pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>"
}

response = requests.get(url, headers=headers)
print(response.json())`,
      javascript: `const res = await fetch('${BASE_URL}/api/v2/markets/BTCP', {
  headers: {
    'Authorization': 'pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>'
  }
});
const data = await res.json();
console.log(data);`,
    },
    response: {
      success: true,
      data: {
        symbol: "BTCP",
        name: "Bitcoin Paper",
        price: 98450.25,
        change24h: 3.12,
        volume24h: 42500000000,
        sparkline: [96200, 97100, 96800, 98450.25]
      }
    }
  },
  {
    id: 'get-portfolio',
    method: 'GET',
    path: '/api/v2/portfolio',
    category: 'Account & Portfolio',
    title: 'Get User Portfolio',
    scope: 'READ_ONLY',
    desc: 'Returns real-time on-chain token balances and computed USD valuations for the wallet associated with the API key.',
    rateLimit: '300 req / 15 min',
    parameters: [],
    snippets: {
      curl: `curl -X GET "${BASE_URL}/api/v2/portfolio" \\
  -H "Authorization: pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>"`,
      python: `import requests

url = "${BASE_URL}/api/v2/portfolio"
headers = {
    "Authorization": "pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>"
}

response = requests.get(url, headers=headers)
print(response.json())`,
      javascript: `const res = await fetch('${BASE_URL}/api/v2/portfolio', {
  headers: {
    'Authorization': 'pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>'
  }
});
const data = await res.json();
console.log(data);`,
    },
    response: {
      success: true,
      data: [
        {
          symbol: "USDTP",
          balance: "99727.43006",
          price: 1,
          change24h: 0,
          usdValue: "99727.43"
        },
        {
          symbol: "BTCP",
          balance: "0.50000",
          price: 98450.25,
          change24h: 3.12,
          usdValue: "49225.13"
        },
        {
          symbol: "ETHP",
          balance: "4.25000",
          price: 3890.10,
          change24h: -0.45,
          usdValue: "16532.93"
        },
        {
          symbol: "SOLP",
          balance: "25.00000",
          price: 215.80,
          change24h: 5.64,
          usdValue: "5395.00"
        }
      ]
    }
  },
  {
    id: 'post-trade',
    method: 'POST',
    path: '/api/v2/trade',
    category: 'Trading',
    title: 'Execute Spot Trade',
    scope: 'TRADE',
    desc: 'Executes an atomic spot market buy or sell order directly on the Sepolia blockchain. The server handles on-chain transaction submission with guaranteed price quotes. No MetaMask popups or client-side private keys required.',
    rateLimit: '100 req / 15 min',
    parameters: [
      { name: 'token', type: 'string', in: 'body', required: true, desc: 'Target asset symbol: "BTCP", "ETHP", or "SOLP"' },
      { name: 'side', type: 'string', in: 'body', required: true, desc: 'Order direction: "BUY" or "SELL"' },
      { name: 'amount', type: 'string', in: 'body', required: true, desc: 'Positive token amount string (e.g. "0.1")' }
    ],
    snippets: {
      curl: `curl -X POST "${BASE_URL}/api/v2/trade" \\
  -H "Authorization: pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>" \\
  -H "Content-Type: application/json" \\
  -d '{"token": "BTCP", "side": "BUY", "amount": "0.1"}'`,
      python: `import requests

url = "${BASE_URL}/api/v2/trade"
headers = {
    "Authorization": "pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>",
    "Content-Type": "application/json"
}
payload = {
    "token": "BTCP",
    "side": "BUY",
    "amount": "0.1"
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
      javascript: `const res = await fetch('${BASE_URL}/api/v2/trade', {
  method: 'POST',
  headers: {
    'Authorization': 'pdx_id_<YOUR_KEY_ID>:<YOUR_SECRET>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'BTCP',
    side: 'BUY',
    amount: '0.1'
  })
});
const data = await res.json();
console.log(data);`,
    },
    response: {
      success: true,
      data: {
        txHash: "0x7a83f9e421ba89...",
        blockNumber: 7824102,
        token: "BTCP",
        side: "BUY",
        amount: "0.100000000000000000",
        price: 98450.25,
        usdValue: "9845.03"
      }
    }
  }
];

export default function ApiDocsFull({ walletAddress }) {
  const [activeTab, setActiveTab] = useState({});
  const [copiedId, setCopiedId]   = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const categories = ['ALL', 'Market Data', 'Account & Portfolio', 'Trading'];

  const filteredEndpoints = filterCategory === 'ALL'
    ? ENDPOINTS_DATA
    : ENDPOINTS_DATA.filter((ep) => ep.category === filterCategory);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getLang = (id) => activeTab[id] || 'curl';
  const setLang = (id, lang) => setActiveTab((prev) => ({ ...prev, [id]: lang }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Overview Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Card 1: Base URL */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(15, 15, 15, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
            Base Endpoint URL
          </div>
          <div
            onClick={() => handleCopy('base-url', BASE_URL)}
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#0F0F0F',
              background: 'rgba(15, 15, 15, 0.04)',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{BASE_URL}</span>
            <span style={{ fontSize: '11px', color: '#666' }}>{copiedId === 'base-url' ? '✓ Copied' : 'Copy'}</span>
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.4 }}>
            All public programmatic endpoints are versioned under <code style={{ fontFamily: 'monospace' }}>/api/v2/*</code>.
          </p>
        </div>

        {/* Card 2: Authentication */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(15, 15, 15, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
            Header Authentication
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#0F0F0F',
              background: 'rgba(15, 15, 15, 0.04)',
              padding: '8px 12px',
              borderRadius: '8px',
            }}
          >
            Authorization: pdx_id_&lt;id&gt;:&lt;secret&gt;
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.4 }}>
            Pass your Key ID and Raw Secret joined by a colon. Validated via constant-time SHA-256 hash.
          </p>
        </div>

        {/* Card 3: Rate Limiting */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(15, 15, 15, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
            Rate Limits & Quotas
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F0F0F', background: 'rgba(15, 15, 15, 0.06)', padding: '4px 10px', borderRadius: '9999px' }}>
              Read: 300 / 15m
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F0F0F', background: 'rgba(15, 15, 15, 0.06)', padding: '4px 10px', borderRadius: '9999px' }}>
              Trade: 100 / 15m
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: 1.4 }}>
            Limits apply per API key. Returns HTTP 429 and <code style={{ fontFamily: 'monospace' }}>Retry-After</code> on breach.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(15, 15, 15, 0.08)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                background: filterCategory === cat ? '#0F0F0F' : 'transparent',
                color: filterCategory === cat ? '#FFFFFF' : '#666',
                border: 'none',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: filterCategory === cat ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div>
          <Link
            href="/api"
            style={{
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0F0F0F',
              background: 'rgba(15, 15, 15, 0.06)',
              padding: '6px 14px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Manage Your API Keys</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Endpoints Detailed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {filteredEndpoints.map((ep) => {
          const currentLang = getLang(ep.id);
          const snippetText = ep.snippets[currentLang] || ep.snippets.curl;
          const isCopied = copiedId === `${ep.id}-snippet`;

          return (
            <div
              key={ep.id}
              id={ep.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(15, 15, 15, 0.09)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Endpoint Header Bar */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgba(15, 15, 15, 0.06)',
                  background: 'rgba(248, 246, 241, 0.5)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* HTTP Method Badge */}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: ep.method === 'POST' ? '#0F0F0F' : '#E5E3DC',
                      color: ep.method === 'POST' ? '#FFFFFF' : '#1F1F1F',
                    }}
                  >
                    {ep.method}
                  </span>

                  {/* Path */}
                  <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 600, color: '#0F0F0F' }}>
                    {ep.path}
                  </span>

                  {/* Scope Badge */}
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      background: ep.scope === 'TRADE' ? 'rgba(192, 57, 43, 0.1)' : 'rgba(15, 15, 15, 0.05)',
                      color: ep.scope === 'TRADE' ? '#c0392b' : '#666',
                      border: ep.scope === 'TRADE' ? '1px solid rgba(192, 57, 43, 0.2)' : '1px solid rgba(15, 15, 15, 0.08)',
                    }}
                  >
                    {ep.scope}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#888' }}>
                  Rate Limit: <strong style={{ color: '#333' }}>{ep.rateLimit}</strong>
                </div>
              </div>

              {/* Endpoint Content Body: 2 Columns on desktop */}
              <div
                style={{
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {/* Left Column: Description & Parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F0F0F', margin: '0 0 6px 0' }}>
                      {ep.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: 1.5 }}>
                      {ep.desc}
                    </p>
                  </div>

                  {/* Request Parameters */}
                  {ep.parameters.length > 0 ? (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Parameters
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ep.parameters.map((param) => (
                          <div
                            key={param.name}
                            style={{
                              background: 'rgba(15, 15, 15, 0.02)',
                              border: '1px solid rgba(15, 15, 15, 0.06)',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '13px', color: '#0F0F0F' }}>
                                {param.name}
                              </span>
                              <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
                                {param.type} ({param.in})
                              </span>
                              {param.required && (
                                <span style={{ fontSize: '10px', color: '#c0392b', fontWeight: 600 }}>
                                  required
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: '#666' }}>
                              {param.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      No URL or body parameters required.
                    </div>
                  )}

                  {/* Response preview */}
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Response Example (200 OK)
                    </h4>
                    <pre
                      style={{
                        margin: 0,
                        padding: '14px',
                        borderRadius: '10px',
                        background: '#161616',
                        color: '#4ADE80',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        overflowX: 'auto',
                        lineHeight: 1.45,
                      }}
                    >
                      {JSON.stringify(ep.response, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Right Column: Code Snippets (Multi-Language) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Language Selector Header */}
                  <div
                    style={{
                      background: '#1C1C1C',
                      borderTopLeftRadius: '10px',
                      borderTopRightRadius: '10px',
                      padding: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[
                        { key: 'curl', label: 'cURL' },
                        { key: 'python', label: 'Python' },
                        { key: 'javascript', label: 'JavaScript' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setLang(ep.id, tab.key)}
                          style={{
                            background: currentLang === tab.key ? '#333333' : 'transparent',
                            color: currentLang === tab.key ? '#FFFFFF' : '#888888',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCopy(`${ep.id}-snippet`, snippetText)}
                      style={{
                        background: isCopied ? '#16A34A' : '#2B2B2B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      {isCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Code Editor Preview */}
                  <pre
                    style={{
                      margin: 0,
                      padding: '16px',
                      background: '#111111',
                      borderBottomLeftRadius: '10px',
                      borderBottomRightRadius: '10px',
                      color: '#ECECEC',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      overflowX: 'auto',
                      lineHeight: 1.5,
                      flex: 1,
                      minHeight: '220px',
                    }}
                  >
                    {snippetText}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Codes Reference Table */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(15, 15, 15, 0.09)',
          borderRadius: '20px',
          padding: '28px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F0F0F', margin: '0 0 6px 0' }}>
          Standard Error Codes
        </h3>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 20px 0' }}>
          When an API request fails, the response returns standard HTTP status codes along with a JSON error payload containing a specific machine-readable code.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(15, 15, 15, 0.1)', color: '#888', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px' }}>HTTP Status</th>
                <th style={{ padding: '8px 12px' }}>Error Code</th>
                <th style={{ padding: '8px 12px' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { status: '401 Unauthorized', code: 'API_KEY_INVALID', desc: 'Missing or malformed Authorization header. Expected format pdx_id_<id>:<secret>' },
                { status: '401 Unauthorized', code: 'API_KEY_NOT_FOUND', desc: 'The provided API key ID does not exist in the database.' },
                { status: '401 Unauthorized', code: 'API_KEY_EXPIRED', desc: 'The API key has passed its configured expiration date.' },
                { status: '401 Unauthorized', code: 'API_KEY_REVOKED', desc: 'The key owner manually revoked this API key.' },
                { status: '403 Forbidden', code: 'API_KEY_SCOPE_DENIED', desc: 'The endpoint requires TRADE scope, but the provided key only has READ_ONLY scope.' },
                { status: '429 Too Many Requests', code: 'RATE_LIMIT_EXCEEDED', desc: 'Exceeded the rate limit window (300 req/15m for read, 100 req/15m for trade).' },
                { status: '400 Bad Request', code: 'INSUFFICIENT_BALANCE', desc: 'User does not possess sufficient USDTP (for buy) or token (for sell).' },
                { status: '400 Bad Request', code: 'LIQUIDITY_UNAVAILABLE', desc: 'The PaperDEX vault does not currently hold enough inventory to fill the order.' },
              ].map((err, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(15, 15, 15, 0.05)' }}>
                  <td style={{ padding: '12px', color: '#0F0F0F', fontWeight: 600 }}>{err.status}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: '#c0392b', fontSize: '12px' }}>{err.code}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{err.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
