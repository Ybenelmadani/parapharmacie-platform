import { useCallback, useEffect, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";
import { useI18n } from "../../context/I18nContext";

export default function Reviews() {
  const { pick, resolveValue } = useI18n();
  const ui = pick({
    fr: {
      title: "Avis",
      loadError: "Impossible de charger les avis.",
      confirmDelete: "Supprimer cet avis ?",
      deleteSuccess: "Avis supprime avec succes.",
      deleteError: "Impossible de supprimer l'avis.",
      loading: "Chargement des avis...",
      id: "ID",
      user: "Utilisateur",
      product: "Produit",
      rating: "Note",
      comment: "Commentaire",
      action: "Action",
      delete: "Supprimer",
    },
    en: {
      title: "Reviews",
      loadError: "Failed to load reviews.",
      confirmDelete: "Delete this review?",
      deleteSuccess: "Review deleted successfully.",
      deleteError: "Failed to delete review.",
      loading: "Loading reviews...",
      id: "ID",
      user: "User",
      product: "Product",
      rating: "Rating",
      comment: "Comment",
      action: "Action",
      delete: "Delete",
    },
    ar: {
      title: "المراجعات",
      loadError: "تعذر تحميل المراجعات.",
      confirmDelete: "حذف هذه المراجعة؟",
      deleteSuccess: "تم حذف المراجعة بنجاح.",
      deleteError: "تعذر حذف المراجعة.",
      loading: "جار تحميل المراجعات...",
      id: "المعرف",
      user: "المستخدم",
      product: "المنتج",
      rating: "التقييم",
      comment: "التعليق",
      action: "الإجراء",
      delete: "حذف",
    },
  });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await http.get("/admin/reviews");
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError(ui.loadError);
    } finally {
      setLoading(false);
    }
  }, [ui.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    if (!window.confirm(ui.confirmDelete)) return;
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/reviews/${id}`);
      setSuccess(ui.deleteSuccess);
      await load();
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.deleteError);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1500px", margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 14 }}>{ui.title}</h2>
      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>{ui.id}</th>
                  <th style={{ textAlign: "left" }}>{ui.user}</th>
                  <th style={{ textAlign: "left" }}>{ui.product}</th>
                  <th style={{ textAlign: "left" }}>{ui.rating}</th>
                  <th style={{ textAlign: "left" }}>{ui.comment}</th>
                  <th style={{ textAlign: "left" }}>{ui.action}</th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td>{r.id}</td>
                    <td>
                      {r.user?.name || "-"} <br />
                      <small>{r.user?.email || ""}</small>
                    </td>
                    <td>{resolveValue(r.product?.name) || "-"}</td>
                    <td>
                      <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#e2e8f0", fontWeight: 700, fontSize: "12px" }}>{r.rating}</span>
                    </td>
                    <td style={{ maxWidth: 420 }}>{resolveValue(r.comment) || r.comment}</td>
                    <td>
                      <button style={{ padding: "6px 12px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }} onClick={() => remove(r.id)}>
                        {ui.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
