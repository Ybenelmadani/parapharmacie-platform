import { http } from "./http";

export const CatalogAPI = {
  categories: () => http.get("/categories").then(r => r.data),
  brands: (params = {}) => http.get("/brands", { params }).then(r => r.data),
  colors: (params = {}) => http.get("/variants", { params: { ...params, facet: "colors" } }).then(r => r.data),

  products: (params = {}) =>
    http.get("/products", { params }).then((r) => {
      const payload = r.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    }),
  productsPage: (params = {}) => http.get("/products", { params }).then((r) => r.data),
  product: (id) => http.get(`/products/${id}`).then(r => r.data),

  variants: (params = {}) => http.get("/variants", { params }).then(r => r.data),
  reviews: (params = {}) => http.get("/reviews", { params }).then(r => r.data),
};
