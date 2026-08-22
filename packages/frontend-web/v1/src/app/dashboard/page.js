import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logout } from '../actions/auth';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pd_token');
  const wallet = cookieStore.get('pd_wallet');

  if (!token) redirect('/');

  const short = wallet?.value
    ? `${wallet.value.slice(0, 6)}...${wallet.value.slice(-4)}`
    : 'UNKNOWN';

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '2px solid #00ff41', padding: '18px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#00ff41', fontWeight: 900, fontSize: '22px', letterSpacing: '0.2em' }}>
          PAPER<span style={{ color: '#fff' }}>DEX</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{
            color: '#00ff41', fontSize: '12px', letterSpacing: '0.1em',
            border: '1px solid #00ff41', padding: '6px 14px',
          }}>
            {short}
          </span>
          <form action={logout}>
            <button type="submit" style={{
              background: 'transparent', color: '#fff', border: '1px solid #333',
              padding: '6px 14px', fontFamily: 'inherit', fontSize: '12px',
              cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              LOGOUT
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '60px 40px' }}>
        <div style={{
          color: '#00ff41', fontSize: '11px', letterSpacing: '0.3em',
          textTransform: 'uppercase', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ display: 'inline-block', width: '32px', height: '2px', background: '#00ff41' }} />
          DASHBOARD
        </div>
        <h1 style={{
          color: '#fff', fontSize: 'clamp(32px, 5vw, 64px)',
          fontWeight: 900, margin: '0 0 40px 0', textTransform: 'uppercase',
          letterSpacing: '-0.02em',
        }}>
          WELCOME BACK
        </h1>

        {/* Placeholder panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2px' }}>
          {['PORTFOLIO', 'MARKETS', 'TRADE', 'HISTORY'].map((label) => (
            <div key={label} style={{
              border: '2px solid #00ff41', padding: '32px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <span style={{ color: '#00ff41', fontSize: '10px', letterSpacing: '0.25em' }}>{label}</span>
              <span style={{ color: '#333', fontSize: '13px' }}>COMING SOON</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
