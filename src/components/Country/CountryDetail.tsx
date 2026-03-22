import type { Country, SubnationalEntity } from "../../types";
import { formatDuration, getGenderEqualityScore, getGenerosityScore } from "../../utils/calculations";
import { LeaveTimeline } from "./LeaveTimeline";
import { X } from "lucide-react";

interface Props {
  country: Country;
  onClose: () => void;
  onCompare?: (country: Country) => void;
}

export function CountryDetail({ country, onClose, onCompare }: Props) {
  const c = country;
  const genderScore = getGenderEqualityScore(c);
  const generosityScore = getGenerosityScore(c);

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{c.name}</h2>
          <p className="text-sm text-slate-300 mt-0.5">
            {c.region}
            {c.federal && " | Etat federal"}
            {c.subnationalVariations.length > 0 &&
              ` | Variations: ${c.subnationalVariations.join(", ")}`}
          </p>
        </div>
        <div className="flex gap-2">
          {onCompare && (
            <button
              onClick={() => onCompare(c)}
              className="text-xs bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded transition-colors"
            >
              + Comparer
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border-b">
        <ScoreBadge label="Generosite" score={generosityScore} />
        <ScoreBadge label="Egalite des genres" score={genderScore} />
      </div>

      {/* Timeline visualization */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Chronologie des conges
        </h3>
        <LeaveTimeline country={c} />
      </div>

      {/* Leave details */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {c.maternity.exists && (
          <LeaveSection
            title="Conge de maternite"
            leave={c.maternity}
            color="bg-rose-500"
          />
        )}
        {c.paternity.exists && (
          <LeaveSection
            title="Conge de paternite"
            leave={c.paternity}
            color="bg-blue-500"
          />
        )}
        {c.parental.exists && (
          <LeaveSection
            title="Conge parental"
            leave={c.parental}
            color="bg-amber-500"
            extra={
              <>
                <Detail
                  label="Type de droit"
                  value={
                    c.parental.entitlementType === "individual"
                      ? "Individuel"
                      : c.parental.entitlementType === "family"
                        ? "Familial"
                        : c.parental.entitlementType === "mixed"
                          ? "Mixte"
                          : "N/A"
                  }
                />
                {c.parental.motherQuotaMonths !== null && (
                  <Detail
                    label="Quota mere"
                    value={formatDuration(c.parental.motherQuotaMonths)}
                  />
                )}
                {c.parental.fatherQuotaMonths !== null && (
                  <Detail
                    label="Quota pere"
                    value={formatDuration(c.parental.fatherQuotaMonths)}
                  />
                )}
              </>
            }
          />
        )}
        {c.childcareLeave.exists && (
          <div className="border rounded-lg p-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Conge de garde d'enfants
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              {formatDuration(c.childcareLeave.durationMonths)} |{" "}
              {c.childcareLeave.paid ? "Paye" : "Non paye"}
            </p>
            {c.childcareLeave.details && (
              <p className="text-xs text-slate-500 mt-1">
                {c.childcareLeave.details}
              </p>
            )}
          </div>
        )}

        {/* Other measures */}
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Autres mesures
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Chip
              label="Conge enfant malade"
              active={c.otherMeasures.sickChildLeave.exists}
              detail={
                c.otherMeasures.sickChildLeave.daysPerYear
                  ? `${c.otherMeasures.sickChildLeave.daysPerYear} j/an`
                  : undefined
              }
            />
            <Chip
              label="Allaitement"
              active={c.otherMeasures.breastfeeding.exists}
            />
            <Chip
              label="Travail flexible"
              active={c.otherMeasures.flexibleWork.rightToRequest}
            />
            <Chip
              label="Violence domestique"
              active={c.otherMeasures.domesticViolenceLeave.exists}
            />
            <Chip
              label="Conge deuil"
              active={c.otherMeasures.bereavementLeave.exists}
            />
          </div>
        </div>

        {/* ECEC */}
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Garde d'enfants (ECEC)
          </h4>
          <div className="text-sm text-slate-600 space-y-1">
            <Detail
              label="Droit universel"
              value={c.ecec.universalEntitlement ? "Oui" : "Non"}
            />
            {c.ecec.entitlementAgeMonths !== null && (
              <Detail
                label="Age d'acces"
                value={`${c.ecec.entitlementAgeMonths} mois`}
              />
            )}
            {c.ecec.gapAfterLeaveMonths !== null && (
              <Detail
                label="Ecart apres conge"
                value={formatDuration(c.ecec.gapAfterLeaveMonths)}
              />
            )}
          </div>
        </div>

        {/* Recent changes */}
        {c.recentChanges.length > 0 && (
          <div className="border rounded-lg p-3">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Changements recents (2024/25)
            </h4>
            <div className="space-y-2">
              {c.recentChanges.map((ch, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChangeTypeBadge type={ch.type} />
                  <div>
                    <span className="text-xs text-slate-500 uppercase">
                      {ch.leaveType}
                    </span>
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
              Variations infranationales ({c.subnational.length})
            </h4>
            <div className="space-y-3">
              {c.subnational.map((sub, i) => (
                <SubnationalCard key={sub.code || i} entity={sub} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaveSection({
  title,
  leave,
  color,
  extra,
}: {
  title: string;
  leave: any;
  color: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-3">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        {title}
      </h4>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <Detail
          label="Duree totale"
          value={formatDuration(leave.durationMonths.total)}
        />
        <Detail
          label="Duree payee"
          value={formatDuration(leave.durationMonths.paid)}
        />
        <Detail
          label="Bien paye"
          value={formatDuration(leave.durationMonths.wellPaid)}
        />
        <Detail
          label="Taux"
          value={
            leave.paymentRate
              ? `${leave.paymentRate}%`
              : leave.paymentType || "N/A"
          }
        />
        <Detail
          label="Obligatoire"
          value={leave.obligatory ? "Oui" : "Non"}
        />
        <Detail
          label="Transferable"
          value={leave.transferable ? "Oui" : "Non"}
        />
        <Detail
          label="Temps partiel"
          value={leave.flexPartTime ? "Oui" : "Non"}
        />
        <Detail
          label="En blocs"
          value={leave.flexBlocks ? "Oui" : "Non"}
        />
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
      <span className="text-slate-400">{label}: </span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}

function Chip({
  label,
  active,
  detail,
}: {
  label: string;
  active: boolean;
  detail?: string;
}) {
  return (
    <div
      className={`px-2 py-1 rounded text-xs ${
        active
          ? "bg-teal-50 text-teal-700 border border-teal-200"
          : "bg-slate-50 text-slate-400 border border-slate-200"
      }`}
    >
      {active ? "+" : "-"} {label}
      {detail && <span className="ml-1 text-teal-500">({detail})</span>}
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color =
    score >= 70
      ? "text-teal-700 bg-teal-50"
      : score >= 40
        ? "text-amber-700 bg-amber-50"
        : "text-rose-700 bg-rose-50";
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <p className="text-2xl font-bold">{score}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </div>
  );
}

function ChangeTypeBadge({
  type,
}: {
  type: string;
}) {
  const styles: Record<string, string> = {
    expansion: "bg-green-100 text-green-700",
    introduction: "bg-blue-100 text-blue-700",
    cutback: "bg-red-100 text-red-700",
    abolition: "bg-red-100 text-red-700",
    recalibration: "bg-amber-100 text-amber-700",
  };
  const labels: Record<string, string> = {
    expansion: "Expansion",
    introduction: "Introduction",
    cutback: "Restriction",
    abolition: "Abolition",
    recalibration: "Recalibration",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${styles[type] || "bg-slate-100 text-slate-600"}`}
    >
      {labels[type] || type}
    </span>
  );
}

function SubnationalCard({ entity }: { entity: SubnationalEntity }) {
  const typeLabels: Record<string, string> = {
    province: "Province",
    state: "Etat",
    canton: "Canton",
    entity: "Entite",
    sector: "Secteur",
    region: "Region",
    municipality: "Municipalite",
  };

  const hasLeaveData =
    entity.maternity?.exists || entity.paternity?.exists || entity.parental?.exists;

  return (
    <div className="bg-white rounded border border-indigo-100 p-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
          {typeLabels[entity.type] || entity.type}
        </span>
        <span className="text-sm font-medium text-slate-800">
          {entity.name}
        </span>
        {entity.code && (
          <span className="text-xs text-slate-400">{entity.code}</span>
        )}
      </div>

      {hasLeaveData && (
        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
          {entity.maternity?.exists && (
            <div className="bg-rose-50 rounded p-1.5">
              <p className="text-rose-600 font-medium">Maternite</p>
              <p className="text-slate-700">
                {formatDuration(entity.maternity.durationMonths?.total ?? null)}
              </p>
              {entity.maternity.paymentRate && (
                <p className="text-slate-500">{entity.maternity.paymentRate}%</p>
              )}
            </div>
          )}
          {entity.paternity?.exists && (
            <div className="bg-blue-50 rounded p-1.5">
              <p className="text-blue-600 font-medium">Paternite</p>
              <p className="text-slate-700">
                {formatDuration(entity.paternity.durationMonths?.total ?? null)}
              </p>
              {entity.paternity.paymentRate && (
                <p className="text-slate-500">{entity.paternity.paymentRate}%</p>
              )}
            </div>
          )}
          {entity.parental?.exists && (
            <div className="bg-amber-50 rounded p-1.5">
              <p className="text-amber-600 font-medium">Parental</p>
              <p className="text-slate-700">
                {formatDuration(entity.parental.durationMonths?.total ?? null)}
              </p>
              {entity.parental.paymentRate && (
                <p className="text-slate-500">{entity.parental.paymentRate}%</p>
              )}
            </div>
          )}
        </div>
      )}

      {entity.details && (
        <p className="text-xs text-slate-500 mt-1.5">{entity.details}</p>
      )}
      {entity.notes && (
        <p className="text-xs text-slate-500 mt-1 italic">{entity.notes}</p>
      )}
    </div>
  );
}
