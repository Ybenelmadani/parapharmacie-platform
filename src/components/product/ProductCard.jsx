import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingCart } from "lucide-react";
import Button from "../ui/Button";
import { useCart } from "../../context/CartContext";
import { CatalogAPI } from "../../api/catalog";
import { resolveMediaUrl } from "../../utils/media";
import { useI18n } from "../../context/I18nContext";
import { useToast } from "../../context/ToastContext";
import { formatMoney } from "../../utils/currency";

const LOW_STOCK_LIMIT = 10;

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { pick } = useI18n();
  const { error: notifyError } = useToast();
  const ui = pick({
    fr: {
      outOfStock: "En rupture",
      lowStock: "Stock faible ({count})",
      inStock: "En stock ({count})",
      noVariant: "Aucune variante achetable n'est disponible pour ce produit.",
      noImage: "Aucune image",
      view: "Voir {name}",
      unavailable: "Indisponible",
      onlyLeft: "Plus que {count}",
      seeVariants: "Voir les variantes",
      addToCart: "Ajouter au panier",
      adding: "Ajout...",
    },
    en: {
      outOfStock: "Out of stock",
      lowStock: "Low stock ({count})",
      inStock: "In stock ({count})",
      noVariant: "No purchasable variant is available for this product.",
      noImage: "No image",
      view: "View {name}",
      unavailable: "Unavailable",
      onlyLeft: "Only {count} left",
      seeVariants: "See variants",
      addToCart: "Add to cart",
      adding: "Adding...",
    },
    ar: {
      outOfStock: "غير متوفر",
      lowStock: "مخزون منخفض ({count})",
      inStock: "متوفر ({count})",
      noVariant: "لا توجد نسخة قابلة للشراء لهذا المنتج.",
      noImage: "لا توجد صورة",
      view: "عرض {name}",
      unavailable: "غير متاح",
      onlyLeft: "المتبقي {count} فقط",
      seeVariants: "عرض الخيارات",
      addToCart: "أضف إلى السلة",
      adding: "جارٍ الإضافة...",
    },
  });
  const [adding, setAdding] = useState(false);

  const mainImg = resolveMediaUrl(
    p.images?.find((i) => i.is_main)?.image_path || p.images?.[0]?.image_path
  );
  const firstAvailableVariant = p.variants?.find((v) => Number(v.stock) > 0) || p.variants?.[0] || null;
  const displayPrice = Number(firstAvailableVariant?.price ?? 0);
  const totalStock = Array.isArray(p.variants)
    ? p.variants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0)
    : 0;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= LOW_STOCK_LIMIT;
  const stockBadge = isOutOfStock
    ? { label: ui.outOfStock, className: "bg-slate-100 text-slate-700" }
    : isLowStock
      ? { label: ui.lowStock.replace("{count}", totalStock), className: "bg-amber-500 text-white" }
      : { label: ui.inStock.replace("{count}", totalStock), className: "bg-emerald-500 text-white" };

  const resolveVariantId = async () => {
    if (firstAvailableVariant?.id) return firstAvailableVariant.id;

    const fullProduct = await CatalogAPI.product(p.id);
    const fallbackVariant =
      fullProduct?.variants?.find((v) => Number(v.stock) > 0) || fullProduct?.variants?.[0] || null;

    return fallbackVariant?.id || null;
  };

  const handleAddToCart = async () => {
    if (adding || isOutOfStock) return;

    setAdding(true);
    try {
      const variantId = await resolveVariantId();
      if (!variantId) {
        notifyError(ui.noVariant);
        return;
      }
      await add(variantId, 1);
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <Link to={`/products/${p.id}`} className="block">
          <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
            {mainImg ? (
              <img
                src={mainImg}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">{ui.noImage}</div>
            )}
          </div>
        </Link>

        <div className={`absolute left-3 top-3 z-10 rounded-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-sm ${stockBadge.className}`}>
          {stockBadge.label}
        </div>

        <Link
          to={`/products/${p.id}`}
          aria-label={ui.view.replace("{name}", p.name)}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition-colors hover:bg-slate-900 hover:text-white"
        >
          <Eye size={17} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="truncate text-xs text-slate-500">
          {p.brand?.name} | {p.category?.name}
        </div>
        <div
          className="mt-1 min-h-[70px] font-bold leading-tight text-slate-900"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {p.name}
        </div>

        <div className="mt-2 flex min-h-[28px] items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
          <span className="text-sm font-medium">
            {isOutOfStock ? ui.unavailable : isLowStock ? ui.onlyLeft.replace("{count}", totalStock) : ui.seeVariants}
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            {formatMoney(displayPrice)}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <Button className="w-full gap-2" onClick={handleAddToCart} disabled={adding || isOutOfStock}>
            <ShoppingCart size={16} />
            {adding ? ui.adding : isOutOfStock ? ui.outOfStock : ui.addToCart}
          </Button>
        </div>
      </div>
    </div>
  );
}
