import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SoundTheme = 'off' | 'soft' | 'tones' | 'nature';

const SOUND_THEME_KEY = 'fitfly-sound-theme';

export const useSoundSettings = () => {
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>(() => {
    if (typeof window === 'undefined') return 'off';
    return (localStorage.getItem(SOUND_THEME_KEY) as SoundTheme) || 'off';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load from database on mount
  useEffect(() => {
    let mounted = true;
    
    const loadFromDatabase = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) {
          setIsLoading(false);
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('sound_theme')
          .eq('user_id', user.id)
          .single();

        if (data?.sound_theme && mounted) {
          const theme = data.sound_theme as SoundTheme;
          setSoundThemeState(theme);
          localStorage.setItem(SOUND_THEME_KEY, theme);
        }
      } catch {
        // Use localStorage fallback
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadFromDatabase();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem(SOUND_THEME_KEY, soundTheme);
    window.dispatchEvent(new CustomEvent('soundThemeChange', { detail: soundTheme }));
  }, [soundTheme]);

  const setSoundTheme = useCallback(async (theme: SoundTheme) => {
    setSoundThemeState(theme);
    localStorage.setItem(SOUND_THEME_KEY, theme);
    
    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ sound_theme: theme })
          .eq('user_id', user.id);
      }
    } catch {
      // localStorage is the fallback
    }
  }, []);

  return { soundTheme, setSoundTheme, isLoading };
};

// Static getter for use outside React
export const getSoundTheme = (): SoundTheme => {
  if (typeof window === 'undefined') return 'off';
  return (localStorage.getItem(SOUND_THEME_KEY) as SoundTheme) || 'off';
};

// Sound theme descriptions
export const soundThemeInfo: Record<SoundTheme, { name: string; description: string; emoji: string }> = {
  off: { name: 'Wyłączone', description: 'Brak dźwięków', emoji: '🔇' },
  soft: { name: 'Delikatne', description: 'Ciche kliknięcia', emoji: '🎵' },
  tones: { name: 'Kryształowe', description: 'Czyste, szklane tony', emoji: '💎' },
  nature: { name: 'Natura', description: 'Organiczne brzmienia', emoji: '🌿' },
};
