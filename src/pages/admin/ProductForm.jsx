import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { http } from "../../api/http";
import AdminAlert from "../../components/admin/AdminAlert";
import { useI18n } from "../../context/I18nContext";
import { resolveMediaUrl } from "../../utils/media";

function formatFileSize(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProductForm() {
  const { pick, resolveValue } = useI18n();
  const ui = pick({
    fr: {
      missingBackendEntity: "Creez au moins un",
      and: "et",
      inBackendBeforeSaving: "dans le backend avant d'enregistrer un produit.",
      category: "categorie",
      brand: "marque",
      savedEntityMissing: "L'element enregistre",
      noLongerExists: "n'existe plus dans le backend. Un remplacement valide a ete selectionne automatiquement.",
      loadError: "Impossible de charger les donnees du formulaire.",
      productNameRequired: "Le nom du produit est obligatoire.",
      validCategoryBrand: "Une categorie et une marque valides sont obligatoires.",
      skuRequired: "Le SKU est obligatoire.",
      validPrice: "Le prix doit etre un nombre valide >= 0.",
      validStock: "Le stock doit etre un entier >= 0.",
      saveError: "Impossible d'enregistrer le produit.",
      updateWithImagesSuccess: "Produit mis a jour et images televersees avec succes.",
      updateSuccess: "Produit mis a jour avec succes.",
      imagesUploadSuccess: "Images televersees avec succes.",
      imagesUploadError: "Impossible de televerser les images.",
      mainImageUpdated: "Image principale mise a jour.",
      mainImageError: "Impossible de definir l'image principale.",
      confirmDeleteImage: "Supprimer cette image ?",
      imageDeleted: "Image supprimee avec succes.",
      imageDeleteError: "Impossible de supprimer l'image.",
      loading: "Chargement du formulaire...",
      editProduct: "Modifier le produit",
      newProduct: "Nouveau produit",
      backToProducts: "Retour aux produits",
      productName: "Nom du produit",
      description: "Description",
      productDescription: "Description du produit",
      categoryLabel: "Categorie",
      selectCategory: "Selectionner une categorie",
      noValidCategory: "Aucune categorie valide trouvee dans le backend.",
      brandLabel: "Marque",
      selectBrand: "Selectionner une marque",
      noValidBrand: "Aucune marque valide trouvee dans le backend.",
      status: "Statut",
      active: "Actif",
      inactive: "Inactif",
      barcodeOptional: "Code-barres (optionnel)",
      price: "Prix",
      stock: "Stock",
      productImages: "Images du produit",
      imagesEditHelp: "Televersez, changez l'image principale et supprimez les photos ici.",
      imagesCreateHelp: "Selectionnez les images maintenant. Elles seront televersees apres le premier enregistrement.",
      uploading: "Televersement...",
      uploadSelectedImages: "Televerser les images selectionnees",
      addImages: "Ajouter des images",
      selectedFiles: "Fichiers selectionnes",
      remove: "Retirer",
      noProductImage: "Aucune image du produit n'a encore ete televersee.",
      noImageYet: "Aucune image televersee pour l'instant. Creez d'abord le produit, puis les images apparaitront ici.",
      productImage: "Image du produit",
      mainImage: "Image principale",
      currentMain: "Principale actuelle",
      saving: "Enregistrement...",
      makeMain: "Definir principale",
      deleting: "Suppression...",
      delete: "Supprimer",
      cancel: "Annuler",
      saveChanges: "Enregistrer les modifications",
      createProduct: "Creer le produit",
    },
    en: {
      missingBackendEntity: "Create at least one",
      and: "and",
      inBackendBeforeSaving: "in the backend before saving a product.",
      category: "category",
      brand: "brand",
      savedEntityMissing: "The saved",
      noLongerExists: "no longer exists in the backend. A valid replacement was selected automatically.",
      loadError: "Failed to load form data.",
      productNameRequired: "Product name is required.",
      validCategoryBrand: "A valid category and brand are required.",
      skuRequired: "SKU is required.",
      validPrice: "Price must be a valid number >= 0.",
      validStock: "Stock must be an integer >= 0.",
      saveError: "Failed to save product.",
      updateWithImagesSuccess: "Product updated and images uploaded successfully.",
      updateSuccess: "Product updated successfully.",
      imagesUploadSuccess: "Images uploaded successfully.",
      imagesUploadError: "Failed to upload images.",
      mainImageUpdated: "Main image updated.",
      mainImageError: "Failed to set the main image.",
      confirmDeleteImage: "Delete this image?",
      imageDeleted: "Image deleted successfully.",
      imageDeleteError: "Failed to delete image.",
      loading: "Loading form...",
      editProduct: "Edit Product",
      newProduct: "New Product",
      backToProducts: "Back to products",
      productName: "Product name",
      description: "Description",
      productDescription: "Product description",
      categoryLabel: "Category",
      selectCategory: "Select category",
      noValidCategory: "No valid category found in backend.",
      brandLabel: "Brand",
      selectBrand: "Select brand",
      noValidBrand: "No valid brand found in backend.",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      barcodeOptional: "Barcode (optional)",
      price: "Price",
      stock: "Stock",
      productImages: "Product images",
      imagesEditHelp: "Upload, reorder main image, and delete photos from here.",
      imagesCreateHelp: "Select images now. They will be uploaded after the first save.",
      uploading: "Uploading...",
      uploadSelectedImages: "Upload selected images",
      addImages: "Add images",
      selectedFiles: "Selected files",
      remove: "Remove",
      noProductImage: "No product image uploaded yet.",
      noImageYet: "No image uploaded yet. Create the product first, then images will appear here.",
      productImage: "Product image",
      mainImage: "Main image",
      currentMain: "Current main",
      saving: "Saving...",
      makeMain: "Make main",
      deleting: "Deleting...",
      delete: "Delete",
      cancel: "Cancel",
      saveChanges: "Save changes",
      createProduct: "Create product",
    },
    ar: {
      missingBackendEntity: "أنشئ واحداً على الأقل من",
      and: "و",
      inBackendBeforeSaving: "في الخلفية قبل حفظ المنتج.",
      category: "فئة",
      brand: "علامة",
      savedEntityMissing: "العنصر المحفوظ",
      noLongerExists: "لم يعد موجوداً في الخلفية. تم اختيار بديل صالح تلقائياً.",
      loadError: "تعذر تحميل بيانات النموذج.",
      productNameRequired: "اسم المنتج مطلوب.",
      validCategoryBrand: "يلزم اختيار فئة وعلامة صالحين.",
      skuRequired: "SKU مطلوب.",
      validPrice: "يجب أن يكون السعر رقماً صالحاً >= 0.",
      validStock: "يجب أن يكون المخزون عدداً صحيحاً >= 0.",
      saveError: "تعذر حفظ المنتج.",
      updateWithImagesSuccess: "تم تحديث المنتج ورفع الصور بنجاح.",
      updateSuccess: "تم تحديث المنتج بنجاح.",
      imagesUploadSuccess: "تم رفع الصور بنجاح.",
      imagesUploadError: "تعذر رفع الصور.",
      mainImageUpdated: "تم تحديث الصورة الرئيسية.",
      mainImageError: "تعذر تعيين الصورة الرئيسية.",
      confirmDeleteImage: "حذف هذه الصورة؟",
      imageDeleted: "تم حذف الصورة بنجاح.",
      imageDeleteError: "تعذر حذف الصورة.",
      loading: "جار تحميل النموذج...",
      editProduct: "تعديل المنتج",
      newProduct: "منتج جديد",
      backToProducts: "العودة إلى المنتجات",
      productName: "اسم المنتج",
      description: "الوصف",
      productDescription: "وصف المنتج",
      categoryLabel: "الفئة",
      selectCategory: "اختر الفئة",
      noValidCategory: "لم يتم العثور على فئة صالحة في الخلفية.",
      brandLabel: "العلامة",
      selectBrand: "اختر العلامة",
      noValidBrand: "لم يتم العثور على علامة صالحة في الخلفية.",
      status: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      barcodeOptional: "الباركود (اختياري)",
      price: "السعر",
      stock: "المخزون",
      productImages: "صور المنتج",
      imagesEditHelp: "ارفع الصور وحدد الرئيسية واحذف الصور من هنا.",
      imagesCreateHelp: "اختر الصور الآن. سيتم رفعها بعد أول حفظ.",
      uploading: "جار الرفع...",
      uploadSelectedImages: "رفع الصور المحددة",
      addImages: "إضافة صور",
      selectedFiles: "الملفات المحددة",
      remove: "إزالة",
      noProductImage: "لم يتم رفع أي صورة للمنتج بعد.",
      noImageYet: "لا توجد صور مرفوعة بعد. أنشئ المنتج أولاً ثم ستظهر الصور هنا.",
      productImage: "صورة المنتج",
      mainImage: "الصورة الرئيسية",
      currentMain: "الرئيسية الحالية",
      saving: "جار الحفظ...",
      makeMain: "تعيين كرئيسية",
      deleting: "جار الحذف...",
      delete: "حذف",
      cancel: "إلغاء",
      saveChanges: "حفظ التغييرات",
      createProduct: "إنشاء المنتج",
    },
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageActionId, setImageActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");

  const hasCategoryOptions = categories.length > 0;
  const hasBrandOptions = brands.length > 0;

  const pickValidId = (rows, currentId) => {
    const rawId = currentId == null ? "" : String(currentId);
    if (rawId && rows.some((row) => String(row.id) === rawId)) {
      return rawId;
    }

    return rows[0]?.id ? String(rows[0].id) : "";
  };

  const hydrateProduct = useCallback((product, catRows, brandRows) => {
    const primaryVariant = Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants[0] : null;

    setName(product?.name || "");
    setDescription(product?.description || "");
    setStatus(Boolean(product?.status));
    setCategoryId(pickValidId(catRows, product?.category_id));
    setBrandId(pickValidId(brandRows, product?.brand_id));
    setSku(primaryVariant?.sku || "");
    setBarcode(primaryVariant?.barcode || "");
    setPrice(primaryVariant?.price != null ? String(primaryVariant.price) : "0");
    setStock(primaryVariant?.stock != null ? String(primaryVariant.stock) : "0");
    setImages(Array.isArray(product?.images) ? product.images : []);
  }, []);

  const loadMeta = useCallback(async () => {
    const [catRes, brandRes] = await Promise.all([
      http.get("/admin/categories", { params: { page: 1, per_page: 200 } }),
      http.get("/admin/brands", { params: { page: 1, per_page: 200 } }),
    ]);

    const catRows = Array.isArray(catRes?.data?.data) ? catRes.data.data : [];
    const brandRows = Array.isArray(brandRes?.data?.data) ? brandRes.data.data : [];

    setCategories(catRows);
    setBrands(brandRows);

    return { catRows, brandRows };
  }, []);

  const loadProduct = useCallback(async (productId = id) => {
    if (!productId) return {};
    const res = await http.get(`/admin/products/${productId}`);
    return res?.data || {};
  }, [id]);

  const refreshImages = useCallback(async (productId = id) => {
    const product = await loadProduct(productId);
    const nextImages = Array.isArray(product?.images) ? product.images : [];
    setImages(nextImages);
    return nextImages;
  }, [id, loadProduct]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const { catRows, brandRows } = await loadMeta();
        if (!mounted) return;

        let nextError = "";

        if (!catRows.length || !brandRows.length) {
          const missing = [
            !catRows.length ? "category" : null,
            !brandRows.length ? "brand" : null,
          ].filter(Boolean);
          nextError = `${ui.missingBackendEntity} ${missing.join(` ${ui.and} `)} ${ui.inBackendBeforeSaving}`;
        }

        if (isEdit) {
          const product = await loadProduct(id);
          if (!mounted) return;

          hydrateProduct(product, catRows, brandRows);

          const categoryMissing = product?.category_id && !catRows.some((row) => String(row.id) === String(product.category_id));
          const brandMissing = product?.brand_id && !brandRows.some((row) => String(row.id) === String(product.brand_id));

          if (categoryMissing || brandMissing) {
            const missing = [
              categoryMissing ? ui.category : null,
              brandMissing ? ui.brand : null,
            ].filter(Boolean);
            nextError = `${ui.savedEntityMissing} ${missing.join(` ${ui.and} `)} ${ui.noLongerExists}`;
          }
        } else {
          setName("");
          setDescription("");
          setStatus(true);
          setCategoryId(pickValidId(catRows, ""));
          setBrandId(pickValidId(brandRows, ""));
          setSku("");
          setBarcode("");
          setPrice("0");
          setStock("0");
          setImages([]);
          setPendingImages([]);
        }

        setError(nextError);
      } catch (e) {
        const apiMsg = e?.response?.data?.message;
        if (mounted) {
          setError(apiMsg || ui.loadError);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [hydrateProduct, id, isEdit, loadMeta, loadProduct, ui.and, ui.brand, ui.category, ui.inBackendBeforeSaving, ui.loadError, ui.missingBackendEntity, ui.noLongerExists, ui.savedEntityMissing]);

  const uploadPendingImages = useCallback(async (productId, existingImages = []) => {
    if (!productId || pendingImages.length === 0) {
      return Array.isArray(existingImages) ? existingImages : [];
    }

    setUploadingImages(true);

    try {
      let currentImages = Array.isArray(existingImages) ? [...existingImages] : [];

      for (const [index, file] of pendingImages.entries()) {
        const form = new FormData();
        form.append("product_id", String(productId));
        form.append("image_file", file);

        if (!currentImages.some((image) => image?.is_main) && index === 0) {
          form.append("is_main", "1");
        }

        const res = await http.post("/admin/images", form);
        if (res?.data) {
          currentImages = [...currentImages, res.data];
        }
      }

      setPendingImages([]);
      setImages(currentImages);
      return currentImages;
    } finally {
      setUploadingImages(false);
    }
  }, [pendingImages]);

  const save = async () => {
    if (!name.trim()) {
      setError(ui.productNameRequired);
      return;
    }
    if (!categoryId || !brandId) {
      setError(ui.validCategoryBrand);
      return;
    }
    if (!sku.trim()) {
      setError(ui.skuRequired);
      return;
    }
    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      setError(ui.validPrice);
      return;
    }
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setError(ui.validStock);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      status,
      category_id: categoryId,
      brand_id: brandId,
      sku: sku.trim(),
      barcode: barcode.trim() || null,
      price: Number(price),
      stock: Number(stock),
    };

    try {
      if (isEdit) {
        const res = await http.put(`/admin/products/${id}`, payload);
        const product = res?.data || {};

        if (pendingImages.length > 0) {
          await uploadPendingImages(product.id || id, product.images || images);
          await refreshImages(product.id || id);
          setSuccess(ui.updateWithImagesSuccess);
        } else {
          setSuccess(ui.updateSuccess);
        }
      } else {
        const res = await http.post("/admin/products", payload);
        const product = res?.data || {};

        if (pendingImages.length > 0) {
          await uploadPendingImages(product.id, product.images || []);
        }

        navigate(`/admin/products/${product.id}/edit`);
      }
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.saveError);
    } finally {
      setSaving(false);
    }
  };

  const uploadSelectedImages = async () => {
    if (!isEdit || !id || pendingImages.length === 0) return;

    setError("");
    setSuccess("");

    try {
      await uploadPendingImages(id, images);
      await refreshImages(id);
      setSuccess(ui.imagesUploadSuccess);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      const firstDetailedError = apiErrors ? Object.values(apiErrors)?.[0]?.[0] : null;
      setError(firstDetailedError || apiMsg || ui.imagesUploadError);
    }
  };

  const setMainImage = async (imageId) => {
    setImageActionId(`main-${imageId}`);
    setError("");
    setSuccess("");

    try {
      const res = await http.patch(`/admin/images/${imageId}`, { is_main: true });
      const updatedId = res?.data?.id || imageId;

      setImages((current) => current.map((image) => ({
        ...image,
        is_main: image.id === updatedId,
      })));

      setSuccess(ui.mainImageUpdated);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.mainImageError);
    } finally {
      setImageActionId("");
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm(ui.confirmDeleteImage)) return;

    setImageActionId(`delete-${imageId}`);
    setError("");
    setSuccess("");

    try {
      await http.delete(`/admin/images/${imageId}`);
      await refreshImages(id);
      setSuccess(ui.imageDeleted);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || ui.imageDeleteError);
    } finally {
      setImageActionId("");
    }
  };

  if (loading) return <div style={{ color: "#64748b", fontWeight: 600 }}>{ui.loading}</div>;

  return (
    <div style={{ width: "100%", maxWidth: "1500px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "10px", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
          {isEdit ? ui.editProduct : ui.newProduct}
        </h2>
        <Link to="/admin/products" style={{ color: "#0369a1", textDecoration: "none", fontWeight: 700 }}>
          {ui.backToProducts}
        </Link>
      </div>

      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success">{success}</AdminAlert> : null}

      <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.productName}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ui.productName}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={ui.productDescription}
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.categoryLabel}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!hasCategoryOptions}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
            >
              <option value="">{ui.selectCategory}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{resolveValue(category.name) || category.name}</option>
              ))}
            </select>
            {!hasCategoryOptions ? (
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#b45309" }}>{ui.noValidCategory}</div>
            ) : null}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.brandLabel}</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              disabled={!hasBrandOptions}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
            >
              <option value="">{ui.selectBrand}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{resolveValue(brand.name) || brand.name}</option>
              ))}
            </select>
            {!hasBrandOptions ? (
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#b45309" }}>{ui.noValidBrand}</div>
            ) : null}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.status}</label>
            <select
              value={status ? "1" : "0"}
              onChange={(e) => setStatus(e.target.value === "1")}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
            >
              <option value="1">{ui.active}</option>
              <option value="0">{ui.inactive}</option>
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
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.barcodeOptional}</label>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder={ui.barcodeOptional}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.price}</label>
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
            <label style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.stock}</label>
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

        <div style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
              <div>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>{ui.productImages}</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                {isEdit ? ui.imagesEditHelp : ui.imagesCreateHelp}
              </div>
            </div>

            {isEdit && pendingImages.length > 0 ? (
              <button
                onClick={uploadSelectedImages}
                disabled={uploadingImages || saving}
                style={{ padding: "10px 14px", border: 0, borderRadius: "10px", background: uploadingImages ? "#94a3b8" : "#0f766e", color: "#fff", fontWeight: 700 }}
              >
                {uploadingImages ? ui.uploading : ui.uploadSelectedImages}
              </button>
            ) : null}
          </div>

          <label style={{ display: "block", marginBottom: "12px" }}>
            <span style={{ display: "block", fontSize: "12px", color: "#475569", marginBottom: "6px" }}>{ui.addImages}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) {
                  setPendingImages((current) => [...current, ...files]);
                }
                e.target.value = "";
              }}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#fff" }}
            />
          </label>

          {pendingImages.length > 0 ? (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", color: "#475569", fontWeight: 700, marginBottom: "8px" }}>{ui.selectedFiles}</div>
              <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {pendingImages.map((file, index) => (
                  <div key={`${file.name}-${file.size}-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", background: "#f8fafc" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px", wordBreak: "break-word" }}>{file.name}</div>
                    <div style={{ marginTop: "4px", fontSize: "12px", color: "#64748b" }}>{formatFileSize(file.size)}</div>
                    <button
                      onClick={() => setPendingImages((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                      style={{ marginTop: "10px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontWeight: 700 }}
                    >
                      {ui.remove}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {images.length === 0 ? (
            <div style={{ padding: "14px", borderRadius: "12px", background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>
              {isEdit ? ui.noProductImage : ui.noImageYet}
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {images.map((image) => {
                const isBusy = imageActionId === `main-${image.id}` || imageActionId === `delete-${image.id}`;

                return (
                  <div key={image.id} style={{ border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", background: "#fff" }}>
                    <div style={{ position: "relative", background: "#f8fafc" }}>
                      <img
                        src={resolveMediaUrl(image.image_path)}
                        alt={name || ui.productImage}
                        style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                      />
                      {image.is_main ? (
                        <span style={{ position: "absolute", top: "10px", left: "10px", padding: "6px 10px", borderRadius: "999px", background: "#0f766e", color: "#fff", fontSize: "12px", fontWeight: 800 }}>
                          {ui.mainImage}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ padding: "12px" }}>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", wordBreak: "break-all" }}>
                        {image.image_path}
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => setMainImage(image.id)}
                          disabled={Boolean(image.is_main) || isBusy}
                          style={{ padding: "8px 10px", borderRadius: "8px", border: 0, background: image.is_main ? "#cbd5e1" : "#0f172a", color: "#fff", fontWeight: 700 }}
                        >
                          {image.is_main ? ui.currentMain : isBusy && imageActionId === `main-${image.id}` ? ui.saving : ui.makeMain}
                        </button>
                        <button
                          onClick={() => deleteImage(image.id)}
                          disabled={isBusy}
                          style={{ padding: "8px 10px", borderRadius: "8px", border: 0, background: "#ef4444", color: "#fff", fontWeight: 700 }}
                        >
                          {isBusy && imageActionId === `delete-${image.id}` ? ui.deleting : ui.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Link to="/admin/products" style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>
            {ui.cancel}
          </Link>
          <button
            onClick={save}
            disabled={saving || uploadingImages || !hasCategoryOptions || !hasBrandOptions}
            style={{ padding: "10px 16px", border: 0, borderRadius: "10px", background: saving ? "#94a3b8" : "#0369a1", color: "#fff", fontWeight: 700 }}
          >
            {saving ? ui.saving : isEdit ? ui.saveChanges : ui.createProduct}
          </button>
        </div>
      </div>
    </div>
  );
}
