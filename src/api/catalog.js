import { http, shouldUseLocalApiFallback } from "./http";
import {
  getMockBrands,
  getMockCategories,
  getMockColors,
  getMockProduct,
  getMockProducts,
  getMockProductsPage,
  getMockReviews,
} from "../data/mockCatalog";

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

function removeCache(key) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage/privacy errors and continue without cache invalidation.
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

function productCacheKey(id) {
  return `catalog:product:v3:${id}`;
}

function clearCatalogCacheByPrefix(prefix) {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove = [];

    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(removeCache);
  } catch {
    // Ignore storage/privacy errors and continue without cache invalidation.
  }
}

async function loadWithFallback(remoteLoader, mockLoader) {
  if (shouldUseLocalApiFallback()) {
    return mockLoader();
  }

  try {
    return await remoteLoader();
  } catch {
    return mockLoader();
  }
}

export const CatalogAPI = {
  categories: () =>
    cachedGet("catalog:categories:v4", () =>
      loadWithFallback(
        () => http.get("/categories").then((r) => r.data),
        () => getMockCategories()
      )
    ),
  
  brands: (params = {}) => 
    cachedGet(generateKey("catalog:brands:v3", params), () =>
      loadWithFallback(
        () => http.get("/brands", { params }).then((r) => r.data),
        () => getMockBrands(params)
      )
    ),
    
  colors: (params = {}) => 
    cachedGet(generateKey("catalog:colors:v3", params), () =>
      loadWithFallback(
        () => http.get("/variants", { params: { ...params, facet: "colors" } }).then((r) => r.data),
        () => getMockColors(params)
      )
    ),

  products: (params = {}) =>
    cachedGet(generateKey("catalog:products:v3", params), () =>
      loadWithFallback(
        () =>
          http.get("/products", { params }).then((r) => {
            const payload = r.data;
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload?.data)) return payload.data;
            return [];
          }),
        () => getMockProducts(params)
      )
    ),
    
  productsPage: (params = {}) => 
    cachedGet(generateKey("catalog:productsPage:v3", params), () =>
      loadWithFallback(
        () => http.get("/products", { params }).then((r) => r.data),
        () => getMockProductsPage(params)
      )
    ),
    
  product: (id, options = {}) => {
    const key = `catalog:product:v3:${id}`;

    if (options?.fresh) {
      removeCache(key);
    }

    return cachedGet(key, () =>
      loadWithFallback(
        () => http.get(`/products/${id}`).then((r) => r.data),
        () => getMockProduct(id)
      )
    );
  },

  variants: (params = {}) => 
    cachedGet(generateKey("catalog:variants:v3", params), () =>
      loadWithFallback(
        () => http.get("/variants", { params }).then((r) => r.data),
        () => getMockColors(params)
      )
    ),
    
  reviews: (params = {}) => 
    cachedGet(generateKey("catalog:reviews:v3", params), () =>
      loadWithFallback(
        () => http.get("/reviews", { params }).then((r) => r.data),
        () => getMockReviews(params)
      )
    ),

  invalidateProduct: (id) => removeCache(productCacheKey(id)),

  invalidateReviews: () => clearCatalogCacheByPrefix("catalog:reviews:v3"),
};
