import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useI18n } from "../context/I18nContext";
import { STORE_SHIPPING_FEE } from "../config/store";
import { formatMoney } from "../utils/currency";
import { resolveMediaUrl } from "../utils/media";

function getProductImage(item) {
  const product = item.variant?.product;
  const mainImage = product?.images?.find((image) => image.is_main)?.image_path;
  return resolveMediaUrl(mainImage || product?.images?.[0]?.image_path);
}

function getVariantLabel(item) {
  return [item.variant?.color, item.variant?.finish, item.variant?.capacity].filter(Boolean).join(" | ");
}

export default function Cart() {
  const nav = useNavigate();
  const { pick } = useI18n();
  const { items, total, loading, updateQty, remove, clear } = useCart();
  const ui = pick({
    fr: {
      title: "Panier d'achat",
      loading: "Chargement du panier...",
      empty: "Votre panier est vide.",
      continueShopping: "Continuer vos achats",
      noImage: "Aucune image",
      decrease: "Diminuer la quantite de {name}",
      increase: "Augmenter la quantite de {name}",
      remove: "Supprimer {name}",
      clear: "Vider le panier",
      item: "article",
      items: "articles",
      shipping: "Livraison",
      totalWithTax: "Total TTC",
      order: "Commander",
      product: "Produit",
    },
    en: {
      title: "Shopping cart",
      loading: "Loading cart...",
      empty: "Your cart is empty.",
      continueShopping: "Continue shopping",
      noImage: "No image",
      decrease: "Decrease quantity of {name}",
      increase: "Increase quantity of {name}",
      remove: "Remove {name}",
      clear: "Clear cart",
      item: "item",
      items: "items",
      shipping: "Shipping",
      totalWithTax: "Total incl. tax",
      order: "Place order",
      product: "Product",
    },
    ar: {
      title: "سلة التسوق",
      loading: "جارٍ تحميل السلة...",
      empty: "سلتك فارغة.",
      continueShopping: "متابعة التسوق",
      noImage: "لا توجد صورة",
      decrease: "تقليل كمية {name}",
      increase: "زيادة كمية {name}",
      remove: "حذف {name}",
      clear: "تفريغ السلة",
      item: "عنصر",
      items: "عناصر",
      shipping: "التوصيل",
      totalWithTax: "الإجمالي شامل الضريبة",
      order: "تأكيد الطلب",
      product: "منتج",
    },
  });

  const articleCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const shipping = items.length > 0 ? STORE_SHIPPING_FEE : 0;
  const grandTotal = total + shipping;

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50/50">
      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-6 lg:py-9">
        <div className="mb-8 text-center lg:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.55em] text-slate-500">{ui.title}</p>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-black/5 bg-white px-6 py-12 text-center text-slate-500 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            {ui.loading}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[28px] border border-black/5 bg-white px-6 py-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
            <p className="text-lg font-semibold text-slate-800">{ui.empty}</p>
            <Link
              to="/products"
              className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-[16px] bg-[#03045e] px-8 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#020340]"
            >
              {ui.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-7">
            <section className="min-w-0">
              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-3.5">
                {items.map((item, index) => {
                  const image = getProductImage(item);
                  const variantLabel = getVariantLabel(item);
                  const lineTotal = Number(item.unit_price || 0) * Number(item.quantity || 0);

                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[84px_minmax(0,1fr)] gap-x-3 gap-y-3 py-3.5 md:grid-cols-[96px_minmax(0,1fr)_90px_minmax(140px,max-content)_44px] md:items-center ${
                        index !== 0 ? "border-t border-black/10" : ""
                      }`}
                    >
                      <div className="overflow-hidden rounded-[15px] bg-slate-50 border border-slate-100">
                        {image ? (
                          <img src={image} alt={item.variant?.product?.name || ui.product} className="h-20 w-full object-contain p-2 sm:h-24" />
                        ) : (
                          <div className="flex h-20 items-center justify-center text-sm font-medium text-slate-400 sm:h-24">
                            {ui.noImage}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold uppercase leading-[1.5] text-slate-900 sm:max-w-[18ch] sm:text-[15px]">
                          {item.variant?.product?.name || ui.product}
                        </h2>
                        {variantLabel ? (
                          <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-400 sm:mt-2 sm:text-xs sm:tracking-[0.18em]">{variantLabel}</p>
                        ) : null}
                        <p className="mt-2 text-base font-semibold leading-none text-slate-950 sm:mt-2.5">
                          {formatMoney(item.unit_price)}
                        </p>
                      </div>

                      <div className="col-span-2 flex items-center justify-between gap-3 border-t border-black/10 pt-3 md:hidden">
                        <div className="flex h-[48px] w-[90px] items-center justify-between rounded-full border border-black/10 px-2">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                            aria-label={ui.decrease.replace("{name}", item.variant?.product?.name || ui.product)}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-base font-semibold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                            aria-label={ui.increase.replace("{name}", item.variant?.product?.name || ui.product)}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="flex min-w-0 items-center gap-2">
                          <p className="whitespace-nowrap text-xl font-semibold text-slate-800">{formatMoney(lineTotal)}</p>
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-600"
                            aria-label={ui.remove.replace("{name}", item.variant?.product?.name || ui.product)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="hidden md:flex md:justify-center">
                        <div className="flex h-[48px] w-[90px] items-center justify-between rounded-full border border-black/10 px-2">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                            aria-label={ui.decrease.replace("{name}", item.variant?.product?.name || ui.product)}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-base font-semibold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                            aria-label={ui.increase.replace("{name}", item.variant?.product?.name || ui.product)}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="hidden text-left md:block md:text-center">
                        <p className="whitespace-nowrap text-base font-semibold text-slate-800 sm:text-[1.5rem]">{formatMoney(lineTotal)}</p>
                      </div>

                      <div className="hidden md:flex md:justify-end">
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={ui.remove.replace("{name}", item.variant?.product?.name || ui.product)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/products"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-white border border-slate-200 px-6 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-slate-50 shadow-sm"
                >
                  {ui.continueShopping}
                </Link>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-black/10 px-6 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-white"
                >
                  {ui.clear}
                </button>
              </div>
            </section>

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-[22px] bg-white px-5 py-4.5 border border-slate-200 shadow-sm sm:px-5 p-3">
                <div className="space-y-3.5 text-slate-800">
                  <div className="flex items-center justify-between gap-4 text-[15px] ">
                    <span>{articleCount} {articleCount > 1 ? ui.items : ui.item}</span>
                    <span className="font-semibold">{formatMoney(total)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[15px]">
                    <span>{ui.shipping}</span>
                    <span className="font-semibold">{formatMoney(shipping)}</span>
                  </div>
                </div>

                <div className="mb-5 mt-8 h-px bg-black/10" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-base text-slate-800">{ui.totalWithTax}</span>
                  <span className="text-[1.65rem] font-semibold leading-none text-slate-900">{formatMoney(grandTotal)}</span>
                </div>

                <div className="my-5 h-px bg-black/10" />

                <button
                  type="button"
                  onClick={() => nav("/checkout")}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[8px] bg-[#16a34a] px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_12px_24px_rgba(22,163,74,0.22)] transition hover:bg-[#15803d]"
                >
                  {ui.order}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
