import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Layout/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { CompareView } from "./components/Compare/CompareView";
import { RankingsView } from "./components/Filters/RankingsView";
import { AnalyticsView } from "./components/Analytics/AnalyticsView";
import { useCountryData } from "./hooks/useCountryData";
import { useState } from "react";
import type { Country } from "./types";
import { CountryDetail } from "./components/Country/CountryDetail";

function App() {
  const { data, loading } = useCountryData();
  const [detailCountry, setDetailCountry] = useState<Country | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-3">
            Chargement des donnees...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">Erreur de chargement des donnees.</p>
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-slate-50">
        <Header />
        {/* Detail modal overlay */}
        {detailCountry && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setDetailCountry(null)}
          >
            <div
              className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CountryDetail
                country={detailCountry}
                onClose={() => setDetailCountry(null)}
              />
            </div>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={<DashboardPage countries={data.countries} />}
          />
          <Route
            path="/compare"
            element={<CompareView countries={data.countries} />}
          />
          <Route
            path="/rankings"
            element={
              <RankingsView
                countries={data.countries}
                onCountryClick={setDetailCountry}
              />
            }
          />
          <Route
            path="/analytics"
            element={<AnalyticsView countries={data.countries} />}
          />
        </Routes>
        <footer className="border-t bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-slate-400">
            <p>
              Source : {data.metadata.source} ({data.metadata.asOf}).{" "}
              {data.metadata.editors} (eds.)
            </p>
            <p className="mt-1">
              {data.metadata.totalCountries} pays couverts. Donnees a titre
              indicatif — consulter les notes-pays pour les details complets.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
