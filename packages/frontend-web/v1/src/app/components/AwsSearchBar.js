'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_SERVICES } from './servicesData';
import { SearchIcon, CloseIcon, ArrowRightIcon } from './NavIcons';
import { useTerminal } from './terminal/TerminalContext';

export default function AwsSearchBar() {
  const router = useRouter();
  const { setIsOpen: setTerminalOpen } = useTerminal();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Global keyboard shortcut: '/' or 'Ctrl+K'
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable;

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const filteredResults = ALL_SERVICES.filter((service) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      service.name.toLowerCase().includes(q) ||
      service.shortDesc.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q) ||
      (service.keywords && service.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  });

  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (service) => {
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
    if (service.isAction && service.actionType === 'TOGGLE_TERMINAL') {
      setTerminalOpen(true);
    } else if (service.href) {
      router.push(service.href);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((p) => (p + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((p) => (p <= 0 ? filteredResults.length - 1 : p - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) handleSelect(filteredResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
      {/* Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isOpen ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
          border: isOpen ? '1px solid rgba(15,15,15,0.25)' : '1px solid rgba(15,15,15,0.14)',
          borderRadius: '8px',
          padding: '6px 10px',
          boxShadow: isOpen ? '0 0 0 3px rgba(15,15,15,0.06)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ color: '#999', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <SearchIcon size={15} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (!isOpen) setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search services and features"
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: '#0F0F0F',
            fontFamily: 'inherit',
          }}
        />
        {query ? (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', color: '#AAA', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            <CloseIcon size={13} />
          </button>
        ) : (
          <kbd
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#AAA',
              background: 'rgba(15,15,15,0.05)',
              border: '1px solid rgba(15,15,15,0.10)',
              borderRadius: '4px',
              padding: '1px 6px',
              fontFamily: 'monospace',
              lineHeight: 1.5,
              flexShrink: 0,
            }}
          >
            /
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1px solid rgba(15,15,15,0.10)',
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '8px 14px',
              background: '#FAFAF9',
              borderBottom: '1px solid rgba(15,15,15,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#999',
              textTransform: 'uppercase',
            }}
          >
            <span>{query ? `Results (${filteredResults.length})` : 'Suggested'}</span>
            <span style={{ textTransform: 'none', fontWeight: 400, color: '#BBB' }}>↑↓ navigate · ↵ open</span>
          </div>

          {/* Results */}
          <div style={{ padding: '4px' }}>
            {filteredResults.length > 0 ? (
              filteredResults.map((service, index) => {
                const Icon = service.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleSelect(service)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(15,15,15,0.05)' : 'transparent',
                      transition: 'background 0.10s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(15,15,15,0.06)' : 'rgba(15,15,15,0.04)',
                        border: '1px solid rgba(15,15,15,0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: service.accentColor,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F0F0F' }}>
                        {service.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>
                        {service.shortDesc}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: '#AAA',
                        background: 'rgba(15,15,15,0.04)',
                        border: '1px solid rgba(15,15,15,0.07)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {service.category}
                    </div>
                    {isSelected && (
                      <div style={{ color: '#AAA', flexShrink: 0 }}>
                        <ArrowRightIcon size={12} />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ color: '#CCC', marginBottom: '6px' }}><SearchIcon size={20} /></div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#444' }}>
                  No results for &quot;{query}&quot;
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#AAA' }}>
                  Try &quot;trade&quot;, &quot;markets&quot;, or &quot;api&quot;
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '6px 14px',
              borderTop: '1px solid rgba(15,15,15,0.06)',
              background: '#FAFAF9',
              fontSize: '11px',
              color: '#CCC',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>PaperDEX Navigation</span>
            <span>Esc to dismiss</span>
          </div>
        </div>
      )}
    </div>
  );
}

