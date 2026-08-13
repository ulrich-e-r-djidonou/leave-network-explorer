import { useState, useMemo } from "react";
import type { Country, MapIndicator } from "../../types";
import {
  getIndicatorValue,
  formatDuration,
  getGenerosityScore,
  getTotalWellPaidMonths,
  REGIONS,
  INDICATOR_LABEL_KEYS,
} from "../../utils/calculations";
import { getComparableEntities } from "../../hooks/useCountryData";
import { exportToCSV } from "../../utils/export";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";

const REGION_LABEL_KEYS: Record<string, string> = {
  All: 'region_all',
  Europe: 'region_europe',
  'North America': 'region_north_america',
  'South America': 'region_south_america',
  Asia: 'region_asia',
  Oceania: 'region_oceania',
  Africa: 'region_africa',
};

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Download, Info, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { getCountryName } from "../../utils/countryNames";

interface Props {
  countries: Country[];
  onCountryClick: (country: Country) => void;
}

type RankingMetric = MapIndicator | "generosity" | "wellpaid_total";

export function RankingsView({ countries, onCountryClick }: Props) {
  const [metric, setMetric] = useState<RankingMetric>("total_leave");
  const [region, setRegion] = useState("All");
  const [showTop, setShowTop] = useState(20);
  const [includeSubnational, setIncludeSubnational] = useState(false);
  const { t, lang } = useTranslation();

  const METRICS: { value: RankingMetric; labelKey: string }[] = [
    { value: "total_leave", labelKey: INDICATOR_LABEL_KEYS["total_leave"] },
    { value: "generosity", labelKey: "ind_generosity" },
    { value: "wellpaid_total", labelKey: "ind_wellpaid_total" },
    { value: "maternity_total", labelKey: INDICATOR_LABEL_KEYS["maternity_total"] },
    { value: "maternity_wellPaid", labelKey: INDICATOR_LABEL_KEYS["maternity_wellPaid"] },
    { value: "paternity_total", labelKey: INDICATOR_LABEL_KEYS["paternity_total"] },
    { value: "paternity_wellPaid", labelKey: INDICATOR_LABEL_KEYS["paternity_wellPaid"] },
    { value: "parental_total", labelKey: INDICATOR_LABEL_KEYS["parental_total"] },
    { value: "parental_wellPaid", labelKey: INDICATOR_LABEL_KEYS["parental_wellPaid"] },
    { value: "gender_equality", labelKey: INDICATOR_LABEL_KEYS["gender_equality"] },
  ];

  const allEntities = useMemo(() => getComparableEntities(countries), [countries]);

  const ranked = useMemo(() => {
    const source = includeSubnational ? allEntities.map((e) => e.country) : countries;
    return source
      .filter((c) => region === "All" || c.region === region)
      .map((c) => ({
        country: c,
        value:
          metric === "generosity"
            ? getGenerosityScore(c)
            : metric === "wellpaid_total"
            ? getTotalWellPaidMonths(c)
            : getIndicatorValue(c, metric as MapIndicator) ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, showTop);
  }, [countries, allEntities, metric, region, showTop, includeSubnational]);

  const isScore = metric.includes("gender");

  const chartData = ranked.map((r) => ({
    name: getCountryName(r.country.name, r.country.iso2, lang),
    value: r.value,
    iso2: r.country.iso2,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{t('rankings_title')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'fr' ? 'Classements et comparaisons par durée ou indicateur composite' : 'Rankings and comparisons by leave duration or composite index'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/custom-score"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t('nav_custom')}
          </Link>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-medium">
            {t('rankings_data_source')}
          </span>
        </div>
      </div>

      {/* Methodology Info Card */}
      <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
          <p>{t('rankings_methodology_note')}</p>
          <Link to="/methodology" className="text-blue-700 dark:text-blue-300 font-semibold hover:underline mt-1 inline-block">
            {t('rankings_see_methodology')} →
          </Link>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">{t('rankings_indicator')}</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as RankingMetric)}
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {t(m.labelKey as TranslationKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-36">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">{t('rankings_region')}</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {t((REGION_LABEL_KEYS[r] || r) as TranslationKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-28">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">{t('rankings_count')}</label>
          <select
            value={showTop}
            onChange={(e) => setShowTop(Number(e.target.value))}
            className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={100}>{t('rankings_top_all')}</option>
          </select>
        </div>

        <div className="flex items-center pb-2">
          <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSubnational}
              onChange={(e) => setIncludeSubnational(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">{t('rankings_include_sub')}</span>
          </label>
        </div>

        <div className="ml-auto pb-0.5">
          <button
            onClick={() => exportToCSV(countries)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors border border-slate-200 dark:border-slate-600 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Responsive Bar Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs overflow-x-auto">
        <ResponsiveContainer width="100%" height={Math.max(400, ranked.length * 30)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 130, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.25} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) =>
                isScore ? `${Math.round(Number(value))}/100` : formatDuration(Number(value), lang)
              }
              contentStyle={{ fontSize: '12px', borderRadius: '10px' }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? "#0d9488" : i < 3 ? "#14b8a6" : i < 10 ? "#2dd4bf" : "#99f6e4"}
                  cursor="pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rankings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/80 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold w-12">{t('rankings_col_rank')}</th>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">{t('rankings_col_country')}</th>
              <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">{t('rankings_col_region')}</th>
              <th className="text-right px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">{t('rankings_col_value')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {ranked.map((r, i) => (
              <tr
                key={r.country.iso2}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                onClick={() => onCountryClick(r.country)}
              >
                <td className="px-4 py-2.5 font-mono text-slate-400 dark:text-slate-500 font-medium">{i + 1}</td>
                <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100 font-medium">
                  {getCountryName(r.country.name, r.country.iso2, lang)}
                </td>
                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                  {t((REGION_LABEL_KEYS[r.country.region] || r.country.region) as TranslationKey)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-300">
                  {isScore ? `${Math.round(r.value)}/100` : formatDuration(r.value, lang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
