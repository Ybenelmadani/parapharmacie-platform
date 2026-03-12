import { useEffect, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";

const ROLE_STYLE = {
  admin: { background: "#dbeafe", color: "#1e3a8a" },
  user: { background: "#e2e8f0", color: "#334155" },
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });

  const load = async (targetPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/users", {
        params: {
          page: targetPage,
          per_page: pagination.per_page,
          q: search.trim() || undefined,
          role: roleFilter || undefined,
        },
      });

      const payload = res?.data ?? {};
      setUsers(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: Number(payload.current_page) || targetPage,
        last_page: Number(payload.last_page) || 1,
        total: Number(payload.total) || 0,
        per_page: Number(payload.per_page) || pagination.per_page,
      });
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) load(1);
      else setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const changeRole = async (id, role) => {
    const confirmMsg = `Confirm change role to ${role}?`;
    if (!window.confirm(confirmMsg)) return;

    setError("");
    setSuccess("");

    try {
      await http.patch(`/admin/users/${id}/role`, { role });
      setSuccess("Role updated successfully.");
      await load(page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || "Failed to update role.");
    }
  };

  const setCreateField = (key, value) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    try {
      await http.post("/admin/users", {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone || undefined,
        address: createForm.address || undefined,
      });

      setSuccess("Admin account created successfully.");
      setCreateForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      });
      await load(page);
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        (e?.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join(" | ")
          : "Failed to create account.");
      setError(apiMsg);
    } finally {
      setCreating(false);
    }
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 14 }}>Users</h2>

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <form
          onSubmit={createUser}
          style={{
            marginBottom: "18px",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #dbeafe",
            background: "#f8fbff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: "18px", color: "#0f172a" }}>Create admin</div>
              <div style={{ color: "#475569", fontSize: "14px" }}>This form creates an admin account only.</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            <input
              value={createForm.name}
              onChange={(e) => setCreateField("name", e.target.value)}
              placeholder="Full name"
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              required
            />
            <input
              value={createForm.email}
              onChange={(e) => setCreateField("email", e.target.value)}
              placeholder="Email"
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              required
            />
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateField("password", e.target.value)}
              placeholder="Password (min 6)"
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              required
            />
            <input
              value={createForm.phone}
              onChange={(e) => setCreateField("phone", e.target.value)}
              placeholder="Phone (optional)"
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
            <input
              value={createForm.address}
              onChange={(e) => setCreateField("address", e.target.value)}
              placeholder="Address (optional)"
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", gridColumn: "1 / -1" }}
            />
          </div>

          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: "10px 16px",
                border: 0,
                borderRadius: "10px",
                background: "#0f172a",
                color: "#fff",
                fontWeight: 800,
                opacity: creating ? 0.7 : 1,
                cursor: creating ? "not-allowed" : "pointer",
              }}
            >
              {creating ? "Creating..." : "Create admin"}
            </button>
          </div>
        </form>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or phone"
            style={{ flex: "1 1 280px", minWidth: "220px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
          >
            <option value="">All roles</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
          <button
            onClick={async () => {
              setSearch("");
              setRoleFilter("");
              if (page === 1) await load(1);
              else setPage(1);
            }}
            style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", fontWeight: 700, color: "#0f172a" }}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>No users found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Email</th>
                  <th style={{ textAlign: "left" }}>Role</th>
                  <th style={{ textAlign: "left" }}>Phone</th>
                  <th style={{ textAlign: "left" }}>Address</th>
                  <th style={{ textAlign: "left" }}>Change role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => {
                  const role = String(u.role || "user").toLowerCase();
                  const roleStyle = ROLE_STYLE[role] || ROLE_STYLE.user;

                  return (
                    <tr key={u.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{ padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", textTransform: "capitalize", ...roleStyle }}>
                          {role}
                        </span>
                      </td>
                      <td>{u.phone || "-"}</td>
                      <td>{u.address || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#f59e0b", color: "#fff", fontWeight: 700 }}
                            onClick={() => changeRole(u.id, "user")}
                            disabled={role === "user"}
                          >
                            User
                          </button>
                          <button
                            style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0284c7", color: "#fff", fontWeight: 700 }}
                            onClick={() => changeRole(u.id, "admin")}
                            disabled={role === "admin"}
                          >
                            Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading ? (
          <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ color: "#475569", fontSize: "14px" }}>
              Total: {pagination.total} users | Page {pagination.current_page} / {pagination.last_page}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: hasPrev ? "#fff" : "#f1f5f9", color: "#0f172a", fontWeight: 700, cursor: hasPrev ? "pointer" : "not-allowed" }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={!hasNext}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #0f172a", background: hasNext ? "#0f172a" : "#cbd5e1", color: "#fff", fontWeight: 700, cursor: hasNext ? "pointer" : "not-allowed" }}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
