import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { pick } = useI18n();
  const { success } = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const ui = pick({
    fr: {
      title: "Connexion",
      description: "Les comptes clients sont facultatifs. Les visiteurs peuvent commander sans s'inscrire, tandis que les admins se connectent ici pour gerer la boutique.",
      loggedIn: "Connexion reussie.",
      loginFailed: "Echec de connexion",
      email: "Email",
      password: "Mot de passe",
      forgot: "Mot de passe oublie ?",
      loading: "Chargement...",
      login: "Connexion",
      noAccount: "Pas de compte ?",
      createOne: "Creez-en un pour des commandes plus rapides et l'historique",
    },
    en: {
      title: "Login",
      description: "Customer accounts are optional. Visitors can order without signing up, while admins sign in here to manage the store.",
      loggedIn: "Logged in successfully.",
      loginFailed: "Login failed",
      email: "Email",
      password: "Password",
      forgot: "Forgot password?",
      loading: "Loading...",
      login: "Login",
      noAccount: "No account?",
      createOne: "Create one if you want faster reorders and order history",
    },
    ar: {
      title: "تسجيل الدخول",
      description: "حسابات العملاء اختيارية. يمكن للزوار الطلب بدون تسجيل، بينما يسجل المشرفون الدخول هنا لإدارة المتجر.",
      loggedIn: "تم تسجيل الدخول بنجاح.",
      loginFailed: "فشل تسجيل الدخول",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      forgot: "هل نسيت كلمة المرور؟",
      loading: "جارٍ التحميل...",
      login: "تسجيل الدخول",
      noAccount: "ليس لديك حساب؟",
      createOne: "أنشئ حسابًا إذا كنت تريد طلبات أسرع وسجل الطلبات",
    },
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const from = loc.state?.from || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      success(ui.loggedIn);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || ui.loginFailed);
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
          placeholder={ui.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder={ui.password}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

    <p className="text-sm text-right">
        <Link className="underline text-slate-600" to="/forgot-password">
          {ui.forgot}
        </Link>
      </p>


        <button
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 font-semibold disabled:opacity-60"
        >
          {loading ? ui.loading : ui.login}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {ui.noAccount} <Link className="underline" to="/register">{ui.createOne}</Link>
      </p>
    </div>
  );
}
