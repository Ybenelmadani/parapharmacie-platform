import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CatalogAPI } from "../../api/catalog";
import logoFinal from "../../assets/adwart3.png";
import { STORE_SHIPPING_FEE } from "../../config/store";
import { formatMoney } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";

const MAX_TOP_CATEGORIES = 8;

const headerMessages = {
  fr: {
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    homeAria: "Accueil Adwart",
    home: "Accueil",
    allRange: "Toute notre gamme",
    contact: "Contactez-nous",
    about: "A propos",
    searchPlaceholder: "Rechercher du materiel artistique",
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
    topCategories: "Categories principales",
    subcategories: "Sous-categories",
    noSubcategories: "Aucune sous-categorie disponible.",
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
    homeAria: "Adwart home",
    home: "Home",
    allRange: "Shop all",
    contact: "Contact us",
    about: "About us",
    searchPlaceholder: "Search art materials",
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
    noSubcategories: "No subcategories available.",
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
    searchPlaceholder: "ابحث عن مواد فنية",
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
    subcategories: "الفئات الفرعية",
    noSubcategories: "لا توجد فئات فرعية متاحة.",
    searchProducts: "ابحث عن المنتجات",
    closeMobileMenu: "إغلاق قائمة الجوال",
    accountFallback: "الحساب",
    logoutSuccess: "تم تسجيل الخروج بنجاح.",
    productFallback: "منتج",
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
  const ui = pick(headerMessages);

  const [q, setQ] = useState("");
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [mobileCategoryId, setMobileCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

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

  const activeSubCategories = useMemo(() => {
    if (!activeCategory) return [];
    if (Array.isArray(activeCategory.children) && activeCategory.children.length > 0) {
      return activeCategory.children;
    }
    return categories.filter((category) => Number(category.parent_id) === Number(activeCategory.id));
  }, [activeCategory, categories]);

  const mobileCategory = useMemo(
    () => topCategories.find((category) => String(category.id) === mobileCategoryId) || topCategories[0] || null,
    [mobileCategoryId, topCategories]
  );

  const mobileSubCategories = useMemo(() => {
    if (!mobileCategory) return [];
    if (Array.isArray(mobileCategory.children) && mobileCategory.children.length > 0) {
      return mobileCategory.children;
    }
    return categories.filter((category) => Number(category.parent_id) === Number(mobileCategory.id));
  }, [mobileCategory, categories]);

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
      className="sticky top-0 z-50 bg-white"
      onMouseLeave={() => {
        setMegaMenuOpen(false);
        closeCartPreview();
      }}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1480px] min-w-0 items-center gap-3 px-3 md:px-5">
        <button
          type="button"
          onClick={() => {
            setMegaMenuOpen(false);
            closeCartPreview();
            setMobileMenuOpen((current) => !current);
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-100 md:hidden"
          aria-label={mobileMenuOpen ? ui.closeMenu : ui.openMenu}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" className="shrink-0 rounded-xl bg-white transition" aria-label={ui.homeAria}>
          <span className="block h-10 w-[150px] overflow-hidden rounded-xl md:h-11 md:w-[170px]">
            <img src={logoFinal} alt="Adwart" className="block w-[150px] -translate-y-1 transform md:w-[170px] md:-translate-y-1.5" />
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-7 md:flex lg:gap-8">
          <Link to="/" className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:text-slate-600">
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
            className={`inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] transition ${
              megaMenuOpen ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {ui.allRange}
            <ChevronDown size={17} className={`transition ${megaMenuOpen ? "rotate-180" : "rotate-0"}`} />
          </button>
          <Link to="/info/contact" className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:text-slate-600">
            {ui.contact}
          </Link>
          <Link to="/info/about-artstore" className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:text-slate-600">
            {ui.about}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden w-[240px] lg:block xl:w-[320px]">
            <input
              type="text"
              placeholder={ui.searchPlaceholder}
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && goSearch()}
              className="h-11 w-full rounded-full border border-slate-300 bg-white pl-4 pr-11 text-sm placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={goSearch}
              className="absolute right-2 top-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              style={{ transform: "translateY(-50%)" }}
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
                  className="inline-flex h-11 items-center gap-3 rounded-full border border-slate-200 bg-white pl-2 pr-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {accountInitials}
                  </span>
                  <span className="max-w-[110px] truncate">{accountLabel}</span>
                  <ChevronDown size={16} className={`transition ${accountMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {accountMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-[220px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_46px_rgba(15,23,42,0.12)]">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{user.email}</div>
                    </div>

                    <div className="mt-2 grid gap-1">
                      {isAdminUser ? (
                        <>
                          <Link
                            to="/"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {ui.home}
                          </Link>
                          <Link
                            to="/admin"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {ui.adminPanel}
                          </Link>
                          <Link
                            to="/my-account"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {ui.myAccount}
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {ui.myOrders}
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/my-account"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {ui.myAccount}
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={closeNavigation}
                            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {ui.myOrders}
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        {ui.logout}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link to="/login" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 lg:inline-flex">
              {ui.login}
            </Link>
          )}

          <div className="relative" onMouseEnter={openCartPreview} onMouseLeave={scheduleCartPreviewClose}>
            <button
              onClick={handleCartButtonClick}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-100"
              aria-label={ui.openCart}
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {cartPreviewOpen && canShowCartPreview() && (
              <div className="absolute right-2 top-[calc(100%+12px)] w-[276px] max-w-[calc(100vw-40px)] rounded-[15px] border border-black/5 bg-[#f7f5f2] p-3 shadow-[0_16px_42px_rgba(15,23,42,0.15)]">
                {items.length === 0 ? (
                  <div className="rounded-[13px] bg-white px-4 py-5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                    <p className="text-sm text-slate-600">{ui.cartEmpty}</p>
                    <Link to="/products" onClick={closeCartPreview} className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-[8px] bg-[#2f2d31] px-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#232126]">
                      {ui.continueShopping}
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {previewItems.map((item) => {
                        const image = getProductImage(item);
                        return (
                          <div key={item.id} className="flex gap-2.5 rounded-[13px] bg-white p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                            <div className="ml-1 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#f2efea]">
                              {image ? (
                                <img src={image} alt={item.variant?.product?.name || ui.productFallback} className="h-full w-full object-contain p-1" />
                              ) : (
                                <div className="text-xs font-medium text-slate-400">{ui.noImage || "No image"}</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 pr-1">
                              <p className="text-[11px] font-semibold uppercase leading-5 text-slate-800">{item.variant?.product?.name || ui.productFallback}</p>
                              <p className="mt-1 text-[12px] font-semibold text-slate-900">{formatMoney(item.unit_price)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="my-3.5 h-px bg-black/10" />
                    <div className="space-y-2 text-[14px] text-slate-500">
                      <div className="flex items-center justify-between gap-3">
                        <span>{ui.subtotal}</span>
                        <span className="font-semibold text-slate-900">{formatMoney(total)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>{ui.shipping}</span>
                        <span className="font-semibold text-slate-900">{formatMoney(shipping)}</span>
                      </div>
                    </div>
                    <div className="my-3.5 h-px bg-black/10" />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[16px] text-slate-700">{ui.total}</span>
                      <span className="text-[1.55rem] font-semibold leading-none text-slate-900">{formatMoney(grandTotal)}</span>
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
        <div className="absolute left-1/2 top-[78px] z-50 hidden w-[min(94vw,980px)] -translate-x-1/2 rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_46px_rgba(15,23,42,0.12)] md:block">
          <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(230px,1fr)_minmax(420px,1fr)] lg:px-7">
            <section>
              <div className="border-b border-slate-200 pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-slate-800">
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px] font-medium transition ${
                        isActive ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{category.name}</span>
                      <ChevronRight size={15} className={isActive ? "text-slate-900" : "text-slate-400"} />
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="border-b border-slate-200 pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-slate-800">
                {activeCategory?.name || ui.subcategories}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
                {activeSubCategories.length > 0 ? (
                  activeSubCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => goByCategory(category.id)}
                      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    {ui.noSubcategories}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={ui.closeMobileMenu}
          />

          <div className="relative max-h-full overflow-y-auto border-t border-slate-200 bg-white px-4 pb-8 pt-4 shadow-2xl">
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
                className="h-11 w-full rounded-full border border-slate-300 bg-white pl-4 pr-4 text-sm placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                aria-label={ui.searchProducts}
              >
                <Search size={18} />
              </button>
            </form>

            <div className="mt-5 grid gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">
                {ui.home}
              </Link>
              <Link to="/info/contact" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">
                {ui.contact}
              </Link>
              <Link to="/info/about-artstore" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">
                {ui.about}
              </Link>
            </div>

            <div className="mt-6 rounded-[28px] bg-[#f6f8fb] p-4">
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">{ui.allRange}</div>
              <div className="grid gap-2">
                {topCategories.map((category) => {
                  const isActive = String(category.id) === String(mobileCategory?.id || "");
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setMobileCategoryId(String(category.id))}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        isActive ? "bg-white text-slate-900" : "text-slate-600"
                      }`}
                    >
                      <span>{category.name}</span>
                      <ChevronRight size={16} className={isActive ? "text-slate-900" : "text-slate-400"} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                {mobileCategory?.name || ui.subcategories}
              </div>
              <div className="grid gap-2">
                {mobileSubCategories.length > 0 ? (
                  mobileSubCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => goByCategory(category.id)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700"
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
                    {ui.noSubcategories}
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
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                      >
                        {ui.home}
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                      >
                        {ui.adminPanel}
                      </Link>
                      <Link
                        to="/my-account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                      >
                        {ui.myAccount}
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
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
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                      >
                        {ui.myAccount}
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                      >
                        {ui.myOrders}
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                  >
                    {ui.logout}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                >
                  {ui.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
