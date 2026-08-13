import { useMemo, useState, useCallback, useRef } from "react";
import type { Country } from "../../types";
import {
  getGenderEqualityScore,
  getGenerosityScore,
  getTotalLeaveMonths,
  formatDuration,
} from "../../utils/calculations";
import { useTranslation } from "../../hooks/useTranslation";
import { getCountryName } from "../../utils/countryNames";
import { Download } from "lucide-react";
import { downloadChartAsPNG } from "../../utils/exportChart";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Label,
  ZAxis,
} from "recharts";

interface Props {
  countries: Country[];
  onCountryClick?: (country: Country) => void;
}

const REGION_COLORS: Record<string, string> = {
  Europe: "#3b82f6",
  "North America": "#ef4444",
  "South America": "#f59e0b",
  Asia: "#10b981",
  Oceania: "#8b5cf6",
  Africa: "#ec4899",
};

const REGION_KEYS: Record<string, string> = {
  Europe: "region_europe",
  "North America": "region_north_america",
  "South America": "region_south_america",
  Asia: "region_asia",
  Oceania: "region_oceania",
  Africa: "region_africa",
};

type ScatterPoint = {
  name: string;
  gender: number;
  generosity: number;
  region: string;
  iso2: string;
};

export function AnalyticsView({ countries, onCountryClick }: Props) {
  const { t, lang } = useTranslation();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const scatterRef = useRef<HTMLDivElement | null>(null);

  const scatterData = useMemo(() => {
    return countries.map((c) => ({
      name: getCountryName(c.name, c.iso2, lang),
      gender: getGenderEqualityScore(c) ?? 0,
      generosity: getGenerosityScore(c),
      region: c.region,
      iso2: c.iso2,
    }));
  }, [countries, lang]);

  const filteredData = useMemo(() => {
    if (!activeRegion) return scatterData;
    return scatterData.filter((d) => d.region === activeRegion);
  }, [scatterData, activeRegion]);

  const regions = useMemo(() => {
    const set = new Set(scatterData.map((d) => d.region));
    return [...set].sort();
  }, [scatterData]);

  const handlePointClick = useCallback(
    (point: ScatterPoint) => {
      const country = countries.find((c) => c.iso2 === point.iso2);
      if (country && onCountryClick) onCountryClick(country);
    },
    [countries, onCountryClick]
  );

  const gapData = useMemo(() => {
    return countries
      .filter((c) => c.ecec?.gapAfterLeaveMonths != null && c.ecec.gapAfterLeaveMonths !== 0)
      .map((c) => ({ name: getCountryName(c.name, c.iso2, lang), gap: c.ecec.gapAfterLeaveMonths! }))
      .sort((a, b) => b.gap - a.gap);
  }, [countries, lang]);

  const reformCounts = useMemo(() => {
    const counts: Record<string, number> = {
      expansion: 0, introduction: 0, recalibration: 0, cutback: 0, abolition: 0,
    };
    countries.forEach((c) => {
      (c.recentChanges || []).forEach((ch) => {
        if (counts[ch.type] !== undefined) counts[ch.type]++;
      });
    });
    return counts;
  }, [countries]);

  const noPaternity = useMemo(() => {
    return countries
      .filter(
        (c) => !c.paternity?.exists || !c.paternity?.durationMonths?.paid || c.paternity.durationMonths.paid === 0
      )
      .map((c) => getCountryName(c.name, c.iso2, lang));
  }, [countries, lang]);

  const noLeave = useMemo(() => {
    return countries.filter((c) => getTotalLeaveMonths(c) === 0).map((c) => getCountryName(c.name, c.iso2, lang));
  }, [countries, lang]);

  const maxGap = gapData.length > 0 ? Math.max(...gapData.map((d) => Math.abs(d.gap))) : 1;

  const reformTypes = [
    { key: "expansion", labelKey: "analytics_expansion" as const, text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
    { key: "introduction", labelKey: "analytics_introduction" as const, text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
    { key: "recalibration", labelKey: "analytics_recalibration" as const, text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
    { key: "cutback", labelKey: "analytics_cutback" as const, text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" },
    { key: "abolition", labelKey: "analytics_abolition" as const, text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-100 dark:bg-rose-900/40 border-rose-300 dark:border-rose-700" },
  ];

  /* Custom tooltip */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as ScatterPoint;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-3.5 py-2.5 text-xs">
        <p className="font-bold text-slate-900 dark:text-slate-100">{d.name}</p>
        <p className="text-slate-500 dark:text-slate-400">
          {t((REGION_KEYS[d.region] || d.region) as any)}
        </p>
        <div className="mt-2 space-y-1 font-mono">
          <p className="flex items-center justify-between gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-sans">{lang === "fr" ? "Générosité (ETP):" : "Generosity (FTE):"}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDuration(d.generosity, lang)}</span>
          </p>
          <p className="flex items-center justify-between gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-sans">{lang === "fr" ? "Égalité genres:" : "Gender equality:"}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{d.gender}/100</span>
          </p>
        </div>
      </div>
    );
  };

  /* Custom shape: circle + country name label */
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || cx == null || cy == null) return null;
    const d = payload as ScatterPoint;
    const isHovered = hoveredPoint === d.iso2;
    const showLabels = filteredData.length <= 20;
    const showLabel = showLabels || isHovered;
    const truncName = d.name.length > 14 ? d.name.slice(0, 12) + "\u2026" : d.name;
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 8 : 5.5}
          fill={REGION_COLORS[d.region] || "#94a3b8"}
          opacity={isHovered ? 1 : 0.85}
          stroke={isHovered ? "#0f172a" : "#ffffff"}
          strokeWidth={isHovered ? 2.5 : 1}
          style={{ cursor: onCountryClick ? "pointer" : "default" }}
        />
        {showLabel && (
          <text
            x={cx + 10}
            y={cy - 5}
            fill={isHovered ? "#0f172a" : "#64748b"}
            fontSize={isHovered ? 12 : 10}
            fontWeight={isHovered ? 700 : 500}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {truncName}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{t('analytics_title')}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {lang === 'fr' ? 'Analyses multidimensionnelles, écarts garde-congé et tendances des réformes.' : 'Multidimensional analysis, leave-to-care gaps, and reform dynamics.'}
        </p>
      </div>

      {/* Gender equality vs Generosity scatter */}
      <div ref={scatterRef} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
              {t('analytics_scatter_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('analytics_scatter_desc')}</p>
          </div>
          <button
            onClick={() => downloadChartAsPNG(scatterRef.current, 'gender-vs-generosity.png', lang)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title={lang === 'fr' ? 'Télécharger en PNG' : 'Download as PNG'}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Region filter chips */}
        <div className="flex flex-wrap gap-2 my-4">
          <button
            onClick={() => setActiveRegion(null)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              !activeRegion
                ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {t('region_all' as any)}
          </button>
          {regions.map((region) => {
            const isSel = activeRegion === region;
            return (
              <button
                key={region}
                onClick={() => setActiveRegion(isSel ? null : region)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSel
                    ? "text-white border-transparent shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
                style={isSel ? { backgroundColor: REGION_COLORS[region] } : {}}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: REGION_COLORS[region] }}
                />
                {t((REGION_KEYS[region] || region) as any)}
              </button>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={460}>
          <ScatterChart margin={{ top: 15, right: 30, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
            <XAxis
              type="number"
              dataKey="generosity"
              name={lang === "fr" ? "Générosité (ETP)" : "Generosity (FTE)"}
              tick={{ fontSize: 11 }}
              domain={[0, "auto"]}
            >
              <Label
                value={lang === "fr" ? "Générosité — ETP (mois)" : "Generosity — FTE (months)"}
                position="bottom"
                offset={12}
                style={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="gender"
              name={lang === "fr" ? "Égalité genres" : "Gender equality"}
              tick={{ fontSize: 11 }}
              domain={[50, 100]}
            >
              <Label
                value={lang === "fr" ? "Égalité genres (GII, /100)" : "Gender equality (GII, /100)"}
                angle={-90}
                position="insideLeft"
                offset={8}
                style={{ fontSize: 12, fill: "#64748b", textAnchor: "middle", fontWeight: 500 }}
              />
            </YAxis>
            <ZAxis range={[60, 60]} />
            <ReTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              data={filteredData}
              shape={renderDot}
              onClick={(data: any) => handlePointClick(data as ScatterPoint)}
              onMouseEnter={(data: any) => setHoveredPoint(data?.iso2)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {t((REGION_KEYS[region] || region) as any)}
            </div>
          ))}
        </div>
        {onCountryClick && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2 italic">
            {lang === "fr" ? "Cliquez sur un point pour voir le détail du pays" : "Click a point to see country details"}
          </p>
        )}
      </div>

      {/* Reform tracker */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          {t('analytics_reforms_title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('analytics_reforms_desc')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {reformTypes.map((rt) => (
            <div key={rt.key} className={`p-4 rounded-xl border ${rt.bg}`}>
              <div className={`text-3xl font-bold font-mono ${rt.text}`}>{reformCounts[rt.key] || 0}</div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">{t(rt.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gap analysis */}
      {gapData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
            {t('analytics_gap_title')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('analytics_gap_desc')}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {gapData.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-32 text-right shrink-0 truncate">{d.name}</span>
                <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700/60 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg ${d.gap > 0 ? "bg-rose-500" : "bg-emerald-500"}`}
                    style={{ width: `${(Math.abs(d.gap) / maxGap) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 w-20 tabular-nums">
                  {d.gap} {t('analytics_gap_months')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300 mb-3">
            {t('analytics_no_paternity')} ({noPaternity.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {noPaternity.map((name) => (
              <span key={name} className="text-xs font-medium bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-2xs">
                {name}
              </span>
            ))}
          </div>
        </div>
        {noLeave.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
              {t('analytics_no_leave')} ({noLeave.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {noLeave.map((name) => (
                <span key={name} className="text-xs font-medium bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 shadow-2xs">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
