import React, { useMemo, useState } from "react";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AdvisorAPI } from "../../api/advisor";
import { resolveMediaUrl } from "../../utils/media";
import { formatMoney } from "../../utils/currency";
import { useI18n } from "../../context/I18nContext";

function ProductSuggestionCard({ product, ui }) {
  const image = resolveMediaUrl(product?.image_path);

  return (
    <div className="min-w-0 rounded-[22px] border border-[#cfe2f7] bg-white/90 p-3 shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#eef7ff]">
          {image ? (
            <img src={image} alt={product?.name || ui.productFallback} className="h-full w-full object-contain p-1.5" />
          ) : (
            <div className="px-2 text-center text-[11px] text-slate-400">{ui.noImage}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[#123a63]">{product?.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {[product?.brand?.name, product?.category?.name].filter(Boolean).join(" - ")}
          </div>
          {product?.price != null ? (
            <div className="mt-2 text-sm font-semibold text-[#0f766e]">{formatMoney(product.price)}</div>
          ) : null}
        </div>
      </div>
      {product?.description ? (
        <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">{product.description}</p>
      ) : null}
      <Link
        to={`/products/${product?.id}`}
        className="mt-3 inline-flex min-h-[38px] w-full items-center justify-center rounded-full bg-[#0f5fa8] px-4 text-sm font-semibold text-white transition hover:bg-[#0c4e8c] sm:w-auto"
      >
        {ui.viewProduct}
      </Link>
    </div>
  );
}

export default function AdvisorWidget() {
  const location = useLocation();
  const { pick, language, dir } = useI18n();
  const ui = pick({
    fr: {
      open: "Conseiller AI",
      title: "Conseiller Parapharmacie",
      subtitle: "Je vous aide a trouver les bons produits selon votre besoin, votre peau et votre budget.",
      placeholder: "Expliquez votre besoin...",
      send: "Envoyer",
      close: "Fermer",
      welcome:
        "Bonjour, je peux vous aider a trouver rapidement les bons produits. Dites-moi votre besoin principal.",
      safety:
        "Conseil shopping uniquement. Pour un probleme medical, une grossesse, une allergie ou une reaction importante, demandez conseil a un pharmacien ou un medecin.",
      quickNeed: "Essayer une suggestion",
      suggestion1: "J'ai la peau seche et sensible",
      suggestion2: "Je cherche une routine anti-acne",
      suggestion3: "Je veux un produit pour bebe",
      loading: "Je prepare une recommandation...",
      viewProduct: "Voir le produit",
      askLabel: "Questions utiles",
      emptyReply: "Je peux vous aider a affiner votre recherche avec quelques questions simples.",
      productFallback: "Produit",
      noImage: "Aucune image",
    },
    en: {
      open: "AI Advisor",
      title: "Parapharmacy Advisor",
      subtitle: "I help shoppers find the right products based on need, skin profile, and budget.",
      placeholder: "Describe your need...",
      send: "Send",
      close: "Close",
      welcome:
        "Hello, I can help you find the right products quickly. Tell me your main need.",
      safety:
        "Shopping advice only. For medical concerns, pregnancy, allergies, or strong reactions, please ask a pharmacist or doctor.",
      quickNeed: "Try a suggestion",
      suggestion1: "I have dry and sensitive skin",
      suggestion2: "I need an anti-acne routine",
      suggestion3: "I want a baby care product",
      loading: "Preparing a recommendation...",
      viewProduct: "View product",
      askLabel: "Helpful questions",
      emptyReply: "I can help narrow things down with a few simple questions.",
      productFallback: "Product",
      noImage: "No image",
    },
    ar: {
      open: "Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ",
      title: "Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø¨Ø§Ø±Ø§ÙØ§Ø±Ù…Ø§Ø³ÙŠ",
      subtitle: "Ø£Ø³Ø§Ø¹Ø¯Ùƒ ÙÙŠ Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ø¬Ø© ÙˆØ§Ù„Ø¨Ø´Ø±Ø© ÙˆØ§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ©.",
      placeholder: "Ø§ÙƒØªØ¨ Ø§Ø­ØªÙŠØ§Ø¬Ùƒ...",
      send: "Ø¥Ø±Ø³Ø§Ù„",
      close: "Ø¥ØºÙ„Ø§Ù‚",
      welcome:
        "Ù…Ø±Ø­Ø¨Ø§ØŒ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ ÙÙŠ Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ø¨Ø³Ø±Ø¹Ø©. Ø§ÙƒØªØ¨ Ø§Ø­ØªÙŠØ§Ø¬Ùƒ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ.",
      safety:
        "Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ù„Ù„ØªØ³ÙˆÙ‚ ÙÙ‚Ø·. ÙÙŠ Ø­Ø§Ù„Ø© Ù…Ø´ÙƒÙ„Ø© Ø·Ø¨ÙŠØ© Ø£Ùˆ Ø­Ù…Ù„ Ø£Ùˆ Ø­Ø³Ø§Ø³ÙŠØ© Ø£Ùˆ Ø±Ø¯ ÙØ¹Ù„ Ù‚ÙˆÙŠØŒ ÙŠØ±Ø¬Ù‰ Ø§Ø³ØªØ´Ø§Ø±Ø© ØµÙŠØ¯Ù„ÙŠ Ø£Ùˆ Ø·Ø¨ÙŠØ¨.",
      quickNeed: "Ø§Ø®ØªØ± Ø§Ù‚ØªØ±Ø§Ø­Ø§Ù‹",
      suggestion1: "Ø¨Ø´Ø±ØªÙŠ Ø¬Ø§ÙØ© ÙˆØ­Ø³Ø§Ø³Ø©",
      suggestion2: "Ø£Ø±ÙŠØ¯ Ø±ÙˆØªÙŠÙ† Ù„Ø­Ø¨ Ø§Ù„Ø´Ø¨Ø§Ø¨",
      suggestion3: "Ø£Ø±ÙŠØ¯ Ù…Ù†ØªØ¬Ø§Ù‹ Ù„Ù„Ø·ÙÙ„",
      loading: "Ø£Ø¬Ù‡Ø² Ø§Ù„ØªÙˆØµÙŠØ§Øª...",
      viewProduct: "Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù†ØªØ¬",
      askLabel: "Ø£Ø³Ø¦Ù„Ø© Ù…ÙÙŠØ¯Ø©",
      emptyReply: "ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ Ø£ÙƒØ«Ø± Ù…Ù† Ø®Ù„Ø§Ù„ Ø¨Ø¹Ø¶ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø¨Ø³ÙŠØ·Ø©.",
      productFallback: "Ù…Ù†ØªØ¬",
      noImage: "Ù„Ø§ ØµÙˆØ±Ø©",
    },
  });

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: ui.welcome,
      disclaimer: ui.safety,
      questions: [],
      products: [],
    },
  ]);

  const quickSuggestions = useMemo(
    () => [ui.suggestion1, ui.suggestion2, ui.suggestion3].filter(Boolean),
    [ui.suggestion1, ui.suggestion2, ui.suggestion3]
  );

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const sendMessage = async (text) => {
    const content = String(text || "").trim();
    if (!content || loading) return;

    const nextUserMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content,
    };

    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await AdvisorAPI.chat({
        language,
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          content: response?.reply || ui.emptyReply,
          disclaimer: response?.disclaimer || "",
          questions: Array.isArray(response?.questions) ? response.questions : [],
          products: Array.isArray(response?.products) ? response.products : [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant_error_${Date.now()}`,
          role: "assistant",
          content: ui.emptyReply,
          disclaimer: ui.safety,
          questions: [],
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-[70] bg-slate-950/18 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-0">
          <div
            className={`fixed inset-x-2 bottom-2 top-[72px] flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#082a4a] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,250,255,0.98)_100%)] shadow-[0_28px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:top-auto sm:h-[min(78vh,720px)] sm:w-[min(100vw-2rem,390px)] ${
              dir === "rtl" ? "sm:left-4 sm:right-auto" : "sm:right-4 sm:left-auto"
            }`}
            dir={dir}
          >
            <div className="border-b border-[#d9e8f8] bg-[linear-gradient(135deg,#dff2ff_0%,#cbe7ff_100%)] px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-[#021d38] sm:text-lg">{ui.title}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/75 text-[#0c5a94] transition hover:bg-white"
                  aria-label={ui.close}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[94%] sm:max-w-[92%] ${message.role === "user" ? "items-end" : "items-start"} flex min-w-0 flex-col gap-2`}>
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {message.role === "user" ? <User size={12} /> : <Bot size={12} />}
                      <span>{message.role === "user" ? "Vous" : ui.open}</span>
                    </div>

                    <div
                      className={`rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === "user"
                          ? "bg-[#0f5fa8] text-white"
                          : "border border-[#d7e8f8] bg-white text-slate-700"
                      } overflow-hidden break-words whitespace-pre-wrap`}
                    >
                      {message.content}
                    </div>

                    {message.questions?.length ? (
                      <div className="rounded-[20px] border border-[#d7e8f8] bg-[#f4f9ff] px-4 py-3 text-sm text-slate-700">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0c5a94]">
                          {ui.askLabel}
                        </div>
                        <div className="space-y-2">
                          {message.questions.map((question, index) => (
                            <button
                              key={`${message.id}_question_${index}`}
                              type="button"
                              onClick={() => sendMessage(question)}
                              className="block w-full rounded-2xl bg-white px-3 py-3 text-left leading-5 transition hover:bg-[#eaf4ff]"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {message.products?.length ? (
                      <div className="grid w-full min-w-0 gap-3">
                        {message.products.map((product) => (
                          <ProductSuggestionCard key={`${message.id}_product_${product.id}`} product={product} ui={ui} />
                        ))}
                      </div>
                    ) : null}

                      {/* // <div className="rounded-[18px] bg-[#fef7e8] px-3 py-2 text-xs leading-5 text-[#8a6224]">
                      //   {message.disclaimer}
                      // </div> */}
                    
                  </div>
                </div>
              ))}

              {messages.length === 1 ? (
                <div className="rounded-[22px] border border-[#d7e8f8] bg-white/80 p-3 sm:p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0c5a94]">
                    {ui.quickNeed}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        className="rounded-full border border-[#cde3f9] bg-white px-3 py-2 text-sm text-[#123a63] transition hover:border-[#a8cff4] hover:bg-[#f4f9ff]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="rounded-[18px] border border-[#d7e8f8] bg-white px-4 py-3 text-sm text-slate-500">
                  {ui.loading}
                </div>
              ) : null}
            </div>

            <div className="border-t border-[#d9e8f8] bg-white/90 px-3 py-3 sm:px-4 sm:py-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={ui.placeholder}
                  className="max-h-32 min-h-[48px] flex-1 resize-none rounded-[18px] border border-[#cde3f9] bg-[#f7fbff] px-4 py-3 text-sm leading-5 text-slate-700 outline-none transition focus:border-[#7fb8eb] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f5fa8] text-white transition hover:bg-[#0c4e8c] disabled:cursor-not-allowed disabled:bg-[#9fc3e3]"
                  aria-label={ui.send}
                >
                  <Send size={17} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed z-[70] inline-flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b3d91_0%,#0f2f6b_100%)] text-white shadow-[0_20px_44px_rgba(11,61,145,0.35)] transition hover:-translate-y-0.5 ${
          open ? "pointer-events-none translate-y-4 opacity-0" : "bottom-4 opacity-100"
        } ${dir === "rtl" ? "left-4" : "right-4"}`}
        aria-hidden={open}
        aria-label={ui.open}
      >
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
          <MessageCircle size={19} strokeWidth={2.1} />
          <span className="absolute -bottom-1 -right-2 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#0f5fa8] shadow-[0_8px_18px_rgba(15,95,168,0.2)]">
            AI
          </span>
        </span>
      </button>
    </>
  );
}
