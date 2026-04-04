import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Lang } from '../i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('ln_lang');
    return saved === 'en' || saved === 'fr' ? saved : 'fr';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('ln_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
