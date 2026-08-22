import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logout } from '../actions/auth';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pd_token');
  const wallet = cookieStore.get('pd_wallet');

  if (!token) redirect('/');

  const short = wallet?.value
    ? `${wallet.value.slice(0, 6)}...${wallet.value.slice(-4)}`
    : 'unknown';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1' }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(15,15,15,0.08)', flexShrink: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.16em', color: '#0F0F0F' }}>
            PAPERDEX
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F0F0F', display: 'inline-block' }} className="animate-live-dot" />
              <span style={{ fontSize: '12px', color: '#444', fontFamily: 'monospace' }}>{short}</span>
            </div>
            <form action={logout}>
              <button type="submit" style={{
                background: 'transparent', color: '#666',
                border: '1px solid rgba(15,15,15,0.18)',
                padding: '6px 16px', borderRadius: '9999px',
                fontFamily: 'inherit', fontSize: '12px',
                cursor: 'pointer', letterSpacing: '0.03em',
                transition: 'all 0.15s ease',
              }}>
                Disconnect
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '56px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Page heading */}
          <div className="animate-hero-1" style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em', color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>
              Institutional Desk · Sepolia
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 300, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.1 }}>
              Account Terminal.
            </h1>
          </div>

          {/* Modules grid */}
          <div className="animate-hero-2" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {[
              { title: 'Portfolio',       desc: 'Holdings & simulated PnL analytics' },
              { title: 'Markets',         desc: 'Real-time Sepolia DEX orderbooks' },
              { title: 'Trade',           desc: 'Simulated market & limit swaps' },
              { title: 'History',         desc: 'Cryptographic execution records' },
            ].map((item) => (
              <div key={item.title} style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(15,15,15,0.07)',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
              }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F', display: 'block', marginBottom: '8px' }}>
                    {item.title}
                  </span>
                  <p style={{ fontSize: '13px', color: '#777', lineHeight: 1.6 }}>
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
