import { pl, type Translations } from './pl';
import { en } from './en';
import { useLanguage, type Language } from '@/hooks/useLanguage';

const translations: Record<Language, Translations> = {
  pl,
  en,
};

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = translations[language];
  
  return { t, language };
}

export { pl, en, type Translations, type Language };
