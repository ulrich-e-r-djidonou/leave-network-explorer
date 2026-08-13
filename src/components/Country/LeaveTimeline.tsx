import type { Country } from "../../types";
import { formatDuration } from "../../utils/calculations";
import { useTranslation } from "../../hooks/useTranslation";

interface Props {
  country: Country;
}

interface Segment {
  label: string;
  months: number;
  color: string;
  subLabel?: string;
}

export function LeaveTimeline({ country }: Props) {
  const { t, lang } = useTranslation();
  const segments: Segment[] = [];

  if (country.maternity.exists && country.maternity.durationMonths.total) {
    segments.push({
      label: t('timeline_maternity'),
      months: country.maternity.durationMonths.total,
      color: "bg-rose-500",
      subLabel: country.maternity.paymentRate
        ? `${country.maternity.paymentRate}%`
        : country.maternity.paymentType || undefined,
    });
  }

  if (country.paternity.exists && country.paternity.durationMonths.total) {
    segments.push({
      label: t('timeline_paternity'),
      months: country.paternity.durationMonths.total,
      color: "bg-sky-500",
      subLabel: country.paternity.paymentRate
        ? `${country.paternity.paymentRate}%`
        : country.paternity.paymentType || undefined,
    });
  }

  if (country.parental.exists && country.parental.durationMonths.total) {
    segments.push({
      label: t('timeline_parental'),
      months: country.parental.durationMonths.total,
      color: "bg-amber-500",
      subLabel: country.parental.paymentRate
        ? `${country.parental.paymentRate}%`
        : country.parental.paymentType || undefined,
    });
  }

  if (country.childcareLeave.exists && country.childcareLeave.durationMonths) {
    segments.push({
      label: t('timeline_childcare'),
      months: country.childcareLeave.durationMonths,
      color: "bg-emerald-500",
      subLabel: country.childcareLeave.paid ? t('paid') : t('unpaid'),
    });
  }

  if (segments.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic py-2">{t('timeline_no_leave')}</p>
    );
  }

  const maxMonths = Math.max(...segments.map((s) => s.months), 1);

  return (
    <div className="space-y-2.5">
      {segments.map((seg, i) => {
        const pct = (seg.months / maxMonths) * 100;
        const isNarrow = pct < 40;
        const barText = `${formatDuration(seg.months, lang)}${seg.subLabel ? ` (${seg.subLabel})` : ''}`;
        return (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-16 text-right shrink-0">
              {seg.label}
            </span>
            <div className="flex-1 relative h-7 bg-slate-100 dark:bg-slate-700/60 rounded-lg overflow-hidden flex items-center p-0.5">
              <div
                className={`${seg.color} h-full rounded-md shrink-0 flex items-center transition-all duration-300 ${isNarrow ? 'justify-end pr-1' : 'px-2.5 justify-start text-white text-xs font-semibold'}`}
                style={{ width: `${Math.max(6, pct)}%` }}
              >
                {!isNarrow && <span className="truncate">{barText}</span>}
              </div>
              {isNarrow && (
                <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {barText}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {/* ECEC marker */}
      {country.ecec.entitlementAgeMonths !== null && (
        <div className="flex items-center gap-2.5 mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 text-right shrink-0">ECEC</span>
          <div className="flex-1 text-xs text-slate-600 dark:text-slate-400">
            {t('timeline_ecec_right')}{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {country.ecec.entitlementAgeMonths} {t('timeline_months')}
            </span>
            {country.ecec.gapAfterLeaveMonths !== null &&
              country.ecec.gapAfterLeaveMonths > 0 &&
              ` (${t('timeline_gap')}: ${formatDuration(country.ecec.gapAfterLeaveMonths, lang)})`}
          </div>
        </div>
      )}
    </div>
  );
}
