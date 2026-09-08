import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  themeMode: 'system', // 'light' | 'dark' | 'system'
  toggleTheme: () => {},
  setThemeMode: () => {},
});

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialMode() {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('hexaThemeMode');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  // Legacy: support old single-toggle storage key
  const legacy = localStorage.getItem('hexaTheme');
  if (legacy === 'light' || legacy === 'dark') return legacy;
  return 'system';
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(getInitialMode);
  const [theme, setTheme] = useState(() => {
    const mode = getInitialMode();
    return mode === 'system' ? getSystemTheme() : mode;
  });

  // Watch system preference changes when mode === 'system'
  useEffect(() => {
    if (themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  useEffect(() => {
    const resolved = themeMode === 'system' ? getSystemTheme() : themeMode;
    setTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('hexaThemeMode', themeMode);
    // Keep legacy key for backward compat
    localStorage.setItem('hexaTheme', resolved);
  }, [themeMode]);

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
  };

  // Legacy toggle (light ↔ dark)
  const toggleTheme = () => {
    setThemeModeState((prev) => {
      const resolved = prev === 'system' ? getSystemTheme() : prev;
      return resolved === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
