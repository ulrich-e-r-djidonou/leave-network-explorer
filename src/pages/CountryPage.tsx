import { useParams, Link } from "react-router-dom";
import type { Country } from "../types";
import { CountryDetail } from "../components/Country/CountryDetail";
import { useLanguage } from "../contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";

interface Props {
  countries: Country[];
}

export function CountryPage({ countries }: Props) {
  const { iso2 } = useParams<{ iso2: string }>();
  const { lang } = useLanguage();

  const country = countries.find(
    (c) => c.iso2.toLowerCase() === (iso2 || "").toLowerCase()
  );

  if (!country) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-lg text-slate-500">
          {lang === "fr" ? "Pays non trouvé." : "Country not found."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-teal-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === "fr" ? "Retour à la carte" : "Back to map"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "fr" ? "Retour à la carte" : "Back to map"}
      </Link>

      {/* Reuse existing CountryDetail component */}
      <CountryDetail
        country={country}
        onClose={() => {}}
      />

      {/* Share URL hint */}
      <div className="text-center text-xs text-slate-400 py-2">
        {lang === "fr"
          ? "Partagez cette page avec le lien dans votre barre d'adresse."
          : "Share this page using the URL in your address bar."}
      </div>
    </div>
  );
}
