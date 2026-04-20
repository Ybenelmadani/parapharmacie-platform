import { http } from "./http";

export const CartAPI = {
  get: () => http.get("/cart").then(r => r.data),

  addItem: (product_variant_id, quantity = 1) =>
    http.post("/cart/items", { product_variant_id, quantity }).then(r => r.data),

  updateItem: (cartItemId, quantity) =>
    http.patch(`/cart/items/${cartItemId}`, { quantity }).then(r => r.data),

  removeItem: (cartItemId) =>
    http.delete(`/cart/items/${cartItemId}`).then(r => r.data),
  clear: () => http.delete("/cart/clear").then(r => r.data),
};
