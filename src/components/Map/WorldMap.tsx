import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Layer, LeafletMouseEvent } from "leaflet";
import type { Feature } from "geojson";
import type { Country, MapIndicator } from "../../types";
import {
  getIndicatorValue,
  getColorForValue,
  formatDuration,
  INDICATOR_LABEL_KEYS,
} from "../../utils/calculations";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";
import { getCountryName } from "../../utils/countryNames";
import "leaflet/dist/leaflet.css";

// Map from GeoJSON ISO_A3/ISO_A2 to our data ISO codes
function matchCountry(
  feature: Feature,
  countries: Country[]
): Country | undefined {
  const props = feature.properties || {};
  const iso3 = props.iso_a3 || props.ISO_A3 || props.adm0_a3 || "";
  const iso2 = props.iso_a2 || props.ISO_A2 || "";
  const name = props.name || props.NAME || "";

  return countries.find(
    (c) =>
      c.iso3 === iso3 ||
      c.iso2 === iso2 ||
      c.name === name ||
      (name === "Republic of Korea" && c.iso2 === "KR") ||
      (name === "Russia" && c.iso2 === "RU") ||
      (name === "Czech Republic" && c.iso2 === "CZ") ||
      (name === "Slovakia" && c.iso2 === "SK") ||
      (name === "Bosnia and Herz." && c.iso2 === "BA") ||
      (name === "S. Africa" && c.iso2 === "ZA") ||
      (name === "United Kingdom" && c.iso2 === "GB") ||
      (name === "United States of America" && c.iso2 === "US") ||
      (name === "Turkey" && c.iso2 === "TR")
  );
}

interface Props {
  countries: Country[];
  indicator: MapIndicator;
  onCountryClick: (country: Country) => void;
}

export function WorldMap({ countries, indicator, onCountryClick }: Props) {
  const [geoData, setGeoData] = useState<any>(null);
  const { t, lang } = useTranslation();
  const indicatorLabel = t(INDICATOR_LABEL_KEYS[indicator] as TranslationKey);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}world.geojson`)
      .then((res) => res.json())
      .then(setGeoData)
      .catch((err) => console.error("Error loading geojson", err));
  }, []);

  // Calculate min/max for color scale
  const { min, max } = useMemo(() => {
    const values = countries
      .map((c) => getIndicatorValue(c, indicator))
      .filter((v): v is number => v !== null && v > 0);
    return {
      min: Math.min(...values, 0),
      max: Math.max(...values, 1),
    };
  }, [countries, indicator]);

  const style = useCallback(
    (feature: Feature | undefined) => {
      if (!feature) return { fillColor: "#e2e8f0", weight: 0.8, color: "#94a3b8", fillOpacity: 0.3 };
      const country = matchCountry(feature, countries);
      if (!country) {
        return {
          fillColor: "#f1f5f9",
          weight: 0.5,
          color: "#cbd5e1",
          fillOpacity: 0.4,
        };
      }
      const value = getIndicatorValue(country, indicator);
      let fillColor: string;
      if (indicator === "pension") {
        fillColor = value === 1 ? "#0d9488" : value === 0 ? "#e11d48" : "#94a3b8";
      } else {
        fillColor = getColorForValue(value, min, max);
      }
      return {
        fillColor,
        weight: 1,
        color: "#64748b",
        fillOpacity: 0.85,
      };
    },
    [countries, indicator, min, max]
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: Layer) => {
      const country = matchCountry(feature, countries);
      if (country) {
        const value = getIndicatorValue(country, indicator);
        const label =
          indicator === "pension"
            ? (value === 1 ? (lang === 'fr' ? 'Oui' : 'Yes') : value === 0 ? (lang === 'fr' ? 'Non' : 'No') : (lang === 'fr' ? 'Inconnu' : 'Unknown'))
            : indicator.includes("gender")
              ? `${Math.round(value ?? 0)}/100`
              : formatDuration(value, lang);

        const displayName = getCountryName(country.name, country.iso2, lang);
        layer.bindTooltip(
          `<div style="font-family: inherit;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px;">${displayName}</div>
            <div style="font-size: 11px; opacity: 0.85;">${indicatorLabel}: <strong>${label}</strong></div>
          </div>`,
          { sticky: true }
        );
        layer.on({
          click: () => onCountryClick(country),
          mouseover: (e: LeafletMouseEvent) => {
            e.target.setStyle({
              weight: 2.5,
              color: "#0d9488",
              fillOpacity: 0.98,
            });
          },
          mouseout: (e: LeafletMouseEvent) => {
            e.target.setStyle(style(feature));
          },
        });
      }
    },
    [countries, indicator, onCountryClick, style, lang, indicatorLabel]
  );

  if (!geoData) {
    return (
      <div className="h-[520px] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs font-medium">{lang === 'fr' ? 'Chargement de la carte...' : 'Loading map...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <MapContainer
        center={[30, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        className="h-[520px] w-full"
        scrollWheelZoom={true}
        style={{ background: "#f8fafc" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON
          key={`${indicator}-${lang}`}
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg p-3.5 z-[1000] border border-slate-200/80 dark:border-slate-700/80 max-w-xs">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
          {indicatorLabel}
        </p>
        {indicator === "pension" ? (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: "#0d9488" }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{lang === 'fr' ? 'Oui (cotisations maintenues)' : 'Yes (maintained)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: "#e11d48" }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{lang === 'fr' ? 'Non' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-sm bg-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">{lang === 'fr' ? 'Non spécifié' : 'Unspecified'}</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              <span>{indicator.includes("gender") ? `${Math.round(min)}` : formatDuration(min, lang)}</span>
              <span>{indicator.includes("gender") ? `${Math.round(max)}` : formatDuration(max, lang)}</span>
            </div>
            <div
              className="h-3 w-44 rounded-md shadow-inner"
              style={{
                background: `linear-gradient(to right, ${getColorForValue(min, min, max)}, ${getColorForValue(max, min, max)})`,
              }}
            />
            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-100 dark:border-slate-700">
              <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{lang === 'fr' ? 'Non couvert dans la revue' : 'Not covered in review'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
