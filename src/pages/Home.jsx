import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import Container from "../components/layout/Container";
import ProductCard from "../components/product/ProductCard";
import { CatalogAPI } from "../api/catalog";
import { useI18n } from "../context/I18nContext";
import { resolveMediaUrl } from "../utils/media";
import allProductsCategoryImage from "../assets/categories/all product.jpeg";
import drawingCategoryImage from "../assets/categories/drawing.jpeg";
import fabricGlassCeramicsCategoryImage from "../assets/categories/fabric class.jpeg";
import mixedMediaCategoryImage from "../assets/categories/mixed media.jpeg";
import paintCategoryImage from "../assets/categories/paint.jpeg";
import paperStorageCategoryImage from "../assets/categories/paper storage.jpeg";
import sculptureClayCategoryImage from "../assets/categories/scuplture & clay.jpeg";

const CATEGORY_IMAGE_MATCHERS = [
  { image: drawingCategoryImage, matches: ["drawing", "color"] },
  { image: paintCategoryImage, matches: ["painting", "paint", "paints", "brushes"] },
  { image: sculptureClayCategoryImage, matches: ["sculpture", "clay", "studio"] },
  { image: mixedMediaCategoryImage, matches: ["mixed media", "collage"] },
  { image: fabricGlassCeramicsCategoryImage, matches: ["fabric", "glass", "ceramic"] },
  { image: paperStorageCategoryImage, matches: ["paper", "surface", "storage", "organization"] },
];

function normalizeCategoryName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getStaticCategoryImage(categoryName) {
  const normalizedName = normalizeCategoryName(categoryName);
  if (!normalizedName) return "";

  const match = CATEGORY_IMAGE_MATCHERS.find(({ matches }) =>
    matches.some((candidate) => normalizedName.includes(candidate))
  );

  return match?.image || "";
}

function getProductImage(product) {
  const fromApi = resolveMediaUrl(
    product?.images?.find((image) => image.is_main)?.image_path ||
      product?.images?.[0]?.image_path ||
      ""
  );
  return fromApi || "";
}

function getProductCategoryId(product) {
  return product?.category_id ?? product?.category?.id ?? null;
}

