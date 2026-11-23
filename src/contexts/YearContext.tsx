import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CountryData, EditionEntry, EditionIndex } from '../types';

interface YearContextType {
  editions: EditionEntry[];
  year: number | null;
  setYear: (year: number) => void;
  edition: EditionEntry | null;
  data: CountryData | null;
  loading: boolean;
}

const YearContext = createContext<YearContextType>({
  editions: [],
  year: null,
  setYear: () => {},
  edition: null,
  data: null,
  loading: true,
});

const STORAGE_KEY = 'ln_year';
const dataUrl = (file: string) => `${import.meta.env.BASE_URL}data/${file}`;

function readSavedYear(): number | null {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(saved) && saved > 0 ? saved : null;
  } catch {
    return null;
  }
}

export function YearProvider({ children }: { children: ReactNode }) {
  const [editions, setEditions] = useState<EditionEntry[]>([]);
  const [year, setYearState] = useState<number | null>(null);
  const [cache, setCache] = useState<Record<number, CountryData>>({});
  const [failed, setFailed] = useState(false);

  // Index des éditions : l'année mémorisée n'est retenue que si elle existe encore.
  useEffect(() => {
    fetch(dataUrl('years.json'))
      .then((res) => res.json() as Promise<EditionIndex>)
      .then((index) => {
        setEditions(index.years);
        const saved = readSavedYear();
        const known = index.years.some((e) => e.year === saved);
        setYearState(known ? saved : index.default);
      })
      .catch((err) => {
        console.error('Failed to load edition index:', err);
        setFailed(true);
      });
  }, []);

  const edition = editions.find((e) => e.year === year) ?? null;

  useEffect(() => {
    if (!edition || cache[edition.year]) return;
    fetch(dataUrl(edition.file))
      .then((res) => res.json() as Promise<CountryData>)
      .then((json) => setCache((prev) => ({ ...prev, [edition.year]: json })))
      .catch((err) => {
        console.error('Failed to load country data:', err);
        setFailed(true);
      });
  }, [edition, cache]);

  const setYear = (newYear: number) => {
    if (!editions.some((e) => e.year === newYear)) return;
    setYearState(newYear);
    try {
      localStorage.setItem(STORAGE_KEY, String(newYear));
    } catch {
      // Stockage indisponible : le choix vaut pour la session seulement.
    }
  };

  const data = year !== null ? cache[year] ?? null : null;
  const loading = !failed && data === null;

  return (
    <YearContext.Provider value={{ editions, year, setYear, edition, data, loading }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  return useContext(YearContext);
}
