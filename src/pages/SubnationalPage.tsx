import { useState, useMemo } from "react";
import type { Country, SubnationalEntity } from "../types";
import { formatDuration } from "../utils/calculations";
import { useTranslation } from "../hooks/useTranslation";
import { Search } from "lucide-react";

interface Props {
  countries: Country[];
}

interface FlatEntity {
  entity: SubnationalEntity;
  countryName: string;
  countryIso2: string;
}

export function SubnationalPage({ countries }: Props) {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  // Flatten all subnational entities
  const allEntities: FlatEntity[] = useMemo(() => {
    const result: FlatEntity[] = [];
    countries.forEach((c) => {
      (c.subnational || []).forEach((sub) => {
        result.push({ entity: sub, countryName: c.name, countryIso2: c.iso2 });
      });
    });
    return result;
  }, [countries]);

  // Countries that have subnational data
  const countriesWithSub = useMemo(() => {
    return countries.filter((c) => c.subnational && c.subnational.length > 0);
  }, [countries]);

  const filtered = useMemo(() => {
    return allEntities.filter((fe) => {
      const matchSearch =
        fe.entity.name.toLowerCase().includes(search.toLowerCase()) ||
        fe.countryName.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter === "all" || fe.countryIso2 === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [allEntities, search, countryFilter]);

  // Quebec data
  const quebec = useMemo(() => {
    const canada = countries.find((c) => c.iso2 === "CA");
    return canada?.subnational?.find((s) => s.code === "CA-QC");
  }, [countries]);

  const canada = countries.find((c) => c.iso2 === "CA");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{t('sub_title')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('sub_subtitle')}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {allEntities.length} {lang === 'fr' ? 'entités dans' : 'entities across'} {countriesWithSub.length} {lang === 'fr' ? 'pays' : 'countries'}
        </p>
      </div>

      {/* ===== QUÉBEC SPOTLIGHT ===== */}
      {quebec && canada && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🍁</span>
                <h3 className="text-lg font-bold text-indigo-900">
                  {t('sub_quebec_highlight')}
                </h3>
                <span className="text-xs bg-indigo-700 text-white px-2 py-0.5 rounded-full">
                  {lang === 'fr' ? 'Régime distinct' : 'Distinct regime'}
                </span>
              </div>
              <p className="text-sm text-indigo-700">
                {lang === 'fr'
                  ? 'Régime québécois de parentalité (RQAP) — le plus généreux au Canada'
                  : 'Quebec Parental Insurance Plan (QPIP) — the most generous in Canada'}
              </p>
            </div>
          </div>

          {/* Key differentiators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KeyStat
              label={lang === 'fr' ? 'Congé paternité' : 'Paternity leave'}
              qc={formatDuration(quebec.paternity?.durationMonths?.total ?? null, lang)}
              federal={lang === 'fr' ? 'Inexistant' : 'None'}
              highlight
            />
            <KeyStat
              label={lang === 'fr' ? 'Maternité payée' : 'Paid maternity'}
              qc={formatDuration(quebec.maternity?.durationMonths?.paid ?? null, lang)}
              federal={formatDuration(canada.maternity?.durationMonths?.paid ?? null, lang)}
            />
            <KeyStat
              label={lang === 'fr' ? 'Taux de remplacement' : 'Replacement rate'}
              qc="70–75%"
              federal="55%"
              highlight
            />
            <KeyStat
              label={lang === 'fr' ? "Seuil d'admissibilité" : 'Eligibility threshold'}
              qc={lang === 'fr' ? '2 000 $ de revenus' : 'CAD 2,000 earnings'}
              federal={lang === 'fr' ? '600 heures travaillées' : '600 hours worked'}
            />
          </div>

          {/* Detailed comparison table */}
          <div className="bg-white rounded-xl border border-indigo-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">
                    {lang === 'fr' ? 'Caractéristique' : 'Feature'}
                  </th>
                  <th className="text-center px-4 py-3 text-indigo-700 font-semibold">
                    🍁 {lang === 'fr' ? 'Québec (RQAP)' : 'Quebec (QPIP)'}
                  </th>
                  <th className="text-center px-4 py-3 text-slate-600 font-medium">
                    🇨🇦 {lang === 'fr' ? 'Autres provinces (AE)' : 'Other provinces (EI)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <CompareRow
                  label={lang === 'fr' ? 'Congé maternité' : 'Maternity leave'}
                  qc={`${formatDuration(quebec.maternity?.durationMonths?.total ?? null, lang)} — ${quebec.maternity?.paymentRate ?? 0}%`}
                  fed={`${formatDuration(canada.maternity?.durationMonths?.total ?? null, lang)} — ${canada.maternity?.paymentRate ?? 0}%`}
                />
                <CompareRow
                  label={lang === 'fr' ? 'Congé paternité' : 'Paternity leave'}
                  qc={`${formatDuration(quebec.paternity?.durationMonths?.total ?? null, lang)} — ${quebec.paternity?.paymentRate ?? 0}%`}
                  fed={lang === 'fr' ? '— (inexistant)' : '— (none)'}
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Congé parental (couple)' : 'Parental leave (couple)'}
                  qc={lang === 'fr'
                    ? `${formatDuration(quebec.parental?.durationMonths?.total ?? null, lang)} (base) + bonus partage`
                    : `${formatDuration(quebec.parental?.durationMonths?.total ?? null, lang)} (basic) + sharing bonus`}
                  fed={formatDuration(canada.parental?.durationMonths?.total ?? null, lang)}
                />
                <CompareRow
                  label={lang === 'fr' ? 'Taux de remplacement' : 'Replacement rate'}
                  qc={lang === 'fr' ? '70% (régime de base) / 75% (régime particulier)' : '70% (basic plan) / 75% (special plan)'}
                  fed="55%"
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Période de carence' : 'Waiting period'}
                  qc={lang === 'fr' ? 'Aucune' : 'None'}
                  fed={lang === 'fr' ? '1 semaine' : '1 week'}
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Travailleurs autonomes' : 'Self-employed workers'}
                  qc={lang === 'fr' ? 'Couverts automatiquement' : 'Covered automatically'}
                  fed={lang === 'fr' ? 'Adhésion volontaire' : 'Voluntary opt-in'}
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Plafond assurable (2025)' : 'Insurable ceiling (2025)'}
                  qc="CAD 98 000"
                  fed="CAD 65 700"
                />
                <CompareRow
                  label={lang === 'fr' ? 'Bonus partage parental' : 'Parental sharing bonus'}
                  qc={lang === 'fr'
                    ? '+4 sem. (base) / +3 sem. (particulier) si chaque parent prend ≥ 8 sem. / 6 sem.'
                    : '+4 wk. (basic) / +3 wk. (special) if each parent takes ≥ 8 wk. / 6 wk.'}
                  fed={lang === 'fr' ? 'Aucun' : 'None'}
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Parents seuls' : 'Single parents'}
                  qc={lang === 'fr' ? '+5 sem. (base) / +3 sem. (particulier)' : '+5 wk. (basic) / +3 wk. (special)'}
                  fed={lang === 'fr' ? 'Aucune disposition spécifique' : 'No specific provision'}
                />
                <CompareRow
                  label={lang === 'fr' ? 'Naissances multiples' : 'Multiple births'}
                  qc={lang === 'fr' ? '+5 sem. par parent (base) / +3 sem. (particulier)' : '+5 wk. per parent (basic) / +3 wk. (special)'}
                  fed={lang === 'fr' ? 'Aucune disposition spécifique' : 'No specific provision'}
                />
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {quebec.notes && (
            <div className="bg-indigo-50/60 rounded-lg p-3 text-xs text-indigo-800 leading-relaxed">
              <strong>{lang === 'fr' ? 'Note : ' : 'Note: '}</strong>{quebec.notes}
            </div>
          )}
        </div>
      )}

      {/* ===== ALL SUBNATIONAL ENTITIES ===== */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-800">
          {lang === 'fr' ? 'Toutes les entités infranationales' : 'All subnational entities'}
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'fr' ? 'Rechercher une entité...' : 'Search entity...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">{t('sub_filter_all')}</option>
            {countriesWithSub.map((c) => (
              <option key={c.iso2} value={c.iso2}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Entity cards */}
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 italic">{t('sub_no_data')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((fe, i) => (
              <EntityCard
                key={`${fe.countryIso2}-${fe.entity.code || i}`}
                entity={fe.entity}
                countryName={fe.countryName}
                lang={lang}
                t={t}
                isQuebec={fe.entity.code === 'CA-QC'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KeyStat({
  label, qc, federal, highlight,
}: {
  label: string; qc: string; federal: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-indigo-100 border border-indigo-200' : 'bg-white border border-slate-200'}`}>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <p className={`text-base font-bold ${highlight ? 'text-indigo-800' : 'text-slate-800'}`}>{qc}</p>
      <p className="text-xs text-slate-400 mt-1">vs {federal}</p>
    </div>
  );
}

function CompareRow({ label, qc, fed, highlight }: {
  label: string; qc: string; fed: string; highlight?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-indigo-50/40' : ''}>
      <td className="px-4 py-2.5 text-slate-600 text-xs">{label}</td>
      <td className="px-4 py-2.5 text-center text-xs font-medium text-indigo-800">{qc}</td>
      <td className="px-4 py-2.5 text-center text-xs text-slate-500">{fed}</td>
    </tr>
  );
}

function EntityCard({ entity, countryName, lang, t, isQuebec }: {
  entity: SubnationalEntity;
  countryName: string;
  lang: 'fr' | 'en';
  t: (key: any) => string;
  isQuebec: boolean;
}) {
  const typeKeys: Record<string, string> = {
    province: 'entity_province', state: 'entity_state', canton: 'entity_canton',
    entity: 'entity_entity', sector: 'entity_sector', region: 'entity_region',
    municipality: 'entity_municipality',
  };

  const hasLeave = entity.maternity?.exists || entity.paternity?.exists || entity.parental?.exists;

  return (
    <div className={`bg-white rounded-xl border p-4 space-y-3 ${isQuebec ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {isQuebec && <span className="text-base">🍁</span>}
            <span className="text-sm font-semibold text-slate-800">{entity.name}</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {t(typeKeys[entity.type] as any) || entity.type}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{countryName}</p>
        </div>
        {entity.code && (
          <span className="text-[10px] text-slate-400 shrink-0">{entity.code}</span>
        )}
      </div>

      {hasLeave && (
        <div className="grid grid-cols-3 gap-2">
          {entity.maternity?.exists && (
            <LeaveChip
              label={lang === 'fr' ? 'Maternité' : 'Maternity'}
              duration={formatDuration(entity.maternity.durationMonths?.total ?? null, lang)}
              rate={entity.maternity.paymentRate}
              color="rose"
            />
          )}
          {entity.paternity?.exists && (
            <LeaveChip
              label={lang === 'fr' ? 'Paternité' : 'Paternity'}
              duration={formatDuration(entity.paternity.durationMonths?.total ?? null, lang)}
              rate={entity.paternity.paymentRate}
              color="blue"
            />
          )}
          {entity.parental?.exists && (
            <LeaveChip
              label={lang === 'fr' ? 'Parental' : 'Parental'}
              duration={formatDuration(entity.parental.durationMonths?.total ?? null, lang)}
              rate={entity.parental.paymentRate}
              color="amber"
            />
          )}
        </div>
      )}

      {entity.notes && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 italic">{entity.notes}</p>
      )}
    </div>
  );
}

function LeaveChip({ label, duration, rate, color }: {
  label: string; duration: string; rate?: number | null; color: 'rose' | 'blue' | 'amber';
}) {
  const colorMap = {
    rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className={`rounded-lg p-2 text-xs ${colorMap[color]}`}>
      <p className="font-medium">{label}</p>
      <p className="text-slate-700 mt-0.5">{duration}</p>
      {rate && <p className="text-slate-500">{rate}%</p>}
    </div>
  );
}
