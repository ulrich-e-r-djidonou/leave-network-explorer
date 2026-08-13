import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Layout/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { CompareView } from "./components/Compare/CompareView";
import { RankingsView } from "./components/Filters/RankingsView";
import { AnalyticsView } from "./components/Analytics/AnalyticsView";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import { SubnationalPage } from "./pages/SubnationalPage";
import { ReformsPage } from "./pages/ReformsPage";
import { DataTablePage } from "./pages/DataTablePage";
import { CountryPage } from "./pages/CountryPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { CustomScorePage } from "./pages/CustomScorePage";
import { useCountryData } from "./hooks/useCountryData";
import { useState } from "react";
import type { Country } from "./types";
import { CountryDetail } from "./components/Country/CountryDetail";
import { useTranslation } from "./hooks/useTranslation";
import ChatBot from "./components/ChatBot/ChatBot";

function AppInner() {
  const { data, loading } = useCountryData();
  const [detailCountry, setDetailCountry] = useState<Country | null>(null);
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-4">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-lg text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold">{t('error_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      <Header />
      {detailCountry && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-4 animate-in fade-in duration-200"
          onClick={() => setDetailCountry(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CountryDetail country={detailCountry} onClose={() => setDetailCountry(null)} />
          </div>
        </div>
      )}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<DashboardPage countries={data.countries} />} />
          <Route path="/compare" element={<CompareView countries={data.countries} />} />
          <Route
            path="/rankings"
            element={<RankingsView countries={data.countries} onCountryClick={setDetailCountry} />}
          />
          <Route path="/custom-score" element={<CustomScorePage countries={data.countries} />} />
          <Route path="/analytics" element={<AnalyticsView countries={data.countries} onCountryClick={setDetailCountry} />} />
          <Route path="/subnational" element={<SubnationalPage countries={data.countries} />} />
          <Route path="/reforms" element={<ReformsPage countries={data.countries} />} />
          <Route path="/data" element={<DataTablePage countries={data.countries} />} />
          <Route path="/country/:iso2" element={<CountryPage countries={data.countries} />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
      <ChatBot countries={data.countries} />
      <footer className="border-t bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left leading-relaxed">
            {t('footer_made_by')} <strong>Ulrich Djidonou</strong> (Économiste) — Source : {data.metadata.source} ({data.metadata.asOf}).{" "}
            {data.metadata.editors} (eds.)
          </p>
          <p className="shrink-0 font-medium text-slate-600 dark:text-slate-300">
            {data.metadata.totalCountries} {t('nav_about') === 'About' ? 'countries covered' : 'pays couverts'}
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
