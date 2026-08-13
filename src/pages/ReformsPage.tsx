import { useState, useMemo } from "react";
import type { Country, RecentChange } from "../types";
import { REGIONS } from "../utils/calculations";
import { useTranslation } from "../hooks/useTranslation";
import type { TranslationKey } from "../i18n/translations";
import { Search } from "lucide-react";

const REGION_LABEL_KEYS: Record<string, string> = {
  All: 'region_all',
  Europe: 'region_europe',
  'North America': 'region_north_america',
  'South America': 'region_south_america',
  Asia: 'region_asia',
  Oceania: 'region_oceania',
  Africa: 'region_africa',
};

interface Props {
  countries: Country[];
}

const REFORM_TYPES = [
  "all",
  "expansion",
  "cutback",
  "recalibration",
  "introduction",
  "abolition",
] as const;

type ReformTypeFilter = (typeof REFORM_TYPES)[number];

interface FlatReform {
  countryName: string;
  region: string;
  change: RecentChange;
}

const TYPE_COLORS: Record<RecentChange["type"], { bg: string; text: string; border: string }> = {
  expansion: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  introduction: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
  recalibration: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  cutback: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  abolition: { bg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-800 dark:text-rose-200", border: "border-rose-300 dark:border-rose-700" },
};

const TYPE_DOT: Record<RecentChange["type"], string> = {
  expansion: "bg-emerald-500",
  introduction: "bg-sky-500",
  recalibration: "bg-amber-500",
  cutback: "bg-rose-500",
  abolition: "bg-rose-800",
};

export function ReformsPage({ countries }: Props) {
  const { t, lang } = useTranslation();
  const [typeFilter, setTypeFilter] = useState<ReformTypeFilter>("all");
  const [regionFilter, setRegionFilter] = useState("All");
  const [search, setSearch] = useState("");

  const allReforms: FlatReform[] = useMemo(() => {
    const result: FlatReform[] = [];
    countries.forEach((c) => {
      c.recentChanges.forEach((change) => {
        result.push({ countryName: c.name, region: c.region, change });
      });
    });
    return result;
  }, [countries]);

  const filtered = useMemo(() => {
    return allReforms.filter((r) => {
      const matchType = typeFilter === "all" || r.change.type === typeFilter;
      const matchRegion = regionFilter === "All" || r.region === regionFilter;
      const matchSearch =
        search === "" ||
        r.countryName.toLowerCase().includes(search.toLowerCase());
      return matchType && matchRegion && matchSearch;
    });
  }, [allReforms, typeFilter, regionFilter, search]);

  const typeTranslationKeys: Record<ReformTypeFilter, string> = {
    all: "reforms_all_types",
    expansion: "reforms_expansion",
    cutback: "reforms_cutback",
    recalibration: "reforms_recalibration",
    introduction: "reforms_introduction",
    abolition: "reforms_abolition",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{t("reforms_title")}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t("reforms_subtitle")}</p>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Type pills */}
        <div className="flex flex-wrap gap-2">
          {REFORM_TYPES.map((type) => {
            const isActive = typeFilter === type;
            const colors =
              type === "all"
                ? { bg: "bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100", text: "", border: "" }
                : TYPE_COLORS[type as RecentChange["type"]];
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? type === "all"
                      ? `${colors.bg} shadow-xs`
                      : `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-teal-500/30`
                    : "bg-white dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                }`}
              >
                {t(typeTranslationKeys[type] as any)}
              </button>
            );
          })}
        </div>

        {/* Region + search */}
        <div className="flex flex-wrap gap-3">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {t((REGION_LABEL_KEYS[r] || r) as TranslationKey)}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            />
          </div>
        </div>

        {/* Count */}
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {filtered.length} {t("reforms_count")} ({lang === 'fr' ? 'sur 2024–2025' : 'across 2024–2025'})
        </p>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-400 italic">{t("reforms_no_results")}</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8">
          {/* Vertical connecting line */}
          <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-4">
            {filtered.map((reform, i) => {
              const colors = TYPE_COLORS[reform.change.type];
              const dotColor = TYPE_DOT[reform.change.type];
              return (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${dotColor} shadow-xs`}
                  />

                  {/* Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-2.5 shadow-xs hover:border-teal-500/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                          {reform.countryName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {t(typeTranslationKeys[reform.change.type] as any)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{reform.region}</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{reform.change.leaveType}</p>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {reform.change.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
