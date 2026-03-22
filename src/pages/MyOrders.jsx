import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { formatMoney } from "../utils/currency";

export default function MyOrders() {
  const { user } = useAuth();
  const { pick, formatDate } = useI18n();
  const ui = pick({
    fr: {
      loginRequired: "Veuillez vous connecter.",
      title: "Mes commandes",
      subtitle: "Suivez vos achats, leur statut et les details de livraison au meme endroit.",
      manageAccount: "Gerer mon compte",
      loading: "Chargement...",
      empty: "Aucune commande pour le moment.",
      order: "Commande #{id}",
      placedOn: "Passee le {date}",
      total: "Total",
      deliveryDetails: "Details de livraison",
      noAddress: "Aucune adresse enregistree.",
      noPhone: "Aucun telephone enregistre.",
      noEmail: "Aucun email enregistre.",
      paymentTotals: "Paiement et totaux",
      paymentMethod: "Mode de paiement : {method}",
      shippingFee: "Frais de livraison : {value}",
      orderTotal: "Total commande : {value}",
      items: "Articles",
      qtyUnitPrice: "Qté : {quantity} · Prix unitaire : {price}",
      product: "Produit",
      cashOnDelivery: "paiement a la livraison",
    },
    en: {
      loginRequired: "Please login.",
      title: "My Orders",
      subtitle: "Track your purchases, status, and delivery details in one place.",
      manageAccount: "Manage my account",
      loading: "Loading...",
      empty: "No orders yet.",
      order: "Order #{id}",
      placedOn: "Placed on {date}",
      total: "Total",
      deliveryDetails: "Delivery details",
      noAddress: "No address saved.",
      noPhone: "No phone saved.",
      noEmail: "No email saved.",
      paymentTotals: "Payment & totals",
      paymentMethod: "Payment method: {method}",
      shippingFee: "Shipping fee: {value}",
      orderTotal: "Order total: {value}",
      items: "Items",
      qtyUnitPrice: "Qty: {quantity} · Unit price: {price}",
      product: "Product",
      cashOnDelivery: "cash on delivery",
    },
    ar: {
      loginRequired: "يرجى تسجيل الدخول.",
      title: "طلباتي",
      subtitle: "تابع مشترياتك وحالتها وتفاصيل التوصيل في مكان واحد.",
      manageAccount: "إدارة حسابي",
      loading: "جارٍ التحميل...",
      empty: "لا توجد طلبات بعد.",
      order: "الطلب #{id}",
      placedOn: "تم الطلب في {date}",
      total: "الإجمالي",
      deliveryDetails: "تفاصيل التوصيل",
      noAddress: "لا يوجد عنوان محفوظ.",
      noPhone: "لا يوجد هاتف محفوظ.",
      noEmail: "لا يوجد بريد إلكتروني محفوظ.",
      paymentTotals: "الدفع والإجماليات",
      paymentMethod: "طريقة الدفع: {method}",
      shippingFee: "رسوم التوصيل: {value}",
      orderTotal: "إجمالي الطلب: {value}",
      items: "العناصر",
      qtyUnitPrice: "الكمية: {quantity} · سعر الوحدة: {price}",
      product: "منتج",
      cashOnDelivery: "الدفع عند الاستلام",
    },
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await http.get("/orders");
        setOrders(response.data?.data || response.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusClass = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized.includes("delivered") || normalized.includes("paid")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (normalized.includes("pending")) return "bg-amber-50 text-amber-700 ring-amber-200";
    if (normalized.includes("cancel")) return "bg-rose-50 text-rose-700 ring-rose-200";
    return "bg-slate-100 text-slate-700 ring-slate-200";
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">{ui.loginRequired}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{ui.title}</h1>
            <p className="mt-2 text-sm text-slate-200">{ui.subtitle}</p>
          </div>
          <Link to="/my-account" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
            {ui.manageAccount}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">{ui.loading}</div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">{ui.empty}</div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-black text-slate-900">{ui.order.replace("{id}", order.id)}</div>
                    {order.status ? <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(order.status)}`}>{order.status}</span> : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {ui.placedOn.replace("{date}", formatDate(order.created_at, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }))}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ui.total}</div>
                  <div className="text-2xl font-black text-slate-900">{formatMoney(order.total_amount || order.total)}</div>
                </div>
              </div>

              <div className="grid gap-3 px-5 pt-4 text-sm text-slate-600 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ui.deliveryDetails}</div>
                  <div className="mt-2">{order.shipping_address || ui.noAddress}</div>
                  <div className="mt-1">{order.customer_phone || ui.noPhone}</div>
                  <div className="mt-1">{order.customer_email || ui.noEmail}</div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ui.paymentTotals}</div>
                  <div className="mt-2">{ui.paymentMethod.replace("{method}", order.payment_method || ui.cashOnDelivery)}</div>
                  <div className="mt-1">{ui.shippingFee.replace("{value}", formatMoney(order.shipping_fee || 0))}</div>
                  <div className="mt-1 font-semibold text-slate-900">{ui.orderTotal.replace("{value}", formatMoney(order.total_amount || order.total))}</div>
                </div>
              </div>

              {order.items?.length ? (
                <div className="px-5 py-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">{ui.items}</div>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 text-sm">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800">{item.product_name || item.variant?.product?.name || ui.product}</div>
                          <div className="mt-1 text-xs text-slate-500">{ui.qtyUnitPrice.replace("{quantity}", item.quantity).replace("{price}", formatMoney(item.unit_price))}</div>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{formatMoney(item.sub_total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
