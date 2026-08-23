'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchPortfolio } from '../actions/portfolio';

const TOKEN_META = {
  USDTP: { name: 'Paper USD',      color: '#26A17B', icon: '$',  bg: 'rgba(38,161,123,0.12)' },
  BTCP:  { name: 'Paper Bitcoin',  color: '#F7931A', icon: '₿',  bg: 'rgba(247,147,26,0.12)' },
  ETHP:  { name: 'Paper Ethereum', color: '#627EEA', icon: 'Ξ',  bg: 'rgba(98,126,234,0.12)' },
  SOLP:  { name: 'Paper Solana',   color: '#14F195', icon: '◎',  bg: 'rgba(20,241,149,0.12)' },
};

const fmt = (n, decimals = 2) =>
  parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const fmtBalance = (balance) => {
  const n = parseFloat(balance);
  if (n === 0) return '0.00';
  if (n >= 1000) return fmt(n, 2);
  if (n >= 1) return fmt(n, 4);
  return fmt(n, 6);
};

export default function PortfolioHoldings({ initialData }) {
  const [holdings, setHoldings] = useState(initialData);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetchPortfolio();
      if (res.success && res.data.length > 0) {
        setHoldings(res.data);
        setLastUpdated(new Date());
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const totalUsd = holdings.reduce((sum, h) => sum + (parseFloat(h.usdValue) || 0), 0);

  return (
    <div>
      {/* Total Portfolio Value */}
      <div className="animate-hero-2" style={{
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(15,15,15,0.08)',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>
            Total Portfolio Value
          </div>
          <div style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 300, letterSpacing: '-0.03em', color: '#0F0F0F', fontFamily: 'monospace' }}>
            ${fmt(totalUsd, 2)}
            <span style={{ fontSize: '14px', color: '#888', marginLeft: '8px', fontFamily: 'sans-serif', fontWeight: 400 }}>USDTP</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '11px', color: '#aaa' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={refreshing}
            style={{
              background: 'transparent',
              border: '1px solid rgba(15,15,15,0.14)',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              color: '#555',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {refreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Holdings Grid */}
      <div className="animate-hero-3" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {holdings.map((h) => {
          const meta = TOKEN_META[h.symbol] || { name: h.symbol, color: '#888', icon: '?', bg: 'rgba(15,15,15,0.08)' };
          const isPositive = (h.change24h || 0) >= 0;
          const pct = totalUsd > 0 ? ((parseFloat(h.usdValue) / totalUsd) * 100).toFixed(1) : '0.0';

          return (
            <div key={h.symbol} style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(15,15,15,0.08)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: meta.bg, color: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '17px',
                  }}>
                    {meta.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F0F0F' }}>{h.symbol}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{meta.name}</div>
                  </div>
                </div>
                <div style={{
                  fontSize: '11px', fontWeight: 600, fontFamily: 'monospace',
                  padding: '3px 8px', borderRadius: '9999px',
                  background: isPositive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                  color: isPositive ? '#16a34a' : '#dc2626',
                }}>
                  {isPositive ? '+' : ''}{(h.change24h || 0).toFixed(2)}%
                </div>
              </div>

              {/* Balance */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Balance</div>
                <div style={{ fontSize: '22px', fontWeight: 300, fontFamily: 'monospace', color: '#0F0F0F', letterSpacing: '-0.01em' }}>
                  {fmtBalance(h.balance)}
                  <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px', fontFamily: 'sans-serif' }}>{h.symbol}</span>
                </div>
              </div>

              {/* USD Value + price + allocation */}
              <div style={{ borderTop: '1px solid rgba(15,15,15,0.06)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <div>
                  <div style={{ color: '#999', marginBottom: '2px' }}>USD Value</div>
                  <div style={{ fontWeight: 600, color: '#0F0F0F', fontFamily: 'monospace' }}>${fmt(parseFloat(h.usdValue) || 0)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#999', marginBottom: '2px' }}>Price</div>
                  <div style={{ fontFamily: 'monospace', color: '#555' }}>${h.price >= 1000 ? fmt(h.price) : h.price?.toFixed(4) ?? '1.00'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#999', marginBottom: '2px' }}>Allocation</div>
                  <div style={{ fontFamily: 'monospace', color: '#555' }}>{pct}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Starter grant notice if USDTP balance is ~100k and others are 0 */}
      {(() => {
        const usdtp = holdings.find((h) => h.symbol === 'USDTP');
        const others = holdings.filter((h) => h.symbol !== 'USDTP');
        const allOthersZero = others.every((h) => parseFloat(h.balance) === 0);
        if (usdtp && parseFloat(usdtp.balance) >= 99999 && allOthersZero) {
          return (
            <div style={{
              background: 'rgba(38,161,123,0.06)',
              border: '1px solid rgba(38,161,123,0.2)',
              borderRadius: '16px',
              padding: '18px 24px',
              fontSize: '13px',
              color: '#1a7a5e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>✓</span>
              <span>Your <strong>100,000 USDTP</strong> starter balance has been granted. Head to the Trade desk to start simulating positions.</span>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
