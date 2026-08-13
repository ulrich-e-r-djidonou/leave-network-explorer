import type { MapIndicator } from "../../types";
import { INDICATOR_LABEL_KEYS } from "../../utils/calculations";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";

interface Props {
  value: MapIndicator;
  onChange: (indicator: MapIndicator) => void;
}

const INDICATORS: MapIndicator[] = [
  "total_leave",
  "generosity",
  "gender_equality",
  "maternity_total",
  "maternity_wellPaid",
  "paternity_total",
  "paternity_wellPaid",
  "parental_total",
  "parental_wellPaid",
  "pension",
];

export function IndicatorSelector({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {INDICATORS.map((ind) => {
        const isSelected = value === ind;
        return (
          <button
            key={ind}
            onClick={() => onChange(ind)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer ${
              isSelected
                ? "bg-teal-600 text-white ring-2 ring-teal-400/30 scale-[1.02]"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t(INDICATOR_LABEL_KEYS[ind] as TranslationKey)}
          </button>
        );
      })}
    </div>
  );
}
