import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../components/Navbar';
import ApiKeyManager from '../components/ApiKeyManager';
import ApiDocs from '../components/ApiDocs';
import { listApiKeys } from '../actions/apiKeys';

export const metadata = {
  title: 'Developer API — PaperDEX',
  description: 'Programmatic REST API for automated trading, portfolio tracking, and real-time market data.',
};

export default async function ApiPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pd_token');
  const wallet = cookieStore.get('pd_wallet');

  if (!token) redirect('/');

  const keysRes = await listApiKeys();
  const initialKeys = keysRes.ok ? keysRes.data : [];

  const shortWallet = wallet?.value
    ? `${wallet.value.slice(0, 6)}...${wallet.value.slice(-4)}`
    : null;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1' }}>
      <Navbar walletAddress={wallet?.value} />

      <main style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>

          {/* Section Header */}
          <div
            className="animate-hero-1"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  color: '#888',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Developer API
              </p>
              <h1
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 300,
                  letterSpacing: '-0.03em',
                  color: '#0F0F0F',
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                API Access.
              </h1>
              {shortWallet && (
                <p style={{ fontSize: '12px', color: '#888', marginTop: '6px', fontFamily: 'monospace' }}>
                  Linked to {shortWallet}
                </p>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(15, 15, 15, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                color: '#444',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontWeight: 500 }}>REST API v2 Live</span>
            </div>
          </div>

          {/* Key Management Section */}
          <section>
            <ApiKeyManager initialKeys={initialKeys} />
          </section>

          {/* Documentation & Reference Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#0F0F0F',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                API Documentation & Reference
              </h2>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                Interactive endpoints, request parameters, and curl snippets.
              </p>
            </div>

            <ApiDocs />
          </section>

        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(15, 15, 15, 0.08)', flexShrink: 0 }}>
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
          <span>Programmatic Trading API v2</span>
        </div>
      </footer>
    </div>
  );
}
