'use client';

import React from 'react';
import { useTerminal } from './TerminalContext';
import TerminalTabsHeader from './TerminalTabsHeader';
import TerminalScreen from './TerminalScreen';

export default function TerminalDock() {
  const { isOpen, setIsOpen, isExpanded } = useTerminal();

  return (
    <>
      {/* Floating Bottom-Right Toggle Pill (Always Visible when terminal is closed) */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          title="Open PaperDEX CLI Terminal (Ctrl + `)"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '28px',
            zIndex: 900,
            background: '#0F0F0F',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            borderRadius: '9999px',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
          }}
        >
          <span style={{ color: '#4EC9B0', fontWeight: 700 }}>&gt;_</span>
          <span>CLI Terminal</span>
          <span
            style={{
              fontSize: '10px',
              color: '#888',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            Ctrl+`
          </span>
        </div>
      )}

      {/* Docked Bottom Terminal Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          height: isExpanded ? '560px' : '340px',
          maxHeight: '85vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s ease',
          boxShadow: '0 -8px 36px rgba(0, 0, 0, 0.45)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        <TerminalTabsHeader />
        <TerminalScreen />
      </div>
    </>
  );
}
