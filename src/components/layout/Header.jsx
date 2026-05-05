import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CatalogAPI } from "../../api/catalog";
import {
  STORE_NAME,
  STORE_SHIPPING_FEE,
} from "../../config/store";
import { formatMoney } from "../../utils/currency";
import { resolveMediaUrl } from "../../utils/media";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";
import logoImage from "../../assets/new_logo.png";

const MAX_TOP_CATEGORIES = 10;
const headerMessages = {
  fr: {
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    homeAria: "Accueil boutique",
    home: "Accueil",
    allRange: "Toute notre gamme",
    contact: "Contact",
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
    categoryShortcut: "Explorer par categorie",
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
    categoryShortcut: "Browse by category",
  },
  ar: {
    openMenu: "ÙØªØ­ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©",
    closeMenu: "Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©",
    homeAria: "Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    home: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    allRange: "ÙƒÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª",
    contact: "Ø§ØªØµÙ„ Ø¨Ù†Ø§",
    about: "Ù…Ù† Ù†Ø­Ù†",
    searchPlaceholder: "Ø§Ø¨Ø­Ø« Ø¹Ù† ÙƒØ±ÙŠÙ…ØŒ Ø³ÙŠØ±ÙˆÙ…ØŒ ÙˆØ§Ù‚ÙŠ Ø´Ù…Ø³...",
    adminPanel: "Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©",
    myAccount: "Ø­Ø³Ø§Ø¨ÙŠ",
    myOrders: "Ø·Ù„Ø¨Ø§ØªÙŠ",
    logout: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬",
    login: "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„",
    openCart: "ÙØªØ­ Ø§Ù„Ø³Ù„Ø©",
    cartEmpty: "Ø³Ù„ØªÙƒ ÙØ§Ø±ØºØ©.",
    continueShopping: "Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„ØªØ³ÙˆÙ‚",
    subtotal: "Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„ÙØ±Ø¹ÙŠ",
    shipping: "Ø§Ù„ØªÙˆØµÙŠÙ„",
    total: "Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ",
    topCategories: "Ø§Ù„ÙØ¦Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©",
    brands: "Ø§Ù„Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©",
    noBrands: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ù„Ø§Ù…Ø§Øª ØªØ¬Ø§Ø±ÙŠØ© Ù„Ù‡Ø°Ù‡ Ø§Ù„ÙØ¦Ø©.",
    searchProducts: "Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª",
    closeMobileMenu: "Ø¥ØºÙ„Ø§Ù‚ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¬ÙˆØ§Ù„",
    accountFallback: "Ø§Ù„Ø­Ø³Ø§Ø¨",
    logoutSuccess: "ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­.",
    productFallback: "Ù…Ù†ØªØ¬",
    noImage: "Ù„Ø§ ØµÙˆØ±Ø©",
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
  const loc = useLocation();
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
        setMegaMenuOpen(false);
        setMobileMenuOpen(false);
        closeCartPreview();
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

  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
    closeCartPreview();
  }, [loc.pathname]);

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

  const primaryLinks = useMemo(
    () => [
      { to: "/", label: ui.home, exact: true },
      { to: "/info/contact", label: ui.contact, exact: true },
      { to: "/about", label: ui.about, exact: true },
    ],
    [ui.about, ui.contact, ui.home]
  );

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

  const openCartPreview = () => {
    if (!canShowCartPreview()) return;
    if (cartHoverTimeoutRef.current) {
      clearTimeout(cartHoverTimeoutRef.current);
      cartHoverTimeoutRef.current = null;
    }
    setMegaMenuOpen(false);
    setAccountMenuOpen(false);
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

  const isLinkActive = (path, exact = false) => {
    if (exact) return loc.pathname === path;
    return loc.pathname === path || loc.pathname.startsWith(`${path}/`);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[#c7def6] bg-[linear-gradient(135deg,#dff2ff_0%,#cfeaff_45%,#b7dbff_100%)] shadow-[0_14px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl"
      onMouseLeave={() => {
        setMegaMenuOpen(false);
        closeCartPreview();
      }}
    >
      <div className="relative mx-auto max-w-[1480px] px-3 py-1.5 md:px-4 md:py-2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left_top,rgba(255,255,255,0.45),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.24),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.16),transparent_22%)]" />

        <div className="relative overflow-visible">
          <div className="relative flex items-center gap-2 py-0.5 md:py-1">
              <button
                type="button"
                onClick={() => {
                  setMegaMenuOpen(false);
                  setAccountMenuOpen(false);
                  closeCartPreview();
                  setMobileMenuOpen((current) => !current);
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d7e6db] bg-white/90 text-[#12372a] transition hover:-translate-y-0.5 hover:border-[#bdd6c4] hover:bg-white md:hidden"
                aria-label={mobileMenuOpen ? ui.closeMenu : ui.openMenu}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <Link
                to="/"
                className="mr-auto flex min-w-0 items-center gap-3 transition hover:translate-y-[-1px] md:mr-0"
                aria-label={`${ui.homeAria} ${STORE_NAME}`}
              >
                <div className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] md:h-[70px] md:w-[70px]">
                  <img
                    src={logoImage}
                    alt={STORE_NAME}
                    className="h-[74px] w-[74px] object-contain mix-blend-multiply md:h-[88px] md:w-[88px]"
                  />
                </div>

                <div className="min-w-0">
                  <div className="font-[var(--font-display)] text-[1.35rem] leading-none text-[#12372a] md:text-[1.62rem]">
                    {STORE_NAME}
                  </div>
                </div>
              </Link>

              <nav className="hidden min-w-0 items-center gap-1.5 px-2 xl:flex">
                {primaryLinks.map((link) => {
                  const active = isLinkActive(link.to, link.exact);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                        active
                          ? "bg-[#12372a] text-white shadow-[0_10px_22px_rgba(18,55,42,0.22)]"
                          : "text-[#4f6459] hover:text-[#12372a]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

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
                  onClick={() => {
                    closeCartPreview();
                    setAccountMenuOpen(false);
                    setMegaMenuOpen((current) => !current);
                  }}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    megaMenuOpen || isLinkActive("/products")
                      ? "bg-[#eff7f0] text-[#12372a]"
                      : "text-[#4f6459] hover:text-[#12372a]"
                  }`}
                >
                  {ui.allRange}
                  <ChevronDown size={16} className={`transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
                </button>
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden lg:block lg:w-[240px] xl:w-[300px]">
                  <input
                    type="text"
                    placeholder={ui.searchPlaceholder}
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && goSearch()}
                    className="h-10 w-full rounded-full border border-[#d7e6db] bg-white/92 pl-4 pr-11 text-sm text-[#12372a] shadow-[0_14px_30px_rgba(15,23,42,0.08)] placeholder:text-[#94a69a] focus:border-[#9dc5a8] focus:outline-none focus:ring-2 focus:ring-[#dcefe1] transition"
                  />
                  <button
                    type="button"
                    onClick={goSearch}
                    className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#12372a] text-white transition hover:bg-[#1d7c52]"
                    aria-label={ui.searchProducts}
                  >
                    <Search size={15} />
                  </button>
                </div>

                {user ? (
                  <div className="relative hidden lg:block">
                    <button
                      type="button"
                      onClick={() => {
                        setMegaMenuOpen(false);
                        closeCartPreview();
                        setAccountMenuOpen((current) => !current);
                      }}
                      className="inline-flex h-10 items-center gap-2.5 rounded-full border border-[#d7e6db] bg-white/90 pl-2 pr-3.5 text-sm font-semibold text-[#12372a] transition hover:-translate-y-0.5 hover:border-[#c6ddcc] hover:bg-white"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#12372a_0%,#2a8a61_100%)] text-[11px] font-bold text-white shadow-[0_10px_18px_rgba(18,55,42,0.22)]">
                        {accountInitials}
                      </span>
                      <span className="max-w-[110px] truncate">{accountLabel}</span>
                      <ChevronDown size={16} className={`transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {accountMenuOpen ? (
                      <div className="absolute right-0 top-[calc(100%+12px)] w-[220px] rounded-[24px] border border-[#d7e6db] bg-[rgba(255,255,255,0.98)] p-2 shadow-[0_22px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                        <div className="border-b border-[#ebf1ec] px-3 py-2">
                          <div className="text-sm font-bold text-[#12372a]">{user.name}</div>
                          <div className="mt-1 truncate text-xs text-[#74887e]">{user.email}</div>
                        </div>

                        <div className="mt-2 grid gap-1">
                          {isAdminUser ? (
                            <>
                              <Link
                                to="/"
                                onClick={closeNavigation}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#12372a] transition hover:bg-[#f2f8f4]"
                              >
                                {ui.home}
                              </Link>
                              <Link
                                to="/admin"
                                onClick={closeNavigation}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#12372a] transition hover:bg-[#f2f8f4]"
                              >
                                {ui.adminPanel}
                              </Link>
                              <Link
                                to="/my-account"
                                onClick={closeNavigation}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#12372a] transition hover:bg-[#f2f8f4]"
                              >
                                {ui.myAccount}
                              </Link>
                              <Link
                                to="/my-orders"
                                onClick={closeNavigation}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#12372a] transition hover:bg-[#f2f8f4]"
                              >
                                {ui.myOrders}
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                to="/my-account"
                                onClick={closeNavigation}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#12372a] transition hover:bg-[#f2f8f4]"
                              >
                                {ui.myAccount}
                              </Link>
                              <Link
                                to="/my-orders"
                                onClick={closeNavigation}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#12372a] transition hover:bg-[#f2f8f4]"
                              >
                                {ui.myOrders}
                              </Link>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#c44a59] transition hover:bg-[#fff5f6]"
                          >
                            {ui.logout}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="hidden rounded-full border border-[#d7e6db] bg-white/90 px-4 py-2 text-sm font-semibold text-[#12372a] transition hover:-translate-y-0.5 hover:border-[#c6ddcc] hover:bg-white lg:inline-flex"
                  >
                    {ui.login}
                  </Link>
                )}

                <div className="relative" onMouseEnter={openCartPreview} onMouseLeave={scheduleCartPreviewClose}>
                  <button
                    onClick={handleCartButtonClick}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e6db] bg-white/92 text-[#12372a] transition hover:-translate-y-0.5 hover:border-[#c6ddcc] hover:bg-white"
                    aria-label={ui.openCart}
                  >
                    <ShoppingBag size={17} />
                    {itemCount > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#12372a] px-1 text-xs font-bold text-white shadow-[0_10px_18px_rgba(18,55,42,0.2)]">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  {cartPreviewOpen && canShowCartPreview() && (
                    <div className="absolute right-0 top-[calc(100%+12px)] w-[300px] max-w-[calc(100vw-40px)] rounded-[24px] border border-[#d7e6db] bg-[rgba(255,255,255,0.98)] p-3 shadow-[0_24px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                      {items.length === 0 ? (
                        <div className="rounded-[18px] bg-[#f7fbf7] px-4 py-5 text-center">
                          <p className="text-sm text-[#607667]">{ui.cartEmpty}</p>
                          <Link
                            to="/products"
                            onClick={closeCartPreview}
                            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#12372a] px-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#1d7c52]"
                          >
                            {ui.continueShopping}
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {previewItems.map((item) => {
                              const image = getProductImage(item);
                              return (
                                <div key={item.id} className="flex gap-2.5 rounded-[18px] bg-[#f7fbf7] p-2.5">
                                  <div className="ml-1 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white">
                                    {image ? (
                                      <img
                                        src={image}
                                        alt={item.variant?.product?.name || ui.productFallback}
                                        className="h-full w-full object-contain p-1"
                                      />
                                    ) : (
                                      <div className="text-xs font-medium text-[#74887e]">{ui.noImage}</div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 pr-1">
                                    <p className="text-[11px] font-semibold uppercase leading-5 tracking-[0.12em] text-[#12372a]">
                                      {item.variant?.product?.name || ui.productFallback}
                                    </p>
                                    <p className="mt-1 text-[12px] font-semibold text-[#1d7c52]">
                                      {formatMoney(item.unit_price)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="my-3.5 h-px bg-[#e7efe8]" />
                          <div className="space-y-2 text-[14px] text-[#607667]">
                            <div className="flex items-center justify-between gap-3">
                              <span>{ui.subtotal}</span>
                              <span className="font-semibold text-[#12372a]">{formatMoney(total)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>{ui.shipping}</span>
                              <span className="font-semibold text-[#12372a]">{formatMoney(shipping)}</span>
                            </div>
                          </div>
                          <div className="my-3.5 h-px bg-[#e7efe8]" />
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[16px] text-[#12372a]">{ui.total}</span>
                            <span className="text-[1.55rem] font-semibold leading-none text-[#1d7c52]">
                              {formatMoney(grandTotal)}
                            </span>
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

            {megaMenuOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+14px)] z-50 hidden md:block">
                <div className="overflow-hidden rounded-[30px] border border-[#d7e6db] bg-[rgba(255,255,255,0.98)] shadow-[0_30px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(220px,0.9fr)_minmax(260px,0.95fr)_minmax(360px,1fr)] lg:px-7">
                    <section>
                      <div className="border-b border-[#e7efe8] pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#1d7c52]">
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
                              className={`flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-[15px] font-semibold transition ${
                                isActive
                                  ? "bg-[#eff7f0] text-[#12372a] shadow-[0_12px_24px_rgba(18,55,42,0.08)]"
                                  : "text-[#607667] hover:bg-[#f7fbf7] hover:text-[#12372a]"
                              }`}
                            >
                              <span>{category.name}</span>
                              <ChevronRight size={15} className={isActive ? "text-[#12372a]" : "text-[#90a49a]"} />
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section>
                      <div className="border-b border-[#e7efe8] pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#1d7c52]">
                        {ui.subcategories}
                      </div>
                      <div className="mt-4 grid gap-2">
                        {activeSubcategories.length > 0 ? (
                          activeSubcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              type="button"
                              onClick={() => goByCategory(subcategory.id)}
                              className="flex w-full items-center justify-between rounded-[16px] px-4 py-3 text-left text-sm font-semibold text-[#12372a] transition hover:translate-x-1 hover:bg-[#f4f9f5]"
                            >
                              <span className="min-w-0 pr-3">{subcategory.name}</span>
                              <ChevronRight size={15} className="shrink-0 text-[#90a49a]" />
                            </button>
                          ))
                        ) : (
                          <div className="rounded-2xl border-2 border-dashed border-[#d7e6db] bg-[#f7fbf7] px-4 py-5 text-sm text-[#74887e]">
                            {ui.noSubcategories}
                          </div>
                        )}
                      </div>
                    </section>

                    <section>
                      <div className="border-b border-[#e7efe8] pb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#1d7c52]">
                        {ui.brands}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                        {activeBrands.length > 0 ? (
                          activeBrands.map((brand) => (
                            <button
                              key={brand.id}
                              type="button"
                              onClick={() => goByBrand(brand.id, activeCategory?.id)}
                              className="block w-full rounded-[16px] border border-transparent bg-[#f7fbf7] px-4 py-3 text-left text-sm font-semibold text-[#12372a] transition hover:border-[#d7e6db] hover:bg-white"
                            >
                              {brand.name}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-2 rounded-2xl border-2 border-dashed border-[#d7e6db] bg-[#f7fbf7] px-4 py-5 text-sm text-[#74887e]">
                            {ui.noBrands}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            ) : null}

            {mobileMenuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 top-[96px] z-40 bg-[#12372a]/12 backdrop-blur-[2px] md:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={ui.closeMobileMenu}
                />

                <div className="absolute inset-x-0 top-[calc(100%+12px)] z-[60] md:hidden">
                  <div className="max-h-[calc(100vh-110px)] overflow-y-auto rounded-[28px] border border-[#d7e6db] bg-[rgba(255,255,255,0.99)] shadow-[0_30px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                    <div className="sticky top-0 z-10 border-b border-[#e7efe8] bg-[rgba(255,255,255,0.98)] px-4 pb-4 pt-4">
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
                          className="h-11 w-full rounded-full border border-[#d7e6db] bg-white pl-4 pr-4 text-sm text-[#12372a] placeholder:text-[#94a69a] focus:border-[#9dc5a8] focus:outline-none focus:ring-2 focus:ring-[#dcefe1] transition"
                        />
                        <button
                          type="submit"
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12372a] text-white transition hover:bg-[#1d7c52]"
                          aria-label={ui.searchProducts}
                        >
                          <Search size={18} />
                        </button>
                      </form>
                    </div>

                    <div className="px-4 pb-8 pt-4">
                      <div className="grid gap-2">
                        {primaryLinks.map((link) => {
                          const active = isLinkActive(link.to, link.exact);
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`rounded-[18px] border px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition ${
                                active
                                  ? "border-[#12372a] bg-[#12372a] text-white"
                                  : "border-[#d7e6db] bg-white text-[#12372a]"
                              }`}
                            >
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="mt-6 rounded-[28px] bg-[#f7fbf7] p-4 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
                        <div className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1d7c52]">
                          {ui.allRange}
                        </div>
                        <div className="grid gap-2">
                          {topCategories.map((category) => {
                            const isActive = String(category.id) === String(mobileCategory?.id || "");
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => setMobileCategoryId(String(category.id))}
                                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                                  isActive
                                    ? "bg-white text-[#12372a] shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                                    : "text-[#607667] hover:bg-white hover:text-[#12372a]"
                                }`}
                              >
                                <span className="min-w-0 pr-3">{category.name}</span>
                                <ChevronRight size={16} className={`shrink-0 ${isActive ? "text-[#12372a]" : "text-[#90a49a]"}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#1d7c52]">
                          {ui.subcategories}
                        </div>
                        <div className="grid gap-2">
                          {mobileSubcategories.length > 0 ? (
                            mobileSubcategories.map((subcategory) => (
                              <button
                                key={subcategory.id}
                                type="button"
                                onClick={() => goByCategory(subcategory.id)}
                                className="rounded-2xl border border-[#d7e6db] bg-white px-4 py-3 text-left text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:bg-[#f7fbf7]"
                              >
                                {subcategory.name}
                              </button>
                            ))
                          ) : (
                            <div className="rounded-2xl border-2 border-dashed border-[#d7e6db] bg-[#f7fbf7] px-4 py-4 text-sm text-[#74887e]">
                              {ui.noSubcategories}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#1d7c52]">
                          {ui.brands}
                        </div>
                        <div className="grid gap-2">
                          {mobileBrands.length > 0 ? (
                            mobileBrands.map((brand) => (
                              <button
                                key={brand.id}
                                type="button"
                                onClick={() => goByBrand(brand.id, mobileCategory?.id)}
                                className="rounded-2xl border border-[#d7e6db] bg-white px-4 py-3 text-left text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:bg-[#f7fbf7]"
                              >
                                {brand.name}
                              </button>
                            ))
                          ) : (
                            <div className="rounded-2xl border-2 border-dashed border-[#d7e6db] bg-[#f7fbf7] px-4 py-4 text-sm text-[#74887e]">
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
                            {isAdminUser ? (
                              <>
                                <Link
                                  to="/"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#d7e6db] bg-white px-4 text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition"
                                >
                                  {ui.home}
                                </Link>
                                <Link
                                  to="/admin"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#d7e6db] bg-white px-4 text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition"
                                >
                                  {ui.adminPanel}
                                </Link>
                                <Link
                                  to="/my-account"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#d7e6db] bg-white px-4 text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition"
                                >
                                  {ui.myAccount}
                                </Link>
                                <Link
                                  to="/my-orders"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#d7e6db] bg-white px-4 text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition"
                                >
                                  {ui.myOrders}
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link
                                  to="/my-account"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#d7e6db] bg-white px-4 text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition"
                                >
                                  {ui.myAccount}
                                </Link>
                                <Link
                                  to="/my-orders"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#d7e6db] bg-white px-4 text-sm font-semibold text-[#12372a] shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition"
                                >
                                  {ui.myOrders}
                                </Link>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#f2d8dd] bg-white px-4 text-sm font-semibold text-[#c44a59] shadow-[0_12px_24px_rgba(196,74,89,0.08)] transition"
                            >
                              {ui.logout}
                            </button>
                          </>
                        ) : (
                          <Link
                            to="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#12372a] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(18,55,42,0.16)] transition"
                          >
                            {ui.login}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
      </div>
    </header>
  );
}
