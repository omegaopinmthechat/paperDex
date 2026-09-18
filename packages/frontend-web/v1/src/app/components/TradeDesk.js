'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { requestQuote, submitTrade } from '../actions/trade';
import { fetchMarketBySymbol } from '../actions/markets';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ── Constants ────────────────────────────────────────────────────────────────

const TOKENS = [
  { symbol: 'BTCP', name: 'Paper Bitcoin', icon: '₿', color: '#F7931A', bg: 'rgba(247,147,26,0.12)' },
  { symbol: 'ETHP', name: 'Paper Ethereum', icon: 'Ξ', color: '#627EEA', bg: 'rgba(98,126,234,0.12)' },
  { symbol: 'SOLP', name: 'Paper Solana', icon: '◎', color: '#14F195', bg: 'rgba(20,241,149,0.12)' },
];

const STEP = {
  FORM: 'FORM',
  QUOTING: 'QUOTING',
  REVIEW: 'REVIEW',
  SIGNING: 'SIGNING',
  EXECUTING: 'EXECUTING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const fmtUsd = (v) =>
  parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPrice = (v) => {
  const n = parseFloat(v);
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function DeadlineCountdown({ deadline }) {
  const [remaining, setRemaining] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = parseInt(deadline) - Math.floor(Date.now() / 1000);
      if (diff <= 0) {
        setRemaining('Expired');
        setUrgent(false);
        return;
      }
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
      setUrgent(diff < 60);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const expired = remaining === 'Expired';

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
  const [token, setToken] = useState('BTCP');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');

  // Flow state
  const [step, setStep] = useState(STEP.FORM);
  const [quote, setQuote] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const amountRef = useRef(null);
  const selectedToken = TOKENS.find((t) => t.symbol === token);

  const [chartData, setChartData] = useState([]);
  const [marketStats, setMarketStats] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await fetchMarketBySymbol(token);
      if (active && res.success && res.data) {
        setMarketStats(res.data);
        const now = Date.now();
        const sparkline = res.data.sparkline7d || [];

        const formattedData = sparkline.map((price, i) => {
          const time = now - (sparkline.length - 1 - i) * 60 * 60 * 1000;
          return {
            time: new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
            price
          };
        });
        setChartData(formattedData);

        // Generate initial synthetic trades based on the fetched price
        const initialPrice = res.data.price;
        const initialTrades = [];
        let lastPrice = initialPrice;
        for (let i = 0; i < 15; i++) {
          const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const priceDiff = lastPrice * (Math.random() * 0.002);
          const tradePrice = type === 'BUY' ? lastPrice + priceDiff : lastPrice - priceDiff;
          const amount = (Math.random() * (token === 'BTCP' ? 0.5 : token === 'ETHP' ? 5 : 50)).toFixed(4);
          initialTrades.push({
            id: i,
            price: tradePrice,
            amount,
            time: new Date(now - i * (Math.random() * 5000 + 1000)).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type
          });
          lastPrice = tradePrice;
        }
        setActivity(initialTrades);
      }
    };
    load();
    return () => { active = false; };
  }, [token]);

  const currentPrice = marketStats?.price || 0;
  const changePercent = (marketStats?.change24h || 0).toFixed(2);
  const isPositive = changePercent >= 0;
  const highPrice = marketStats?.high24h || 0;
  const lowPrice = marketStats?.low24h || 0;

  useEffect(() => {
    if (!currentPrice) return;
    const interval = setInterval(() => {
      setActivity(prev => {
        if (prev.length === 0) return prev;
        const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const lastPriceStr = prev[0].price;
        const priceDiff = lastPriceStr * (Math.random() * 0.002);
        const tradePrice = type === 'BUY' ? lastPriceStr + priceDiff : lastPriceStr - priceDiff;
        const amount = (Math.random() * (token === 'BTCP' ? 0.5 : token === 'ETHP' ? 5 : 50)).toFixed(4);
        const newTrade = {
          id: Date.now(),
          price: tradePrice,
          amount,
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type
        };
        return [newTrade, ...prev].slice(0, 15);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [currentPrice, token]);

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
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
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
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: '6px',
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
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .td-fade { animation: tdFadeUp 0.3s ease-out both; }
        .td-token-btn:hover { opacity: 0.85; background: #F9FAFB !important; }
        .td-side-btn:hover  { opacity: 0.9; }
        .td-input:focus { outline: none; border-color: #10B981 !important; box-shadow: 0 0 0 1px #10B981; }
        .td-btn-primary {
          background: #10B981;
          color: white;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .td-btn-primary:hover:not(:disabled) { background: #059669; }
        .td-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{ display: 'flex', width: '100%', height: '100%', gap: '16px', alignItems: 'stretch' }}>

        {/* ── LEFT: Chart & Activity ─────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div style={{ ...card, flex: 1 }}>
            {/* Chart header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '24px', alignItems: 'center', background: '#F9FAFB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: selectedToken?.color, fontSize: '20px' }}>{selectedToken?.icon}</span>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>{selectedToken?.symbol} / USD</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Current Price</span>
                <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{fmtPrice(currentPrice)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>24h Change</span>
                <span style={{ fontSize: '13px', color: isPositive ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                  {isPositive ? '+' : ''}{changePercent}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>24h High</span>
                <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{fmtPrice(highPrice)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>24h Low</span>
                <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{fmtPrice(lowPrice)}</span>
              </div>
            </div>
            {/* Chart body */}
            <div style={{ flex: 1, background: '#FFFFFF', position: 'relative', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorPrice-${selectedToken?.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedToken?.color || '#10B981'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={selectedToken?.color || '#10B981'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [fmtPrice(value), 'Price']}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={selectedToken?.color || '#10B981'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#colorPrice-${selectedToken?.symbol})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...card, height: '200px' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E7EB', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', background: '#F9FAFB' }}>
              Market Activity
            </div>
            <div style={{ padding: '0 16px 16px 16px', overflowY: 'auto', fontSize: '13px', color: '#6B7280' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#FFFFFF' }}>
                  <tr>
                    <th style={{ padding: '8px 0', fontWeight: 500, color: '#9CA3AF' }}>Price</th>
                    <th style={{ padding: '8px 0', fontWeight: 500, color: '#9CA3AF' }}>Amount</th>
                    <th style={{ padding: '8px 0', fontWeight: 500, color: '#9CA3AF', textAlign: 'right' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.length === 0 ? (
                    <tr><td colSpan={3} style={{ paddingTop: '16px', textAlign: 'center' }}>No recent trades</td></tr>
                  ) : (
                    activity.map((trade) => (
                      <tr key={trade.id}>
                        <td style={{ padding: '4px 0', color: trade.type === 'BUY' ? '#10B981' : '#EF4444', fontFamily: 'monospace' }}>
                          {fmtPrice(trade.price)}
                        </td>
                        <td style={{ padding: '4px 0', fontFamily: 'monospace', color: '#374151' }}>
                          {trade.amount}
                        </td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontFamily: 'monospace', color: '#9CA3AF' }}>
                          {trade.time}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── MIDDLE: Order Entry ─────────────────────────────────────────── */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="td-fade" style={{ ...card, flex: 1 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>Place Order</span>
              <StatusBadge label="Paper" color="#059669" bg="#D1FAE5" />
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Token selector */}
              <div>
                <span style={labelStyle}>Market</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {TOKENS.map((t) => {
                    const active = t.symbol === token;
                    return (
                      <button
                        key={t.symbol}
                        className="td-token-btn"
                        disabled={step !== STEP.FORM && step !== STEP.ERROR}
                        onClick={() => { setToken(t.symbol); setError(''); }}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '4px',
                          border: active ? `1px solid ${t.color}` : '1px solid #E5E7EB',
                          background: active ? '#F9FAFB' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ fontSize: '16px', color: active ? t.color : '#9CA3AF' }}>{t.icon}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: active ? '#111827' : '#6B7280' }}>
                          {t.symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BUY / SELL */}
              <div>
                <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '4px', padding: '4px' }}>
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
                          padding: '8px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: active ? (isGreen ? '#10B981' : '#EF4444') : 'transparent',
                          color: active ? '#FFFFFF' : '#6B7280',
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ ...labelStyle, marginBottom: 0 }}>Size</span>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{selectedToken?.symbol}</span>
                </div>
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
                      padding: '10px 12px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      color: '#111827',
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                {/* Quick amounts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '8px' }}>
                  {['0.001', '0.01', '0.1', '1'].map((v) => (
                    <button
                      key={v}
                      disabled={step !== STEP.FORM && step !== STEP.ERROR}
                      onClick={() => { setAmount(v); setError(''); }}
                      style={{
                        padding: '4px 0',
                        borderRadius: '4px',
                        border: '1px solid #E5E7EB',
                        background: amount === v ? '#F3F4F6' : '#FFFFFF',
                        fontSize: '11px',
                        color: '#4B5563',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {error && step !== STEP.SUCCESS && (
                <div style={{ padding: '10px 12px', borderRadius: '4px', background: '#FEF2F2', border: '1px solid #FCA5A5', fontSize: '12px', color: '#DC2626' }}>
                  {error}
                </div>
              )}
              {/* Action buttons */}
              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                {step === STEP.FORM || step === STEP.ERROR ? (
                  <button className="td-btn-primary" onClick={handleGetQuote} style={{ width: '100%', padding: '12px', background: side === 'BUY' ? '#10B981' : '#EF4444' }}>
                    Get Quote
                  </button>
                ) : step === STEP.QUOTING ? (
                  <button className="td-btn-primary" disabled style={{ width: '100%', padding: '12px', gap: '8px' }}>
                    <Spinner size={14} color="#fff" /> Fetching…
                  </button>
                ) : step === STEP.REVIEW ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={reset} style={{ padding: '12px 16px', borderRadius: '4px', border: '1px solid #E5E7EB', background: '#FFFFFF', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button className="td-btn-primary" onClick={handleExecute} style={{ flex: 1, padding: '12px', background: side === 'BUY' ? '#10B981' : '#EF4444' }}>
                      Execute {side}
                    </button>
                  </div>
                ) : step === STEP.SIGNING ? (
                  <button className="td-btn-primary" disabled style={{ width: '100%', padding: '12px', gap: '8px', background: side === 'BUY' ? '#10B981' : '#EF4444' }}>
                    <Spinner size={14} color="#fff" /> Sign in Wallet…
                  </button>
                ) : step === STEP.EXECUTING ? (
                  <button className="td-btn-primary" disabled style={{ width: '100%', padding: '12px', gap: '8px' }}>
                    <Spinner size={14} color="#fff" /> Submitting…
                  </button>
                ) : step === STEP.SUCCESS ? (
                  <button className="td-btn-primary" onClick={reset} style={{ width: '100%', padding: '12px' }}>
                    New Trade
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Wallet Info Mini Panel */}
          <div style={{ padding: '10px 16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Wallet</span>
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#111827' }}>
              {walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* ── RIGHT: Execution / Review Panel ─────────────────────────────── */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="td-fade" style={{ ...card, flex: 1 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>Execution</span>
              {quote && (step === STEP.REVIEW || step === STEP.SIGNING || step === STEP.EXECUTING) && <DeadlineCountdown deadline={quote.deadline} />}
            </div>

            <div style={{ padding: '16px', overflowY: 'auto' }}>
              {/* Idle State */}
              {(step === STEP.FORM || step === STEP.ERROR) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', textAlign: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '24px' }}>⌘</div>
                  <div style={{ fontSize: '13px' }}>Awaiting Quote</div>
                </div>
              )}

              {/* Quote Review */}
              {(step === STEP.REVIEW || step === STEP.SIGNING || step === STEP.EXECUTING) && quote && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{quote.side === 'BUY' ? 'You Pay' : 'You Receive'} (Est.)</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>${fmtUsd(quote.usdAmount)}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      ['Amount', `${parseFloat(quote.amount).toFixed(6)} ${quote.token}`],
                      ['Price', fmtPrice(quote.price)],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#6B7280' }}>{label}</span>
                        <span style={{ fontFamily: 'monospace', color: '#111827', fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }} />

                  <div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Quote Nonce</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#6B7280', wordBreak: 'break-all' }}>{quote.nonce}</div>
                  </div>

                  {(step === STEP.SIGNING || step === STEP.EXECUTING) && (
                    <div style={{ padding: '10px', background: '#EFF6FF', borderRadius: '4px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Spinner size={14} color="#2563EB" />
                      <span style={{ fontSize: '12px', color: '#1E3A8A' }}>
                        {step === STEP.SIGNING ? 'Please sign in wallet...' : 'Executing on-chain...'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Success State */}
              {step === STEP.SUCCESS && result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>✓</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Order Filled</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#6B7280' }}>Status</span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>CONFIRMED</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#6B7280' }}>Block</span>
                      <span style={{ fontFamily: 'monospace', color: '#111827' }}>#{result.blockNumber}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Transaction</div>
                    <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', background: '#F3F4F6', borderRadius: '4px', border: '1px solid #E5E7EB', textDecoration: 'none' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#3B82F6', wordBreak: 'break-all' }}>{result.txHash}</div>
                      <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '6px' }}>View on Explorer ↗</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How it Works panel */}
          <div style={{ ...card, padding: '16px', background: '#F9FAFB' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px' }}>How It Works</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>
                <strong>1.</strong> Enter size and get a live oracle quote.
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>
                <strong>2.</strong> Sign the EIP-712 struct gas-free.
              </div>
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>
                <strong>3.</strong> Relayer settles trade on Sepolia.
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
