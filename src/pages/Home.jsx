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
import { resolveMediaUrl } from "../utils/media";

function getProductImage(product) {
  const fromApi = resolveMediaUrl(
    product?.images?.find((image) => image.is_main)?.image_path ||
      product?.images?.[0]?.image_path ||
      ""
  );
  return fromApi || "";
}

function shortText(value, limit = 180) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 3))}...`;
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

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    Promise.all([
      CatalogAPI.products({ per_page: 36 }),
      CatalogAPI.categories(),
      CatalogAPI.brands(),
      CatalogAPI.reviews(),
    ])
      .then(([productsData, categoriesData, brandsData, reviewsData]) => {
        if (!alive) return;
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
        setCategories([]);
        setBrands([]);
        setReviews([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

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
        categoryId: product?.category_id || null,
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

  const mixedImageQueue = useMemo(() => {
    if (!imagePool.length) return [];

    const byBrand = new Map();
    imagePool.forEach((item) => {
      const key = String(item?.brandName || "unknown");
      if (!byBrand.has(key)) byBrand.set(key, []);
      byBrand.get(key).push(item);
    });

    const buckets = Array.from(byBrand.values()).map((bucket) =>
      [...bucket].sort(() => Math.random() - 0.5)
    );
    buckets.sort((a, b) => b.length - a.length);

    const mixed = [];
    while (buckets.some((bucket) => bucket.length > 0)) {
      for (const bucket of buckets) {
        if (bucket.length > 0) mixed.push(bucket.shift());
      }
    }
    return mixed;
  }, [imagePool]);

  const heroSlides = useMemo(() => {
    const source = products.slice(0, 2);
    if (source.length === 0) {
      return [
        {
          id: "fallback-1",
          eyebrow: "CONTENTS",
          title: "Adwart News",
          subtitle: "A refined place for drawing, gifting and studio practice.",
          description:
            "Browse the latest arrivals from your live catalog data.",
          image: firstCatalogImage,
          bg: "from-neutral-100 to-neutral-100",
          accent: "text-neutral-900",
        },
      ];
    }

    return source.map((product) => ({
      id: product.id,
      eyebrow: product?.category?.name?.toUpperCase() || "FEATURED",
      title: product?.name || "Studio Selection",
      subtitle: product?.brand?.name
        ? `By ${product.brand.name}`
        : "Thoughtful tools for artists",
      description:
        shortText(product?.description, 170) ||
        "Carefully selected materials from your real catalog products and categories.",
      image: getProductImage(product) || firstCatalogImage,
      bg: "from-neutral-100 to-neutral-100",
      accent: "text-neutral-900",
    }));
  }, [products, firstCatalogImage]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const categoryCards = useMemo(() => {
    const visible = categories.slice(0, 7);
    const queue = mixedImageQueue.length ? mixedImageQueue : imagePool;
    const mapped = visible.map((category, index) => {
      const queueImage = queue[(index + 1) % Math.max(1, queue.length)]?.image || firstCatalogImage;
      return {
        id: category.id,
        name: category.name || `Category ${index + 1}`,
        image: queueImage,
        href: `/products?category_id=${category.id}`,
      };
    });

    const allImage = queue[0]?.image || firstCatalogImage;

    return [
      {
        id: "all-categories",
        name: "All",
        image: allImage,
        href: "/products",
      },
      ...mapped,
    ].slice(0, 8);
  }, [categories, imagePool, mixedImageQueue, firstCatalogImage]);

  const giftProducts = useMemo(() => {
    const keywordRegex = /(gift|set|kit|box|card|bag|tote|bundle|voucher)/i;
    const selected = [];
    const seen = new Set();

    for (const product of products) {
      const haystack = `${product?.name || ""} ${product?.description || ""} ${product?.category?.name || ""}`;
      if (keywordRegex.test(haystack)) {
        selected.push(product);
        seen.add(product.id);
      }
      if (selected.length >= 4) break;
    }

    for (const product of products) {
      if (selected.length >= 4) break;
      if (seen.has(product.id)) continue;
      selected.push(product);
    }

    return selected;
  }, [products]);

  const newProducts = useMemo(() => products.slice(0, 6), [products]);
  const highlightReview = useMemo(() => reviews[0] || null, [reviews]);
  const highlightImage = useMemo(
    () => getProductImage(highlightReview?.product) || firstCatalogImage,
    [highlightReview, firstCatalogImage]
  );

  const storyCards = useMemo(() => {
    const top = reviews.slice(0, 3).map((review) => ({
      id: review.id,
      title: `${review?.user?.name || "Customer"} x ${review?.product?.name || "Adwart"}`,
      description:
        shortText(review?.comment, 140) ||
        "Verified customer feedback from your store.",
      rating: Number(review?.rating) || 0,
    }));
    if (top.length) return top;

    return products.slice(0, 3).map((product) => ({
      id: `product-${product.id}`,
      title: product?.name || "Adwart Product",
      description: shortText(product?.description, 140) || "Latest product from your catalog.",
      rating: 0,
    }));
  }, [reviews, products]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentSlide = heroSlides[Math.min(heroIndex, Math.max(0, heroSlides.length - 1))];

  return (
    <div className="min-h-screen bg-neutral-50 pb-14 text-neutral-900">
      <main>
        <section className="pt-7 md:pt-9">
          <Container>
            <Reveal className="overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.05)]">
              <div className="grid min-h-[620px] lg:grid-cols-2">
                <div className={`bg-gradient-to-br ${currentSlide?.bg || "from-neutral-100 to-neutral-100"} p-8 md:p-12 lg:p-16`}>
                  <div
                    key={`hero-copy-${currentSlide?.id || "fallback"}`}
                    className="animate-in fade-in slide-in-from-left-8 duration-700"
                  >
                    <p className={`mb-6 text-xs uppercase tracking-[0.35em] ${currentSlide?.accent || "text-neutral-900"}`}>
                      {currentSlide?.eyebrow || "FEATURED"}
                    </p>
                    <h1 className="mb-6 text-4xl font-semibold leading-[0.95] tracking-tight text-neutral-900 md:text-6xl">
                      {currentSlide?.title || "Adwart Selection"}
                    </h1>
                    <p className="mb-4 text-lg leading-relaxed text-neutral-900 md:text-2xl">{currentSlide?.subtitle}</p>
                    <p className="mb-10 max-w-lg text-base leading-8 text-neutral-600 md:text-lg">{currentSlide?.description}</p>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                      >
                        Explore the collection
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/info/about-artstore"
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-white"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Read more
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
                            aria-label={`Go to hero slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="relative min-h-[340px] overflow-hidden bg-neutral-100">
                  {currentSlide?.image ? (
                    <img
                      key={`hero-image-${currentSlide?.id || "fallback"}`}
                      src={currentSlide?.image}
                      alt={currentSlide?.title || "Adwart"}
                      className="h-full w-full animate-in fade-in zoom-in-95 object-cover duration-700"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm font-medium text-neutral-500">
                      No image available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                  {heroSlides.length > 1 ? (
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <div className="rounded-full bg-white/88 px-5 py-3 text-sm font-medium text-neutral-900 backdrop-blur">
                        Live catalog showcase
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/88 backdrop-blur transition-colors hover:bg-white"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/88 backdrop-blur transition-colors hover:bg-white"
                          aria-label="Next slide"
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

        <section className="bg-neutral-50 py-20">
          <Container>
            <Reveal>
              <h2 className="mb-10 text-center text-4xl font-black tracking-tight text-neutral-900 md:text-6xl">
                Categories
              </h2>
            </Reveal>
            
             {/* className="d-flex justify-content-between flex-wrap" */}

            <div   className="grid gap-8 sm:grid-cols-4 xl:grid-cols-4 " >
              {loading &&
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={`cat-skeleton-${idx}`} className="h-[220px] animate-pulse rounded-md bg-neutral-200" />
                ))}
              {!loading &&
                categoryCards.map((category, index) => (
                  <Reveal key={category.id} delay={index * 85}>
                    <Link
                      to={category.href}
                      className="group block transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="overflow-hidden rounded-sm bg-white">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-[210px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-[210px] w-full items-center justify-center bg-neutral-200 text-sm font-medium text-neutral-500">
                            No image available
                          </div>
                        )}
                      </div>
                      <div className="px-2 pb-1 pt-5 text-center">
                        <h3 className="text-[30px] font-medium leading-tight text-neutral-900">{category.name}</h3>
                      </div>
                    </Link>
                  </Reveal>
                ))}
            </div>
          </Container>
        </section>

        <section className="pb-24">
          <Container>
            <Reveal>
              <SectionTitle eyebrow="GIFT SELECTION" title="Hornmark's Gift" action="View all products" to="/products?q=gift" />
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

        <section className="border-y border-black/5 bg-neutral-50 py-24">
          <Container>
            <Reveal>
              <SectionTitle eyebrow="NEW PRODUCTS" title="New Products" action="Browse newest arrivals" to="/products" />
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

        <section className="py-24">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              <Reveal className="relative overflow-hidden rounded-[34px] bg-neutral-900 p-10 text-white md:p-12">
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/60">BRANDS</p>
                <h2 className="mb-5 text-4xl font-semibold md:text-5xl">The World of Adwart</h2>
                <p className="max-w-2xl text-lg leading-8 text-white/80">
                  This block is generated from your real backend brands and product data to keep the landing alive and dynamic.
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
                  Read more
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full border border-white/15" />
                <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-white/10" />
              </Reveal>

              <Reveal delay={130} className="overflow-hidden rounded-[34px] border border-neutral-200 bg-white">
                {highlightImage ? (
                  <img
                    src={highlightImage}
                    alt={highlightReview?.product?.name || "Review highlight"}
                    className="h-[320px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[320px] w-full items-center justify-center bg-neutral-200 text-sm font-medium text-neutral-500">
                    No image available
                  </div>
                )}
                <div className="p-8">
                  <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-500">CUSTOMER STORY</p>
                  <h3 className="mb-3 text-2xl font-semibold text-neutral-900">
                    {highlightReview?.user?.name || "Verified customer"} on{" "}
                    {highlightReview?.product?.name || "our catalog"}
                  </h3>
                  <p className="leading-7 text-neutral-600">
                    {shortText(highlightReview?.comment, 220) || "Real review content from your backend reviews endpoint."}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="grid items-stretch gap-6 md:grid-cols-3">
              {storyCards.map((story, index) => (
                <Reveal key={story.id} delay={index * 90} className="h-full">
                  <div className="flex h-full flex-col rounded-[28px] border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-xl">
                    <p className="mb-4 text-xs uppercase tracking-[0.35em] text-neutral-500">Episode</p>
                    <h3 className="mb-4 text-2xl font-semibold text-neutral-900">{story.title}</h3>
                    <p className="mb-6 leading-7 text-neutral-600">{story.description}</p>
                    <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-neutral-900">
                      {story.rating > 0 ? `Rating: ${story.rating}/5` : "Read more"}
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
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}


