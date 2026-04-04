import translations from '../i18n/translations';
import type { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';

export function useTranslation() {
  const { lang, setLang } = useLanguage();

  function t(key: TranslationKey): string {
    return (translations[lang][key] as string) ?? (translations.fr[key] as string) ?? key;
  }

  return { t, lang, setLang };
}
