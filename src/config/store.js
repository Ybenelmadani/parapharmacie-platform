const DEFAULT_SHIPPING_FEE = 0;

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const STORE_NAME = (process.env.REACT_APP_STORE_NAME || "Adwart").trim();
export const STORE_DESCRIPTION = (
  process.env.REACT_APP_STORE_DESCRIPTION ||
  "Adwart, listen to your art "
).trim();
export const STORE_CURRENCY_CODE = (process.env.REACT_APP_CURRENCY_CODE || "MAD").trim();
export const STORE_CURRENCY_LOCALE = (process.env.REACT_APP_CURRENCY_LOCALE || "fr-MA").trim();
export const STORE_SHIPPING_FEE = readNumber(
  process.env.REACT_APP_SHIPPING_FEE,
  DEFAULT_SHIPPING_FEE
);
export const STORE_SUPPORT_PHONE = (process.env.REACT_APP_SUPPORT_PHONE || "+212 6 29 69 66 56").trim();
export const STORE_SUPPORT_EMAIL = (
  process.env.REACT_APP_SUPPORT_EMAIL || "adwart20@yahoo.com"
).trim();
export const STORE_CITY = (process.env.REACT_APP_STORE_CITY || "sinko, Mag 29, residence Riad nawal, mouzdalifa, Marrakech 40090").trim();
