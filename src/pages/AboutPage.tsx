export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Author card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0 w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold select-none">
            UD
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">Ulrich Djidonou</h2>
            <p className="text-sm text-teal-700 font-medium mt-0.5">
              Économiste — Données, Stratégie &amp; Évaluation de programmes
            </p>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              6+ ans d'expérience en conseil stratégique, recherche et évaluation de programmes
              à l'intersection des données, de la stratégie et de l'impact. Expertise en
              économétrie, inférence causale et visualisation de données. Ce projet est une
              initiative indépendante visant à rendre les données de la{" "}
              <em>International Review of Leave Policies</em> accessibles et comparables.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href="https://www.linkedin.com/in/ulrichdjidonou"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white text-sm rounded-lg hover:bg-[#004182] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* About the project */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">À propos du projet</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Ce tableau de bord interactif visualise les données de la{" "}
          <strong>International Review of Leave Policies and Research</strong> publiée chaque
          année en septembre par le Leave Network (LPRN). La version actuelle couvre les
          politiques en vigueur en <strong>avril 2025</strong>, incluant 52 pays et plus de
          60 entités infranationales (provinces, états, cantons).
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Les données sont extraites directement du PDF officiel. Toutes les durées sont
          exprimées en semaines sauf mention contraire. Les scores de genre et de générosité
          sont établis sur 100.
        </p>
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            <strong>Source :</strong> Dobrotic et al. (2025).{" "}
            <em>International Review of Leave Policies and Research 2025</em>. Leave Network.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Réalisé par <strong>Ulrich Djidonou</strong> avec{" "}
            <strong>Claude Code</strong> (Anthropic).
          </p>
        </div>
      </div>
    </div>
  );
}
