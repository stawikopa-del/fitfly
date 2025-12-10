import { useState, useEffect, useCallback } from 'react';

export type SoundTheme = 'off' | 'soft' | 'tones' | 'retro' | 'nature';

const SOUND_THEME_KEY = 'fitfly-sound-theme';

export const useSoundSettings = () => {
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>(() => {
    if (typeof window === 'undefined') return 'off';
    return (localStorage.getItem(SOUND_THEME_KEY) as SoundTheme) || 'off';
  });

  useEffect(() => {
    localStorage.setItem(SOUND_THEME_KEY, soundTheme);
    // Dispatch custom event for sound modules to react
    window.dispatchEvent(new CustomEvent('soundThemeChange', { detail: soundTheme }));
  }, [soundTheme]);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundThemeState(theme);
  }, []);

  return { soundTheme, setSoundTheme };
};

// Static getter for use outside React
export const getSoundTheme = (): SoundTheme => {
  if (typeof window === 'undefined') return 'off';
  return (localStorage.getItem(SOUND_THEME_KEY) as SoundTheme) || 'off';
};

// Sound theme descriptions
export const soundThemeInfo: Record<SoundTheme, { name: string; description: string; emoji: string }> = {
  off: { name: 'Wyłączone', description: 'Brak dźwięków', emoji: '🔇' },
  soft: { name: 'Delikatne', description: 'Ciche kliknięcia i popy', emoji: '🎵' },
  tones: { name: 'Melodyjne', description: 'Harmoniczne tony', emoji: '🎶' },
  retro: { name: 'Retro', description: 'Style 8-bit', emoji: '🕹️' },
  nature: { name: 'Natura', description: 'Organiczne brzmienia', emoji: '🌿' },
};
