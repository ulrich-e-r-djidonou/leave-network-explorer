import { useState, useMemo } from "react";
import { Download, ChevronUp, ChevronDown, Search, X } from "lucide-react";
import type { Country } from "../types";
import { useTranslation } from "../hooks/useTranslation";
import type { TranslationKey } from "../i18n/translations";
import { getCountryName } from "../utils/countryNames";

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
  getGenerosityScore,
  getGenderEqualityScore,
  getTotalLeaveMonths,
  formatDuration,
  REGIONS,
} from "../utils/calculations";

interface Props {
  countries: Country[];
}

type SortKey =
  | "name"
  | "region"
  | "mat_total"
  | "mat_wellpaid"
  | "mat_rate"
  | "pat_total"
  | "pat_wellpaid"
  | "pat_rate"
  | "par_total"
  | "par_wellpaid"
  | "total_paid"
  | "generosity"
  | "gender_equality";

type SortDir = "asc" | "desc";

interface ColumnDef {
  key: SortKey;
  labelFr: string;
  labelEn: string;
  getValue: (c: Country) => number | string | null;
  format?: (v: number | string | null, lang: "fr" | "en") => string;
}

function numOrZero(v: number | null | undefined): number {
  return v ?? 0;
}

const COLUMNS: ColumnDef[] = [
  {
    key: "name",
    labelFr: "Pays",
    labelEn: "Country",
    getValue: (c) => c.name,
  },
  {
    key: "region",
    labelFr: "Région",
    labelEn: "Region",
    getValue: (c) => c.region,
  },
  {
    key: "mat_total",
    labelFr: "Maternité (total)",
    labelEn: "Maternity (total)",
    getValue: (c) => numOrZero(c.maternity?.durationMonths?.total),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "mat_wellpaid",
    labelFr: "Maternité (bien payé)",
    labelEn: "Maternity (well-paid)",
    getValue: (c) => numOrZero(c.maternity?.durationMonths?.wellPaid),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "mat_rate",
    labelFr: "Maternité taux (%)",
    labelEn: "Maternity rate (%)",
    getValue: (c) => numOrZero(c.maternity?.paymentRate),
    format: (v) => (v as number) > 0 ? `${v}%` : "N/A",
  },
  {
    key: "pat_total",
    labelFr: "Paternité (total)",
    labelEn: "Paternity (total)",
    getValue: (c) => numOrZero(c.paternity?.durationMonths?.total),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "pat_wellpaid",
    labelFr: "Paternité (bien payé)",
    labelEn: "Paternity (well-paid)",
    getValue: (c) => numOrZero(c.paternity?.durationMonths?.wellPaid),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "pat_rate",
    labelFr: "Paternité taux (%)",
    labelEn: "Paternity rate (%)",
    getValue: (c) => numOrZero(c.paternity?.paymentRate),
    format: (v) => (v as number) > 0 ? `${v}%` : "N/A",
  },
  {
    key: "par_total",
    labelFr: "Parental (total)",
    labelEn: "Parental (total)",
    getValue: (c) => numOrZero(c.parental?.durationMonths?.total),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "par_wellpaid",
    labelFr: "Parental (bien payé)",
    labelEn: "Parental (well-paid)",
    getValue: (c) => numOrZero(c.parental?.durationMonths?.wellPaid),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "total_paid",
    labelFr: "Total payé",
    labelEn: "Total paid",
    getValue: (c) => getTotalLeaveMonths(c),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "generosity",
    labelFr: "Générosité (ETP)",
    labelEn: "Generosity (FTE)",
    getValue: (c) => getGenerosityScore(c),
    format: (v, lang) => formatDuration(v as number, lang),
  },
  {
    key: "gender_equality",
    labelFr: "Égalité genres (/100)",
    labelEn: "Gender equality (/100)",
    getValue: (c) => getGenderEqualityScore(c) ?? null,
    format: (v) => v !== null ? `${Math.round(Number(v))}` : 'N/A',
  },
];

function exportFilteredCSV(
  rows: Country[],
  lang: "fr" | "en",
  filename = "leave_network_data.csv"
) {
  const headers = COLUMNS.map((col) => (lang === "fr" ? col.labelFr : col.labelEn));

  const csvRows = rows.map((c) =>
    COLUMNS.map((col) => {
      const raw = col.getValue(c);
      const str = col.format ? col.format(raw, lang) : String(raw);
      return str.includes(",") || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );

  const csvContent = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTablePage({ countries }: Props) {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    let list = countries;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (regionFilter !== "All") {
      list = list.filter((c) => c.region === regionFilter);
    }
    return list;
  }, [countries, search, regionFilter]);

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortKey)!;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = col.getValue(a);
      const vb = col.getValue(b);
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc"
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      }
      const na = va as number;
      const nb = vb as number;
      return sortDir === "asc" ? na - nb : nb - na;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{t("data_title")}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t("data_subtitle")}</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region filter */}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {t((REGION_LABEL_KEYS[r] || r) as TranslationKey)}
            </option>
          ))}
        </select>

        {/* CSV export */}
        <button
          onClick={() => exportFilteredCSV(sorted, lang)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs ml-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {t("data_export_csv")}
        </button>

        {/* Count */}
        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
          {sorted.length} {lang === "fr" ? "pays" : "countries"}
        </span>
      </div>

      {/* Table container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto shadow-xs">
        <table className="w-full text-xs sm:text-sm border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
              {COLUMNS.map((col, i) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3.5 py-3 text-left font-semibold cursor-pointer select-none whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-600/80 transition-colors ${
                    i === 0
                      ? "sticky left-0 z-10 bg-slate-50 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600"
                      : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {lang === "fr" ? col.labelFr : col.labelEn}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="w-3.5 h-3.5 text-teal-600" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                      )
                    ) : (
                      <span className="w-3.5 h-3.5 inline-block opacity-20 hover:opacity-50">↕</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="text-center py-12 text-slate-400 italic font-sans"
                >
                  {t("data_no_results")}
                </td>
              </tr>
            ) : (
              sorted.map((country) => (
                <tr
                  key={country.iso2}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  {COLUMNS.map((col, colIdx) => {
                    const raw = col.getValue(country);
                    const display = col.key === 'name'
                      ? getCountryName(String(raw), country.iso2, lang)
                      : col.key === 'region'
                        ? t((REGION_LABEL_KEYS[String(raw)] || String(raw)) as TranslationKey)
                        : col.format
                          ? col.format(raw, lang)
                          : String(raw);
                    return (
                      <td
                        key={col.key}
                        className={`px-3.5 py-2.5 whitespace-nowrap ${
                          colIdx === 0
                            ? "sticky left-0 z-10 font-sans font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700"
                            : col.key === 'region'
                              ? "font-sans text-slate-500 dark:text-slate-400"
                              : "text-slate-700 dark:text-slate-300 tabular-nums"
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
