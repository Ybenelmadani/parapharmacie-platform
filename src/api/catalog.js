import { http } from "./http";

const CACHE_TTL_MS = 5 * 60 * 1000;

function readCache(key) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data ?? null;
  } catch {
    return null;
  }
}

function writeCache(key, data, ttl = CACHE_TTL_MS) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        expiresAt: Date.now() + ttl,
      })
    );
  } catch {
    // Ignore storage quota/privacy errors and continue without cache.
  }
}

async function cachedGet(key, loader, ttl = CACHE_TTL_MS) {
  const cached = readCache(key);
  if (cached !== null) return cached;

  const data = await loader();
  writeCache(key, data, ttl);
  return data;
}

function generateKey(base, params) {
  if (!params || Object.keys(params).length === 0) return base;
  // Create a deterministic key by sorting params if necessary, but JSON stringify is fine for simple flat params
  try {
    return `${base}:${JSON.stringify(params)}`;
  } catch {
    return base;
  }
}

export const CatalogAPI = {
  categories: () => cachedGet("catalog:categories:v3", () => http.get("/categories").then((r) => r.data)),
  
  brands: (params = {}) => 
    cachedGet(generateKey("catalog:brands:v2", params), () => http.get("/brands", { params }).then((r) => r.data)),
    
  colors: (params = {}) => 
    cachedGet(generateKey("catalog:colors:v2", params), () => http.get("/variants", { params: { ...params, facet: "colors" } }).then(r => r.data)),

  products: (params = {}) =>
    cachedGet(generateKey("catalog:products:v2", params), () => 
      http.get("/products", { params }).then((r) => {
        const payload = r.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
      })
    ),
    
  productsPage: (params = {}) => 
    cachedGet(generateKey("catalog:productsPage:v2", params), () => http.get("/products", { params }).then((r) => r.data)),
    
  product: (id) => 
    cachedGet(`catalog:product:v2:${id}`, () => http.get(`/products/${id}`).then(r => r.data)),

  variants: (params = {}) => 
    cachedGet(generateKey("catalog:variants:v2", params), () => http.get("/variants", { params }).then(r => r.data)),
    
  reviews: (params = {}) => 
    cachedGet(generateKey("catalog:reviews:v2", params), () => http.get("/reviews", { params }).then(r => r.data)),
};
