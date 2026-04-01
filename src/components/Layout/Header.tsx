import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/about", label: "À propos" },
  { path: "/", label: "Carte" },
  { path: "/compare", label: "Comparer" },
  { path: "/rankings", label: "Classements" },
  { path: "/analytics", label: "Analyses" },
  { path: "/contact", label: "Contact" },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-sm font-bold">
            LN
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Leave Network Explorer
            </h1>
            <p className="text-xs text-slate-400">
              International Review of Leave Policies 2025
            </p>
          </div>
        </Link>
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
