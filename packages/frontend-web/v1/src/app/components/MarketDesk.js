'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchMarkets } from '../actions/markets';

const ASSET_DETAILS = {
  BTCP: {
    name: 'Paper Bitcoin',
    underlying: 'Bitcoin (BTC)',
    symbol: 'BTCP',
    color: '#F7931A',
    contractAddress: '0x7121E40EF99A3Ad5128b30F899192DEeBeC59FD6',
    decimals: 18,
    type: 'Synthetic Layer 1',
    description: 'Tracks real-world Bitcoin (BTC/USD) spot price using the PaperDEX Oracle for simulated institutional execution on Sepolia.',
  },
  ETHP: {
    name: 'Paper Ethereum',
    underlying: 'Ethereum (ETH)',
    symbol: 'ETHP',
    color: '#627EEA',
    contractAddress: '0x0bcC57314f1fFaedA980Dc93B1C09ddBA26ED10C',
    decimals: 18,
    type: 'Synthetic Layer 1',
    description: 'Tracks real-world Ethereum (ETH/USD) spot price using the PaperDEX Oracle for zero-risk settlement on Sepolia.',
  },
  SOLP: {
    name: 'Paper Solana',
    underlying: 'Solana (SOL)',
    symbol: 'SOLP',
    color: '#14F195',
    contractAddress: '0xD727C3011eB1b23aF613767769adb003ee7cDb50',
    decimals: 18,
    type: 'Synthetic Layer 1',
    description: 'Tracks real-world Solana (SOL/USD) spot price directly fed to the PaperDEX matching engine.',
  },
  USDTP: {
    name: 'Paper USD',
    underlying: 'US Dollar (USD)',
    symbol: 'USDTP',
    color: '#26A17B',
    contractAddress: '0x6125A28B8A2121C9e431c63e53bE0b34F455D026',
    decimals: 18,
    type: 'Synthetic Settlement Stablecoin',
    description: 'Base quote token for PaperDEX pairs. Hardcoded 1:1 dollar peg for deterministic margin and quote settlement.',
  },
};

const formatPrice = (price) => {
  if (typeof price !== 'number') return '—';
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
};

const formatChange = (change) => {
  if (typeof change !== 'number') return '0.00%';
  const prefix = change > 0 ? '+' : '';
  return `${prefix}${change.toFixed(2)}%`;
};

