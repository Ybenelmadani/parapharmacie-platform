import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import { useToast } from "../../context/ToastContext";
import LanguageSwitcher from "../layout/LanguageSwitcher";

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { pick, dir } = useI18n();
  const { success } = useToast();
  const isRtl = dir === "rtl";
  const ui = pick({
    fr: {
      panel: "Panneau",
      admin: "Admin",
      store: "Boutique",
      dashboard: "Tableau de bord",
      categories: "Categories",
      brands: "Marques",
      products: "Produits",
      orders: "Commandes",
      users: "Utilisateurs",
      reviews: "Avis",
      home: "Accueil",
      shop: "Catalogue",
      cart: "Panier",
      checkout: "Checkout",
      logout: "Deconnexion",
      loggedOut: "Deconnexion reussie.",
      language: "Langue",
    },
    en: {
      panel: "Panel",
      admin: "Admin",
      store: "Store",
      dashboard: "Dashboard",
      categories: "Categories",
      brands: "Brands",
      products: "Products",
      orders: "Orders",
      users: "Users",
      reviews: "Reviews",
      home: "Home",
      shop: "Shop",
      cart: "Cart",
      checkout: "Checkout",
      logout: "Logout",
      loggedOut: "Logged out successfully.",
      language: "Language",
    },
    ar: {
      panel: "لوحة",
      admin: "الإدارة",
      dashboard: "لوحة التحكم",
      categories: "الفئات",
      brands: "العلامات",
      products: "المنتجات",
      orders: "الطلبات",
      users: "المستخدمون",
      reviews: "المراجعات",
      logout: "تسجيل الخروج",
      loggedOut: "تم تسجيل الخروج بنجاح.",
    },
  });
  const storeLabel = ui.store || (isRtl ? "المتجر" : "Store");
  const homeLabel = ui.home || (isRtl ? "الرئيسية" : "Home");
  const shopLabel = ui.shop || (isRtl ? "الكتالوج" : "Shop");
  const cartLabel = ui.cart || (isRtl ? "السلة" : "Cart");
  const checkoutLabel = ui.checkout || (isRtl ? "الدفع" : "Checkout");
  const languageLabel = ui.language || (isRtl ? "اللغة" : "Language");

  const linkBaseStyle = {
    display: "block",
    padding: "12px 14px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "15px",
    transition: "all .2s ease",
    textAlign: isRtl ? "right" : "left",
  };

  const renderLink = (to, label, exact = false) => (
    <NavLink
      to={to}
      end={exact}
      onClick={onClose}
      style={({ isActive }) => ({
        ...linkBaseStyle,
        color: isActive ? "#0f172a" : "#334155",
        background: isActive ? "#e2e8f0" : "transparent",
      })}
    >
      {label}
    </NavLink>
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.18)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity .2s ease",
          zIndex: 1040,
        }}
      />

      <aside
        style={{
          position: "fixed",
          top: "18px",
          [isRtl ? "right" : "left"]: "18px",
          bottom: "18px",
          width: "280px",
          maxWidth: "calc(100vw - 36px)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,251,255,0.92) 100%)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(203, 213, 225, 0.82)",
          borderRadius: "28px",
          boxShadow: "0 30px 70px rgba(15, 23, 42, 0.18)",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : isRtl ? "translateX(calc(100% + 24px))" : "translateX(calc(-100% - 24px))",
          transition: "transform .24s ease",
          zIndex: 1050,
        }}
      >
        <div style={{ marginBottom: "18px", paddingTop: "66px", textAlign: isRtl ? "right" : "left" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>{ui.panel}</div>
            <h2 style={{ margin: "4px 0 0", fontSize: "28px", lineHeight: 1, fontWeight: 900, color: "#0f172a" }}>{ui.admin}</h2>
          </div>
        </div>

        <nav
          style={{
            display: "grid",
            gap: "8px",
            flex: 1,
            alignContent: "start",
            overflowY: "auto",
            paddingRight: isRtl ? 0 : "4px",
            paddingLeft: isRtl ? "4px" : 0,
          }}
        >
          <div style={{ padding: "4px 8px 0", fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", textAlign: isRtl ? "right" : "left" }}>
            {ui.admin}
          </div>
          {renderLink("/admin", ui.dashboard, true)}
          {renderLink("/admin/categories", ui.categories)}
          {renderLink("/admin/brands", ui.brands)}
          {renderLink("/admin/products", ui.products)}
          {renderLink("/admin/orders", ui.orders)}
          {renderLink("/admin/users", ui.users)}
          {renderLink("/admin/reviews", ui.reviews)}
          <div style={{ marginTop: "10px", padding: "4px 8px 0", fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", textAlign: isRtl ? "right" : "left" }}>
            {storeLabel}
          </div>
          {renderLink("/", homeLabel, true)}
          {renderLink("/products", shopLabel)}
          {renderLink("/cart", cartLabel)}
          {renderLink("/checkout", checkoutLabel)}
        </nav>

        <button
          type="button"
          onClick={async () => {
            await logout();
            success(ui.loggedOut);
            onClose?.();
          }}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "12px 14px",
            borderRadius: "14px",
            border: "1px solid #cbd5e1",
            background: "#0f172a",
            color: "#f8fafc",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {ui.logout}
        </button>

        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #e2e8f0",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            {languageLabel}
          </div>
          <LanguageSwitcher compact direction="up" />
        </div>
      </aside>
    </>
  );
}
