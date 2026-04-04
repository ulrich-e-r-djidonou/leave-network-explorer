import type { MapIndicator } from "../../types";
import { INDICATOR_LABEL_KEYS } from "../../utils/calculations";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n/translations";

interface Props {
  value: MapIndicator;
  onChange: (indicator: MapIndicator) => void;
}

const INDICATORS: MapIndicator[] = [
  "maternity_total",
  "maternity_wellPaid",
  "paternity_total",
  "paternity_wellPaid",
  "parental_total",
  "parental_wellPaid",
  "total_leave",
  "gender_equality",
];

export function IndicatorSelector({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {INDICATORS.map((ind) => (
        <button
          key={ind}
          onClick={() => onChange(ind)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            value === ind
              ? "bg-teal-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t(INDICATOR_LABEL_KEYS[ind] as TranslationKey)}
        </button>
      ))}
    </div>
  );
}
