import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import { useI18n } from "../../context/I18nContext";

function MenuButton({ open, onClick, side, ui }) {
  const lineStyle = {
    display: "block",
    width: "22px",
    height: "2.5px",
    borderRadius: "999px",
    background: "#334155",
    transition: "transform .2s ease, opacity .2s ease",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? ui.closeMenu : ui.openMenu}
      style={{
        position: "fixed",
        top: "18px",
        [side]: "18px",
        width: "56px",
        height: "56px",
        borderRadius: "18px",
        border: "1px solid rgba(148, 163, 184, 0.28)",
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(18px)",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        zIndex: 1100,
      }}
    >
      <span
        style={{
          display: "grid",
          gap: "5px",
          justifyItems: "center",
        }}
      >
        <span
          style={{
            ...lineStyle,
            transform: open ? "translateY(7.5px) rotate(45deg)" : "none",
          }}
        />
        <span
          style={{
            ...lineStyle,
            opacity: open ? 0 : 1,
          }}
        />
        <span
          style={{
            ...lineStyle,
            transform: open ? "translateY(-7.5px) rotate(-45deg)" : "none",
          }}
        />
      </span>
    </button>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pick, dir } = useI18n();
  const isRtl = dir === "rtl";
  const ui = pick({
    fr: {
      adminLanguage: "Langue admin",
      openMenu: "Ouvrir le menu admin",
      closeMenu: "Fermer le menu admin",
    },
    en: {
      adminLanguage: "Admin language",
      openMenu: "Open admin menu",
      closeMenu: "Close admin menu",
    },
    ar: {
      adminLanguage: "لغة الإدارة",
      openMenu: "فتح قائمة الإدارة",
      closeMenu: "إغلاق قائمة الإدارة",
    },
  });

  return (
    <div className="admin-shell" dir={dir} style={{ minHeight: "100vh" }}>
      <MenuButton
        open={sidebarOpen}
        onClick={() => setSidebarOpen((current) => !current)}
        side={isRtl ? "right" : "left"}
        ui={ui}
      />

      <div
        aria-label={ui.adminLanguage}
        style={{
          position: "fixed",
          top: "18px",
          [isRtl ? "left" : "right"]: "18px",
          zIndex: 1100,
        }}
      >
        <LanguageSwitcher />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-shell__content">
        <div className="admin-shell__surface">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
