/**
 * Gender Inequality Index (GII) — UNDP Human Development Report 2025
 * Source: https://hdr.undp.org/data-center/thematic-composite-indices/gender-inequality-index
 *
 * Scale: 0 (perfect equality) to 1 (maximum inequality)
 * Year: 2023
 *
 * Composite of: maternal mortality, adolescent birth rate, parliamentary seats,
 * secondary education, labour force participation.
 */
export const GII_DATA: Record<string, number> = {
  AR: 0.264,
  AT: 0.033,
  AU: 0.056,
  BA: 0.157,
  BE: 0.031,
  BG: 0.208,
  BR: 0.39,
  CA: 0.052,
  CH: 0.01,
  CL: 0.102,
  CN: 0.132,
  CO: 0.393,
  CY: 0.252,
  CZ: 0.088,
  DE: 0.057,
  DK: 0.003,
  EE: 0.061,
  ES: 0.043,
  FI: 0.021,
  FR: 0.034,
  GB: 0.083,
  GR: 0.103,
  HR: 0.074,
  HU: 0.213,
  IE: 0.054,
  IL: 0.08,
  IS: 0.024,
  IT: 0.043,
  JP: 0.059,
  KR: 0.038,
  LT: 0.07,
  LU: 0.044,
  LV: 0.117,
  MT: 0.111,
  MX: 0.358,
  NL: 0.013,
  NO: 0.004,
  NZ: 0.082,
  PL: 0.081,
  PT: 0.076,
  RO: 0.227,
  RS: 0.117,
  RU: 0.169,
  SE: 0.007,
  SI: 0.042,
  SK: 0.176,
  TR: 0.227,
  US: 0.169,
  UY: 0.218,
  VN: 0.299,
  ZA: 0.388,
};

/**
 * Get GII value for a country (0 = equality, 1 = inequality).
 * Returns null if not available (e.g. Ukraine).
 */
export function getGII(iso2: string): number | null {
  return GII_DATA[iso2?.toUpperCase()] ?? null;
}

/**
 * Convert GII to an equality score (0–100) for display.
 * 100 = perfect equality, 0 = maximum inequality.
 */
export function giiToScore(gii: number | null): number | null {
  if (gii === null) return null;
  return Math.round((1 - gii) * 100);
}
