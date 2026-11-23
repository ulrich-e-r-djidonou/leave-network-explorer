import { useMemo } from "react";
import type { Country } from "../types";
import { useYear } from "../contexts/YearContext";
import { diffEditions, type EditionDiff } from "../utils/editionDiff";

/** Différences entre l'édition affichée et l'édition précédente (null s'il n'y en a pas). */
export function useEditionDiff(): EditionDiff | null {
  const { data, previousData } = useYear();
  return useMemo(
    () => (data && previousData ? diffEditions(data, previousData) : null),
    [data, previousData],
  );
}

/**
 * Fiche du même pays dans l'édition précédente.
 * `undefined` : pas d'édition précédente chargée ; `null` : pays absent de l'édition précédente.
 */
export function usePreviousCountry(iso2: string): Country | null | undefined {
  const { previousData } = useYear();
  return useMemo(() => {
    if (!previousData) return undefined;
    return previousData.countries.find((c) => c.iso2 === iso2) ?? null;
  }, [previousData, iso2]);
}
