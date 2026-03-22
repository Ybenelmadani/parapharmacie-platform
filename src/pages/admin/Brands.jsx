import { useCallback, useEffect, useRef, useState } from "react";
import { http } from "../../api/http";
import { useI18n } from "../../context/I18nContext";

export default function Brands() {
  const { pick, dir } = useI18n();
  const isRtl = dir === "rtl";
  const ui = pick({
    fr: {
      title: "Marques",
      loadError: "Impossible de charger les marques.",
      createSuccess: "Marque creee avec succes.",
      createError: "Impossible de creer la marque.",
      updateSuccess: "Marque mise a jour avec succes.",
      updateError: "Impossible de mettre a jour la marque.",
      deleteSuccess: "Marque supprimee avec succes.",
      deleteError: "Impossible de supprimer la marque.",
      namePlaceholder: "Nom de la marque",
      descriptionPlaceholder: "Description (optionnelle)",
      add: "Ajouter la marque",
      searchPlaceholder: "Rechercher une marque par nom",
      reset: "Reinitialiser",
      loading: "Chargement des marques...",
      empty: "Aucune marque trouvee.",
      id: "ID",
      name: "Nom",
      description: "Description",
      action: "Action",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      total: "Total",
      page: "Page",
      previous: "Precedent",
      next: "Suivant",
    },
    en: {
      title: "Brands",
      loadError: "Failed to load brands.",
      createSuccess: "Brand created successfully.",
      createError: "Failed to create brand.",
      updateSuccess: "Brand updated successfully.",
      updateError: "Failed to update brand.",
      deleteSuccess: "Brand deleted successfully.",
      deleteError: "Failed to delete brand.",
      namePlaceholder: "Brand name",
      descriptionPlaceholder: "Description (optional)",
      add: "Add Brand",
      searchPlaceholder: "Search brand by name",
      reset: "Reset",
      loading: "Loading brands...",
      empty: "No brands found.",
      id: "ID",
      name: "Name",
      description: "Description",
      action: "Action",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      total: "Total",
      page: "Page",
      previous: "Previous",
      next: "Next",
    },
    ar: {
      title: "العلامات",
      loadError: "تعذر تحميل العلامات.",
      createSuccess: "تم إنشاء العلامة بنجاح.",
      createError: "تعذر إنشاء العلامة.",
      updateSuccess: "تم تحديث العلامة بنجاح.",
      updateError: "تعذر تحديث العلامة.",
      deleteSuccess: "تم حذف العلامة بنجاح.",
      deleteError: "تعذر حذف العلامة.",
      namePlaceholder: "اسم العلامة",
      descriptionPlaceholder: "الوصف (اختياري)",
      add: "إضافة العلامة",
      searchPlaceholder: "ابحث عن علامة بالاسم",
      reset: "إعادة التعيين",
      loading: "جار تحميل العلامات...",
      empty: "لم يتم العثور على علامات.",
      id: "المعرف",
      name: "الاسم",
      description: "الوصف",
      action: "الإجراء",
      save: "حفظ",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      total: "الإجمالي",
      page: "الصفحة",
      previous: "السابق",
      next: "التالي",
    },
  });

  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });
  const searchRef = useRef(search);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const loadBrands = useCallback(
    async (targetPage = 1, overrides = {}) => {
      const query = typeof overrides.search === "string" ? overrides.search : searchRef.current;

      setLoading(true);
      setError("");

      try {
        const res = await http.get("/admin/brands", {
          params: {
            page: targetPage,
            per_page: pagination.per_page,
            q: query.trim() || undefined,
          },
        });

        const payload = res?.data ?? {};
        setBrands(Array.isArray(payload.data) ? payload.data : []);
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
    loadBrands(page);
  }, [loadBrands, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) {
        loadBrands(1);
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [loadBrands, page, search]);

  const createBrand = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.post("/admin/brands", {
        name: cleanName,
        description: description.trim() || null,
      });

      setName("");
      setDescription("");
      setSuccess(ui.createSuccess);

      await loadBrands(page === 1 ? 1 : page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.createError);
    }
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditName(brand.name || "");
    setEditDescription(brand.description || "");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const saveEdit = async (id) => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.put(`/admin/brands/${id}`, {
        name: cleanName,
        description: editDescription.trim() || null,
      });

      setSuccess(ui.updateSuccess);
      cancelEdit();
      await loadBrands(page);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.updateError);
    }
  };

  const deleteBrand = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/brands/${id}`);
      setSuccess(ui.deleteSuccess);

      if (brands.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadBrands(page);
      }
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.deleteError);
    }
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;
  const textAlign = isRtl ? "right" : "left";
  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    tableLayout: "fixed",
  };
  const headCellStyle = {
    padding: "16px 18px",
    background: "#f8fbff",
    borderBottom: "1px solid #dbe4ee",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 800,
    textAlign,
    verticalAlign: "middle",
  };
  const bodyCellStyle = {
    padding: "16px 18px",
    borderBottom: "1px solid #e2e8f0",
    color: "#0f172a",
    fontSize: "15px",
    textAlign,
    verticalAlign: "middle",
    background: "rgba(255,255,255,0.92)",
    overflowWrap: "anywhere",
  };
  const actionCellStyle = {
    ...bodyCellStyle,
    width: "190px",
  };

  return (
    <div style={{ width: "100%", maxWidth: "1500px", margin: "0 auto", direction: dir }}>
      <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", marginBottom: "14px" }}>{ui.title}</h2>

      {error ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#dcfce7", color: "#166534", marginBottom: "12px" }}>
          {success}
        </div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px", gridTemplateColumns: "2fr 2fr auto" }}>
          <input
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ui.namePlaceholder}
          />

          <input
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={ui.descriptionPlaceholder}
          />

          <button
            onClick={createBrand}
            style={{ padding: "10px 16px", border: 0, borderRadius: "10px", background: "#0369a1", color: "#fff", fontWeight: 700 }}
          >
            {ui.add}
          </button>
        </div>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ui.searchPlaceholder}
            style={{ width: "320px", maxWidth: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <button
            onClick={async () => {
              setSearch("");
              if (page === 1) await loadBrands(1, { search: "" });
              else setPage(1);
            }}
            style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
          >
            {ui.reset}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>
        ) : brands.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>{ui.empty}</div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "18px", border: "1px solid #dbe4ee", background: "#fff" }}>
            <table style={tableStyle}>
              <colgroup>
                <col style={{ width: "90px" }} />
                <col style={{ width: "28%" }} />
                <col />
                <col style={{ width: "190px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={headCellStyle}>{ui.id}</th>
                  <th style={headCellStyle}>{ui.name}</th>
                  <th style={headCellStyle}>{ui.description}</th>
                  <th style={{ ...headCellStyle, width: "190px" }}>{ui.action}</th>
                </tr>
              </thead>

              <tbody>
                {brands.map((b) => {
                  const isEditing = editingId === b.id;

                  return (
                    <tr key={b.id}>
                      <td style={bodyCellStyle}>{b.id}</td>
                      <td style={bodyCellStyle}>
                        {isEditing ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                          />
                        ) : (
                          b.name
                        )}
                      </td>
                      <td style={bodyCellStyle}>
                        {isEditing ? (
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                          />
                        ) : (
                          b.description || "-"
                        )}
                      </td>
                      <td style={actionCellStyle}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "8px", justifyContent: isRtl ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
                            <button
                              onClick={() => saveEdit(b.id)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0369a1", color: "#fff", fontWeight: 700 }}
                            >
                              {ui.save}
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
                            >
                              {ui.cancel}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", justifyContent: isRtl ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
                            <button
                              onClick={() => startEdit(b)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700 }}
                            >
                              {ui.edit}
                            </button>
                            <button
                              onClick={() => deleteBrand(b.id)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }}
                            >
                              {ui.delete}
                            </button>
                          </div>
                        )}
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
              {ui.total}: {pagination.total} {ui.title.toLowerCase()} | {ui.page} {pagination.current_page} / {pagination.last_page}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: hasPrev ? "#fff" : "#f1f5f9",
                  color: "#0f172a",
                  fontWeight: 700,
                  cursor: hasPrev ? "pointer" : "not-allowed",
                }}
              >
                {ui.previous}
              </button>
              <button
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={!hasNext}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #0f172a",
                  background: hasNext ? "#0f172a" : "#cbd5e1",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: hasNext ? "pointer" : "not-allowed",
                }}
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
