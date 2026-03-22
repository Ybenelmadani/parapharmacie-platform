import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "adwart-language";
const DEFAULT_LANGUAGE = "fr";

export const LANGUAGE_META = {
  fr: { code: "fr", label: "Francais", nativeLabel: "Francais", flag: "🇫🇷", dir: "ltr", locale: "fr-MA" },
  en: { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", dir: "ltr", locale: "en-US" },
  ar: { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇲🇦", dir: "rtl", locale: "ar-MA" },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_META);

const COLOR_NAMES = {
  Red: { fr: "Rouge", en: "Red", ar: "أحمر" },
  Yellow: { fr: "Jaune", en: "Yellow", ar: "أصفر" },
  Blue: { fr: "Bleu", en: "Blue", ar: "أزرق" },
  Green: { fr: "Vert", en: "Green", ar: "أخضر" },
  Black: { fr: "Noir", en: "Black", ar: "أسود" },
  White: { fr: "Blanc", en: "White", ar: "أبيض" },
  Pink: { fr: "Rose", en: "Pink", ar: "وردي" },
  Orange: { fr: "Orange", en: "Orange", ar: "برتقالي" },
  Brown: { fr: "Marron", en: "Brown", ar: "بني" },
  Grey: { fr: "Gris", en: "Grey", ar: "رمادي" },
};

const I18nContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  return DEFAULT_LANGUAGE;
}

export function getActiveLanguage() {
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement.lang?.split("-")?.[0];
    if (SUPPORTED_LANGUAGES.includes(htmlLang)) return htmlLang;
  }
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  }
  return DEFAULT_LANGUAGE;
}

export function getLocaleForLanguage(language = getActiveLanguage()) {
  return LANGUAGE_META[language]?.locale || LANGUAGE_META[DEFAULT_LANGUAGE].locale;
}

export function getDirectionForLanguage(language = getActiveLanguage()) {
  return LANGUAGE_META[language]?.dir || "ltr";
}

export function translateColorName(name, language = getActiveLanguage()) {
  return COLOR_NAMES[name]?.[language] || name;
}

export function resolveLocalizedValue(value, language = getActiveLanguage()) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const hasLanguageShape = SUPPORTED_LANGUAGES.some((code) => Object.prototype.hasOwnProperty.call(value, code));
  if (!hasLanguageShape) return value;

  return value[language] ?? value.fr ?? value.en ?? value.ar ?? "";
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = getDirectionForLanguage(language);
    }
  }, [language]);

  const value = useMemo(() => {
    const locale = getLocaleForLanguage(language);

    return {
      language,
      locale,
      dir: getDirectionForLanguage(language),
      setLanguage,
      pick: (messages) => messages?.[language] || messages?.fr || messages?.en || {},
      getLanguageLabel: (code) => LANGUAGE_META[code]?.nativeLabel || code,
      translateColor: (name) => translateColorName(name, language),
      resolveValue: (value) => resolveLocalizedValue(value, language),
      formatDate: (value, options = {}) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return new Intl.DateTimeFormat(locale, options).format(date);
      },
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
