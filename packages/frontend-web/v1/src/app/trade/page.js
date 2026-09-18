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
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1', overflow: 'hidden' }}>
      <Navbar walletAddress={wallet?.value} />

      <main style={{ flex: 1, padding: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Page heading / Top Bar */}
        <div className="animate-hero-1" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '12px 20px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1 }}>
              PaperDEX Trade
            </h1>
            <div style={{ height: '20px', width: '1px', background: '#E5E7EB' }} />
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', margin: 0 }}>
              Execution Desk
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#374151', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} className="animate-live-dot" />
            <span>Sepolia: <strong>Live Oracle Pricing</strong></span>
          </div>
        </div>

        {/* Trade desk full height area */}
        <div className="animate-hero-2" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <TradeDesk walletAddress={wallet?.value} />
        </div>
      </main>
    </div>
  );
}
