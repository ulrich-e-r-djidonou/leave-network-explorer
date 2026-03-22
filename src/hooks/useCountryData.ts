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
