import { useState, useMemo } from "react";
import type { Country, MapIndicator } from "../../types";
import {
  getIndicatorValue,
  formatDuration,
  getGenerosityScore,
  REGIONS,
  INDICATOR_LABEL_KEYS,
} from "../../utils/calculations";
import { getComparableEntities } from "../../hooks/useCountryData";
import { exportToCSV } from "../../utils/export";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";
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
import { Download } from "lucide-react";

interface Props {
  countries: Country[];
  onCountryClick: (country: Country) => void;
}

type RankingMetric = MapIndicator | "generosity";

export function RankingsView({ countries, onCountryClick }: Props) {
  const [metric, setMetric] = useState<RankingMetric>("total_leave");
  const [region, setRegion] = useState("All");
  const [showTop, setShowTop] = useState(20);
  const [includeSubnational, setIncludeSubnational] = useState(false);
  const { t, lang } = useTranslation();

  const METRICS: { value: RankingMetric; labelKey: string }[] = [
    { value: "maternity_total", labelKey: INDICATOR_LABEL_KEYS["maternity_total"] },
    { value: "maternity_wellPaid", labelKey: INDICATOR_LABEL_KEYS["maternity_wellPaid"] },
    { value: "paternity_total", labelKey: INDICATOR_LABEL_KEYS["paternity_total"] },
    { value: "paternity_wellPaid", labelKey: INDICATOR_LABEL_KEYS["paternity_wellPaid"] },
    { value: "parental_total", labelKey: INDICATOR_LABEL_KEYS["parental_total"] },
    { value: "parental_wellPaid", labelKey: INDICATOR_LABEL_KEYS["parental_wellPaid"] },
    { value: "total_leave", labelKey: INDICATOR_LABEL_KEYS["total_leave"] },
    { value: "gender_equality", labelKey: INDICATOR_LABEL_KEYS["gender_equality"] },
    { value: "generosity", labelKey: "ind_generosity" },
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
            : getIndicatorValue(c, metric as MapIndicator) ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, showTop);
  }, [countries, allEntities, metric, region, showTop, includeSubnational]);

  const isScore =
    metric.includes("gender") || metric.includes("generosity") || metric === "generosity";

  const chartData = ranked.map((r) => ({
    name: r.country.name,
    value: r.value,
    iso2: r.country.iso2,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('rankings_title')}</h2>

      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-slate-500 block mb-1">{t('rankings_indicator')}</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as RankingMetric)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {t(m.labelKey as TranslationKey)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">{t('rankings_region')}</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? t('rankings_all') : r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">{t('rankings_count')}</label>
          <select
            value={showTop}
            onChange={(e) => setShowTop(Number(e.target.value))}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={100}>{t('rankings_top_all')}</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={includeSubnational}
              onChange={(e) => setIncludeSubnational(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-slate-600">{t('rankings_include_sub')}</span>
          </label>
        </div>
        <div className="flex items-end ml-auto">
          <button
            onClick={() => exportToCSV(countries)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border p-4 mb-6 overflow-x-auto">
        <ResponsiveContainer width="100%" height={Math.max(400, ranked.length * 28)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="name" type="category" width={110} className="text-xs" tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) =>
                isScore ? `${Math.round(Number(value))}/100` : formatDuration(Number(value), lang)
              }
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i < 3 ? "#0d9488" : i < 10 ? "#14b8a6" : "#99f6e4"} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-medium w-10">{t('rankings_col_rank')}</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">{t('rankings_col_country')}</th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">{t('rankings_col_region')}</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">{t('rankings_col_value')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ranked.map((r, i) => (
              <tr
                key={r.country.iso2}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => onCountryClick(r.country)}
              >
                <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                <td className="px-4 py-2 text-slate-800 font-medium">{r.country.name}</td>
                <td className="px-4 py-2 text-slate-500">{r.country.region}</td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-800 font-medium">
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
