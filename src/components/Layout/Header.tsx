import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export function Header() {
  const location = useLocation();
  const { t, lang, setLang } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { path: '/about', labelKey: 'nav_about' as const },
    { path: '/', labelKey: 'nav_map' as const },
    { path: '/compare', labelKey: 'nav_compare' as const },
    { path: '/rankings', labelKey: 'nav_rankings' as const },
    { path: '/analytics', labelKey: 'nav_analytics' as const },
    { path: '/subnational', labelKey: 'sub_title' as const },
    { path: '/contact', labelKey: 'nav_contact' as const },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 shrink-0">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-sm font-bold">
            LN
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold leading-tight">{t('app_title')}</h1>
            <p className="text-xs text-slate-400">{t('app_subtitle')}</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-sm font-semibold leading-tight">LN Explorer</h1>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex gap-1 items-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                isActive(item.path)
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right side: lang toggle + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* FR/EN Toggle */}
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

          {/* Hamburger (mobile/tablet) */}
          <button
            className="lg:hidden p-1.5 rounded text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-700 bg-slate-900 px-4 py-2">
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
