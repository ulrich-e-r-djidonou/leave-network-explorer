import { useState, useMemo } from "react";
import type { Country, MapIndicator } from "../../types";
import { getIndicatorValue, formatDuration, REGIONS } from "../../utils/calculations";
import { Search } from "lucide-react";
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
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {t((REGION_LABEL_KEYS[r] || r) as TranslationKey)}
            </option>
          ))}
        </select>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {filtered.map((c, i) => {
          const value = getIndicatorValue(c, indicator);
          return (
            <button
              key={c.iso2}
              onClick={() => onSelect(c)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 ${
                selectedIso2 === c.iso2 ? "bg-teal-50 dark:bg-teal-900/30" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-5">{i + 1}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{getCountryName(c.name, c.iso2, lang)}</span>
                {c.subnational && c.subnational.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1 rounded">
                    {c.subnational.length}
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
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
          <p className="px-3 py-6 text-sm text-slate-400 text-center">
            {t('no_countries')}
          </p>
        )}
      </div>
    </div>
  );
}
