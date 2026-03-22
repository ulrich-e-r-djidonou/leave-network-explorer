import { useState, useEffect } from "react";
import type { CountryData, Country } from "../types";

export function useCountryData() {
  const [data, setData] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/countries.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load country data:", err);
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

export function getCountryByIso2(
  countries: Country[],
  iso2: string
): Country | undefined {
  return countries.find(
    (c) => c.iso2.toUpperCase() === iso2.toUpperCase()
  );
}

export function getCountryByIso3(
  countries: Country[],
  iso3: string
): Country | undefined {
  return countries.find(
    (c) => c.iso3.toUpperCase() === iso3.toUpperCase()
  );
}

/** Flatten countries + subnational entities into a list of comparable items */
export interface ComparableEntity {
  id: string;
  label: string;
  isSubnational: boolean;
  parentName?: string;
  country: Country; // the underlying Country data (or a synthetic one for subnational)
}

export function getComparableEntities(countries: Country[]): ComparableEntity[] {
  const entities: ComparableEntity[] = countries.map((c) => ({
    id: c.iso2,
    label: c.name,
    isSubnational: false,
    country: c,
  }));

  for (const c of countries) {
    if (c.subnational) {
      for (const sub of c.subnational) {
        // Only include subnational entities that have leave data
        if (sub.maternity?.exists || sub.paternity?.exists || sub.parental?.exists) {
          const synthetic: Country = {
            ...c,
            name: `${c.name} — ${sub.name}`,
            iso2: sub.code || `${c.iso2}-${sub.name}`,
            iso3: sub.code || c.iso3,
            subnational: undefined,
            subnationalVariations: [],
            maternity: sub.maternity?.exists
              ? { ...c.maternity, ...sub.maternity, durationMonths: { ...c.maternity.durationMonths, ...(sub.maternity?.durationMonths || {}) } } as any
              : c.maternity,
            paternity: sub.paternity?.exists
              ? { ...c.paternity, ...sub.paternity, durationMonths: { ...c.paternity.durationMonths, ...(sub.paternity?.durationMonths || {}) } } as any
              : c.paternity,
            parental: sub.parental?.exists
              ? { ...c.parental, ...sub.parental, durationMonths: { ...c.parental.durationMonths, ...(sub.parental?.durationMonths || {}) } } as any
              : c.parental,
          };
          entities.push({
            id: sub.code || `${c.iso2}-${sub.name}`,
            label: `${c.name} — ${sub.name}`,
            isSubnational: true,
            parentName: c.name,
            country: synthetic,
          });
        }
      }
    }
  }

  return entities;
}