function shortText(value, limit = 180) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 3))}...`;
}

function uniqueProductsById(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const seen = new Set();
  const unique = [];

  items.forEach((item, index) => {
    const rawKey = item?.id;
    const key = rawKey == null ? `missing-id-${index}` : String(rawKey);
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(item);
  });

  return unique;
}

function interleaveByKey(items, getKey) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const groups = new Map();

  items.forEach((item, index) => {
    const rawKey = getKey(item, index);
    const key = String(rawKey || `group-${index}`);

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  const buckets = Array.from(groups.values());
  const mixed = [];

  while (buckets.some((bucket) => bucket.length > 0)) {
    for (const bucket of buckets) {
      if (bucket.length > 0) mixed.push(bucket.shift());
    }
  }

  return mixed;
}

function SectionTitle({ eyebrow, title, action, to = "/products" }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {title}
        </h2>
      </div>
      {action ? (
        <Link
          to={to}
          className="hidden items-center gap-2 text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600 md:inline-flex"
        >
          {action}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

function CategoryCard({ category, featured = false, delay = 0, className = "" }) {
  const { pick } = useI18n();
  const ui = pick({
    fr: { noImage: "Aucune image disponible", items: "{count} articles", explore: "Explorer la categorie" },
    en: { noImage: "No image available", items: "{count} items", explore: "Explore category" },
    ar: { noImage: "لا توجد صورة متاحة", items: "{count} منتجات", explore: "استكشف الفئة" },
  });
  const useCoverImage = featured || category.imageFit === "cover";

  return (
    <Reveal delay={delay} className={className}>
      <Link
        to={category.href}
        className="group block h-full transition-transform duration-300 hover:-translate-y-1.5"
      >
        <div
          className={`flex h-full flex-col overflow-hidden rounded-[28px] border shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)] ${
            featured
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-white/60 bg-white text-neutral-900"
          }`}
        >
          <div
            className={`relative overflow-hidden ${
              featured ? "bg-neutral-800" : "bg-neutral-100"
            }`}
          >
            {category.image ? (
              <div className="flex h-[230px] w-full items-center justify-center overflow-hidden">
                {useCoverImage ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${
                      featured ? "opacity-80" : ""
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <>
                    <img
                      src={category.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-110 object-cover opacity-12 blur-xl transition-transform duration-500 group-hover:scale-[1.15]"
                      loading="lazy"
                    />
                    <img
                      src={category.image}
                      alt={category.name}
                      className="relative h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="flex h-[230px] w-full items-center justify-center text-sm font-medium text-neutral-500">
                {ui.noImage}
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 via-black/0 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col justify-between px-5 pb-5 pt-4">
            <div>
              <div
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  featured ? "bg-white/12 text-white/80" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {ui.items.replace("{count}", category.count)}
              </div>
              <h3
                className={`mt-4 text-2xl font-semibold leading-tight ${
                  featured ? "text-white" : "text-neutral-900"
                }`}
              >
                {category.name}
              </h3>
            </div>

            <div
              className={`mt-8 inline-flex items-center gap-2 text-sm font-medium ${
                featured ? "text-white/85" : "text-neutral-700"
              }`}
            >
              {ui.explore}
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Home() {
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      fallbackEyebrow: "CONTENU",
      fallbackTitle: "Actualites Adwart",
      fallbackSubtitle: "Un espace raffine pour dessiner, offrir et creer.",
      fallbackDescription: "Parcourez les dernieres nouveautes de votre catalogue en direct.",
      featured: "A LA UNE",
      studioSelection: "Selection Atelier",
      by: "Par {brand}",
      thoughtfulTools: "Des outils bien choisis pour les artistes",
      curatedMaterials: "Materiaux soigneusement selectionnes depuis vos vraies donnees catalogue.",
      liveCatalog: "Catalogue en direct",
      noImage: "Aucune image disponible",
      exploreCollection: "Explorer la collection",
      readMore: "Lire plus",
      goToSlide: "Aller au slide {index}",
      previousSlide: "Slide precedente",
      nextSlide: "Slide suivante",
      shopByWorld: "ACHETER PAR UNIVERS",
      categories: "Categories",
      categoriesDescription: "Explorez le catalogue a travers des cartes categories plus editoriales et inspirees d'une galerie.",
      giftSelection: "SELECTION CADEAUX",
      giftsTitle: "Cadeaux Adwart",
      viewAllProducts: "Voir tous les produits",
      newProducts: "NOUVEAUX PRODUITS",
      newProductsTitle: "Nouveaux produits",
      browseNewest: "Voir les nouveautes",
      brands: "MARQUES",
      worldOfAdwart: "L'univers Adwart",
      brandsDescription: "Ce bloc est genere a partir des vraies marques et produits de votre backend pour garder la page d'accueil vivante et dynamique.",
      customerStory: "HISTOIRE CLIENT",
      verifiedCustomer: "Client verifie",
      onWord: "sur",
      ourCatalog: "notre catalogue",
      reviewFallback: "Contenu d'avis reel provenant de votre endpoint backend.",
      episode: "Episode",
      rating: "Note : {rating}/5",
      readMoreShort: "Lire plus",
      latestProduct: "Dernier produit de votre catalogue.",
      customer: "Client",
      scrollTop: "Remonter en haut",
      allProducts: "Tous les produits",
    },
    en: {
      fallbackEyebrow: "CONTENTS",
      fallbackTitle: "Adwart News",
      fallbackSubtitle: "A refined place for drawing, gifting and studio practice.",
      fallbackDescription: "Browse the latest arrivals from your live catalog data.",
      featured: "FEATURED",
      studioSelection: "Studio Selection",
      by: "By {brand}",
      thoughtfulTools: "Thoughtful tools for artists",
      curatedMaterials: "Carefully selected materials from your real catalog products and categories.",
      liveCatalog: "Live catalog showcase",
      noImage: "No image available",
      exploreCollection: "Explore the collection",
      readMore: "Read more",
      goToSlide: "Go to hero slide {index}",
      previousSlide: "Previous slide",
      nextSlide: "Next slide",
      shopByWorld: "SHOP BY WORLD",
      categories: "Categories",
      categoriesDescription: "Explore the catalog through curated category cards with a more editorial, gallery-inspired feel.",
      giftSelection: "GIFT SELECTION",
      giftsTitle: "Adwart Gifts",
      viewAllProducts: "View all products",
      newProducts: "NEW PRODUCTS",
      newProductsTitle: "New Products",
      browseNewest: "Browse newest arrivals",
      brands: "BRANDS",
      worldOfAdwart: "The World of Adwart",
      brandsDescription: "This block is generated from your real backend brands and product data to keep the landing alive and dynamic.",
      customerStory: "CUSTOMER STORY",
      verifiedCustomer: "Verified customer",
      onWord: "on",
      ourCatalog: "our catalog",
      reviewFallback: "Real review content from your backend reviews endpoint.",
      episode: "Episode",
      rating: "Rating: {rating}/5",
      readMoreShort: "Read more",
      latestProduct: "Latest product from your catalog.",
      customer: "Customer",
      scrollTop: "Scroll to top",
      allProducts: "All products",
    },
    ar: {
      fallbackEyebrow: "المحتوى",
      fallbackTitle: "أخبار Adwart",
      fallbackSubtitle: "مساحة راقية للرسم والهدايا والعمل داخل الاستوديو.",
      fallbackDescription: "تصفح أحدث الإضافات من بيانات الكتالوج المباشرة.",
      featured: "مميز",
      studioSelection: "اختيارات الاستوديو",
      by: "من {brand}",
      thoughtfulTools: "أدوات مختارة بعناية للفنانين",
      curatedMaterials: "مواد مختارة بعناية من منتجات وفئات الكتالوج الحقيقي لديك.",
      liveCatalog: "عرض مباشر للكتالوج",
      noImage: "لا توجد صورة متاحة",
      exploreCollection: "استكشف المجموعة",
      readMore: "اقرأ المزيد",
      goToSlide: "الانتقال إلى الشريحة {index}",
      previousSlide: "الشريحة السابقة",
      nextSlide: "الشريحة التالية",
      shopByWorld: "تسوق حسب العالم",
      categories: "الفئات",
      categoriesDescription: "استكشف الكتالوج عبر بطاقات فئات منسقة بطابع تحريري مستوحى من المعارض.",
      giftSelection: "اختيار الهدايا",
      giftsTitle: "هدايا Adwart",
      viewAllProducts: "عرض كل المنتجات",
      newProducts: "منتجات جديدة",
      newProductsTitle: "منتجات جديدة",
      browseNewest: "تصفح أحدث الإضافات",
      brands: "العلامات",
      worldOfAdwart: "عالم Adwart",
      brandsDescription: "هذا القسم يعتمد على العلامات والمنتجات الحقيقية من الخلفية ليبقي الصفحة الرئيسية حية ومتجددة.",
      customerStory: "قصة عميل",
      verifiedCustomer: "عميل موثّق",
      onWord: "على",
      ourCatalog: "الكتالوج",
      reviewFallback: "محتوى مراجعة حقيقي من نقطة مراجعات الخلفية.",
      episode: "حلقة",
      rating: "التقييم: {rating}/5",
      readMoreShort: "اقرأ المزيد",
      latestProduct: "أحدث منتج من الكتالوج الخاص بك.",
      customer: "عميل",
      scrollTop: "العودة إلى الأعلى",
      allProducts: "كل المنتجات",
    },
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categoryShowcase, setCategoryShowcase] = useState({});
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadHome = async () => {
      setLoading(true);

      try {
        const [productsData, categoriesData, brandsData, reviewsData] = await Promise.all([
          CatalogAPI.products({ per_page: 96 }),
          CatalogAPI.categories(),
          CatalogAPI.brands(),
          CatalogAPI.reviews(),
        ]);

        let nextProducts = Array.isArray(productsData) ? productsData : [];
        const nextBrands = Array.isArray(brandsData) ? brandsData : [];

        if (nextBrands.length > 1) {
          const brandIds = nextBrands
            .map((brand) => brand?.id)
            .filter((id) => id != null)
            .slice(0, 10);

          if (brandIds.length > 0) {
            const seedResults = await Promise.allSettled(
              brandIds.map((brandId) =>
                CatalogAPI.products({
                  brand_id: brandId,
                  per_page: 2,
                })
              )
            );

            const seededProducts = seedResults.flatMap((result) => {
              if (result.status !== "fulfilled") return [];
              return Array.isArray(result.value) ? result.value : [];
            });

            nextProducts = uniqueProductsById([...seededProducts, ...nextProducts]);
          }
        }

        if (!alive) return;

        setProducts(nextProducts);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(nextBrands);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch {
        if (!alive) return;
        setProducts([]);
        setCategories([]);
        setBrands([]);
        setReviews([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadHome();

    return () => {
      alive = false;
    };
  }, []);

  const imagePool = useMemo(() => {
    const seen = new Set();
    const pool = [];

    products.forEach((product, index) => {
      const image = getProductImage(product);
      if (!image || seen.has(image)) return;
      seen.add(image);
      pool.push({
        productId: product?.id || `fallback-${index}`,
        categoryId: getProductCategoryId(product),
        brandName: String(product?.brand?.name || "").trim(),
        productName: String(product?.name || "").trim(),
        image,
      });
    });

    return pool;
  }, [products]);

  const firstCatalogImage = useMemo(() => {
    return imagePool[0]?.image || "";
  }, [imagePool]);

  const mixedProducts = useMemo(() => {
    return interleaveByKey(products, (product) => {
      return product?.brand?.id || product?.brand_id || product?.brand?.name || "unknown";
    });
  }, [products]);

  const heroSlides = useMemo(() => {
    const source = mixedProducts.slice(0, 2);
    if (source.length === 0) {
      return [
        {
          id: "fallback-1",
          eyebrow: ui.fallbackEyebrow,
          title: ui.fallbackTitle,
          subtitle: ui.fallbackSubtitle,
          description: ui.fallbackDescription,
          image: firstCatalogImage,
          bg: "from-neutral-100 to-neutral-100",
          accent: "text-neutral-900",
        },
      ];
    }

    return source.map((product) => ({
      id: product.id,
      eyebrow: product?.category?.name?.toUpperCase() || ui.featured,
      title: product?.name || ui.studioSelection,
      subtitle: product?.brand?.name
        ? ui.by.replace("{brand}", product.brand.name)
        : ui.thoughtfulTools,
      description:
        shortText(product?.description, 170) ||
        ui.curatedMaterials,
      image: getProductImage(product) || firstCatalogImage,
      bg: "from-neutral-100 to-neutral-100",
      accent: "text-neutral-900",
    }));
  }, [
    firstCatalogImage,
    mixedProducts,
    ui.by,
    ui.curatedMaterials,
    ui.fallbackDescription,
    ui.fallbackEyebrow,
    ui.fallbackSubtitle,
    ui.fallbackTitle,
    ui.featured,
    ui.studioSelection,
    ui.thoughtfulTools,
  ]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    let active = true;

    const topLevelCategories = categories.filter((category) => !category?.parent_id);
    if (topLevelCategories.length === 0) {
      setCategoryShowcase({});
      return () => {
        active = false;
      };
    }

    const loadCategoryShowcase = async () => {
      try {
        const [allProductsPage, ...categoryPages] = await Promise.all([
          CatalogAPI.productsPage({ per_page: 1 }),
          ...topLevelCategories.map((category) =>
            CatalogAPI.productsPage({ category_id: category.id, per_page: 8 })
          ),
        ]);

        if (!active) return;

        const nextShowcase = {
          allProducts: {
            count: Number(allProductsPage?.total) || products.length,
            image:
              (Array.isArray(allProductsPage?.data)
                ? allProductsPage.data.map((product) => getProductImage(product)).find(Boolean)
                : null) || firstCatalogImage,
          },
        };

        topLevelCategories.forEach((category, index) => {
          const page = categoryPages[index];
          const items = Array.isArray(page?.data) ? page.data : [];
          const image = items.map((product) => getProductImage(product)).find(Boolean) || "";

          nextShowcase[String(category.id)] = {
            count: Number(page?.total) || 0,
            image,
          };
        });

        setCategoryShowcase(nextShowcase);
      } catch {
        if (!active) return;
        setCategoryShowcase({});
      }
    };

    loadCategoryShowcase();

    return () => {
      active = false;
    };
  }, [categories, firstCatalogImage, products.length]);

  const categoryCards = useMemo(() => {
    const topLevelCategories = categories.filter((category) => !category?.parent_id);
    const mapped = topLevelCategories.map((category, index) => {
      const showcase = categoryShowcase[String(category.id)] || {};
      const staticCategoryImage = getStaticCategoryImage(category.name);
      const categoryImage = staticCategoryImage || showcase.image || firstCatalogImage;

      return {
        id: category.id,
        name: category.name || `${ui.categories} ${index + 1}`,
        image: categoryImage,
        imageFit: staticCategoryImage ? "cover" : "contain",
        href: `/products?category_id=${category.id}`,
        count: Number(showcase.count) || 0,
      };
    });

    const allCount = Number(categoryShowcase.allProducts?.count) || products.length;

    return [
      {
        id: "all-categories",
        name: ui.allProducts,
        image: allProductsCategoryImage || categoryShowcase.allProducts?.image || firstCatalogImage,
        imageFit: "cover",
        href: "/products",
        count: allCount,
      },
      ...mapped,
    ];
  }, [categories, categoryShowcase, firstCatalogImage, products.length, ui.allProducts, ui.categories]);

  const [allProductsCard, ...standardCategoryCards] = categoryCards;

  const giftProducts = useMemo(() => {
    const keywordRegex = /(gift|set|kit|box|card|bag|tote|bundle|voucher)/i;
    const selected = [];
    const seen = new Set();

    for (const product of mixedProducts) {
      const haystack = `${product?.name || ""} ${product?.description || ""} ${product?.category?.name || ""}`;
      if (keywordRegex.test(haystack)) {
        selected.push(product);
        seen.add(product.id);
      }
      if (selected.length >= 4) break;
    }

    for (const product of mixedProducts) {
      if (selected.length >= 4) break;
      if (seen.has(product.id)) continue;
      selected.push(product);
    }

    return selected;
  }, [mixedProducts]);

  const newProducts = useMemo(() => mixedProducts.slice(0, 6), [mixedProducts]);
  const highlightReview = useMemo(() => reviews[0] || null, [reviews]);
  const highlightImage = useMemo(
    () => getProductImage(highlightReview?.product) || firstCatalogImage,
    [highlightReview, firstCatalogImage]
  );

  const storyCards = useMemo(() => {
    const top = reviews.slice(0, 3).map((review) => ({
      id: review.id,
      title: `${review?.user?.name || ui.customer} x ${review?.product?.name || "Adwart"}`,
      description:
        shortText(review?.comment, 140) ||
        ui.reviewFallback,
      rating: Number(review?.rating) || 0,
    }));
    if (top.length) return top;

    return products.slice(0, 3).map((product) => ({
      id: `product-${product.id}`,
      title: product?.name || "Adwart Product",
      description: shortText(product?.description, 140) || ui.latestProduct,
      rating: 0,
    }));
  }, [products, reviews, ui.customer, ui.latestProduct, ui.reviewFallback]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentSlide = heroSlides[Math.min(heroIndex, Math.max(0, heroSlides.length - 1))];

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-14 text-neutral-900">
      <main>
        <section className="pt-7 md:pt-9">
          <Container>
            <Reveal className="overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.05)]">
              <div className="grid min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] lg:grid-cols-2">
                <div className={`bg-gradient-to-br ${currentSlide?.bg || "from-neutral-100 to-neutral-100"} p-8 md:p-12 lg:p-16`}>
                  <div
                    key={`hero-copy-${currentSlide?.id || "fallback"}`}
                    className="animate-in fade-in slide-in-from-left-8 duration-700"
                  >
                    <p className={`mb-6 text-xs uppercase tracking-[0.35em] ${currentSlide?.accent || "text-neutral-900"}`}>
                      {currentSlide?.eyebrow || ui.featured}
                    </p>
                    <h1 className="mb-6 text-4xl font-semibold leading-[0.95] tracking-tight text-neutral-900 md:text-6xl">
                      {currentSlide?.title || ui.studioSelection}
                    </h1>
                    <p className="mb-4 text-lg leading-relaxed text-neutral-900 md:text-2xl">{currentSlide?.subtitle}</p>
                    <p className="mb-10 max-w-lg text-base leading-8 text-neutral-600 md:text-lg">{currentSlide?.description}</p>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                      >
                        {ui.exploreCollection}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/info/about-artstore"
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-white"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        {ui.readMore}
                      </Link>
                    </div>

                    {heroSlides.length > 1 ? (
                      <div className="mt-12 flex items-center gap-3">
                        {heroSlides.map((slide, index) => (
                          <button
                            key={slide.id}
                            type="button"
                            onClick={() => setHeroIndex(index)}
                            className={`h-2.5 rounded-full transition-all ${
                              heroIndex === index ? "w-10 bg-neutral-900" : "w-2.5 bg-neutral-400/60"
                            }`}
                            aria-label={ui.goToSlide.replace("{index}", index + 1)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="relative min-h-[260px] sm:min-h-[300px] lg:min-h-[340px] overflow-hidden bg-neutral-100">
                  {currentSlide?.image ? (
                    <img
                      key={`hero-image-${currentSlide?.id || "fallback"}`}
                      src={currentSlide?.image}
                      alt={currentSlide?.title || "Adwart"}
                      className="h-full w-full animate-in fade-in zoom-in-95 object-cover duration-700"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm font-medium text-neutral-500">
                      {ui.noImage}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                  {heroSlides.length > 1 ? (
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div className="rounded-full bg-white/88 px-5 py-3 text-sm font-medium text-neutral-900 backdrop-blur">
                        {ui.liveCatalog}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/88 backdrop-blur transition-colors hover:bg-white"
                          aria-label={ui.previousSlide}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/88 backdrop-blur transition-colors hover:bg-white"
                          aria-label={ui.nextSlide}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Reveal>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {"ADWART".split("").map((letter, idx) => (
                <div
                  key={idx}
                  style={{ animationDelay: `${120 + idx * 55}ms` }}
                  className="animate-in fade-in slide-in-from-bottom-4 rounded-[24px] border border-neutral-200 bg-white px-6 py-6 text-center shadow-sm duration-700"
                >
                  <span className="text-2xl font-semibold tracking-[0.35em] text-neutral-900 md:text-3xl">{letter}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-black/5 bg-[#fbfaf7] py-24">
          <Container>
            <Reveal>
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">
                    {ui.shopByWorld}
                  </p>
                  <h2 className="text-4xl font-black tracking-tight text-neutral-900 md:text-6xl">
                    {ui.categories}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-neutral-700 md:text-base">
                  {ui.categoriesDescription}
                </p>
              </div>
            </Reveal>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(260px,1.08fr)_repeat(3,minmax(0,1fr))]">
              {loading &&
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={`cat-skeleton-${idx}`} className="h-[320px] animate-pulse rounded-[28px] bg-neutral-200/80" />
                ))}
              {!loading && allProductsCard ? (
                <>
                  <CategoryCard
                    category={allProductsCard}
                    featured
                    delay={0}
                    className="self-start"
                  />
                  <div className="grid gap-6 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
                    {standardCategoryCards.map((category, index) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        delay={(index + 1) * 85}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </Container>
        </section>

        <section className="bg-[#fbfaf7] pb-24 pt-24">
          <Container>
            <Reveal>
              <SectionTitle eyebrow={ui.giftSelection} title={ui.giftsTitle} action={ui.viewAllProducts} to="/products?q=gift" />
            </Reveal>
            
            
            <div  className="grid gap-6 md:grid-cols-4 xl:grid-cols-4">
              {loading &&
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`gift-skeleton-${idx}`} className="h-[430px] animate-pulse rounded-[28px] border border-neutral-200 bg-neutral-200"/>
                ))}
              {!loading &&
                giftProducts.map((product, index) => (
                  <Reveal key={product.id} delay={index * 95}>
                    <ProductCard p={product} />
                  </Reveal>
                ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-black/5 bg-[#fbfaf7] py-24">
          <Container>
            <Reveal>
              <SectionTitle eyebrow={ui.newProducts} title={ui.newProductsTitle} action={ui.browseNewest} to="/products" />
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-3 xl:grid-cols-3">
              {loading &&
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={`new-skeleton-${idx}`} className="h-[430px] animate-pulse rounded-[28px] border border-neutral-200 bg-neutral-200" />
                ))}
              {!loading &&
                newProducts.map((product, index) => (
                  <Reveal key={product.id} delay={index * 85}>
                    <ProductCard p={product} />
                  </Reveal>
                ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#fbfaf7] py-24">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              <Reveal className="relative overflow-hidden rounded-[34px] bg-neutral-900 p-10 text-white md:p-12">
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/60">{ui.brands}</p>
                <h2 className="mb-5 text-4xl font-semibold md:text-5xl">{ui.worldOfAdwart}</h2>
                <p className="max-w-2xl text-lg leading-8 text-white/80">
                  {ui.brandsDescription}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {brands.slice(0, 6).map((brand) => (
                    <Link
                      key={brand.id}
                      to={`/products?brand_id=${brand.id}`}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
                <Link
                  to="/products"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                >
                  {ui.readMore}
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full border border-white/15" />
                <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-white/10" />
              </Reveal>

              <Reveal delay={130} className="overflow-hidden rounded-[34px] border border-neutral-200 bg-white">
                {highlightImage ? (
                  <div className="flex h-[320px] w-full items-center justify-center overflow-hidden bg-white">
                    <img
                      src={highlightImage}
                      alt={highlightReview?.product?.name || ui.customerStory}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                ) : (
                  <div className="flex h-[320px] w-full items-center justify-center bg-neutral-200 text-sm font-medium text-neutral-500">
                    {ui.noImage}
                  </div>
                )}
                <div className="p-8">
                  <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-500">{ui.customerStory}</p>
                  <h3 className="mb-3 text-2xl font-semibold text-neutral-900">
                    {highlightReview?.user?.name || ui.verifiedCustomer} {ui.onWord}{" "}
                    {highlightReview?.product?.name || ui.ourCatalog}
                  </h3>
                  <p className="leading-7 text-neutral-600">
                    {shortText(highlightReview?.comment, 220) || ui.reviewFallback}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="grid items-stretch gap-6 md:grid-cols-3">
              {storyCards.map((story, index) => (
                <Reveal key={story.id} delay={index * 90} className="h-full">
                  <div className="flex h-full flex-col rounded-[28px] border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-xl">
                    <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-500">{ui.episode}</p>
                    <h3 className="mb-4 text-2xl font-semibold text-neutral-900">{story.title}</h3>
                    <p className="mb-6 leading-7 text-neutral-600">{story.description}</p>
                    <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-neutral-900">
                      {story.rating > 0 ? ui.rating.replace("{rating}", story.rating) : ui.readMoreShort}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

      </main>

      {showScrollTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 animate-in zoom-in-95 items-center justify-center rounded-full bg-neutral-900 text-white shadow-xl transition-colors duration-300 hover:bg-neutral-800"
          aria-label={ui.scrollTop}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
