'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * AppShell — client wrapper that owns sidebar open/closed state.
 * Used by every authenticated page as the outer layout shell.
 *
 * Props:
 *   walletAddress  — passed to Navbar for the wallet pill display
 *   fullHeight     — when true the shell uses 100dvh and hides overflow
 *                    (used by Trade page which needs a fixed-height layout)
 *   children       — page content (main + footer)
 */
export default function AppShell({ walletAddress, fullHeight = false, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      style={{
        height: fullHeight ? '100dvh' : undefined,
        minHeight: fullHeight ? undefined : '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F8F6F1',
        overflow: fullHeight ? 'hidden' : undefined,
      }}
    >
      {/* Sticky navbar — always on top */}
      <Navbar
        walletAddress={walletAddress}
        onHamburger={() => setSidebarOpen((p) => !p)}
      />

      {/* Content row: sidebar + page content side-by-side */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: fullHeight ? 'hidden' : undefined }}>
        <Sidebar isOpen={sidebarOpen} />

        {/* Page content column */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: fullHeight ? 'hidden' : 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
