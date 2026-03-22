import React, { useState } from "react";
import { http } from "../api/http";
import { useI18n } from "../context/I18nContext";

export default function ForgotPassword() {
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      title: "Mot de passe oublie",
      email: "Email",
      loading: "Chargement...",
      submit: "Envoyer le lien de reinitialisation",
      failed: "Impossible d'envoyer le lien de reinitialisation",
    },
    en: {
      title: "Forgot password",
      email: "Email",
      loading: "Loading...",
      submit: "Send reset link",
      failed: "Failed to send reset link",
    },
    ar: {
      title: "نسيت كلمة المرور",
      email: "البريد الإلكتروني",
      loading: "جارٍ التحميل...",
      submit: "إرسال رابط إعادة التعيين",
      failed: "فشل إرسال رابط إعادة التعيين",
    },
  });
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const res = await http.post("/forgot-password", { email });
      setMsg(res.data.message);
    } catch (e2) {
      setErr(
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors
          ? Object.values(e2.response.data.errors).flat().join(" | ")
          : ui.failed)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-black mb-4">{ui.title}</h1>

      {msg ? <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm">{msg}</div> : null}
      {err ? <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{err}</div> : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-xl px-4 py-2"
          type="email"
          placeholder={ui.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 font-semibold disabled:opacity-60"
        >
          {loading ? ui.loading : ui.submit}
        </button>
      </form>
    </div>
  );
}
