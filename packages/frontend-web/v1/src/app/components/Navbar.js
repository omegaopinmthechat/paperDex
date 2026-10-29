'use client';

import Link from 'next/link';
import { logout } from '../actions/auth';
import { useTerminal } from './terminal/TerminalContext';
import AwsSearchBar from './AwsSearchBar';
import { HamburgerIcon, TerminalIcon } from './NavIcons';

export default function Navbar({ walletAddress, onHamburger = null }) {
  const { isOpen: isTerminalOpen, setIsOpen: setTerminalOpen } = useTerminal();

  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(15,15,15,0.08)',
        background: 'rgba(248,246,241,0.96)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        height: '54px',
      }}
    >
      <div
        style={{
          height: '100%',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* LEFT — Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Hamburger toggle */}
          <button
            type="button"
            onClick={onHamburger ?? undefined}
            title="Toggle sidebar navigation"
            aria-label="Toggle navigation sidebar"
            style={{
              background: 'transparent',
              border: '1px solid rgba(15,15,15,0.10)',
              borderRadius: '7px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onHamburger ? 'pointer' : 'default',
              color: '#444',
              transition: 'all 0.15s ease',
              flexShrink: 0,
              opacity: onHamburger ? 1 : 0.35,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15,15,15,0.05)';
              e.currentTarget.style.borderColor = 'rgba(15,15,15,0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(15,15,15,0.10)';
            }}
          >
            <HamburgerIcon size={17} />
          </button>

          {/* Brand logo */}
          <Link
            href={walletAddress ? '/dashboard' : '/'}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="PaperDEX"
              style={{ height: '26px', width: 'auto', display: 'block' }}
            />
          </Link>
        </div>

        {/* CENTRE — Search bar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '480px' }}>
          <AwsSearchBar />
        </div>

        {/* RIGHT — CLI + Wallet + Disconnect */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* CLI toggle */}
          <button
            type="button"
            onClick={() => setTerminalOpen((p) => !p)}
            title="Toggle CLI Terminal (Ctrl + `)"
            style={{
              background: isTerminalOpen ? '#0F0F0F' : 'rgba(15,15,15,0.05)',
              color: isTerminalOpen ? '#4EC9B0' : '#555',
              border: isTerminalOpen ? '1px solid #0F0F0F' : '1px solid rgba(15,15,15,0.10)',
              borderRadius: '7px',
              padding: '5px 11px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease',
            }}
          >
            <TerminalIcon size={14} color={isTerminalOpen ? '#4EC9B0' : '#555'} />
            <span>CLI</span>
          </button>

          {shortWallet ? (
            <>
              <div
                style={{
                  padding: '5px 11px',
                  borderRadius: '7px',
                  border: '1px solid rgba(15,15,15,0.10)',
                  background: 'rgba(255,255,255,0.85)',
                  fontSize: '12px',
                  color: '#222',
                  fontFamily: 'monospace',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {shortWallet}
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  style={{
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid rgba(15,15,15,0.12)',
                    borderRadius: '7px',
                    padding: '5px 11px',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0F0F0F';
                    e.currentTarget.style.borderColor = 'rgba(15,15,15,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#666';
                    e.currentTarget.style.borderColor = 'rgba(15,15,15,0.12)';
                  }}
                >
                  Disconnect
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                background: '#0F0F0F',
                color: '#FFF',
                padding: '5px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: 500,
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
