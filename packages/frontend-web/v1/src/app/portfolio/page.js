import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '../components/AppShell';
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
    <AppShell walletAddress={wallet?.value}>
      <main style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

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
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(15,15,15,0.08)', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', color: '#444' }}>
              <span>Live On-Chain Reads</span>
            </div>
          </div>

          {initialData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888', fontSize: '14px' }}>
              <p style={{ marginBottom: '8px', fontSize: '24px', fontFamily: 'monospace', color: '#AAA' }}>[...]</p>
              <p>If you just created your account, it might take up to a few minutes to confirm on the Sepolia blockchain and register your joining $100,000 USDTP.</p>
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>Balances update automatically once confirmed.</p>
            </div>
          ) : (
            <PortfolioHoldings initialData={initialData} />
          )}

          {/* FAQ Section */}
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(15, 15, 15, 0.08)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F0F0F', marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Frequently Asked Questions (FAQ)
            </h3>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(217, 119, 6, 0.35)',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: '0 2px 10px rgba(217, 119, 6, 0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#D97706',
                  background: 'rgba(217, 119, 6, 0.12)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  FAQ
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F0F0F' }}>
                  I have created a new account but it doesn&apos;t show 100k dollars in portfolio. What should I do?
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0 }}>
                Please wait for a few minutes (approximately 10 to 15 minutes) and keep refreshing the portfolio page. The 100k will be credited automatically. The initial 100,000 USDTP starter capital is minted and confirmed on-chain on Ethereum Sepolia by our relayer node. As soon as the network block confirmations clear, your balance will be updated.
              </p>
            </div>
          </div>

        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(15,15,15,0.08)', flexShrink: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#aaa' }}>
          <span>© 2026 PaperDEX</span>
        </div>
      </footer>
    </AppShell>
  );
}
