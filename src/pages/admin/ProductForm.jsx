import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { http } from "../../api/http";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");

  const loadMeta = async () => {
    const [catRes, brandRes] = await Promise.all([
      http.get("/admin/categories", { params: { page: 1, per_page: 200 } }),
      http.get("/admin/brands", { params: { page: 1, per_page: 200 } }),
    ]);

    const catRows = Array.isArray(catRes?.data?.data) ? catRes.data.data : [];
    const brandRows = Array.isArray(brandRes?.data?.data) ? brandRes.data.data : [];

    setCategories(catRows);
    setBrands(brandRows);

    return { catRows, brandRows };
  };

  const loadForEdit = async () => {
    const res = await http.get(`/admin/products/${id}`);
    const p = res?.data || {};
    const primaryVariant = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants[0] : null;

    setName(p.name || "");
    setStatus(Boolean(p.status));
    setCategoryId(p.category_id ? String(p.category_id) : "");
    setBrandId(p.brand_id ? String(p.brand_id) : "");
    setSku(primaryVariant?.sku || "");
    setBarcode(primaryVariant?.barcode || "");
    setPrice(primaryVariant?.price != null ? String(primaryVariant.price) : "0");
    setStock(primaryVariant?.stock != null ? String(primaryVariant.stock) : "0");
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const { catRows, brandRows } = await loadMeta();

        if (isEdit) {
          await loadForEdit();
        } else {
          if (mounted) {
            if (catRows[0]?.id) setCategoryId(String(catRows[0].id));
            if (brandRows[0]?.id) setBrandId(String(brandRows[0].id));
          }
        }
      } catch (e) {
        const apiMsg = e?.response?.data?.message;
        setError(apiMsg || "Failed to load form data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const save = async () => {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!categoryId || !brandId) {
      setError("Category and brand are required.");
      return;
    }
    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }
    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      setError("Price must be a valid number >= 0.");
      return;
    }
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setError("Stock must be an integer >= 0.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      status,
      category_id: Number(categoryId),
      brand_id: Number(brandId),
      sku: sku.trim(),
      barcode: barcode.trim() || null,
      price: Number(price),
      stock: Number(stock),
    };

    try {
      if (isEdit) {
        await http.put(`/admin/products/${id}`, payload);
      } else {
        await http.post("/admin/products", payload);
      }
      navigate("/admin/products");
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: "#64748b", fontWeight: 600 }}>Loading form...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
          {isEdit ? "Edit Product" : "New Product"}
        </h2>
        <Link to="/admin/products" style={{ color: "#0369a1", textDecoration: "none", fontWeight: 700 }}>
          Back to products
        </Link>
      </div>

      {error ? (
        <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", marginBottom: "12px" }}>
          {error}
        </div>
      ) : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Product name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
            >
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Status</label>
            <select
              value={status ? "1" : "0"}
              onChange={(e) => setStatus(e.target.value === "1")}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>SKU</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="PAINT-EXAMPLE-001"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Barcode (optional)</label>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Barcode"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Price</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Stock</label>
            <input
              type="number"
              min={0}
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Link to="/admin/products" style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>
            Cancel
          </Link>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding: "10px 16px", border: 0, borderRadius: "10px", background: saving ? "#94a3b8" : "#0369a1", color: "#fff", fontWeight: 700 }}
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </div>
  );
}
