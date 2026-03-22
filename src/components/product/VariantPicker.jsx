import React, { useMemo } from "react";
import { useI18n } from "../../context/I18nContext";
import { formatMoney } from "../../utils/currency";
import Badge from "../ui/Badge";

export default function VariantPicker({ variants = [], value, onChange }) {
  const { pick } = useI18n();
  const ui = pick({
    fr: { fallback: "Variante n°{id}", stock: "Stock : {stock}" },
    en: { fallback: "Variant #{id}", stock: "Stock: {stock}" },
    ar: { fallback: "الخيار #{id}", stock: "المخزون: {stock}" },
  });

  const options = useMemo(
    () =>
      variants.map((variant) => ({
        id: variant.id,
        label:
          [variant.color, variant.finish, variant.capacity].filter(Boolean).join(" • ") ||
          ui.fallback.replace("{id}", variant.id),
        price: variant.price,
        stock: variant.stock,
      })),
    [ui.fallback, variants]
  );

  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
            value === option.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">{option.label}</div>
            <Badge>{formatMoney(option.price)}</Badge>
          </div>
          <div className="mt-1 text-xs text-slate-500">{ui.stock.replace("{stock}", option.stock)}</div>
        </button>
      ))}
    </div>
  );
}
