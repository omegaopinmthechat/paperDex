'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { requestQuote, submitTrade } from '../actions/trade';

// ── Constants ────────────────────────────────────────────────────────────────

const TOKENS = [
  { symbol: 'BTCP', name: 'Paper Bitcoin',  icon: '₿', color: '#F7931A', bg: 'rgba(247,147,26,0.12)'  },
  { symbol: 'ETHP', name: 'Paper Ethereum', icon: 'Ξ', color: '#627EEA', bg: 'rgba(98,126,234,0.12)'  },
  { symbol: 'SOLP', name: 'Paper Solana',   icon: '◎', color: '#14F195', bg: 'rgba(20,241,149,0.12)'  },
];

const STEP = {
  FORM:     'FORM',
  QUOTING:  'QUOTING',
  REVIEW:   'REVIEW',
  SIGNING:  'SIGNING',
  EXECUTING:'EXECUTING',
  SUCCESS:  'SUCCESS',
  ERROR:    'ERROR',
};

const fmtUsd = (v) =>
  parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPrice = (v) => {
  const n = parseFloat(v);
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1)    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function DeadlineCountdown({ deadline }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = parseInt(deadline) - Math.floor(Date.now() / 1000);
      if (diff <= 0) { setRemaining('Expired'); return; }
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const expired = remaining === 'Expired';
  const urgent  = !expired && parseInt(deadline) - Math.floor(Date.now() / 1000) < 60;

  return (
    <span style={{
      fontFamily: 'monospace',
      fontSize: '13px',
      fontWeight: 600,
      color: expired ? '#dc2626' : urgent ? '#d97706' : '#16a34a',
      background: expired ? 'rgba(220,38,38,0.08)' : urgent ? 'rgba(217,119,6,0.08)' : 'rgba(22,163,74,0.08)',
      padding: '2px 8px',
      borderRadius: '6px',
    }}>
      {remaining || '—'}
    </span>
  );
}

