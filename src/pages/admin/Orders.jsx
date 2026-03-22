import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";
import { useI18n } from "../../context/I18nContext";
import { formatMoney } from "../../utils/currency";

const STATUS_STYLE = {
  pending: { background: "#fef3c7", color: "#92400e" },
  paid: { background: "#dcfce7", color: "#166534" },
  shipped: { background: "#dbeafe", color: "#1e3a8a" },
  cancelled: { background: "#fee2e2", color: "#991b1b" },
  default: { background: "#e2e8f0", color: "#334155" },
};

export default function Orders() {
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      title: "Commandes",
      loadError: "Impossible de charger les commandes.",
      updateSuccess: "Statut de la commande mis a jour.",
      updateError: "Impossible de mettre a jour le statut de la commande.",
      searchPlaceholder: "Rechercher par ID, client, email ou telephone",
      allStatus: "Tous les statuts",
      pending: "En attente",
      paid: "Payee",
      shipped: "Expediee",
      cancelled: "Annulee",
      reset: "Reinitialiser",
      loading: "Chargement des commandes...",
      empty: "Aucune commande trouvee.",
      id: "ID",
      user: "Client",
      email: "Email",
      phone: "Telephone",
      address: "Adresse",
      status: "Statut",
      change: "Modifier",
      totalLabel: "Total",
      guest: "Invite",
      totalOrders: "commandes",
      page: "Page",
      previous: "Precedent",
      next: "Suivant",
    },
    en: {
      title: "Orders",
      loadError: "Failed to load orders.",
      updateSuccess: "Order status updated.",
      updateError: "Failed to update order status.",
      searchPlaceholder: "Search order ID, customer, email, phone",
      allStatus: "All status",
      pending: "Pending",
      paid: "Paid",
      shipped: "Shipped",
      cancelled: "Cancelled",
      reset: "Reset",
      loading: "Loading orders...",
      empty: "No orders found.",
      id: "ID",
      user: "User",
      email: "Email",
      phone: "Phone",
      address: "Address",
      status: "Status",
      change: "Change",
      totalLabel: "Total",
      guest: "Guest",
      totalOrders: "orders",
      page: "Page",
      previous: "Previous",
      next: "Next",
    },
    ar: {
      title: "الطلبات",
      loadError: "تعذر تحميل الطلبات.",
      updateSuccess: "تم تحديث حالة الطلب.",
      updateError: "تعذر تحديث حالة الطلب.",
      searchPlaceholder: "ابحث برقم الطلب أو العميل أو البريد أو الهاتف",
      allStatus: "كل الحالات",
      pending: "قيد الانتظار",
      paid: "مدفوعة",
      shipped: "تم الشحن",
      cancelled: "ملغاة",
      reset: "إعادة التعيين",
      loading: "جار تحميل الطلبات...",
      empty: "لم يتم العثور على طلبات.",
      id: "المعرف",
      user: "العميل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      status: "الحالة",
      change: "تغيير",
      totalLabel: "الإجمالي",
      guest: "زائر",
      totalOrders: "طلبات",
      page: "الصفحة",
      previous: "السابق",
      next: "التالي",
    },
  });

  const statusLabels = useMemo(
    () => ({
      pending: ui.pending,
      paid: ui.paid,
      shipped: ui.shipped,
      cancelled: ui.cancelled,
    }),
    [ui.cancelled, ui.paid, ui.pending, ui.shipped]
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });
  const searchRef = useRef(search);
  const statusFilterRef = useRef(statusFilter);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  const loadOrders = useCallback(
    async (targetPage = 1, overrides = {}) => {
      const query = typeof overrides.search === "string" ? overrides.search : searchRef.current;
      const status = typeof overrides.statusFilter === "string" ? overrides.statusFilter : statusFilterRef.current;

      setLoading(true);
      setError("");

      try {
        const res = await http.get("/admin/orders", {
          params: {
            page: targetPage,
            per_page: pagination.per_page,
            q: query.trim() || undefined,
            status: status || undefined,
          },
        });

        const payload = res?.data ?? {};
        setOrders(Array.isArray(payload.data) ? payload.data : []);
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
    loadOrders(page);
  }, [loadOrders, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) loadOrders(1);
      else setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [loadOrders, page, search, statusFilter]);

  const changeStatus = async (id, status) => {
    setError("");
    setSuccess("");

    try {
      await http.patch(`/admin/orders/${id}/status`, { status });
      setSuccess(ui.updateSuccess);
      await loadOrders(page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.updateError);
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
        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ui.searchPlaceholder}
            style={{ flex: "1 1 280px", minWidth: "220px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
          >
            <option value="">{ui.allStatus}</option>
            <option value="pending">{statusLabels.pending}</option>
            <option value="paid">{statusLabels.paid}</option>
            <option value="shipped">{statusLabels.shipped}</option>
            <option value="cancelled">{statusLabels.cancelled}</option>
          </select>
          <button
            onClick={async () => {
              setSearch("");
              setStatusFilter("");
              if (page === 1) await loadOrders(1, { search: "", statusFilter: "" });
              else setPage(1);
            }}
            style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", fontWeight: 700, color: "#0f172a" }}
          >
            {ui.reset}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>{ui.empty}</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>{ui.id}</th>
                  <th style={{ textAlign: "left" }}>{ui.user}</th>
                  <th style={{ textAlign: "left", width: "170px" }}>{ui.email}</th>
                  <th style={{ textAlign: "left" }}>{ui.phone}</th>
                  <th style={{ textAlign: "left" }}>{ui.address}</th>
                  <th style={{ textAlign: "left" }}>{ui.status}</th>
                  <th style={{ textAlign: "left" }}>{ui.change}</th>
                  <th style={{ textAlign: "right" }}>{ui.totalLabel}</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => {
                  const currentStatus = String(o.status || "pending").toLowerCase();
                  const statusStyle = STATUS_STYLE[currentStatus] || STATUS_STYLE.default;

                  return (
                    <tr key={o.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>{o.id}</td>
                      <td>{o.customer_name ?? o.user?.name ?? o.user_id ?? ui.guest}</td>
                      <td style={{ maxWidth: "170px", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: "1.25" }}>
                        {o.customer_email ?? o.user?.email ?? "-"}
                      </td>
                      <td>{o.customer_phone ?? o.user?.phone ?? "-"}</td>
                      <td>{o.shipping_address ?? o.user?.address ?? "-"}</td>
                      <td>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 800, fontSize: "12px", ...statusStyle }}>
                          {statusLabels[currentStatus] || currentStatus}
                        </span>
                      </td>
                      <td>
                        <select
                          value={currentStatus}
                          onChange={(e) => changeStatus(o.id, e.target.value)}
                          style={{ padding: "8px 12px", borderRadius: "999px", border: "1px solid #cbd5e1", fontWeight: 700, outline: "none", ...statusStyle }}
                        >
                          <option value="pending">{statusLabels.pending}</option>
                          <option value="paid">{statusLabels.paid}</option>
                          <option value="shipped">{statusLabels.shipped}</option>
                          <option value="cancelled">{statusLabels.cancelled}</option>
                        </select>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 800, fontSize: "12px", background: "#e2e8f0", color: "#0f172a" }}>
                          {formatMoney(o.total)}
                        </span>
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
              {ui.totalLabel}: {pagination.total} {ui.totalOrders} | {ui.page} {pagination.current_page} / {pagination.last_page}
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
