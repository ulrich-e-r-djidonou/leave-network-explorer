import { useMemo } from "react";
import type { Country } from "../../types";
import {
  getGenderEqualityScore,
  getGenerosityScore,
  getTotalLeaveMonths,
} from "../../utils/calculations";

interface Props {
  countries: Country[];
}

export function AnalyticsView({ countries }: Props) {
  // Gender equality scatter: score vs generosity
  const scatterData = useMemo(() => {
    return countries.map((c) => ({
      name: c.name,
      gender: getGenderEqualityScore(c),
      generosity: getGenerosityScore(c),
      region: c.region,
    }));
  }, [countries]);

  // Gap analysis
  const gapData = useMemo(() => {
    return countries
      .filter(
        (c) =>
          c.ecec?.gapAfterLeaveMonths != null &&
          c.ecec.gapAfterLeaveMonths !== 0
      )
      .map((c) => ({
        name: c.name,
        gap: c.ecec.gapAfterLeaveMonths!,
      }))
      .sort((a, b) => b.gap - a.gap);
  }, [countries]);

  // Reform counts
  const reformCounts = useMemo(() => {
    const counts: Record<string, number> = {
      expansion: 0,
      introduction: 0,
      recalibration: 0,
      cutback: 0,
      abolition: 0,
    };
    countries.forEach((c) => {
      (c.recentChanges || []).forEach((ch) => {
        if (counts[ch.type] !== undefined) counts[ch.type]++;
      });
    });
    return counts;
  }, [countries]);

  // No paternity
  const noPaternity = useMemo(() => {
    return countries
      .filter(
        (c) =>
          !c.paternity?.exists ||
          !c.paternity?.durationMonths?.paid ||
          c.paternity.durationMonths.paid === 0
      )
      .map((c) => c.name);
  }, [countries]);

  // No leave
  const noLeave = useMemo(() => {
    return countries
      .filter((c) => getTotalLeaveMonths(c) === 0)
      .map((c) => c.name);
  }, [countries]);

  const REGION_COLORS: Record<string, string> = {
    Europe: "#3b82f6",
    "North America": "#ef4444",
    "South America": "#f59e0b",
    Asia: "#22c55e",
    Oceania: "#8b5cf6",
    Africa: "#ec4899",
  };

  const maxGap = gapData.length > 0 ? Math.max(...gapData.map((d) => Math.abs(d.gap))) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <h2 className="text-xl font-semibold text-slate-800">
        Analyses avancees
      </h2>

      {/* Gender equality vs Generosity scatter (pure SVG) */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">
          Egalite des genres vs Generosite
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Chaque point represente un pays. Les pays genereux ne sont pas
          necessairement egalitaires.
        </p>
        <svg
          viewBox="0 0 620 440"
          className="w-full"
          style={{ maxHeight: 420 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          {[0, 20, 40, 60, 80, 100].map((v) => (
            <g key={`grid-${v}`}>
              <line x1="60" y1={String(380 - v * 3.4)} x2="580" y2={String(380 - v * 3.4)} stroke="#e5e7eb" strokeDasharray="3 3" />
              <text x="55" y={String(384 - v * 3.4)} textAnchor="end" fill="#94a3b8" fontSize="10">{v}</text>
              <line x1={String(60 + v * 5.2)} y1="40" x2={String(60 + v * 5.2)} y2="380" stroke="#e5e7eb" strokeDasharray="3 3" />
              <text x={String(60 + v * 5.2)} y="396" textAnchor="middle" fill="#94a3b8" fontSize="10">{v}</text>
            </g>
          ))}
          {/* Axes */}
          <line x1="60" y1="380" x2="580" y2="380" stroke="#94a3b8" />
          <line x1="60" y1="40" x2="60" y2="380" stroke="#94a3b8" />
          <text x="320" y="420" textAnchor="middle" fill="#64748b" fontSize="11">Score de generosite</text>
          <text x="15" y="210" textAnchor="middle" fill="#64748b" fontSize="11" transform="rotate(-90, 15, 210)">Egalite des genres</text>
          {/* Data points */}
          {scatterData.map((d, i) => (
            <circle
              key={`pt-${i}`}
              cx={60 + d.generosity * 5.2}
              cy={380 - d.gender * 3.4}
              r="5"
              fill={REGION_COLORS[d.region] || "#94a3b8"}
              opacity="0.75"
              stroke="white"
              strokeWidth="0.5"
            >
              <title>{`${d.name} — Generosite: ${d.generosity}, Egalite: ${d.gender}`}</title>
            </circle>
          ))}
        </svg>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-1 text-xs text-slate-600">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {region}
            </div>
          ))}
        </div>
      </div>

      {/* Gap analysis */}
      {gapData.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">
            Ecart conge - garde d'enfants (ECEC)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Mois entre la fin du conge parental et le droit ECEC. Positif = periode sans couverture.
          </p>
          <div className="space-y-1.5">
            {gapData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-28 text-right shrink-0 truncate">{d.name}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded relative">
                  <div
                    className={`h-full rounded ${d.gap > 0 ? "bg-red-400" : "bg-green-400"}`}
                    style={{ width: `${(Math.abs(d.gap) / maxGap) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-14 tabular-nums">{d.gap} mois</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reform tracker */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">
          Reformes 2024/25 — Direction des changements
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Nombre de reformes par type parmi les 52 pays.
        </p>
        <div className="grid grid-cols-5 gap-4 text-center">
          {[
            { key: "expansion", label: "Expansion", text: "text-green-700" },
            { key: "introduction", label: "Introduction", text: "text-blue-700" },
            { key: "recalibration", label: "Recalibration", text: "text-amber-700" },
            { key: "cutback", label: "Restriction", text: "text-red-700" },
            { key: "abolition", label: "Abolition", text: "text-red-800" },
          ].map((t) => (
            <div key={t.key}>
              <div className={`text-3xl font-bold ${t.text}`}>{reformCounts[t.key] || 0}</div>
              <div className="text-xs text-slate-500 mt-1">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-rose-800 mb-2">
            Pays sans conge de paternite paye ({noPaternity.length})
          </h3>
          <div className="flex flex-wrap gap-1">
            {noPaternity.map((name) => (
              <span key={name} className="text-xs bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-700">
                {name}
              </span>
            ))}
          </div>
        </div>
        {noLeave.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Pays sans conge paye national ({noLeave.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {noLeave.map((name) => (
                <span key={name} className="text-xs bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700">
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
