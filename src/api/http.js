import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://ecommerce_parapharmacie.test/api",
  headers: { Accept: "application/json" },
});

const GUEST_TOKEN_KEY = "guest_token";

function createGuestToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function getGuestToken() {
  if (typeof window === "undefined") return null;

  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = createGuestToken();
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }

  return token;
}

// Add Authorization: Bearer <token> automatically if user is logged in.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const guestToken = getGuestToken();
  if (guestToken) config.headers["X-Guest-Token"] = guestToken;

  return config;
});

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function extractId(value) {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (isPlainObject(value)) return value.id ?? value._id ?? null;
  return null;
}

function normalizePayload(value) {
  if (Array.isArray(value)) {
    return value.map(normalizePayload);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const normalized = {};

  Object.entries(value).forEach(([key, rawValue]) => {
    const child = normalizePayload(rawValue);

    switch (key) {
      case "_id":
        normalized.id = String(child);
        break;
      case "createdAt":
        normalized.created_at = child;
        normalized.createdAt = child;
        break;
      case "updatedAt":
        normalized.updated_at = child;
        normalized.updatedAt = child;
        break;
      case "imagePath":
        normalized.image_path = child;
        normalized.imagePath = child;
        break;
      case "isMain":
        normalized.is_main = child;
        normalized.isMain = child;
        break;
      case "unitPrice":
        normalized.unit_price = child;
        normalized.unitPrice = child;
        break;
      case "guestToken":
        normalized.guest_token = child;
        normalized.guestToken = child;
        break;
      case "shippingFee":
        normalized.shipping_fee = child;
        normalized.shippingFee = child;
        break;
      case "paymentStatus":
        normalized.payment_status = child;
        normalized.paymentStatus = child;
        break;
      case "paymentMethod":
        normalized.payment_method = child;
        normalized.paymentMethod = child;
        break;
      default:
        normalized[key] = child;
        break;
    }
  });

  if (!("id" in normalized) && "_id" in value) {
    normalized.id = String(value._id);
  }

  const relationKeys = [
    ["parent", "parent_id"],
    ["category", "category_id"],
    ["brand", "brand_id"],
    ["user", "user_id"],
    ["product", "product_id"],
    ["variant", "variant_id"],
  ];

  relationKeys.forEach(([relationKey, idKey]) => {
    if (!(idKey in normalized) && relationKey in normalized) {
      const relationId = extractId(normalized[relationKey]);
      if (relationId != null) {
        normalized[idKey] = relationId;
      }
    }
  });

  if (!("product_variant_id" in normalized) && "variant_id" in normalized) {
    normalized.product_variant_id = normalized.variant_id;
  }

  return normalized;
}

http.interceptors.response.use((response) => {
  response.data = normalizePayload(response.data);
  return response;
});
