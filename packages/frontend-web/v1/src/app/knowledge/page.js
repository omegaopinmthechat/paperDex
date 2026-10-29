import { cookies } from 'next/headers';
import AppShell from '../components/AppShell';
import KnowledgeCenter from '../components/KnowledgeCenter';

export const metadata = {
  title: 'Knowledge Center — PaperDEX',
  description: 'Architecture overviews, platform guides, zero-gas simulated trading explanations, and API integration references.',
};

export default async function KnowledgePage() {
  const cookieStore = await cookies();
  const wallet = cookieStore.get('pd_wallet');

  return (
    <AppShell walletAddress={wallet?.value}>
      <main style={{ flex: 1, padding: '40px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <KnowledgeCenter />
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(15, 15, 15, 0.08)', flexShrink: 0 }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#aaa',
          }}
        >
          <span>© 2026 PaperDEX</span>
          <span>Knowledge Center &amp; Developer Hub</span>
        </div>
      </footer>
    </AppShell>
  );
}

