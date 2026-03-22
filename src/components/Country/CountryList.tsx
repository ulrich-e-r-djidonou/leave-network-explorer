import { useState, useMemo } from "react";
import type { Country, MapIndicator } from "../../types";
import {
  getIndicatorValue,
  formatDuration,
  REGIONS,
} from "../../utils/calculations";
import { Search } from "lucide-react";

interface Props {
  countries: Country[];
  indicator: MapIndicator;
  onSelect: (country: Country) => void;
  selectedIso2?: string;
}

export function CountryList({
  countries,
  indicator,
  onSelect,
  selectedIso2,
}: Props) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("All");

  const filtered = useMemo(() => {
    return countries
      .filter((c) => {
        const matchSearch = c.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchRegion = region === "All" || c.region === region;
        return matchSearch && matchRegion;
      })
      .sort((a, b) => {
        const va = getIndicatorValue(a, indicator) ?? -1;
        const vb = getIndicatorValue(b, indicator) ?? -1;
        return vb - va;
      });
  }, [countries, search, region, indicator]);

  const isScore =
    indicator.includes("gender") || indicator.includes("generosity");

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-3 border-b border-slate-200 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un pays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "All" ? "Toutes les regions" : r}
            </option>
          ))}
        </select>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {filtered.map((c, i) => {
          const value = getIndicatorValue(c, indicator);
          return (
            <button
              key={c.iso2}
              onClick={() => onSelect(c)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                selectedIso2 === c.iso2 ? "bg-teal-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-5">{i + 1}</span>
                <span className="text-sm font-medium text-slate-700">
                  {c.name}
                </span>
                {c.subnational && c.subnational.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1 rounded">
                    {c.subnational.length}
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500 tabular-nums">
                {value !== null
                  ? isScore
                    ? `${Math.round(value)}/100`
                    : formatDuration(value)
                  : "N/A"}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-sm text-slate-400 text-center">
            Aucun pays trouve
          </p>
        )}
      </div>
    </div>
  );
}
