import { useState } from "react";
import type { Country } from "../../types";
import { formatDuration, getGenderEqualityScore, getGenerosityScore } from "../../utils/calculations";
import { LeaveTimeline } from "../Country/LeaveTimeline";
import { X, Search } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0d9488", "#e11d48", "#f59e0b", "#6366f1", "#22c55e"];

interface Props {
  countries: Country[];
}

export function CompareView({ countries }: Props) {
  const [selected, setSelected] = useState<Country[]>([]);
  const [search, setSearch] = useState("");

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((s) => s.iso2 === c.iso2)
  );

  const addCountry = (c: Country) => {
    if (selected.length < 5) {
      setSelected([...selected, c]);
      setSearch("");
    }
  };

  const removeCountry = (iso2: string) => {
    setSelected(selected.filter((c) => c.iso2 !== iso2));
  };

  // Build radar data
  const radarData = [
    { axis: "Maternite (mois)", key: "mat" },
    { axis: "Paternite (mois)", key: "pat" },
    { axis: "Parental (mois)", key: "par" },
    { axis: "Generosite", key: "gen" },
    { axis: "Egalite genres", key: "geq" },
  ].map((dim) => {
    const row: any = { axis: dim.axis };
    selected.forEach((c) => {
      switch (dim.key) {
        case "mat":
          row[c.iso2] = c.maternity.durationMonths.paid ?? 0;
          break;
        case "pat":
          row[c.iso2] = (c.paternity.durationMonths.paid ?? 0) * 5; // Scale up for visibility
          break;
        case "par":
          row[c.iso2] = c.parental.durationMonths.paid ?? 0;
          break;
        case "gen":
          row[c.iso2] = getGenerosityScore(c) / 5; // Scale to ~20
          break;
        case "geq":
          row[c.iso2] = getGenderEqualityScore(c) / 5;
          break;
      }
    });
    return row;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Comparer les pays
      </h2>

      {/* Country selector */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((c, i) => (
            <span
              key={c.iso2}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm text-white"
              style={{ backgroundColor: COLORS[i] }}
            >
              {c.name}
              <button
                onClick={() => removeCountry(c.iso2)}
                className="hover:opacity-75"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {selected.length === 0 && (
            <span className="text-sm text-slate-400">
              Selectionnez jusqu'a 5 pays a comparer
            </span>
          )}
        </div>
        {selected.length < 5 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ajouter un pays..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {search && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
                {filtered.slice(0, 10).map((c) => (
                  <button
                    key={c.iso2}
                    onClick={() => addCountry(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected.length >= 2 && (
        <>
          {/* Radar chart */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Profil comparatif
            </h3>
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
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed comparison table */}
          <div className="bg-white rounded-lg border overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">
                    Indicateur
                  </th>
                  {selected.map((c, i) => (
                    <th
                      key={c.iso2}
                      className="text-center px-4 py-3 font-medium"
                      style={{ color: COLORS[i] }}
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                <CompareRow
                  label="Maternite (total)"
                  values={selected.map((c) =>
                    formatDuration(c.maternity.durationMonths.total)
                  )}
                />
                <CompareRow
                  label="Maternite (bien paye)"
                  values={selected.map((c) =>
                    formatDuration(c.maternity.durationMonths.wellPaid)
                  )}
                />
                <CompareRow
                  label="Paternite (total)"
                  values={selected.map((c) =>
                    formatDuration(c.paternity.durationMonths.total)
                  )}
                />
                <CompareRow
                  label="Parental (total)"
                  values={selected.map((c) =>
                    formatDuration(c.parental.durationMonths.total)
                  )}
                />
                <CompareRow
                  label="Parental (bien paye)"
                  values={selected.map((c) =>
                    formatDuration(c.parental.durationMonths.wellPaid)
                  )}
                />
                <CompareRow
                  label="Type droit parental"
                  values={selected.map(
                    (c) => c.parental.entitlementType || "N/A"
                  )}
                />
                <CompareRow
                  label="Quota pere"
                  values={selected.map((c) =>
                    formatDuration(c.parental.fatherQuotaMonths)
                  )}
                />
                <CompareRow
                  label="Conge enfant malade"
                  values={selected.map((c) =>
                    c.otherMeasures.sickChildLeave.exists
                      ? c.otherMeasures.sickChildLeave.daysPerYear
                        ? `${c.otherMeasures.sickChildLeave.daysPerYear} j/an`
                        : "Oui"
                      : "Non"
                  )}
                />
                <CompareRow
                  label="Travail flexible"
                  values={selected.map((c) =>
                    c.otherMeasures.flexibleWork.rightToRequest
                      ? "Oui"
                      : "Non"
                  )}
                />
                <CompareRow
                  label="ECEC universel"
                  values={selected.map((c) =>
                    c.ecec.universalEntitlement ? "Oui" : "Non"
                  )}
                />
                <CompareRow
                  label="Score generosite"
                  values={selected.map(
                    (c) => `${getGenerosityScore(c)}/100`
                  )}
                />
                <CompareRow
                  label="Score egalite"
                  values={selected.map(
                    (c) => `${getGenderEqualityScore(c)}/100`
                  )}
                />
              </tbody>
            </table>
          </div>

          {/* Side-by-side timelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selected.map((c, i) => (
              <div key={c.iso2} className="bg-white rounded-lg border p-4">
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: COLORS[i] }}
                >
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

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <tr>
      <td className="px-4 py-2 text-slate-600">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-2 text-center text-slate-800 font-medium">
          {v}
        </td>
      ))}
    </tr>
  );
}
