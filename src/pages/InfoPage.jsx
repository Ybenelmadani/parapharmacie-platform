import React from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import Button from "../components/ui/Button";
import Container from "../components/layout/Container";
import { STORE_CITY, STORE_NAME, STORE_SUPPORT_EMAIL, STORE_SUPPORT_PHONE } from "../config/store";
import { useI18n } from "../context/I18nContext";
import aboutMainImage from "../assets/landing2.jpg";
import aboutStoreImage from "../assets/para.jfif";

const STORE_MAP_QUERY = encodeURIComponent(STORE_CITY);
const STORE_MAP_EMBED_URL = `https://www.google.com/maps?q=${STORE_MAP_QUERY}&z=15&output=embed`;
const STORE_MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${STORE_MAP_QUERY}`;

function buildInfoContent(ui) {
  return {
    "terms-conditions": {
      title: ui.termsTitle,
      lead: ui.termsLead.replace("{store}", STORE_NAME),
      sections: [ui.terms1, ui.terms2, ui.terms3],
    },
    "privacy-policy": {
      title: ui.privacyTitle,
      lead: ui.privacyLead,
      sections: [ui.privacy1, ui.privacy2, ui.privacy3],
    },
    "cookie-policy": {
      title: ui.cookieTitle,
      lead: ui.cookieLead,
      sections: [ui.cookie1, ui.cookie2],
    },
    "help-advice": { title: ui.helpTitle, lead: ui.helpLead },
    "shipping-tax": {
      title: ui.shippingTitle,
      lead: ui.shippingLead,
      sections: [ui.shipping1, ui.shipping2, ui.shipping3],
    },
    "service-updates": { title: ui.serviceTitle, lead: ui.serviceLead },
    returns: {
      title: ui.returnsTitle,
      lead: ui.returnsLead,
      sections: [ui.returns1, ui.returns2, ui.returns3],
    },
    contact: {
      title: ui.contactTitle,
      lead: ui.contactLead,
      sections: [`Phone: ${STORE_SUPPORT_PHONE}`, `Email: ${STORE_SUPPORT_EMAIL}`, `Location: ${STORE_CITY}`],
    },
    "product-guides": { title: ui.productGuidesTitle, lead: ui.productGuidesLead },
    reviews: { title: ui.reviewsTitle, lead: ui.reviewsLead },
    "price-match": { title: ui.priceMatchTitle, lead: ui.priceMatchLead },
    "gift-vouchers": { title: ui.giftVouchersTitle, lead: ui.giftVouchersLead },
    "reward-points": { title: ui.rewardPointsTitle, lead: ui.rewardPointsLead },
    "about-artstore": {
      title: ui.aboutTitle.replace("{store}", STORE_NAME),
      lead: ui.aboutLead,
      sections: [ui.about1.replace("{store}", STORE_NAME), ui.about2],
    },
    "art-blog": { title: ui.artBlogTitle, lead: ui.artBlogLead },
    publications: { title: ui.publicationsTitle, lead: ui.publicationsLead },
    "art-classes": { title: ui.artClassesTitle, lead: ui.artClassesLead },
    events: { title: ui.eventsTitle, lead: ui.eventsLead },
    "expert-coaching": { title: ui.expertCoachingTitle, lead: ui.expertCoachingLead },
    webinars: { title: ui.webinarsTitle, lead: ui.webinarsLead },
  };
}

export default function InfoPage() {
  const { slug = "" } = useParams();
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      infoLabel: "Infos {store}",
      backHome: "Retour a l'accueil",
      defaultTitle: "Information",
      defaultLead: "La page d'information demandee arrive bientot.",
      default1: "Cette page pour {store} est en cours de finalisation.",
      default2: "Pour une aide urgente, contactez {email} ou {phone}.",
      termsTitle: "Conditions generales",
      termsLead: "Consultez les conditions qui encadrent les achats, l'utilisation et les services sur {store}.",
      terms1: "Les commandes sont soumises a la disponibilite du stock et a la validation finale par la boutique.",
      terms2: "Les prix, promotions, details de livraison et conditions de retour doivent correspondre au dernier accord commercial.",
      terms3: "Pour tout litige ou besoin de clarification, contactez le support client avant de confirmer la commande.",
      privacyTitle: "Politique de confidentialite",
      privacyLead: "Decouvrez comment nous collectons, utilisons et protegeons vos donnees personnelles.",
      privacy1: "Les donnees personnelles servent uniquement a la gestion du compte, au traitement des commandes, a la livraison et au support client.",
      privacy2: "Les operations sensibles comme la reinitialisation du mot de passe et l'acces au compte sont protegees par des parcours authentifies.",
      privacy3: "Le texte legal final doit etre valide avant la mise en ligne publique.",
      cookieTitle: "Politique de cookies",
      cookieLead: "Comprenez comment les cookies sont utilises pour ameliorer votre navigation.",
      cookie1: "Les cookies servent a maintenir les sessions actives et a conserver des preferences utiles comme le panier invite.",
      cookie2: "Les cookies d'analyse ou publicitaires ne doivent etre actives qu'apres validation du dispositif de suivi.",
      helpTitle: "Aide et conseils",
      helpLead: "Obtenez des conseils pratiques avant et apres votre achat.",
      shippingTitle: "Livraison et taxes",
      shippingLead: "Estimations de livraison, frais de port et informations fiscales.",
      shipping1: "Les frais de livraison sont calcules et affiches clairement au paiement avant la confirmation de commande.",
      shipping2: "Les delais dependent de la destination, du stock disponible et de la validation de la commande.",
      shipping3: "Les informations fiscales doivent etre alignees avec les regles comptables du business avant le lancement.",
      serviceTitle: "Mises a jour du service",
      serviceLead: "Dernieres mises a jour de la plateforme et des livraisons.",
      returnsTitle: "Retours",
      returnsLead: "Comprenez les conditions d'eligibilite, les delais et le processus de remboursement.",
      returns1: "L'eligibilite au retour depend de l'etat du produit, du delai de retour et de la preuve d'achat.",
      returns2: "Les articles ouverts ou personnalises peuvent necessiter un traitement particulier selon la politique du magasin.",
      returns3: "Les remboursements et echanges doivent etre valides manuellement par le support jusqu'a definition du flux final.",
      contactTitle: "Contact",
      contactLead: "Contactez notre service client pour toute aide sur les commandes ou le compte.",
      contactPhone: "Telephone",
      contactEmail: "Email",
      contactLocation: "Adresse du magasin",
      contactMapTitle: "Trouver le magasin",
      contactMapDescription: "Visualisez l'emplacement du magasin et ouvrez l'itineraire en un clic.",
      contactOpenMap: "Ouvrir dans Google Maps",
      productGuidesTitle: "Guides produits",
      productGuidesLead: "Trouvez des recommandations pour choisir le bon soin, le bon format et le bon usage.",
      reviewsTitle: "Avis",
      reviewsLead: "Decouvrez les retours partages par les clientes et les acheteurs.",
      priceMatchTitle: "Alignement des prix",
      priceMatchLead: "Demandez une revision du prix si vous trouvez une offre equivalente moins chere.",
      giftVouchersTitle: "Cartes cadeaux",
      giftVouchersLead: "Achetez et utilisez des cartes cadeaux pour amis, etudiants et equipes.",
      rewardPointsTitle: "Points de fidelite",
      rewardPointsLead: "Cumulez des points et debloquez des avantages sur les commandes eligibles.",
      aboutTitle: "A propos de {store}",
      aboutLead: "Notre mission est de rendre les soins, la dermocosmetique et le bien-etre plus accessibles.",
      about1: "{store} se concentre sur la parapharmacie, les soins du quotidien et une experience d'achat plus fluide pour les clients.",
      about2: "La vitrine, le panier, le paiement et les outils admin sont concus pour gerer un vrai catalogue et de vraies commandes.",
      artBlogTitle: "Journal sante",
      artBlogLead: "Actualites, conseils et inspiration de notre equipe editoriale.",
      publicationsTitle: "Publications",
      publicationsLead: "Parcourez des ressources telechargeables et des publications editoriales.",
      artClassesTitle: "Routines et conseils",
      artClassesLead: "Retrouvez des guides simples pour construire une routine de soin plus claire et plus utile.",
      eventsTitle: "Evenements",
      eventsLead: "Prochains lancements, pop-ups et evenements de marque.",
      expertCoachingTitle: "Coaching expert",
      expertCoachingLead: "Reservez un accompagnement pratique autour des routines, textures et choix de produits.",
      webinarsTitle: "Webinaires",
      webinarsLead: "Rejoignez des sessions gratuites ou premium autour des routines, textures et usages.",
    },
    en: {
      infoLabel: "{store} Info",
      backHome: "Back home",
      defaultTitle: "Information",
      defaultLead: "The requested information page is available soon.",
      default1: "This page for {store} is being finalized.",
      default2: "For urgent help, contact {email} or {phone}.",
      termsTitle: "Terms & Conditions",
      termsLead: "Read the terms that govern purchases, usage, and services on {store}.",
      terms1: "Orders are subject to stock availability and final validation by the store.",
      terms2: "Prices, promotions, shipping details, and return conditions must match the latest commercial agreement.",
      terms3: "For any dispute or clarification, contact customer support before confirming the order.",
      privacyTitle: "Privacy Policy",
      privacyLead: "Learn how we collect, use, and protect your personal data.",
      privacy1: "Personal data is used only for account management, order processing, delivery, and customer support.",
      privacy2: "Sensitive operations such as password reset and account access are protected by authenticated flows.",
      privacy3: "Any final legal wording should be validated before public launch.",
      cookieTitle: "Cookie Policy",
      cookieLead: "Understand how cookies are used to improve your browsing experience.",
      cookie1: "Cookies are used to keep sessions active and preserve useful store preferences such as the guest cart.",
      cookie2: "Analytics or advertising cookies should only be enabled once the client validates the tracking setup.",
      helpTitle: "Help & Advice",
      helpLead: "Get practical guidance before and after your purchase.",
      shippingTitle: "Shipping & Tax",
      shippingLead: "Delivery estimates, shipping fees, and tax information.",
      shipping1: "Shipping fees are calculated and displayed clearly during checkout before order confirmation.",
      shipping2: "Delivery times depend on destination, stock availability, and order validation.",
      shipping3: "Tax details should be aligned with the accounting rules used by the business before go-live.",
      serviceTitle: "Service Updates",
      serviceLead: "Latest platform and delivery status updates.",
      returnsTitle: "Returns",
      returnsLead: "Understand return eligibility, deadlines, and refund process.",
      returns1: "Return eligibility depends on product condition, return window, and proof of purchase.",
      returns2: "Opened or customized items may require special handling depending on the store policy.",
      returns3: "Refunds and exchanges should be validated manually by support until the client defines the exact workflow.",
      contactTitle: "Contact",
      contactLead: "Reach our customer service team for order or account support.",
      contactPhone: "Phone",
      contactEmail: "Email",
      contactLocation: "Store address",
      contactMapTitle: "Find the store",
      contactMapDescription: "See the store location and open directions in one click.",
      contactOpenMap: "Open in Google Maps",
      productGuidesTitle: "Product Guides",
      productGuidesLead: "Find recommendations to choose the right care product, format, and usage.",
      reviewsTitle: "Reviews",
      reviewsLead: "Discover feedback shared by customers and buyers.",
      priceMatchTitle: "Price Match",
      priceMatchLead: "Request a price review when you find an equivalent lower offer.",
      giftVouchersTitle: "Gift Vouchers",
      giftVouchersLead: "Buy and redeem vouchers for friends, students, and teams.",
      rewardPointsTitle: "Reward Points",
      rewardPointsLead: "Collect points and unlock benefits on eligible orders.",
      aboutTitle: "About {store}",
      aboutLead: "Our mission is to make care, dermocosmetics, and wellness more accessible.",
      about1: "{store} focuses on parapharmacy products, daily care, and a smoother buying experience for customers.",
      about2: "The storefront, cart, checkout, and admin tooling are designed to support real catalog management and order handling.",
      artBlogTitle: "Health Journal",
      artBlogLead: "News, care advice, and inspiration from our editorial team.",
      publicationsTitle: "Publications",
      publicationsLead: "Browse downloadable resources and editorial publications.",
      artClassesTitle: "Routines & Tips",
      artClassesLead: "Find simple guidance to build clearer and more practical care routines.",
      eventsTitle: "Events",
      eventsLead: "Upcoming launches, pop-ups, and brand events.",
      expertCoachingTitle: "Expert Coaching",
      expertCoachingLead: "Book practical guidance around routines, textures, and product choices.",
      webinarsTitle: "Webinars",
      webinarsLead: "Join free and premium sessions about routines, textures, and usage.",
    },
    ar: {
      infoLabel: "معلومات {store}",
      backHome: "العودة للرئيسية",
      defaultTitle: "معلومة",
      defaultLead: "صفحة المعلومات المطلوبة ستكون متاحة قريبًا.",
      default1: "هذه الصفحة الخاصة بـ {store} قيد الإعداد.",
      default2: "للمساعدة العاجلة، تواصل مع {email} أو {phone}.",
      termsTitle: "الشروط والأحكام",
      termsLead: "اقرأ الشروط التي تنظم الشراء والاستخدام والخدمات على {store}.",
      terms1: "الطلبات تخضع لتوفر المخزون والموافقة النهائية من المتجر.",
      terms2: "يجب أن تتوافق الأسعار والعروض وتفاصيل الشحن وشروط الإرجاع مع آخر اتفاق تجاري.",
      terms3: "لأي نزاع أو استفسار، تواصل مع خدمة العملاء قبل تأكيد الطلب.",
      privacyTitle: "سياسة الخصوصية",
      privacyLead: "تعرف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
      privacy1: "تستخدم البيانات الشخصية فقط لإدارة الحساب ومعالجة الطلبات والتوصيل وخدمة العملاء.",
      privacy2: "العمليات الحساسة مثل إعادة تعيين كلمة المرور والوصول إلى الحساب محمية بمسارات مصادقة.",
      privacy3: "يجب مراجعة الصياغة القانونية النهائية قبل الإطلاق العام.",
      cookieTitle: "سياسة ملفات تعريف الارتباط",
      cookieLead: "افهم كيف تُستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح.",
      cookie1: "تُستخدم ملفات تعريف الارتباط للحفاظ على الجلسات وحفظ تفضيلات المتجر مثل سلة الزائر.",
      cookie2: "يجب تفعيل ملفات التحليلات أو الإعلانات فقط بعد اعتماد إعداد التتبع.",
      helpTitle: "مساعدة ونصائح",
      helpLead: "احصل على إرشادات عملية قبل الشراء وبعده.",
      shippingTitle: "الشحن والضرائب",
      shippingLead: "تقديرات التوصيل ورسوم الشحن والمعلومات الضريبية.",
      shipping1: "يتم احتساب رسوم الشحن وعرضها بوضوح أثناء الدفع قبل تأكيد الطلب.",
      shipping2: "تعتمد مدة التوصيل على الوجهة وتوفر المخزون وتأكيد الطلب.",
      shipping3: "يجب مواءمة التفاصيل الضريبية مع القواعد المحاسبية المعتمدة قبل الإطلاق.",
      serviceTitle: "تحديثات الخدمة",
      serviceLead: "آخر تحديثات المنصة وحالة التوصيل.",
      returnsTitle: "المرتجعات",
      returnsLead: "تعرف على شروط الإرجاع والمواعيد وآلية الاسترداد.",
      returns1: "تعتمد أهلية الإرجاع على حالة المنتج وفترة الإرجاع وإثبات الشراء.",
      returns2: "قد تتطلب المنتجات المفتوحة أو المخصصة معالجة خاصة حسب سياسة المتجر.",
      returns3: "يجب اعتماد عمليات الاسترداد والاستبدال يدويًا من الدعم حتى يتم تحديد المسار النهائي.",
      contactTitle: "اتصل بنا",
      contactLead: "تواصل مع خدمة العملاء لدينا للدعم المتعلق بالطلبات أو الحساب.",
      contactPhone: "الهاتف",
      contactEmail: "البريد الإلكتروني",
      contactLocation: "عنوان المتجر",
      contactMapTitle: "العثور على المتجر",
      contactMapDescription: "اعرض موقع المتجر وافتح الاتجاهات بنقرة واحدة.",
      contactOpenMap: "افتح في Google Maps",
      productGuidesTitle: "أدلة المنتجات",
      productGuidesLead: "اعثر على توصيات لاختيار المواد الفنية المناسبة.",
      reviewsTitle: "المراجعات",
      reviewsLead: "اكتشف آراء الفنانين والمشترين.",
      priceMatchTitle: "مطابقة السعر",
      priceMatchLead: "اطلب مراجعة السعر عندما تجد عرضًا مماثلًا بسعر أقل.",
      giftVouchersTitle: "قسائم الهدايا",
      giftVouchersLead: "اشتر واستخدم القسائم للأصدقاء والطلاب والفرق.",
      rewardPointsTitle: "نقاط المكافآت",
      rewardPointsLead: "اجمع النقاط وافتح مزايا في الطلبات المؤهلة.",
      aboutTitle: "حول {store}",
      aboutLead: "مهمتنا هي تسهيل الوصول إلى مستلزمات إبداعية عالية الجودة.",
      about1: "يركز {store} على مواد الفن ومنتجات الرسم وتجربة شراء أكثر سلاسة للعملاء.",
      about2: "تم تصميم الواجهة والسلة والدفع وأدوات الإدارة لدعم إدارة كتالوج حقيقي ومعالجة الطلبات.",
      artBlogTitle: "مدونة الفن",
      artBlogLead: "أخبار ودروس وإلهام من فريقنا التحريري.",
      publicationsTitle: "المنشورات",
      publicationsLead: "تصفح موارد قابلة للتنزيل ومنشورات تحريرية.",
      artClassesTitle: "دروس الفن",
      artClassesLead: "اعثر على دروس للمبتدئين والمتقدمين عبر الإنترنت أو حضوريًا.",
      eventsTitle: "الفعاليات",
      eventsLead: "العروض والمعارض والفعاليات القادمة في المتجر.",
      expertCoachingTitle: "توجيه الخبراء",
      expertCoachingLead: "احجز إرشادًا عمليًا مع مرشدين فنيين ذوي خبرة.",
      webinarsTitle: "الندوات",
      webinarsLead: "انضم إلى جلسات مجانية ومدفوعة حول الأدوات والتقنيات.",
    },
  });

  const content = buildInfoContent(ui);
  const info = content[slug] || {
    title: ui.defaultTitle,
    lead: ui.defaultLead,
    sections: [
      ui.default1.replace("{store}", STORE_NAME),
      ui.default2.replace("{email}", STORE_SUPPORT_EMAIL).replace("{phone}", STORE_SUPPORT_PHONE),
    ],
  };
  const isContactPage = slug === "contact";
  const isAboutPage = slug === "about-artstore";
  const contactItems = [
    { key: "phone", label: ui.contactPhone, value: STORE_SUPPORT_PHONE, href: `tel:${STORE_SUPPORT_PHONE.replace(/\s+/g, "")}`, icon: Phone, dir: "ltr" },
    { key: "email", label: ui.contactEmail, value: STORE_SUPPORT_EMAIL, href: `mailto:${STORE_SUPPORT_EMAIL}`, icon: Mail, dir: "ltr" },
    { key: "location", label: ui.contactLocation, value: STORE_CITY, href: STORE_MAP_LINK, icon: MapPin },
  ];

  return (
    <Container className="py-8 sm:py-10 md:py-14">
      <div className={`mx-auto rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-10 ${isContactPage || isAboutPage ? "max-w-6xl" : "max-w-3xl"}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">{ui.infoLabel.replace("{store}", STORE_NAME)}</div>
        <h1 className="mt-3 text-[2rem] font-black leading-none text-slate-900 sm:text-3xl md:text-4xl">{info.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{info.lead}</p>

        {isContactPage ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
            <div className="space-y-4">
              {contactItems.map(({ key, label, value, href, icon: Icon, dir }) => (
                <a
                  key={key}
                  href={href}
                  target={key === "location" ? "_blank" : undefined}
                  rel={key === "location" ? "noreferrer" : undefined}
                  className="group flex min-w-0 items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white sm:gap-4 sm:px-5"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white sm:h-12 sm:w-12">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">{label}</span>
                    <span className="mt-2 block break-words text-sm font-semibold leading-6 text-slate-900 sm:text-base" dir={dir}>
                      {value}
                    </span>
                  </span>
                </a>
              ))}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
                <div className="text-sm font-semibold text-slate-900">{ui.contactMapTitle}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{ui.contactMapDescription}</p>
                <a
                  href={STORE_MAP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700"
                >
                  {ui.contactOpenMap}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{STORE_NAME}</div>
                  <div className="mt-1 truncate text-sm text-slate-500">{STORE_CITY}</div>
                </div>
                <a
                  href={STORE_MAP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  aria-label={ui.contactOpenMap}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <iframe
                title={`${STORE_NAME} map`}
                src={STORE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[300px] w-full border-0 sm:h-[360px] md:h-[420px]"
              />
            </div>
          </div>
        ) : isAboutPage ? (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
              {(info.sections || []).map((section) => (
                <p key={section}>{section}</p>
              ))}

              <div className="rounded-[24px] border border-sky-100 bg-sky-50 px-5 py-4 text-sm text-slate-700">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{STORE_NAME}</div>
                <div className="mt-2 font-semibold text-slate-900">{STORE_CITY}</div>
                <div className="mt-1">{STORE_SUPPORT_EMAIL}</div>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
                <img
                  src={aboutMainImage}
                  alt={info.title}
                  className="h-[320px] w-full object-cover sm:h-[420px] md:h-[460px]"
                  loading="lazy"
                />
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-white bg-white p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)] sm:ml-auto sm:mt-[-120px] sm:max-w-[260px]">
                <img
                  src={aboutStoreImage}
                  alt={STORE_NAME}
                  className="h-[180px] w-full rounded-[18px] object-cover sm:h-[220px]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
            {(info.sections || []).map((section) => (
              <p key={section}>{section}</p>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link to="/">
            <Button>{ui.backHome}</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
