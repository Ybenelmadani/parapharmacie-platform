import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http, shouldUseLocalApiFallback } from "../api/http";
import {
  addMockCartItem,
  clearMockCart,
  getMockCart,
  removeMockCartItem,
  updateMockCartItem,
} from "../data/mockCatalog";
import { useAuth } from "./AuthContext";
import { useI18n } from "./I18nContext";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);

function shouldAutoOpenCartDrawer() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return !window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches;
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { pick } = useI18n();
  const { success, error: notifyError } = useToast();
  const ui = pick({
    fr: {
      added: "Produit ajoute au panier.",
      addError: "Impossible d'ajouter ce produit au panier.",
      updateError: "Impossible de mettre a jour la quantite du panier.",
      removed: "Article retire du panier.",
      removeError: "Impossible de retirer cet article du panier.",
      cleared: "Panier vide.",
      clearError: "Impossible de vider votre panier.",
    },
    en: {
      added: "Product added to cart.",
      addError: "Unable to add this product to cart.",
      updateError: "Unable to update cart quantity.",
      removed: "Item removed from cart.",
      removeError: "Unable to remove this item from cart.",
      cleared: "Cart cleared.",
      clearError: "Unable to clear your cart.",
    },
    ar: {
      added: "تمت إضافة المنتج إلى السلة.",
      addError: "تعذر إضافة هذا المنتج إلى السلة.",
      updateError: "تعذر تحديث كمية السلة.",
      removed: "تمت إزالة العنصر من السلة.",
      removeError: "تعذر إزالة هذا العنصر من السلة.",
      cleared: "تم تفريغ السلة.",
      clearError: "تعذر تفريغ السلة.",
    },
  });

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const getApiMessage = useCallback((error, fallbackMessage) => {
    const detailedErrors = error?.response?.data?.errors
      ? Object.values(error.response.data.errors).flat().filter(Boolean)
      : [];

    return detailedErrors[0] || error?.response?.data?.message || fallbackMessage;
  }, []);

  const total = useMemo(
    () => items.reduce((s, it) => s + Number(it.unit_price) * it.quantity, 0),
    [items]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (shouldUseLocalApiFallback()) {
        setItems(getMockCart().items || []);
        return;
      }

      const res = await http.get("/cart");
      setItems(res.data?.items || []);
    } catch {
      setItems(getMockCart().items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh, user?.id]);

  const add = useCallback(async (variantId, quantity = 1, options = {}) => {
    try {
      if (shouldUseLocalApiFallback()) {
        const data = addMockCartItem(variantId, quantity);
        setItems(data.items || []);

        if (shouldAutoOpenCartDrawer()) {
          setOpen(true);
        }

        if (!options.silentSuccess) {
          success(options.successMessage || ui.added);
        }

        return data;
      }

      const res = await http.post("/cart/items", {
        product_variant_id: variantId,
        quantity,
      });
      setItems(res.data?.items || []);

      if (shouldAutoOpenCartDrawer()) {
        setOpen(true);
      }

      if (!options.silentSuccess) {
        success(options.successMessage || ui.added);
      }

      return res.data;
    } catch (error) {
      if (!error?.response) {
        const data = addMockCartItem(variantId, quantity);
        setItems(data.items || []);

        if (shouldAutoOpenCartDrawer()) {
          setOpen(true);
        }

        if (!options.silentSuccess) {
          success(options.successMessage || ui.added);
        }

        return data;
      }

      notifyError(getApiMessage(error, options.errorMessage || ui.addError));
      return null;
    }
  }, [getApiMessage, notifyError, success, ui.addError, ui.added]);

  const updateQty = useCallback(async (cartItemId, quantity) => {
    try {
      if (shouldUseLocalApiFallback()) {
        const data = updateMockCartItem(cartItemId, quantity);
        setItems(data.items || []);
        return data;
      }

      const res = await http.patch(`/cart/items/${cartItemId}`, { quantity });
      setItems(res.data?.items || []);
      return res.data;
    } catch (error) {
      if (!error?.response) {
        const data = updateMockCartItem(cartItemId, quantity);
        setItems(data.items || []);
        return data;
      }

      notifyError(getApiMessage(error, ui.updateError));
      return null;
    }
  }, [getApiMessage, notifyError, ui.updateError]);

  const remove = useCallback(async (cartItemId) => {
    try {
      if (shouldUseLocalApiFallback()) {
        const data = removeMockCartItem(cartItemId);
        setItems(data.items || []);
        success(ui.removed);
        return data;
      }

      const res = await http.delete(`/cart/items/${cartItemId}`);
      setItems(res.data?.items || []);
      success(ui.removed);
      return res.data;
    } catch (error) {
      if (!error?.response) {
        const data = removeMockCartItem(cartItemId);
        setItems(data.items || []);
        success(ui.removed);
        return data;
      }

      notifyError(getApiMessage(error, ui.removeError));
      return null;
    }
  }, [getApiMessage, notifyError, success, ui.removeError, ui.removed]);

  const clear = useCallback(async () => {
    try {
      if (shouldUseLocalApiFallback()) {
        const data = clearMockCart();
        setItems(data.items || []);
        success(ui.cleared);
        return data;
      }

      const res = await http.delete("/cart/clear");
      setItems(res.data?.items || []);
      success(ui.cleared);
      return res.data;
    } catch (error) {
      if (!error?.response) {
        const data = clearMockCart();
        setItems(data.items || []);
        success(ui.cleared);
        return data;
      }

      notifyError(getApiMessage(error, ui.clearError));
      return null;
    }
  }, [getApiMessage, notifyError, success, ui.clearError, ui.cleared]);

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
