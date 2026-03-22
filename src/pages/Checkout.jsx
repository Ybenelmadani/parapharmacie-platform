import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { STORE_SHIPPING_FEE } from "../config/store";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";
import { formatMoney } from "../utils/currency";

export default function Checkout() {
  const nav = useNavigate();
  const { user, booting, refreshUser } = useAuth();
  const { items, total, refresh, loading } = useCart();
  const { pick } = useI18n();
  const { success, error: notifyError } = useToast();
  const ui = pick({
    fr: {
      loading: "Chargement...",
      loadingCart: "Chargement du panier...",
      empty: "Le panier est vide",
      goShopping: "Aller a la boutique",
      placed: "Commande passee avec succes.",
      failed: "Le paiement a echoue",
      title: "Paiement",
      customerShipping: "Client et livraison",
      savedHint: "Votre telephone et votre adresse enregistres seront mis a jour depuis ce paiement.",
      fullName: "Nom complet",
      email: "Email",
      phone: "Telephone",
      address: "Adresse de livraison",
      paymentMethod: "Mode de paiement : paiement a la livraison uniquement.",
      paymentDescription: "Vous paierez lorsque votre commande sera livree.",
      eligibilityLabel: "Je confirme que je respecte les conditions d'eligibilite.",
      eligibilityRequired: "Vous devez confirmer que vous respectez les conditions d'eligibilite.",
      eligibilityView: "Voir les conditions d'eligibilite",
      eligibilityIntro: "Avant de confirmer votre commande, assurez-vous que :",
      eligibilityPoint1: "les informations saisies sont exactes et a jour,",
      eligibilityPoint2: "vous pouvez etre contacte pour la livraison et la validation,",
      eligibilityPoint3: "vous acceptez les conditions generales de commande et de livraison.",
      eligibilityFullLink: "Lire les conditions completes",
      processing: "Traitement...",
      placeOrder: "Passer la commande",
      summary: "Resume de commande",
      product: "Produit",
      qty: "Qté",
      subtotal: "Sous-total",
      shipping: "Livraison",
      total: "Total",
    },
    en: {
      loading: "Loading...",
      loadingCart: "Loading cart...",
      empty: "Cart is empty",
      goShopping: "Go shopping",
      placed: "Order placed successfully.",
      failed: "Checkout failed",
      title: "Checkout",
      customerShipping: "Customer & shipping",
      savedHint: "Your saved phone and address will be updated from this checkout.",
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      address: "Shipping address",
      paymentMethod: "Payment method: Cash on delivery only.",
      paymentDescription: "You will pay when your order is delivered.",
      eligibilityLabel: "I confirm that I meet the eligibility conditions.",
      eligibilityRequired: "You must confirm that you meet the eligibility conditions.",
      eligibilityView: "View eligibility conditions",
      eligibilityIntro: "Before confirming your order, please make sure that:",
      eligibilityPoint1: "the information you entered is accurate and up to date,",
      eligibilityPoint2: "you can be contacted for delivery and order validation,",
      eligibilityPoint3: "you accept the general order and delivery conditions.",
      eligibilityFullLink: "Read full conditions",
      processing: "Processing...",
      placeOrder: "Place order",
      summary: "Order summary",
      product: "Product",
      qty: "Qty",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
    },
    ar: {
      loading: "جارٍ التحميل...",
      loadingCart: "جارٍ تحميل السلة...",
      empty: "السلة فارغة",
      goShopping: "اذهب للتسوق",
      placed: "تم إنشاء الطلب بنجاح.",
      failed: "فشل إتمام الطلب",
      title: "إتمام الشراء",
      customerShipping: "بيانات العميل والشحن",
      savedHint: "سيتم تحديث الهاتف والعنوان المحفوظين من خلال هذا الطلب.",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "عنوان الشحن",
      paymentMethod: "طريقة الدفع: الدفع عند الاستلام فقط.",
      paymentDescription: "ستدفع عند تسليم الطلب.",
      eligibilityLabel: "أؤكد أنني أحترم شروط الأهلية.",
      eligibilityRequired: "يجب تأكيد احترام شروط الأهلية.",
      eligibilityView: "عرض شروط الأهلية",
      eligibilityIntro: "قبل تأكيد الطلب، يرجى التأكد من أن:",
      eligibilityPoint1: "المعلومات المدخلة صحيحة ومحدثة،",
      eligibilityPoint2: "يمكن التواصل معك من أجل التوصيل وتأكيد الطلب،",
      eligibilityPoint3: "أنت توافق على الشروط العامة الخاصة بالطلب والتوصيل.",
      eligibilityFullLink: "قراءة الشروط كاملة",
      processing: "جارٍ المعالجة...",
      placeOrder: "تأكيد الطلب",
      summary: "ملخص الطلب",
      product: "منتج",
      qty: "الكمية",
      subtotal: "المجموع الفرعي",
      shipping: "التوصيل",
      total: "الإجمالي",
    },
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    }));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh, user]);

  const summary = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.variant?.product?.name || ui.product,
        qty: item.quantity,
        line: Number(item.unit_price) * Number(item.quantity),
      })),
    [items, ui.product]
  );

  const shipping = items.length > 0 ? STORE_SHIPPING_FEE : 0;
  const grandTotal = total + shipping;

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!eligibilityConfirmed) {
      setError(ui.eligibilityRequired);
      notifyError(ui.eligibilityRequired);
      return;
    }

    setSubmitting(true);

    try {
      await http.post("/orders/checkout", {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        payment_method: "cash_on_delivery",
        eligibility_confirmed: eligibilityConfirmed,
      });

      if (user) await refreshUser().catch(() => {});
      await refresh().catch(() => {});
      success(ui.placed);
      nav(user ? "/my-orders" : "/", { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        (requestError?.response?.data?.errors
          ? Object.values(requestError.response.data.errors).flat().join(" | ")
          : ui.failed);
      setError(message);
      notifyError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (booting) return <div className="mx-auto max-w-5xl p-6 text-slate-600">{ui.loading}</div>;
  if (loading) return <div className="mx-auto max-w-5xl p-6 text-slate-600">{ui.loadingCart}</div>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-700">{ui.empty}</div>
        <button onClick={() => nav("/products")} className="mt-4 rounded-xl bg-black px-5 py-3 font-semibold text-white">
          {ui.goShopping}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-black tracking-tight">{ui.title}</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={submit} className="space-y-4 lg:col-span-2">
          {error ? <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-black">{ui.customerShipping}</h2>
            {user ? <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">{ui.savedHint}</div> : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder={ui.fullName} value={form.name} onChange={(event) => setField("name", event.target.value)} required />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder={ui.email} value={form.email} onChange={(event) => setField("email", event.target.value)} required />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder={ui.phone} value={form.phone} onChange={(event) => setField("phone", event.target.value)} required />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder={ui.address} value={form.address} onChange={(event) => setField("address", event.target.value)} required />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-semibold">{ui.paymentMethod}</p>
            <p className="mt-1 text-sm">{ui.paymentDescription}</p>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={eligibilityConfirmed}
              onChange={(event) => setEligibilityConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              required
            />
            <span>{ui.eligibilityLabel}</span>
          </label>

          <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">
              {ui.eligibilityView}
            </summary>
            <div className="mt-3 space-y-3">
              <p>{ui.eligibilityIntro}</p>
              <ul className="space-y-2 pl-5 text-slate-600">
                <li>{ui.eligibilityPoint1}</li>
                <li>{ui.eligibilityPoint2}</li>
                <li>{ui.eligibilityPoint3}</li>
              </ul>
              <Link
                to="/info/terms-conditions"
                className="inline-flex font-semibold text-slate-900 underline underline-offset-4 transition hover:text-slate-700"
              >
                {ui.eligibilityFullLink}
              </Link>
            </div>
          </details>

          <button disabled={submitting} className="w-full rounded-2xl bg-black py-4 text-lg font-semibold text-white disabled:opacity-60">
            {submitting ? ui.processing : ui.placeOrder}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black">{ui.summary}</h2>

          <div className="mt-4 space-y-3">
            {summary.map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{row.name}</div>
                  <div className="text-xs text-slate-500">
                    {ui.qty} × {row.qty}
                  </div>
                </div>
                <div className="font-bold">{formatMoney(row.line)}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-600">{ui.subtotal}</div>
              <div className="font-bold">{formatMoney(total)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-600">{ui.shipping}</div>
              <div className="font-bold">{formatMoney(shipping)}</div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div className="font-semibold text-slate-600">{ui.total}</div>
              <div className="text-2xl font-black">{formatMoney(grandTotal)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
