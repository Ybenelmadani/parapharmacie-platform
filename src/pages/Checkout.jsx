import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const nav = useNavigate();
  const { user, booting } = useAuth();
  const { items, total, refresh, loading } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // préremplir form depuis user
  useEffect(() => {
    if (!user) return;
    setForm((p) => ({
      ...p,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    }));
  }, [user]);

  // IMPORTANT: charger le panier sur cette page
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const summary = useMemo(() => {
    return items.map((it) => ({
      id: it.id,
      name: it.variant?.product?.name || "Product",
      qty: it.quantity,
      line: Number(it.unit_price) * Number(it.quantity),
    }));
  }, [items]);

  // 1) booting auth
  if (booting) {
    return <div className="max-w-5xl mx-auto p-6 text-slate-600">Loading…</div>;
  }

  // 2) cart loading
  if (loading) {
    return <div className="max-w-5xl mx-auto p-6 text-slate-600">Loading cart…</div>;
  }

  // 3) empty cart based ONLY on CartContext items
  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100">
          Cart is empty
        </div>

        <button
          onClick={() => nav("/products")}
          className="mt-4 px-5 py-3 rounded-xl bg-black text-white font-semibold"
        >
          Go shopping
        </button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    try {
      await http.post("/orders/checkout", {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        payment_method: "cash_on_delivery",
      });

      await refresh();
      nav(user ? "/my-orders" : "/", { replace: true });
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors
          ? Object.values(e2.response.data.errors).flat().join(" | ")
          : "Checkout failed");
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-black tracking-tight">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 space-y-4">
          {err ? (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {err}
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-black mb-4">Customer & Shipping</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />

              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />

              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
              />

              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Shipping address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-semibold">Payment method: Cash on delivery only.</p>
            <p className="mt-1 text-sm">
              You will pay when your order is delivered.
            </p>
          </div>

          <button
            disabled={submitting}
            className="w-full rounded-2xl bg-black text-white py-4 font-semibold text-lg disabled:opacity-60"
          >
            {submitting ? "Processing…" : "Place order"}
          </button>
        </form>

        {/* Summary (ONLY from CartContext items) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 h-fit">
          <h2 className="text-xl font-black">Order summary</h2>

          <div className="mt-4 space-y-3">
            {summary.map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{row.name}</div>
                  <div className="text-xs text-slate-500">× {row.qty}</div>
                </div>
                <div className="font-bold">{row.line.toFixed(2)} USD</div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center">
            <div className="text-slate-600 font-semibold">Total</div>
            <div className="text-2xl font-black">{Number(total).toFixed(2)} USD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