function Spinner({ size = 16, color = '#0F0F0F' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid rgba(${color === '#fff' ? '255,255,255' : '15,15,15'},0.15)`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'tdSpin 0.65s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function StatusBadge({ label, color = '#16a34a', bg = 'rgba(22,163,74,0.1)' }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color, background: bg,
      padding: '3px 8px', borderRadius: '5px',
    }}>
      {label}
    </span>
  );
}

// ── TradeDesk ─────────────────────────────────────────────────────────────────

export default function TradeDesk({ walletAddress }) {
  // Form state
  const [token, setToken]   = useState('BTCP');
  const [side, setSide]     = useState('BUY');
  const [amount, setAmount] = useState('');

  // Flow state
  const [step, setStep]     = useState(STEP.FORM);
  const [quote, setQuote]   = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  const amountRef = useRef(null);
  const selectedToken = TOKENS.find((t) => t.symbol === token);

  // Reset to form
  const reset = useCallback(() => {
    setStep(STEP.FORM);
    setQuote(null);
    setResult(null);
    setError('');
  }, []);

  // ── Step 1: Get quote ──────────────────────────────────────────────────────
  const handleGetQuote = useCallback(async () => {
    const amt = amount.trim();
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) {
      setError('Enter a valid positive amount');
      amountRef.current?.focus();
      return;
    }
    setError('');
    setStep(STEP.QUOTING);
    const result = await requestQuote({ token, side, amount: amt });
    if (!result.ok) {
      setError(result.error || 'Failed to get quote');
      setStep(STEP.ERROR);
      return;
    }
    setQuote(result.data);
    console.log('[TradeDesk] quote data:', JSON.stringify(result.data, null, 2));
    setStep(STEP.REVIEW);
  }, [token, side, amount]);

  // ── Step 2: MetaMask sign + execute ───────────────────────────────────────
  const handleExecute = useCallback(async () => {
    if (!quote) return;
    setError('');
    setStep(STEP.SIGNING);

    let userSignature;
    try {
      if (!window.ethereum) throw new Error('MetaMask not detected — install it to sign trades');

      // Build the signTypedData_v4 payload exactly as the backend expects
      const typedData = {
        domain: quote.eip712Domain,
        types: {
          ...quote.eip712Types,
          EIP712Domain: [
            { name: 'name',              type: 'string'  },
            { name: 'version',           type: 'string'  },
            { name: 'chainId',           type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
        },
        primaryType: 'Trade',
        message: quote.eip712Message,
      };

      userSignature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [walletAddress, JSON.stringify(typedData)],
      });
    } catch (err) {
      // User rejected MetaMask prompt
      if (err.code === 4001) {
        setError('Signature rejected in MetaMask');
        setStep(STEP.REVIEW);
      } else {
        setError(err.message || 'MetaMask error');
        setStep(STEP.ERROR);
      }
      return;
    }

    setStep(STEP.EXECUTING);
    const res = await submitTrade({ quoteId: quote.quoteId, userSignature });
    if (!res.ok) {
      setError(res.error || 'Execution failed');
      setStep(STEP.ERROR);
      return;
    }
    setResult(res.data);
    setStep(STEP.SUCCESS);
  }, [quote, walletAddress]);

  // ── Shared card style ─────────────────────────────────────────────────────
  const card = {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(15,15,15,0.09)',
    borderRadius: '20px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.04)',
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '8px',
    display: 'block',
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes tdSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes tdFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .td-fade { animation: tdFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .td-token-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .td-side-btn:hover  { opacity: 0.85; }
        .td-input:focus { outline: none; border-color: #0F0F0F !important; box-shadow: 0 0 0 3px rgba(15,15,15,0.06); }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,360px)', gap: '24px', alignItems: 'start' }}>

        {/* ── LEFT: Trade Form ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Order Ticket */}
          <div className="td-fade" style={{ ...card, padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
                  Execution Desk
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.02em', color: '#0F0F0F' }}>
                  Place Order
                </h2>
              </div>
              <StatusBadge label="Paper Trading" />
            </div>

            {/* Token selector */}
            <div style={{ marginBottom: '24px' }}>
              <span style={labelStyle}>Select Token</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {TOKENS.map((t) => {
                  const active = t.symbol === token;
                  return (
                    <button
                      key={t.symbol}
                      className="td-token-btn"
                      disabled={step !== STEP.FORM && step !== STEP.ERROR}
                      onClick={() => { setToken(t.symbol); setError(''); }}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: active ? `1.5px solid ${t.color}` : '1.5px solid rgba(15,15,15,0.1)',
                        background: active ? t.bg : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ fontSize: '18px', color: active ? t.color : '#888' }}>{t.icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: active ? '#0F0F0F' : '#999', letterSpacing: '0.04em' }}>
                        {t.symbol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BUY / SELL */}
            <div style={{ marginBottom: '24px' }}>
              <span style={labelStyle}>Direction</span>
              <div style={{ display: 'flex', background: 'rgba(15,15,15,0.04)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
                {['BUY', 'SELL'].map((s) => {
                  const active = s === side;
                  const isGreen = s === 'BUY';
                  return (
                    <button
                      key={s}
                      className="td-side-btn"
                      disabled={step !== STEP.FORM && step !== STEP.ERROR}
                      onClick={() => { setSide(s); setError(''); }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '9px',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        transition: 'all 0.18s ease',
                        background: active
                          ? (isGreen ? '#16a34a' : '#dc2626')
                          : 'transparent',
                        color: active ? '#fff' : '#999',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '28px' }}>
              <span style={labelStyle}>Amount ({selectedToken?.symbol})</span>
              <div style={{ position: 'relative' }}>
                <input
                  ref={amountRef}
                  id="trade-amount"
                  className="td-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  disabled={step !== STEP.FORM && step !== STEP.ERROR}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGetQuote(); }}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    fontSize: '20px',
                    fontFamily: 'monospace',
                    fontWeight: 300,
                    color: '#0F0F0F',
                    background: 'rgba(255,255,255,0.8)',
                    border: '1.5px solid rgba(15,15,15,0.12)',
                    borderRadius: '12px',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: selectedToken?.color,
                  letterSpacing: '0.04em',
                }}>
                  {selectedToken?.symbol}
                </span>
              </div>
              {/* Quick amounts */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {['0.001', '0.01', '0.1', '1'].map((v) => (
                  <button
                    key={v}
                    disabled={step !== STEP.FORM && step !== STEP.ERROR}
                    onClick={() => { setAmount(v); setError(''); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(15,15,15,0.1)',
                      background: amount === v ? 'rgba(15,15,15,0.07)' : 'transparent',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#666',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      transition: 'all 0.12s',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && step !== STEP.SUCCESS && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.15)',
                fontSize: '13px',
                color: '#b91c1c',
                lineHeight: 1.5,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Action buttons */}
            {step === STEP.FORM || step === STEP.ERROR ? (
              <button
                id="btn-get-quote"
                className="gs-btn-primary"
                onClick={handleGetQuote}
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                Get Quote →
              </button>
            ) : step === STEP.QUOTING ? (
              <button className="gs-btn-primary" disabled style={{ width: '100%', padding: '14px', fontSize: '15px', gap: '10px' }}>
                <Spinner size={14} color="#fff" />
                Fetching Quote…
              </button>
            ) : step === STEP.REVIEW ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={reset}
                  style={{
                    flex: '0 0 auto',
                    padding: '14px 20px',
                    borderRadius: '9999px',
                    border: '1.5px solid rgba(15,15,15,0.15)',
                    background: 'transparent',
                    fontSize: '13px',
                    color: '#666',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  ← Edit
                </button>
                <button
                  id="btn-sign-execute"
                  className="gs-btn-primary"
                  onClick={handleExecute}
                  style={{ flex: 1, padding: '14px', fontSize: '15px' }}
                >
                  Sign &amp; Execute →
                </button>
              </div>
            ) : step === STEP.SIGNING ? (
              <button className="gs-btn-primary" disabled style={{ width: '100%', padding: '14px', fontSize: '15px', gap: '10px' }}>
                <Spinner size={14} color="#fff" />
                Sign in MetaMask…
              </button>
            ) : step === STEP.EXECUTING ? (
              <button className="gs-btn-primary" disabled style={{ width: '100%', padding: '14px', fontSize: '15px', gap: '10px' }}>
                <Spinner size={14} color="#fff" />
                Submitting on-chain…
              </button>
            ) : step === STEP.SUCCESS ? (
              <button
                id="btn-new-trade"
                className="gs-btn-primary"
                onClick={reset}
                style={{ width: '100%', padding: '14px', fontSize: '15px', background: '#16a34a' }}
              >
                New Trade ✓
              </button>
            ) : null}
          </div>

          {/* How it works */}
          <div className="td-fade" style={{ ...card, padding: '24px 28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>
              How It Works
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['01', 'Get Quote', 'Backend fetches live oracle price and creates an EIP-712 signed quote.'],
                ['02', 'Sign in MetaMask', 'You sign the trade struct with MetaMask — no ETH gas required.'],
                ['03', 'Relay &amp; Settle', 'Our relayer submits both signatures to PaperDEX on Sepolia for you.'],
              ].map(([num, title, desc]) => (
                <div key={num} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'rgba(15,15,15,0.05)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, color: '#888', flexShrink: 0,
                  }}>{num}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F0F0F', marginBottom: '2px' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: desc }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Quote Review / Result ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Quote panel */}
          {(step === STEP.REVIEW || step === STEP.SIGNING || step === STEP.EXECUTING) && quote && (
            <div className="td-fade" style={{ ...card, padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888' }}>
                  Quote Preview
                </p>
                <DeadlineCountdown deadline={quote.deadline} />
              </div>

              {/* Token + direction header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '14px', background: 'rgba(15,15,15,0.03)', borderRadius: '12px' }}>
                <span style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: selectedToken?.bg,
                  color: selectedToken?.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 700, flexShrink: 0,
                }}>
                  {selectedToken?.icon}
                </span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F0F0F', letterSpacing: '-0.01em' }}>
                    {quote.side === 'BUY' ? 'Buy' : 'Sell'} {quote.token}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{selectedToken?.name}</div>
                </div>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px', fontWeight: 700,
                  color: quote.side === 'BUY' ? '#16a34a' : '#dc2626',
                  background: quote.side === 'BUY' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                  padding: '4px 10px', borderRadius: '6px',
                }}>
                  {quote.side}
                </span>
              </div>

              {/* Quote details */}
              {[
                ['Amount',    `${parseFloat(quote.amount).toFixed(6)} ${quote.token}`],
                ['Price',     fmtPrice(quote.price)],
                ['Total USD', `$${fmtUsd(quote.usdAmount)}`],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0', borderBottom: '1px solid rgba(15,15,15,0.06)',
                }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', color: '#0F0F0F' }}>{value}</span>
                </div>
              ))}

              {/* Nonce */}
              <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(15,15,15,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                  Quote Nonce
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666', wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {quote.nonce}
                </div>
              </div>

              {(step === STEP.SIGNING || step === STEP.EXECUTING) && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: 'rgba(15,15,15,0.03)', borderRadius: '10px' }}>
                  <Spinner size={14} />
                  <span style={{ fontSize: '13px', color: '#555' }}>
                    {step === STEP.SIGNING ? 'Waiting for MetaMask signature…' : 'Broadcasting to Sepolia…'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Success result */}
          {step === STEP.SUCCESS && result && (
            <div className="td-fade" style={{ ...card, padding: '28px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'rgba(22,163,74,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '22px',
                }}>
                  ✓
                </div>
                <div style={{ fontSize: '17px', fontWeight: 600, color: '#0F0F0F', marginBottom: '4px' }}>Trade Confirmed</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Your paper trade was settled on Sepolia</div>
              </div>

              {[
                ['Block', `#${result.blockNumber}`],
                ['Status', 'CONFIRMED'],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid rgba(15,15,15,0.06)',
                }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: value === 'CONFIRMED' ? '#16a34a' : '#0F0F0F' }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Tx Hash
                </div>
                <a
                  id="tx-hash-link"
                  href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#627EEA',
                    wordBreak: 'break-all',
                    lineHeight: 1.5,
                    textDecoration: 'none',
                    padding: '10px 12px',
                    background: 'rgba(98,126,234,0.06)',
                    borderRadius: '8px',
                    border: '1px solid rgba(98,126,234,0.15)',
                    transition: 'all 0.15s',
                  }}
                >
                  {result.txHash}
                  <span style={{ display: 'block', fontSize: '10px', color: '#627EEA', marginTop: '4px', fontFamily: 'sans-serif', fontWeight: 600 }}>
                    View on Etherscan ↗
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* Idle state panel */}
          {(step === STEP.FORM || step === STEP.ERROR) && (
            <div className="td-fade" style={{
              ...card,
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '8px',
              minHeight: '200px',
              justifyContent: 'center',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.35 }}>◈</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>Quote will appear here</div>
              <div style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6, maxWidth: '220px' }}>
                Fill in the order form and click <strong>Get Quote</strong> to see live oracle pricing.
              </div>
            </div>
          )}

          {/* Wallet info */}
          <div style={{
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(15,15,15,0.07)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} className="animate-live-dot" />
            <div>
              <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Signing As
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#444', fontWeight: 500 }}>
                {walletAddress ? `${walletAddress.slice(0, 10)}…${walletAddress.slice(-8)}` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
