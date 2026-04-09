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
      // Handle special cases
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
      .then(setGeoData);
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
      if (!feature) return { fillColor: "#e5e7eb", weight: 1, color: "#9ca3af", fillOpacity: 0.3 };
      const country = matchCountry(feature, countries);
      if (!country) {
        return {
          fillColor: "#f3f4f6",
          weight: 0.5,
          color: "#d1d5db",
          fillOpacity: 0.4,
        };
      }
      const value = getIndicatorValue(country, indicator);
      return {
        fillColor: getColorForValue(value, min, max),
        weight: 1,
        color: "#6b7280",
        fillOpacity: 0.8,
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
          indicator.includes("gender")
            ? `${value}/100`
            : formatDuration(value, lang);

        const displayName = getCountryName(country.name, country.iso2, lang);
        layer.bindTooltip(
          `<strong>${displayName}</strong><br/>${indicatorLabel}: ${label}`,
          { sticky: true, className: "!text-sm" }
        );
        layer.on({
          click: () => onCountryClick(country),
          mouseover: (e: LeafletMouseEvent) => {
            e.target.setStyle({
              weight: 2,
              color: "#0d9488",
              fillOpacity: 0.95,
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
      <div className="h-[500px] bg-slate-100 flex items-center justify-center text-slate-500">
        {lang === 'fr' ? 'Chargement de la carte...' : 'Loading map...'}
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={[30, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        className="h-[500px] w-full rounded-lg"
        scrollWheelZoom={true}
        style={{ background: "#f1f5f9" }}
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
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg shadow p-3 z-[1000]">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
          {indicatorLabel}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">{min}</span>
          <div
            className="h-3 w-32 rounded"
            style={{
              background: `linear-gradient(to right, ${getColorForValue(min, min, max)}, ${getColorForValue(max, min, max)})`,
            }}
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {indicator.includes("gender") ? `${max}` : formatDuration(max, lang)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" />
          <span className="text-xs text-slate-500 dark:text-slate-400">{lang === 'fr' ? 'Pas dans la revue' : 'Not in review'}</span>
        </div>
      </div>
    </div>
  );
}
