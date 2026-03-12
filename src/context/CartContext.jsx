import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => items.reduce((s, it) => s + Number(it.unit_price) * it.quantity, 0),
    [items]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get("/cart");
      setItems(res.data?.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, user?.id]);

  const add = useCallback(async (variantId, quantity = 1) => {
    const res = await http.post("/cart/items", {
      product_variant_id: variantId,
      quantity,
    });
    setItems(res.data?.items || []);
    setOpen(true);
  }, []);

  const updateQty = useCallback(async (cartItemId, quantity) => {
    const res = await http.patch(`/cart/items/${cartItemId}`, { quantity });
    setItems(res.data?.items || []);
  }, []);

  const remove = useCallback(async (cartItemId) => {
    const res = await http.delete(`/cart/items/${cartItemId}`);
    setItems(res.data?.items || []);
  }, []);

  const clear = useCallback(async () => {
    const res = await http.delete("/cart/clear");
    setItems(res.data?.items || []);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, items, total, loading, refresh, add, updateQty, remove, clear }),
    [open, items, total, loading, refresh, add, updateQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
