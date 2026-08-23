import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../components/Navbar';
import PortfolioHoldings from '../components/PortfolioHoldings';
import { fetchPortfolio } from '../actions/portfolio';

export const metadata = {
  title: 'Portfolio — PaperDEX',
  description: 'Your PaperDEX token holdings and simulated portfolio value.',
};

export default async function PortfolioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pd_token');
  const wallet = cookieStore.get('pd_wallet');

  if (!token) redirect('/');

  const res = await fetchPortfolio();
  const initialData = res.success ? res.data : [];

  const shortWallet = wallet?.value
    ? `${wallet.value.slice(0, 6)}...${wallet.value.slice(-4)}`
    : null;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1' }}>
      <Navbar walletAddress={wallet?.value} />

      <main style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Header */}
          <div className="animate-hero-1" style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                On-Chain Balances
              </p>
              <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.1 }}>
                Portfolio.
              </h1>
              {shortWallet && (
                <p style={{ fontSize: '12px', color: '#888', marginTop: '6px', fontFamily: 'monospace' }}>
                  {shortWallet}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(15,15,15,0.08)', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', color: '#444' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} className="animate-live-dot" />
              <span>Live On-Chain Reads</span>
            </div>
          </div>

          {initialData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888', fontSize: '14px' }}>
              <p style={{ marginBottom: '8px', fontSize: '24px' }}>⏳</p>
              <p>Your starter balance is being granted on-chain. This usually takes ~15 seconds after first login.</p>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>Refresh the page in a moment.</p>
            </div>
          ) : (
            <PortfolioHoldings initialData={initialData} />
          )}

        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(15,15,15,0.08)', flexShrink: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa' }}>
          <span>© 2026 PaperDEX</span>
        </div>
      </footer>
    </div>
  );
}
