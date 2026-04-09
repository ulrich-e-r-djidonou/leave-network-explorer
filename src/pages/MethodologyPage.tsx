import { useTranslation } from "../hooks/useTranslation";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-l-4 border-teal-500 pl-3 mb-4">
      {children}
    </h3>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 my-2">
      <code className="text-sm text-slate-700 dark:text-slate-300 font-mono">{children}</code>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8 space-y-4">
      {children}
    </div>
  );
}

export function MethodologyPage() {
  const { lang } = useTranslation();
  const isFr = lang === "fr";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {isFr ? "Méthodologie" : "Methodology"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isFr
            ? "Comment les indicateurs sont calculés"
            : "How the indicators are calculated"}
        </p>
      </div>

      {/* Section 1 : Indice de générosité (ETP) */}
      <Card>
        <SectionTitle>
          {isFr
            ? "Indice de générosité — Équivalent Temps Plein (ETP)"
            : "Generosity Index — Full-Time Equivalent (FTE)"}
        </SectionTitle>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isFr
            ? "L'indice de générosité mesure le volume effectif de congé offert aux parents en combinant la durée et le niveau de remplacement salarial. Il est exprimé en mois d'équivalent temps plein (ETP)."
            : "The generosity index measures the effective volume of leave offered to parents by combining duration and salary replacement level. It is expressed in full-time equivalent (FTE) months."}
        </p>

        <Formula>
          ETP = {isFr ? "mois payés" : "paid months"} × ({isFr ? "taux de remplacement" : "replacement rate"} / 100)
        </Formula>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isFr
            ? "Le calcul est effectué séparément pour chaque type de congé (maternité, paternité, parental), puis les trois valeurs sont additionnées."
            : "The calculation is performed separately for each leave type (maternity, paternity, parental), then the three values are summed."}
        </p>

        <Formula>
          ETP{isFr ? " total" : " total"} = ETP{isFr ? "(maternité)" : "(maternity)"} + ETP{isFr ? "(paternité)" : "(paternity)"} + ETP{isFr ? "(parental)" : "(parental)"}
        </Formula>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {isFr ? "Exemple" : "Example"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isFr
              ? "Un pays offrant 6 mois de congé maternité payé à 80 % et 2 mois de congé paternité payé à 100 % aura un ETP de (6 × 0,80) + (2 × 1,00) = 6,8 mois."
              : "A country offering 6 months of maternity leave at 80% and 2 months of paternity leave at 100% will have an FTE of (6 × 0.80) + (2 × 1.00) = 6.8 months."}
          </p>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {isFr ? "Hypothèses et limites" : "Assumptions and limitations"}
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4">
            <li>
              {isFr
                ? "Pour les pays offrant un forfait fixe, le taux de remplacement est calculé par rapport au revenu médian 2025 du pays, en supposant une semaine de 39 heures (Ray et al., 2010)."
                : "For countries offering a flat-rate benefit, the replacement rate is calculated against the country's 2025 median income, assuming a 39-hour work week (Ray et al., 2010)."}
            </li>
            <li>
              {isFr
                ? "L'ETP ne capture pas les plafonds de prestations qui peuvent réduire le taux effectif pour les hauts revenus."
                : "FTE does not capture benefit ceilings that may reduce the effective rate for high earners."}
            </li>
            <li>
              {isFr
                ? "Seuls les congés payés sont inclus. Les congés non rémunérés ne contribuent pas à l'ETP."
                : "Only paid leave is included. Unpaid leave does not contribute to FTE."}
            </li>
            <li>
              {isFr
                ? "Attention brut/net : en Autriche, au Chili, en France et en Allemagne, les prestations sont calculées sur le salaire net. Les taux de remplacement de ces pays ne sont pas directement comparables à ceux basés sur le salaire brut (OCDE, 2024)."
                : "Gross/net caveat: in Austria, Chile, France and Germany, benefits are based on net earnings. Replacement rates for these countries are not directly comparable with those based on gross earnings (OECD, 2024)."}
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {isFr ? "Références" : "References"}
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4">
            <li>
              Ray, R., Gornick, J. C., & Schmitt, J. (2010). <em>Who Cares? Assessing Generosity and Gender Equality in Parental Leave Policy Designs in 21 Countries.</em> Journal of European Social Policy, 20(3), 196-216.
            </li>
            <li>
              OECD (2024). <em>Paid leave for fathers.</em> OECD Family Database, Indicator PF2.1.
            </li>
          </ul>
        </div>
      </Card>

      {/* Section 2 : Indice d'égalité des genres (GII) */}
      <Card>
        <SectionTitle>
          {isFr
            ? "Égalité des genres — Indice d'inégalité de genre (GII, UNDP)"
            : "Gender Equality — Gender Inequality Index (GII, UNDP)"}
        </SectionTitle>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isFr
            ? "L'indicateur d'égalité des genres utilisé dans cette application est basé sur le Gender Inequality Index (GII) du Programme des Nations Unies pour le Développement (PNUD), publié dans le Human Development Report 2025 (données 2023)."
            : "The gender equality indicator used in this application is based on the Gender Inequality Index (GII) from the United Nations Development Programme (UNDP), published in the Human Development Report 2025 (2023 data)."}
        </p>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isFr
            ? "Le GII est un indice composite (0 à 1) qui mesure l'inégalité entre hommes et femmes dans trois dimensions :"
            : "The GII is a composite index (0 to 1) measuring inequality between men and women across three dimensions:"}
        </p>

        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
          <li>
            <strong>{isFr ? "Santé reproductive" : "Reproductive health"}</strong>
            {isFr
              ? " — mortalité maternelle, taux de fécondité des adolescentes"
              : " — maternal mortality, adolescent birth rate"}
          </li>
          <li>
            <strong>{isFr ? "Autonomisation" : "Empowerment"}</strong>
            {isFr
              ? " — sièges au parlement, éducation secondaire"
              : " — parliamentary seats, secondary education"}
          </li>
          <li>
            <strong>{isFr ? "Marché du travail" : "Labour market"}</strong>
            {isFr
              ? " — taux d'activité de la population active"
              : " — labour force participation rate"}
          </li>
        </ul>

        <Formula>
          {isFr ? "Score affiché" : "Displayed score"} = (1 - GII) × 100
        </Formula>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isFr
            ? "Un score de 100 signifie une égalité parfaite (GII = 0). Un score de 0 signifie une inégalité maximale (GII = 1)."
            : "A score of 100 means perfect equality (GII = 0). A score of 0 means maximum inequality (GII = 1)."}
        </p>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {isFr ? "Source" : "Source"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            UNDP (2025). <em>Human Development Report 2025 — Statistical Annex, Table 5: Gender Inequality Index.</em>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isFr
              ? "Disponible : "
              : "Available: "}
            <span className="text-teal-600 dark:text-teal-400">hdr.undp.org/data-center/thematic-composite-indices/gender-inequality-index</span>
          </p>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {isFr ? "Limites" : "Limitations"}
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4">
            <li>
              {isFr
                ? "Le GII est un indicateur macro qui ne mesure pas spécifiquement l'égalité dans les politiques de congé parental."
                : "The GII is a macro indicator that does not specifically measure equality in parental leave policies."}
            </li>
            <li>
              {isFr
                ? "Données non disponibles pour le Kosovo (marqué N/A). Le Kosovo n'est pas inclus dans le rapport du PNUD."
                : "Data not available for Kosovo (marked N/A). Kosovo is not included in the UNDP report."}
            </li>
            <li>
              {isFr
                ? "Le GII est mis à jour annuellement par le PNUD. Les valeurs affichées correspondent à l'année de données 2023."
                : "The GII is updated annually by UNDP. Displayed values correspond to the 2023 data year."}
            </li>
          </ul>
        </div>
      </Card>

      {/* Section 3 : Source des données */}
      <Card>
        <SectionTitle>
          {isFr ? "Source des données" : "Data Source"}
        </SectionTitle>

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            {isFr ? (
              <>
                Les données sur les politiques de congé proviennent de la <strong>International Review of Leave Policies and Research 2025</strong>, publiée par le <strong>Leave Policy Research Network (LPRN)</strong>.
              </>
            ) : (
              <>
                Leave policy data comes from the <strong>International Review of Leave Policies and Research 2025</strong>, published by the <strong>Leave Policy Research Network (LPRN)</strong>.
              </>
            )}
          </p>
          <p>
            {isFr
              ? "Référence : Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M. (eds.) (2025)."
              : "Reference: Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M. (eds.) (2025)."}
          </p>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4">
            <li>
              {isFr
                ? "52 pays + plus de 60 entités infranationales (provinces, états, cantons)."
                : "52 countries + more than 60 subnational entities (provinces, states, cantons)."}
            </li>
            <li>
              {isFr
                ? "Données de panel, mises à jour annuellement (politiques en vigueur en avril 2025)."
                : "Panel data, updated annually (policies in force as of April 2025)."}
            </li>
            <li>
              {isFr
                ? "L'indice d'égalité des genres (GII) provient du PNUD (HDR 2025, données 2023)."
                : "The gender equality index (GII) comes from UNDP (HDR 2025, 2023 data)."}
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
