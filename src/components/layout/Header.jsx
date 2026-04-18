import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CatalogAPI } from "../../api/catalog";
import { STORE_NAME, STORE_SHIPPING_FEE } from "../../config/store";
import { formatMoney } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";

const MAX_TOP_CATEGORIES = 10;

const headerMessages = {
  fr: {
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    homeAria: "Accueil boutique",
    home: "Accueil",
    allRange: "Toute notre gamme",
    contact: "Contactez-nous",
    about: "A propos",
    searchPlaceholder: "Rechercher une creme, un serum, un ecran solaire...",
    adminPanel: "Panneau admin",
    myAccount: "Mon compte",
    myOrders: "Mes commandes",
    logout: "Deconnexion",
    login: "Connexion",
    openCart: "Ouvrir le panier",
    cartEmpty: "Votre panier est vide.",
    continueShopping: "Continuer vos achats",
    subtotal: "Sous-total",
    shipping: "Livraison",
    total: "Total",
    topCategories: "Rayons principaux",
    subcategories: "Sous-categories",
    brands: "Marques",
    noSubcategories: "Aucune sous-categorie disponible pour cette categorie.",
    noBrands: "Aucune marque disponible pour cette categorie.",
    searchProducts: "Rechercher des produits",
    closeMobileMenu: "Fermer le menu mobile",
    accountFallback: "Compte",
    logoutSuccess: "Deconnexion reussie.",
    productFallback: "Produit",
    noImage: "Aucune image",
  },
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    homeAria: "Store home",
    home: "Home",
    allRange: "Shop all",
    contact: "Contact us",
    about: "About us",
    searchPlaceholder: "Search cream, serum, sunscreen...",
    adminPanel: "Admin panel",
    myAccount: "My account",
    myOrders: "My orders",
    logout: "Logout",
    login: "Login",
    openCart: "Open cart",
    cartEmpty: "Your cart is empty.",
    continueShopping: "Continue shopping",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    topCategories: "Top categories",
    subcategories: "Subcategories",
    brands: "Brands",
    noSubcategories: "No subcategories available for this category.",
    noBrands: "No brands available for this category.",
    searchProducts: "Search products",
    closeMobileMenu: "Close mobile menu",
    accountFallback: "Account",
    logoutSuccess: "Logged out successfully.",
    productFallback: "Product",
    noImage: "No image",
  },
  ar: {
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    homeAria: "العودة إلى الرئيسية",
    home: "الرئيسية",
    allRange: "كل المنتجات",
    contact: "اتصل بنا",
    about: "من نحن",
    searchPlaceholder: "ابحث عن كريم، سيروم، واقي شمس...",
    adminPanel: "لوحة الإدارة",
    myAccount: "حسابي",
    myOrders: "طلباتي",
    logout: "تسجيل الخروج",
    login: "تسجيل الدخول",
    openCart: "فتح السلة",
    cartEmpty: "سلتك فارغة.",
    continueShopping: "متابعة التسوق",
    subtotal: "المجموع الفرعي",
    shipping: "التوصيل",
    total: "الإجمالي",
    topCategories: "الفئات الرئيسية",
    brands: "العلامات التجارية",
    noBrands: "لا توجد علامات تجارية لهذه الفئة.",
    searchProducts: "ابحث عن المنتجات",
    closeMobileMenu: "إغلاق قائمة الجوال",
    accountFallback: "الحساب",
    logoutSuccess: "تم تسجيل الخروج بنجاح.",
    productFallback: "منتج",
    noImage: "لا صورة",
  },
};

function canShowCartPreview() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches;
}

function getProductImage(item) {
  const product = item.variant?.product;
  const mainImage = product?.images?.find((image) => image.is_main)?.image_path;
  return resolveMediaUrl(mainImage || product?.images?.[0]?.image_path);
}

