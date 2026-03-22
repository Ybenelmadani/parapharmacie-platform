import { useCallback, useEffect, useRef, useState } from "react";
import { http } from "../../api/http";
import { useI18n } from "../../context/I18nContext";

export default function Categories() {
  const { pick, dir } = useI18n();
  const isRtl = dir === "rtl";
  const ui = pick({
    fr: {
      title: "Categories",
      loadError: "Impossible de charger les categories.",
      createSuccess: "Categorie creee avec succes.",
      createError: "Impossible de creer la categorie.",
      updateSuccess: "Categorie mise a jour avec succes.",
      updateError: "Impossible de mettre a jour la categorie.",
      deleteSuccess: "Categorie supprimee avec succes.",
      deleteError: "Impossible de supprimer la categorie.",
      namePlaceholder: "Nom de la categorie",
      descriptionPlaceholder: "Description (optionnelle)",
      noParent: "Aucun parent",
      add: "Ajouter la categorie",
      searchPlaceholder: "Rechercher une categorie par nom",
      reset: "Reinitialiser",
      loading: "Chargement des categories...",
      empty: "Aucune categorie trouvee.",
      id: "ID",
      name: "Nom",
      description: "Description",
      parent: "Parent",
      actions: "Actions",
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
      title: "Categories",
      loadError: "Failed to load categories.",
      createSuccess: "Category created successfully.",
      createError: "Failed to create category.",
      updateSuccess: "Category updated successfully.",
      updateError: "Failed to update category.",
      deleteSuccess: "Category deleted successfully.",
      deleteError: "Failed to delete category.",
      namePlaceholder: "Category name",
      descriptionPlaceholder: "Description (optional)",
      noParent: "No parent",
      add: "Add Category",
      searchPlaceholder: "Search category by name",
      reset: "Reset",
      loading: "Loading categories...",
      empty: "No categories found.",
      id: "ID",
      name: "Name",
      description: "Description",
      parent: "Parent",
      actions: "Actions",
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
      title: "الفئات",
      loadError: "تعذر تحميل الفئات.",
      createSuccess: "تم إنشاء الفئة بنجاح.",
      createError: "تعذر إنشاء الفئة.",
      updateSuccess: "تم تحديث الفئة بنجاح.",
      updateError: "تعذر تحديث الفئة.",
      deleteSuccess: "تم حذف الفئة بنجاح.",
      deleteError: "تعذر حذف الفئة.",
      namePlaceholder: "اسم الفئة",
      descriptionPlaceholder: "الوصف (اختياري)",
      noParent: "بدون أصل",
      add: "إضافة الفئة",
      searchPlaceholder: "ابحث عن فئة بالاسم",
      reset: "إعادة التعيين",
      loading: "جار تحميل الفئات...",
      empty: "لم يتم العثور على فئات.",
      id: "المعرف",
      name: "الاسم",
      description: "الوصف",
      parent: "الأصل",
      actions: "الإجراءات",
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

  const [categories, setCategories] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editParentId, setEditParentId] = useState("");

  const [search, setSearch] = useState("");
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

  const loadCategories = useCallback(
    async (targetPage = 1, overrides = {}) => {
      const query = typeof overrides.search === "string" ? overrides.search : searchRef.current;

      setLoading(true);
      setError("");

      try {
        const res = await http.get("/admin/categories", {
          params: {
            page: targetPage,
            per_page: pagination.per_page,
            q: query.trim() || undefined,
          },
        });

        const payload = res?.data ?? {};
        setCategories(Array.isArray(payload.data) ? payload.data : []);
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

  const loadParentOptions = useCallback(async () => {
    try {
      const res = await http.get("/admin/categories", {
        params: {
          page: 1,
          per_page: 100,
        },
      });
      const payload = res?.data ?? {};
      setParentOptions(Array.isArray(payload.data) ? payload.data : []);
    } catch {
      // Keep silent to avoid blocking page use.
    }
  }, []);

  useEffect(() => {
    loadCategories(page);
  }, [loadCategories, page]);

  useEffect(() => {
    loadParentOptions();
  }, [loadParentOptions]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) {
        loadCategories(1);
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [loadCategories, page, search]);

  const createCategory = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.post("/admin/categories", {
        name: cleanName,
        description: description.trim() || null,
        parent_id: parentId ? Number(parentId) : null,
      });

      setName("");
      setDescription("");
      setParentId("");
      setSuccess(ui.createSuccess);

      await loadCategories(page === 1 ? 1 : page);
      await loadParentOptions();
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.createError);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name || "");
    setEditDescription(cat.description || "");
    setEditParentId(cat.parent_id ? String(cat.parent_id) : "");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditParentId("");
  };

  const saveEdit = async (id) => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    setError("");
    setSuccess("");

    try {
      await http.put(`/admin/categories/${id}`, {
        name: cleanName,
        description: editDescription.trim() || null,
        parent_id: editParentId ? Number(editParentId) : null,
      });

      setSuccess(ui.updateSuccess);
      cancelEdit();
      await loadCategories(page);
      await loadParentOptions();
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.updateError);
    }
  };

  const deleteCategory = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/categories/${id}`);
      setSuccess(ui.deleteSuccess);

      if (categories.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadCategories(page);
      }
      await loadParentOptions();
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
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>{error}</div>
      ) : null}

      {success ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#dcfce7", color: "#166534", marginBottom: "12px" }}>{success}</div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px", gridTemplateColumns: "2fr 2fr 1.2fr auto" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ui.namePlaceholder}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={ui.descriptionPlaceholder}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
          >
            <option value="">{ui.noParent}</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={createCategory}
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
              if (page === 1) await loadCategories(1, { search: "" });
              else setPage(1);
            }}
            style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
          >
            {ui.reset}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>{ui.empty}</div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "18px", border: "1px solid #dbe4ee", background: "#fff" }}>
            <table style={tableStyle}>
              <colgroup>
                <col style={{ width: "90px" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "24%" }} />
                <col />
                <col style={{ width: "190px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={headCellStyle}>{ui.id}</th>
                  <th style={headCellStyle}>{ui.name}</th>
                  <th style={headCellStyle}>{ui.description}</th>
                  <th style={headCellStyle}>{ui.parent}</th>
                  <th style={{ ...headCellStyle, width: "190px" }}>{ui.actions}</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  return (
                    <tr key={cat.id}>
                      <td style={bodyCellStyle}>{cat.id}</td>

                      <td style={bodyCellStyle}>
                        {isEditing ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                          />
                        ) : (
                          cat.name
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
                          cat.description || "-"
                        )}
                      </td>

                      <td style={bodyCellStyle}>
                        {isEditing ? (
                          <select
                            value={editParentId}
                            onChange={(e) => setEditParentId(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff" }}
                          >
                            <option value="">{ui.noParent}</option>
                            {parentOptions
                              .filter((c) => c.id !== cat.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          cat.parent?.name || "-"
                        )}
                      </td>

                      <td style={actionCellStyle}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "8px", justifyContent: isRtl ? "flex-end" : "flex-start", flexWrap: "wrap" }}>
                            <button
                              onClick={() => saveEdit(cat.id)}
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
                              onClick={() => startEdit(cat)}
                              style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700 }}
                            >
                              {ui.edit}
                            </button>
                            <button
                              onClick={() => deleteCategory(cat.id)}
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
