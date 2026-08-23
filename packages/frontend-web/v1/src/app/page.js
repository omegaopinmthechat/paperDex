import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ConnectWallet from './components/ConnectWallet';

export default async function Home() {
  const cookieStore = await cookies();
  if (cookieStore.get('pd_token')) redirect('/dashboard');

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1', position: 'relative', overflow: 'hidden' }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(15,15,15,0.08)', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="PaperDEX"
                style={{ height: '32px', width: 'auto', display: 'block' }}
              />
            </Link>
            <Link
              href="/markets"
              style={{
                textDecoration: 'none',
                fontSize: '13px',
                color: '#666',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(15,15,15,0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              Explore Markets ↗
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#666', letterSpacing: '0.08em' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} className="animate-live-dot" />
            Live Network
          </div>
        </div>
      </header>

      {/* Hero — takes all remaining space with low-opacity background watermark */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', position: 'relative' }}>
        
        {/* Background Logo Watermark (low opacity) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(720px, 90vw)',
            opacity: 0.042,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Hero Content */}
        <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="animate-hero-1" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em', color: '#888', textTransform: 'uppercase', marginBottom: '24px' }}>
            Institutional Paper Trading
          </p>

          <h1 className="animate-hero-2" style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.08, color: '#0F0F0F', marginBottom: '24px' }}>
            Trade without risk.
          </h1>

          <p className="animate-hero-3" style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', color: '#666', lineHeight: 1.75, maxWidth: '440px', margin: '0 auto 40px' }}>
            Simulate decentralized exchange trades with zero capital exposure. Real-time pricing fed by live crypto oracles.
          </p>

          <div className="animate-hero-4" style={{ marginBottom: '36px' }}>
            <ConnectWallet />
          </div>

          <div className="animate-hero-5" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 20px', fontSize: '12px', color: '#999' }}>
            <span>✓ Simulated Liquidity</span>
            <span style={{ color: 'rgba(15,15,15,0.15)' }}>·</span>
            <span>✓ Zero Real Capital</span>
            <span style={{ color: 'rgba(15,15,15,0.15)' }}>·</span>
            <span>✓ Real Oracle Spot Feeds</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(15,15,15,0.08)', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa' }}>
          <span>© 2026 PaperDEX</span>
        </div>
      </footer>

    </div>
  );
}
