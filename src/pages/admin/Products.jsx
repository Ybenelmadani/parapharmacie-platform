import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";
import { useI18n } from "../../context/I18nContext";
import { resolveMediaUrl } from "../../utils/media";

const STATUS_STYLE = {
  active: { background: "#dcfce7", color: "#166534" },
  inactive: { background: "#fee2e2", color: "#991b1b" },
};
const STOCK_STYLE = {
  out: { background: "#fee2e2", color: "#991b1b" },
  low: { background: "#fef3c7", color: "#92400e" },
  in_stock: { background: "#dcfce7", color: "#166534" },
};
const TABLE_HEADER_CELL_STYLE = {
  textAlign: "left",
  padding: "16px 14px",
  fontSize: "13px",
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #dbe4ee",
};
const TABLE_CELL_STYLE = {
  padding: "14px",
  verticalAlign: "middle",
  color: "#0f172a",
  borderBottom: "1px solid #e2e8f0",
};

function getMainImage(product) {
  const images = Array.isArray(product?.images) ? product.images : [];
  if (!images.length) return "";
  const main = images.find((img) => img?.is_main);
  return resolveMediaUrl((main || images[0])?.image_path || "");
}

function getTotalStock(product) {
  if (product?.variants_sum_stock != null && product?.variants_sum_stock !== "") {
    return Number(product.variants_sum_stock) || 0;
  }
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0);
}

function getStockMeta(totalStock, labels) {
  if (totalStock <= 0) return { key: "out", label: labels.out, style: { background: STOCK_STYLE.out.background, color: STOCK_STYLE.out.color } };
  if (totalStock <= 5) return { key: "low", label: labels.low, style: { background: STOCK_STYLE.low.background, color: STOCK_STYLE.low.color } };
  return { key: "in_stock", label: labels.inStock, style: { background: STOCK_STYLE.in_stock.background, color: STOCK_STYLE.in_stock.color } };
}

