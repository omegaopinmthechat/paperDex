import { cookies } from 'next/headers';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Doodle404 from './components/Doodle404';

export const metadata = {
  title: '404 Page Lost in the Cryptoverse | PaperDEX',
  description: 'The block or route you were looking for does not exist on this chain.',
};

export default async function NotFound() {
  const cookieStore = await cookies();
  const wallet = cookieStore.get('pd_wallet');

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F8F6F1',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Navbar walletAddress={wallet?.value} />

      {/* Background Watermark Logo */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(760px, 92vw)',
          opacity: 0.035,
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

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 72px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Animated Doodle Element */}
          <div className="animate-hero-1" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Doodle404 />
          </div>

          {/* Badges / Sub-tagline */}
          <div
            className="animate-hero-2"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(15,15,15,0.05)',
              border: '1px solid rgba(15,15,15,0.08)',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                color: '#666',
                textTransform: 'uppercase',
              }}
            >
              Err: 0x404 · Unmined Route
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="animate-hero-3"
            style={{
              fontSize: 'clamp(32px, 5.5vw, 56px)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              color: '#0F0F0F',
              marginBottom: '16px',
            }}
          >
            Lost in the Mempool.
          </h1>

          {/* Description */}
          <p
            className="animate-hero-4"
            style={{
              fontSize: 'clamp(14px, 1.4vw, 16px)',
              color: '#666',
              lineHeight: 1.7,
              maxWidth: '480px',
              margin: '0 auto 36px',
            }}
          >
            This transaction hash or URL vanished into thin air. It might have been re-orged, reverted, or simply never minted on PaperDEX.
          </p>

          {/* Action CTAs */}
          <div
            className="animate-hero-5"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              marginBottom: '36px',
            }}
          >
            <Link
              href={wallet?.value ? '/dashboard' : '/'}
              className="gs-btn-primary"
              style={{ textDecoration: 'none', padding: '13px 32px' }}
            >
              <span>Return Home</span>
              <span style={{ fontSize: '15px' }}>→</span>
            </Link>

            <Link
              href="/markets"
              style={{
                textDecoration: 'none',
                color: '#0F0F0F',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 24px',
                borderRadius: '9999px',
                border: '1px solid rgba(15,15,15,0.14)',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.18s ease',
              }}
            >
              Explore Live Markets ↗
            </Link>

            <Link
              href="/trade"
              style={{
                textDecoration: 'none',
                color: '#555',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 22px',
                borderRadius: '9999px',
                border: '1px solid transparent',
                transition: 'all 0.18s ease',
              }}
            >
              Terminal Trade
            </Link>
          </div>

          {/* Micro telemetry footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: '#999',
            }}
          >
            <span>Simulated Block #0</span>
            <span style={{ color: 'rgba(15,15,15,0.2)' }}>·</span>
            <span>Zero Gas Lost</span>
            <span style={{ color: 'rgba(15,15,15,0.2)' }}>·</span>
            <span>Slippage 0.00%</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(15,15,15,0.08)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '18px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#aaa',
          }}
        >
          <span>© 2026 PaperDEX</span>
          <span style={{ letterSpacing: '0.04em' }}>Status: 404 Route Not Resolved</span>
        </div>
      </footer>
    </div>
  );
}
