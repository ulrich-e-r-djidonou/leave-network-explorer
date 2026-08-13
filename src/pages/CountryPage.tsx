import { useParams, Link } from "react-router-dom";
import type { Country } from "../types";
import { CountryDetail } from "../components/Country/CountryDetail";
import { useTranslation } from "../hooks/useTranslation";
import { ArrowLeft } from "lucide-react";

interface Props {
  countries: Country[];
}

export function CountryPage({ countries }: Props) {
  const { iso2 } = useParams<{ iso2: string }>();
  const { lang } = useTranslation();

  const country = countries.find(
    (c) => c.iso2.toLowerCase() === (iso2 || "").toLowerCase()
  );

  if (!country) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
          {lang === "fr" ? "Pays non trouvé." : "Country not found."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === "fr" ? "Retour à la carte" : "Back to map"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {lang === "fr" ? "Retour à la carte" : "Back to map"}
      </Link>

      {/* Full CountryDetail component */}
      <CountryDetail
        country={country}
        onClose={() => {}}
      />

      {/* Share hint */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
        {lang === "fr"
          ? "Partagez cette page avec le lien dans votre barre d'adresse."
          : "Share this country profile directly using your browser address bar URL."}
      </div>
    </div>
  );
}
