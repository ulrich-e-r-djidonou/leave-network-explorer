import type { Country, SubnationalEntity } from "../../types";
import { formatDuration, getGenderEqualityScore, getGenerosityScore } from "../../utils/calculations";
import { LeaveTimeline } from "./LeaveTimeline";
import { X, ExternalLink } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { Link } from "react-router-dom";

interface Props {
  country: Country;
  onClose: () => void;
  onCompare?: (country: Country) => void;
}

export function CountryDetail({ country, onClose, onCompare }: Props) {
  const c = country;
  const { t, lang } = useTranslation();
  const genderScore = getGenderEqualityScore(c);
  const generosityScore = getGenerosityScore(c);

  const entitlementLabel = (type: string | null) => {
    if (type === 'individual') return t('individual');
    if (type === 'family') return t('family');
    if (type === 'mixed') return t('mixed');
    return t('na');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-start justify-between gap-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-white">{c.name}</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {c.region}
            {c.federal && ` • ${t('federal_state')}`}
            {c.subnationalVariations.length > 0 &&
              ` • ${t('variations')}: ${c.subnationalVariations.join(", ")}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/country/${c.iso2}`}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Page dédiée' : 'Full page'}</span>
          </Link>
          {onCompare && (
            <button
              onClick={() => onCompare(c)}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-xs"
            >
              {t('compare_btn')}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700">
        <div className="rounded-xl p-3.5 text-center bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/50">
          <p className="text-2xl font-bold font-mono text-teal-700 dark:text-teal-300">
            {formatDuration(generosityScore, lang)}
          </p>
          <p className="text-xs font-medium text-teal-800/80 dark:text-teal-400 mt-1">
            {lang === 'fr' ? 'Générosité (ETP)' : 'Generosity (FTE)'}
          </p>
        </div>
        <ScoreBadge label={t('gender_equality')} score={genderScore} />
      </div>

      {/* Timeline Section */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          {t('leave_timeline')}
        </h3>
        <LeaveTimeline country={c} />
      </div>

      {/* Leave details scrollable body */}
      <div className="p-4 sm:p-5 space-y-4 max-h-[55vh] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40">
        {c.maternity.exists && (
          <LeaveSection
            title={t('maternity_leave')}
            leave={c.maternity}
            color="bg-rose-500"
            lang={lang}
            t={t}
          />
        )}
        {c.paternity.exists && (
          <LeaveSection
            title={t('paternity_leave')}
            leave={c.paternity}
            color="bg-sky-500"
            lang={lang}
            t={t}
          />
        )}
        {c.parental.exists && (
          <LeaveSection
            title={t('parental_leave')}
            leave={c.parental}
            color="bg-amber-500"
            lang={lang}
            t={t}
            extra={
              <>
                <Detail label={t('entitlement_type')} value={entitlementLabel(c.parental.entitlementType)} />
                {c.parental.motherQuotaMonths !== null && (
                  <Detail label={t('mother_quota')} value={formatDuration(c.parental.motherQuotaMonths, lang)} />
                )}
                {c.parental.fatherQuotaMonths !== null && (
                  <Detail label={t('father_quota')} value={formatDuration(c.parental.fatherQuotaMonths, lang)} />
                )}
              </>
            }
          />
        )}

        {c.childcareLeave.exists && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {t('childcare_leave')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">
              {formatDuration(c.childcareLeave.durationMonths, lang)} •{" "}
              <span className={c.childcareLeave.paid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}>
                {c.childcareLeave.paid ? t('paid') : t('unpaid')}
              </span>
            </p>
            {c.childcareLeave.details && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{c.childcareLeave.details}</p>
            )}
          </div>
        )}

        {/* Other measures */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{t('other_measures')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <Chip
              label={t('sick_child_leave')}
              active={c.otherMeasures.sickChildLeave.exists}
              detail={
                c.otherMeasures.sickChildLeave.daysPerYear
                  ? `${c.otherMeasures.sickChildLeave.daysPerYear} ${lang === 'en' ? 'd/yr' : 'j/an'}`
                  : undefined
              }
            />
            <Chip label={t('breastfeeding')} active={c.otherMeasures.breastfeeding.exists} />
            <Chip label={t('flexible_work')} active={c.otherMeasures.flexibleWork.rightToRequest} />
            <Chip label={t('domestic_violence')} active={c.otherMeasures.domesticViolenceLeave.exists} />
            <Chip label={t('bereavement')} active={c.otherMeasures.bereavementLeave.exists} />
          </div>
        </div>

        {/* Pension rights */}
        {c.pensionRights && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('pension_rights')}</h4>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              c.pensionRights.continuesDuringLeave === true
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : c.pensionRights.continuesDuringLeave === false
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
            }`}>
              <span>
                {c.pensionRights.continuesDuringLeave === true
                  ? t('pension_yes')
                  : c.pensionRights.continuesDuringLeave === false
                    ? t('pension_no')
                    : t('pension_unknown')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic leading-relaxed">
              {lang === 'fr' ? c.pensionRights.details_fr : c.pensionRights.details_en}
            </p>
          </div>
        )}

        {/* ECEC */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('ecec')}</h4>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
            <Detail label={t('universal_entitlement')} value={c.ecec.universalEntitlement ? t('yes') : t('no')} />
            {c.ecec.entitlementAgeMonths !== null && (
              <Detail label={t('entitlement_age')} value={`${c.ecec.entitlementAgeMonths} ${lang === 'en' ? 'months' : 'mois'}`} />
            )}
            {c.ecec.gapAfterLeaveMonths !== null && (
              <Detail label={t('gap_after_leave')} value={formatDuration(c.ecec.gapAfterLeaveMonths, lang)} />
            )}
          </div>
        </div>

        {/* Recent changes */}
        {c.recentChanges.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{t('recent_changes')}</h4>
            <div className="space-y-2.5">
              {c.recentChanges.map((ch, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <ChangeTypeBadge type={ch.type} t={t} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{ch.leaveType}</span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{ch.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subnational variations */}
        {c.subnational && c.subnational.length > 0 && (
          <div className="border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4 bg-indigo-50/40 dark:bg-indigo-950/20">
            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
              {t('subnational_variations')} ({c.subnational.length})
            </h4>
            <div className="space-y-3">
              {c.subnational.map((sub, i) => (
                <SubnationalCard key={sub.code || i} entity={sub} lang={lang} t={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaveSection({
  title, leave, color, extra, lang, t,
}: {
  title: string;
  leave: any;
  color: string;
  extra?: React.ReactNode;
  lang: 'fr' | 'en';
  t: (key: any) => string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        {title}
      </h4>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
        <Detail label={t('total_duration')} value={formatDuration(leave.durationMonths.total, lang)} />
        <Detail label={t('paid_duration')} value={formatDuration(leave.durationMonths.paid, lang)} />
        <Detail label={t('well_paid')} value={formatDuration(leave.durationMonths.wellPaid, lang)} />
        <Detail
          label={t('rate')}
          value={leave.paymentRate ? `${leave.paymentRate}%` : leave.paymentType || t('na')}
        />
        <Detail label={t('mandatory')} value={leave.obligatory ? t('yes') : t('no')} />
        <Detail label={t('transferable')} value={leave.transferable ? t('yes') : t('no')} />
        <Detail label={t('part_time')} value={leave.flexPartTime ? t('yes') : t('no')} />
        <Detail label={t('in_blocks')} value={leave.flexBlocks ? t('yes') : t('no')} />
        {extra}
      </div>
      {leave.notes && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 italic border-t border-slate-100 dark:border-slate-700/60 pt-2 leading-relaxed">
          {leave.notes}
        </p>
      )}
      {leave.birthOrderVariation?.exists && (
        <div className="mt-2.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">{lang === 'fr' ? 'Varie selon le rang : ' : 'Varies by birth order: '}</span>
          {lang === 'fr' ? leave.birthOrderVariation.details_fr : leave.birthOrderVariation.details_en}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-slate-500 dark:text-slate-400 text-xs">{label} :</span>
      <span className="text-slate-800 dark:text-slate-200 font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Chip({ label, active, detail }: { label: string; active: boolean; detail?: string }) {
  return (
    <div
      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
          : "bg-slate-50 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
      }`}
    >
      <span className="font-bold">{active ? "✓" : "−"}</span> {label}
      {detail && <span className="ml-1 text-teal-600 dark:text-teal-400">({detail})</span>}
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number | null }) {
  const color =
    score === null
      ? "text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      : score >= 70
        ? "text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 border-teal-200/60 dark:border-teal-800/50"
        : score >= 40
          ? "text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/50"
          : "text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/50";
  return (
    <div className={`rounded-xl p-3.5 text-center border ${color}`}>
      <p className="text-2xl font-bold font-mono">{score !== null ? score : 'N/A'}</p>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}

function ChangeTypeBadge({ type, t }: { type: string; t: (key: any) => string }) {
  const styles: Record<string, string> = {
    expansion: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    introduction: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
    cutback: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    abolition: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700",
    recalibration: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  };
  const labelMap: Record<string, string> = {
    expansion: t('change_expansion'),
    introduction: t('change_introduction'),
    cutback: t('change_cutback'),
    abolition: t('change_abolition'),
    recalibration: t('change_recalibration'),
  };
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${styles[type] || "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
    >
      {labelMap[type] || type}
    </span>
  );
}

function SubnationalCard({ entity, lang, t }: { entity: SubnationalEntity; lang: 'fr' | 'en'; t: (key: any) => string }) {
  const typeKeys: Record<string, string> = {
    province: 'entity_province',
    state: 'entity_state',
    canton: 'entity_canton',
    entity: 'entity_entity',
    sector: 'entity_sector',
    region: 'entity_region',
    municipality: 'entity_municipality',
  };

  const hasLeaveData =
    entity.maternity?.exists || entity.paternity?.exists || entity.parental?.exists;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700 p-3.5 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
          {t(typeKeys[entity.type] as any) || entity.type}
        </span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{entity.name}</span>
        {entity.code && <span className="text-xs text-slate-400 font-mono">{entity.code}</span>}
      </div>

      {hasLeaveData && (
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          {entity.maternity?.exists && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-lg p-2">
              <p className="text-rose-700 dark:text-rose-300 font-semibold">{t('timeline_maternity')}</p>
              <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                {formatDuration(entity.maternity.durationMonths?.total ?? null, lang)}
              </p>
              {entity.maternity.paymentRate && (
                <p className="text-slate-500 dark:text-slate-400">{entity.maternity.paymentRate}%</p>
              )}
            </div>
          )}
          {entity.paternity?.exists && (
            <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 rounded-lg p-2">
              <p className="text-sky-700 dark:text-sky-300 font-semibold">{t('timeline_paternity')}</p>
              <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                {formatDuration(entity.paternity.durationMonths?.total ?? null, lang)}
              </p>
              {entity.paternity.paymentRate && (
                <p className="text-slate-500 dark:text-slate-400">{entity.paternity.paymentRate}%</p>
              )}
            </div>
          )}
          {entity.parental?.exists && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 rounded-lg p-2">
              <p className="text-amber-700 dark:text-amber-300 font-semibold">{t('timeline_parental')}</p>
              <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                {formatDuration(entity.parental.durationMonths?.total ?? null, lang)}
              </p>
              {entity.parental.paymentRate && (
                <p className="text-slate-500 dark:text-slate-400">{entity.parental.paymentRate}%</p>
              )}
            </div>
          )}
        </div>
      )}

      {entity.details && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{entity.details}</p>}
      {entity.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{entity.notes}</p>}
    </div>
  );
}
