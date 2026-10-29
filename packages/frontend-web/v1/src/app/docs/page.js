import { cookies } from 'next/headers';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import ApiDocsFull from '../components/ApiDocsFull';
import { ApiKeysIcon } from '../components/NavIcons';

export const metadata = {
  title: 'API Documentation & Reference — PaperDEX',
  description: 'Official API documentation for PaperDEX v2 programmatic trading, live markets, and portfolio management.',
};

export default async function DocsPage() {
  const cookieStore = await cookies();
  const wallet = cookieStore.get('pd_wallet');

  return (
    <AppShell walletAddress={wallet?.value}>
      <main style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>

          <div
            className="animate-hero-1"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px',
              borderBottom: '1px solid rgba(15,15,15,0.08)',
              paddingBottom: '28px',
            }}
          >
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                Developer Documentation
              </p>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.1, margin: 0 }}>
                API Reference.
              </h1>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px', maxWidth: '600px', lineHeight: 1.5 }}>
                Complete reference for the PaperDEX v2 REST API. Execute spot trades atomically on Sepolia testnet, query live orderbook markets, and read on-chain portfolios.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/api"
                style={{
                  textDecoration: 'none',
                  background: '#0F0F0F',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ApiKeysIcon size={14} color="#FFFFFF" />
                <span>Manage API Keys</span>
              </Link>
            </div>
          </div>

          <ApiDocsFull walletAddress={wallet?.value} />

        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(15,15,15,0.08)', flexShrink: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa' }}>
          <span>© 2026 PaperDEX</span>
          <span>Public API Documentation v2.0</span>
        </div>
      </footer>
    </AppShell>
  );
}
