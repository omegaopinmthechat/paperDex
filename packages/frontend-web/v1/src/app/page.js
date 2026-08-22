import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ConnectWallet from './components/ConnectWallet';

export default async function Home() {
  const cookieStore = await cookies();
  if (cookieStore.get('pd_token')) redirect('/dashboard');

  return (
    <main style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#000', padding: '0',
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '2px solid #00ff41', padding: '18px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#00ff41', fontWeight: 900, fontSize: '22px', letterSpacing: '0.2em' }}>
          PAPER<span style={{ color: '#fff' }}>DEX</span>
        </span>
        <span style={{ color: '#00ff41', fontSize: '11px', letterSpacing: '0.15em', border: '1px solid #00ff41', padding: '4px 10px' }}>
          SEPOLIA TESTNET
        </span>
      </div>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px 40px',
        borderBottom: '2px solid #00ff41',
      }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{
            color: '#00ff41', fontSize: '11px', letterSpacing: '0.3em',
            textTransform: 'uppercase', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ display: 'inline-block', width: '32px', height: '2px', background: '#00ff41' }} />
            PAPER TRADING DEX
          </div>

          <h1 style={{
            color: '#fff', fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 900, lineHeight: 1, margin: '0 0 8px 0',
            letterSpacing: '-0.02em', textTransform: 'uppercase',
          }}>
            TRADE
          </h1>
          <h1 style={{
            color: '#00ff41', fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 900, lineHeight: 1, margin: '0 0 8px 0',
            letterSpacing: '-0.02em', textTransform: 'uppercase',
          }}>
            WITHOUT
          </h1>
          <h1 style={{
            color: '#fff', fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 900, lineHeight: 1, margin: '0 0 48px 0',
            letterSpacing: '-0.02em', textTransform: 'uppercase',
          }}>
            RISK.
          </h1>

          <p style={{
            color: '#aaa', fontSize: '16px', lineHeight: 1.8,
            maxWidth: '480px', marginBottom: '48px',
          }}>
            Simulate real DEX trades on Sepolia. Connect your wallet — no real funds needed.
          </p>

          <ConnectWallet />
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '2px solid #00ff41',
      }}>
        {[
          { label: 'NETWORK', value: 'SEPOLIA' },
          { label: 'RISK', value: 'ZERO' },
          { label: 'WALLET', value: 'METAMASK' },
          { label: 'PROTOCOL', value: 'V1' },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, padding: '24px 32px',
            borderRight: i < 3 ? '2px solid #00ff41' : 'none',
          }}>
            <div style={{ color: '#00ff41', fontSize: '10px', letterSpacing: '0.2em', marginBottom: '6px' }}>
              {item.label}
            </div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: 900, letterSpacing: '0.05em' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#333', fontSize: '11px', letterSpacing: '0.1em' }}>
          © 2025 PAPERDEX
        </span>
        <span style={{ color: '#00ff41', fontSize: '11px', letterSpacing: '0.1em' }}>
          ● LIVE
        </span>
      </div>
    </main>
  );
}
