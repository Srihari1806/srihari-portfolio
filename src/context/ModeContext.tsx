'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Mode } from '@/types';

interface ModeContextType {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  isMounted: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('normal');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('srihari_portfolio_mode') as Mode;
    if (saved === 'normal' || saved === 'tfi') {
      setModeState(saved);
      applyModeClass(saved);
    } else {
      applyModeClass('normal');
    }
  }, []);

  const applyModeClass = (targetMode: Mode) => {
    const root = document.documentElement;
    if (targetMode === 'tfi') {
      root.classList.add('tfi-theme');
      root.classList.add('dark');
    } else {
      root.classList.remove('tfi-theme');
      root.classList.remove('dark');
    }
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem('srihari_portfolio_mode', newMode);
    applyModeClass(newMode);
  };

  const toggleMode = () => {
    const next = mode === 'normal' ? 'tfi' : 'normal';
    setMode(next);
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode, isMounted }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
