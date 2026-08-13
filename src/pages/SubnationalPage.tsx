import { useState, useMemo } from "react";
import type { Country, SubnationalEntity } from "../types";
import { formatDuration } from "../utils/calculations";
import { useTranslation } from "../hooks/useTranslation";
import { Search } from "lucide-react";
import { SubnationalMap } from "../components/Map/SubnationalMap";
import type { SubIndicator } from "../components/Map/SubnationalMap";

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
  const [mapIndicator, setMapIndicator] = useState<SubIndicator>("paternity");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

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
      const matchMap = selectedCode === null || fe.entity.code === selectedCode;
      return matchSearch && matchCountry && matchMap;
    });
  }, [allEntities, search, countryFilter, selectedCode]);

  // Quebec data
  const quebec = useMemo(() => {
    const canada = countries.find((c) => c.iso2 === "CA");
    return canada?.subnational?.find((s) => s.code === "CA-QC");
  }, [countries]);

  const canada = countries.find((c) => c.iso2 === "CA");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{t('sub_title')}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{t('sub_subtitle')}</p>
        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">
          {allEntities.length} {lang === 'fr' ? 'entités infranationales répertoriées dans' : 'subnational entities across'} {countriesWithSub.length} {lang === 'fr' ? 'pays' : 'countries'}
        </p>
      </div>

      {/* ===== CARTE INFRANATIONALE ===== */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {lang === "fr" ? "Carte des entités infranationales" : "Subnational entities map"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === "fr"
              ? "Chaque point représente une entité avec des dispositions ou régimes de congé distincts."
              : "Each dot represents a subnational entity with distinct statutory leave rules."}
          </p>
        </div>
        <SubnationalMap
          countries={countries}
          indicator={mapIndicator}
          onIndicatorChange={setMapIndicator}
          onSelectEntity={(code) => {
            setSelectedCode(code);
            if (code) { setSearch(""); setCountryFilter("all"); }
          }}
          selectedCode={selectedCode}
          lang={lang}
        />
        {selectedCode && (
          <button
            onClick={() => setSelectedCode(null)}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            {lang === "fr" ? "← Afficher toutes les entités" : "← Show all entities"}
          </button>
        )}
      </div>

      {/* ===== QUÉBEC SPOTLIGHT ===== */}
      {quebec && canada && (
        <div className="bg-gradient-to-br from-indigo-50/90 to-blue-50/80 dark:from-slate-800/90 dark:to-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="text-2xl text-blue-700 dark:text-blue-400">⚜️</span>
                <h3 className="text-lg sm:text-xl font-bold font-display text-indigo-950 dark:text-indigo-200">
                  {t('sub_quebec_highlight')}
                </h3>
                <span className="text-xs font-semibold bg-indigo-700 text-white px-3 py-1 rounded-full shadow-xs">
                  {lang === 'fr' ? 'Régime distinct (RQAP)' : 'Distinct plan (QPIP)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                {lang === 'fr'
                  ? 'Régime québécois d\'assurance parentale — régime asymétrique le plus généreux au Canada'
                  : 'Quebec Parental Insurance Plan — most generous asymmetric regime in Canada'}
              </p>
            </div>
          </div>

          {/* Key differentiators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KeyStat
              label={lang === 'fr' ? 'Congé maternité' : 'Maternity leave'}
              qc={lang === 'fr' ? '18 sem. à 70 %' : '18 wk. at 70%'}
              note={lang === 'fr' ? '(Rég. particulier : 15 sem. à 75 %)' : '(Special plan: 15 wk. at 75%)'}
              federal={formatDuration(canada.maternity?.durationMonths?.paid ?? null, lang)}
            />
            <KeyStat
              label={lang === 'fr' ? 'Congé paternité' : 'Paternity leave'}
              qc={lang === 'fr' ? '5 sem. à 70 %' : '5 wk. at 70%'}
              note={lang === 'fr' ? '(Rég. particulier : 3 sem. à 75 %)' : '(Special plan: 3 wk. at 75%)'}
              federal={lang === 'fr' ? 'Inexistant' : 'None'}
              highlight
            />
            <KeyStat
              label={lang === 'fr' ? 'Taux de remplacement' : 'Replacement rate'}
              qc={lang === 'fr' ? '70 %' : '70%'}
              note={lang === 'fr' ? '(Rég. particulier : 75 %)' : '(Special plan: 75%)'}
              federal="55%"
              highlight
            />
            <KeyStat
              label={lang === 'fr' ? "Seuil d'admissibilité" : 'Eligibility threshold'}
              qc={lang === 'fr' ? '2 000 $ de revenus' : 'CAD 2,000 earnings'}
              federal={lang === 'fr' ? '600 heures travaillées' : '600 hours worked'}
            />
          </div>

          {/* Explanation */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-4 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed border border-indigo-100 dark:border-slate-700">
            {lang === 'fr'
              ? "Le RQAP offre deux options au choix des parents : le régime de base (durée plus longue, taux de 70 %) et le régime particulier (durée plus courte, taux de 75 %). Les prestations sont versées directement par le Conseil de gestion de l'assurance parentale."
              : "QPIP offers parents two choices: the basic plan (longer duration, 70% replacement rate) and the special plan (shorter duration, 75% replacement rate). Benefits are administered directly by the Conseil de gestion de l'assurance parentale."}
          </div>

          {/* Comparison table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-slate-700 overflow-x-auto shadow-xs">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-indigo-50/80 dark:bg-slate-700/80 border-b border-indigo-100 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-700 dark:text-slate-200 font-semibold">
                    {lang === 'fr' ? 'Caractéristique' : 'Feature'}
                  </th>
                  <th className="text-center px-4 py-3 text-indigo-800 dark:text-indigo-300 font-bold">
                    <span>⚜️</span> {lang === 'fr' ? 'Régime de base (RQAP)' : 'Basic plan (QPIP)'}
                  </th>
                  <th className="text-center px-4 py-3 text-indigo-600 dark:text-indigo-400 font-bold">
                    <span>⚜️</span> {lang === 'fr' ? 'Régime particulier' : 'Special plan'}
                  </th>
                  <th className="text-center px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                    🍁 {lang === 'fr' ? 'Canada (hors Québec - AE)' : 'Canada (excl. Quebec - EI)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                <CompareRow
                  label={lang === 'fr' ? 'Congé maternité' : 'Maternity leave'}
                  base={lang === 'fr' ? '18 sem. à 70 %' : '18 wk. at 70%'}
                  special={lang === 'fr' ? '15 sem. à 75 %' : '15 wk. at 75%'}
                  fed={`${formatDuration(canada.maternity?.durationMonths?.total ?? null, lang)} — ${canada.maternity?.paymentRate ?? 0}%`}
                />
                <CompareRow
                  label={lang === 'fr' ? 'Congé paternité' : 'Paternity leave'}
                  base={lang === 'fr' ? '5 sem. à 70 %' : '5 wk. at 70%'}
                  special={lang === 'fr' ? '3 sem. à 75 %' : '3 wk. at 75%'}
                  fed={lang === 'fr' ? '— (inexistant)' : '— (none)'}
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Congé parental (partageable)' : 'Parental leave (shareable)'}
                  base={lang === 'fr' ? '32 sem. à 70 %, puis 25 sem. à 55 %' : '32 wk. at 70%, then 25 wk. at 55%'}
                  special={lang === 'fr' ? '25 sem. à 75 %' : '25 wk. at 75%'}
                  fed={formatDuration(canada.parental?.durationMonths?.total ?? null, lang)}
                />
                <CompareRow
                  label={lang === 'fr' ? 'Délai de carence' : 'Waiting period'}
                  base={lang === 'fr' ? 'Aucun' : 'None'}
                  special={lang === 'fr' ? 'Aucun' : 'None'}
                  fed={lang === 'fr' ? '1 semaine' : '1 week'}
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Travailleurs autonomes' : 'Self-employed workers'}
                  base={lang === 'fr' ? 'Couverts d\'office' : 'Covered automatically'}
                  special={lang === 'fr' ? 'Couverts d\'office' : 'Covered automatically'}
                  fed={lang === 'fr' ? 'Adhésion volontaire' : 'Voluntary opt-in'}
                  highlight
                />
                <CompareRow
                  label={lang === 'fr' ? 'Plafond assurable (2025)' : 'Insurable ceiling (2025)'}
                  base="94 000 $"
                  special="94 000 $"
                  fed="65 700 $"
                />
                <CompareRow
                  label={lang === 'fr' ? 'Bonus partage parental' : 'Parental sharing bonus'}
                  base={lang === 'fr' ? '+4 sem. si chaque parent prend ≥ 8 sem.' : '+4 wk. if each parent takes ≥8 wk.'}
                  special={lang === 'fr' ? '+3 sem. si chaque parent prend ≥ 6 sem.' : '+3 wk. if each parent takes ≥6 wk.'}
                  fed={lang === 'fr' ? 'Aucun' : 'None'}
                  highlight
                />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== ALL SUBNATIONAL ENTITIES ===== */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {lang === 'fr' ? 'Toutes les entités infranationales' : 'All subnational entities'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'fr' ? 'Filtrer par mot-clé ou par pays fédéral.' : 'Filter by keyword or federal country.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'fr' ? 'Rechercher une province, un état...' : 'Search province, state...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            />
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs cursor-pointer"
          >
            <option value="all">{t('sub_filter_all')}</option>
            {countriesWithSub.map((c) => (
              <option key={c.iso2} value={c.iso2}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Entity cards */}
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-8 text-center">{t('sub_no_data')}</p>
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
  label, qc, federal, highlight, note,
}: {
  label: string; qc: string; federal: string; highlight?: boolean; note?: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? 'bg-indigo-100/90 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-base font-bold font-mono mt-1 ${highlight ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-slate-100'}`}>{qc}</p>
      {note && <p className="text-[11px] text-indigo-600 dark:text-indigo-300 mt-0.5">{note}</p>}
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-mono">vs {federal}</p>
    </div>
  );
}

function CompareRow({ label, base, special, fed, highlight }: {
  label: string; base: string; special: string; fed: string; highlight?: boolean;
}) {
  return (
    <tr className={highlight ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}>
      <td className="px-4 py-2.5 font-sans text-slate-700 dark:text-slate-200 text-xs font-medium">{label}</td>
      <td className="px-4 py-2.5 text-center text-xs font-bold text-indigo-900 dark:text-indigo-300">{base}</td>
      <td className="px-4 py-2.5 text-center text-xs font-bold text-indigo-700 dark:text-indigo-400">{special}</td>
      <td className="px-4 py-2.5 text-center text-xs text-slate-500 dark:text-slate-400">{fed}</td>
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
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 space-y-3 shadow-xs ${isQuebec ? 'border-indigo-400 ring-2 ring-indigo-300/40 dark:ring-indigo-700/40' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {isQuebec && <span className="text-base text-blue-700 dark:text-blue-400">⚜️</span>}
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{entity.name}</span>
            <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
              {t(typeKeys[entity.type] as any) || entity.type}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{countryName}</p>
        </div>
        {entity.code && (
          <span className="text-xs font-mono text-slate-400 shrink-0">{entity.code}</span>
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
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 italic border-t border-slate-100 dark:border-slate-700/60 pt-2">{entity.notes}</p>
      )}
    </div>
  );
}

function LeaveChip({ label, duration, rate, color }: {
  label: string; duration: string; rate?: number | null; color: 'rose' | 'blue' | 'amber';
}) {
  const colorMap = {
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/40',
    blue: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-900/40',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/40',
  };
  return (
    <div className={`rounded-xl p-2.5 text-xs border ${colorMap[color]}`}>
      <p className="font-semibold">{label}</p>
      <p className="text-slate-800 dark:text-slate-200 font-mono font-medium mt-0.5">{duration}</p>
      {rate && <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{rate}%</p>}
    </div>
  );
}
