import React from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useI18n } from "../context/I18nContext";

export default function NotFound() {
  const { pick } = useI18n();
  const ui = pick({
    fr: { message: "Page introuvable.", back: "Retour a l'accueil" },
    en: { message: "Page not found.", back: "Back home" },
    ar: { message: "الصفحة غير موجودة.", back: "العودة للرئيسية" },
  });

  return (
    <Container className="py-16 text-center">
      <div className="text-5xl font-black">404</div>
      <p className="mt-3 text-slate-600">{ui.message}</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>{ui.back}</Button>
      </Link>
    </Container>
  );
}