export default function Header() {
  const headerRef = useRef(null);
  const cartHoverTimeoutRef = useRef(null);
  const nav = useNavigate();
  const { pick } = useI18n();
  const { items, total, setOpen } = useCart();
  const { user, logout } = useAuth();
  const { success } = useToast();
  const ui = { ...headerMessages.en, ...pick(headerMessages) };

  const [q, setQ] = useState("");
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [mobileCategoryId, setMobileCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [brandsByCategory, setBrandsByCategory] = useState({});

  useEffect(() => {
    let active = true;

    CatalogAPI.categories()
      .then((data) => {
        if (!active) return;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => {
      active = false;
      if (cartHoverTimeoutRef.current) {
        clearTimeout(cartHoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const originalOverflow = document.body.style.overflow;
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const handlePointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const topCategories = useMemo(
    () => categories.filter((category) => !category.parent_id).slice(0, MAX_TOP_CATEGORIES),
    [categories]
  );

  useEffect(() => {
    const firstId = topCategories[0]?.id ? String(topCategories[0].id) : "";
    setActiveCategoryId((current) =>
      current && topCategories.some((category) => String(category.id) === current) ? current : firstId
    );
    setMobileCategoryId((current) =>
      current && topCategories.some((category) => String(category.id) === current) ? current : firstId
    );
  }, [topCategories]);

  const activeCategory = useMemo(
    () => topCategories.find((category) => String(category.id) === activeCategoryId) || topCategories[0] || null,
    [activeCategoryId, topCategories]
  );

  const mobileCategory = useMemo(
    () => topCategories.find((category) => String(category.id) === mobileCategoryId) || topCategories[0] || null,
    [mobileCategoryId, topCategories]
  );

  useEffect(() => {
    const categoryIds = [activeCategory?.id, mobileCategory?.id]
      .filter(Boolean)
      .map((id) => String(id));

    categoryIds.forEach((categoryId) => {
      if (brandsByCategory[categoryId]) return;

      CatalogAPI.brands({ category_id: categoryId })
        .then((data) => {
          setBrandsByCategory((current) => ({
            ...current,
            [categoryId]: Array.isArray(data) ? data : [],
          }));
        })
        .catch(() => {
          setBrandsByCategory((current) => ({
            ...current,
            [categoryId]: [],
          }));
        });
    });
  }, [activeCategory?.id, brandsByCategory, mobileCategory?.id]);

  const activeBrands = brandsByCategory[String(activeCategory?.id || "")] || [];
  const mobileBrands = brandsByCategory[String(mobileCategory?.id || "")] || [];
  const activeSubcategories = Array.isArray(activeCategory?.children) ? activeCategory.children : [];
  const mobileSubcategories = Array.isArray(mobileCategory?.children) ? mobileCategory.children : [];

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );
  const shipping = items.length > 0 ? STORE_SHIPPING_FEE : 0;
  const grandTotal = total + shipping;
  const previewItems = useMemo(() => items.slice(0, 2), [items]);

  const closeCartPreview = () => {
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
      cartHoverTimeoutRef.current = null;
    }
    setCartPreviewOpen(false);
  };

  const closeNavigation = () => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const goSearch = () => {
    const query = q.trim();
    nav(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
    closeNavigation();
    closeCartPreview();
  };

  const goByCategory = (categoryId) => {
    nav(`/products?category_id=${categoryId}`);
    closeNavigation();
    closeCartPreview();
  };

  const goByBrand = (brandId, categoryId = "") => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category_id", String(categoryId));
    if (brandId) params.set("brand_id", String(brandId));

    nav(`/products?${params.toString()}`);
    closeNavigation();
    closeCartPreview();
  };

  const handleLogout = async () => {
    await logout();
    closeNavigation();
    closeCartPreview();
    success(ui.logoutSuccess);
  };

  const isAdminUser = String(user?.role || "").toLowerCase() === "admin";
  const accountLabel = user?.name?.trim()?.split(/\s+/)?.[0] || ui.accountFallback;
  const accountInitials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("")
    : "AC";

  const openCartPreview = () => {
    if (!canShowCartPreview()) return;
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
      cartHoverTimeoutRef.current = null;
    }
    setMegaMenuOpen(false);
    setCartPreviewOpen(true);
  };

  const scheduleCartPreviewClose = () => {
    if (!canShowCartPreview()) return;
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
    }
    cartHoverTimeoutRef.current = setTimeout(() => {
      setCartPreviewOpen(false);
    }, 120);
  };

  const handleCartButtonClick = () => {
    setMobileMenuOpen(false);
    if (canShowCartPreview()) {
      closeCartPreview();
      nav("/cart");
      return;
    }
    setOpen(true);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-white/20 bg-white backdrop-blur-xl shadow-sm"
      onMouseLeave={() => {
        setMegaMenuOpen(false);
        closeCartPreview();
      }}
    >
      <div className="mx-auto flex h-[70px] w-full max-w-[1480px] min-w-0 items-center gap-1.5 px-2.5 md:h-[74px] md:gap-2.5 md:px-4">
        <button
          type="button"
          onClick={() => {
            setMegaMenuOpen(false);
            closeCartPreview();
            setMobileMenuOpen((current) => !current);
          }}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#bfdbfe] bg-white/92 text-[#111827] transition-all hover:-translate-y-0.5 hover:bg-[#eff6ff] hover:shadow-[0_10px_24px_rgba(59,130,246, 0.12)] md:h-11 md:w-11 md:hidden"
          aria-label={mobileMenuOpen ? ui.closeMenu : ui.openMenu}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link
          to="/"
          className="min-w-0 flex-1 transition-all hover:scale-[1.01] md:flex-none md:hover:scale-105"
          aria-label={`${ui.homeAria} ${STORE_NAME}`}
        >
          <span className="flex w-full min-w-0 flex-col justify-center rounded-[20px] border border-slate-200 bg-white px-3 py-2 shadow-sm md:min-w-[168px] md:rounded-[22px] md:px-5 md:py-2.5">
            <span className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 md:text-[10px] md:tracking-[0.34em]">Parapharmacie Maroc</span>
            <span className="mt-1 truncate text-[12px] font-black uppercase tracking-[0.12em] text-[#03045e] md:text-base md:tracking-[0.24em]">
              {STORE_NAME}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-6 md:flex lg:gap-7">
          <Link to="/" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#16a34a] transition-all hover:scale-105 hover:text-[#15803d]">
            {ui.home}
          </Link>
          <button
            type="button"
            onMouseEnter={() => {
              closeCartPreview();
              setAccountMenuOpen(false);
              setMegaMenuOpen(true);
            }}
            onFocus={() => {
              closeCartPreview();
              setAccountMenuOpen(false);
              setMegaMenuOpen(true);
            }}
            onClick={() => setMegaMenuOpen((current) => !current)}
            className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all hover:scale-105 ${
              megaMenuOpen 
                ? "text-[#16a34a]" 
                : "text-[#4b5563] hover:text-[#15803d]"
            }`}
          >
            {ui.allRange}
            <ChevronDown size={17} className={`transition-transform ${megaMenuOpen ? "rotate-180" : "rotate-0"}`} />
          </button>
          <Link to="/info/contact" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b4ca0] transition-all hover:scale-105 hover:text-[#16a34a]">
            {ui.contact}
          </Link>
          <Link to="/info/about-artstore" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b4ca0] transition-all hover:scale-105 hover:text-[#16a34a]">
            {ui.about}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <div className="relative hidden w-[230px] lg:block xl:w-[315px]">
            <input
              type="text"
              placeholder={ui.searchPlaceholder}
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && goSearch()}
              className="h-11 w-full rounded-full border border-[#e2d8f6] bg-white/92 pl-5 pr-12 text-sm text-[#16a34a] shadow-[0_10px_28px_rgba(59,130,246, 0.12)] placeholder:text-[#d28bb4] focus:outline-none focus:ring-2 focus:ring-[#ead6fa] focus:border-[#dcbaf4] transition-all"
            />
            <button
              type="button"
              onClick={goSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#60a5fa] transition-all hover:bg-[#eff6ff]"
              aria-label={ui.searchProducts}
            >
              <Search size={18} />
            </button>
          </div>

          {user ? (
            <>
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => {
                    setMegaMenuOpen(false);
                    closeCartPreview();
                    setAccountMenuOpen((current) => !current);
                  }}
                  className="inline-flex h-10 items-center gap-3 rounded-full border border-[#e8dcf8] bg-white/92 pl-2 pr-4 text-sm font-semibold text-[#111827] transition-all hover:-translate-y-0.5 hover:bg-[#faf4ff] hover:shadow-[0_12px_24px_rgba(59,130,246, 0.12)]"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b5cf6_0%,#60a5fa_100%)] text-xs font-bold text-white shadow-[0_10px_20px_rgba(139,92,246,0.28)]">
                    {accountInitials}
                  </span>
                  <span className="max-w-[110px] truncate">{accountLabel}</span>
                  <ChevronDown size={16} className={`transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {accountMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-[220px] rounded-[24px] border border-[#bfdbfe] bg-[rgba(255,255,255,0.97)] p-2 shadow-[0_20px_40px_rgba(59,130,246, 0.12)] backdrop-blur-xl">
                    <div className="border-b border-[#f0e7f8] px-3 py-2">
                      <div className="text-sm font-bold text-[#111827]">{user.name}</div>
                      <div className="mt-1 truncate text-xs text-[#ae9ac9]">{user.email}</div>
                    </div>

                    <div className="mt-2 grid gap-1">
                      {isAdminUser ? (
                        <>
                          <Link
                            to="/"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#111827] transition-all hover:bg-[#eff6ff]"
                          >
                            {ui.home}
                          </Link>
                          <Link
                            to="/admin"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#111827] transition-all hover:bg-[#eff6ff]"
                          >
                            {ui.adminPanel}
                          </Link>
                          <Link
                            to="/my-account"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#111827] transition-all hover:bg-[#eff6ff]"
                          >
                            {ui.myAccount}
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#111827] transition-all hover:bg-[#eff6ff]"
                          >
                            {ui.myOrders}
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/my-account"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#111827] transition-all hover:bg-[#eff6ff]"
                          >
                            {ui.myAccount}
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#111827] transition-all hover:bg-[#eff6ff]"
                          >
                            {ui.myOrders}
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#d14a7d] transition-all hover:bg-[#eff6ff]"
                      >
                        {ui.logout}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link to="/login" className="hidden rounded-full border border-[#dddff2] bg-white/92 px-5 py-2 text-sm font-semibold text-[#16a34a] transition-all hover:-translate-y-0.5 hover:bg-[#f7f3ff] hover:shadow-[0_12px_24px_rgba(59,130,246, 0.12)] lg:inline-flex">
              {ui.login}
            </Link>
          )}

          <div className="relative" onMouseEnter={openCartPreview} onMouseLeave={scheduleCartPreviewClose}>
            <button
              onClick={handleCartButtonClick}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dddff2] bg-white/92 text-[#16a34a] transition-all hover:-translate-y-0.5 hover:bg-[#f7f3ff] hover:shadow-[0_12px_24px_rgba(59,130,246, 0.12)]"
              aria-label={ui.openCart}
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#60a5fa] px-1 text-xs font-bold text-white shadow-[0_10px_18px_rgba(255,95,160,0.28)]">
                  {itemCount}
                </span>
              )}
            </button>

            {cartPreviewOpen && canShowCartPreview() && (
              <div className="absolute right-2 top-[calc(100%+12px)] w-[286px] max-w-[calc(100vw-40px)] rounded-[22px] border border-[#bfdbfe] bg-[rgba(255,255,255,0.97)] p-3 shadow-[0_24px_50px_rgba(59,130,246, 0.12)] backdrop-blur-xl">
                {items.length === 0 ? (
                  <div className="rounded-[18px] bg-[#fffafd] px-4 py-5 text-center shadow-[0_14px_26px_rgba(59,130,246, 0.12)] backdrop-blur">
                    <p className="text-sm text-[#7c6aa8]">{ui.cartEmpty}</p>
                    <Link to="/products" onClick={closeCartPreview} className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#16a34a] px-4 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_14px_28px_rgba(59,130,246, 0.12)] transition-all hover:bg-[#15803d]">
                      {ui.continueShopping}
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {previewItems.map((item) => {
                        const image = getProductImage(item);
                        return (
                          <div key={item.id} className="flex gap-2.5 rounded-[18px] bg-[#fffafd] p-2.5 shadow-[0_12px_24px_rgba(59,130,246, 0.12)] backdrop-blur">
                            <div className="ml-1 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#f9f1ff]">
                              {image ? (
                                <img src={image} alt={item.variant?.product?.name || ui.productFallback} className="h-full w-full object-contain p-1" />
                              ) : (
                                <div className="text-xs font-medium text-[#ae9ac9]">{ui.noImage || "No image"}</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 pr-1">
                              <p className="text-[11px] font-semibold uppercase leading-5 tracking-[0.12em] text-[#111827]">{item.variant?.product?.name || ui.productFallback}</p>
                              <p className="mt-1 text-[12px] font-semibold text-[#16a34a]">{formatMoney(item.unit_price)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="my-3.5 h-px bg-[#f0e7f8]" />
                    <div className="space-y-2 text-[14px] text-[#7c6aa8]">
                      <div className="flex items-center justify-between gap-3">
                        <span>{ui.subtotal}</span>
                        <span className="font-semibold text-[#111827]">{formatMoney(total)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>{ui.shipping}</span>
                        <span className="font-semibold text-[#111827]">{formatMoney(shipping)}</span>
                      </div>
                    </div>
                    <div className="my-3.5 h-px bg-[#f0e7f8]" />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[16px] text-[#111827]">{ui.total}</span>
                      <span className="text-[1.55rem] font-semibold leading-none text-[#16a34a]">{formatMoney(grandTotal)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {megaMenuOpen && (
        <div className="absolute left-1/2 top-[88px] z-50 hidden w-[min(96vw,1220px)] -translate-x-1/2 rounded-[30px] border border-[#bfdbfe] bg-[rgba(255,255,255,0.97)] shadow-[0_30px_60px_rgba(59,130,246, 0.12)] backdrop-blur-xl md:block">
          <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(220px,0.85fr)_minmax(260px,0.9fr)_minmax(360px,1fr)] lg:px-7">
            <section>
              <div className="border-b border-[#f0e7f8] pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                {ui.topCategories}
              </div>
              <div className="mt-4 space-y-1">
                {topCategories.map((category) => {
                  const isActive = String(category.id) === String(activeCategory?.id || "");
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onMouseEnter={() => setActiveCategoryId(String(category.id))}
                      onFocus={() => setActiveCategoryId(String(category.id))}
                      onClick={() => goByCategory(category.id)}
                      className={`flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-[15px] font-semibold transition-all ${
                        isActive 
                          ? "bg-[#eff6ff] text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)]" 
                          : "text-[#7c6aa8] hover:bg-[#fffafd] hover:text-[#111827]"
                      }`}
                    >
                      <span>{category.name}</span>
                      <ChevronRight size={15} className={isActive ? "text-[#111827]" : "text-[#b39dce]"} />
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="border-b border-[#f0e7f8] pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                {ui.subcategories}
              </div>
              <div className="mt-4 grid gap-2">
                {activeSubcategories.length > 0 ? (
                  activeSubcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      type="button"
                      onClick={() => goByCategory(subcategory.id)}
                      className="flex w-full items-center justify-between rounded-[16px] px-4 py-3 text-left text-sm font-semibold text-[#111827] transition-all hover:scale-[1.01] hover:bg-[#eff6ff]"
                    >
                      <span className="min-w-0 pr-3">{subcategory.name}</span>
                      <ChevronRight size={15} className="shrink-0 text-[#b39dce]" />
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-[#bfdbfe] bg-[#fffafd] px-4 py-5 text-sm text-[#ae9ac9]">
                    {ui.noSubcategories}
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="border-b border-[#f0e7f8] pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                {ui.brands}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
                {activeBrands.length > 0 ? (
                  activeBrands.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => goByBrand(brand.id, activeCategory?.id)}
                      className="block w-full rounded-[16px] px-4 py-3 text-left text-sm font-semibold text-[#111827] transition-all hover:scale-[1.02] hover:bg-[#eff6ff]"
                    >
                      {brand.name}
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 rounded-2xl border-2 border-dashed border-[#bfdbfe] bg-[#fffafd] px-4 py-5 text-sm text-[#ae9ac9]">
                    {ui.noBrands}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[70px] z-40 bg-[#16a34a]/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={ui.closeMobileMenu}
          />

          <div className="absolute inset-x-0 top-full z-[60] md:hidden">
            <div className="max-h-[calc(100vh-70px)] overflow-y-auto border-t border-[#bfdbfe] bg-[rgba(255,255,255,0.99)] shadow-[0_24px_50px_rgba(59,130,246, 0.12)] backdrop-blur-xl">
              <div className="sticky top-0 z-10 border-b border-[#f0e7f8] bg-[rgba(255,255,255,0.98)] px-4 pb-4 pt-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  goSearch();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={ui.searchPlaceholder}
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  className="h-11 w-full rounded-full border border-[#e2d8f6] bg-white pl-4 pr-4 text-sm text-[#16a34a] placeholder:text-[#d28bb4] focus:outline-none focus:ring-2 focus:ring-[#ead6fa] focus:border-[#dcbaf4] shadow-[0_10px_28px_rgba(59,130,246, 0.12)] transition-all"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e2d8f6] bg-white text-[#60a5fa] transition-all hover:bg-[#eff6ff]"
                  aria-label={ui.searchProducts}
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

              <div className="px-4 pb-8 pt-4">
                <div className="grid gap-2">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="rounded-[18px] border border-[#bfdbfe] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#16a34a] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all">
                    {ui.home}
                  </Link>
                  <Link to="/info/contact" onClick={() => setMobileMenuOpen(false)} className="rounded-[18px] border border-[#bfdbfe] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all hover:text-[#16a34a]">
                    {ui.contact}
                  </Link>
                  <Link to="/info/about-artstore" onClick={() => setMobileMenuOpen(false)} className="rounded-[18px] border border-[#bfdbfe] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all hover:text-[#16a34a]">
                    {ui.about}
                  </Link>
                </div>

                <div className="mt-6 rounded-[28px] bg-[#fffafd] p-4 shadow-[0_16px_34px_rgba(59,130,246, 0.12)] backdrop-blur">
                  <div className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#16a34a]">{ui.allRange}</div>
                  <div className="grid gap-2">
                    {topCategories.map((category) => {
                      const isActive = String(category.id) === String(mobileCategory?.id || "");
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setMobileCategoryId(String(category.id))}
                          className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                            isActive 
                              ? "bg-white text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)]" 
                              : "text-[#7c6aa8] hover:bg-white hover:text-[#111827]"
                          }`}
                        >
                          <span className="min-w-0 pr-3">{category.name}</span>
                          <ChevronRight size={16} className={`shrink-0 ${isActive ? "text-[#111827]" : "text-[#b39dce]"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#16a34a]">
                    {ui.subcategories}
                  </div>
                  <div className="grid gap-2">
                    {mobileSubcategories.length > 0 ? (
                      mobileSubcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          type="button"
                          onClick={() => goByCategory(subcategory.id)}
                          className="rounded-2xl border border-[#bfdbfe] px-4 py-3 text-left text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all hover:bg-[#eff6ff]"
                        >
                          {subcategory.name}
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-[#bfdbfe] bg-[#fffafd] px-4 py-4 text-sm text-[#ae9ac9] shadow-[0_10px_24px_rgba(59,130,246, 0.12)]">
                        {ui.noSubcategories}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#16a34a]">
                    {ui.brands}
                  </div>
                  <div className="grid gap-2">
                    {mobileBrands.length > 0 ? (
                      mobileBrands.map((brand) => (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => goByBrand(brand.id, mobileCategory?.id)}
                          className="rounded-2xl border border-[#bfdbfe] px-4 py-3 text-left text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all hover:bg-[#eff6ff]"
                        >
                          {brand.name}
                        </button>
                      ))
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-[#bfdbfe] bg-[#fffafd] px-4 py-4 text-sm text-[#ae9ac9] shadow-[0_10px_24px_rgba(59,130,246, 0.12)]">
                        {ui.noBrands}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-2">
                  <div className="flex justify-center">
                    <LanguageSwitcher compact />
                  </div>
                  {user ? (
                    <>
                      {String(user?.role || "").toLowerCase() === "admin" && (
                        <>
                          <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#bfdbfe] px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all"
                          >
                            {ui.home}
                          </Link>
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#bfdbfe] px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all"
                          >
                            {ui.adminPanel}
                          </Link>
                          <Link
                            to="/my-account"
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#bfdbfe] px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all"
                          >
                            {ui.myAccount}
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#bfdbfe] px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all"
                          >
                            {ui.myOrders}
                          </Link>
                        </>
                      )}
                      {String(user?.role || "").toLowerCase() !== "admin" && (
                        <>
                          <Link
                            to="/my-account"
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#bfdbfe] px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all"
                          >
                            {ui.myAccount}
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#bfdbfe] px-4 text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all"
                          >
                            {ui.myOrders}
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#f2d3e2] px-4 text-sm font-semibold text-[#d14a7d] shadow-[0_10px_24px_rgba(209,74,125,0.08)] transition-all hover:bg-[#eff6ff]"
                      >
                        {ui.logout}
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#dddff2] px-4 text-sm font-semibold text-[#16a34a] shadow-[0_10px_24px_rgba(59,130,246, 0.12)] transition-all"
                    >
                      {ui.login}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
