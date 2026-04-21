import snapshot from "./scraperCatalogSnapshot.json";

const REVIEW_STORAGE_KEY = "mock-catalog:reviews:v2";
const CART_STORAGE_KEY = "mock-catalog:cart:v1";

const REVIEWER_NAMES = [
  "Salma Idrissi",
  "Nadia El Amrani",
  "Youssef Benali",
  "Meriem Ait Said",
  "Anas Bousfiha",
  "Imane Chraibi",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function readStorageArray(key) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorageArray(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep the in-memory experience.
  }
}

const BASE_CATEGORIES = Array.isArray(snapshot?.categories) ? clone(snapshot.categories) : [];
const BASE_BRANDS = Array.isArray(snapshot?.brands) ? clone(snapshot.brands) : [];
const BASE_PRODUCTS = Array.isArray(snapshot?.products) ? clone(snapshot.products) : [];

const BRANDS_BY_ID = new Map(BASE_BRANDS.map((brand) => [String(brand.id), brand]));
const PRODUCTS_BY_ID = new Map(BASE_PRODUCTS.map((product) => [String(product.id), product]));

const DESCENDANT_IDS_BY_CATEGORY = BASE_CATEGORIES.reduce((accumulator, category) => {
  const key = String(category.id);
  if (!accumulator[key]) {
    accumulator[key] = new Set([key]);
  }

  if (Array.isArray(category.children)) {
    category.children.forEach((child) => {
      accumulator[key].add(String(child.id));
      accumulator[String(child.id)] = new Set([String(child.id)]);
    });
  }

  if (category.parent_id) {
    const parentKey = String(category.parent_id);
    if (!accumulator[parentKey]) {
      accumulator[parentKey] = new Set([parentKey]);
    }
    accumulator[parentKey].add(key);
    accumulator[key] = accumulator[key] || new Set([key]);
  }

  return accumulator;
}, {});

const BASE_REVIEWS = BASE_PRODUCTS.slice(0, 24).map((product, index) => ({
  id: `base-review-${index + 1}`,
  product_id: product.id,
  user_id: `seed-user-${(index % REVIEWER_NAMES.length) + 1}`,
  user: {
    id: `seed-user-${(index % REVIEWER_NAMES.length) + 1}`,
    name: REVIEWER_NAMES[index % REVIEWER_NAMES.length],
  },
  rating: 4 + (index % 2),
  comment: `Tres bon retour sur ${String(product.name || "").toLowerCase()}. Le produit est conforme a la fiche, l'image correspond bien et le rapport qualite-prix est rassurant.`,
  created_at: new Date(2026, 2, index + 1).toISOString(),
}));

function summarizeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    brand_id: product.brand_id,
    brand: clone(product.brand),
    category_id: product.category_id,
    category: clone(product.category),
    images: clone(product.images),
  };
}

function getStoredReviews() {
  return readStorageArray(REVIEW_STORAGE_KEY);
}

