import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/layout/Container";
import ProductCard from "../components/product/ProductCard";
import { CatalogAPI } from "../api/catalog";
import { useI18n } from "../context/I18nContext";

const PAGE_SIZE = 24;
const QUICK_BRAND_LIMIT = 6;
const FEATURED_COLOR_ORDER = ["Red", "Yellow", "Blue", "Green", "Black", "White", "Pink", "Orange", "Brown", "Grey"];
const COLOR_SWATCHES = {
  Red: { base: "#dc2626", glow: "#fca5a5" },
  Yellow: { base: "#f59e0b", glow: "#fde68a" },
  Blue: { base: "#2563eb", glow: "#93c5fd" },
  Green: { base: "#3f7d2c", glow: "#a7f3d0" },
  Black: { base: "#111827", glow: "#4b5563" },
  White: { base: "#f8fafc", glow: "#e2e8f0" },
  Pink: { base: "#db2777", glow: "#f9a8d4" },
  Orange: { base: "#ea580c", glow: "#fdba74" },
  Brown: { base: "#8b5e3c", glow: "#d6b08c" },
  Grey: { base: "#64748b", glow: "#cbd5e1" },
};

function mixProductsByBrand(list) {
  const buckets = new Map();

  list.forEach((item) => {
    const key = String(item?.brand?.id ?? item?.brand_id ?? "no-brand");
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  });

  const groups = Array.from(buckets.values()).sort((a, b) => b.length - a.length);
  const mixed = [];

  while (groups.some((g) => g.length > 0)) {
    for (const g of groups) {
      if (g.length > 0) mixed.push(g.shift());
    }
  }

  return mixed;
}

function getColorSwatchStyle(colorName) {
  const swatch = COLOR_SWATCHES[colorName] || { base: "#94a3b8", glow: "#e2e8f0" };

  return {
    background: `linear-gradient(135deg, ${swatch.base} 0%, ${swatch.base} 58%, ${swatch.glow} 100%)`,
    borderColor: colorName === "White" ? "#cbd5e1" : "rgba(15, 23, 42, 0.08)",
  };
}

