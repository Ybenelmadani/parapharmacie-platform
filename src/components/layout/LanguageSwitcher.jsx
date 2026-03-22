import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SUPPORTED_LANGUAGES, useI18n } from "../../context/I18nContext";

const labels = {
  fr: { french: "Francais", english: "Anglais", arabic: "Arabe" },
  en: { french: "French", english: "English", arabic: "Arabic" },
  ar: { french: "الفرنسية", english: "الإنجليزية", arabic: "العربية" },
};

function FlagIcon({ code, className = "h-5 w-5" }) {
  if (code === "fr") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} overflow-hidden rounded-full`}>
        <rect width="8" height="24" fill="#1d4ed8" />
        <rect x="8" width="8" height="24" fill="#ffffff" />
        <rect x="16" width="8" height="24" fill="#dc2626" />
      </svg>
    );
  }

  if (code === "en") {
    return (
      <svg viewBox="0 0 24 24" className={`${className} overflow-hidden rounded-full`}>
        <rect width="24" height="24" fill="#1d4ed8" />
        <path d="M0 2.8 2.8 0 24 21.2 21.2 24Z" fill="#fff" />
        <path d="M21.2 0 24 2.8 2.8 24 0 21.2Z" fill="#fff" />
        <path d="M0 5.2 5.2 0 24 18.8 18.8 24Z" fill="#dc2626" />
        <path d="M18.8 0 24 5.2 5.2 24 0 18.8Z" fill="#dc2626" />
        <rect y="9" width="24" height="6" fill="#fff" />
        <rect x="9" width="6" height="24" fill="#fff" />
        <rect y="10.2" width="24" height="3.6" fill="#dc2626" />
        <rect x="10.2" width="3.6" height="24" fill="#dc2626" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={`${className} overflow-hidden rounded-full`}>
      <rect width="24" height="24" fill="#c1121f" />
      <path
        d="m12 6.2 1.46 4.48h4.71l-3.81 2.77 1.45 4.48L12 15.17 8.19 17.93l1.45-4.48-3.81-2.77h4.71Z"
        fill="none"
        stroke="#0f7b47"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LanguageSwitcher({ compact = false, direction = "down" }) {
  const wrapperRef = useRef(null);
  const { language, setLanguage, pick } = useI18n();
  const [open, setOpen] = useState(false);
  const ui = pick(labels);

  const languageOptions = useMemo(
    () =>
      [
        { code: "fr", label: ui.french },
        { code: "en", label: ui.english },
        { code: "ar", label: ui.arabic },
      ].filter((item) => SUPPORTED_LANGUAGES.includes(item.code)),
    [ui.arabic, ui.english, ui.french]
  );

  const activeLanguage = languageOptions.find((option) => option.code === language) || languageOptions[0];
  const otherLanguages = languageOptions.filter((option) => option.code !== activeLanguage?.code);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${compact ? "w-full" : ""}`} dir="ltr">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${
          compact ? "w-full" : ""
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={activeLanguage?.label}
        title={activeLanguage?.label}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-black/10">
          <FlagIcon code={activeLanguage?.code} className="h-7 w-7" />
        </span>
        <ChevronDown size={15} className={`text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          className={`absolute z-50 min-w-[150px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)] ${
            direction === "up" ? "bottom-full mb-2" : "mt-2"
          } ${
            compact ? "left-0 right-0" : "right-0"
          }`}
          role="menu"
        >
          {otherLanguages.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
              role="menuitem"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-black/10">
                <FlagIcon code={option.code} className="h-6 w-6" />
              </span>
              <span className="flex-1">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
