import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { resolveMediaUrl } from "../utils/media";

export default function CartPage() {
  const nav = useNavigate();
  const { items, total, updateQty, remove, clear, loading } = useCart();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Your Cart</h1>
          <p className="text-slate-600 text-sm mt-1">
            Review items before checkout.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/products"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            Continue shopping
          </Link>
          <button
            onClick={clear}
            disabled={items.length === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Clear cart
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="p-4 text-slate-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 rounded-2xl border border-slate-200 text-slate-600">
              Cart is empty.
            </div>
          ) : (
            items.map((it) => {
              const p = it.variant?.product;
              const img =
                resolveMediaUrl(
                  p?.images?.find((i) => i.is_main)?.image_path ||
                  p?.images?.[0]?.image_path
                );

              return (
                <div
                  key={it.id}
                  className="rounded-2xl border border-slate-200 p-4 flex gap-4"
                >
                  <div className="w-28 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {img ? (
                      <img
                        src={img}
                        alt={p?.name || "product"}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {p?.name || "Product"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {[it.variant?.color, it.variant?.finish, it.variant?.capacity]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Unit</div>
                        <div className="font-semibold">
                          {Number(it.unit_price).toFixed(2)} USD
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 ">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            updateQty(it.id, Math.max(1, Number(e.target.value || 1)))
                          }
                          className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => remove(it.id)}
                          className="text-sm font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="text-right ">
                        <div className="text-xs text-slate-500">Subtotal</div>
                        <div className="font-bold">
                          {(Number(it.unit_price) * it.quantity).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-slate-200 p-5 h-fit">
          <h2 className="font-black text-lg">Summary</h2>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">Items</span>
            <span className="font-semibold">{items.length}</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-600">Total</span>
            <span className="text-xl font-black">{total.toFixed(2)} USD</span>
          </div>

          <button
            onClick={() => nav("/checkout")}
            disabled={items.length === 0}
            className="mt-4 w-full rounded-xl bg-black text-white py-3 font-semibold disabled:opacity-50"
          >
            Go to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