function ColorShortcut({ color, active, onClick }) {
  const { pick, translateColor } = useI18n();
  const ui = pick({
    fr: { variants: "{count} variantes" },
    en: { variants: "{count} variants" },
    ar: { variants: "{count} خيارات" },
  });
  const swatchStyle = getColorSwatchStyle(color.name);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex w-full items-center justify-between rounded-[18px] border px-3 py-2.5 text-left transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className="h-10 w-10 shrink-0 rounded-[12px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_16px_rgba(15,23,42,0.08)]"
          style={swatchStyle}
        />
        <span className="min-w-0">
          <span className={`block truncate text-base font-medium ${active ? "text-white" : "text-slate-800"}`}>
            {translateColor(color.name)}
          </span>
          <span className={`block text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
            {ui.variants.replace("{count}", color.count)}
          </span>
        </span>
      </span>
      <ChevronRight size={16} className={active ? "text-slate-300" : "text-slate-400"} />
    </button>
  );
}

export default function Products() {
  const { pick, translateColor } = useI18n();
  const ui = pick({
    fr: {
      loadError: "Impossible de charger les produits. Verifiez la connexion a l'API backend.",
      eyebrow: "Catalogue",
      title: "Boutique",
      subtitle: "Filtrez par categorie, marque, couleur et recherche.",
      results: "Resultats",
      showing: "{shown} sur {total}",
      refine: "Affiner les produits",
      refineTitle: "Trouver le bon materiel plus vite",
      categorySelected: "Categorie selectionnee",
      brandSelected: "Marque selectionnee",
      colorSelected: "Couleur : {color}",
      searchActive: "Recherche active",
      colorFamilies: "Familles de couleurs",
      popularShades: "Teintes populaires",
      allColors: "Toutes les couleurs",
      moreShades: "Autres teintes",
      remainingTones: "Explorer les teintes restantes",
      popularBrands: "Marques populaires",
      quickAccess: "Acces rapide dans cette selection",
      noColors: "Aucune couleur disponible pour cette selection.",
      moreShadesLater: "D'autres teintes apparaitront ici lorsqu'elles seront disponibles.",
      noBrands: "Aucune marque disponible pour cette selection.",
      search: "Recherche",
      searchPlaceholder: "Rechercher par nom de produit...",
      category: "Categorie",
      brand: "Marque",
      color: "Couleur",
      allCategories: "Toutes les categories",
      allBrands: "Toutes les marques",
      reset: "Reinitialiser",
      browseDescription: "Parcourez votre catalogue en direct avec des filtres plus propres et un acces plus rapide aux combinaisons categorie, marque et couleur.",
      pageOf: "Page {current} sur {last}",
      loadingProducts: "Chargement des produits...",
      showingProducts: "Affichage de {shown} sur {total} produits",
      filteredResults: "Resultats filtres",
      allProducts: "Tous les produits",
      noProducts: "Aucun produit trouve.",
      loadingMore: "Chargement de plus de produits...",
    },
    en: {
      loadError: "Unable to load products. Check backend API connection.",
      eyebrow: "Catalogue",
      title: "Shop",
      subtitle: "Filter by category, brand, color and search.",
      results: "Results",
      showing: "{shown} of {total}",
      refine: "Refine products",
      refineTitle: "Find the right material faster",
      categorySelected: "Category selected",
      brandSelected: "Brand selected",
      colorSelected: "Color: {color}",
      searchActive: "Search active",
      colorFamilies: "Color families",
      popularShades: "Popular shades",
      allColors: "All colors",
      moreShades: "More shades",
      remainingTones: "Explore the remaining tones",
      popularBrands: "Popular brands",
      quickAccess: "Quick access in this selection",
      noColors: "No colors available for this selection.",
      moreShadesLater: "More shades will appear here when available.",
      noBrands: "No brands available for this selection.",
      search: "Search",
      searchPlaceholder: "Search by product name...",
      category: "Category",
      brand: "Brand",
      color: "Color",
      allCategories: "All categories",
      allBrands: "All brands",
      reset: "Reset",
      browseDescription: "Browse your live catalog with cleaner filters and faster access to category, brand and color combinations.",
      pageOf: "Page {current} of {last}",
      loadingProducts: "Loading products...",
      showingProducts: "Showing {shown} of {total} products",
      filteredResults: "Filtered results",
      allProducts: "All products",
      noProducts: "No products found.",
      loadingMore: "Loading more products...",
    },
    ar: {
      loadError: "تعذر تحميل المنتجات. تحقق من اتصال واجهة الخلفية.",
      eyebrow: "الكتالوج",
      title: "المتجر",
      subtitle: "قم بالتصفية حسب الفئة والعلامة واللون والبحث.",
      results: "النتائج",
      showing: "{shown} من {total}",
      refine: "تنقية المنتجات",
      refineTitle: "اعثر على المادة المناسبة بشكل أسرع",
      categorySelected: "تم تحديد الفئة",
      brandSelected: "تم تحديد العلامة",
      colorSelected: "اللون: {color}",
      searchActive: "البحث مفعل",
      colorFamilies: "عائلات الألوان",
      popularShades: "الدرجات الشائعة",
      allColors: "كل الألوان",
      moreShades: "مزيد من الدرجات",
      remainingTones: "استكشف الدرجات المتبقية",
      popularBrands: "العلامات الشائعة",
      quickAccess: "وصول سريع ضمن هذا الاختيار",
      noColors: "لا توجد ألوان متاحة لهذا الاختيار.",
      moreShadesLater: "ستظهر درجات إضافية هنا عند توفرها.",
      noBrands: "لا توجد علامات متاحة لهذا الاختيار.",
      search: "بحث",
      searchPlaceholder: "ابحث باسم المنتج...",
      category: "الفئة",
      brand: "العلامة",
      color: "اللون",
      allCategories: "كل الفئات",
      allBrands: "كل العلامات",
      reset: "إعادة تعيين",
      browseDescription: "تصفح كتالوجك المباشر بفلاتر أوضح ووصول أسرع إلى توليفات الفئة والعلامة واللون.",
      pageOf: "الصفحة {current} من {last}",
      loadingProducts: "جارٍ تحميل المنتجات...",
      showingProducts: "عرض {shown} من {total} منتج",
      filteredResults: "نتائج مفلترة",
      allProducts: "كل المنتجات",
      noProducts: "لم يتم العثور على منتجات.",
      loadingMore: "جارٍ تحميل المزيد من المنتجات...",
    },
  });
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [catsLoaded, setCatsLoaded] = useState(false);
  const [brandsLoaded, setBrandsLoaded] = useState(false);
  const [colorsLoaded, setColorsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState("");
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const loadMoreRef = useRef(null);

  const category_id = sp.get("category_id") || "";
  const brand_id = sp.get("brand_id") || "";
  const color = sp.get("color") || "";
  const q = sp.get("q") || "";
  const hasActiveFilters = Boolean(category_id || brand_id || color || q.trim());

  const updateSearchParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(sp);
      if (value) next.set(key, value);
      else next.delete(key);
      setSp(next);
    },
    [setSp, sp]
  );

  const loadPage = useCallback(
    async (page, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      if (!append) setApiError("");

      try {
        const data = await CatalogAPI.productsPage({
          category_id: category_id || undefined,
          brand_id: brand_id || undefined,
          color: color || undefined,
          q: q.trim() || undefined,
          page,
          per_page: PAGE_SIZE,
        });
        const items = Array.isArray(data?.data) ? data.data : [];

        setProducts((prev) => (append ? [...prev, ...items] : items));
        setPageInfo({
          current_page: Number(data?.current_page) || page,
          last_page: Number(data?.last_page) || 1,
          total: Number(data?.total) || items.length,
        });
      } catch {
        if (!append) setProducts([]);
        setApiError(ui.loadError);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [brand_id, category_id, color, q, ui.loadError]
  );

  useEffect(() => {
    let active = true;

    const loadFilters = async () => {
      const params = {
        category_id: category_id || undefined,
        brand_id: brand_id || undefined,
        q: q.trim() || undefined,
      };

      const [categoriesResult, brandsResult, colorsResult] = await Promise.allSettled([
        CatalogAPI.categories(),
        CatalogAPI.brands(category_id ? { category_id } : {}),
        CatalogAPI.colors(params),
      ]);

      if (!active) return;

      if (categoriesResult.status === "fulfilled") {
        setCats(Array.isArray(categoriesResult.value) ? categoriesResult.value : []);
        setCatsLoaded(true);
      }

      if (brandsResult.status === "fulfilled") {
        setBrands(Array.isArray(brandsResult.value) ? brandsResult.value : []);
        setBrandsLoaded(true);
      }

      if (colorsResult.status === "fulfilled") {
        setColors(Array.isArray(colorsResult.value) ? colorsResult.value : []);
        setColorsLoaded(true);
      }
    };

    loadFilters();

    return () => {
      active = false;
    };
  }, [brand_id, category_id, q]);

  useEffect(() => {
    if (!catsLoaded || !category_id) return;
    if (cats.some((category) => String(category.id) === category_id)) return;

    const next = new URLSearchParams(sp);
    next.delete("category_id");
    setSp(next, { replace: true });
  }, [cats, catsLoaded, category_id, setSp, sp]);

  useEffect(() => {
    if (!brandsLoaded || !brand_id) return;
    if (brands.some((brand) => String(brand.id) === brand_id)) return;

    const next = new URLSearchParams(sp);
    next.delete("brand_id");
    setSp(next, { replace: true });
  }, [brand_id, brands, brandsLoaded, setSp, sp]);

  useEffect(() => {
    if (!colorsLoaded || !color) return;
    if (colors.some((item) => item?.name === color)) return;

    const next = new URLSearchParams(sp);
    next.delete("color");
    setSp(next, { replace: true });
  }, [color, colors, colorsLoaded, setSp, sp]);

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        const hasMore = pageInfo.current_page < pageInfo.last_page;
        if (first.isIntersecting && hasMore && !loading && !loadingMore && !apiError) {
          loadPage(pageInfo.current_page + 1, true);
        }
      },
      { rootMargin: "220px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [apiError, loadPage, loading, loadingMore, pageInfo.current_page, pageInfo.last_page]);

  const mixedProducts = useMemo(() => mixProductsByBrand(products), [products]);

  const orderedColors = useMemo(() => {
    const orderMap = new Map(FEATURED_COLOR_ORDER.map((item, index) => [item, index]));

    return [...colors].sort((a, b) => {
      const aOrder = orderMap.has(a.name) ? orderMap.get(a.name) : FEATURED_COLOR_ORDER.length;
      const bOrder = orderMap.has(b.name) ? orderMap.get(b.name) : FEATURED_COLOR_ORDER.length;

      if (aOrder !== bOrder) return aOrder - bOrder;
      return (b.count || 0) - (a.count || 0);
    });
  }, [colors]);

  const primaryColors = useMemo(() => orderedColors.slice(0, 6), [orderedColors]);
  const secondaryColors = useMemo(() => orderedColors.slice(6, 12), [orderedColors]);
  const quickBrands = useMemo(() => brands.slice(0, QUICK_BRAND_LIMIT), [brands]);

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">Catalogue</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">{ui.eyebrow}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 md:text-[2rem]">{ui.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{ui.subtitle}</p>
        </div>
        <div className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm md:w-auto md:min-w-[230px]">
          <span className="font-medium text-slate-500">{ui.results}</span>
          <span className="font-semibold text-slate-900">
            {ui.showing.replace("{shown}", products.length).replace("{total}", pageInfo.total)}
          </span>
        </div>
      </div>

      <section className="mt-5 rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{ui.refine}</div>
            <h2 className="mt-1 text-lg font-bold text-slate-950">{ui.refineTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {category_id ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {ui.categorySelected}
              </span>
            ) : null}
            {brand_id ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {ui.brandSelected}
              </span>
            ) : null}
            {color ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {ui.colorSelected.replace("{color}", translateColor(color))}
              </span>
            ) : null}
            {q.trim() ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {ui.searchActive}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,0.8fr)]">
          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{ui.colorFamilies}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{ui.popularShades}</div>
              </div>
              {color ? (
                <button
                  type="button"
                  onClick={() => updateSearchParam("color", "")}
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  {ui.allColors}
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-2">
              {primaryColors.length > 0 ? (
                primaryColors.map((item) => (
                  <ColorShortcut
                    key={item.name}
                    color={item}
                    active={color === item.name}
                    onClick={() => updateSearchParam("color", color === item.name ? "" : item.name)}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  {ui.noColors}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 pb-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{ui.moreShades}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{ui.remainingTones}</div>
            </div>
            <div className="mt-4 grid gap-2">
              {secondaryColors.length > 0 ? (
                secondaryColors.map((item) => (
                  <ColorShortcut
                    key={item.name}
                    color={item}
                    active={color === item.name}
                    onClick={() => updateSearchParam("color", color === item.name ? "" : item.name)}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  {ui.moreShadesLater}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="border-b border-slate-100 pb-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{ui.popularBrands}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{ui.quickAccess}</div>
            </div>
            <div className="mt-4 grid gap-2">
              {quickBrands.length > 0 ? (
                quickBrands.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateSearchParam("brand_id", String(item.id) === brand_id ? "" : String(item.id))}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      String(item.id) === brand_id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  {ui.noBrands}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_220px_220px_220px_120px]">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {ui.search}
            </label>
            <input
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
              placeholder={ui.searchPlaceholder}
              value={q}
              onChange={(e) => updateSearchParam("q", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {ui.category}
            </label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-300"
              value={category_id}
              onChange={(e) => updateSearchParam("category_id", e.target.value)}
            >
              <option value="">{ui.allCategories}</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {ui.brand}
            </label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-300"
              value={brand_id}
              onChange={(e) => updateSearchParam("brand_id", e.target.value)}
            >
              <option value="">{ui.allBrands}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {ui.color}
            </label>
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-300"
              value={color}
              onChange={(e) => updateSearchParam("color", e.target.value)}
            >
              <option value="">{ui.allColors}</option>
              {orderedColors.map((item) => (
                <option key={item.name} value={item.name}>
                  {translateColor(item.name)} ({item.count})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setSp(new URLSearchParams())}
              disabled={!hasActiveFilters}
              className={`h-10 w-full rounded-xl border text-sm font-semibold transition ${
                hasActiveFilters
                  ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                  : "border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              {ui.reset}
            </button>
          </div>
        </div>
      </section>

      <main className="mt-6">
        <div className="mb-4 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-500">
            {ui.browseDescription}
          </div>
          <div className="text-sm font-medium text-slate-500">
            {ui.pageOf.replace("{current}", pageInfo.current_page).replace("{last}", pageInfo.last_page)}
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:p-5">
          {loading && <div className="mt-6 text-slate-500">{ui.loadingProducts}</div>}
          {apiError && <div className="mt-6 text-rose-600">{apiError}</div>}

          {!loading && !apiError && (
            <>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 text-sm text-slate-500">
                <span>
                  {ui.showingProducts.replace("{shown}", products.length).replace("{total}", pageInfo.total)}
                </span>
                <span>{hasActiveFilters ? ui.filteredResults : ui.allProducts}</span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mixedProducts.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
              {products.length === 0 && <div className="mt-10 text-center text-slate-500">{ui.noProducts}</div>}

              {loadingMore && <div className="mt-8 text-center text-slate-500">{ui.loadingMore}</div>}
              <div ref={loadMoreRef} className="h-1" />
            </>
          )}
        </div>
      </main>
    </Container>
  );
}
