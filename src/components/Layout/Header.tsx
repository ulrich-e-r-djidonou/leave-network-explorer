import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';

export function Header() {
  const location = useLocation();
  const { t, lang, setLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { path: '/', labelKey: 'nav_map' as const },
    { path: '/compare', labelKey: 'nav_compare' as const },
    { path: '/rankings', labelKey: 'nav_rankings' as const },
    { path: '/custom-score', labelKey: 'nav_custom' as const, icon: true },
    { path: '/analytics', labelKey: 'nav_analytics' as const },
    { path: '/subnational', labelKey: 'nav_subnational' as const },
    { path: '/reforms', labelKey: 'nav_reforms' as const },
    { path: '/data', labelKey: 'nav_data' as const },
    { path: '/methodology', labelKey: 'nav_methodology' as const },
    { path: '/about', labelKey: 'nav_about' as const },
    { path: '/contact', labelKey: 'nav_contact' as const },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white shadow-md sticky top-0 z-40 border-b border-slate-800/80">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xs font-bold tracking-tight text-white shadow-sm ring-1 ring-teal-300/30 group-hover:scale-105 transition-transform">
            LN
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap font-display leading-none">
              Leave Network Explorer
            </p>
            <p className="text-[11px] text-slate-400 whitespace-nowrap mt-0.5 font-normal">
              {t('app_subtitle')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 mx-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  active
                    ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon && <SlidersHorizontal className="w-3 h-3 opacity-80" />}
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Controls: Theme toggle + Language toggle + Mobile Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors border border-slate-700/50"
            aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Language Switcher FR / EN */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/50 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setLang('fr')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'fr'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'en'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Hamburger Menu on smaller screens */}
          <button
            className="xl:hidden p-2 rounded-lg bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700/50"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ouvrir le menu de navigation"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet dropdown menu */}
      {menuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon && <SlidersHorizontal className="w-3.5 h-3.5 opacity-80" />}
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
