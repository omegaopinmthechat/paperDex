import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../components/Navbar';
import TradeDesk from '../components/TradeDesk';

export const metadata = {
  title: 'Trade — PaperDEX',
  description: 'Place simulated EIP-712 paper trades on PaperDEX. Zero gas, real on-chain execution via relayer.',
};

export default async function TradePage() {
  const cookieStore = await cookies();
  const token  = cookieStore.get('pd_token');
  const wallet = cookieStore.get('pd_wallet');

  if (!token) redirect('/');

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1' }}>
      <Navbar walletAddress={wallet?.value} />

      <main style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Page heading */}
          <div className="animate-hero-1" style={{ marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.22em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                Execution Desk
              </p>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.1 }}>
                Trade.
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(15,15,15,0.08)', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', color: '#444' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} className="animate-live-dot" />
              <span>Sepolia: <strong>Live Oracle Pricing</strong></span>
            </div>
          </div>

          {/* Trade desk */}
          <div className="animate-hero-2">
            <TradeDesk walletAddress={wallet?.value} />
          </div>

        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(15,15,15,0.08)', flexShrink: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa' }}>
          <span>© 2026 PaperDEX</span>
          <span>All trades settle on Sepolia Testnet</span>
        </div>
      </footer>
    </div>
  );
}
