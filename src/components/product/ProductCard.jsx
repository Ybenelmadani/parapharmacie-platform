import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-para-marine-100 bg-white shadow-[0_10px_20px_rgba(59,130,246,0.04)] transition-all hover:shadow-[0_20px_40px_rgba(22,163,74,0.08)]"
    >
      <div className="relative">
        <Link to={`/products/${p.id}`} className="block">
          <div className="aspect-square bg-white overflow-hidden p-6 relative flex items-center justify-center">
            {mainImg ? (
              <img
                src={mainImg}
                alt={p.name}
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300 text-sm tracking-wide">{ui.noImage}</div>
            )}
          </div>
        </Link>

        {stockBadge.label && (
          <div className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-md ${stockBadge.className}`}>
            {stockBadge.label}
          </div>
        )}

        <Link
          to={`/products/${p.id}`}
          aria-label={ui.view.replace("{name}", p.name)}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-para-marine-200 bg-white/95 text-slate-400 shadow-sm transition-all hover:bg-para-green-500 hover:text-white hover:border-transparent"
        >
          <Eye size={16} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-5 bg-[#03045e] text-white relative">
        <div className="truncate text-[11px] font-semibold tracking-widest uppercase text-white/60 mb-1">
          {p.brand?.name}
        </div>
        <div
          className="min-h-[50px] text-[15px] font-bold leading-tight text-white transition-colors group-hover:text-white/80"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {p.name}
        </div>

        <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-black text-white tracking-tight">
              {formatMoney(displayPrice)}
            </span>
            <span className="text-[11px] font-medium text-white/70 hidden sm:inline-block">
              {isOutOfStock ? ui.unavailable : isLowStock ? ui.onlyLeft.replace("{count}", totalStock) : ui.seeVariants}
            </span>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button 
            onClick={handleAddToCart} 
            disabled={adding || isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${isOutOfStock ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white text-[#03045e] hover:bg-white/90 shadow-[0_8px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_24px_rgba(255,255,255,0.25)]'}`}
           >
            <ShoppingCart size={16} />
            {adding ? ui.adding : isOutOfStock ? ui.outOfStock : ui.addToCart}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
