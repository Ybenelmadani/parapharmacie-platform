import { useEffect, useMemo, useState } from "react";
import {
  BanknoteArrowUp,
  Boxes,
  Clock3,
  Download,
  Printer,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { http } from "../../api/http";
import { useI18n } from "../../context/I18nContext";
import { formatMoney } from "../../utils/currency";

const EMPTY = {
  meta: { period: "6m", granularity: "month", start: null, end: null },
  summary: { total_revenue: 0, total_orders: 0, total_customers: 0, total_products: 0 },
  sales_by_month: [],
  orders_by_month: [],
  users_by_month: [],
  orders_by_status: [],
  top_products: [],
  latest_orders: [],
};

const STATUS = {
  pending: { fr: "En attente", en: "Pending", ar: "قيد الانتظار", bg: "#fef3c7", fg: "#92400e", stroke: "#f59e0b" },
  paid: { fr: "Payee", en: "Paid", ar: "مدفوعة", bg: "#ccfbf1", fg: "#0f766e", stroke: "#14b8a6" },
  shipped: { fr: "Livree", en: "Delivered", ar: "تم التسليم", bg: "#dbeafe", fg: "#1d4ed8", stroke: "#3b82f6" },
  cancelled: { fr: "Annulee", en: "Cancelled", ar: "ملغاة", bg: "#ffe4e6", fg: "#be123c", stroke: "#fb7185" },
};

function periodLabel(period, locale, granularity) {
  if (!period) return "";
  if (granularity === "day") {
    const [y, m, d] = String(period).split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(
      new Date(y || 2026, (m || 1) - 1, d || 1)
    );
  }

  const [y, m] = String(period).split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(y || 2026, (m || 1) - 1, 1));
}

