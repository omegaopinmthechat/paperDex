'use client';

import React from 'react';
import { TerminalProvider } from './TerminalContext';
import TerminalDock from './TerminalDock';

export default function TerminalWrapper({ children }) {
  return (
    <TerminalProvider>
      {children}
      <TerminalDock />
    </TerminalProvider>
  );
}
