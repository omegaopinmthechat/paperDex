import { cookies } from 'next/headers';
import Navbar from '../components/Navbar';
import MarketDesk from '../components/MarketDesk';
import { fetchMarkets } from '../actions/markets';

export const metadata = {
  title: 'Markets — PaperDEX Real-World Oracle',
  description: 'View real-time spot prices for BTCP, ETHP, and synthetic assets on Sepolia Testnet.',
};

export default async function MarketsPage() {
  const cookieStore = await cookies();
  const wallet = cookieStore.get('pd_wallet');

  // Fetch initial market data on the server
  const res = await fetchMarkets();
  const initialMarkets = res.success ? res.data : [];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F8F6F1' }}>
      
      {/* Navigation */}
      <Navbar walletAddress={wallet?.value} />

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 32px' }}>
        <MarketDesk initialMarkets={initialMarkets} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(15,15,15,0.08)', flexShrink: 0, marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa' }}>
          <span>© 2025 PaperDEX · Real-World Oracle Infrastructure</span>
          <span>Sepolia Testnet</span>
        </div>
      </footer>

    </div>
  );
}