function shouldShowAxisLabel(index, total) {
  if (total <= 8) return true;
  if (index === 0 || index === total - 1) return true;
  return index % Math.ceil(total / 6) === 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function downloadExcelFile(name, content) {
  const blob = new Blob([`\uFEFF${content}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function Chip({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        color: "#9a3412",
        fontWeight: 800,
        fontSize: 12,
      }}
    >
      <Clock3 size={14} />
      {children}
    </span>
  );
}

function ToolbarButton({ icon: Icon, children, onClick, dark = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: dark ? "1px solid #0f172a" : "1px solid #cbd5e1",
        borderRadius: 14,
        background: dark ? "#0f172a" : "#fff",
        color: dark ? "#fff" : "#0f172a",
        padding: "10px 14px",
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
      }}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}

function Panel({ title, hint, action, children }) {
  return (
    <section
      style={{
        borderRadius: 28,
        padding: 22,
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
        border: "1px solid rgba(226,232,240,0.95)",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{title}</h3>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>{hint}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metric({ icon: Icon, label, value, helper, bg }) {
  return (
    <div
      style={{
        borderRadius: 26,
        padding: 20,
        minHeight: 168,
        color: "#fff",
        background: bg,
        boxShadow: "0 22px 50px rgba(15, 23, 42, 0.16)",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          display: "grid",
          placeItems: "center",
          borderRadius: 16,
          background: "rgba(255,255,255,0.18)",
          marginBottom: 26,
        }}
      >
        <Icon size={24} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.92 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.88 }}>{helper}</div>
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div
      style={{
        minHeight: 220,
        borderRadius: 22,
        display: "grid",
        placeItems: "center",
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        color: "#64748b",
        fontWeight: 700,
      }}
    >
      {text}
    </div>
  );
}

function BarChart({ data, locale, granularity, color, empty }) {
  if (!data.length) return <EmptyChart text={empty} />;
  const h = 230, w = 500, top = 16, left = 10, bottom = 36, right = 16;
  const ih = h - top - bottom, iw = w - left - right;
  const max = Math.max(...data.map((x) => Number(x.value) || 0), 1);
  const step = iw / data.length, bw = Math.min(38, step * 0.58);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 250 }}>
      {[0, 1, 2, 3].map((i) => {
        const y = top + (ih / 3) * i;
        return <line key={i} x1={left} x2={w - right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 8" />;
      })}
      {data.map((item, i) => {
        const value = Number(item.value) || 0;
        const height = (value / max) * ih;
        const x = left + step * i + (step - bw) / 2;
        const y = top + ih - height;
        return (
          <g key={item.period}>
            <rect x={x} y={y} width={bw} height={height} rx="14" fill={color} />
            {shouldShowAxisLabel(i, data.length) ? (
              <text x={x + bw / 2} y={h - 10} textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="700">
                {periodLabel(item.period, locale, granularity)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, locale, granularity, stroke, fill, empty }) {
  if (!data.length) return <EmptyChart text={empty} />;
  const h = 230, w = 500, top = 18, left = 12, bottom = 36, right = 14;
  const ih = h - top - bottom, iw = w - left - right;
  const max = Math.max(...data.map((x) => Number(x.value) || 0), 1);
  const pts = data.map((item, i) => {
    const x = left + (iw / Math.max(data.length - 1, 1)) * i;
    const y = top + ih - ((Number(item.value) || 0) / max) * ih;
    return { x, y, item };
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${top + ih} L ${pts[0].x} ${top + ih} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 250 }}>
      <defs>
        <linearGradient id={`g-${stroke.replace("#", "")}-${granularity}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.4" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => {
        const y = top + (ih / 3) * i;
        return <line key={i} x1={left} x2={w - right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 8" />;
      })}
      <path d={area} fill={`url(#g-${stroke.replace("#", "")}-${granularity})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={p.item.period}>
          <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke={stroke} strokeWidth="3" />
          {shouldShowAxisLabel(i, data.length) ? (
            <text x={p.x} y={h - 10} textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="700">
              {periodLabel(p.item.period, locale, granularity)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function Donut({ data, total, label, empty }) {
  if (!data.length || !total) return <EmptyChart text={empty} />;
  const r = 70, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 230 230" style={{ width: "100%", maxWidth: 250, margin: "0 auto", display: "block" }}>
      <circle cx="115" cy="115" r={r} fill="none" stroke="#e2e8f0" strokeWidth="22" />
      {data.map((s) => {
        const len = (s.count / total) * c;
        const current = offset;
        offset += len;
        return (
          <circle
            key={s.status}
            cx="115"
            cy="115"
            r={r}
            fill="none"
            stroke={s.stroke}
            strokeWidth="22"
            strokeLinecap="round"
            strokeDasharray={`${len} ${c}`}
            strokeDashoffset={-current}
            transform="rotate(-90 115 115)"
          />
        );
      })}
      <circle cx="115" cy="115" r="46" fill="#fffaf2" />
      <text x="115" y="105" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="700">{label}</text>
      <text x="115" y="129" textAnchor="middle" fontSize="28" fill="#0f172a" fontWeight="900">{total}</text>
    </svg>
  );
}

export default function Dashboard() {
  const { pick, dir, locale, formatDate, language } = useI18n();
  const rtl = dir === "rtl";
  const ui = pick({
    fr: {
      title: "Dashboard Analytics",
      subtitle: "Cartes, graphiques et tableaux pour suivre les performances du site en temps reel.",
      online: "Donnees synchronisees",
      loading: "Chargement du dashboard...",
      error: "Impossible de charger les statistiques du dashboard.",
      retry: "Reessayer",
      helper: "Vue mise a jour selon la periode choisie",
      catalogHelper: "Catalogue total actuel",
      revenue: "Chiffre d'affaires",
      orders: "Commandes",
      customers: "Clients inscrits",
      products: "Produits",
      salesMonth: "Ventes",
      salesHint: "Montant total des ventes hors commandes annulees.",
      ordersMonth: "Commandes",
      ordersHint: "Evolution du volume des commandes sur la periode.",
      usersMonth: "Inscriptions",
      usersHint: "Nouveaux comptes clients sur la periode.",
      statusTitle: "Repartition des commandes",
      statusHint: "Suivi des commandes en attente, payees, livrees et annulees.",
      latestTitle: "Dernieres commandes",
      latestHint: "Les commandes les plus recentes sur la periode choisie.",
      topTitle: "Produits les plus vendus",
      topHint: "Classement par quantite vendue sur la periode.",
      customer: "Client",
      product: "Produit",
      status: "Statut",
      total: "Total",
      date: "Date",
      quantity: "Quantite vendue",
      generated: "CA genere",
      noData: "Pas encore de donnees suffisantes.",
      ordersLabel: "Commandes",
      qtyShort: "ventes",
      period: "Periode",
      period7d: "7 jours",
      period30d: "30 jours",
      period6m: "6 mois",
      period12m: "12 mois",
      exportExcel: "Exporter Excel",
      exportPdf: "Exporter PDF",
      pdfTitle: "Rapport analytics admin",
      reportGenerated: "Rapport genere le",
      sectionSummary: "Resume",
      sectionStatuses: "Statuts des commandes",
      sectionLatest: "Dernieres commandes",
      sectionTop: "Produits les plus vendus",
    },
    en: {
      title: "Analytics Dashboard",
      subtitle: "Cards, charts, and tables to track store performance in real time.",
      online: "Data synchronized",
      loading: "Loading dashboard...",
      error: "Failed to load dashboard analytics.",
      retry: "Retry",
      helper: "View refreshed for the selected period",
      catalogHelper: "Current catalog total",
      revenue: "Revenue",
      orders: "Orders",
      customers: "Registered users",
      products: "Products",
      salesMonth: "Sales",
      salesHint: "Total sales excluding cancelled orders.",
      ordersMonth: "Orders",
      ordersHint: "Order volume over the selected period.",
      usersMonth: "Signups",
      usersHint: "New customer accounts over the selected period.",
      statusTitle: "Order status breakdown",
      statusHint: "Track pending, paid, delivered, and cancelled orders.",
      latestTitle: "Latest orders",
      latestHint: "Most recent orders inside the selected period.",
      topTitle: "Top-selling products",
      topHint: "Ranking by quantity sold in the selected period.",
      customer: "Customer",
      product: "Product",
      status: "Status",
      total: "Total",
      date: "Date",
      quantity: "Quantity sold",
      generated: "Revenue",
      noData: "Not enough data yet.",
      ordersLabel: "Orders",
      qtyShort: "sales",
      period: "Period",
      period7d: "7 days",
      period30d: "30 days",
      period6m: "6 months",
      period12m: "12 months",
      exportExcel: "Export Excel",
      exportPdf: "Export PDF",
      pdfTitle: "Admin analytics report",
      reportGenerated: "Report generated on",
      sectionSummary: "Summary",
      sectionStatuses: "Order statuses",
      sectionLatest: "Latest orders",
      sectionTop: "Top products",
    },
    ar: {
      title: "لوحة تحليلات المتجر",
      subtitle: "بطاقات ورسوم وجداول لمتابعة اداء المتجر بشكل مباشر.",
      online: "البيانات متزامنة",
      loading: "جاري تحميل لوحة التحليلات...",
      error: "تعذر تحميل احصاءات لوحة التحليلات.",
      retry: "اعادة المحاولة",
      helper: "عرض محدث حسب الفترة المختارة",
      catalogHelper: "اجمالي المنتجات الحالي",
      revenue: "الايرادات",
      orders: "الطلبات",
      customers: "المستخدمون المسجلون",
      products: "المنتجات",
      salesMonth: "المبيعات",
      salesHint: "اجمالي المبيعات مع استثناء الطلبات الملغاة.",
      ordersMonth: "الطلبات",
      ordersHint: "حجم الطلبات خلال الفترة المختارة.",
      usersMonth: "التسجيلات",
      usersHint: "حسابات العملاء الجديدة خلال الفترة المختارة.",
      statusTitle: "توزيع الطلبات",
      statusHint: "متابعة الطلبات المعلقة والمدفوعة والمسلمة والملغاة.",
      latestTitle: "احدث الطلبات",
      latestHint: "اخر الطلبات داخل الفترة المختارة.",
      topTitle: "المنتجات الاكثر مبيعا",
      topHint: "ترتيب حسب الكمية المباعة خلال الفترة المختارة.",
      customer: "العميل",
      product: "المنتج",
      status: "الحالة",
      total: "الاجمالي",
      date: "التاريخ",
      quantity: "الكمية المباعة",
      generated: "الايراد",
      noData: "لا توجد بيانات كافية بعد.",
      ordersLabel: "الطلبات",
      qtyShort: "مبيعات",
      period: "الفترة",
      period7d: "7 ايام",
      period30d: "30 يوما",
      period6m: "6 اشهر",
      period12m: "12 شهرا",
      exportExcel: "تصدير Excel",
      exportPdf: "تصدير PDF",
      pdfTitle: "تقرير تحليلات الادارة",
      reportGenerated: "تم انشاء التقرير في",
      sectionSummary: "الملخص",
      sectionStatuses: "حالات الطلبات",
      sectionLatest: "احدث الطلبات",
      sectionTop: "المنتجات الاكثر مبيعا",
    },
  });

  const [period, setPeriod] = useState("6m");
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await http.get("/admin/dashboard", { params: { period } });
        if (live) {
          setData({
            ...EMPTY,
            ...res.data,
            meta: { ...EMPTY.meta, ...(res.data?.meta || {}), period },
            summary: { ...EMPTY.summary, ...(res.data?.summary || {}) },
          });
        }
      } catch {
        if (live) setError(ui.error);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [period, ui.error]);

  const n = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const periodOptions = useMemo(
    () => [
      { value: "7d", label: ui.period7d },
      { value: "30d", label: ui.period30d },
      { value: "6m", label: ui.period6m },
      { value: "12m", label: ui.period12m },
    ],
    [ui.period12m, ui.period30d, ui.period6m, ui.period7d]
  );
  const currentPeriodLabel = periodOptions.find((item) => item.value === period)?.label || ui.period6m;
  const statusData = useMemo(
    () =>
      data.orders_by_status.map((s) => {
        const meta = STATUS[s.status] || STATUS.pending;
        return {
          ...s,
          label: meta[language] || meta.fr,
          bg: meta.bg,
          fg: meta.fg,
          stroke: meta.stroke,
        };
      }),
    [data.orders_by_status, language]
  );
  const totalStatus = statusData.reduce((sum, s) => sum + (Number(s.count) || 0), 0);
  const topMax = Math.max(...data.top_products.map((p) => Number(p.quantity_sold) || 0), 1);

  const cards = [
    { icon: BanknoteArrowUp, label: ui.revenue, value: formatMoney(data.summary.total_revenue), helper: currentPeriodLabel, bg: "linear-gradient(135deg, #0f766e, #14b8a6 55%, #67e8f9)" },
    { icon: ShoppingCart, label: ui.orders, value: n.format(data.summary.total_orders), helper: currentPeriodLabel, bg: "linear-gradient(135deg, #b45309, #f59e0b 55%, #fde68a)" },
    { icon: UserRound, label: ui.customers, value: n.format(data.summary.total_customers), helper: currentPeriodLabel, bg: "linear-gradient(135deg, #1d4ed8, #3b82f6 58%, #93c5fd)" },
    { icon: Boxes, label: ui.products, value: n.format(data.summary.total_products), helper: ui.catalogHelper, bg: "linear-gradient(135deg, #9a3412, #ea580c 55%, #fdba74)" },
  ];

  const exportExcel = () => {
    const summaryRows = [
      [ui.period, currentPeriodLabel],
      [ui.revenue, formatMoney(data.summary.total_revenue)],
      [ui.orders, n.format(data.summary.total_orders)],
      [ui.customers, n.format(data.summary.total_customers)],
      [ui.products, n.format(data.summary.total_products)],
    ]
      .map(
        ([label, value]) =>
          `<tr class="row"><td class="label">${escapeHtml(label)}</td><td class="value">${escapeHtml(value)}</td><td></td><td></td><td></td></tr>`
      )
      .join("");

    const statusRows = statusData
      .map(
        (item) =>
          `<tr class="row"><td>${escapeHtml(item.label)}</td><td class="number">${escapeHtml(item.count)}</td><td></td><td></td><td></td></tr>`
      )
      .join("");

    const latestRows = data.latest_orders
      .map(
        (order) => `
          <tr class="row">
            <td class="number">${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.customer_name || "-")}</td>
            <td>${escapeHtml(STATUS[order.status]?.[language] || STATUS[order.status]?.fr || order.status)}</td>
            <td>${escapeHtml(order.created_at ? formatDate(order.created_at, { year: "numeric", month: "short", day: "numeric" }) : "-")}</td>
            <td>${escapeHtml(formatMoney(order.total))}</td>
          </tr>`
      )
      .join("");

    const topRows = data.top_products
      .map(
        (product) => `
          <tr class="row">
            <td>${escapeHtml(product.name)}</td>
            <td class="number">${escapeHtml(product.quantity_sold)}</td>
            <td>${escapeHtml(formatMoney(product.revenue))}</td>
            <td></td>
            <td></td>
          </tr>`
      )
      .join("");

    const workbook = `<!doctype html>
      <html lang="${escapeHtml(language)}">
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Calibri, Arial, sans-serif; margin: 24px; color: #0f172a; }
            .title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
            .subtitle { font-size: 12px; color: #475569; margin-bottom: 20px; }
            .grid { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 24px; }
            .grid col.w1 { width: 220px; }
            .grid col.w2 { width: 220px; }
            .grid col.w3 { width: 180px; }
            .grid col.w4 { width: 180px; }
            .grid col.w5 { width: 180px; }
            .section { background: #0f172a; color: #ffffff; font-weight: 700; font-size: 14px; }
            .section td { padding: 10px 12px; border: 1px solid #cbd5e1; }
            .head { background: #f8fafc; font-weight: 700; color: #334155; }
            .head td { padding: 9px 12px; border: 1px solid #cbd5e1; }
            .row td { padding: 9px 12px; border: 1px solid #cbd5e1; background: #ffffff; }
            .label { font-weight: 600; color: #334155; }
            .value { font-weight: 700; }
            .number { text-align: right; }
            .space td { border: none; height: 10px; background: transparent; padding: 0; }
          </style>
        </head>
        <body>
          <div class="title">${escapeHtml(ui.pdfTitle)}</div>
          <div class="subtitle">${escapeHtml(ui.period)}: ${escapeHtml(currentPeriodLabel)}</div>

          <table class="grid">
            <colgroup><col class="w1" /><col class="w2" /><col class="w3" /><col class="w4" /><col class="w5" /></colgroup>
            <tr class="section"><td colspan="5">${escapeHtml(ui.sectionSummary)}</td></tr>
            <tr class="head"><td>${escapeHtml(ui.sectionSummary)}</td><td>${escapeHtml(ui.total)}</td><td></td><td></td><td></td></tr>
            ${summaryRows}
            <tr class="space"><td colspan="5"></td></tr>
            <tr class="section"><td colspan="5">${escapeHtml(ui.sectionStatuses)}</td></tr>
            <tr class="head"><td>${escapeHtml(ui.status)}</td><td>${escapeHtml(ui.total)}</td><td></td><td></td><td></td></tr>
            ${statusRows}
            <tr class="space"><td colspan="5"></td></tr>
            <tr class="section"><td colspan="5">${escapeHtml(ui.sectionLatest)}</td></tr>
            <tr class="head"><td>#</td><td>${escapeHtml(ui.customer)}</td><td>${escapeHtml(ui.status)}</td><td>${escapeHtml(ui.date)}</td><td>${escapeHtml(ui.total)}</td></tr>
            ${latestRows || `<tr class="row"><td colspan="5">${escapeHtml(ui.noData)}</td></tr>`}
            <tr class="space"><td colspan="5"></td></tr>
            <tr class="section"><td colspan="5">${escapeHtml(ui.sectionTop)}</td></tr>
            <tr class="head"><td>${escapeHtml(ui.product)}</td><td>${escapeHtml(ui.quantity)}</td><td>${escapeHtml(ui.generated)}</td><td></td><td></td></tr>
            ${topRows || `<tr class="row"><td colspan="5">${escapeHtml(ui.noData)}</td></tr>`}
          </table>
        </body>
      </html>`;

    downloadExcelFile(`dashboard-${period}.xls`, workbook);
  };

  const exportPdf = () => {
    const popup = window.open("", "_blank", "noopener,noreferrer,width=1000,height=900");
    if (!popup) return;

    const summaryHtml = cards
      .map(
        (card) => `
          <div class="summary-card">
            <div class="summary-label">${escapeHtml(card.label)}</div>
            <div class="summary-value">${escapeHtml(card.value)}</div>
            <div class="summary-helper">${escapeHtml(card.helper)}</div>
          </div>`
      )
      .join("");

    const statusHtml = statusData
      .map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(item.count)}</td></tr>`)
      .join("");

    const latestHtml = data.latest_orders
      .map(
        (order) => `
          <tr>
            <td>#${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.customer_name || "-")}</td>
            <td>${escapeHtml(STATUS[order.status]?.[language] || STATUS[order.status]?.fr || order.status)}</td>
            <td>${escapeHtml(order.created_at ? formatDate(order.created_at, { year: "numeric", month: "short", day: "numeric" }) : "-")}</td>
            <td>${escapeHtml(formatMoney(order.total))}</td>
          </tr>`
      )
      .join("");

    const topHtml = data.top_products
      .map(
        (product) => `
          <tr>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.quantity_sold)}</td>
            <td>${escapeHtml(formatMoney(product.revenue))}</td>
          </tr>`
      )
      .join("");

    popup.document.write(`<!doctype html><html lang="${escapeHtml(language)}"><head><meta charset="utf-8" /><title>${escapeHtml(ui.pdfTitle)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#0f172a}h1,h2{margin:0 0 10px}p{margin:0 0 14px;color:#475569}.summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0 28px}.summary-card{border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#f8fafc}.summary-label{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase}.summary-value{font-size:24px;font-weight:900;margin:8px 0}.summary-helper{font-size:12px;color:#64748b}table{width:100%;border-collapse:collapse;margin:12px 0 28px}th,td{border:1px solid #e2e8f0;padding:10px;text-align:left}th{background:#f8fafc}</style></head><body><h1>${escapeHtml(ui.pdfTitle)}</h1><p>${escapeHtml(ui.period)}: ${escapeHtml(currentPeriodLabel)}</p><p>${escapeHtml(ui.reportGenerated)} ${escapeHtml(formatDate(new Date(), { year: "numeric", month: "long", day: "numeric" }))}</p><div class="summary">${summaryHtml}</div><h2>${escapeHtml(ui.sectionStatuses)}</h2><table><thead><tr><th>${escapeHtml(ui.status)}</th><th>${escapeHtml(ui.total)}</th></tr></thead><tbody>${statusHtml}</tbody></table><h2>${escapeHtml(ui.sectionLatest)}</h2><table><thead><tr><th>#</th><th>${escapeHtml(ui.customer)}</th><th>${escapeHtml(ui.status)}</th><th>${escapeHtml(ui.date)}</th><th>${escapeHtml(ui.total)}</th></tr></thead><tbody>${latestHtml}</tbody></table><h2>${escapeHtml(ui.sectionTop)}</h2><table><thead><tr><th>${escapeHtml(ui.product)}</th><th>${escapeHtml(ui.quantity)}</th><th>${escapeHtml(ui.generated)}</th></tr></thead><tbody>${topHtml}</tbody></table></body></html>`);
    popup.document.close();
    popup.focus();
    setTimeout(() => popup.print(), 250);
  };

  return (
    <div style={{ width: "100%", maxWidth: 1520, margin: "0 auto", direction: dir }}>
      <div style={{ marginBottom: 22, borderRadius: 32, padding: 28, background: "linear-gradient(135deg, #fff7ed 0%, #fffaf2 42%, #ecfeff 100%)", border: "1px solid rgba(251,191,36,0.24)", boxShadow: "0 26px 70px rgba(15,23,42,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: loading ? "#fff1cc" : "#d1fae5", color: loading ? "#9a3412" : "#065f46", fontWeight: 800, fontSize: 13 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: loading ? "#f59e0b" : "#10b981" }} />
              {loading ? ui.loading : ui.online}
            </div>
            <h1 style={{ margin: "16px 0 0", fontSize: 38, lineHeight: 1.04, letterSpacing: "-0.03em", color: "#0f172a", fontWeight: 950 }}>{ui.title}</h1>
            <p style={{ margin: "12px 0 0", color: "#475569", fontSize: 15, lineHeight: 1.7 }}>{ui.subtitle}</p>
          </div>
          <div style={{ display: "grid", gap: 12, justifyItems: rtl ? "start" : "end" }}>
            <label style={{ display: "grid", gap: 8, fontWeight: 800, color: "#0f172a" }}>
              <span>{ui.period}</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{ minWidth: 180, padding: "11px 14px", borderRadius: 14, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontWeight: 700 }}
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: rtl ? "flex-start" : "flex-end" }}>
              <ToolbarButton icon={Download} onClick={exportExcel}>{ui.exportExcel}</ToolbarButton>
              <ToolbarButton icon={Printer} onClick={exportPdf} dark>{ui.exportPdf}</ToolbarButton>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div style={{ marginBottom: 18, padding: 14, borderRadius: 16, background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <strong>{error}</strong>
          <button type="button" onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 12, background: "#be123c", color: "#fff", padding: "10px 14px", fontWeight: 800, cursor: "pointer" }}>{ui.retry}</button>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginBottom: 24 }}>
        {cards.map((card) => <Metric key={card.label} {...card} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 18 }}>
        <Panel title={ui.salesMonth} hint={ui.salesHint} action={<Chip>{currentPeriodLabel}</Chip>}>
          <BarChart data={data.sales_by_month} locale={locale} granularity={data.meta.granularity} color="#f59e0b" empty={ui.noData} />
        </Panel>
        <Panel title={ui.ordersMonth} hint={ui.ordersHint} action={<Chip>{currentPeriodLabel}</Chip>}>
          <LineChart data={data.orders_by_month} locale={locale} granularity={data.meta.granularity} stroke="#0f766e" fill="#5eead4" empty={ui.noData} />
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 24 }}>
        <Panel title={ui.usersMonth} hint={ui.usersHint} action={<Chip>{currentPeriodLabel}</Chip>}>
          <LineChart data={data.users_by_month} locale={locale} granularity={data.meta.granularity} stroke="#ea580c" fill="#fdba74" empty={ui.noData} />
        </Panel>
        <Panel title={ui.statusTitle} hint={ui.statusHint} action={<Chip>{n.format(totalStatus)} {ui.ordersLabel}</Chip>}>
          <Donut data={statusData} total={totalStatus} label={ui.ordersLabel} empty={ui.noData} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
            {statusData.map((s) => (
              <div key={s.status} style={{ borderRadius: 18, padding: 14, background: "#fff", border: "1px solid rgba(226,232,240,0.95)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: s.fg, fontWeight: 800, fontSize: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.stroke }} />
                  {s.label}
                </div>
                <div style={{ marginTop: 8, color: "#0f172a", fontWeight: 900, fontSize: 22 }}>{n.format(s.count)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
        <Panel title={ui.latestTitle} hint={ui.latestHint}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ color: "#64748b", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <th style={{ textAlign: rtl ? "right" : "left", paddingBottom: 12 }}>#</th>
                  <th style={{ textAlign: rtl ? "right" : "left", paddingBottom: 12 }}>{ui.customer}</th>
                  <th style={{ textAlign: rtl ? "right" : "left", paddingBottom: 12 }}>{ui.status}</th>
                  <th style={{ textAlign: rtl ? "right" : "left", paddingBottom: 12 }}>{ui.date}</th>
                  <th style={{ textAlign: rtl ? "left" : "right", paddingBottom: 12 }}>{ui.total}</th>
                </tr>
              </thead>
              <tbody>
                {data.latest_orders.length ? data.latest_orders.map((order) => {
                  const meta = STATUS[order.status] || STATUS.pending;
                  return (
                    <tr key={order.id} style={{ borderTop: "1px solid rgba(226,232,240,0.9)" }}>
                      <td style={{ padding: "16px 0", fontWeight: 900, color: "#0f172a" }}>#{order.id}</td>
                      <td style={{ padding: "16px 0" }}>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>{order.customer_name || "-"}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>{order.customer_email || "-"}</div>
                      </td>
                      <td style={{ padding: "16px 0" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: meta.bg, color: meta.fg, fontWeight: 800, fontSize: 12 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.stroke }} />
                          {meta[language] || meta.fr}
                        </span>
                      </td>
                      <td style={{ padding: "16px 0", color: "#475569", fontWeight: 700 }}>{order.created_at ? formatDate(order.created_at, { year: "numeric", month: "short", day: "numeric" }) : "-"}</td>
                      <td style={{ padding: "16px 0", textAlign: rtl ? "left" : "right", fontWeight: 900, color: "#0f172a" }}>{formatMoney(order.total)}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ padding: "18px 0", color: "#64748b", fontWeight: 700 }}>{ui.noData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={ui.topTitle} hint={ui.topHint}>
          <div style={{ display: "grid", gap: 14 }}>
            {data.top_products.length ? data.top_products.map((product, index) => {
              const width = ((Number(product.quantity_sold) || 0) / topMax) * 100;
              return (
                <div key={product.product_id || index} style={{ borderRadius: 22, padding: 18, background: index === 0 ? "linear-gradient(135deg, #fff7ed, #fffbeb)" : "#fff", border: "1px solid rgba(226,232,240,0.95)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ color: "#94a3b8", fontWeight: 800, fontSize: 12 }}>#{index + 1}</div>
                      <div style={{ marginTop: 6, color: "#0f172a", fontWeight: 900, fontSize: 18 }}>{product.name}</div>
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 999, background: "#0f172a", color: "#fff", fontWeight: 800, fontSize: 12 }}>{n.format(product.quantity_sold)} {ui.qtyShort}</div>
                  </div>
                  <div style={{ marginTop: 14, height: 12, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(width, 6)}%`, height: "100%", borderRadius: 999, background: index === 0 ? "linear-gradient(90deg, #ea580c, #f59e0b, #fdba74)" : "linear-gradient(90deg, #0f766e, #14b8a6)" }} />
                  </div>
                  <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                    <div style={{ borderRadius: 16, padding: 12, background: "#fff", border: "1px solid rgba(226,232,240,0.9)" }}>
                      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>{ui.quantity}</div>
                      <div style={{ marginTop: 6, color: "#0f172a", fontSize: 19, fontWeight: 900 }}>{n.format(product.quantity_sold)}</div>
                    </div>
                    <div style={{ borderRadius: 16, padding: 12, background: "#fff", border: "1px solid rgba(226,232,240,0.9)" }}>
                      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>{ui.generated}</div>
                      <div style={{ marginTop: 6, color: "#0f172a", fontSize: 19, fontWeight: 900 }}>{formatMoney(product.revenue)}</div>
                    </div>
                  </div>
                </div>
              );
            }) : <div style={{ color: "#64748b", fontWeight: 700 }}>{ui.noData}</div>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