export default function ProductsAdmin() {
  const { pick, locale, resolveValue } = useI18n();
  const ui = pick({
    fr: {
      active: "Actif",
      inactive: "Inactif",
      stockOut: "Rupture",
      stockLow: "Stock faible",
      stockIn: "En stock",
      loadError: "Impossible de charger les produits.",
      scannerUnsupported: "Le scanner n'est pas pris en charge dans ce navigateur. Utilisez le champ code-barres.",
      cameraUnavailable: "La camera n'est pas disponible dans ce navigateur.",
      barcodeDetected: "Code-barres detecte :",
      cameraAccessError: "Impossible d'acceder a la camera. Autorisez l'acces puis reessayez.",
      deleteSuccess: "Produit supprime avec succes.",
      deleteError: "Impossible de supprimer le produit.",
      chooseFile: "Veuillez choisir un fichier Excel/CSV.",
      choosePath: "Veuillez saisir un chemin de fichier JSON.",
      importFailed: "Echec de l'import.",
      importDone: "Import termine.",
      created: "Crees",
      updated: "Mis a jour",
      skipped: "Ignores",
      sourceUsed: "Source",
      products: "Produits",
      newProduct: "Nouveau produit",
      importSource: "Source d'import",
      auto: "Auto (eBay -> Dummy -> Fallback)",
      upload: "Import Excel/CSV (recommande)",
      ebay: "eBay seulement",
      dummy: "Dummy seulement",
      fallback: "Fallback seulement",
      file: "Chemin JSON local (avance)",
      uploadFile: "Fichier Excel/CSV",
      filePath: "Chemin du fichier (JSON)",
      limit: "Limite",
      onlyNew: "Nouveaux seulement (sur)",
      importing: "Importation...",
      importProducts: "Importer les produits peinture",
      retryLastImport: "Relancer le dernier import",
      exportImportErrors: "Exporter les erreurs d'import",
      recentImports: "Imports recents",
      source: "source",
      searchPlaceholder: "Rechercher par nom, SKU ou code-barres",
      barcodeSearch: "Recherche code-barres",
      scanBarcode: "Scanner le code-barres",
      allStock: "Tout le stock",
      sortById: "Trier par ID",
      sortByDate: "Trier par date",
      sortByName: "Trier par nom",
      sortByStatus: "Trier par statut",
      sortByStock: "Trier par stock",
      reset: "Reinitialiser",
      loading: "Chargement des produits...",
      empty: "Aucun produit trouve.",
      image: "Image",
      id: "ID",
      name: "Nom",
      category: "Categorie",
      brand: "Marque",
      status: "Statut",
      stock: "Stock",
      barcode: "Code-barres",
      action: "Action",
      edit: "Modifier",
      delete: "Supprimer",
      total: "Total",
      productCount: "produits",
      page: "Page",
      previous: "Precedent",
      next: "Suivant",
      scanTitle: "Scanner le code-barres",
      close: "Fermer",
      scanHelp: "Pointez la camera vers le code-barres du produit. Le code detecte remplira automatiquement la recherche.",
      scanning: "Analyse en cours...",
      startingCamera: "Demarrage de la camera...",
    },
    en: {
      active: "Active",
      inactive: "Inactive",
      stockOut: "Out of stock",
      stockLow: "Low stock",
      stockIn: "In stock",
      loadError: "Failed to load products.",
      scannerUnsupported: "Scanner not supported in this browser. Use barcode input.",
      cameraUnavailable: "Camera is not available in this browser.",
      barcodeDetected: "Barcode detected:",
      cameraAccessError: "Unable to access camera. Allow permission and retry.",
      deleteSuccess: "Product deleted successfully.",
      deleteError: "Failed to delete product.",
      chooseFile: "Please choose an Excel/CSV file.",
      choosePath: "Please enter a JSON file path.",
      importFailed: "Import failed.",
      importDone: "Import done.",
      created: "Created",
      updated: "Updated",
      skipped: "Skipped",
      sourceUsed: "Source",
      products: "Products",
      newProduct: "New Product",
      importSource: "Import source",
      auto: "Auto (eBay -> Dummy -> Fallback)",
      upload: "Excel/CSV upload (recommended)",
      ebay: "eBay only",
      dummy: "Dummy only",
      fallback: "Fallback only",
      file: "Local JSON path (advanced)",
      uploadFile: "Excel/CSV file",
      filePath: "File path (JSON)",
      limit: "Limit",
      onlyNew: "Only new (safe)",
      importing: "Importing...",
      importProducts: "Import painting products",
      retryLastImport: "Retry last import",
      exportImportErrors: "Export import errors",
      recentImports: "Recent imports",
      source: "source",
      searchPlaceholder: "Search by name, SKU or barcode",
      barcodeSearch: "Barcode search",
      scanBarcode: "Scan barcode",
      allStock: "All stock",
      sortById: "Sort by ID",
      sortByDate: "Sort by date",
      sortByName: "Sort by name",
      sortByStatus: "Sort by status",
      sortByStock: "Sort by stock",
      reset: "Reset",
      loading: "Loading products...",
      empty: "No products found.",
      image: "Image",
      id: "ID",
      name: "Name",
      category: "Category",
      brand: "Brand",
      status: "Status",
      stock: "Stock",
      barcode: "Barcode",
      action: "Action",
      edit: "Edit",
      delete: "Delete",
      total: "Total",
      productCount: "products",
      page: "Page",
      previous: "Previous",
      next: "Next",
      scanTitle: "Scan barcode",
      close: "Close",
      scanHelp: "Point camera to the product barcode. Detected code will auto-fill search.",
      scanning: "Scanning...",
      startingCamera: "Starting camera...",
    },
    ar: {
      active: "نشط",
      inactive: "غير نشط",
      stockOut: "نفد المخزون",
      stockLow: "مخزون منخفض",
      stockIn: "متوفر",
      loadError: "تعذر تحميل المنتجات.",
      scannerUnsupported: "الماسح غير مدعوم في هذا المتصفح. استخدم حقل الباركود.",
      cameraUnavailable: "الكاميرا غير متاحة في هذا المتصفح.",
      barcodeDetected: "تم اكتشاف الباركود:",
      cameraAccessError: "تعذر الوصول إلى الكاميرا. اسمح بالإذن ثم أعد المحاولة.",
      deleteSuccess: "تم حذف المنتج بنجاح.",
      deleteError: "تعذر حذف المنتج.",
      chooseFile: "يرجى اختيار ملف Excel/CSV.",
      choosePath: "يرجى إدخال مسار ملف JSON.",
      importFailed: "فشل الاستيراد.",
      importDone: "تم الاستيراد.",
      created: "تم الإنشاء",
      updated: "تم التحديث",
      skipped: "تم التخطي",
      sourceUsed: "المصدر",
      products: "المنتجات",
      newProduct: "منتج جديد",
      importSource: "مصدر الاستيراد",
      auto: "تلقائي (eBay -> Dummy -> Fallback)",
      upload: "رفع Excel/CSV (موصى به)",
      ebay: "eBay فقط",
      dummy: "Dummy فقط",
      fallback: "Fallback فقط",
      file: "مسار JSON محلي (متقدم)",
      uploadFile: "ملف Excel/CSV",
      filePath: "مسار الملف (JSON)",
      limit: "الحد",
      onlyNew: "الجديد فقط (آمن)",
      importing: "جار الاستيراد...",
      importProducts: "استيراد منتجات الطلاء",
      retryLastImport: "إعادة آخر استيراد",
      exportImportErrors: "تصدير أخطاء الاستيراد",
      recentImports: "عمليات الاستيراد الأخيرة",
      source: "المصدر",
      searchPlaceholder: "ابحث بالاسم أو SKU أو الباركود",
      barcodeSearch: "بحث الباركود",
      scanBarcode: "مسح الباركود",
      allStock: "كل المخزون",
      sortById: "ترتيب حسب المعرف",
      sortByDate: "ترتيب حسب التاريخ",
      sortByName: "ترتيب حسب الاسم",
      sortByStatus: "ترتيب حسب الحالة",
      sortByStock: "ترتيب حسب المخزون",
      reset: "إعادة التعيين",
      loading: "جار تحميل المنتجات...",
      empty: "لم يتم العثور على منتجات.",
      image: "الصورة",
      id: "المعرف",
      name: "الاسم",
      category: "الفئة",
      brand: "العلامة",
      status: "الحالة",
      stock: "المخزون",
      barcode: "الباركود",
      action: "الإجراء",
      edit: "تعديل",
      delete: "حذف",
      total: "الإجمالي",
      productCount: "منتجات",
      page: "الصفحة",
      previous: "السابق",
      next: "التالي",
      scanTitle: "مسح الباركود",
      close: "إغلاق",
      scanHelp: "وجّه الكاميرا نحو باركود المنتج. سيتم ملء البحث تلقائياً عند اكتشاف الرمز.",
      scanning: "جار المسح...",
      startingCamera: "جار تشغيل الكاميرا...",
    },
  });
  const statusLabels = useMemo(() => ({ active: ui.active, inactive: ui.inactive }), [ui.active, ui.inactive]);
  const stockLabels = useMemo(() => ({ out: ui.stockOut, low: ui.stockLow, inStock: ui.stockIn }), [ui.stockIn, ui.stockLow, ui.stockOut]);
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
  const searchRef = useRef(search);
  const barcodeQueryRef = useRef(barcodeQuery);
  const sortByRef = useRef(sortBy);
  const sortDirRef = useRef(sortDir);
  const stockStateRef = useRef(stockState);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const barcodeDetectorSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    barcodeQueryRef.current = barcodeQuery;
  }, [barcodeQuery]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    sortDirRef.current = sortDir;
  }, [sortDir]);

  useEffect(() => {
    stockStateRef.current = stockState;
  }, [stockState]);

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

  const loadProducts = useCallback(async (targetPage = 1, overrides = {}) => {
    const query = typeof overrides.search === "string" ? overrides.search : searchRef.current;
    const barcode = typeof overrides.barcode === "string" ? overrides.barcode : barcodeQueryRef.current;
    const sort = typeof overrides.sortBy === "string" ? overrides.sortBy : sortByRef.current;
    const direction = typeof overrides.sortDir === "string" ? overrides.sortDir : sortDirRef.current;
    const stock = typeof overrides.stockState === "string" ? overrides.stockState : stockStateRef.current;

    setLoading(true);
    setError("");

    try {
      const res = await http.get("/admin/products", {
        params: {
          page: targetPage,
          per_page: pagination.per_page,
          q: query.trim() || undefined,
          barcode: barcode.trim() || undefined,
          sort_by: sort,
          sort_dir: direction,
          stock_state: stock || undefined,
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
      setError(ui.loadError);
    } finally {
      setLoading(false);
    }
  }, [pagination.per_page, ui.loadError]);

  useEffect(() => {
    loadProducts(page);
  }, [loadProducts, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) loadProducts(1);
      else setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [barcodeQuery, loadProducts, page, search, sortBy, sortDir, stockState]);

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
        setScanError(ui.scannerUnsupported);
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        setScanError(ui.cameraUnavailable);
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
                setSuccess(`${ui.barcodeDetected} ${rawValue}`);
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
        setScanError(ui.cameraAccessError);
      }
    };

    runScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [barcodeDetectorSupported, scannerOpen, stopScanner, ui.barcodeDetected, ui.cameraAccessError, ui.cameraUnavailable, ui.scannerUnsupported]);

  useEffect(() => {
    return () => stopScanner();
  }, [stopScanner]);

  const deleteProduct = async (id) => {
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/products/${id}`);
      setSuccess(ui.deleteSuccess);

      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await loadProducts(page);
      }
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.deleteError);
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
      setError(ui.chooseFile);
      return;
    }

    if (payloadBase.source === "file" && !String(payloadBase.file_path || "").trim()) {
      setError(ui.choosePath);
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
      const message = `${ui.importDone} ${ui.created}: ${stats.created ?? 0}, ${ui.updated}: ${stats.updated ?? 0}, ${ui.skipped}: ${stats.skipped ?? 0}, ${ui.sourceUsed}: ${stats.source_used ?? "-"}`;

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
      setError(allErrors[0] || apiMsg || ui.importFailed);
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
    <div style={{ width: "100%", maxWidth: "1500px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "10px", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0 }}>{ui.products}</h2>
        <Link to="/admin/products/new" style={{ padding: "10px 16px", borderRadius: "10px", background: "#0369a1", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
          {ui.newProduct}
        </Link>
      </div>

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}
      {scanError ? <AdminAlert type="error">{scanError}</AdminAlert> : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ marginBottom: "16px", display: "grid", gap: "10px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "end" }}>
            <div style={{ flex: "2 1 320px", minWidth: "260px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.importSource}</label>
              <select
                value={importSource}
                onChange={(e) => setImportSource(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              >
                <option value="auto">{ui.auto}</option>
                <option value="upload">{ui.upload}</option>
                <option value="ebay">{ui.ebay}</option>
                <option value="dummy">{ui.dummy}</option>
                <option value="fallback">{ui.fallback}</option>
                <option value="file">{ui.file}</option>
              </select>
            </div>

            {importSource === "upload" ? (
              <div style={{ flex: "2 1 320px", minWidth: "260px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.uploadFile}</label>
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
                <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.filePath}</label>
                <input
                  value={importFilePath}
                  onChange={(e) => setImportFilePath(e.target.value)}
                  placeholder="C:\\path\\products.json"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
                />
              </div>
            ) : null}

            <div style={{ flex: "0 1 150px", minWidth: "120px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.limit}</label>
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
              {ui.onlyNew}
            </label>

            <button
              onClick={() => runImport()}
              disabled={importing}
              style={{ marginLeft: "auto", padding: "10px 16px", border: 0, borderRadius: "10px", background: importing ? "#94a3b8" : "#0f172a", color: "#fff", fontWeight: 800 }}
            >
              {importing ? ui.importing : ui.importProducts}
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
              {ui.retryLastImport}
            </button>
          ) : null}
          {importErrors.length > 0 ? (
            <button
              onClick={exportImportErrors}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontWeight: 700 }}
            >
              {ui.exportImportErrors}
            </button>
          ) : null}
        </div>

        {importHistory.length > 0 ? (
          <div style={{ marginBottom: "14px", padding: "10px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "13px", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>{ui.recentImports}</div>
            <div style={{ display: "grid", gap: "6px" }}>
              {importHistory.map((h, i) => (
                <div key={`${h.at}-${i}`} style={{ fontSize: "12px", color: "#475569" }}>
                  {new Date(h.at).toLocaleString(locale)} | {ui.source}: {h.source} | {ui.limit}: {h.limit} | {ui.created}: {h.created} | {ui.updated}: {h.updated} | {ui.skipped}: {h.skipped}
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
              placeholder={ui.searchPlaceholder}
            />
            <input
              style={{ flex: "1 1 260px", minWidth: "220px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              placeholder={ui.barcodeSearch}
            />
            <button
              onClick={() => {
                if (!barcodeDetectorSupported) {
                  setScanError(ui.scannerUnsupported);
                  return;
                }
                setScanError("");
                setScannerOpen(true);
              }}
              style={{ minWidth: "160px", padding: "10px 14px", borderRadius: "10px", border: "1px solid #0f172a", background: "#0f172a", color: "#fff", fontWeight: 700 }}
            >
              {ui.scanBarcode}
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
            <select value={stockState} onChange={(e) => setStockState(e.target.value)} style={{ minWidth: "160px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
              <option value="">{ui.allStock}</option>
              <option value="low">{ui.stockLow}</option>
              <option value="out">{ui.stockOut}</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ minWidth: "170px", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}>
              <option value="id">{ui.sortById}</option>
              <option value="created_at">{ui.sortByDate}</option>
              <option value="name">{ui.sortByName}</option>
              <option value="status">{ui.sortByStatus}</option>
              <option value="stock">{ui.sortByStock}</option>
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
                if (page === 1) {
                  await loadProducts(1, {
                    search: "",
                    barcode: "",
                    sortBy: "created_at",
                    sortDir: "desc",
                    stockState: "",
                  });
                }
                else setPage(1);
              }}
              style={{ minWidth: "110px", padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff", color: "#0f172a", fontWeight: 700 }}
            >
              {ui.reset}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "16px", borderRadius: "10px", background: "#f8fafc", color: "#475569" }}>{ui.empty}</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: "#f8fbff" }}>
                  <th style={{ ...TABLE_HEADER_CELL_STYLE, borderTopLeftRadius: "18px" }}>{ui.image}</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>{ui.id}</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>{ui.name}</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>{ui.category}</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>{ui.brand}</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>{ui.status}</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>{ui.stock}</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>SKU</th>
                  <th style={TABLE_HEADER_CELL_STYLE}>{ui.barcode}</th>
                  <th style={{ ...TABLE_HEADER_CELL_STYLE, borderTopRightRadius: "18px" }}>{ui.action}</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => {
                  const statusKey = p.status ? "active" : "inactive";
                  const thumb = getMainImage(p);
                  const totalStock = getTotalStock(p);
                  const stockMeta = getStockMeta(totalStock, stockLabels);

                  return (
                    <tr key={p.id} style={{ background: "#ffffff" }}>
                      <td style={{ ...TABLE_CELL_STYLE, borderLeft: "1px solid #e2e8f0", borderTopLeftRadius: "18px" }}>
                        {thumb ? (
                          <div style={{ width: "62px", height: "62px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #dbe4ee", display: "grid", placeItems: "center", overflow: "hidden" }}>
                            <img src={thumb} alt={resolveValue(p.name) || p.name} style={{ width: "46px", height: "46px", objectFit: "cover" }} />
                          </div>
                        ) : (
                          <div style={{ width: "62px", height: "62px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #dbe4ee" }} />
                        )}
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "52px", padding: "8px 12px", borderRadius: "999px", background: "#eaf2ff", color: "#1d4ed8", fontWeight: 800 }}>
                          #{p.id}
                        </span>
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <div style={{ fontWeight: 800, fontSize: "15px", lineHeight: 1.35, color: "#0f172a", maxWidth: "320px" }}>{resolveValue(p.name) || p.name}</div>
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <span style={{ display: "inline-block", padding: "8px 12px", borderRadius: "999px", background: "#f8fafc", color: "#334155", fontWeight: 700 }}>
                          {resolveValue(p.category?.name) || p.category?.name || "-"}
                        </span>
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <span style={{ display: "inline-block", padding: "8px 12px", borderRadius: "999px", background: "#f8fafc", color: "#334155", fontWeight: 700 }}>
                          {resolveValue(p.brand?.name) || p.brand?.name || "-"}
                        </span>
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", ...STATUS_STYLE[statusKey] }}>
                          {statusLabels[statusKey] || statusKey}
                        </span>
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            borderRadius: "14px",
                            fontWeight: 800,
                            fontSize: "12px",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            ...stockMeta.style,
                          }}
                        >
                          <span>{stockMeta.label}</span>
                          <span
                            style={{
                              minWidth: "24px",
                              height: "24px",
                              borderRadius: "999px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(255,255,255,0.45)",
                              fontSize: "12px",
                              fontWeight: 900,
                            }}
                          >
                            {totalStock}
                          </span>
                        </span>
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <div style={{ fontWeight: 700, lineHeight: 1.4 }}>{p.variants?.[0]?.sku || "-"}</div>
                      </td>
                      <td style={TABLE_CELL_STYLE}>
                        <div style={{ fontWeight: 700, lineHeight: 1.4 }}>{p.variants?.[0]?.barcode || "-"}</div>
                      </td>
                      <td style={{ ...TABLE_CELL_STYLE, borderRight: "1px solid #e2e8f0", borderTopRightRadius: "18px" }}>
                        <div style={{ display: "inline-flex", gap: "10px", alignItems: "center", padding: "8px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #dbe4ee" }}>
                          <Link to={`/admin/products/${p.id}/edit`} style={{ padding: "9px 14px", borderRadius: "12px", background: "#0f172a", color: "#fff", fontWeight: 800, textDecoration: "none", boxShadow: "0 10px 20px rgba(15, 23, 42, 0.12)" }}>
                            {ui.edit}
                          </Link>
                          <button onClick={() => deleteProduct(p.id)} style={{ padding: "9px 14px", border: 0, borderRadius: "12px", background: "#ef4444", color: "#fff", fontWeight: 800, boxShadow: "0 10px 20px rgba(239, 68, 68, 0.16)" }}>
                            {ui.delete}
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
              {ui.total}: {pagination.total} {ui.productCount} | {ui.page} {pagination.current_page} / {pagination.last_page}
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
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{ui.scanTitle}</h3>
              <button
                onClick={() => setScannerOpen(false)}
                style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontWeight: 700 }}
              >
                {ui.close}
              </button>
            </div>

            <div style={{ color: "#475569", fontSize: "13px", marginBottom: "8px" }}>
              {ui.scanHelp}
            </div>

            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1", background: "#000" }}>
              <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", maxHeight: "360px", objectFit: "cover" }} />
            </div>

            <div style={{ marginTop: "10px", fontSize: "12px", color: scanning ? "#047857" : "#64748b", fontWeight: 700 }}>
              {scanning ? ui.scanning : ui.startingCamera}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
