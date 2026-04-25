import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Search, X, Grid3x3, LayoutGrid } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Container from "../components/layout/Container";
import ProductCard from "../components/product/ProductCard";
import { CatalogAPI } from "../api/catalog";
import { useI18n } from "../context/I18nContext";

const PAGE_SIZE = 24;
const FEATURED_COLOR_ORDER = ["Transparent", "Claire", "Nude", "Beige", "Sable", "Medium", "Doree", "Brun", "Rose", "Rouge", "Blanc", "Noir", "Red", "Yellow", "Blue", "Green", "Black", "White", "Pink", "Orange", "Brown", "Grey"];
const COLOR_SWATCHES = {
  Transparent: { base: "#e2e8f0", glow: "#f8fafc" },
  Claire: { base: "#fcebde", glow: "#fff7f1" },
  Nude: { base: "#e9cbb8", glow: "#f6e6dc" },
  Beige: { base: "#d4bba0", glow: "#ebddcf" },
  Sable: { base: "#deb887", glow: "#eedcb7" },
  Medium: { base: "#c59275", glow: "#d9b6a3" },
  Doree: { base: "#d29d5b", glow: "#e8c495" },
  Teinte: { base: "#d8a687", glow: "#eecdbb" },
  Brun: { base: "#5c4033", glow: "#8b6653" },
  Rose: { base: "#fbcfe8", glow: "#fdf2f8" },
  Rouge: { base: "#ef4444", glow: "#fca5a5" },
  Blanc: { base: "#fffaf5", glow: "#eee2d8" },
  Noir: { base: "#1e293b", glow: "#475569" },
  Red: { base: "#c76a5d", glow: "#f4c2ba" },
  Yellow: { base: "#d4a253", glow: "#f7ddb0" },
  Blue: { base: "#6682a9", glow: "#c8d6e9" },
  Green: { base: "#7a8f69", glow: "#dbe8ce" },
  Black: { base: "#2d2321", glow: "#7f6b64" },
  White: { base: "#fffaf5", glow: "#eee2d8" },
  Pink: { base: "#cd7fa3", glow: "#f6cade" },
  Orange: { base: "#d18657", glow: "#f4c8a6" },
  Brown: { base: "#94705f", glow: "#dcc4b7" },
  Grey: { base: "#9a938f", glow: "#ddd6d2" },
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
          ? "border-[#0ea5e9] bg-[#0ea5e9] text-white shadow-[0_16px_32px_rgba(14,165,233,0.18)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-white"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className="h-10 w-10 shrink-0 rounded-[12px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_16px_rgba(15,23,42,0.08)]"
          style={swatchStyle}
        />
        <span className="min-w-0">
          <span className={`block truncate text-base font-medium ${active ? "text-white" : "text-[#0ea5e9]"}`}>
            {translateColor(color.name)}
          </span>
          <span className={`block text-xs ${active ? "text-white/70" : "text-slate-500"}`}>
            {ui.variants.replace("{count}", color.count)}
          </span>
        </span>
      </span>
      <ChevronRight size={16} className={active ? "text-white/70" : "text-slate-400"} />
    </button>
  );
}

