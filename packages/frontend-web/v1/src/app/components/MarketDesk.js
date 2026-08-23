'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMarkets } from '../actions/markets';
import Sparkline from './Sparkline';
import CoinChartModal from './CoinChartModal';

const ASSET_METADATA = {
  BTCP: {
    name: 'Bitcoin',
    underlying: 'BTC (Bitcoin)',
    symbol: 'BTCP',
    color: '#F7931A',
    contractAddress: '0x7121E40EF99A3Ad5128b30F899192DEeBeC59FD6',
    decimals: 18,
    category: 'MAJOR',
  },
  ETHP: {
    name: 'Ethereum',
    underlying: 'ETH (Ethereum)',
    symbol: 'ETHP',
    color: '#627EEA',
    contractAddress: '0x0bcC57314f1fFaedA980Dc93B1C09ddBA26ED10C',
    decimals: 18,
    category: 'MAJOR',
  },
  SOLP: {
    name: 'Solana',
    underlying: 'SOL (Solana)',
    symbol: 'SOLP',
    color: '#14F195',
    contractAddress: '0xD727C3011eB1b23aF613767769adb003ee7cDb50',
    decimals: 18,
    category: 'MAJOR',
  },
  USDTP: {
    name: 'Tether USD',
    underlying: 'USD (US Dollar)',
    symbol: 'USDTP',
    color: '#26A17B',
    contractAddress: '0x6125A28B8A2121C9e431c63e53bE0b34F455D026',
    decimals: 18,
    category: 'STABLE',
  },
};

const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '—';
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
};

const formatCurrency = (val) => {
  if (typeof val !== 'number' || isNaN(val)) return '—';
  return `$${val.toLocaleString('en-US')}`;
};

const formatPercent = (val) => {
  if (typeof val !== 'number' || isNaN(val)) return '0.0%';
  const prefix = val > 0 ? '▲ ' : val < 0 ? '▼ ' : '';
  return `${prefix}${Math.abs(val).toFixed(1)}%`;
};

