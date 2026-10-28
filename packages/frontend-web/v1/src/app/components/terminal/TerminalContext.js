'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const WELCOME_BANNER = `Windows PowerShell
Copyright (C) PaperDEX Foundation. All rights reserved.

PaperDEX Developer CLI Sandbox v2.0
Type "help" for available commands, or "examples" for instant curl templates.`;

const TerminalContext = createContext(null);

let tabCounter = 1;

function createNewTab(num) {
  return {
    id: `tab-${num}-${Date.now()}`,
    title: `Session ${num}`,
    history: [
      { type: 'banner', text: WELCOME_BANNER },
    ],
    commandHistory: [],
    historyIdx: -1,
  };
}

export function TerminalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tabs, setTabs] = useState(() => [createNewTab(1)]);
  const [activeTabId, setActiveTabId] = useState(() => tabs[0]?.id);
  const [loading, setLoading] = useState(false);

  // Global keyboard shortcut: Ctrl + ` (backtick) or Alt + T
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === '`') || (e.altKey && (e.key === 't' || e.key === 'T'))) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add a new tab
  const addTab = () => {
    tabCounter += 1;
    const newTab = createNewTab(tabCounter);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // Close/delete a tab
  const closeTab = (idToClose, e) => {
    if (e) e.stopPropagation();

    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== idToClose);
      if (filtered.length === 0) {
        tabCounter += 1;
        const freshTab = createNewTab(tabCounter);
        setActiveTabId(freshTab.id);
        return [freshTab];
      }
      if (activeTabId === idToClose) {
        const nextActive = filtered[filtered.length - 1];
        setActiveTabId(nextActive.id);
      }
      return filtered;
    });
  };

  // Clear current tab screen
  const clearCurrentTab = () => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === activeTabId) {
          return { ...t, history: [] };
        }
        return t;
      }),
    );
  };

  // Execute CLI command
  const executeCommand = async (rawCommand) => {
    const trimmed = rawCommand?.trim();
    if (!trimmed) return;

    const targetTabId = activeTabId;

    // Append user input to history immediately
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id === targetTabId) {
          const updatedCmdHistory = [...t.commandHistory, trimmed];
          return {
            ...t,
            history: [...t.history, { type: 'input', text: trimmed }],
            commandHistory: updatedCmdHistory,
            historyIdx: -1,
          };
        }
        return t;
      }),
    );

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/terminal/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: trimmed }),
      });

      const json = await res.json();
      setLoading(false);

      if (json.data?.action === 'clear') {
        clearCurrentTab();
        return;
      }

      const outputText = json.data?.output ?? json.error?.message ?? 'Command finished.';
      const isError = !json.success || json.data?.isError;

      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === targetTabId) {
            return {
              ...t,
              history: [...t.history, { type: isError ? 'error' : 'output', text: outputText }],
            };
          }
          return t;
        }),
      );
    } catch (err) {
      setLoading(false);
      setTabs((prev) =>
        prev.map((t) => {
          if (t.id === targetTabId) {
            return {
              ...t,
              history: [
                ...t.history,
                { type: 'error', text: `Network Error: Could not reach PaperDEX terminal API service (${err.message})` },
              ],
            };
          }
          return t;
        }),
      );
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <TerminalContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isExpanded,
        setIsExpanded,
        tabs,
        activeTabId,
        setActiveTabId,
        activeTab,
        addTab,
        closeTab,
        clearCurrentTab,
        executeCommand,
        loading,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
}
