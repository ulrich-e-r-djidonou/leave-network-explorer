import { useTranslation } from "../hooks/useTranslation";
import { BookOpen, ShieldAlert } from "lucide-react";

export function AboutPage() {
  const { lang } = useTranslation();
  const isFr = lang === "fr";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
          {isFr ? "À propos de l'explorateur" : "About the Explorer"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {isFr ? "Contexte, sources scientifiques et avertissement." : "Context, academic sources, and disclaimer."}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-semibold text-sm">
          <BookOpen className="w-4 h-4" />
          <span>{isFr ? "Source & Données" : "Data & Context"}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {isFr ? (
            <>
              Ce tableau de bord interactif visualise les données de la{" "}
              <strong>International Review of Leave Policies and Research</strong> publiée chaque
              année en septembre par le Leave Policy Research Network (LPRN). La version actuelle couvre les
              politiques en vigueur en <strong>avril 2025</strong>, incluant 52 pays et plus de
              60 entités infranationales (provinces canadiennes, états américains, cantons suisses, etc.).
            </>
          ) : (
            <>
              This interactive dashboard visualizes data from the{" "}
              <strong>International Review of Leave Policies and Research</strong>, published annually
              in September by the Leave Policy Research Network (LPRN). The current version covers policies in force
              in <strong>April 2025</strong>, including 52 countries and more than 60 subnational
              entities (Canadian provinces, US states, Swiss cantons, etc.).
            </>
          )}
        </p>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <p>
            <strong className="text-slate-700 dark:text-slate-300">Source :</strong>{" "}
            Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M. (eds.) (2025).{" "}
            <em>International Review of Leave Policies and Research 2025</em>. Leave Policy Research Network.
          </p>
          <p>
            <strong className="text-slate-700 dark:text-slate-300">{isFr ? "Conçu et développé par" : "Built by"} :</strong> Ulrich Djidonou (Économiste-chercheur).
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-semibold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>{isFr ? "Avertissement légal" : "Disclaimer"}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {isFr
            ? "Ce travail a été réalisé par l'auteur à titre personnel. Les opinions exprimées ne représentent pas la position ou les opinions d'une quelconque organisation ou employeur."
            : "This work was carried out by the author in a personal capacity. The views expressed do not represent the position or opinions of any organization or employer."}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
          © 2025 Ulrich Djidonou. {isFr ? "Tous droits réservés." : "All rights reserved."}
        </p>
      </div>
    </div>
  );
}
