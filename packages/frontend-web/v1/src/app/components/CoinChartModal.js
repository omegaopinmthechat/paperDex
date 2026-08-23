'use client';

import { useState, useMemo } from 'react';

const formatUSD = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '—';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)} T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)} B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)} M`;
  if (num >= 1000) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (num >= 1) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
};

const formatPercent = (val) => {
  if (typeof val !== 'number' || isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
};

export default function CoinChartModal({ coin, onClose }) {
  const [timeframe, setTimeframe] = useState('7D'); // '24H' | '7D'
  const [hoverIndex, setHoverIndex] = useState(null);
  const [copied, setCopied] = useState(false);

  // Compute points based on timeframe
  const points = useMemo(() => {
    const raw = Array.isArray(coin?.sparkline7d) ? coin.sparkline7d : [];
    if (raw.length === 0) return [coin?.price || 1, coin?.price || 1];
    if (timeframe === '24H') {
      return raw.slice(-24);
    }
    return raw;
  }, [coin, timeframe]);

  const minPrice = useMemo(() => Math.min(...points), [points]);
  const maxPrice = useMemo(() => Math.max(...points), [points]);
  const priceRange = maxPrice - minPrice || 1;

  // Active hover point or latest
  const activePrice = hoverIndex !== null && points[hoverIndex] !== undefined
    ? points[hoverIndex]
    : coin?.price;

  const isPositive = (coin?.change7d || coin?.change24h || 0) >= 0;
  const strokeColor = isPositive ? '#16a34a' : '#dc2626';

  // SVG dimensions for modal chart
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingY = 16;
  const chartHeight = svgHeight - paddingY * 2;

  const svgCoordinates = useMemo(() => {
    return points.map((val, idx) => {
      const x = (idx / (points.length - 1 || 1)) * svgWidth;
      const normalizedY = (val - minPrice) / priceRange;
      const y = svgHeight - paddingY - normalizedY * chartHeight;
      return { x, y, val };
    });
  }, [points, minPrice, priceRange, svgWidth, svgHeight, paddingY, chartHeight]);

  // Construct smooth bezier curve path
  const { pathD, areaD } = useMemo(() => {
    if (svgCoordinates.length < 2) return { pathD: '', areaD: '' };
    let p = `M ${svgCoordinates[0].x.toFixed(2)} ${svgCoordinates[0].y.toFixed(2)}`;
    for (let i = 1; i < svgCoordinates.length; i++) {
      const prev = svgCoordinates[i - 1];
      const curr = svgCoordinates[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      p += ` C ${cpX1.toFixed(2)} ${cpY1.toFixed(2)}, ${cpX2.toFixed(2)} ${cpY2.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    }
    const a = `${p} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
    return { pathD: p, areaD: a };
  }, [svgCoordinates, svgWidth, svgHeight]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const copyAddress = (addr) => {
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!coin) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 15, 15, 0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid rgba(15, 15, 15, 0.1)',
          maxWidth: '680px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {coin.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coin.image}
                alt={coin.symbol}
                style={{ width: '44px', height: '44px', borderRadius: '50%' }}
              />
            ) : (
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(15,15,15,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>
                {coin.symbol.slice(0, 1)}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F0F0F' }}>
                  {coin.details?.name || coin.symbol}
                </h2>
                <span style={{ fontSize: '12px', color: '#666', background: 'rgba(15,15,15,0.06)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  {coin.symbol}
                </span>
                {coin.rank && (
                  <span style={{ fontSize: '11px', color: '#888', background: '#F8F6F1', padding: '2px 6px', borderRadius: '4px' }}>
                    Rank #{coin.rank}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: '#888' }}>
                {coin.details?.underlying || 'Synthetic Token'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(15,15,15,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#666',
            }}
          >
            ✕
          </button>
        </div>

        {/* Live Price & Timeframe Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {hoverIndex !== null ? 'Valuation at point' : 'Current Spot Valuation'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '-0.03em', color: '#0F0F0F' }}>
                {formatUSD(activePrice)}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  background: (coin.change24h || 0) >= 0 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                  color: (coin.change24h || 0) >= 0 ? '#16a34a' : '#dc2626',
                }}>
                  {formatPercent(coin.change24h)} (24h)
                </span>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  background: (coin.change7d || 0) >= 0 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                  color: (coin.change7d || 0) >= 0 ? '#16a34a' : '#dc2626',
                }}>
                  {formatPercent(coin.change7d)} (7d)
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe Buttons */}
          <div style={{ display: 'flex', background: '#F8F6F1', padding: '3px', borderRadius: '9999px', border: '1px solid rgba(15,15,15,0.08)' }}>
            {[
              { id: '24H', label: '24H' },
              { id: '7D', label: '7D' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                style={{
                  border: 'none',
                  background: timeframe === tf.id ? '#0F0F0F' : 'transparent',
                  color: timeframe === tf.id ? '#fff' : '#666',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Chart Container */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            background: '#FAF9F6',
            border: '1px solid rgba(15,15,15,0.08)',
            borderRadius: '16px',
            padding: '16px 20px 20px',
            marginBottom: '24px',
            position: 'relative',
            cursor: 'crosshair',
          }}
        >
          {/* Y-Axis Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', fontFamily: 'monospace', marginBottom: '8px' }}>
            <span>High: {formatUSD(maxPrice)}</span>
            <span>Low: {formatUSD(minPrice)}</span>
          </div>

          {/* SVG Chart */}
          <div style={{ width: '100%', height: `${svgHeight}px`, position: 'relative' }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="modal-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              {areaD && <path d={areaD} fill="url(#modal-grad)" />}

              {/* Stroke Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Hover Line and Point */}
              {hoverIndex !== null && svgCoordinates[hoverIndex] && (
                <>
                  <line
                    x1={svgCoordinates[hoverIndex].x}
                    y1={0}
                    x2={svgCoordinates[hoverIndex].x}
                    y2={svgHeight}
                    stroke="#0F0F0F"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity="0.4"
                  />
                  <circle
                    cx={svgCoordinates[hoverIndex].x}
                    cy={svgCoordinates[hoverIndex].y}
                    r="5"
                    fill={strokeColor}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaa', marginTop: '6px' }}>
            <span>{timeframe === '24H' ? '24 Hours Ago' : '7 Days Ago'}</span>
            <span>Now (Live Oracle)</span>
          </div>
        </div>

        {/* 24h High / Low Bar */}
        <div style={{ background: '#F8F6F1', border: '1px solid rgba(15,15,15,0.06)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#777', marginBottom: '6px' }}>
            <span>24h Low: <strong style={{ color: '#0F0F0F', fontFamily: 'monospace' }}>{formatUSD(coin.low24h)}</strong></span>
            <span>24h Range</span>
            <span>24h High: <strong style={{ color: '#0F0F0F', fontFamily: 'monospace' }}>{formatUSD(coin.high24h)}</strong></span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(15,15,15,0.08)', borderRadius: '9999px', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '0%',
                width: `${Math.min(100, Math.max(5, ((coin.price - (coin.low24h || coin.price * 0.98)) / ((coin.high24h || coin.price * 1.02) - (coin.low24h || coin.price * 0.98) || 1)) * 100))}%`,
                height: '100%',
                background: strokeColor,
                borderRadius: '9999px',
              }}
            />
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px', marginBottom: '24px' }}>
          <div style={{ padding: '12px', background: 'rgba(15,15,15,0.02)', borderRadius: '12px', border: '1px solid rgba(15,15,15,0.04)' }}>
            <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Market Cap</span>
            <span style={{ fontWeight: 600, color: '#0F0F0F', fontFamily: 'monospace' }}>{formatUSD(coin.marketCap)}</span>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15,15,15,0.02)', borderRadius: '12px', border: '1px solid rgba(15,15,15,0.04)' }}>
            <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>24h Trading Volume</span>
            <span style={{ fontWeight: 600, color: '#0F0F0F', fontFamily: 'monospace' }}>{formatUSD(coin.totalVolume)}</span>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15,15,15,0.02)', borderRadius: '12px', border: '1px solid rgba(15,15,15,0.04)' }}>
            <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>All-Time High (ATH)</span>
            <span style={{ fontWeight: 600, color: '#0F0F0F', fontFamily: 'monospace' }}>{formatUSD(coin.ath)}</span>
          </div>
          <div style={{ padding: '12px', background: 'rgba(15,15,15,0.02)', borderRadius: '12px', border: '1px solid rgba(15,15,15,0.04)' }}>
            <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Circulating Supply</span>
            <span style={{ fontWeight: 600, color: '#0F0F0F', fontFamily: 'monospace' }}>
              {coin.circulatingSupply ? `${coin.circulatingSupply.toLocaleString()} ${coin.symbol}` : '—'}
            </span>
          </div>
        </div>

        {/* Sepolia Smart Contract Address */}
        {coin.details?.contractAddress && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F6F1', padding: '10px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#888' }}>Contract:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F0F0F' }}>
                {coin.details.contractAddress.slice(0, 10)}...{coin.details.contractAddress.slice(-8)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => copyAddress(coin.details.contractAddress)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? '#16a34a' : '#0F0F0F',
                  fontWeight: 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <a
                href={`https://sepolia.etherscan.io/address/${coin.details.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#666', textDecoration: 'none', fontSize: '11px' }}
              >
                Explorer ↗
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: '#0F0F0F',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
