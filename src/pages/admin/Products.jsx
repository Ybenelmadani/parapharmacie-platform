import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";

const STATUS_STYLE = {
  active: { background: "#dcfce7", color: "#166534" },
  inactive: { background: "#fee2e2", color: "#991b1b" },
};
const STOCK_STYLE = {
  out: { background: "#fee2e2", color: "#991b1b", label: "Out of stock" },
  low: { background: "#fef3c7", color: "#92400e", label: "Low stock" },
  in_stock: { background: "#dcfce7", color: "#166534", label: "In stock" },
};

function getMainImage(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  if (!images.length) return "";
  const main = images.find((img) => img?.is_main);
  return (main || images[0])?.image_path || "";
}

function getTotalStock(product) {
  if (product?.variants_sum_stock != null && product?.variants_sum_stock !== "") {
    return Number(product.variants_sum_stock) || 0;
  }
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0);
}

function getStockMeta(totalStock) {
  if (totalStock <= 0) return { key: "out", label: STOCK_STYLE.out.label, style: { background: STOCK_STYLE.out.background, color: STOCK_STYLE.out.color } };
  if (totalStock <= 5) return { key: "low", label: STOCK_STYLE.low.label, style: { background: STOCK_STYLE.low.background, color: STOCK_STYLE.low.color } };
  return { key: "in_stock", label: STOCK_STYLE.in_stock.label, style: { background: STOCK_STYLE.in_stock.background, color: STOCK_STYLE.in_stock.color } };
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [stockState, setStockState] = useState("");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [importing, setImporting] = useState(false);
  const [importLimit, setImportLimit] = useState(20);
  const [importSource, setImportSource] = useState("auto");
  const [importOnlyNew, setImportOnlyNew] = useState(true);
  const [importUploadFile, setImportUploadFile] = useState(null);
  const [importFilePath, setImportFilePath] = useState("");

  const [importHistory, setImportHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("admin_product_import_history");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });
  const [lastImportPayload, setLastImportPayload] = useState(null);
  const [importErrors, setImportErrors] = useState([]);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 25,
  });
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const barcodeDetectorSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  const persistHistory = (next) => {
    setImportHistory(next);
    localStorage.setItem("admin_product_import_history", JSON.stringify(next));
  };

  const pushImportHistory = (entry) => {
    const next = [entry, ...importHistory].slice(0, 8);
    persistHistory(next);
  };

  const stopScanner = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  const loadProducts = async (targetPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/products", {
        params: {
          page: targetPage,
          per_page: pagination.per_page,
          q: search.trim() || undefined,
          barcode: barcodeQuery.trim() || undefined,
          sort_by: sortBy,
          sort_dir: sortDir,
          stock_state: stockState || undefined,
        },
      });
      const payload = res?.data ?? {};
      setProducts(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: Number(payload.current_page) || targetPage,
        last_page: Number(payload.last_page) || 1,
        total: Number(payload.total) || 0,
        per_page: Number(payload.per_page) || pagination.per_page,
      });
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(page);
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) loadProducts(1);
      else setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search, barcodeQuery, sortBy, sortDir, stockState]);

  useEffect(() => {
    if (!scannerOpen) {
      stopScanner();
      return;
    }

    let cancelled = false;

    const runScanner = async () => {
      setScanError("");
      setSuccess("");

      if (!barcodeDetectorSupported) {
        setScanError("Scanner not supported in this browser. Use barcode input.");
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        setScanError("Camera is not available in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setScanning(true);

        let detector = null;
        try {
          detector = new window.BarcodeDetector({
            formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "itf", "qr_code"],
          });
        } catch {
          detector = new window.BarcodeDetector();
        }

        const scanFrame = async () => {
          if (cancelled || !scannerOpen || !detector) return;

          try {
            const video = videoRef.current;
            if (video && video.readyState >= 2) {
              const codes = await detector.detect(video);
              const rawValue = String(codes?.[0]?.rawValue || "").trim();

              if (rawValue) {
                setSearch("");
                setBarcodeQuery(rawValue);
                setScannerOpen(false);
                setSuccess(`Barcode detected: ${rawValue}`);
                return;
              }
            }
          } catch {
            // ignore one-frame detector errors and continue scanning
          }

          rafRef.current = requestAnimationFrame(scanFrame);
        };

        rafRef.current = requestAnimationFrame(scanFrame);
      } catch {
        setScanError("Unable to access camera. Allow permission and retry.");
      }
    };

    runScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [barcodeDetectorSupported, scannerOpen, stopScanner]);

  useEffect(() => {
    return () => stopScanner();
  }, [stopScanner]);

  const deleteProduct = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/products/${id}`);
      setSuccess("Product deleted successfully.");

      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadProducts(page);
      }
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || "Failed to delete product.");
    }
  };

  const runImport = async (overridePayload = null) => {
    const payloadBase = overridePayload || {
      limit: Number(importLimit) || 20,
      source: importSource,
      only_new: importOnlyNew,
      file_path: importSource === "file" ? importFilePath.trim() : undefined,
    };

    if (payloadBase.source === "upload" && !importUploadFile) {
      setError("Please choose an Excel/CSV file.");
      return;
    }

    if (payloadBase.source === "file" && !String(payloadBase.file_path || "").trim()) {
      setError("Please enter a JSON file path.");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");
    setImportErrors([]);

    try {
      let res;
      if (payloadBase.source === "upload") {
        const form = new FormData();
        form.append("limit", String(payloadBase.limit));
        form.append("source", payloadBase.source);
        form.append("only_new", payloadBase.only_new ? "1" : "0");
        form.append("import_file", importUploadFile);
        res = await http.post("/admin/products/import-painting", form);
      } else {
        res = await http.post("/admin/products/import-painting", payloadBase);
      }

      const stats = res?.data?.stats || {};
      const message = `Import done. Created: ${stats.created ?? 0}, Updated: ${stats.updated ?? 0}, Skipped: ${stats.skipped ?? 0}, Source: ${stats.source_used ?? "-"}`;

      setSuccess(message);
      setLastImportPayload(payloadBase);

      pushImportHistory({
        at: new Date().toISOString(),
        source: payloadBase.source,
        limit: payloadBase.limit,
        only_new: payloadBase.only_new,
        created: Number(stats.created ?? 0),
        updated: Number(stats.updated ?? 0),
        skipped: Number(stats.skipped ?? 0),
      });

      if (payloadBase.source === "upload") setImportUploadFile(null);
      await loadProducts(1);
      setPage(1);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const allErrors = apiErrors ? Object.values(apiErrors).flat().filter(Boolean) : [];

      setImportErrors(allErrors);
      setError(allErrors[0] || apiMsg || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const exportImportErrors = () => {
    const content = JSON.stringify({ generated_at: new Date().toISOString(), errors: importErrors }, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasPrev = pagination.current_page > 1;
  const hasNext = pagination.current_page < pagination.last_page;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "10px", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0 }}>Products</h2>
        <Link to="/admin/products/new" style={{ padding: "10px 16px", borderRadius: "10px", background: "#0369a1", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
          New Product
        </Link>
      </div>

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}
      {scanError ? <AdminAlert type="error">{scanError}</AdminAlert> : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "end" }}>
            <div style={{ flex: "2 1 320px", minWidth: "260px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Import source</label>
              <select
                value={importSource}
                onChange={(e) => setImportSource(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              >
                <option value="auto">Auto (eBay -{">"} Dummy -{">"} Fallback)</option>
                <option value="upload">Excel/CSV upload (recommended)</option>
                <option value="ebay">eBay only</option>
                <option value="dummy">Dummy only</option>
                <option value="fallback">Fallback only</option>
                <option value="file">Local JSON path (advanced)</option>
              </select>
            </div>

            {importSource === "upload" ? (
              <div style={{ flex: "2 1 320px", minWidth: "260px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Excel/CSV file</label>
                <input
                  type="file"
                  accept=".xlsx,.csv,.txt,.json"
                  onChange={(e) => setImportUploadFile(e.target.files?.[0] || null)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
                />
              </div>
            ) : null}

            {importSource === "file" ? (
              <div style={{ flex: "2 1 320px", minWidth: "260px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>File path (JSON)</label>
                <input
                  value={importFilePath}
                  onChange={(e) => setImportFilePath(e.target.value)}
                  placeholder="C:\\path\\products.json"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
                />
              </div>
            ) : null}

            <div style={{ flex: "0 1 150px", minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>Limit</label>
              <input
                type="number"
                min={1}
                max={100}
                value={importLimit}
                onChange={(e) => setImportLimit(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", paddingBottom: "10px" }}>
              <input type="checkbox" checked={importOnlyNew} onChange={(e) => setImportOnlyNew(e.target.checked)} />
              Only new (safe)
            </label>

            <button
              onClick={() => runImport()}
              disabled={importing}
              style={{ marginLeft: "auto", padding: "10px 16px", border: 0, borderRadius: "10px", background: importing ? "#94a3b8" : "#0f172a", color: "#fff", fontWeight: 800 }}
            >
              {importing ? "Importing..." : "Import painting products"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "14px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {lastImportPayload ? (
            <button
              onClick={() => runImport(lastImportPayload)}
              disabled={importing}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #0f172a", background: "#fff", color: "#0f172a", fontWeight: 700 }}
            >
              Retry last import
            </button>
          ) : null}
          {importErrors.length > 0 ? (
            <button
              onClick={exportImportErrors}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontWeight: 700 }}
            >
              Export import errors
            </button>
          ) : null}
        </div>

        {importHistory.length > 0 ? (
          <div style={{ marginBottom: "14px", padding: "10px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "13px", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>Recent imports</div>
            <div style={{ display: "grid", gap: "6px" }}>
              {importHistory.map((h, i) => (
                <div key={`${h.at}-${i}`} style={{ fontSize: "12px", color: "#475569" }}>
                  {new Date(h.at).toLocaleString()} | source: {h.source} | limit: {h.limit} | created: {h.created} | updated: {h.updated} | skipped: {h.skipped}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={{ marginBottom: "14px", display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              style={{ flex: "2 1 360px", minWidth: "240px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU or barcode"
            />
            <input
              style={{ flex: "1 1 260px", minWidth: "220px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              placeholder="Barcode search"
            />
            <button
              onClick={() => {
                if (!barcodeDetectorSupported) {
                  setScanError("Scanner not supported in this browser. Use barcode input.");
                  return;
                }
                setScanError("");
                setScannerOpen(true);
              }}
              style={{ minWidth: "160px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #0f172a", background: "#0f172a", color: "#fff", fontWeight: 700 }}
            >
              Scan barcode
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
            <select value={stockState} onChange={(e) => setStockState(e.target.value)} style={{ minWidth: "160px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
              <option value="">All stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ minWidth: "170px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
              <option value="id">Sort by ID</option>
              <option value="created_at">Sort by date</option>
              <option value="name">Sort by name</option>
              <option value="status">Sort by status</option>
              <option value="stock">Sort by stock</option>
            </select>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={{ minWidth: "120px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
              <option value="desc">DESC</option>
              <option value="asc">ASC</option>
            </select>
            <button
              onClick={async () => {
                setSearch("");
                setBarcodeQuery("");
                setSortBy("created_at");
                setSortDir("desc");
                setStockState("");
                setScanError("");
                if (page === 1) await loadProducts(1);
                else setPage(1);
              }}
              style={{ minWidth: "110px", padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>No products found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#334155" }}>
                  <th style={{ textAlign: "left" }}>Image</th>
                  <th style={{ textAlign: "left" }}>ID</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Category</th>
                  <th style={{ textAlign: "left" }}>Brand</th>
                  <th style={{ textAlign: "left" }}>Status</th>
                  <th style={{ textAlign: "left" }}>Stock</th>
                  <th style={{ textAlign: "left" }}>SKU</th>
                  <th style={{ textAlign: "left" }}>Barcode</th>
                  <th style={{ textAlign: "left" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => {
                  const statusKey = p.status ? "active" : "inactive";
                  const thumb = getMainImage(p);
                  const totalStock = getTotalStock(p);
                  const stockMeta = getStockMeta(totalStock);

                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>
                        {thumb ? (
                          <img src={thumb} alt={p.name} style={{ width: "46px", height: "46px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }} />
                        ) : (
                          <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#f1f5f9", border: "1px solid #e2e8f0" }} />
                        )}
                      </td>
                      <td>{p.id}</td>
                      <td><div style={{ fontWeight: 700 }}>{p.name}</div></td>
                      <td>{p.category?.name || "-"}</td>
                      <td>{p.brand?.name || "-"}</td>
                      <td>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", ...STATUS_STYLE[statusKey] }}>
                          {statusKey}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", ...stockMeta.style }}>
                          {stockMeta.label}: {totalStock}
                        </span>
                      </td>
                      <td>{p.variants?.[0]?.sku || "-"}</td>
                      <td>{p.variants?.[0]?.barcode || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link to={`/admin/products/${p.id}/edit`} style={{ padding: "6px 10px", borderRadius: "8px", background: "#0f172a", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
                            Edit
                          </Link>
                          <button onClick={() => deleteProduct(p.id)} style={{ padding: "6px 10px", border: 0, borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700 }}>
                            Delete
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
              Total: {pagination.total} products | Page {pagination.current_page} / {pagination.last_page}
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

      {scannerOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "560px", background: "#fff", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Scan barcode</h3>
              <button
                onClick={() => setScannerOpen(false)}
                style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontWeight: 700 }}
              >
                Close
              </button>
            </div>

            <div style={{ color: "#475569", fontSize: "13px", marginBottom: "8px" }}>
              Point camera to the product barcode. Detected code will auto-fill search.
            </div>

            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1", background: "#000" }}>
              <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", maxHeight: "360px", objectFit: "cover" }} />
            </div>

            <div style={{ marginTop: "10px", fontSize: "12px", color: scanning ? "#047857" : "#64748b", fontWeight: 700 }}>
              {scanning ? "Scanning..." : "Starting camera..."}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
