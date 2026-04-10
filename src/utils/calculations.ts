import type { Country, MapIndicator } from "../types";
import { getGII, giiToScore } from "./giiData";

/** Get the numeric value for a given map indicator */
export function getIndicatorValue(
  country: Country,
  indicator: MapIndicator
): number | null {
  switch (indicator) {
    case "maternity_total":
      return country.maternity?.exists
        ? country.maternity?.durationMonths?.total ?? 0
        : 0;
    case "maternity_wellPaid":
      return country.maternity?.exists
        ? country.maternity?.durationMonths?.wellPaid ?? 0
        : 0;
    case "paternity_total":
      return country.paternity?.exists
        ? country.paternity?.durationMonths?.total ?? 0
        : 0;
    case "paternity_wellPaid":
      return country.paternity?.exists
        ? country.paternity?.durationMonths?.wellPaid ?? 0
        : 0;
    case "parental_total":
      return country.parental?.exists
        ? country.parental?.durationMonths?.total ?? 0
        : 0;
    case "parental_wellPaid":
      return country.parental?.exists
        ? country.parental?.durationMonths?.wellPaid ?? 0
        : 0;
    case "total_leave":
      return getTotalLeaveMonths(country);
    case "gender_equality":
      return getGenderEqualityScore(country);
    case "generosity":
      return getGenerosityScore(country);
    default:
      return null;
  }
}

/** Total paid leave across all types */
export function getTotalLeaveMonths(country: Country): number {
  let total = 0;
  if (country.maternity?.exists && country.maternity?.durationMonths?.paid)
    total += country.maternity.durationMonths.paid;
  if (country.paternity?.exists && country.paternity?.durationMonths?.paid)
    total += country.paternity.durationMonths.paid;
  if (country.parental?.exists && country.parental?.durationMonths?.paid)
    total += country.parental.durationMonths.paid;
  return total;
}

/**
 * Gender equality score (0–100) based on the UNDP Gender Inequality Index (GII).
 * GII ranges from 0 (equality) to 1 (inequality).
 * We convert: score = (1 - GII) × 100, so 100 = perfect equality.
 * Source: UNDP HDR 2025, data year 2023.
 */
export function getGenderEqualityScore(country: Country): number | null {
  const gii = getGII(country.iso2);
  return giiToScore(gii);
}

/**
 * Generosity score — Full-Time Equivalent (FTE) in months.
 * FTE = paid months × (replacement rate / 100), summed across maternity,
 * paternity and parental leave (Ray et al., 2010).
 * For flat-rate benefits the replacement rate should already be expressed
 * relative to median earnings in the source data.
 */
export function getGenerosityScore(country: Country): number {
  const fte = (months: number | null | undefined, rate: number | null | undefined) => {
    if (!months || !rate) return 0;
    return months * (rate / 100);
  };
  let total = 0;
  if (country.maternity?.exists)
    total += fte(country.maternity.durationMonths?.paid, country.maternity.paymentRate);
  if (country.paternity?.exists)
    total += fte(country.paternity.durationMonths?.paid, country.paternity.paymentRate);
  if (country.parental?.exists)
    total += fte(country.parental.durationMonths?.paid, country.parental.paymentRate);
  return Math.round(total * 10) / 10;
}

/** Total well-paid leave months (≥66% replacement rate) across all types */
export function getTotalWellPaidMonths(country: Country): number {
  let total = 0;
  if (country.maternity?.exists && country.maternity?.durationMonths?.wellPaid)
    total += country.maternity.durationMonths.wellPaid;
  if (country.paternity?.exists && country.paternity?.durationMonths?.wellPaid)
    total += country.paternity.durationMonths.wellPaid;
  if (country.parental?.exists && country.parental?.durationMonths?.wellPaid)
    total += country.parental.durationMonths.wellPaid;
  return total;
}

/** Format months to a human-readable string (always in months, 2 decimal places) */
export function formatDuration(months: number | null, lang: 'fr' | 'en' = 'fr'): string {
  if (months === null || months === undefined) return "N/A";
  if (months === 0) return lang === 'en' ? "0 months" : "0 mois";
  const label = lang === 'en' ? 'months' : 'mois';
  // Always show 2 decimal places for precision, drop trailing zeros for clean display
  const formatted = months % 1 === 0 ? `${months}` : `${months.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
  return `${formatted} ${label}`;
}

/** Get color for a value on a gradient scale */
export function getColorForValue(
  value: number | null,
  min: number,
  max: number
): string {
  if (value === null || value === undefined) return "#e5e7eb";
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  // gradient from light orange (#fef3c7) to deep teal (#0d9488)
  const r = Math.round(254 - ratio * (254 - 13));
  const g = Math.round(243 - ratio * (243 - 148));
  const b = Math.round(199 - ratio * (199 - 136));
  return `rgb(${r},${g},${b})`;
}

export const INDICATOR_LABEL_KEYS: Record<MapIndicator, string> = {
  maternity_total: 'ind_maternity_total',
  maternity_wellPaid: 'ind_maternity_wellPaid',
  paternity_total: 'ind_paternity_total',
  paternity_wellPaid: 'ind_paternity_wellPaid',
  parental_total: 'ind_parental_total',
  parental_wellPaid: 'ind_parental_wellPaid',
  total_leave: 'ind_total_leave',
  gender_equality: 'ind_gender_equality',
  generosity: 'ind_generosity',
};

export const REGIONS = [
  "All",
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Oceania",
  "Africa",
] as const;
