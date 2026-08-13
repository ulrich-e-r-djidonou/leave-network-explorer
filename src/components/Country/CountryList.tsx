import { useState, useMemo } from "react";
import type { Country, MapIndicator } from "../../types";
import { getIndicatorValue, formatDuration, REGIONS } from "../../utils/calculations";
import { Search, X } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";
import { getCountryName } from "../../utils/countryNames";

const REGION_LABEL_KEYS: Record<string, string> = {
  All: 'region_all',
  Europe: 'region_europe',
  'North America': 'region_north_america',
  'South America': 'region_south_america',
  Asia: 'region_asia',
  Oceania: 'region_oceania',
  Africa: 'region_africa',
};

interface Props {
  countries: Country[];
  indicator: MapIndicator;
  onSelect: (country: Country) => void;
  selectedIso2?: string;
}

export function CountryList({ countries, indicator, onSelect, selectedIso2 }: Props) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("All");
  const { t, lang } = useTranslation();

  const filtered = useMemo(() => {
    return countries
      .filter((c) => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchRegion = region === "All" || c.region === region;
        return matchSearch && matchRegion;
      })
      .sort((a, b) => {
        const va = getIndicatorValue(a, indicator) ?? -1;
        const vb = getIndicatorValue(b, indicator) ?? -1;
        return vb - va;
      });
  }, [countries, search, region, indicator]);

  const isScore = indicator.includes("gender");
  const isPension = indicator === "pension";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full max-h-[560px]">
      {/* Search & Region Filters */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 space-y-2.5 bg-slate-50/70 dark:bg-slate-850">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {t((REGION_LABEL_KEYS[r] || r) as TranslationKey)}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
        {filtered.map((c, i) => {
          const value = getIndicatorValue(c, indicator);
          const isSelected = selectedIso2 === c.iso2;
          return (
            <button
              key={c.iso2}
              onClick={() => onSelect(c)}
              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group ${
                isSelected ? "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 w-5 text-right shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {getCountryName(c.name, c.iso2, lang)}
                </span>
                {c.subnational && c.subnational.length > 0 && (
                  <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/50 shrink-0">
                    {c.subnational.length}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-mono font-medium text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
                {value !== null
                  ? isPension
                    ? (value === 1 ? (lang === 'fr' ? 'Oui' : 'Yes') : (lang === 'fr' ? 'Non' : 'No'))
                    : isScore
                      ? `${Math.round(value)}/100`
                      : formatDuration(value, lang)
                  : isPension
                    ? "—"
                    : "N/A"}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-xs sm:text-sm text-slate-400 text-center italic">
            {t('no_countries')}
          </p>
        )}
      </div>
    </div>
  );
}
