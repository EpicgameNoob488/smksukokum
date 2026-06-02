import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { lightTokens, darkTokens } from '../lib/designTokens';

type TokenSet = typeof lightTokens;

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
  tokens: TokenSet;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
  tokens: lightTokens,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((d) => !d), []);

  const value: ThemeContextType = {
    isDark,
    toggle,
    tokens: isDark ? darkTokens : lightTokens,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
