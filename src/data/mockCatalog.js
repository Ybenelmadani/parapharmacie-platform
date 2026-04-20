import skincareImage from "../assets/logo.jpg";
import ecoImage from "../assets/eco-natural.jfif";
import painReliefImage from "../assets/pain-relief.jfif";
import teethImage from "../assets/teeth-care.jfif";
import storefrontImage from "../assets/para.png";
import naturalCareImage from "../assets/p.png";
import pharmacyInteriorImage from "../assets/Nord Parisien - Inside Pharmacy.png";
import pharmacistImage from "../assets/Compounding Pharmacy Corpus Christi.png";
import bebesMamansImage from "../assets/categories/babes_mamanes.jfif";
import buccoDentaireImage from "../assets/categories/bucco-dentaire.jfif";
import capillaireImage from "../assets/categories/capillaire.png";
import complementAlimentaireImage from "../assets/categories/complement-alimentaire.jfif";
import corpsCategoryImage from "../assets/categories/corps.jfif";
import visageCategoryImage from "../assets/categories/visage-category.jfif";
import hommeCategoryImage from "../assets/categories/homme.jfif";
import hygieneCategoryImage from "../assets/categories/hygiene.jfif";
import appareilsAccessoriesImage from "../assets/categories/appareils and accessories.jfif";

const productImageContext = require.context("../assets/mock-products", false, /\.(png|jpe?g|webp)$/);

const REVIEW_STORAGE_KEY = "mock-catalog:reviews:v1";
const CART_STORAGE_KEY = "mock-catalog:cart:v1";

const BRAND_DEFINITIONS = [
  { id: 1, name: "Bioderma" },
  { id: 2, name: "Avene" },
  { id: 3, name: "La Roche-Posay" },
  { id: 4, name: "Vichy" },
  { id: 5, name: "Mustela" },
  { id: 6, name: "Ducray" },
  { id: 7, name: "Nuxe" },
  { id: 8, name: "Uriage" },
  { id: 9, name: "Oral-B" },
  { id: 10, name: "Arkopharma" },
  { id: 11, name: "Bepanthen" },
  { id: 12, name: "Klorane" },
];

