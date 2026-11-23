import { useYear } from "../../contexts/YearContext";
import { useTranslation } from "../../hooks/useTranslation";
import { editionTone } from "../../utils/editionTone";

/** Pastille « Données 2026 » : rappelle partout l'édition affichée. */
export function EditionBadge({ className = "" }: { className?: string }) {
  const { year, editions, edition } = useYear();
  const { t } = useTranslation();
  if (year === null || editions.length < 2) return null;
  const tone = editionTone(year, editions.map((e) => e.year));
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold font-sans tracking-normal align-middle whitespace-nowrap ${tone} ${className}`}
    >
      {t("edition_data")}
      {edition?.status === "provisional" && (
        <span className="font-normal opacity-80">({t("edition_provisional")})</span>
      )}
    </span>
  );
}

/** Mention « 2025 : 3,7 mois » à côté d'une valeur qui diffère de l'édition précédente. */
export function PreviousValue({ text }: { text: string }) {
  const { previousYear, editions } = useYear();
  const { lang } = useTranslation();
  if (previousYear === null) return null;
  const tone = editionTone(previousYear, editions.map((e) => e.year));
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium tabular-nums whitespace-nowrap ${tone}`}>
      {previousYear}{lang === "fr" ? " : " : ": "}{text}
    </span>
  );
}
