import { useMemo, useState, useCallback } from "react";
import type { Country } from "../../types";
import {
  getGenderEqualityScore,
  getGenerosityScore,
  getTotalLeaveMonths,
  formatDuration,
} from "../../utils/calculations";
import { useTranslation } from "../../hooks/useTranslation";
import { getCountryName } from "../../utils/countryNames";
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
  Asia: "#22c55e",
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
    { key: "expansion", labelKey: "analytics_expansion" as const, text: "text-green-700" },
    { key: "introduction", labelKey: "analytics_introduction" as const, text: "text-blue-700" },
    { key: "recalibration", labelKey: "analytics_recalibration" as const, text: "text-amber-700" },
    { key: "cutback", labelKey: "analytics_cutback" as const, text: "text-red-700" },
    { key: "abolition", labelKey: "analytics_abolition" as const, text: "text-red-800" },
  ];

  /* Custom tooltip */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as ScatterPoint;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{d.name}</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          {t((REGION_KEYS[d.region] || d.region) as any)}
        </p>
        <div className="mt-1 space-y-0.5 text-xs">
          <p>
            <span className="text-slate-500 dark:text-slate-400">{lang === "fr" ? "Générosité (ETP)" : "Generosity (FTE)"}:</span>{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">{formatDuration(d.generosity, lang)}</span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">{lang === "fr" ? "Égalité genres" : "Gender equality"}:</span>{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">{d.gender}/100</span>
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
          r={isHovered ? 7 : 5}
          fill={REGION_COLORS[d.region] || "#94a3b8"}
          opacity={isHovered ? 1 : 0.8}
          stroke={isHovered ? "#0f172a" : "white"}
          strokeWidth={isHovered ? 2 : 1}
          style={{ cursor: onCountryClick ? "pointer" : "default" }}
        />
        {showLabel && (
          <text
            x={cx + 9}
            y={cy - 5}
            fill={isHovered ? "#0f172a" : "#64748b"}
            fontSize={isHovered ? 12 : 10}
            fontWeight={isHovered ? 600 : 400}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {truncName}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t('analytics_title')}</h2>

      {/* Gender equality vs Generosity scatter */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
          {t('analytics_scatter_title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('analytics_scatter_desc')}</p>

        {/* Region filter chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveRegion(null)}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              !activeRegion
                ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-800 dark:border-slate-200"
                : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
            }`}
          >
            {t('region_all' as any)}
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(activeRegion === region ? null : region)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors flex items-center gap-1.5 ${
                activeRegion === region
                  ? "text-white border-transparent"
                  : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
              }`}
              style={activeRegion === region ? { backgroundColor: REGION_COLORS[region] } : {}}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: REGION_COLORS[region] }}
              />
              {t((REGION_KEYS[region] || region) as any)}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={460}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                offset={10}
                style={{ fontSize: 12, fill: "#64748b" }}
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
                offset={5}
                style={{ fontSize: 12, fill: "#64748b", textAnchor: "middle" }}
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
        <div className="flex flex-wrap gap-3 justify-center mt-3">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {t((REGION_KEYS[region] || region) as any)}
            </div>
          ))}
        </div>
        {onCountryClick && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">
            {lang === "fr" ? "Cliquez sur un point pour voir le détail du pays" : "Click a point to see country details"}
          </p>
        )}
      </div>

      {/* Gap analysis */}
      {gapData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
            {t('analytics_gap_title')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('analytics_gap_desc')}</p>
          <div className="space-y-1.5">
            {gapData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 w-28 text-right shrink-0 truncate">{d.name}</span>
                <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded relative">
                  <div
                    className={`h-full rounded ${d.gap > 0 ? "bg-red-400" : "bg-green-400"}`}
                    style={{ width: `${(Math.abs(d.gap) / maxGap) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-16 tabular-nums">
                  {d.gap} {t('analytics_gap_months')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reform tracker */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
          {t('analytics_reforms_title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('analytics_reforms_desc')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          {reformTypes.map((rt) => (
            <div key={rt.key}>
              <div className={`text-3xl font-bold ${rt.text}`}>{reformCounts[rt.key] || 0}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t(rt.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300 mb-2">
            {t('analytics_no_paternity')} ({noPaternity.length})
          </h3>
          <div className="flex flex-wrap gap-1">
            {noPaternity.map((name) => (
              <span key={name} className="text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300">
                {name}
              </span>
            ))}
          </div>
        </div>
        {noLeave.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {t('analytics_no_leave')} ({noLeave.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {noLeave.map((name) => (
                <span key={name} className="text-xs bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
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
