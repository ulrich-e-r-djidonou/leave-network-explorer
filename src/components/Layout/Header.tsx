import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';

export function Header() {
  const location = useLocation();
  const { t, lang, setLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { path: '/about', labelKey: 'nav_about' as const },
    { path: '/methodology', labelKey: 'nav_methodology' as const },
    { path: '/', labelKey: 'nav_map' as const },
    { path: '/compare', labelKey: 'nav_compare' as const },
    { path: '/rankings', labelKey: 'nav_rankings' as const },
    { path: '/analytics', labelKey: 'nav_analytics' as const },
    { path: '/subnational', labelKey: 'nav_subnational' as const },
    { path: '/reforms', labelKey: 'nav_reforms' as const },
    { path: '/data', labelKey: 'nav_data' as const },
    { path: '/contact', labelKey: 'nav_contact' as const },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      {/* Barre principale */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 shrink-0">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-sm font-bold">
            LN
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight whitespace-nowrap">
              Leave Network Explorer
            </p>
            <p className="text-[11px] text-slate-400 whitespace-nowrap">{t('app_subtitle')}</p>
          </div>
        </Link>

        {/* Nav desktop — scrollable sans scrollbar visible, prend l'espace restant */}
        <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto no-scrollbar min-w-0 flex-1 mx-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors whitespace-nowrap shrink-0 ${
                isActive(item.path)
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* FR/EN + hamburger — toujours visible à droite, ne rétrécit jamais */}
        <div className="shrink-0 ml-auto flex items-center gap-2">
          {/* Toggle Dark/Light */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Toggle FR/EN */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setLang('fr')}
              className={`px-2.5 py-1 rounded transition-colors ${
                lang === 'fr'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded transition-colors ${
                lang === 'en'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Hamburger — uniquement sous lg */}
          <button
            className="lg:hidden p-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-700 bg-slate-900 px-4 pb-3 pt-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
