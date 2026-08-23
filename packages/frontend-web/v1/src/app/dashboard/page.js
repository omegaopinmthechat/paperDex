import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { fetchMarkets } from '../actions/markets';

export const metadata = {
  title: 'Terminal Dashboard — PaperDEX',
  description: 'PaperDEX Account Terminal and Execution Desk on Sepolia Testnet.',
};

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pd_token');
  const wallet = cookieStore.get('pd_wallet');

  if (!token) redirect('/');

  // Fetch real market prices from oracle backend
  const res = await fetchMarkets();
  const markets = res.success ? res.data : [];

  const btcp = markets.find((m) => m.symbol === 'BTCP');
  const ethp = markets.find((m) => m.symbol === 'ETHP');

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '—';
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change) => {
    if (typeof change !== 'number') return '0.00%';
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1' }}>
      
      {/* Shared Navigation */}
      <Navbar walletAddress={wallet?.value} />

      {/* Main content */}
      <main style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Page heading */}
          <div className="animate-hero-1" style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                Institutional Desk · Sepolia Testnet
              </p>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.1 }}>
                Account Terminal.
              </h1>
            </div>

            {/* Quick Live Oracle Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(15,15,15,0.08)', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', color: '#444' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} className="animate-live-dot" />
              <span>Oracle Feed: <strong>Connected</strong></span>
            </div>
          </div>

          {/* Real-time Markets Quick Banner */}
          <div className="animate-hero-2" style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(15, 15, 15, 0.08)',
            borderRadius: '20px',
            padding: '24px 28px',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888' }}>
                  Live Spot Valuations (Real Oracle)
                </span>
                <span style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                  ACTIVE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}>
                
                {/* BTCP Quick Spot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(247, 147, 26, 0.12)', color: '#F7931A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>₿</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F0F0F' }}>BTCP (Bitcoin)</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 500, color: '#0F0F0F' }}>
                      ${btcp ? formatPrice(btcp.price) : '...'}
                      <span style={{ fontSize: '11px', marginLeft: '6px', color: (btcp?.change24h || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatChange(btcp?.change24h)}
                      </span>
                    </div>
                  </div>
                </div>

                <span style={{ color: 'rgba(15,15,15,0.12)', fontSize: '20px' }}>|</span>

                {/* ETHP Quick Spot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(98, 126, 234, 0.12)', color: '#627EEA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>Ξ</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F0F0F' }}>ETHP (Ethereum)</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 500, color: '#0F0F0F' }}>
                      ${ethp ? formatPrice(ethp.price) : '...'}
                      <span style={{ fontSize: '11px', marginLeft: '6px', color: (ethp?.change24h || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatChange(ethp?.change24h)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <Link
              href="/markets"
              style={{
                textDecoration: 'none',
                background: '#0F0F0F',
                color: '#fff',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              Open Market Desk →
            </Link>
          </div>

          {/* Modules grid */}
          <div className="animate-hero-3" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {/* Markets Module Card - ACTIVE */}
            <Link
              href="/markets"
              style={{
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(15,15,15,0.12)',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0F0F0F' }}>
                    Markets
                  </span>
                  <span style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                    LIVE FEED
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
                  Real-time Sepolia oracle spot prices for BTCP, ETHP, and synthetic assets.
                </p>
              </div>
              <div style={{ paddingTop: '20px', fontSize: '12px', color: '#0F0F0F', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Launch Markets Desk</span>
                <span>→</span>
              </div>
            </Link>

            {/* Other modules */}
            {[
              { title: 'Portfolio', desc: 'Holdings & simulated PnL analytics' },
              { title: 'Trade',     desc: 'Simulated market & limit swaps' },
              { title: 'History',   desc: 'Cryptographic execution records' },
            ].map((item) => (
              <div key={item.title} style={{
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(15,15,15,0.06)',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px',
              }}>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0F0F0F', display: 'block', marginBottom: '8px' }}>
                    {item.title}
                  </span>
                  <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
                <div style={{ paddingTop: '20px', fontSize: '12px', color: '#bbb', display: 'flex', justifyContent: 'space-between' }}>
                  <span>In Development</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(15,15,15,0.08)', flexShrink: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa' }}>
          <span>© 2025 PaperDEX</span>
          <span>Sepolia Testnet</span>
        </div>
      </footer>

    </div>
  );
}
