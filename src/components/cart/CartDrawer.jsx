import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useI18n } from "../../context/I18nContext";
import { STORE_SHIPPING_FEE } from "../../config/store";
import { formatMoney } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";

export default function CartDrawer() {
  const nav = useNavigate();
  const { pick } = useI18n();
  const { open, setOpen, items, total, updateQty, remove, loading } = useCart();
  const ui = pick({
    fr: {
      miniCart: "Mini panier",
      yourCart: "Votre panier",
      close: "Fermer le panier",
      loading: "Chargement...",
      empty: "Votre panier est vide.",
      continueShopping: "Continuer vos achats",
      noImage: "Aucune image",
      decrease: "Diminuer la quantite",
      increase: "Augmenter la quantite",
      remove: "Supprimer cet article",
      shipping: "Livraison",
      total: "Total",
      item: "article",
      items: "articles",
      viewCart: "Voir le panier",
      checkout: "Paiement",
      product: "Produit",
    },
    en: {
      miniCart: "Mini cart",
      yourCart: "Your cart",
      close: "Close cart",
      loading: "Loading...",
      empty: "Your cart is empty.",
      continueShopping: "Continue shopping",
      noImage: "No image",
      decrease: "Decrease quantity",
      increase: "Increase quantity",
      remove: "Remove this item",
      shipping: "Shipping",
      total: "Total",
      item: "item",
      items: "items",
      viewCart: "View cart",
      checkout: "Checkout",
      product: "Product",
    },
    ar: {
      miniCart: "السلة المصغرة",
      yourCart: "سلتك",
      close: "إغلاق السلة",
      loading: "جارٍ التحميل...",
      empty: "سلتك فارغة.",
      continueShopping: "متابعة التسوق",
      noImage: "لا توجد صورة",
      decrease: "تقليل الكمية",
      increase: "زيادة الكمية",
      remove: "حذف هذا العنصر",
      shipping: "التوصيل",
      total: "الإجمالي",
      item: "عنصر",
      items: "عناصر",
      viewCart: "عرض السلة",
      checkout: "إتمام الشراء",
      product: "منتج",
    },
  });

  const articleCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  if (!open) return null;

  const shipping = items.length > 0 ? STORE_SHIPPING_FEE : 0;
  const grandTotal = total + shipping;

  const navigateFromDrawer = (path) => {
    setOpen(false);
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    nav(path);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-full flex-col border-l border-black/5 bg-[#f7f5f2] shadow-[0_20px_80px_rgba(15,23,42,0.18)] sm:max-w-[420px] lg:max-w-[460px]">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-slate-500 sm:text-[11px] sm:tracking-[0.45em]">{ui.miniCart}</p>
            <h2 className="mt-1.5 text-base font-semibold uppercase tracking-[0.1em] text-slate-900 sm:mt-2 sm:text-2xl sm:tracking-[0.16em]">{ui.yourCart}</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-slate-600 transition hover:bg-white hover:text-slate-900 sm:h-11 sm:w-11"
            aria-label={ui.close}
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-3 pb-4 sm:px-6 sm:pb-5">
          {loading ? (
            <div className="rounded-[24px] bg-white px-5 py-8 text-center text-slate-500">{ui.loading}</div>
          ) : items.length === 0 ? (
            <div className="rounded-[24px] bg-white px-5 py-8 text-center text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <p>{ui.empty}</p>
              <Link
                to="/products"
                onClick={(event) => {
                  event.preventDefault();
                  navigateFromDrawer("/products");
                }}
                className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-[14px] bg-[#0ea5e9] px-6 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#0284c7]"
              >
                {ui.continueShopping}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const product = item.variant?.product;
                const image = resolveMediaUrl(
                  product?.images?.find((entry) => entry.is_main)?.image_path || product?.images?.[0]?.image_path
                );
                const lineTotal = Number(item.unit_price || 0) * Number(item.quantity || 0);
                const variantLabel = [item.variant?.color, item.variant?.finish, item.variant?.capacity].filter(Boolean).join(" | ");

                return (
                  <div key={item.id} className="rounded-[20px] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:rounded-[24px] sm:p-4">
                    <div className="flex gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white border border-slate-200 sm:h-20 sm:w-20 sm:rounded-[16px]">
                        {image ? (
                          <img src={image} alt={product?.name || ui.product} className="h-full w-full object-contain p-2" />
                        ) : (
                          <div className="text-xs font-medium text-slate-400">{ui.noImage}</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[11px] font-semibold uppercase leading-5 text-slate-900 sm:text-[13px]">
                          {product?.name || "Produit"}
                        </p>
                        {variantLabel ? <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-400 sm:text-[11px] sm:tracking-[0.12em]">{variantLabel}</p> : null}
                        <p className="mt-2 text-[15px] font-semibold text-slate-900 sm:text-lg">{formatMoney(item.unit_price)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="flex h-10 items-center rounded-full bg-[#f1efed] px-1.5 sm:h-11 sm:px-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 sm:h-8 sm:w-8"
                          aria-label={ui.decrease}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-[28px] text-center text-sm font-semibold text-slate-800 sm:min-w-[30px] sm:text-base">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900 sm:h-8 sm:w-8"
                          aria-label={ui.increase}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-3">
                        <p className="text-sm font-semibold text-slate-900 sm:text-base">{formatMoney(lineTotal)}</p>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-700 sm:h-9 sm:w-9"
                          aria-label={ui.remove}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-black/10 bg-white px-3 py-3 backdrop-blur sm:px-6 sm:py-4">
          <div className="rounded-[20px] bg-white border border-slate-200 shadow-sm p-3.5 sm:rounded-[24px] sm:p-4">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>{articleCount} {articleCount > 1 ? ui.items : ui.item}</span>
              <span className="font-semibold">{formatMoney(total)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
              <span>{ui.shipping}</span>
              <span className="font-semibold">{formatMoney(shipping)}</span>
            </div>
            <div className="my-3.5 h-px bg-black/10 sm:my-4" />
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-slate-900 sm:text-lg">{ui.total}</span>
              <span className="text-[1.6rem] font-semibold leading-none text-slate-900 sm:text-[1.7rem]">{formatMoney(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <Link
              to="/cart"
              onClick={(event) => {
                event.preventDefault();
                navigateFromDrawer("/cart");
              }}
              className="inline-flex min-h-[46px] w-full items-center justify-center rounded-[8px] bg-[#d8d5d2] px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#c9c6c2] sm:min-h-[50px] sm:px-5 sm:text-sm"
            >
              {ui.viewCart}
            </Link>
            <button
              type="button"
              onClick={() => {
                navigateFromDrawer("/checkout");
              }}
              disabled={items.length === 0}
              className="inline-flex min-h-[46px] w-full items-center justify-center rounded-[8px] bg-[#16a34a] px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[50px] sm:px-5 sm:text-sm"
            >
              {ui.checkout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
