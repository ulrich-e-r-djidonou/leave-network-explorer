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
      color: "bg-rose-400",
      subLabel: country.maternity.paymentRate
        ? `${country.maternity.paymentRate}%`
        : country.maternity.paymentType || undefined,
    });
  }

  if (country.paternity.exists && country.paternity.durationMonths.total) {
    segments.push({
      label: t('timeline_paternity'),
      months: country.paternity.durationMonths.total,
      color: "bg-blue-400",
      subLabel: country.paternity.paymentRate
        ? `${country.paternity.paymentRate}%`
        : country.paternity.paymentType || undefined,
    });
  }

  if (country.parental.exists && country.parental.durationMonths.total) {
    segments.push({
      label: t('timeline_parental'),
      months: country.parental.durationMonths.total,
      color: "bg-amber-400",
      subLabel: country.parental.paymentRate
        ? `${country.parental.paymentRate}%`
        : country.parental.paymentType || undefined,
    });
  }

  if (country.childcareLeave.exists && country.childcareLeave.durationMonths) {
    segments.push({
      label: t('timeline_childcare'),
      months: country.childcareLeave.durationMonths,
      color: "bg-green-400",
      subLabel: country.childcareLeave.paid ? t('paid') : t('unpaid'),
    });
  }

  if (segments.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic">{t('timeline_no_leave')}</p>
    );
  }

  const maxMonths = Math.max(...segments.map((s) => s.months), 1);

  return (
    <div className="space-y-2">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-16 text-right shrink-0">
            {seg.label}
          </span>
          <div className="flex-1 relative h-7">
            <div
              className={`${seg.color} h-full rounded flex items-center px-2 text-white text-xs font-medium transition-all`}
              style={{ width: `${Math.max(5, (seg.months / maxMonths) * 100)}%` }}
            >
              {formatDuration(seg.months, lang)}
              {seg.subLabel && (
                <span className="ml-1 opacity-75">({seg.subLabel})</span>
              )}
            </div>
          </div>
        </div>
      ))}
      {/* ECEC marker */}
      {country.ecec.entitlementAgeMonths !== null && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500 w-16 text-right shrink-0">ECEC</span>
          <div className="flex-1 text-xs text-slate-500">
            {t('timeline_ecec_right')} {country.ecec.entitlementAgeMonths} {t('timeline_months')}
            {country.ecec.gapAfterLeaveMonths !== null &&
              country.ecec.gapAfterLeaveMonths > 0 &&
              ` (${t('timeline_gap')}: ${formatDuration(country.ecec.gapAfterLeaveMonths, lang)})`}
          </div>
        </div>
      )}
    </div>
  );
}
