import { useMemo } from "react";
import type { Country, MapIndicator } from "../../types";
import { getIndicatorValue, formatDuration } from "../../utils/calculations";
import { useTranslation } from "../../hooks/useTranslation";

interface Props {
  countries: Country[];
  indicator: MapIndicator;
}

export function StatsBar({ countries, indicator }: Props) {
  const { t, lang } = useTranslation();

  const stats = useMemo(() => {
    const values = countries
      .map((c) => ({
        name: c.name,
        value: getIndicatorValue(c, indicator),
      }))
      .filter((v) => v.value !== null && v.value > 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    if (values.length === 0)
      return { avg: 0, median: 0, min: null, max: null, count: 0 };

    const nums = values.map((v) => v.value!);
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      avg,
      median,
      min: values[values.length - 1],
      max: values[0],
      count: values.length,
    };
  }, [countries, indicator]);

  const isScore = indicator.includes("gender") || indicator.includes("generosity");
  const fmt = (v: number) =>
    isScore ? `${Math.round(v)}/100` : formatDuration(v, lang);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      <StatCard label={t('stats_countries')} value={`${stats.count}`} />
      <StatCard label={t('stats_avg')} value={fmt(stats.avg)} />
      <StatCard label={t('stats_median')} value={fmt(stats.median)} />
      <StatCard
        label={t('stats_max')}
        value={stats.max ? `${fmt(stats.max.value!)}` : "N/A"}
        sub={stats.max?.name}
      />
      <StatCard
        label={t('stats_min')}
        value={stats.min ? `${fmt(stats.min.value!)}` : "N/A"}
        sub={stats.min?.name}
      />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
    </div>
  );
}
