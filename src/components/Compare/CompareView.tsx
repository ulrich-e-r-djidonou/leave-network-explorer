import { useState, useMemo } from "react";
import type { Country } from "../../types";
import { formatDuration, getGenderEqualityScore, getGenerosityScore } from "../../utils/calculations";
import { getComparableEntities } from "../../hooks/useCountryData";
import { LeaveTimeline } from "../Country/LeaveTimeline";
import { X, Search } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0d9488", "#e11d48", "#f59e0b", "#6366f1", "#22c55e", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b"];
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
        case "gen": row[c.iso2] = getGenerosityScore(c) / 5; break;
        case "geq": row[c.iso2] = getGenderEqualityScore(c) / 5; break;
      }
    });
    return row;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('compare_title')}</h2>

      {/* Country selector */}
      <div className="bg-white rounded-lg border p-4 mb-6">
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
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {search && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                {filtered.slice(0, 20).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => addCountry(e.country)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
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
          {/* Radar chart — only show for ≤ 6 for readability */}
          {selected.length <= 6 && (
            <div className="bg-white rounded-lg border p-4 mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('compare_radar_title')}</h3>
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
          <div className="bg-white rounded-lg border overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium sticky left-0 bg-slate-50">
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
                <CompareRow label={t('compare_row_generosity')} values={selected.map((c) => `${getGenerosityScore(c)}/100`)} />
                <CompareRow label={t('compare_row_gender')} values={selected.map((c) => `${getGenderEqualityScore(c)}/100`)} />
              </tbody>
            </table>
          </div>

          {/* Side-by-side timelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selected.map((c, i) => (
              <div key={c.iso2} className="bg-white rounded-lg border p-4">
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
      <td className="px-4 py-2 text-slate-600 sticky left-0 bg-white">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-2 text-center text-slate-800 font-medium whitespace-nowrap">{v}</td>
      ))}
    </tr>
  );
}
