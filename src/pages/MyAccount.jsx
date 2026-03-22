import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";

export default function MyAccount() {
  const { user, refreshUser, updateUser } = useAuth();
  const { pick } = useI18n();
  const { success, error: notifyError } = useToast();
  const ui = pick({
    fr: {
      title: "Mon compte",
      subtitle: "Enregistrez vos informations de contact pour accelerer le paiement et gerer votre profil.",
      viewOrders: "Voir mes commandes",
      updated: "Les details de votre compte ont ete mis a jour.",
      failed: "Impossible de mettre a jour votre compte.",
      fullName: "Nom complet",
      email: "Email",
      phone: "Telephone",
      phonePlaceholder: "Votre numero de telephone",
      address: "Adresse de livraison",
      addressPlaceholder: "Votre adresse de livraison enregistree",
      checkoutHint: "Votre telephone et votre adresse enregistres seront reutilises automatiquement lors du paiement.",
      saving: "Enregistrement...",
      save: "Enregistrer les modifications",
    },
    en: {
      title: "My Account",
      subtitle: "Save your contact information to speed up checkout and manage your profile.",
      viewOrders: "View my orders",
      updated: "Your account details were updated.",
      failed: "Unable to update your account.",
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      phonePlaceholder: "Your phone number",
      address: "Shipping address",
      addressPlaceholder: "Your saved delivery address",
      checkoutHint: "Your saved phone and address will be reused automatically during checkout.",
      saving: "Saving...",
      save: "Save changes",
    },
    ar: {
      title: "حسابي",
      subtitle: "احفظ معلومات الاتصال لتسريع الطلب وإدارة ملفك الشخصي.",
      viewOrders: "عرض طلباتي",
      updated: "تم تحديث بيانات حسابك.",
      failed: "تعذر تحديث حسابك.",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      phonePlaceholder: "رقم هاتفك",
      address: "عنوان الشحن",
      addressPlaceholder: "عنوان التوصيل المحفوظ",
      checkoutHint: "سيُعاد استخدام الهاتف والعنوان المحفوظين تلقائيًا أثناء إتمام الشراء.",
      saving: "جارٍ الحفظ...",
      save: "حفظ التغييرات",
    },
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });
  }, [user]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await http.patch("/me", {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
      });

      updateUser(res.data);
      await refreshUser().catch(() => {});
      success(ui.updated);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const firstDetailedError = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().find(Boolean)
        : null;
      const message = firstDetailedError || apiMsg || ui.failed;
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-8 text-white shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{ui.title}</h1>
            <p className="mt-2 text-sm text-slate-200">
              {ui.subtitle}
            </p>
          </div>
          <Link
            to="/my-orders"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {ui.viewOrders}
          </Link>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{ui.fullName}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{ui.email}</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{ui.phone}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder={ui.phonePlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{ui.address}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder={ui.addressPlaceholder}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div>{ui.checkoutHint}</div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {saving ? ui.saving : ui.save}
          </button>
        </div>
      </form>
    </div>
  );
}