export default function Products() {
  const { pick, translateColor } = useI18n();
  const ui = pick({
    fr: {
      loadError: "Impossible de charger les produits. Verifiez la connexion a l'API backend.",
      eyebrow: "Parapharmacie",
      title: "Catalogue",
      subtitle: "Filtrez par categorie, marque, couleur et recherche.",
      results: "Resultats",
      showing: "{shown} sur {total}",
      refine: "Affiner la selection",
      refineTitle: "Trouver le bon produit plus vite",
      refineDescription: "Utilisez la recherche, les categories et les marques pour acceder rapidement au bon produit.",
      categorySelected: "Categorie selectionnee",
      brandSelected: "Marque selectionnee",
      colorSelected: "Couleur : {color}",
      searchActive: "Recherche active",
      colorFamilies: "Filtres couleur",
      popularShades: "Couleurs disponibles",
      allColors: "Toutes les couleurs",
      moreShades: "Autres couleurs",
      remainingTones: "Explorer les couleurs restantes",
      popularBrands: "Marques disponibles",
      quickAccess: "Acces rapide dans cette selection",
      noColors: "Aucune couleur disponible pour cette selection.",
      moreShadesLater: "D'autres couleurs apparaitront ici lorsqu'elles seront disponibles.",
      noBrands: "Aucune marque disponible pour cette selection.",
      search: "Recherche",
      searchPlaceholder: "Rechercher par nom de produit...",
      category: "Categorie",
      brand: "Marque",
      color: "Couleur",
      allCategories: "Toutes les categories",
      allBrands: "Toutes les marques",
      reset: "Reinitialiser",
      browseDescription: "Parcourez votre catalogue parapharmacie en direct avec un acces plus rapide aux categories, marques et recherches utiles.",
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
      eyebrow: "Parapharmacy",
      title: "Catalog",
      subtitle: "Filter by category, brand, color and search.",
      results: "Results",
      showing: "{shown} of {total}",
      refine: "Refine selection",
      refineTitle: "Find the right product faster",
      refineDescription: "Use search, categories, and brands to reach the right product faster.",
      categorySelected: "Category selected",
      brandSelected: "Brand selected",
      colorSelected: "Color: {color}",
      searchActive: "Search active",
      colorFamilies: "Color filters",
      popularShades: "Available colors",
      allColors: "All colors",
      moreShades: "More colors",
      remainingTones: "Explore the remaining colors",
      popularBrands: "Available brands",
      quickAccess: "Quick access in this selection",
      noColors: "No colors available for this selection.",
      moreShadesLater: "More colors will appear here when available.",
      noBrands: "No brands available for this selection.",
      search: "Search",
      searchPlaceholder: "Search by product name...",
      category: "Category",
      brand: "Brand",
      color: "Color",
      allCategories: "All categories",
      allBrands: "All brands",
      reset: "Reset",
      browseDescription: "Browse your live parapharmacy catalog with faster access to categories, brands, and useful searches.",
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
  const [gridCols, setGridCols] = useState(3);
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

  const hasColorOptions = orderedColors.length > 0;

  return (
    <Container className="py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">{ui.eyebrow}</p>
          <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#0ea5e9] md:text-[2.2rem]">{ui.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{ui.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-1.5 shadow-sm xl:flex">
            <button
              onClick={() => setGridCols(3)}
              className={`rounded-full p-1.5 transition ${gridCols === 3 ? "bg-[#0ea5e9] text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
              title="Vue 3 colonnes"
            >
              <Grid3x3 size={15} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`rounded-full p-1.5 transition ${gridCols === 4 ? "bg-[#0ea5e9] text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
              title="Vue 4 colonnes"
            >
              <LayoutGrid size={15} strokeWidth={2.5} />
            </button>
          </div>
          <div className="inline-flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-[0_12px_26px_rgba(15,23,42,0.05)] md:w-auto md:min-w-[220px]">
            <span className="font-medium text-slate-500">{ui.results}</span>
            <span className="font-semibold text-[#0ea5e9]">
              {ui.showing.replace("{shown}", products.length).replace("{total}", pageInfo.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-[280px] xl:w-[320px]">
          <div className="flex flex-col gap-6">
            
            {hasActiveFilters && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Filtres actifs</h3>
                  <button
                    onClick={() => setSp(new URLSearchParams())}
                    className="text-xs font-semibold text-[#0ea5e9] hover:underline"
                  >
                    Effacer tout
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category_id && (
                    <button onClick={() => updateSearchParam("category_id", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>{ui.categorySelected}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                  {brand_id && (
                    <button onClick={() => updateSearchParam("brand_id", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>{ui.brandSelected}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                  {color && (
                    <button onClick={() => updateSearchParam("color", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>{ui.colorSelected.replace("{color}", translateColor(color))}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                  {q.trim() && (
                    <button onClick={() => updateSearchParam("q", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>Recherche: {q}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-6">
              
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {ui.search}
                </label>
                <div className="relative">
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                    placeholder={ui.searchPlaceholder}
                    value={q}
                    onChange={(e) => updateSearchParam("q", e.target.value)}
                  />
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {ui.category}
                </label>
                <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => updateSearchParam("category_id", "")}
                    className={`text-left text-sm py-1.5 transition-colors ${!category_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                  >
                    {ui.allCategories}
                  </button>
                  {cats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateSearchParam("category_id", String(c.id))}
                      className={`text-left text-sm py-1.5 transition-colors ${String(c.id) === category_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {ui.brand}
                </label>
                <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => updateSearchParam("brand_id", "")}
                    className={`text-left text-sm py-1.5 transition-colors ${!brand_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                  >
                    {ui.allBrands}
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateSearchParam("brand_id", String(b.id))}
                      className={`text-left text-sm py-1.5 transition-colors ${String(b.id) === brand_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {hasColorOptions && (
                <>
                  <hr className="border-slate-100" />
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        {ui.colorFamilies}
                      </label>
                      {color && (
                        <button
                          onClick={() => updateSearchParam("color", "")}
                          className="text-xs font-semibold text-[#0ea5e9] hover:underline"
                        >
                          {ui.allColors}
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {orderedColors.map((item) => (
                        <ColorShortcut
                          key={item.name}
                          color={item}
                          active={color === item.name}
                          onClick={() => updateSearchParam("color", color === item.name ? "" : item.name)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-600">
            {ui.browseDescription}
          </div>
          <div className="text-sm font-medium text-slate-400">
            {ui.pageOf.replace("{current}", pageInfo.current_page).replace("{last}", pageInfo.last_page)}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-[rgba(255,255,255,0.84)] p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
          {loading && <div className="mt-6 text-slate-600">{ui.loadingProducts}</div>}
          {apiError && <div className="mt-6 text-rose-600">{apiError}</div>}

          {!loading && !apiError && (
            <>
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 text-sm text-slate-600">
                <span>
                  {ui.showingProducts.replace("{shown}", products.length).replace("{total}", pageInfo.total)}
                </span>
                <span>{hasActiveFilters ? ui.filteredResults : ui.allProducts}</span>
              </div>
              <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${gridCols === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
                {mixedProducts.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
              {products.length === 0 && <div className="mt-10 text-center text-slate-600">{ui.noProducts}</div>}

              {loadingMore && <div className="mt-8 text-center text-slate-600">{ui.loadingMore}</div>}
              <div ref={loadMoreRef} className="h-1" />
            </>
          )}
        </div>
      </main>
      </div>
    </Container>
  );
}
