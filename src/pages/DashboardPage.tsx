import { useState } from "react";
import type { Country, MapIndicator } from "../types";
import { WorldMap } from "../components/Map/WorldMap";
import { IndicatorSelector } from "../components/Map/IndicatorSelector";
import { StatsBar } from "../components/Map/StatsBar";
import { CountryList } from "../components/Country/CountryList";
import { CountryDetail } from "../components/Country/CountryDetail";
import { useTranslation } from "../hooks/useTranslation";

interface Props {
  countries: Country[];
}

export function DashboardPage({ countries }: Props) {
  const [indicator, setIndicator] = useState<MapIndicator>("total_leave");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Indicator selector */}
      <div>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-300 mb-2">
          {t('dashboard_indicator_label')}
        </h2>
        <IndicatorSelector value={indicator} onChange={setIndicator} />
      </div>

      {/* Stats bar */}
      <StatsBar countries={countries} indicator={indicator} />

      {/* Map + sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <WorldMap
            countries={countries}
            indicator={indicator}
            onCountryClick={setSelectedCountry}
          />
        </div>

        {/* Sidebar: country list or detail */}
        <div>
          {selectedCountry ? (
            <CountryDetail
              country={selectedCountry}
              onClose={() => setSelectedCountry(null)}
            />
          ) : (
            <CountryList
              countries={countries}
              indicator={indicator}
              onSelect={setSelectedCountry}
            />
          )}
        </div>
      </div>
    </div>
  );
}
