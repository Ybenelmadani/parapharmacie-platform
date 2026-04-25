import React from "react";
import { Link } from "react-router-dom";
import { STORE_CITY, STORE_NAME, STORE_SUPPORT_EMAIL, STORE_SUPPORT_PHONE } from "../../config/store";
import { useI18n } from "../../context/I18nContext";
import Container from "./Container";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.1" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M14.1 3h2.55c.18 1.58 1.02 3.06 2.35 3.95.76.51 1.66.8 2.59.85v2.6a7.83 7.83 0 0 1-4.94-1.68v6.29a5.98 5.98 0 1 1-5.21-5.93v2.71a3.34 3.34 0 1 0 2.66 3.26V3Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M13.26 21v-7.45h2.5l.38-2.9h-2.88V8.8c0-.84.23-1.42 1.43-1.42H16.3V4.79c-.28-.04-1.23-.12-2.33-.12-2.31 0-3.89 1.41-3.89 4v2H7.45v2.9h2.63V21h3.18Z" />
    </svg>
  );
}

export default function Footer() {
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      joinCommunity: "Rejoignez la communaute",
      followUs: "Suivez nos nouveautes parapharmacie, dermocosmetiques et conseils bien-etre.",
      help: "Aide",
      shopping: "Shopping",
      moreFrom: "Explorer",
      helpAdvice: "Aide et conseils",
      shippingTax: "Livraison et taxes",
      serviceUpdates: "Mises a jour du service",
      trackOrder: "Suivre ma commande",
      returns: "Retours",
      contact: "Contact",
      productGuides: "Guides routines",
      reviews: "Avis",
      priceMatch: "Prix et offres",
      giftVouchers: "Cartes cadeaux",
      rewardPoints: "Points de fidelite",
      about: "A propos de la boutique",
      artBlog: "Journal sante",
      publications: "Publications",
      artClasses: "Conseils et routines",
      events: "Nouveautes",
      expertCoaching: "Conseils pharma",
      webinars: "Guides pratiques",
      terms: "CGV",
      privacy: "Politique de confidentialite",
      cookies: "Politique de cookies",
      customerService: "Service client",
      hours: "9h - 18h Lun - Ven",
    },
    en: {
      joinCommunity: "Join the community",
      followUs: "Follow our parapharmacy arrivals, dermocosmetic picks, and wellness advice.",
      help: "Help",
      shopping: "Shopping",
      moreFrom: "Explore",
      helpAdvice: "Help & advice",
      shippingTax: "Shipping & tax",
      serviceUpdates: "Service updates",
      trackOrder: "Track my order",
      returns: "Returns",
      contact: "Contact",
      productGuides: "Routine guides",
      reviews: "Reviews",
      priceMatch: "Pricing & offers",
      giftVouchers: "Gift vouchers",
      rewardPoints: "Reward points",
      about: "About the store",
      artBlog: "Health journal",
      publications: "Publications",
      artClasses: "Care routines",
      events: "New arrivals",
      expertCoaching: "Pharma advice",
      webinars: "Practical guides",
      terms: "T&Cs",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
      customerService: "Customer Service",
      hours: "9AM - 6PM Mon - Fri",
    },
    ar: {
      joinCommunity: "انضم إلى المجتمع",
      followUs: "تابع Adwart على شبكاتنا الاجتماعية.",
      help: "المساعدة",
      shopping: "التسوق",
      moreFrom: "المزيد من Adwart",
      helpAdvice: "مساعدة ونصائح",
      shippingTax: "الشحن والضرائب",
      serviceUpdates: "تحديثات الخدمة",
      trackOrder: "تتبع طلبي",
      returns: "المرتجعات",
      contact: "اتصل بنا",
      productGuides: "أدلة المنتجات",
      reviews: "المراجعات",
      priceMatch: "مطابقة السعر",
      giftVouchers: "قسائم الهدايا",
      rewardPoints: "نقاط المكافآت",
      about: "حول Adwart",
      artBlog: "مدونة الفن",
      publications: "المنشورات",
      artClasses: "دروس الفن",
      events: "الفعاليات",
      expertCoaching: "توجيه الخبراء",
      webinars: "الندوات",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      cookies: "سياسة ملفات الارتباط",
      customerService: "خدمة العملاء",
      hours: "9 صباحًا - 6 مساءً من الإثنين إلى الجمعة",
    },
  });

  const socialLinks = [
    { label: "Facebook", href: "https://www.facebook.com", icon: FacebookIcon },
    {
      label: "Instagram",
      href: "https://www.instagram.com",
      icon: InstagramIcon,
    },
    { label: "TikTok", href: "https://www.tiktok.com", icon: TikTokIcon },
  ];

  return (
    <footer className="mt-16 bg-[#0ea5e9] text-white">
      <Container className="py-12 md:py-14">
        <div className="border-b border-white/10 pb-10">
          <h3 className="text-lg font-black uppercase tracking-[0.16em]">{ui.joinCommunity}</h3>
          <p className="mt-2 text-base text-white/70">{ui.followUs}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 p-[2px] text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                aria-label={label}
              >
                <span className="inline-flex h-full w-full items-center justify-center rounded-full">
                  <Icon />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3"> */}
          {/* <div>
            <h4 className="text-lg font-black uppercase tracking-[0.08em]">{ui.help}</h4>
            <ul className="mt-5 space-y-2">
              {helpLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-600 hover:text-slate-900">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* <div>
            <h4 className="text-lg font-black uppercase tracking-[0.08em]">{ui.shopping}</h4>
            <ul className="mt-5 space-y-2">
              {shoppingLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-600 hover:text-slate-900">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* <div>
            <h4 className="text-lg font-black uppercase tracking-[0.08em]">{ui.moreFrom}</h4>
            <ul className="mt-5 space-y-2">
              {moreLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-600 hover:text-slate-900">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
        {/* </div> */}

        <div className="flex flex-col gap-8 border-t border-white/10 pt-7 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 text-sm text-white/60">
            <div className="tracking-[0.06em]">
              <Link className="hover:text-white" to="/info/terms-conditions">
                {ui.terms}
              </Link>{" "}
              |{" "}
              <Link className="hover:text-white" to="/info/privacy-policy">
                {ui.privacy}
              </Link>{" "}
              |{" "}
              <Link className="hover:text-white" to="/info/cookie-policy">
                {ui.cookies}
              </Link>
            </div>
            <p className="tracking-[0.04em]">&copy; {STORE_NAME} 2026</p>
            <p className="tracking-[0.04em]">{ui.customerService}: {STORE_SUPPORT_PHONE} | {ui.hours}</p>
            <p className="tracking-[0.04em]">{STORE_SUPPORT_EMAIL}</p>
            <p className="tracking-[0.04em]">{STORE_CITY}</p>
          </div>
          <div className="text-4xl font-black tracking-[0.18em]">{STORE_NAME}</div>
        </div>
      </Container>

    </footer>
  );
}
