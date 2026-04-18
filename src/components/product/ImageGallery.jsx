import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "../../context/I18nContext";
import MediaImage from "../ui/MediaImage";

export default function ImageGallery({ images = [] }) {
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      product: "Produit",
      noImage: "Aucune image",
      previous: "Image precedente",
      next: "Image suivante",
    },
    en: {
      product: "Product",
      noImage: "No image",
      previous: "Previous image",
      next: "Next image",
    },
    ar: {
      product: "Ù…Ù†ØªØ¬",
      noImage: "Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±Ø©",
      previous: "Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©",
      next: "Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©",
    },
  });

  const ordered = useMemo(() => {
    const main = images.find((image) => image.is_main);
    const rest = images.filter((image) => !image.is_main);
    return main ? [main, ...rest] : images;
  }, [images]);

  const galleryImages = useMemo(
    () =>
      ordered
        .map((image) => ({
          id: image.id,
          src: image.image_path,
        }))
        .filter((image) => image.src),
    [ordered]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [galleryImages.length]);

  const activeImage = galleryImages[activeIndex] || null;
  const hasMultiple = galleryImages.length > 1;

  const goPrevious = () => {
    if (!hasMultiple) return;
    setActiveIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNext = () => {
    if (!hasMultiple) return;
    setActiveIndex((current) => (current + 1) % galleryImages.length);
  };

  return (
    <div className="grid gap-3">
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        {activeImage ? (
          <>
            <MediaImage
              src={activeImage.src}
              alt={ui.product}
              className="h-[320px] w-full object-contain p-4 sm:h-[420px] sm:p-6 lg:h-[520px] lg:p-8"
              decoding="async"
            />

            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  aria-label={ui.previous}
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#03045e] shadow-[0_12px_24px_rgba(55,35,29,0.12)] backdrop-blur transition hover:bg-white"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label={ui.next}
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#03045e] shadow-[0_8px_20px_rgba(3,4,94,0.15)] backdrop-blur transition hover:bg-white"
                >
                  <ChevronRight size={22} />
                </button>

                <div className="absolute bottom-4 right-4 rounded-full bg-[#03045e]/80 px-3 py-1 text-xs font-semibold text-white">
                  {activeIndex + 1}/{galleryImages.length}
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-slate-500 sm:h-[420px] lg:h-[520px]">
            {ui.noImage}
          </div>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {galleryImages.map((image, index) => (
          <button
            key={image.id || index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border bg-white transition ${
              activeIndex === index
                ? "border-[#03045e] shadow-[0_8px_20px_rgba(3,4,94,0.18)]"
                : "border-slate-200 opacity-60 hover:opacity-100 hover:shadow-sm"
            }`}
          >
            <MediaImage src={image.src} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
