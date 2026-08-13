import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { Country, SubnationalEntity } from "../../types";
import { formatDuration } from "../../utils/calculations";
import "leaflet/dist/leaflet.css";

// Approximate centroids for each entity code
const ENTITY_COORDS: Record<string, [number, number]> = {
  // Canada
  "CA-QC": [52.0, -73.5],
  // United States
  "US-CA": [36.7, -119.4],
  "US-CO": [39.0, -105.5],
  "US-CT": [41.6, -72.7],
  "US-DE": [38.9, -75.5],
  "US-HI": [20.8, -156.3],
  "US-ME": [45.0, -69.4],
  "US-MD": [39.0, -76.8],
  "US-MA": [42.4, -71.4],
  "US-MN": [46.4, -93.1],
  "US-NJ": [40.1, -74.5],
  "US-NY": [42.2, -74.9],
  "US-OR": [44.6, -122.1],
  "US-RI": [41.7, -71.5],
  "US-WA": [47.4, -121.5],
  "US-DC": [38.9, -77.0],
  "US-PR": [18.2, -66.5],
  // Germany
  "DE-BY": [48.9, 11.4],
  "DE-SN": [51.1, 13.2],
  // Spain
  "ES-PV": [43.0, -2.5],
  "ES-RI": [42.3, -2.4],
  "ES-NC": [42.7, -1.6],
  "ES-CL": [41.5, -4.1],
  // United Kingdom
  "GB-ENG": [52.6, -1.5],
  "GB-SCT": [56.5, -4.2],
  "GB-WLS": [52.1, -3.5],
  "GB-NIR": [54.6, -6.7],
  // Switzerland
  "CH-GE": [46.2, 6.1],
  "CH-VD": [46.7, 6.6],
  // China
  "CN-BJ": [39.9, 116.4],
  "CN-SH": [31.2, 121.5],
  "CN-GD": [23.4, 113.4],
  "CN-JS": [32.1, 119.5],
  "CN-XZ": [29.6, 91.1],
  "CN-ZJ": [29.1, 120.0],
  "CN-SN": [35.2, 108.9],
  // Mexico
  "MX-CMX": [19.4, -99.1],
  "MX-YUC": [20.7, -89.1],
  "MX-CHH": [28.6, -106.1],
  "MX-PUE": [19.0, -98.2],
  "MX-NLE": [25.6, -99.7],
  // Portugal
  "PT-30": [32.7, -17.0],
  "PT-20": [37.7, -25.5],
  // Romania
  "RO-B": [44.4, 26.1],
  // Korea
  "KR-11": [37.6, 127.0],
  // Argentina
  "AR-PUB": [-34.6, -64.0],
  // Bosnia
  "BA-BIH": [44.0, 17.5],
  "BA-SRP": [44.3, 18.6],
  "BA-BRC": [44.9, 18.8],
  // Brazil
  "BR-FED": [-15.8, -47.9],
  // Finland
  "FI-MUNI": [60.2, 25.0],
  // Greece
  "GR-PUB": [37.9, 23.7],
  // Russia
  "RU-COEF": [57.0, 60.0],
  "RU-MATCAP": [57.0, 83.0],
};

export type SubIndicator = "paternity" | "parental" | "total";

interface FlatSub {
  entity: SubnationalEntity;
  countryName: string;
  countryIso2: string;
  coords: [number, number];
  value: number | null;
}

interface Props {
  countries: Country[];
  indicator: SubIndicator;
  onIndicatorChange: (ind: SubIndicator) => void;
  onSelectEntity: (code: string | null) => void;
  selectedCode: string | null;
  lang: "fr" | "en";
}

function getEntityValue(entity: SubnationalEntity, indicator: SubIndicator): number | null {
  switch (indicator) {
    case "paternity":
      return entity.paternity?.exists ? (entity.paternity.durationMonths?.total ?? null) : null;
    case "parental":
      return entity.parental?.exists ? (entity.parental.durationMonths?.total ?? null) : null;
    case "total": {
      let total = 0;
      let hasAny = false;
      if (entity.maternity?.exists && entity.maternity.durationMonths?.paid) {
        total += entity.maternity.durationMonths.paid;
        hasAny = true;
      }
      if (entity.paternity?.exists && entity.paternity.durationMonths?.paid) {
        total += entity.paternity.durationMonths.paid;
        hasAny = true;
      }
      if (entity.parental?.exists && entity.parental.durationMonths?.paid) {
        total += entity.parental.durationMonths.paid;
        hasAny = true;
      }
      return hasAny ? total : null;
    }
  }
}