const CATEGORY_DEFINITIONS = [
  {
    id: 1,
    name: "Visage",
    image: visageCategoryImage,
    lifestyle: storefrontImage,
    brandIds: [1, 2, 3, 4, 8],
    descriptorPool: ["Serum Hydratant", "Creme Apaisante", "Fluide Eclat", "Gel Nettoyant"],
    targetPool: ["Peaux Sensibles", "Peaux Mixtes", "Peaux Seches", "Routine Quotidienne"],
    capacities: ["30 ml", "40 ml", "50 ml"],
    colors: ["Claire", "Beige", "Rose", "Transparent"],
    basePrice: 79,
    children: [
      { id: 101, name: "Serums" },
      { id: 102, name: "Cremes" },
      { id: 103, name: "Protection Solaire" },
    ],
  },
  {
    id: 2,
    name: "Corps",
    image: corpsCategoryImage,
    lifestyle: naturalCareImage,
    brandIds: [1, 7, 8, 11],
    descriptorPool: ["Lait Nourrissant", "Baume Reparateur", "Huile Douceur", "Gel Tonique"],
    targetPool: ["Hydratation Intense", "Confort Quotidien", "Peaux Tres Seches", "Massage Bien-Etre"],
    capacities: ["200 ml", "250 ml", "400 ml"],
    colors: ["White", "Beige", "Orange", "Transparent"],
    basePrice: 69,
    children: [
      { id: 201, name: "Hydratation" },
      { id: 202, name: "Soin Reparateur" },
      { id: 203, name: "Massage" },
    ],
  },
  {
    id: 3,
    name: "Capillaire",
    image: capillaireImage,
    lifestyle: pharmacistImage,
    brandIds: [3, 6, 12],
    descriptorPool: ["Shampooing Fortifiant", "Masque Nutrition", "Serum Densite", "Lotion Equilibre"],
    targetPool: ["Cheveux Secs", "Cheveux Fins", "Racines Sensibles", "Routine Anti-Chute"],
    capacities: ["150 ml", "200 ml", "300 ml"],
    colors: ["Green", "Blue", "Transparent", "White"],
    basePrice: 74,
    children: [
      { id: 301, name: "Shampooings" },
      { id: 302, name: "Masques" },
      { id: 303, name: "Soins Sans Rincage" },
    ],
  },
  {
    id: 4,
    name: "Hygiene",
    image: hygieneCategoryImage,
    lifestyle: skincareImage,
    brandIds: [4, 7, 8, 12],
    descriptorPool: ["Gel Lavant", "Savon Doux", "Mousse Purifiante", "Spray Fraicheur"],
    targetPool: ["Usage Quotidien", "Peaux Delicates", "Format Famille", "Protection Active"],
    capacities: ["100 ml", "250 ml", "500 ml"],
    colors: ["Transparent", "Green", "White", "Blue"],
    basePrice: 49,
    children: [
      { id: 401, name: "Gel Douche" },
      { id: 402, name: "Soin Lavant" },
    ],
  },
  {
    id: 5,
    name: "Complements Alimentaires",
    image: complementAlimentaireImage,
    lifestyle: ecoImage,
    brandIds: [4, 7, 10],
    descriptorPool: ["Pack Energie", "Formule Immunite", "Complexe Detox", "Capsules Sommeil"],
    targetPool: ["Cure 30 Jours", "Vitalite Quotidienne", "Defense Naturelle", "Equilibre Global"],
    capacities: ["30 capsules", "45 capsules", "60 capsules"],
    colors: ["Orange", "Green", "Yellow", "White"],
    basePrice: 89,
    children: [
      { id: 501, name: "Immunite" },
      { id: 502, name: "Vitalite" },
      { id: 503, name: "Digestion" },
    ],
  },
  {
    id: 6,
    name: "Bebe & Maman",
    image: bebesMamansImage,
    lifestyle: pharmacyInteriorImage,
    brandIds: [5, 8, 11],
    descriptorPool: ["Creme Change", "Lait Toilette", "Huile Maternite", "Gel Douceur"],
    targetPool: ["Nouveau-Ne", "Peaux Delicates", "Routine Bebe", "Confort Maman"],
    capacities: ["100 ml", "200 ml", "300 ml"],
    colors: ["Pink", "White", "Claire", "Transparent"],
    basePrice: 59,
    children: [
      { id: 601, name: "Soin Bebe" },
      { id: 602, name: "Toilette" },
      { id: 603, name: "Maternite" },
    ],
  },
  {
    id: 7,
    name: "Bucco-Dentaire",
    image: buccoDentaireImage,
    lifestyle: teethImage,
    brandIds: [2, 8, 9],
    descriptorPool: ["Dentifrice Soin", "Bain de Bouche", "Kit Blancheur", "Spray Haleine"],
    targetPool: ["Gencives Sensibles", "Protection Complete", "Fraicheur Menthe", "Routine Sourire"],
    capacities: ["75 ml", "250 ml", "2 pieces"],
    colors: ["Blue", "White", "Green", "Transparent"],
    basePrice: 45,
    children: [
      { id: 701, name: "Dentifrices" },
      { id: 702, name: "Accessoires" },
    ],
  },
  {
    id: 8,
    name: "Homme",
    image: hommeCategoryImage,
    lifestyle: painReliefImage,
    brandIds: [3, 6, 7, 12],
    descriptorPool: ["Gel Rasage", "Baume Barbe", "Soin Hydratant", "Shampooing 2-en-1"],
    targetPool: ["Routine Matin", "Peaux Reactives", "Barbe Disciplinee", "Usage Sportif"],
    capacities: ["75 ml", "100 ml", "150 ml"],
    colors: ["Black", "Grey", "Blue", "White"],
    basePrice: 72,
    children: [
      { id: 801, name: "Rasage" },
      { id: 802, name: "Barbe & Cheveux" },
    ],
  },
  {
    id: 9,
    name: "Appareils & Accessoires",
    image: appareilsAccessoriesImage,
    lifestyle: pharmacistImage,
    brandIds: [1, 4, 9, 10],
    descriptorPool: ["Thermometre Digital", "Tensiometre Compact", "Diffuseur Nomade", "Accessoire Sante"],
    targetPool: ["Maison", "Voyage", "Suivi Quotidien", "Precision Rapide"],
    capacities: ["1 piece", "1 kit", "2 pieces"],
    colors: ["White", "Grey", "Blue", "Black"],
    basePrice: 99,
    children: [
      { id: 901, name: "Suivi Sante" },
      { id: 902, name: "Accessoires" },
    ],
  },
];

const REVIEWER_NAMES = [
  "Salma Idrissi",
  "Nadia El Amrani",
  "Youssef Benali",
  "Meriem Ait Said",
  "Anas Bousfiha",
  "Imane Chraibi",
];

const LIFESTYLE_IMAGES = [
  storefrontImage,
  naturalCareImage,
  pharmacyInteriorImage,
  pharmacistImage,
  skincareImage,
  ecoImage,
];

const PRODUCT_IMAGE_POOL = productImageContext
  .keys()
  .sort((first, second) => first.localeCompare(second))
  .map((key) => productImageContext(key));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BRAND_LOOKUP = new Map(BRAND_DEFINITIONS.map((brand) => [brand.id, brand]));

const FLAT_CATEGORIES = [];
CATEGORY_DEFINITIONS.forEach((category) => {
  const children = category.children.map((child) => ({
    ...child,
    slug: toSlug(child.name),
    parent_id: category.id,
  }));

  const topCategory = {
    id: category.id,
    name: category.name,
    slug: toSlug(category.name),
    parent_id: null,
    children,
  };

  FLAT_CATEGORIES.push(topCategory, ...children);
});

const DESCENDANT_IDS_BY_CATEGORY = CATEGORY_DEFINITIONS.reduce((accumulator, category) => {
  accumulator[String(category.id)] = new Set([String(category.id), ...category.children.map((child) => String(child.id))]);
  category.children.forEach((child) => {
    accumulator[String(child.id)] = new Set([String(child.id)]);
  });
  return accumulator;
}, {});

