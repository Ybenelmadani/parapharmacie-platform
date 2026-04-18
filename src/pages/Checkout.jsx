import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8"
    >
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{ui.title}</h1>
      <div className="h-1 w-20 bg-para-green-400 rounded-full mb-8"></div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={submit} className="space-y-6 lg:col-span-2">
          {error ? <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">{error}</motion.div> : null}

          <div className="rounded-[30px] border border-para-marine-100 bg-white p-6 shadow-[0_10px_30px_rgba(59,130,246,0.03)]">
            <h2 className="mb-5 text-xl font-bold text-slate-800">{ui.customerShipping}</h2>
            {user ? <div className="mb-5 rounded-2xl border border-para-green-200 bg-para-green-50 px-5 py-4 text-sm text-para-green-800 shadow-sm">{ui.savedHint}</div> : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:ring-2 focus:ring-para-marine-200 focus:border-para-marine-300 outline-none transition-all" placeholder={ui.fullName} value={form.name} onChange={(event) => setField("name", event.target.value)} required />
              <input className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:ring-2 focus:ring-para-marine-200 focus:border-para-marine-300 outline-none transition-all" placeholder={ui.email} value={form.email} onChange={(event) => setField("email", event.target.value)} required />
              <input className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:ring-2 focus:ring-para-marine-200 focus:border-para-marine-300 outline-none transition-all" placeholder={ui.phone} value={form.phone} onChange={(event) => setField("phone", event.target.value)} required />
              <input className="w-full rounded-2xl border border-slate-200 px-5 py-4 md:col-span-2 focus:ring-2 focus:ring-para-marine-200 focus:border-para-marine-300 outline-none transition-all" placeholder={ui.address} value={form.address} onChange={(event) => setField("address", event.target.value)} required />
            </div>
          </div>

          <div className="rounded-[30px] border border-para-green-200 bg-para-green-50/50 p-6 shadow-sm">
            <p className="font-bold text-para-green-800 text-lg">{ui.paymentMethod}</p>
            <p className="mt-2 text-sm text-para-green-700">{ui.paymentDescription}</p>
          </div>

          <label className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={eligibilityConfirmed}
              onChange={(event) => setEligibilityConfirmed(event.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-slate-300 text-para-green-600 focus:ring-para-green-500 cursor-pointer"
              required
            />
            <span className="font-medium text-slate-800">{ui.eligibilityLabel}</span>
          </label>

          <details className="group rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 transition-all open:bg-white open:shadow-sm">
            <summary className="cursor-pointer list-none font-semibold text-slate-900 group-open:text-para-green-700 transition-colors">
              {ui.eligibilityView}
            </summary>
            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
              <p>{ui.eligibilityIntro}</p>
              <ul className="space-y-2 pl-5 text-slate-600 list-disc marker:text-para-marine-400">
                <li>{ui.eligibilityPoint1}</li>
                <li>{ui.eligibilityPoint2}</li>
                <li>{ui.eligibilityPoint3}</li>
              </ul>
              <Link
                to="/info/terms-conditions"
                className="inline-flex font-semibold text-para-marine-500 underline underline-offset-4 transition hover:text-para-marine-600"
              >
                {ui.eligibilityFullLink}
              </Link>
            </div>
          </details>

          <button disabled={submitting} className="w-full rounded-[24px] bg-para-green-600 py-4.5 text-lg font-bold text-white shadow-[0_10px_20px_rgba(22,163,74,0.3)] transition-all hover:bg-para-green-700 hover:shadow-[0_15px_30px_rgba(22,163,74,0.4)] disabled:opacity-60 disabled:hover:scale-100 p-4">
            {submitting ? ui.processing : ui.placeOrder}
          </button>
        </form>

        <div className="h-fit rounded-[30px] border border-para-marine-100 bg-white p-7 shadow-[0_15px_40px_rgba(59,130,246,0.06)] sticky top-28">
          <h2 className="text-xl font-bold text-slate-800">{ui.summary}</h2>

          <div className="mt-6 space-y-4">
            {summary.map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{row.name}</div>
                  <div className="text-sm font-medium text-slate-400 mt-0.5">
                    {ui.qty} × {row.qty}
                  </div>
                </div>
                <div className="font-bold text-slate-800">{formatMoney(row.line)}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-500">{ui.subtotal}</div>
              <div className="font-bold text-slate-800">{formatMoney(total)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-500">{ui.shipping}</div>
              <div className="font-bold text-slate-800">{formatMoney(shipping)}</div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-5">
              <div className="font-bold text-slate-600 uppercase tracking-widest text-xs mt-1">{ui.total}</div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{formatMoney(grandTotal)}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
