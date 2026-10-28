'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTerminal } from './TerminalContext';

export default function TerminalScreen() {

  const { activeTab, executeCommand, loading } = useTerminal();
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);

  const screenEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever history updates or tab changes
  useEffect(() => {
    screenEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab?.history, loading]);

  // Focus input on activeTab change
  useEffect(() => {
    inputRef.current?.focus();
    setInputValue('');
    setHistoryIndex(-1);
  }, [activeTab?.id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputValue.trim() || loading) return;
      const cmd = inputValue;
      setInputValue('');
      setHistoryIndex(-1);
      executeCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const list = activeTab?.commandHistory || [];
      if (list.length === 0) return;
      const newIdx = historyIndex === -1 ? list.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIdx);
      setInputValue(list[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const list = activeTab?.commandHistory || [];
      if (list.length === 0 || historyIndex === -1) return;
      const newIdx = historyIndex + 1;
      if (newIdx >= list.length) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        setHistoryIndex(newIdx);
        setInputValue(list[newIdx] || '');
      }
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      executeCommand('clear');
    }
  };

  return (

    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        background: '#0c1017',
        color: '#E6EDF3',
        fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace",
        fontSize: '13px',
        lineHeight: 1.5,
        height: 'calc(100% - 38px)',
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'text',
      }}
    >
      {/* Output History */}
      {activeTab?.history?.map((item, idx) => {
        if (item.type === 'banner') {
          return (
            <div key={idx} style={{ color: '#8B949E', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
              {item.text}
            </div>
          );
        }

        if (item.type === 'input') {
          return (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: '#4EC9B0', fontWeight: 600, flexShrink: 0 }}>
                PS PaperDEX:\api\v2&gt;
              </span>
              <span style={{ color: '#FFFFFF', wordBreak: 'break-all' }}>
                {item.text}
              </span>
            </div>
          );
        }

        if (item.type === 'error') {
          return (
            <div
              key={idx}
              style={{
                color: '#F87171',
                whiteSpace: 'pre-wrap',
                background: 'rgba(248, 113, 113, 0.08)',
                padding: '8px 12px',
                borderRadius: '6px',
                borderLeft: '3px solid #F87171',
              }}
            >
              {item.text}
            </div>
          );
        }

        // Output formatting: Highlight HTTP status codes
        const is200 = item.text.includes('HTTP/1.1 200');
        const is4xx = item.text.includes('HTTP/1.1 4') || item.text.includes('HTTP/1.1 5');

        return (
          <div
            key={idx}
            style={{
              color: is200 ? '#ECECEC' : is4xx ? '#FCA5A5' : '#ECECEC',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {item.text}
          </div>
        );
      })}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4EC9B0' }}>
          <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
          <span style={{ fontSize: '12px' }}>Executing request against PaperDEX...</span>
        </div>
      )}

      {/* Active Input Prompt */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>

        <span style={{ color: '#4EC9B0', fontWeight: 600, flexShrink: 0 }}>
          PS PaperDEX:\api\v2&gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder={loading ? 'Processing...' : 'Type a curl or pdx command, or "help"...'}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontFamily: 'inherit',
            fontSize: '13px',
            caretColor: '#4EC9B0',
            padding: 0,
            margin: 0,
          }}
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div ref={screenEndRef} />
    </div>
  );
}
