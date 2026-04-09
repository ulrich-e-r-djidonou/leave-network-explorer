import { useTranslation } from "../hooks/useTranslation";

export function AboutPage() {
  const { lang } = useTranslation();
  const isFr = lang === "fr";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {isFr ? "À propos de l'explorateur" : "About the Explorer"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isFr ? "Contexte, sources et avertissement." : "Context, sources and disclaimer."}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isFr ? (
            <>
              Ce tableau de bord interactif visualise les données de la{" "}
              <strong>International Review of Leave Policies and Research</strong> publiée chaque
              année en septembre par le Leave Policy Research Network (LPRN). La version actuelle couvre les
              politiques en vigueur en <strong>avril 2025</strong>, incluant 52 pays et plus de
              60 entités infranationales (provinces, états, cantons).
            </>
          ) : (
            <>
              This interactive dashboard visualizes data from the{" "}
              <strong>International Review of Leave Policies and Research</strong>, published annually
              in September by the Leave Policy Research Network (LPRN). The current version covers policies in force
              in <strong>April 2025</strong>, including 52 countries and more than 60 subnational
              entities (provinces, states, cantons).
            </>
          )}
        </p>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source :</strong>{" "}
            Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M. (eds.) (2025).{" "}
            <em>International Review of Leave Policies and Research 2025</em>. Leave Policy Research Network.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>{isFr ? "Réalisé par" : "Built by"} :</strong> Ulrich Djidonou.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong>{isFr ? "Avertissement" : "Disclaimer"} :</strong>{" "}
          {isFr
            ? "Ce travail a été réalisé par l'auteur à titre personnel. Les opinions exprimées ne représentent pas la position ou les opinions d'une quelconque organisation."
            : "This work was carried out by the author in a personal capacity. The views expressed do not represent the position or opinions of any organization."}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © 2025 Ulrich Djidonou. {isFr ? "Tous droits réservés." : "All rights reserved."}
        </p>
      </div>
    </div>
  );
}
