import { useState, useMemo } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import type { Country } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { getTotalLeaveMonths } from '../utils/calculations';
import { getCountryName } from '../utils/countryNames';

interface Weights {
  duration: number;
  wellpaid: number;
  flexibility: number;
  ecec: number;
}

const DEFAULT_WEIGHTS: Weights = {
  duration: 40,
  wellpaid: 30,
  flexibility: 20,
  ecec: 10,
};

/** Compute the 4 raw sub-scores as 0-1 fractions */
function computeSubScores(country: Country) {
  const totalPaid = getTotalLeaveMonths(country);
  const durationRaw = Math.min(40, totalPaid * 2.5) / 40;

  let wellPaid = 0;
  if (country.maternity?.durationMonths?.wellPaid)
    wellPaid += country.maternity.durationMonths.wellPaid;
  if (country.paternity?.durationMonths?.wellPaid)
    wellPaid += country.paternity.durationMonths.wellPaid;
  if (country.parental?.durationMonths?.wellPaid)
    wellPaid += country.parental.durationMonths.wellPaid;
  const wellpaidRaw = Math.min(30, wellPaid * 2) / 30;

  const types = [country.maternity, country.paternity, country.parental].filter(Boolean);
  const hasFlexPartTime = types.some((t) => t?.exists && t?.flexPartTime);
  const hasFlexBlocks = types.some((t) => t?.exists && t?.flexBlocks);
  const flexRaw = ((hasFlexPartTime ? 10 : 0) + (hasFlexBlocks ? 10 : 0)) / 20;

  const ececRaw = country.ecec?.universalEntitlement ? 1 : 0;

  return { duration: durationRaw, wellpaid: wellpaidRaw, flexibility: flexRaw, ecec: ececRaw };
}

function computeCustomScore(country: Country, weights: Weights): number {
  const sub = computeSubScores(country);
  const totalWeight = weights.duration + weights.wellpaid + weights.flexibility + weights.ecec;
  if (totalWeight === 0) return 0;
  const weighted =
    weights.duration * sub.duration +
    weights.wellpaid * sub.wellpaid +
    weights.flexibility * sub.flexibility +
    weights.ecec * sub.ecec;
  return Math.round((weighted / totalWeight) * 100);
}

const MEDAL_COLORS = [
  'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200',   // gold
  'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200',  // silver
  'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200', // bronze
];

export function CustomScorePage({ countries }: { countries: Country[] }) {
  const { t, lang } = useTranslation();
  const [weights, setWeights] = useState<Weights>({ ...DEFAULT_WEIGHTS });
  const [search, setSearch] = useState('');

  const totalWeight = weights.duration + weights.wellpaid + weights.flexibility + weights.ecec;

  const ranked = useMemo(() => {
    const scored = countries.map((c) => ({
      country: c,
      score: computeCustomScore(c, weights),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [countries, weights]);

  const filtered = useMemo(() => {
    if (!search.trim()) return ranked;
    const q = search.toLowerCase();
    return ranked.filter((r) => r.country.name.toLowerCase().includes(q));
  }, [ranked, search]);

  const maxScore = ranked.length > 0 ? ranked[0].score : 100;

  const sliders: { key: keyof Weights; labelKey: 'custom_duration' | 'custom_wellpaid' | 'custom_flexibility' | 'custom_ecec' }[] = [
    { key: 'duration', labelKey: 'custom_duration' },
    { key: 'wellpaid', labelKey: 'custom_wellpaid' },
    { key: 'flexibility', labelKey: 'custom_flexibility' },
    { key: 'ecec', labelKey: 'custom_ecec' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{t('custom_title')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('custom_subtitle')}</p>
      </div>

      {/* Sliders Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <div className="space-y-4">
          {sliders.map(({ key, labelKey }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {t(labelKey)}
                </label>
                <span className="text-xs sm:text-sm font-mono font-bold text-teal-600 dark:text-teal-400 w-12 text-right">
                  {weights[key]}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights[key]}
                onChange={(e) =>
                  setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          ))}
        </div>

        {/* Total weight indicator & reset */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{t('custom_total_weight')}</span>
              <span className={totalWeight === 100 ? 'text-teal-600 dark:text-teal-400 font-mono font-bold' : 'text-amber-600 font-mono font-bold'}>
                {totalWeight} / 100
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalWeight === 100 ? 'bg-teal-500' : totalWeight > 100 ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, totalWeight)}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors border border-slate-200 dark:border-slate-600 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('custom_reset')}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Rankings List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden">
        {filtered.map((item, idx) => {
          const realRank = ranked.indexOf(item) + 1;
          const isMedal = realRank <= 3 && !search.trim();
          return (
            <div
              key={item.country.iso3}
              className={`flex items-center gap-3.5 px-4 py-3 transition-colors ${
                isMedal ? MEDAL_COLORS[realRank - 1] + ' border-l-4' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
              }`}
            >
              {/* Rank */}
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-7 text-right shrink-0">
                {search.trim() ? realRank : idx + 1}
              </span>

              {/* Country name */}
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 w-44 shrink-0 truncate">
                {getCountryName(item.country.name, item.country.iso2, lang)}
              </span>

              {/* Score bar */}
              <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 dark:bg-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${maxScore > 0 ? (item.score / maxScore) * 100 : 0}%` }}
                />
              </div>

              {/* Score value */}
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-slate-100 w-12 text-right shrink-0 tabular-nums">
                {item.score}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-xs sm:text-sm text-slate-400 italic">
            {t('no_countries')}
          </div>
        )}
      </div>
    </div>
  );
}
