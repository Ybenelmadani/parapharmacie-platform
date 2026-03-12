import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

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
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-black mb-4">Login</h1>
      <p className="mb-4 text-sm text-slate-600">
        Customer accounts are optional. Visitors can order without signing up, while admins sign in here to manage the store.
      </p>

      {err ? (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-2 font-semibold disabled:opacity-60"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account? <Link className="underline" to="/register">Create one if you want faster reorders and order history</Link>
      </p>
    </div>
  );
}