function getAllReviews() {
  const reviews = [...BASE_REVIEWS, ...getStoredReviews()].sort(
    (first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
  );

  return reviews.map((review) => {
    const product = PRODUCTS_BY_ID.get(String(review.product_id));
    return {
      ...clone(review),
      product: product ? summarizeProduct(product) : null,
    };
  });
}

function hydrateProducts() {
  const reviewsByProductId = getAllReviews().reduce((accumulator, review) => {
    const key = String(review.product_id);
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(review);
    return accumulator;
  }, {});

  return BASE_PRODUCTS.map((product) => ({
    ...clone(product),
    brand: product.brand || clone(BRANDS_BY_ID.get(String(product.brand_id)) || null),
    reviews: clone(reviewsByProductId[String(product.id)] || []),
  }));
}

function filterProducts(products, params = {}) {
  const search = normalizeText(params.q);
  const categoryId = params.category_id ? String(params.category_id) : "";
  const brandId = params.brand_id ? String(params.brand_id) : "";
  const color = normalizeText(params.color);
  const allowedCategoryIds = categoryId ? DESCENDANT_IDS_BY_CATEGORY[categoryId] || new Set([categoryId]) : null;

  return products.filter((product) => {
    if (allowedCategoryIds && !allowedCategoryIds.has(String(product.category_id))) return false;
    if (brandId && String(product.brand_id) !== brandId) return false;

    if (color) {
      const hasColor = Array.isArray(product.variants)
        ? product.variants.some((variant) => normalizeText(variant.color) === color)
        : false;
      if (!hasColor) return false;
    }

    if (!search) return true;

    const haystack = normalizeText(
      [
        product.name,
        product.description,
        product.brand?.name,
        product.category?.name,
        product.category?.parent?.name,
      ]
        .filter(Boolean)
        .join(" ")
    );

    return haystack.includes(search);
  });
}

export function getMockCategories() {
  return clone(BASE_CATEGORIES);
}

export function getMockBrands(params = {}) {
  const products = filterProducts(hydrateProducts(), params);
  const brandIds = new Set(products.map((product) => String(product.brand_id)).filter(Boolean));
  const brands = BASE_BRANDS.filter((brand) => brandIds.has(String(brand.id)));
  return clone(brands.length > 0 ? brands : BASE_BRANDS);
}

export function getMockColors(params = {}) {
  const counts = filterProducts(hydrateProducts(), params).reduce((accumulator, product) => {
    product.variants.forEach((variant) => {
      const key = String(variant.color || "").trim();
      if (!key) return;
      accumulator[key] = (accumulator[key] || 0) + 1;
    });
    return accumulator;
  }, {});

  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

export function getMockProducts(params = {}) {
  const filtered = filterProducts(hydrateProducts(), params);
  const perPage = Number(params.per_page) || filtered.length;
  return clone(filtered.slice(0, perPage));
}

export function getMockProductsPage(params = {}) {
  const filtered = filterProducts(hydrateProducts(), params);
  const page = Math.max(1, Number(params.page) || 1);
  const perPage = Math.max(1, Number(params.per_page) || 24);
  const offset = (page - 1) * perPage;
  const data = filtered.slice(offset, offset + perPage);

  return {
    data: clone(data),
    current_page: page,
    last_page: Math.max(1, Math.ceil(filtered.length / perPage)),
    per_page: perPage,
    total: filtered.length,
  };
}

export function getMockProduct(id) {
  const product = hydrateProducts().find((item) => String(item.id) === String(id));
  return product ? clone(product) : null;
}

export function getMockReviews(params = {}) {
  const productId = params.product_id ? String(params.product_id) : "";
  const reviews = getAllReviews();
  return clone(productId ? reviews.filter((review) => String(review.product_id) === productId) : reviews);
}

export function createMockReview({ product_id, rating, comment }) {
  const product = PRODUCTS_BY_ID.get(String(product_id));
  if (!product) {
    throw new Error("Product not found.");
  }

  const storedReviews = getStoredReviews();
  const review = {
    id: `local-review-${Date.now()}`,
    product_id: product.id,
    user_id: "local-user",
    user: {
      id: "local-user",
      name: "Client Local",
    },
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    comment: String(comment || "").trim(),
    created_at: new Date().toISOString(),
  };

  writeStorageArray(REVIEW_STORAGE_KEY, [review, ...storedReviews]);
  return {
    ...clone(review),
    product: summarizeProduct(product),
  };
}

function getStoredCartRows() {
  return readStorageArray(CART_STORAGE_KEY);
}

function writeStoredCartRows(rows) {
  writeStorageArray(CART_STORAGE_KEY, rows);
}

function buildCartItems(rows) {
  return rows.flatMap((row, index) => {
    const product = hydrateProducts().find((item) =>
      item.variants.some((variant) => String(variant.id) === String(row.variant_id))
    );
    const variant = product?.variants.find((item) => String(item.id) === String(row.variant_id));
    if (!product || !variant) return [];

    return [
      {
        id: row.id || `mock-cart-${index + 1}`,
        quantity: Math.max(1, Number(row.quantity) || 1),
        unit_price: Number(variant.price) || 0,
        product_variant_id: variant.id,
        variant: {
          ...clone(variant),
          product: summarizeProduct(product),
        },
      },
    ];
  });
}

export function getMockCart() {
  return { items: buildCartItems(getStoredCartRows()) };
}

export function addMockCartItem(variantId, quantity = 1) {
  const rows = getStoredCartRows();
  const nextRows = [...rows];
  const existing = nextRows.find((row) => String(row.variant_id) === String(variantId));

  if (existing) {
    existing.quantity = Math.max(1, Number(existing.quantity || 0) + Number(quantity || 1));
  } else {
    nextRows.push({
      id: `mock-cart-${Date.now()}-${variantId}`,
      variant_id: variantId,
      quantity: Math.max(1, Number(quantity) || 1),
    });
  }

  writeStoredCartRows(nextRows);
  return { items: buildCartItems(nextRows) };
}

export function updateMockCartItem(cartItemId, quantity) {
  const nextRows = getStoredCartRows()
    .map((row) =>
      String(row.id) === String(cartItemId)
        ? { ...row, quantity: Math.max(1, Number(quantity) || 1) }
        : row
    )
    .filter((row) => Number(row.quantity) > 0);

  writeStoredCartRows(nextRows);
  return { items: buildCartItems(nextRows) };
}

export function removeMockCartItem(cartItemId) {
  const nextRows = getStoredCartRows().filter((row) => String(row.id) !== String(cartItemId));
  writeStoredCartRows(nextRows);
  return { items: buildCartItems(nextRows) };
}

export function clearMockCart() {
  writeStoredCartRows([]);
  return { items: [] };
}
