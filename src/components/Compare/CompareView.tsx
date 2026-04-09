import { useState, useMemo } from "react";
import type { Country } from "../../types";
import { formatDuration, getGenderEqualityScore, getGenerosityScore } from "../../utils/calculations";
import { getComparableEntities } from "../../hooks/useCountryData";
import { LeaveTimeline } from "../Country/LeaveTimeline";
import { X, Search } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// Modern, vibrant palette — each country gets a consistent color everywhere
const COLORS = [
  "#6366f1", // indigo
  "#f43f5e", // rose
  "#0ea5e9", // sky
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#64748b", // slate
];
const MAX_COMPARE = 10;

interface Props {
  countries: Country[];
}

export function CompareView({ countries }: Props) {
  const [selected, setSelected] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const { t, lang } = useTranslation();

  const allEntities = useMemo(() => getComparableEntities(countries), [countries]);

  const filtered = allEntities.filter(
    (e) =>
      e.label.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((s) => s.iso2 === e.id)
  );

  const addCountry = (c: Country) => {
    if (selected.length < MAX_COMPARE) {
      setSelected([...selected, c]);
      setSearch("");
    }
  };

  const removeCountry = (iso2: string) => {
    setSelected(selected.filter((c) => c.iso2 !== iso2));
  };

  const radarData = [
    { axis: t('compare_maternity'), key: "mat" },
    { axis: t('compare_paternity'), key: "pat" },
    { axis: t('compare_parental'), key: "par" },
    { axis: t('compare_generosity'), key: "gen" },
    { axis: t('compare_gender'), key: "geq" },
  ].map((dim) => {
    const row: any = { axis: dim.axis };
    selected.forEach((c) => {
      switch (dim.key) {
        case "mat": row[c.iso2] = c.maternity.durationMonths.paid ?? 0; break;
        case "pat": row[c.iso2] = (c.paternity.durationMonths.paid ?? 0) * 5; break;
        case "par": row[c.iso2] = c.parental.durationMonths.paid ?? 0; break;
        case "gen": row[c.iso2] = getGenerosityScore(c); break;
        case "geq": row[c.iso2] = (getGenderEqualityScore(c) ?? 0) / 5; break;
      }
    });
    return row;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">{t('compare_title')}</h2>

      {/* Country selector */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((c, i) => (
            <span
              key={c.iso2}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            >
              {c.name}
              <button onClick={() => removeCountry(c.iso2)} className="hover:opacity-75">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {selected.length === 0 && (
            <span className="text-sm text-slate-400">{t('compare_hint')}</span>
          )}
        </div>
        {selected.length < MAX_COMPARE && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('compare_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {search && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                {filtered.slice(0, 20).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => addCountry(e.country)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-slate-200 flex items-center gap-2"
                  >
                    {e.label}
                    {e.isSubnational && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 rounded">
                        {t('compare_subnational')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {selected.length >= MAX_COMPARE && (
          <p className="text-xs text-slate-400 mt-2">
            {lang === 'fr'
              ? `Maximum ${MAX_COMPARE} entités sélectionnées.`
              : `Maximum ${MAX_COMPARE} entities selected.`}
          </p>
        )}
      </div>

      {selected.length >= 2 && (
        <>
          {/* Separate bar charts — one per leave category */}
          {(() => {
            const categories = [
              { key: 'mat_total', titleKey: 'compare_row_mat_total' as TranslationKey, getValue: (c: Country) => c.maternity.durationMonths.total ?? 0 },
              { key: 'mat_wellpaid', titleKey: 'compare_row_mat_wellpaid' as TranslationKey, getValue: (c: Country) => c.maternity.durationMonths.wellPaid ?? 0 },
              { key: 'pat_total', titleKey: 'compare_row_pat_total' as TranslationKey, getValue: (c: Country) => c.paternity.durationMonths.total ?? 0 },
              { key: 'par_total', titleKey: 'compare_row_par_total' as TranslationKey, getValue: (c: Country) => c.parental.durationMonths.total ?? 0 },
              { key: 'par_wellpaid', titleKey: 'compare_row_par_wellpaid' as TranslationKey, getValue: (c: Country) => c.parental.durationMonths.wellPaid ?? 0 },
            ];
            return categories.map((cat) => {
              const chartData = selected.map((c, i) => ({
                name: c.name,
                value: cat.getValue(c),
                fill: COLORS[i % COLORS.length],
              }));
              const chartHeight = Math.max(180, selected.length * 40 + 40);
              return (
                <div key={cat.key} className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    {t(cat.titleKey)}
                  </h3>
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => formatDuration(v, lang)}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => [formatDuration(Number(value), lang), t(cat.titleKey)]}
                        contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 6, 6, 0]}
                        barSize={24}
                      >
                        {chartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            });
          })()}

          {/* Radar chart — only show for ≤ 6 for readability */}
          {selected.length <= 6 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 mb-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">{t('compare_radar_title')}</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="axis" className="text-xs" />
                  <PolarRadiusAxis className="text-xs" />
                  {selected.map((c, i) => (
                    <Radar
                      key={c.iso2}
                      name={c.name}
                      dataKey={c.iso2}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed comparison table */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-600 dark:text-slate-300 font-medium sticky left-0 bg-slate-50 dark:bg-slate-700">
                    {t('compare_col_indicator')}
                  </th>
                  {selected.map((c, i) => (
                    <th key={c.iso2} className="text-center px-4 py-3 font-medium whitespace-nowrap" style={{ color: COLORS[i % COLORS.length] }}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                <CompareRow label={t('compare_row_mat_total')} values={selected.map((c) => formatDuration(c.maternity.durationMonths.total, lang))} />
                <CompareRow label={t('compare_row_mat_wellpaid')} values={selected.map((c) => formatDuration(c.maternity.durationMonths.wellPaid, lang))} />
                <CompareRow label={t('compare_row_pat_total')} values={selected.map((c) => formatDuration(c.paternity.durationMonths.total, lang))} />
                <CompareRow label={t('compare_row_par_total')} values={selected.map((c) => formatDuration(c.parental.durationMonths.total, lang))} />
                <CompareRow label={t('compare_row_par_wellpaid')} values={selected.map((c) => formatDuration(c.parental.durationMonths.wellPaid, lang))} />
                <CompareRow label={t('compare_row_entitlement')} values={selected.map((c) => c.parental.entitlementType || t('na'))} />
                <CompareRow label={t('compare_row_father_quota')} values={selected.map((c) => formatDuration(c.parental.fatherQuotaMonths, lang))} />
                <CompareRow label={t('compare_row_sick')} values={selected.map((c) => c.otherMeasures.sickChildLeave.exists ? c.otherMeasures.sickChildLeave.daysPerYear ? `${c.otherMeasures.sickChildLeave.daysPerYear} ${lang === 'en' ? 'd/yr' : 'j/an'}` : t('yes') : t('no'))} />
                <CompareRow label={t('compare_row_flex')} values={selected.map((c) => c.otherMeasures.flexibleWork.rightToRequest ? t('yes') : t('no'))} />
                <CompareRow label={t('compare_row_ecec')} values={selected.map((c) => c.ecec.universalEntitlement ? t('yes') : t('no'))} />
                <CompareRow label={t('compare_row_generosity')} values={selected.map((c) => formatDuration(getGenerosityScore(c), lang))} />
                <CompareRow label={t('compare_row_gender')} values={selected.map((c) => { const s = getGenderEqualityScore(c); return s !== null ? `${s}/100` : 'N/A'; })} />
              </tbody>
            </table>
          </div>

          {/* Side-by-side timelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selected.map((c, i) => (
              <div key={c.iso2} className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: COLORS[i % COLORS.length] }}>
                  {c.name}
                </h3>
                <LeaveTimeline country={c} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="px-4 py-2 text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-800">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-2 text-center text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">{v}</td>
      ))}
    </tr>
  );
}
