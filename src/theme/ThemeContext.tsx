import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemePreference = ThemeMode | 'system';

type ThemeContextValue = {
  mode: ThemeMode; // Currently applied theme mode
  preference: ThemePreference; // User's theme preference
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'sokki.themePreference';

function getSystemMode(): ThemeMode {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyDataAttr(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    return saved ?? 'system';
  });

  const [systemMode, setSystemMode] = useState<ThemeMode>(() => getSystemMode());
  const mode: ThemeMode = preference === 'system' ? systemMode : preference;

  // Apply data-theme attribute when mode changes
  useEffect(() => {
    applyDataAttr(mode);
  }, [mode]);

  // Listen for OS theme changes when preference is "system"
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemMode(getSystemMode());

    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      mq.addListener(handler);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else {
        mq.removeListener(handler);
      }
    };
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    localStorage.setItem(STORAGE_KEY, p);
  };

  const value = useMemo(
    () => ({ mode, preference, setPreference }),
    [mode, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
