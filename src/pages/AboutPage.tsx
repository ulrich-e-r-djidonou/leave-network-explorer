export function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-800">À propos du projet</h2>
        <p className="text-slate-500 mt-1">Sources, méthodologie et dictionnaire des données.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Ce tableau de bord interactif visualise les données de la{" "}
          <strong>International Review of Leave Policies and Research</strong> publiée chaque
          année en septembre par le Leave Network (LPRN). La version actuelle couvre les
          politiques en vigueur en <strong>avril 2025</strong>, incluant 52 pays et plus de
          60 entités infranationales (provinces, états, cantons).
        </p>

        <div className="border-t border-slate-100 pt-4 space-y-2">
          <p className="text-xs text-slate-500">
            <strong>Source :</strong> Dobrotic, I., Blum, S., Kaufman, G., Koslowski, A., Moss, P. and Valentova, M. (eds.) (2025).{" "}
            <em>International Review of Leave Policies and Research 2025</em>. Leave Network.
          </p>
          <p className="text-xs text-slate-500">
            <strong>Licence :</strong> Données publiées à titre indicatif — consulter les notes-pays pour les détails complets.
          </p>
          <p className="text-xs text-slate-500">
            <strong>Réalisé par :</strong> Ulrich Djidonou.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Avertissement :</strong> Ce travail a été réalisé par l'auteur. Les opinions exprimées dans cette publication sont celles de l'auteur et ne représentent pas la position ou les opinions d'une quelconque organisation. Ce travail est destiné à fournir des informations générales sur le sujet traité.
        </p>
        <p className="text-xs text-slate-500">
          © 2026 Ulrich Djidonou. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
