'use client';

import React from 'react';
import { useTerminal } from './TerminalContext';

export default function TerminalTabsHeader() {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    setIsOpen,
    isExpanded,
    setIsExpanded,
    clearCurrentTab,
  } = useTerminal();

  return (
    <div
      style={{
        background: '#161b22',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        padding: '0 8px',
      }}
    >
      {/* Left: Terminal Brand & Tab List */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '4px', overflowX: 'auto' }}>
        {/* PowerShell Branding Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 10px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#4EC9B0',
            fontFamily: 'monospace',
          }}
        >
          <span>PS</span>
          <span style={{ color: '#888', fontWeight: 400 }}>|</span>
        </div>

        {/* Tab Items */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                height: '32px',
                marginTop: '6px',
                padding: '0 12px',
                background: isActive ? '#0c1017' : 'transparent',
                borderTop: isActive ? '2px solid #4EC9B0' : '2px solid transparent',
                borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: isActive ? '#FFFFFF' : '#8B949E',
                fontSize: '12px',
                fontFamily: 'monospace',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.title}</span>

              {/* Close/Delete Tab Button */}
              <button
                type="button"
                onClick={(e) => closeTab(tab.id, e)}
                title="Close Tab"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#888' : '#555',
                  fontSize: '11px',
                  lineHeight: 1,
                  padding: '2px 4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F87171';
                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActive ? '#888' : '#555';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* '+' Add Tab Button */}
        <button
          type="button"
          onClick={addTab}
          title="Open New Terminal Tab"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8B949E',
            fontSize: '16px',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
            marginLeft: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8B949E';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          +
        </button>
      </div>

      {/* Right: Window Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Clear Screen */}
        <button
          type="button"
          onClick={clearCurrentTab}
          title="Clear screen (cls)"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8B949E',
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8B949E';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Clear
        </button>

        {/* Expand / Shrink */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? 'Restore Height' : 'Expand Height'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8B949E',
            fontSize: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8B949E';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isExpanded ? '🗗' : '🗖'}
        </button>

        {/* Close Window */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          title="Close Terminal (Ctrl + `)"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8B949E',
            fontSize: '13px',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#F87171';
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8B949E';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
