import { STORE_CURRENCY_CODE, STORE_CURRENCY_LOCALE } from "../config/store";
import { getActiveLanguage, getLocaleForLanguage } from "../context/I18nContext";

const formatterCache = new Map();

function getFormatter(locale) {
  const cacheKey = `${locale}:${STORE_CURRENCY_CODE}`;
  if (!formatterCache.has(cacheKey)) {
    formatterCache.set(
      cacheKey,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: STORE_CURRENCY_CODE,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  return formatterCache.get(cacheKey);
}

export function formatMoney(value, language = getActiveLanguage()) {
  const locale = getLocaleForLanguage(language) || STORE_CURRENCY_LOCALE;
  return getFormatter(locale).format(Number(value || 0));
}

export const formatEuro = formatMoney;
