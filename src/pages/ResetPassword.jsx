import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { useI18n } from "../context/I18nContext";

function getResetErrorMessage(error, ui) {
  const response = error?.response;
  const fieldErrors = response?.data?.errors;
  const messages = fieldErrors ? Object.values(fieldErrors).flat() : [];
  const combinedMessage = [response?.data?.message, ...messages]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();

  if (combinedMessage.includes("invalid") || combinedMessage.includes("expired") || combinedMessage.includes("token")) {
    return ui.invalidLink;
  }

  if (messages.length > 0) {
    return messages.join(" | ");
  }

  return response?.data?.message || ui.failed;
}

export default function ResetPassword() {
  const location = useLocation();
  const nav = useNavigate();
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      title: "Reinitialiser le mot de passe",
      failed: "Impossible de reinitialiser le mot de passe",
      invalidLink: "Ce lien de reinitialisation est invalide ou expire. Veuillez demander un nouveau lien.",
      incompleteLink: "Ce lien de reinitialisation est incomplet. Veuillez rouvrir le lien depuis votre email.",
      missingInfo: "Ce lien ne contient pas toutes les informations necessaires. Utilisez le dernier lien recu par email.",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      loading: "Chargement...",
      submit: "Reinitialiser le mot de passe",
    },
    en: {
      title: "Reset password",
      failed: "Failed to reset password",
      invalidLink: "This reset link is invalid or has expired. Please request a new password reset link.",
      incompleteLink: "This reset link is incomplete. Please open the link from your email again.",
      missingInfo: "This link is missing required reset information. Please use the latest link from your email.",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      loading: "Loading...",
      submit: "Reset password",
    },
    ar: {
      title: "إعادة تعيين كلمة المرور",
      failed: "فشل إعادة تعيين كلمة المرور",
      invalidLink: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
      incompleteLink: "رابط إعادة التعيين غير مكتمل. يرجى فتح الرابط من بريدك الإلكتروني مرة أخرى.",
      missingInfo: "هذا الرابط يفتقد معلومات مطلوبة. يرجى استخدام أحدث رابط تم إرساله إلى بريدك.",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور",
      loading: "جارٍ التحميل...",
      submit: "إعادة تعيين كلمة المرور",
    },
  });

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const hasRequiredParams = Boolean(token && email);

  const [form, setForm] = useState({
    token,
    email,
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((current) => ({ ...current, token, email }));
  }, [email, token]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!hasRequiredParams) {
      setError(ui.incompleteLink);
      return;
    }

    setLoading(true);
    try {
      const response = await http.post("/reset-password", form);
      setMessage(response.data.message);
      setTimeout(() => nav("/login"), 1500);
    } catch (requestError) {
      setError(getResetErrorMessage(requestError, ui));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-black">{ui.title}</h1>

      {message ? <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</div> : null}
      {error ? <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {!hasRequiredParams ? <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{ui.missingInfo}</div> : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-xl border bg-slate-100 px-4 py-2" value={form.email} readOnly />
        <input
          className="w-full rounded-xl border px-4 py-2"
          type="password"
          placeholder={ui.newPassword}
          value={form.password}
          onChange={(event) => setField("password", event.target.value)}
        />
        <input
          className="w-full rounded-xl border px-4 py-2"
          type="password"
          placeholder={ui.confirmPassword}
          value={form.password_confirmation}
          onChange={(event) => setField("password_confirmation", event.target.value)}
        />

        <button
          disabled={loading || !hasRequiredParams}
          className="w-full rounded-xl bg-black py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? ui.loading : ui.submit}
        </button>
      </form>
    </div>
  );
}
