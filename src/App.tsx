import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Layout/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { CompareView } from "./components/Compare/CompareView";
import { RankingsView } from "./components/Filters/RankingsView";
import { AnalyticsView } from "./components/Analytics/AnalyticsView";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import { SubnationalPage } from "./pages/SubnationalPage";
import { useCountryData } from "./hooks/useCountryData";
import { useState } from "react";
import type { Country } from "./types";
import { CountryDetail } from "./components/Country/CountryDetail";
import { useTranslation } from "./hooks/useTranslation";

function AppInner() {
  const { data, loading } = useCountryData();
  const [detailCountry, setDetailCountry] = useState<Country | null>(null);
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-3">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">{t('error_loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {detailCountry && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-16 px-4"
          onClick={() => setDetailCountry(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CountryDetail country={detailCountry} onClose={() => setDetailCountry(null)} />
          </div>
        </div>
      )}
      <Routes>
        <Route path="/" element={<DashboardPage countries={data.countries} />} />
        <Route path="/compare" element={<CompareView countries={data.countries} />} />
        <Route
          path="/rankings"
          element={<RankingsView countries={data.countries} onCountryClick={setDetailCountry} />}
        />
        <Route path="/analytics" element={<AnalyticsView countries={data.countries} />} />
        <Route path="/subnational" element={<SubnationalPage countries={data.countries} />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <footer className="border-t bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-slate-400">
          <p>
            {t('footer_made_by')} <strong>Ulrich Djidonou</strong> — Source : {data.metadata.source} ({data.metadata.asOf}).{" "}
            {data.metadata.editors} (eds.)
          </p>
          <p className="mt-1">
            {data.metadata.totalCountries} {t('nav_about') === 'About' ? 'countries covered.' : 'pays couverts.'}{" "}
            {t('footer_indicative')}
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
