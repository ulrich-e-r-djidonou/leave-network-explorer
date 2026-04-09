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
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{c.name}</h2>
          <p className="text-sm text-slate-300 mt-0.5">
            {c.region}
            {c.federal && ` | ${t('federal_state')}`}
            {c.subnationalVariations.length > 0 &&
              ` | ${t('variations')}: ${c.subnationalVariations.join(", ")}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/country/${c.iso2}`}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            {lang === 'fr' ? 'Page dédiée' : 'Full page'}
          </Link>
          {onCompare && (
            <button
              onClick={() => onCompare(c)}
              className="text-xs bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded transition-colors"
            >
              {t('compare_btn')}
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border-b">
        <div className="rounded-lg p-3 text-center text-teal-700 bg-teal-50">
          <p className="text-2xl font-bold">{formatDuration(generosityScore, lang)}</p>
          <p className="text-xs mt-0.5">{lang === 'fr' ? 'Générosité (ETP)' : 'Generosity (FTE)'}</p>
        </div>
        <ScoreBadge label={t('gender_equality')} score={genderScore} />
      </div>

      {/* Timeline */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('leave_timeline')}</h3>
        <LeaveTimeline country={c} />
      </div>

      {/* Leave details */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
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
            color="bg-blue-500"
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
          <div className="border rounded-lg p-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {t('childcare_leave')}
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              {formatDuration(c.childcareLeave.durationMonths, lang)} |{" "}
              {c.childcareLeave.paid ? t('paid') : t('unpaid')}
            </p>
            {c.childcareLeave.details && (
              <p className="text-xs text-slate-500 mt-1">{c.childcareLeave.details}</p>
            )}
          </div>
        )}

        {/* Other measures */}
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('other_measures')}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
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

        {/* ECEC */}
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('ecec')}</h4>
          <div className="text-sm text-slate-600 space-y-1">
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
          <div className="border rounded-lg p-3">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('recent_changes')}</h4>
            <div className="space-y-2">
              {c.recentChanges.map((ch, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChangeTypeBadge type={ch.type} t={t} />
                  <div>
                    <span className="text-xs text-slate-500 uppercase">{ch.leaveType}</span>
                    <p className="text-sm text-slate-600">{ch.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subnational variations */}
        {c.subnational && c.subnational.length > 0 && (
          <div className="border-2 border-indigo-200 rounded-lg p-3 bg-indigo-50/30">
            <h4 className="text-sm font-semibold text-indigo-800 mb-3">
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
    <div className="border rounded-lg p-3">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        {title}
      </h4>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
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
        <p className="text-xs text-slate-500 mt-2 italic">{leave.notes}</p>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-400">{label} : </span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}

function Chip({ label, active, detail }: { label: string; active: boolean; detail?: string }) {
  return (
    <div
      className={`px-2 py-1 rounded text-xs ${
        active
          ? "bg-teal-50 text-teal-700 border border-teal-200"
          : "bg-slate-50 text-slate-400 border border-slate-200"
      }`}
    >
      {active ? "+" : "−"} {label}
      {detail && <span className="ml-1 text-teal-500">({detail})</span>}
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number | null }) {
  const color =
    score === null
      ? "text-slate-500 bg-slate-50"
      : score >= 70
        ? "text-teal-700 bg-teal-50"
        : score >= 40
          ? "text-amber-700 bg-amber-50"
          : "text-rose-700 bg-rose-50";
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <p className="text-2xl font-bold">{score !== null ? score : 'N/A'}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </div>
  );
}

function ChangeTypeBadge({ type, t }: { type: string; t: (key: any) => string }) {
  const styles: Record<string, string> = {
    expansion: "bg-green-100 text-green-700",
    introduction: "bg-blue-100 text-blue-700",
    cutback: "bg-red-100 text-red-700",
    abolition: "bg-red-100 text-red-700",
    recalibration: "bg-amber-100 text-amber-700",
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
      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${styles[type] || "bg-slate-100 text-slate-600"}`}
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
    <div className="bg-white rounded border border-indigo-100 p-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
          {t(typeKeys[entity.type] as any) || entity.type}
        </span>
        <span className="text-sm font-medium text-slate-800">{entity.name}</span>
        {entity.code && <span className="text-xs text-slate-400">{entity.code}</span>}
      </div>

      {hasLeaveData && (
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          {entity.maternity?.exists && (
            <div className="bg-rose-50 rounded p-1.5">
              <p className="text-rose-600 font-medium">{t('timeline_maternity')}</p>
              <p className="text-slate-700">
                {formatDuration(entity.maternity.durationMonths?.total ?? null, lang)}
              </p>
              {entity.maternity.paymentRate && (
                <p className="text-slate-500">{entity.maternity.paymentRate}%</p>
              )}
            </div>
          )}
          {entity.paternity?.exists && (
            <div className="bg-blue-50 rounded p-1.5">
              <p className="text-blue-600 font-medium">{t('timeline_paternity')}</p>
              <p className="text-slate-700">
                {formatDuration(entity.paternity.durationMonths?.total ?? null, lang)}
              </p>
              {entity.paternity.paymentRate && (
                <p className="text-slate-500">{entity.paternity.paymentRate}%</p>
              )}
            </div>
          )}
          {entity.parental?.exists && (
            <div className="bg-amber-50 rounded p-1.5">
              <p className="text-amber-600 font-medium">{t('timeline_parental')}</p>
              <p className="text-slate-700">
                {formatDuration(entity.parental.durationMonths?.total ?? null, lang)}
              </p>
              {entity.parental.paymentRate && (
                <p className="text-slate-500">{entity.parental.paymentRate}%</p>
              )}
            </div>
          )}
        </div>
      )}

      {entity.details && <p className="text-xs text-slate-500 mt-1.5">{entity.details}</p>}
      {entity.notes && <p className="text-xs text-slate-500 mt-1 italic">{entity.notes}</p>}
    </div>
  );
}
