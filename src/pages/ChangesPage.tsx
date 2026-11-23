import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useYear } from "../contexts/YearContext";
import { useEditionDiff } from "../hooks/useEditionDiff";
import { useTranslation } from "../hooks/useTranslation";
import { getCountryName } from "../utils/countryNames";
import { formatFieldValue } from "../utils/editionDiff";
import { EditionBadge } from "../components/Layout/EditionBadge";

/** Page « Ce qui change » : valeurs de l'édition affichée qui diffèrent de l'édition précédente. */
export function ChangesPage() {
  const { editions, year, setYear, previousYear, previousData } = useYear();
  const diff = useEditionDiff();
  const { t, lang } = useTranslation();
  const latest = editions.reduce<number | null>((m, e) => (m === null || e.year > m ? e.year : m), null);

  const sortedChanged = diff
    ? [...diff.changed].sort((a, b) =>
        getCountryName(a.country.name, a.country.iso2, lang).localeCompare(
          getCountryName(b.country.name, b.country.iso2, lang),
          lang,
        ),
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
          {previousYear !== null ? t("changes_title") : t("nav_changes")}
          <EditionBadge />
        </h2>
        {previousYear !== null && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t("changes_intro")}{" "}
            <Link to="/reforms" className="text-teal-700 dark:text-teal-400 font-medium hover:underline">
              {t("changes_see_reforms")}
            </Link>
          </p>
        )}
      </div>

      {previousYear === null && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("changes_no_previous")}</p>
          {latest !== null && latest !== year && (
            <button
              onClick={() => setYear(latest)}
              className="text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-lg font-medium transition-colors"
            >
              {t("changes_show_latest")} ({latest})
            </button>
          )}
        </div>
      )}

      {previousYear !== null && !previousData && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("changes_loading")}</p>
      )}

      {diff && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label={t("changes_stat_countries")} value={diff.changed.length} />
            <Stat label={t("changes_stat_values")} value={diff.valueCount} />
            <Stat label={t("changes_stat_new")} value={diff.added.length} />
          </div>

          {diff.added.length > 0 && (
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{t("changes_new_title")}</h3>
              <ul className="flex flex-wrap gap-2">
                {diff.added.map((c) => (
                  <li key={c.iso2}>
                    <Link
                      to={`/country/${c.iso2}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 dark:text-teal-400 hover:underline"
                    >
                      {getCountryName(c.name, c.iso2, lang)}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("changes_by_country")}</h3>
            {sortedChanged.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("changes_none")}</p>
            )}
            {sortedChanged.map(({ country, changes }) => (
              <article
                key={country.iso2}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden"
              >
                <header className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <Link
                    to={`/country/${country.iso2}`}
                    className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400"
                  >
                    {getCountryName(country.name, country.iso2, lang)}
                  </Link>
                  <span className="text-xs text-slate-400 tabular-nums">{changes.length}</span>
                </header>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-xs sm:text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="w-[34%] px-4 sm:px-5 py-2 font-medium">{t("changes_col_section")}</th>
                        <th className="w-[30%] px-2 py-2 font-medium">{t("changes_col_field")}</th>
                        <th className="px-2 py-2 font-medium text-right">{previousYear}</th>
                        <th className="px-4 sm:px-5 py-2 font-medium text-right">{year}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {changes.map(({ field, before, after }) => (
                        <tr key={field.path}>
                          <td className="px-4 sm:px-5 py-2 text-slate-500 dark:text-slate-400">{t(field.section)}</td>
                          <td className="px-2 py-2 text-slate-700 dark:text-slate-300">{t(field.label)}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-slate-500 dark:text-slate-400">
                            {formatFieldValue(before, field.kind, lang)}
                          </td>
                          <td className="px-4 sm:px-5 py-2 text-right tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                            {formatFieldValue(after, field.kind, lang)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">{value}</p>
    </div>
  );
}
