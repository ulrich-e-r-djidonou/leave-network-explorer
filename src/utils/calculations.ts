import type { Country, MapIndicator } from "../types";

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

/** Gender equality score (0-100): based on father quota share and paternity leave */
export function getGenderEqualityScore(country: Country): number {
  let score = 0;

  // Paternity leave exists and is paid (up to 30 pts)
  if (country.paternity?.exists && country.paternity?.durationMonths?.paid) {
    score += Math.min(30, country.paternity.durationMonths.paid * 10);
  }

  // Father quota in parental leave (up to 40 pts)
  if (country.parental?.exists && country.parental?.fatherQuotaMonths) {
    score += Math.min(40, country.parental.fatherQuotaMonths * 8);
  }

  // Individual entitlement type (20 pts)
  if (
    country.parental?.exists &&
    (country.parental?.entitlementType === "individual" ||
      country.parental?.entitlementType === "mixed")
  ) {
    score += 20;
  }

  // Non-transferable leave (10 pts)
  if (country.parental?.exists && !country.parental?.transferable) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

/** Generosity score (0-100): duration × payment × flexibility */
export function getGenerosityScore(country: Country): number {
  let score = 0;

  // Total paid duration (up to 40 pts)
  const totalPaid = getTotalLeaveMonths(country);
  score += Math.min(40, totalPaid * 2.5);

  // Well-paid duration (up to 30 pts)
  let wellPaid = 0;
  if (country.maternity?.durationMonths?.wellPaid)
    wellPaid += country.maternity.durationMonths.wellPaid;
  if (country.paternity?.durationMonths?.wellPaid)
    wellPaid += country.paternity.durationMonths.wellPaid;
  if (country.parental?.durationMonths?.wellPaid)
    wellPaid += country.parental.durationMonths.wellPaid;
  score += Math.min(30, wellPaid * 2);

  // Flexibility (up to 20 pts)
  const types = [country.maternity, country.paternity, country.parental].filter(Boolean);
  const hasFlexPartTime = types.some((t) => t?.exists && t?.flexPartTime);
  const hasFlexBlocks = types.some((t) => t?.exists && t?.flexBlocks);
  if (hasFlexPartTime) score += 10;
  if (hasFlexBlocks) score += 10;

  // ECEC universal entitlement (10 pts)
  if (country.ecec?.universalEntitlement) score += 10;

  return Math.min(100, Math.round(score));
}

/** Format months to a human-readable string */
export function formatDuration(months: number | null): string {
  if (months === null || months === undefined) return "N/A";
  if (months === 0) return "0";
  if (months < 1) {
    const weeks = Math.round(months * 4.3);
    return `${weeks} sem.`;
  }
  if (Number.isInteger(months)) return `${months} mois`;
  return `${months.toFixed(1)} mois`;
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

export const INDICATOR_LABELS: Record<MapIndicator, string> = {
  maternity_total: "Conge maternite (total)",
  maternity_wellPaid: "Conge maternite (bien paye)",
  paternity_total: "Conge paternite (total)",
  paternity_wellPaid: "Conge paternite (bien paye)",
  parental_total: "Conge parental (total)",
  parental_wellPaid: "Conge parental (bien paye)",
  total_leave: "Total conges payes (tous types)",
  gender_equality: "Score egalite des genres",
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