export default function MarketDesk({ initialMarkets = [] }) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [copiedSymbol, setCopiedSymbol] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'MAJORS' | 'STABLE'

  const refreshMarkets = useCallback(async () => {
    try {
      const res = await fetchMarkets();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setMarkets(res.data);
      }
    } catch (err) {
      console.error('Failed to reload markets:', err);
    }
  }, []);

  // Silent background polling every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMarkets();
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshMarkets]);

  const copyToClipboard = (text, symbol) => {
    navigator.clipboard.writeText(text);
    setCopiedSymbol(symbol);
    setTimeout(() => setCopiedSymbol(null), 2000);
  };

  // Get specific market data
  const btcpData = markets.find((m) => m.symbol === 'BTCP');
  const ethpData = markets.find((m) => m.symbol === 'ETHP');

  // Filtered list
  const filteredMarkets = markets.filter((m) => {
    const details = ASSET_DETAILS[m.symbol] || {};
    const matchesSearch =
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (details.name && details.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (details.underlying && details.underlying.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'MAJORS') return m.symbol !== 'USDTP';
    if (filterType === 'STABLE') return m.symbol === 'USDTP';
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Header Banner */}
      <div className="animate-hero-1" style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>
              PaperDEX Oracle Feed · Real Market Spot
            </span>
            <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px' }}>
              ● ORACLE ACTIVE
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.15 }}>
            Live Market Desk.
          </h1>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '6px', maxWidth: '600px' }}>
            Real-time cryptocurrency valuation delivered via the PaperDEX Oracle. Synthetic tokens on Sepolia execute against authentic spot pricing.
          </p>
        </div>

        {/* Live Oracle Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(15,15,15,0.08)', padding: '6px 14px', borderRadius: '9999px', backdropFilter: 'blur(6px)', fontSize: '12px', color: '#444' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} className="animate-live-dot" />
          <span>Spot Pricing: <strong style={{ color: '#0F0F0F' }}>Live Feed</strong></span>
        </div>
      </div>

      {/* Featured Real Value Cards: BTCP and ETHP */}
      <div className="animate-hero-2" style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#444' }}>
            Featured Synthetic Majors (Real Spot Values)
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          
          {/* BTCP Card */}
          <div
            onClick={() => setSelectedAsset(btcpData ? { ...btcpData, details: ASSET_DETAILS.BTCP } : null)}
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(15, 15, 15, 0.09)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = 'rgba(247, 147, 26, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = 'rgba(15, 15, 15, 0.09)';
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(247, 147, 26, 0.12)',
                  color: '#F7931A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '18px',
                }}>
                  ₿
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 600, color: '#0F0F0F' }}>BTCP</span>
                    <span style={{ fontSize: '11px', color: '#777', background: 'rgba(15,15,15,0.05)', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                      Synthetic BTC
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#888' }}>Real Bitcoin Spot Rate</span>
                </div>
              </div>

              {/* 24h change pill */}
              {btcpData && (
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  background: (btcpData.change24h || 0) >= 0 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                  color: (btcpData.change24h || 0) >= 0 ? '#16a34a' : '#dc2626',
                }}>
                  {formatChange(btcpData.change24h)}
                </div>
              )}
            </div>

            {/* Price display */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Current Oracle Valuation
              </div>
              <div style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', color: '#0F0F0F', fontFamily: 'monospace' }}>
                ${btcpData ? formatPrice(btcpData.price) : 'Loading...'}
                <span style={{ fontSize: '14px', color: '#888', marginLeft: '6px', fontWeight: 400, fontFamily: 'var(--font-sans), sans-serif' }}>USDTP</span>
              </div>
            </div>

            {/* Conversion & Contract info */}
            <div style={{ borderTop: '1px solid rgba(15,15,15,0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: '#666' }}>
                1 BTCP ≈ <strong style={{ color: '#0F0F0F' }}>{btcpData ? `$${formatPrice(btcpData.price)}` : '...'}</strong> USD
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(ASSET_DETAILS.BTCP.contractAddress, 'BTCP');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedSymbol === 'BTCP' ? '#16a34a' : '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copiedSymbol === 'BTCP' ? '✓ Copied Address' : 'Copy Sepolia Contract'}
              </button>
            </div>
          </div>

          {/* ETHP Card */}
          <div
            onClick={() => setSelectedAsset(ethpData ? { ...ethpData, details: ASSET_DETAILS.ETHP } : null)}
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(15, 15, 15, 0.09)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = 'rgba(98, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = 'rgba(15, 15, 15, 0.09)';
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(98, 126, 234, 0.12)',
                  color: '#627EEA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '18px',
                }}>
                  Ξ
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 600, color: '#0F0F0F' }}>ETHP</span>
                    <span style={{ fontSize: '11px', color: '#777', background: 'rgba(15,15,15,0.05)', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                      Synthetic ETH
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#888' }}>Real Ethereum Spot Rate</span>
                </div>
              </div>

              {/* 24h change pill */}
              {ethpData && (
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  background: (ethpData.change24h || 0) >= 0 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                  color: (ethpData.change24h || 0) >= 0 ? '#16a34a' : '#dc2626',
                }}>
                  {formatChange(ethpData.change24h)}
                </div>
              )}
            </div>

            {/* Price display */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Current Oracle Valuation
              </div>
              <div style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', color: '#0F0F0F', fontFamily: 'monospace' }}>
                ${ethpData ? formatPrice(ethpData.price) : 'Loading...'}
                <span style={{ fontSize: '14px', color: '#888', marginLeft: '6px', fontWeight: 400, fontFamily: 'var(--font-sans), sans-serif' }}>USDTP</span>
              </div>
            </div>

            {/* Conversion & Contract info */}
            <div style={{ borderTop: '1px solid rgba(15,15,15,0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: '#666' }}>
                1 ETHP ≈ <strong style={{ color: '#0F0F0F' }}>{ethpData ? `$${formatPrice(ethpData.price)}` : '...'}</strong> USD
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(ASSET_DETAILS.ETHP.contractAddress, 'ETHP');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedSymbol === 'ETHP' ? '#16a34a' : '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copiedSymbol === 'ETHP' ? '✓ Copied Address' : 'Copy Sepolia Contract'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Markets Table Section */}
      <div className="animate-hero-3" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(15, 15, 15, 0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
        
        {/* Table Controls (Search & Filter) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#0F0F0F', letterSpacing: '-0.01em', marginBottom: '4px' }}>
              All Supported Paper Assets
            </h3>
            <p style={{ fontSize: '13px', color: '#777' }}>
              Direct settlement tokens deployed on Sepolia Testnet.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', background: 'rgba(15,15,15,0.05)', padding: '3px', borderRadius: '9999px' }}>
              {[
                { id: 'ALL', label: 'All Assets' },
                { id: 'MAJORS', label: 'Synthetic Pairs' },
                { id: 'STABLE', label: 'Stablecoin' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  style={{
                    border: 'none',
                    background: filterType === tab.id ? '#0F0F0F' : 'transparent',
                    color: filterType === tab.id ? '#fff' : '#666',
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token / symbol..."
                style={{
                  background: '#F8F6F1',
                  border: '1px solid rgba(15,15,15,0.12)',
                  borderRadius: '9999px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  color: '#0F0F0F',
                  outline: 'none',
                  width: '200px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(15,15,15,0.08)', color: '#888', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Asset</th>
                <th style={{ padding: '12px 16px' }}>Underlying</th>
                <th style={{ padding: '12px 16px' }}>Real-World Price</th>
                <th style={{ padding: '12px 16px' }}>24h Change</th>
                <th style={{ padding: '12px 16px' }}>Oracle Status</th>
                <th style={{ padding: '12px 16px' }}>Sepolia Contract</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#999' }}>
                    No market assets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((m) => {
                  const details = ASSET_DETAILS[m.symbol] || {};
                  const isPositive = (m.change24h || 0) >= 0;

                  return (
                    <tr
                      key={m.symbol}
                      onClick={() => setSelectedAsset({ ...m, details })}
                      style={{
                        borderBottom: '1px solid rgba(15,15,15,0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,15,15,0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Asset Symbol & Name */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: details.color ? `${details.color}22` : 'rgba(15,15,15,0.08)',
                            color: details.color || '#0F0F0F',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '12px',
                          }}>
                            {m.symbol.slice(0, 1)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F0F0F' }}>{m.symbol}</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>{details.name || m.symbol}</div>
                          </div>
                        </div>
                      </td>

                      {/* Underlying Asset */}
                      <td style={{ padding: '16px', color: '#555' }}>
                        {details.underlying || 'USD Peg'}
                      </td>

                      {/* Price */}
                      <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 600, fontSize: '14px', color: '#0F0F0F' }}>
                        ${formatPrice(m.price)} <span style={{ fontSize: '11px', color: '#888', fontWeight: 400 }}>USDTP</span>
                      </td>

                      {/* 24h Change */}
                      <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 500, color: isPositive ? '#16a34a' : '#dc2626' }}>
                        {formatChange(m.change24h)}
                      </td>

                      {/* Oracle Status */}
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: m.stale ? '#d97706' : '#16a34a',
                          background: m.stale ? 'rgba(217, 119, 6, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: m.stale ? '#d97706' : '#16a34a' }} />
                          {m.stale ? 'Stale' : 'Live Oracle'}
                        </span>
                      </td>

                      {/* Contract Address */}
                      <td style={{ padding: '16px' }}>
                        {details.contractAddress ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(details.contractAddress, m.symbol);
                            }}
                            title="Click to copy Sepolia contract address"
                            style={{
                              background: 'rgba(15,15,15,0.04)',
                              border: '1px solid rgba(15,15,15,0.08)',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: copiedSymbol === m.symbol ? '#16a34a' : '#444',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>{details.contractAddress.slice(0, 6)}...{details.contractAddress.slice(-4)}</span>
                            <span style={{ fontSize: '10px', color: '#888' }}>{copiedSymbol === m.symbol ? '✓' : '⧉'}</span>
                          </button>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: '11px' }}>—</span>
                        )}
                      </td>

                      {/* Details View Button */}
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAsset({ ...m, details });
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(15,15,15,0.14)',
                            borderRadius: '9999px',
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#0F0F0F',
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Inspection Modal */}
      {selectedAsset && (
        <div
          onClick={() => setSelectedAsset(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,15,15,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#F8F6F1',
              border: '1px solid rgba(15,15,15,0.15)',
              borderRadius: '24px',
              padding: '36px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: selectedAsset.details?.color ? `${selectedAsset.details.color}22` : 'rgba(15,15,15,0.08)',
                  color: selectedAsset.details?.color || '#0F0F0F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '22px',
                }}>
                  {selectedAsset.symbol.slice(0, 1)}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#0F0F0F' }}>
                    {selectedAsset.details?.name || selectedAsset.symbol}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    {selectedAsset.details?.type || 'Synthetic Asset'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                style={{
                  background: 'rgba(15,15,15,0.06)',
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

            {/* Price Row */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(15,15,15,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Live Real-World Valuation
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '30px', fontWeight: 300, color: '#0F0F0F', fontFamily: 'monospace' }}>
                  ${formatPrice(selectedAsset.price)} <span style={{ fontSize: '13px', color: '#888', fontFamily: 'sans-serif' }}>USDTP</span>
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: (selectedAsset.change24h || 0) >= 0 ? '#16a34a' : '#dc2626',
                }}>
                  {formatChange(selectedAsset.change24h)}
                </div>
              </div>
            </div>

            {/* Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(15,15,15,0.06)' }}>
                <span style={{ color: '#777' }}>Underlying Asset</span>
                <span style={{ fontWeight: 500, color: '#0F0F0F' }}>{selectedAsset.details?.underlying}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(15,15,15,0.06)' }}>
                <span style={{ color: '#777' }}>Token Decimals</span>
                <span style={{ fontFamily: 'monospace', color: '#0F0F0F' }}>{selectedAsset.details?.decimals || 18}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(15,15,15,0.06)' }}>
                <span style={{ color: '#777' }}>Oracle Source</span>
                <span style={{ fontWeight: 500, color: '#0F0F0F' }}>CoinGecko Real Spot</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(15,15,15,0.06)', alignItems: 'center' }}>
                <span style={{ color: '#777' }}>Sepolia Contract</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#333' }}>
                    {selectedAsset.details?.contractAddress ? `${selectedAsset.details.contractAddress.slice(0, 8)}...${selectedAsset.details.contractAddress.slice(-6)}` : '—'}
                  </span>
                  {selectedAsset.details?.contractAddress && (
                    <button
                      onClick={() => copyToClipboard(selectedAsset.details.contractAddress, 'MODAL')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedSymbol === 'MODAL' ? '#16a34a' : '#0F0F0F',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {copiedSymbol === 'MODAL' ? '✓' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12px', color: '#777', lineHeight: 1.6, marginBottom: '24px' }}>
              {selectedAsset.details?.description}
            </p>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedAsset.details?.contractAddress && (
                <a
                  href={`https://sepolia.etherscan.io/address/${selectedAsset.details.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    textDecoration: 'none',
                    background: 'transparent',
                    border: '1px solid rgba(15,15,15,0.18)',
                    borderRadius: '9999px',
                    padding: '10px',
                    fontSize: '13px',
                    color: '#0F0F0F',
                    fontWeight: 500,
                  }}
                >
                  View on Etherscan ↗
                </a>
              )}
              <button
                onClick={() => setSelectedAsset(null)}
                style={{
                  flex: 1,
                  background: '#0F0F0F',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px',
                  fontSize: '13px',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
