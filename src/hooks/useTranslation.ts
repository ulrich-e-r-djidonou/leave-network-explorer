import translations from '../i18n/translations';
import type { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { useYear } from '../contexts/YearContext';

export function useTranslation() {
  const { lang, setLang } = useLanguage();
  const { year, data } = useYear();

  // {year}, {period} et {n} viennent des métadonnées de l'édition affichée.
  const vars: Record<string, string> = {
    year: String(data?.metadata.year ?? year ?? ''),
    period: data?.metadata.changesPeriod ?? '',
    n: String(data?.metadata.totalCountries ?? ''),
  };

  function t(key: TranslationKey): string {
    const raw = (translations[lang][key] as string) ?? (translations.fr[key] as string) ?? key;
    // Clé calculée absente du dictionnaire (ex. type d'entité infranationale non prévu) :
    // chaîne vide, pour que l'appelant applique son repli (`t(x) || valeurBrute`).
    if (typeof raw !== 'string') return '';
    return raw.replace(/\{(year|period|n)\}/g, (_, name: string) => vars[name]);
  }

  return { t, lang, setLang };
}
