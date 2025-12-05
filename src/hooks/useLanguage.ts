import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'pl' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'pl',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'fitfly-language',
    }
  )
);
