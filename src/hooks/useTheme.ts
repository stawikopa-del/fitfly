import { useState, useEffect } from 'react';

export type Theme = 'default' | 'dark' | 'minimal-dark' | 'minimal-light';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('fitfly-theme');
    return (saved as Theme) || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'minimal-dark', 'minimal-light');
    
    // Apply new theme
    if (theme !== 'default') {
      root.classList.add(theme);
    }
    
    localStorage.setItem('fitfly-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}
