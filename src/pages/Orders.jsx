import React, { useEffect, useState } from "react";
import Container from "../components/layout/Container";
import { OrdersAPI } from "../api/orders";
import { formatMoney } from "../utils/currency";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    OrdersAPI.list().then(setOrders).catch(()=>{});
  }, []);

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-black">Orders</h1>
      <p className="text-sm text-slate-600 mt-1">Your recent orders.</p>

      <div className="mt-6 space-y-4">
        {orders.map(o => (
          <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-bold">Order #{o.id}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Status: {o.status} • Payment: {o.payment_status}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Address: {o.shipping_address || "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-lg font-black">{formatMoney(o.total)}</div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 grid gap-2 text-sm">
              {(o.items || []).map(it => (
                <div key={it.id} className="flex justify-between">
                  <span className="text-slate-600">{it.variant?.product?.name} × {it.quantity}</span>
                  <span className="font-semibold">{formatMoney(it.sub_total)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No orders yet.
          </div>
        )}
      </div>
    </Container>
  );
}
