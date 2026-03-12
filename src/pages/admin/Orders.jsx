import { useEffect, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";

const STATUS_STYLE = {
  pending: { background: "#fef3c7", color: "#92400e" },
  paid: { background: "#dcfce7", color: "#166534" },
  shipped: { background: "#dbeafe", color: "#1e3a8a" },
  cancelled: { background: "#fee2e2", color: "#991b1b" },
  default: { background: "#e2e8f0", color: "#334155" },
};

export default function Orders() {
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

  const loadOrders = async (targetPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/orders", {
        params: {
          page: targetPage,
          per_page: pagination.per_page,
          q: search.trim() || undefined,
          status: statusFilter || undefined,
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
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) loadOrders(1);
      else setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const changeStatus = async (id, status) => {
    setError("");
    setSuccess("");

    try {
      await http.patch(`/admin/orders/${id}/status`, { status });
      setSuccess("Order status updated.");
      await loadOrders(page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || "Failed to update order status.");
    }
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 14 }}>Orders</h2>

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer, email, phone"
            style={{ flex: "1 1 280px", minWidth: "220px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
          >
            <option value="">All status</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="shipped">shipped</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button
            onClick={async () => {
              setSearch("");
              setStatusFilter("");
              if (page === 1) await loadOrders(1);
              else setPage(1);
            }}
            style={{ padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", fontWeight: 700, color: "#0f172a" }}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>No orders found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>User</th>
                  <th style={{ textAlign: "left", width: "170px" }}>Email</th>
                  <th style={{ textAlign: "left" }}>Phone</th>
                  <th style={{ textAlign: "left" }}>Address</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Change</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => {
                  const currentStatus = String(o.status || "pending").toLowerCase();
                  const statusStyle = STATUS_STYLE[currentStatus] || STATUS_STYLE.default;

                  return (
                    <tr key={o.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>{o.id}</td>
                      <td>{o.customer_name ?? o.user?.name ?? o.user_id ?? "Guest"}</td>
                      <td style={{ maxWidth: "170px", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: "1.25" }}>
                        {o.customer_email ?? o.user?.email ?? "-"}
                      </td>
                      <td>{o.customer_phone ?? o.user?.phone ?? "-"}</td>
                      <td>{o.shipping_address ?? o.user?.address ?? "-"}</td>
                      <td>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 800, fontSize: "12px", textTransform: "capitalize", ...statusStyle }}>
                          {currentStatus}
                        </span>
                      </td>
                      <td>
                        <select
                          value={currentStatus}
                          onChange={(e) => changeStatus(o.id, e.target.value)}
                          style={{ padding: "8px 12px", borderRadius: "999px", border: "1px solid #cbd5e1", fontWeight: 700, textTransform: "capitalize", outline: "none", ...statusStyle }}
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="shipped">shipped</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 800, fontSize: "12px", background: "#e2e8f0", color: "#0f172a" }}>
                          {o.total} USD
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
              Total: {pagination.total} orders | Page {pagination.current_page} / {pagination.last_page}
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
