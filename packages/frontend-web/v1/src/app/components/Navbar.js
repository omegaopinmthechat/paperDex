'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../actions/auth';

export default function Navbar({ walletAddress }) {
  const pathname = usePathname();

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/markets', label: 'Markets' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  return (
    <header style={{ borderBottom: '1px solid rgba(15,15,15,0.08)', background: 'rgba(248, 246, 241, 0.85)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Brand & Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <Link href={walletAddress ? '/dashboard' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="PaperDEX"
              style={{ height: '30px', width: 'auto', display: 'block' }}
            />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#0F0F0F' : '#666',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: isActive ? 'rgba(15,15,15,0.06)' : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side status & wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#666', letterSpacing: '0.04em', background: 'rgba(15,15,15,0.04)', padding: '5px 12px', borderRadius: '9999px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} className="animate-live-dot" />
            <span style={{ fontWeight: 500 }}>Live Network</span>
          </div>

          {shortWallet ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '9999px', border: '1px solid rgba(15,15,15,0.12)', background: 'rgba(255,255,255,0.8)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0F0F0F', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', color: '#222', fontFamily: 'monospace', fontWeight: 500 }}>{shortWallet}</span>
              </div>
              <form action={logout}>
                <button type="submit" style={{
                  background: 'transparent', color: '#666',
                  border: '1px solid rgba(15,15,15,0.16)',
                  padding: '5px 14px', borderRadius: '9999px',
                  fontFamily: 'inherit', fontSize: '12px',
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'all 0.15s ease',
                }}>
                  Disconnect
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                background: '#0F0F0F',
                color: '#fff',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              Connect Wallet
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