function valueToColor(value: number | null, min: number, max: number, isQC: boolean): string {
  if (isQC) return "#3b82f6";
  if (value === null || value === 0) return "#94a3b8";
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const r = Math.round(253 - ratio * (253 - 13));
  const g = Math.round(230 - ratio * (230 - 148));
  const b = Math.round(138 - ratio * (138 - 136));
  return `rgb(${r},${g},${b})`;
}

const INDICATOR_LABELS: Record<SubIndicator, { fr: string; en: string }> = {
  paternity: { fr: "Congé paternité", en: "Paternity leave" },
  parental:  { fr: "Congé parental",  en: "Parental leave" },
  total:     { fr: "Total payé",      en: "Total paid" },
};

export function SubnationalMap({
  countries,
  indicator,
  onIndicatorChange,
  onSelectEntity,
  selectedCode,
  lang,
}: Props) {
  const points = useMemo<FlatSub[]>(() => {
    const result: FlatSub[] = [];
    countries.forEach((c) => {
      (c.subnational || []).forEach((sub) => {
        const coords = ENTITY_COORDS[sub.code];
        if (!coords) return;
        const value = getEntityValue(sub, indicator);
        result.push({
          entity: sub,
          countryName: c.name,
          countryIso2: c.iso2,
          coords,
          value,
        });
      });
    });
    return result;
  }, [countries, indicator]);

  const { min, max } = useMemo(() => {
    const values = points.map((p) => p.value).filter((v): v is number => v !== null && v > 0);
    return {
      min: Math.min(...values, 0),
      max: Math.max(...values, 1),
    };
  }, [points]);

  return (
    <div className="space-y-3">
      {/* Indicator selector pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          {lang === "fr" ? "Indicateur :" : "Indicator:"}
        </span>
        {(["paternity", "parental", "total"] as SubIndicator[]).map((ind) => (
          <button
            key={ind}
            onClick={() => onIndicatorChange(ind)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              indicator === ind
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {INDICATOR_LABELS[ind][lang]}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
        <MapContainer
          center={[30, 10]}
          zoom={2}
          minZoom={1}
          maxZoom={8}
          className="h-[440px] w-full"
          scrollWheelZoom={true}
          style={{ background: "#f8fafc" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />
          {points.map((pt) => {
            const isQC = pt.entity.code === "CA-QC";
            const isSelected = selectedCode === pt.entity.code;
            const color = valueToColor(pt.value, min, max, isQC);
            const label = INDICATOR_LABELS[indicator][lang];

            return (
              <CircleMarker
                key={pt.entity.code}
                center={pt.coords}
                radius={isSelected ? 14 : isQC ? 12 : 9}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.9,
                  color: isSelected ? "#0f172a" : isQC ? "#1e40af" : "#475569",
                  weight: isSelected ? 3 : isQC ? 2 : 1,
                }}
                eventHandlers={{
                  click: () =>
                    onSelectEntity(isSelected ? null : pt.entity.code),
                }}
              >
                {/* Permanent label for Quebec */}
                {isQC && (
                  <Tooltip
                    permanent
                    direction="right"
                    offset={[14, 0]}
                    className="quebec-label"
                  >
                    <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold text-xs px-2.5 py-1 rounded-full border border-blue-300 dark:border-blue-700 shadow-sm whitespace-nowrap">
                      ⚜️ Québec (RQAP)
                    </span>
                  </Tooltip>
                )}
                {!isQC && (
                  <Tooltip sticky>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{pt.entity.name}</p>
                      <p className="text-slate-500 dark:text-slate-400">{pt.countryName}</p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {label} :{" "}
                        <strong>
                          {pt.value !== null
                            ? formatDuration(pt.value, lang)
                            : lang === "fr"
                            ? "Données non disponibles"
                            : "Data not available"}
                        </strong>
                      </p>
                    </div>
                  </Tooltip>
                )}
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-lg p-3.5 z-[1000] text-xs space-y-2 border border-slate-200/80 dark:border-slate-700/80 max-w-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {INDICATOR_LABELS[indicator][lang]}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">{formatDuration(min || 0, lang)}</span>
            <div
              className="h-3 w-28 rounded-md shadow-inner"
              style={{
                background: `linear-gradient(to right, ${valueToColor(min || 0.1, min, max, false)}, ${valueToColor(max, min, max, false)})`,
              }}
            />
            <span className="text-slate-500 font-mono text-[11px]">{formatDuration(max, lang)}</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
            <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Québec (RQAP)</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px]">
            {lang === "fr" ? "Cliquer sur un point pour filtrer" : "Click a point to filter"}
          </p>
        </div>
      </div>
    </div>
  );
}
