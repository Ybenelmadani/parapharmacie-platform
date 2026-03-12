import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

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
      nav("/", { replace: true });
    } catch (e2) {
      // Laravel validation errors possible
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors
          ? Object.values(e2.response.data.errors).flat().join(" | ")
          : "Register failed");
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-black mb-4">Create account</h1>
      <p className="mb-4 text-sm text-slate-600">
        Creating an account is optional for customers. You can still browse and place orders as a guest.
      </p>

      {err ? (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Password (min 6)"
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          autoComplete="new-password"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Address (optional)"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          autoComplete="street-address"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 font-semibold disabled:opacity-60"
        >
          {loading ? "Loading..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link className="underline" to="/login">Login</Link>
      </p>
    </div>
  );
}