export default function MarketDesk({ initialMarkets = [] }) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'HIGHLIGHTS' | 'MAJORS' | 'STABLE'
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showHighlights, setShowHighlights] = useState(true);
  const [favorites, setFavorites] = useState({});

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

  // Enrich market list with metadata and rank
  const enrichedMarkets = useMemo(() => {
    return markets.map((m, index) => {
      const meta = ASSET_METADATA[m.symbol] || {
        name: m.symbol,
        underlying: m.symbol,
        symbol: m.symbol,
        color: '#0F0F0F',
        category: 'MAJOR',
      };
      return {
        ...m,
        rank: index + 1,
        details: meta,
      };
    });
  }, [markets]);

  // Dynamic Global Market Stats (computed strictly from backend data)
  const globalStats = useMemo(() => {
    let totalCap = 0;
    let totalVol = 0;
    let weightedChange24h = 0;

    enrichedMarkets.forEach((m) => {
      totalCap += m.marketCap || 0;
      totalVol += m.totalVolume || 0;
      weightedChange24h += (m.change24h || 0) * (m.marketCap || 1);
    });

    const avgChange24h = totalCap > 0 ? weightedChange24h / totalCap : 0;

    // Top Gainers from backend data
    const topGainers = [...enrichedMarkets]
      .filter((m) => m.symbol !== 'USDTP')
      .sort((a, b) => (b.change24h || 0) - (a.change24h || 0));

    // Trending coins (highest volume)
    const trending = [...enrichedMarkets]
      .filter((m) => m.symbol !== 'USDTP')
      .sort((a, b) => (b.totalVolume || 0) - (a.totalVolume || 0));

    // Representative sparklines for cards from highest cap asset
    const primarySparkline = enrichedMarkets[0]?.sparkline7d || [];

    return {
      totalCap,
      totalVol,
      avgChange24h,
      topGainers,
      trending,
      primarySparkline,
    };
  }, [enrichedMarkets]);

  // Filtered market list for table
  const filteredMarkets = useMemo(() => {
    return enrichedMarkets.filter((m) => {
      const matchesSearch =
        m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.details.name && m.details.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.details.underlying && m.details.underlying.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory === 'HIGHLIGHTS') return (m.change24h || 0) > 0 || m.symbol === 'BTCP';
      if (selectedCategory === 'MAJORS') return m.symbol !== 'USDTP';
      if (selectedCategory === 'STABLE') return m.symbol === 'USDTP';
      return true;
    });
  }, [enrichedMarkets, searchQuery, selectedCategory]);

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Title & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 3.2vw, 34px)', fontWeight: 700, color: '#0F0F0F', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Cryptocurrency Prices by Market Cap
          </h1>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
            The global cryptocurrency market cap today is{' '}
            <strong style={{ color: '#0F0F0F' }}>
              {globalStats.totalCap >= 1e12
                ? `$${(globalStats.totalCap / 1e12).toFixed(2)} Trillion`
                : `$${(globalStats.totalCap / 1e9).toFixed(2)} Billion`}
            </strong>
            , a{' '}
            <span style={{ color: globalStats.avgChange24h >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
              {formatPercent(globalStats.avgChange24h)}
            </span>{' '}
            change in the last 24 hours. Real-time CoinGecko Oracle.
          </p>
        </div>

        {/* Highlights Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#777', fontWeight: 500 }}>Highlights</span>
          <button
            onClick={() => setShowHighlights(!showHighlights)}
            style={{
              width: '40px',
              height: '22px',
              borderRadius: '9999px',
              background: showHighlights ? '#16a34a' : '#ddd',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
              padding: '2px',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#FFFFFF',
                transform: showHighlights ? 'translateX(18px)' : 'translateX(0px)',
                transition: 'transform 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards (CoinGecko Style) */}
      {showHighlights && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          
          {/* Card 1: Total Market Cap */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(15, 15, 15, 0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F0F0F', fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {formatCurrency(globalStats.totalCap)}
              </div>
              <div style={{ fontSize: '12px', color: '#777', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Market Cap</span>
                <span style={{ color: globalStats.avgChange24h >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600, fontFamily: 'monospace' }}>
                  {formatPercent(globalStats.avgChange24h)}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <Sparkline data={globalStats.primarySparkline} width={200} height={32} isPositive={globalStats.avgChange24h >= 0} id="mcap-card" />
            </div>
          </div>

          {/* Card 2: 24h Trading Volume */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(15, 15, 15, 0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F0F0F', fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {formatCurrency(globalStats.totalVol)}
              </div>
              <div style={{ fontSize: '12px', color: '#777' }}>
                24h Trading Volume
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <Sparkline data={globalStats.primarySparkline} width={200} height={32} isPositive={globalStats.avgChange24h >= 0} id="vol-card" />
            </div>
          </div>

          {/* Card 3: Trending */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(15, 15, 15, 0.08)', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F0F0F' }}>
                Trending
              </span>
              <span style={{ fontSize: '11px', color: '#888', cursor: 'pointer' }}>View more ›</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {globalStats.trending.slice(0, 2).map((coin) => (
                <div
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {coin.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coin.image} alt={coin.symbol} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                    )}
                    <span style={{ fontWeight: 600, color: '#0F0F0F' }}>{coin.details?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                    <span style={{ color: '#444' }}>{formatPrice(coin.price)}</span>
                    <span style={{ color: (coin.change24h || 0) >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {formatPercent(coin.change24h)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Top Gainers */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(15, 15, 15, 0.08)', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F0F0F' }}>
                Top Gainers
              </span>
              <span style={{ fontSize: '11px', color: '#888', cursor: 'pointer' }}>View more ›</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {globalStats.topGainers.slice(0, 2).map((coin) => (
                <div
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {coin.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coin.image} alt={coin.symbol} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                    )}
                    <span style={{ fontWeight: 600, color: '#0F0F0F' }}>{coin.details?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
                    <span style={{ color: '#444' }}>{formatPrice(coin.price)}</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      {formatPercent(coin.change24h)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Category Pills & Search Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        
        {/* Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'HIGHLIGHTS', label: 'Highlights' },
            { id: 'MAJORS', label: 'Synthetic Pairs' },
            { id: 'STABLE', label: 'Stablecoins' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                border: 'none',
                background: selectedCategory === cat.id ? '#0F0F0F' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : '#444',
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                border: selectedCategory === cat.id ? '1px solid #0F0F0F' : '1px solid rgba(15,15,15,0.09)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coin or symbol..."
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(15,15,15,0.12)',
              borderRadius: '9999px',
              padding: '6px 18px',
              fontSize: '12px',
              color: '#0F0F0F',
              outline: 'none',
              width: '210px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            }}
          />
        </div>

      </div>

      {/* Main Cryptocurrency Table (CoinGecko Design) */}
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(15, 15, 15, 0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(15,15,15,0.08)', color: '#888', fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em', background: '#FAF9F6' }}>
                <th style={{ padding: '12px 14px', width: '32px' }}>#</th>
                <th style={{ padding: '12px 10px', width: '28px' }}></th>
                <th style={{ padding: '12px 16px' }}>Coin</th>
                <th style={{ padding: '12px 12px' }}></th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>1h</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>24h</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>7d</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>24h Volume</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Market Cap</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', minWidth: '150px' }}>Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    No market data found matching your query.
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((coin) => {
                  const isFavorite = !!favorites[coin.symbol];
                  const is7dPositive = (coin.change7d || coin.change24h || 0) >= 0;

                  return (
                    <tr
                      key={coin.symbol}
                      onClick={() => setSelectedCoin(coin)}
                      style={{
                        borderBottom: '1px solid rgba(15,15,15,0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15,15,15,0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Rank */}
                      <td style={{ padding: '16px 14px', color: '#888', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>
                        {coin.rank}
                      </td>

                      {/* Favorite Star */}
                      <td style={{ padding: '16px 10px' }}>
                        <button
                          onClick={(e) => toggleFavorite(coin.symbol, e)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: isFavorite ? '#F59E0B' : '#CCC',
                            padding: 0,
                          }}
                        >
                          ★
                        </button>
                      </td>

                      {/* Coin Name & Symbol */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {coin.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={coin.image}
                              alt={coin.symbol}
                              style={{ width: '26px', height: '26px', borderRadius: '50%' }}
                            />
                          ) : (
                            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(15,15,15,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                              {coin.symbol.slice(0, 1)}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#0F0F0F' }}>{coin.details?.name}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#777', textTransform: 'uppercase' }}>
                              {coin.symbol}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Buy Action Button */}
                      <td style={{ padding: '16px 12px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCoin(coin);
                          }}
                          style={{
                            background: 'transparent',
                            color: '#16a34a',
                            border: '1px solid #16a34a',
                            borderRadius: '9999px',
                            padding: '3px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#16a34a';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#16a34a';
                          }}
                        >
                          Buy
                        </button>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, fontSize: '13.5px', color: '#0F0F0F' }}>
                        {formatPrice(coin.price)}
                      </td>

                      {/* 1h Change */}
                      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, fontSize: '12px', color: (coin.change1h || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatPercent(coin.change1h)}
                      </td>

                      {/* 24h Change */}
                      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, fontSize: '12px', color: (coin.change24h || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatPercent(coin.change24h)}
                      </td>

                      {/* 7d Change */}
                      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, fontSize: '12px', color: (coin.change7d || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatPercent(coin.change7d)}
                      </td>

                      {/* 24h Volume */}
                      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', color: '#333', fontSize: '12.5px' }}>
                        {formatCurrency(coin.totalVolume)}
                      </td>

                      {/* Market Cap */}
                      <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#0F0F0F', fontSize: '12.5px' }}>
                        {formatCurrency(coin.marketCap)}
                      </td>

                      {/* Last 7 Days Sparkline Graph */}
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Sparkline
                            data={coin.sparkline7d}
                            width={135}
                            height={40}
                            isPositive={is7dPositive}
                            id={`table-${coin.symbol}`}
                          />
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Detail Chart Modal */}
      {selectedCoin && (
        <CoinChartModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}

    </div>
  );
}
