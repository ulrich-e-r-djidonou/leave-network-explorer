import { useState, useMemo } from "react";
import type { Country, MapIndicator } from "../../types";
import {
  getIndicatorValue,
  formatDuration,
  getGenerosityScore,
  REGIONS,
} from "../../utils/calculations";
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

interface Props {
  countries: Country[];
  onCountryClick: (country: Country) => void;
}

type RankingMetric = MapIndicator | "generosity";

const METRICS: { value: RankingMetric; label: string }[] = [
  { value: "maternity_total", label: "Conge maternite (total)" },
  { value: "maternity_wellPaid", label: "Conge maternite (bien paye)" },
  { value: "paternity_total", label: "Conge paternite (total)" },
  { value: "paternity_wellPaid", label: "Conge paternite (bien paye)" },
  { value: "parental_total", label: "Conge parental (total)" },
  { value: "parental_wellPaid", label: "Conge parental (bien paye)" },
  { value: "total_leave", label: "Total conges payes" },
  { value: "gender_equality", label: "Egalite des genres" },
  { value: "generosity", label: "Score de generosite" },
];

export function RankingsView({ countries, onCountryClick }: Props) {
  const [metric, setMetric] = useState<RankingMetric>("total_leave");
  const [region, setRegion] = useState("All");
  const [showTop, setShowTop] = useState(20);

  const ranked = useMemo(() => {
    return countries
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
  }, [countries, metric, region, showTop]);

  const isScore =
    metric.includes("gender") ||
    metric.includes("generosity") ||
    metric === "generosity";

  const chartData = ranked.map((r) => ({
    name: r.country.name,
    value: r.value,
    iso2: r.country.iso2,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Classements
      </h2>

      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-slate-500 block mb-1">
            Indicateur
          </label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as RankingMetric)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "Toutes" : r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">
            Nombre de pays
          </label>
          <select
            value={showTop}
            onChange={(e) => setShowTop(Number(e.target.value))}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={52}>Tous</option>
          </select>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <ResponsiveContainer width="100%" height={Math.max(400, ranked.length * 28)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" className="text-xs" />
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) =>
                isScore ? `${Math.round(Number(value))}/100` : formatDuration(Number(value))
              }
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i < 3
                      ? "#0d9488"
                      : i < 10
                        ? "#14b8a6"
                        : "#99f6e4"
                  }
                  cursor="pointer"
                />
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
              <th className="text-left px-4 py-3 text-slate-600 font-medium w-10">
                #
              </th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">
                Pays
              </th>
              <th className="text-left px-4 py-3 text-slate-600 font-medium">
                Region
              </th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">
                Valeur
              </th>
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
                <td className="px-4 py-2 text-slate-800 font-medium">
                  {r.country.name}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {r.country.region}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-slate-800 font-medium">
                  {isScore
                    ? `${Math.round(r.value)}/100`
                    : formatDuration(r.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
