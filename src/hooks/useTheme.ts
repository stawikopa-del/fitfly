import { useState, useEffect, useCallback } from 'react';

export type Theme = 'default' | 'dark' | 'minimal-dark' | 'minimal-light';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'default';
  try {
    const saved = localStorage.getItem('fitfly-theme');
    return (saved as Theme) || 'default';
  } catch {
    return 'default';
  }
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Guard against SSR
    if (typeof document === 'undefined') return;

    try {
      const root = document.documentElement;
      
      // Remove all theme classes
      root.classList.remove('dark', 'minimal-dark', 'minimal-light');
      
      // Apply new theme
      if (theme !== 'default') {
        root.classList.add(theme);
      }
      
      localStorage.setItem('fitfly-theme', theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return { theme, setTheme };
}
