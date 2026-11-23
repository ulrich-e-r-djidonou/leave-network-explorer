// Une teinte par édition, dans l'ordre chronologique. Le texte porte toujours l'année :
// la couleur aide à repérer l'édition, elle ne la signale jamais seule.
const TONES = [
  "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800/60",
  "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800/60",
  "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/60",
  "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:border-orange-800/60",
];

export function editionTone(year: number | null, years: number[]): string {
  const sorted = [...years].sort((a, b) => a - b);
  const i = year === null ? -1 : sorted.indexOf(year);
  return TONES[(i < 0 ? 0 : i) % TONES.length];
}
