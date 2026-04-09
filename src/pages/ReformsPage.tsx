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
  expansion: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  introduction: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  recalibration: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  cutback: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  abolition: { bg: "bg-red-100", text: "text-red-900", border: "border-red-300" },
};

const TYPE_DOT: Record<RecentChange["type"], string> = {
  expansion: "bg-emerald-500",
  introduction: "bg-blue-500",
  recalibration: "bg-amber-500",
  cutback: "bg-red-500",
  abolition: "bg-red-800",
};

export function ReformsPage({ countries }: Props) {
  const { t } = useTranslation();
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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t("reforms_title")}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("reforms_subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Type pills */}
        <div className="flex flex-wrap gap-2">
          {REFORM_TYPES.map((type) => {
            const isActive = typeFilter === type;
            const colors =
              type === "all"
                ? { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" }
                : TYPE_COLORS[type as RecentChange["type"]];
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isActive
                    ? `${colors.bg} ${colors.text} ${colors.border} ring-1 ring-offset-1 ring-current`
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
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
            className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {t((REGION_LABEL_KEYS[r] || r) as TranslationKey)}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-slate-400">
          {filtered.length} {t("reforms_count")}
        </p>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400 italic">{t("reforms_no_results")}</p>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Vertical connecting line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-4">
            {filtered.map((reform, i) => {
              const colors = TYPE_COLORS[reform.change.type];
              const dotColor = TYPE_DOT[reform.change.type];
              return (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-3 w-3 h-3 rounded-full border-2 border-white ${dotColor} shadow-sm`}
                  />

                  {/* Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {reform.countryName}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {t(typeTranslationKeys[reform.change.type] as any)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{reform.region}</span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">{reform.change.leaveType}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
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