function buildProducts() {
  const products = [];
  let productId = 1;
  let variantId = 1000;
  let imageId = 5000;
  let productImageIndex = 0;

  CATEGORY_DEFINITIONS.forEach((category, categoryIndex) => {
    for (let index = 0; index < 12; index += 1) {
      const child = category.children[index % category.children.length];
      const descriptor = category.descriptorPool[index % category.descriptorPool.length];
      const target = category.targetPool[(index + categoryIndex) % category.targetPool.length];
      const brand = BRAND_LOOKUP.get(category.brandIds[index % category.brandIds.length]);
      const secondaryImage = LIFESTYLE_IMAGES[(index + categoryIndex) % LIFESTYLE_IMAGES.length];
      const name = `${descriptor} ${target}`;
      const basePrice = category.basePrice + categoryIndex * 4 + (index % 5) * 9;
      const productImage = PRODUCT_IMAGE_POOL[productImageIndex] || category.image;
      const variants = [];

      for (let variantIndex = 0; variantIndex < 3; variantIndex += 1) {
        const color = category.colors[(index + variantIndex) % category.colors.length];
        variants.push({
          id: variantId++,
          sku: `PP-${productId}-${variantIndex + 1}`,
          color,
          finish: ["Classic", "Sensitive", "Intense"][variantIndex % 3],
          capacity: category.capacities[(index + variantIndex) % category.capacities.length],
          price: basePrice + variantIndex * 7,
          stock: 6 + ((index + variantIndex + categoryIndex) % 18),
        });
      }

      products.push({
        id: productId,
        slug: `${toSlug(name)}-${productId}`,
        name,
        description: `${name} de ${brand?.name || "Parapharmacie"} pour ${target.toLowerCase()}. Cette fiche locale a ete ajoutee pour faire fonctionner la boutique sans back-end heberge, avec des informations coherentes et un rendu visuel complet.`,
        brand_id: brand?.id || null,
        brand: brand ? clone(brand) : null,
        category_id: child.id,
        category: {
          id: child.id,
          name: child.name,
          parent_id: category.id,
          parent: {
            id: category.id,
            name: category.name,
          },
        },
        created_at: new Date(2026, categoryIndex, index + 1).toISOString(),
        images: [
          { id: imageId++, image_path: productImage, is_main: true },
          { id: imageId++, image_path: secondaryImage, is_main: false },
          { id: imageId++, image_path: category.lifestyle, is_main: false },
        ],
        variants,
      });

      productImageIndex += 1;
      productId += 1;
    }
  });

  return products;
}

const BASE_PRODUCTS = buildProducts();

const BASE_REVIEWS = BASE_PRODUCTS.slice(0, 24).map((product, index) => ({
  id: `base-review-${index + 1}`,
  product_id: product.id,
  user_id: `seed-user-${(index % REVIEWER_NAMES.length) + 1}`,
  user: {
    id: `seed-user-${(index % REVIEWER_NAMES.length) + 1}`,
    name: REVIEWER_NAMES[index % REVIEWER_NAMES.length],
  },
  rating: 4 + (index % 2),
  comment: `Tres bon retour sur ${product.name.toLowerCase()}. La texture est agreable, le format ${product.variants[0]?.capacity || "standard"} est pratique et le rapport qualite-prix est rassurant.`,
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
    const product = BASE_PRODUCTS.find((item) => String(item.id) === String(review.product_id));
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
    reviews: clone(reviewsByProductId[String(product.id)] || []),
  }));
}

function filterProducts(products, params = {}) {
  const search = String(params.q || "").trim().toLowerCase();
  const categoryId = params.category_id ? String(params.category_id) : "";
  const brandId = params.brand_id ? String(params.brand_id) : "";
  const color = String(params.color || "").trim().toLowerCase();
  const allowedCategoryIds = categoryId ? DESCENDANT_IDS_BY_CATEGORY[categoryId] || new Set([categoryId]) : null;

  return products.filter((product) => {
    if (allowedCategoryIds && !allowedCategoryIds.has(String(product.category_id))) return false;
    if (brandId && String(product.brand_id) !== brandId) return false;
    if (color) {
      const hasColor = Array.isArray(product.variants)
        ? product.variants.some((variant) => String(variant.color || "").toLowerCase() === color)
        : false;
      if (!hasColor) return false;
    }
    if (!search) return true;

    const haystack = [
      product.name,
      product.description,
      product.brand?.name,
      product.category?.name,
      product.category?.parent?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function getMockCategories() {
  return clone(FLAT_CATEGORIES);
}

export function getMockBrands(params = {}) {
  const products = filterProducts(hydrateProducts(), params);
  const brandIds = new Set(products.map((product) => String(product.brand_id)).filter(Boolean));
  const brands = BRAND_DEFINITIONS.filter((brand) => brandIds.has(String(brand.id)));
  return clone(brands.length > 0 ? brands : BRAND_DEFINITIONS);
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
  const product = BASE_PRODUCTS.find((item) => String(item.id) === String(product_id));
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
