import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { pick } = useI18n();
  const { success } = useToast();
  const nav = useNavigate();
  const ui = pick({
    fr: {
      title: "Creer un compte",
      description: "La creation d'un compte est facultative pour les clients. Vous pouvez toujours parcourir et commander en tant qu'invite.",
      created: "Compte cree avec succes.",
      failed: "L'inscription a echoue",
      fullName: "Nom complet",
      email: "Email",
      password: "Mot de passe (min 6)",
      phone: "Telephone (optionnel)",
      address: "Adresse (optionnel)",
      loading: "Chargement...",
      register: "Inscription",
      already: "Vous avez deja un compte ?",
      login: "Connexion",
    },
    en: {
      title: "Create account",
      description: "Creating an account is optional for customers. You can still browse and place orders as a guest.",
      created: "Account created successfully.",
      failed: "Register failed",
      fullName: "Full name",
      email: "Email",
      password: "Password (min 6)",
      phone: "Phone (optional)",
      address: "Address (optional)",
      loading: "Loading...",
      register: "Register",
      already: "Already have an account?",
      login: "Login",
    },
    ar: {
      title: "إنشاء حساب",
      description: "إنشاء الحساب اختياري للعملاء. يمكنك التصفح والطلب كزائر.",
      created: "تم إنشاء الحساب بنجاح.",
      failed: "فشل التسجيل",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      password: "كلمة المرور (6 أحرف على الأقل)",
      phone: "الهاتف (اختياري)",
      address: "العنوان (اختياري)",
      loading: "جارٍ التحميل...",
      register: "إنشاء حساب",
      already: "هل لديك حساب بالفعل؟",
      login: "تسجيل الدخول",
    },
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      success(ui.created);
      nav("/", { replace: true });
    } catch (e2) {
      // Laravel validation errors possible
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors
          ? Object.values(e2.response.data.errors).flat().join(" | ")
          : ui.failed);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-black mb-4">{ui.title}</h1>
      <p className="mb-4 text-sm text-slate-600">
        {ui.description}
      </p>

      {err ? (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder={ui.fullName}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder={ui.email}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder={ui.password}
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          autoComplete="new-password"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder={ui.phone}
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder={ui.address}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          autoComplete="street-address"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 font-semibold disabled:opacity-60"
        >
          {loading ? ui.loading : ui.register}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {ui.already} <Link className="underline" to="/login">{ui.login}</Link>
      </p>
    </div>
  );
}
