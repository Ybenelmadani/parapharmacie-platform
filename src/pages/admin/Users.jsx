import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";
import { useI18n } from "../../context/I18nContext";

const ROLE_STYLE = {
  admin: { background: "#dbeafe", color: "#1e3a8a" },
  user: { background: "#e2e8f0", color: "#334155" },
};

export default function Users() {
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      title: "Utilisateurs",
      loadError: "Impossible de charger les utilisateurs.",
      confirmChangeRole: "Confirmer le changement de role vers",
      roleUpdated: "Role mis a jour avec succes.",
      roleUpdateError: "Impossible de mettre a jour le role.",
      accountCreated: "Compte administrateur cree avec succes.",
      accountCreateError: "Impossible de creer le compte.",
      createAdmin: "Creer un admin",
      createAdminHelp: "Ce formulaire cree uniquement un compte administrateur.",
      fullName: "Nom complet",
      email: "Email",
      password: "Mot de passe (min 6)",
      phoneOptional: "Telephone (optionnel)",
      addressOptional: "Adresse (optionnelle)",
      creating: "Creation...",
      createAdminButton: "Creer l'admin",
      searchPlaceholder: "Rechercher par nom, email ou telephone",
      allRoles: "Tous les roles",
      admin: "Admin",
      user: "Utilisateur",
      reset: "Reinitialiser",
      loading: "Chargement des utilisateurs...",
      empty: "Aucun utilisateur trouve.",
      id: "ID",
      name: "Nom",
      role: "Role",
      phone: "Telephone",
      address: "Adresse",
      changeRole: "Changer le role",
      total: "Total",
      users: "utilisateurs",
      page: "Page",
      previous: "Precedent",
      next: "Suivant",
    },
    en: {
      title: "Users",
      loadError: "Failed to load users.",
      confirmChangeRole: "Confirm change role to",
      roleUpdated: "Role updated successfully.",
      roleUpdateError: "Failed to update role.",
      accountCreated: "Admin account created successfully.",
      accountCreateError: "Failed to create account.",
      createAdmin: "Create admin",
      createAdminHelp: "This form creates an admin account only.",
      fullName: "Full name",
      email: "Email",
      password: "Password (min 6)",
      phoneOptional: "Phone (optional)",
      addressOptional: "Address (optional)",
      creating: "Creating...",
      createAdminButton: "Create admin",
      searchPlaceholder: "Search name, email or phone",
      allRoles: "All roles",
      admin: "Admin",
      user: "User",
      reset: "Reset",
      loading: "Loading users...",
      empty: "No users found.",
      id: "ID",
      name: "Name",
      role: "Role",
      phone: "Phone",
      address: "Address",
      changeRole: "Change role",
      total: "Total",
      users: "users",
      page: "Page",
      previous: "Previous",
      next: "Next",
    },
    ar: {
      title: "المستخدمون",
      loadError: "تعذر تحميل المستخدمين.",
      confirmChangeRole: "تأكيد تغيير الدور إلى",
      roleUpdated: "تم تحديث الدور بنجاح.",
      roleUpdateError: "تعذر تحديث الدور.",
      accountCreated: "تم إنشاء حساب الإدارة بنجاح.",
      accountCreateError: "تعذر إنشاء الحساب.",
      createAdmin: "إنشاء مدير",
      createAdminHelp: "هذا النموذج ينشئ حساب إدارة فقط.",
      fullName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      password: "كلمة المرور (6 على الأقل)",
      phoneOptional: "الهاتف (اختياري)",
      addressOptional: "العنوان (اختياري)",
      creating: "جار الإنشاء...",
      createAdminButton: "إنشاء مدير",
      searchPlaceholder: "ابحث بالاسم أو البريد أو الهاتف",
      allRoles: "كل الأدوار",
      admin: "مدير",
      user: "مستخدم",
      reset: "إعادة التعيين",
      loading: "جار تحميل المستخدمين...",
      empty: "لم يتم العثور على مستخدمين.",
      id: "المعرف",
      name: "الاسم",
      role: "الدور",
      phone: "الهاتف",
      address: "العنوان",
      changeRole: "تغيير الدور",
      total: "الإجمالي",
      users: "مستخدمين",
      page: "الصفحة",
      previous: "السابق",
      next: "التالي",
    },
  });

  const roleLabels = useMemo(
    () => ({
      admin: ui.admin,
      user: ui.user,
    }),
    [ui.admin, ui.user]
  );

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
  const searchRef = useRef(search);
  const roleFilterRef = useRef(roleFilter);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    roleFilterRef.current = roleFilter;
  }, [roleFilter]);

  const load = useCallback(
    async (targetPage = 1, overrides = {}) => {
      const query = typeof overrides.search === "string" ? overrides.search : searchRef.current;
      const role = typeof overrides.roleFilter === "string" ? overrides.roleFilter : roleFilterRef.current;

      setLoading(true);
      setError("");

      try {
        const res = await http.get("/admin/users", {
          params: {
            page: targetPage,
            per_page: pagination.per_page,
            q: query.trim() || undefined,
            role: role || undefined,
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
        setError(ui.loadError);
      } finally {
        setLoading(false);
      }
    },
    [pagination.per_page, ui.loadError]
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) load(1);
      else setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [load, page, roleFilter, search]);

  const changeRole = async (id, role) => {
    const confirmMsg = `${ui.confirmChangeRole} ${roleLabels[role] || role}?`;
    if (!window.confirm(confirmMsg)) return;

    setError("");
    setSuccess("");

    try {
      await http.patch(`/admin/users/${id}/role`, { role });
      setSuccess(ui.roleUpdated);
      await load(page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.roleUpdateError);
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

      setSuccess(ui.accountCreated);
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
          : ui.accountCreateError);
      setError(apiMsg);
    } finally {
      setCreating(false);
    }
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;

  return (
    <div style={{ width: "100%", maxWidth: "1500px", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 14 }}>{ui.title}</h2>

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
              <div style={{ fontWeight: 900, fontSize: "18px", color: "#0f172a" }}>{ui.createAdmin}</div>
              <div style={{ color: "#475569", fontSize: "14px" }}>{ui.createAdminHelp}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
            <input
              value={createForm.name}
              onChange={(e) => setCreateField("name", e.target.value)}
              placeholder={ui.fullName}
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              required
            />
            <input
              value={createForm.email}
              onChange={(e) => setCreateField("email", e.target.value)}
              placeholder={ui.email}
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              required
            />
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateField("password", e.target.value)}
              placeholder={ui.password}
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              required
            />
            <input
              value={createForm.phone}
              onChange={(e) => setCreateField("phone", e.target.value)}
              placeholder={ui.phoneOptional}
              style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
            <input
              value={createForm.address}
              onChange={(e) => setCreateField("address", e.target.value)}
              placeholder={ui.addressOptional}
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
              {creating ? ui.creating : ui.createAdminButton}
            </button>
          </div>
        </form>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ui.searchPlaceholder}
            style={{ flex: "1 1 280px", minWidth: "220px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
          >
            <option value="">{ui.allRoles}</option>
            <option value="admin">{roleLabels.admin}</option>
            <option value="user">{roleLabels.user}</option>
          </select>
          <button
            onClick={async () => {
              setSearch("");
              setRoleFilter("");
              if (page === 1) await load(1, { search: "", roleFilter: "" });
              else setPage(1);
            }}
            style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", fontWeight: 700, color: "#0f172a" }}
          >
            {ui.reset}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>
        ) : users.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>{ui.empty}</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>{ui.id}</th>
                  <th style={{ textAlign: "left" }}>{ui.name}</th>
                  <th style={{ textAlign: "left" }}>{ui.email}</th>
                  <th style={{ textAlign: "left" }}>{ui.role}</th>
                  <th style={{ textAlign: "left" }}>{ui.phone}</th>
                  <th style={{ textAlign: "left" }}>{ui.address}</th>
                  <th style={{ textAlign: "left" }}>{ui.changeRole}</th>
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
                        <span style={{ padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", ...roleStyle }}>
                          {roleLabels[role] || role}
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
                            {roleLabels.user}
                          </button>
                          <button
                            style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0284c7", color: "#fff", fontWeight: 700 }}
                            onClick={() => changeRole(u.id, "admin")}
                            disabled={role === "admin"}
                          >
                            {roleLabels.admin}
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
              {ui.total}: {pagination.total} {ui.users} | {ui.page} {pagination.current_page} / {pagination.last_page}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: hasPrev ? "#fff" : "#f1f5f9", color: "#0f172a", fontWeight: 700, cursor: hasPrev ? "pointer" : "not-allowed" }}
              >
                {ui.previous}
              </button>
              <button
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={!hasNext}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #0f172a", background: hasNext ? "#0f172a" : "#cbd5e1", color: "#fff", fontWeight: 700, cursor: hasNext ? "pointer" : "not-allowed" }}
              >
                {ui.next}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
