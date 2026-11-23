import type { Country, CountryData } from "../types";
import type { TranslationKey } from "../i18n/translations";
import { formatDuration } from "./calculations";

/** Nature d'un champ comparé, qui fixe son affichage. */
export type FieldKind = "months" | "ageMonths" | "percent" | "bool";

export interface TrackedField {
  /** Chemin dans l'objet Country, par exemple "maternity.durationMonths.total". */
  path: string;
  section: TranslationKey;
  label: TranslationKey;
  kind: FieldKind;
}

/**
 * Champs nationaux comparés d'une édition à l'autre. Les textes (notes, financement,
 * réformes récentes) sont exclus : la page Réformes décrit déjà les changements.
 */
export const TRACKED_FIELDS: TrackedField[] = [
  ...(["maternity", "paternity", "parental"] as const).flatMap((leave) => {
    const section = `${leave}_leave` as TranslationKey;
    return [
      { path: `${leave}.durationMonths.total`, section, label: "total_duration" as TranslationKey, kind: "months" as const },
      { path: `${leave}.durationMonths.paid`, section, label: "paid_duration" as TranslationKey, kind: "months" as const },
      { path: `${leave}.durationMonths.wellPaid`, section, label: "well_paid" as TranslationKey, kind: "months" as const },
      { path: `${leave}.paymentRate`, section, label: "rate" as TranslationKey, kind: "percent" as const },
    ];
  }),
  { path: "parental.motherQuotaMonths", section: "parental_leave", label: "mother_quota", kind: "months" },
  { path: "parental.fatherQuotaMonths", section: "parental_leave", label: "father_quota", kind: "months" },
  { path: "childcareLeave.durationMonths", section: "childcare_leave", label: "total_duration", kind: "months" },
  { path: "ecec.universalEntitlement", section: "ecec", label: "universal_entitlement", kind: "bool" },
  { path: "ecec.entitlementAgeMonths", section: "ecec", label: "entitlement_age", kind: "ageMonths" },
  { path: "ecec.gapAfterLeaveMonths", section: "ecec", label: "gap_after_leave", kind: "months" },
];

export type FieldValue = number | boolean | null;

export function readField(country: Country, path: string): FieldValue {
  let cur: unknown = country;
  for (const key of path.split(".")) {
    if (cur === null || typeof cur !== "object") return null;
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === "number" || typeof cur === "boolean" ? cur : null;
}

/** Égalité tolérante aux arrondis d'affichage (deux décimales). */
export function sameValue(a: FieldValue, b: FieldValue): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 0.005;
  return a === b;
}

export function formatFieldValue(value: FieldValue, kind: FieldKind, lang: "fr" | "en"): string {
  if (value === null) return "N/A";
  if (kind === "bool") return value ? (lang === "fr" ? "Oui" : "Yes") : lang === "fr" ? "Non" : "No";
  if (typeof value !== "number") return String(value);
  if (kind === "percent") return `${value}%`;
  if (kind === "ageMonths") return `${value} ${lang === "fr" ? "mois" : "months"}`;
  return formatDuration(value, lang);
}

export interface FieldChange {
  field: TrackedField;
  before: FieldValue;
  after: FieldValue;
}

export interface CountryChanges {
  country: Country;
  changes: FieldChange[];
}

export interface EditionDiff {
  changed: CountryChanges[];
  added: Country[];
  removed: Country[];
  valueCount: number;
}

export function diffCountry(current: Country, previous: Country): FieldChange[] {
  return TRACKED_FIELDS.flatMap((field) => {
    const after = readField(current, field.path);
    const before = readField(previous, field.path);
    return sameValue(before, after) ? [] : [{ field, before, after }];
  });
}

export function diffEditions(current: CountryData, previous: CountryData): EditionDiff {
  const prevByIso = new Map(previous.countries.map((c) => [c.iso2, c]));
  const curIso = new Set(current.countries.map((c) => c.iso2));
  const changed: CountryChanges[] = [];
  const added: Country[] = [];
  for (const c of current.countries) {
    const p = prevByIso.get(c.iso2);
    if (!p) {
      added.push(c);
      continue;
    }
    const changes = diffCountry(c, p);
    if (changes.length > 0) changed.push({ country: c, changes });
  }
  const removed = previous.countries.filter((c) => !curIso.has(c.iso2));
  return {
    changed,
    added,
    removed,
    valueCount: changed.reduce((n, c) => n + c.changes.length, 0),
  };
}
