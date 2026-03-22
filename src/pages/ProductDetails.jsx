import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CatalogAPI } from "../api/catalog";
import { ReviewsAPI } from "../api/reviews";
import ImageGallery from "../components/product/ImageGallery";
import VariantPicker from "../components/product/VariantPicker";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Price from "../components/ui/Price";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useI18n } from "../context/I18nContext";
import { useToast } from "../context/ToastContext";

const LOW_STOCK_LIMIT = 10;

export default function ProductDetails() {
  const { id } = useParams();
  const { add } = useCart();
  const { user } = useAuth();
  const { pick } = useI18n();
  const { success, error: notifyError } = useToast();
  const ui = pick({
    fr: {
      loadError: "Impossible de charger ce produit pour le moment.",
      outOfStock: "En rupture",
      lowStock: "Stock faible ({count})",
      inStock: "En stock ({count})",
      loading: "Chargement...",
      shop: "Boutique",
      chooseVariant: "Choisir une variante",
      chooseVariantError: "Veuillez choisir une variante avant d'ajouter au panier.",
      addToCart: "Ajouter au panier",
      price: "Prix",
      reviews: "Avis",
      shareFeedback: "Partagez votre retour apres votre achat.",
      loginToReview: "Veuillez vous connecter pour laisser un avis.",
      rating: "Note (1-5)",
      comment: "Commentaire",
      commentPlaceholder: "Votre commentaire...",
      loginBeforeReview: "Veuillez vous connecter avant d'envoyer un avis.",
      submitted: "Avis envoye avec succes.",
      submitError: "Impossible d'envoyer votre avis.",
      submit: "Envoyer",
      noReviews: "Aucun avis pour le moment.",
      dash: "—",
    },
    en: {
      loadError: "Unable to load this product right now.",
      outOfStock: "Out of stock",
      lowStock: "Low stock ({count})",
      inStock: "In stock ({count})",
      loading: "Loading...",
      shop: "Shop",
      chooseVariant: "Choose variant",
      chooseVariantError: "Please choose a variant before adding to cart.",
      addToCart: "Add to cart",
      price: "Price",
      reviews: "Reviews",
      shareFeedback: "Share your feedback after your purchase.",
      loginToReview: "Please login to leave a review.",
      rating: "Rating (1-5)",
      comment: "Comment",
      commentPlaceholder: "Your comment...",
      loginBeforeReview: "Please login before submitting a review.",
      submitted: "Review submitted successfully.",
      submitError: "Unable to submit your review.",
      submit: "Submit",
      noReviews: "No reviews yet.",
      dash: "-",
    },
    ar: {
      loadError: "تعذر تحميل هذا المنتج حالياً.",
      outOfStock: "غير متوفر",
      lowStock: "مخزون منخفض ({count})",
      inStock: "متوفر ({count})",
      loading: "جارٍ التحميل...",
      shop: "المتجر",
      chooseVariant: "اختر الخيار",
      chooseVariantError: "يرجى اختيار خيار قبل الإضافة إلى السلة.",
      addToCart: "أضف إلى السلة",
      price: "السعر",
      reviews: "المراجعات",
      shareFeedback: "شارك رأيك بعد الشراء.",
      loginToReview: "يرجى تسجيل الدخول لترك مراجعة.",
      rating: "التقييم (1-5)",
      comment: "التعليق",
      commentPlaceholder: "تعليقك...",
      loginBeforeReview: "يرجى تسجيل الدخول قبل إرسال المراجعة.",
      submitted: "تم إرسال المراجعة بنجاح.",
      submitError: "تعذر إرسال المراجعة.",
      submit: "إرسال",
      noReviews: "لا توجد مراجعات بعد.",
      dash: "-",
    },
  });

  const [product, setProduct] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    CatalogAPI.product(id)
      .then((data) => {
        setProduct(data);
        setVariantId(data.variants?.[0]?.id || null);
      })
      .catch(() => {
        notifyError(ui.loadError);
      });
  }, [id, notifyError, ui.loadError]);

  const selectedVariant = useMemo(
    () => product?.variants?.find((variant) => variant.id === variantId),
    [product, variantId]
  );

  const selectedStock = Number(selectedVariant?.stock || 0);
  const stockMeta =
    selectedStock <= 0
      ? { label: ui.outOfStock, className: "bg-rose-100 text-rose-700" }
      : selectedStock <= LOW_STOCK_LIMIT
        ? { label: ui.lowStock.replace("{count}", selectedStock), className: "bg-amber-100 text-amber-700" }
        : { label: ui.inStock.replace("{count}", selectedStock), className: "bg-emerald-100 text-emerald-700" };

  if (!product) {
    return <Container className="py-10">{ui.loading}</Container>;
  }

  return (
    <Container className="py-10">
      <div className="text-sm text-slate-600">
        <Link to="/products" className="hover:underline">
          {ui.shop}
        </Link>{" "}
        / {product.name}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images || []} />

        <div>
          <div className="text-xs text-slate-500">
            {product.brand?.name} • {product.category?.name}
          </div>
          <h1 className="mt-1 text-3xl font-black">{product.name}</h1>
          <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${stockMeta.className}`}>
            {stockMeta.label}
          </div>
          <p className="mt-3 text-slate-600">{product.description}</p>

          <div className="mt-6">
            <div className="text-sm font-semibold">{ui.chooseVariant}</div>
            <div className="mt-3">
              <VariantPicker variants={product.variants || []} value={variantId} onChange={setVariantId} />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-24">
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(event) => setQty(Math.max(1, Number(event.target.value || 1)))}
              />
            </div>

            <Button
              className="w-full sm:flex-1"
              onClick={async () => {
                if (!variantId) {
                  notifyError(ui.chooseVariantError);
                  return;
                }

                try {
                  await add(variantId, qty);
                } catch {
                  // Cart context already reports toast errors.
                }
              }}
              disabled={!variantId || selectedStock <= 0}
            >
              {ui.addToCart}
            </Button>

            <div className="w-full text-left sm:min-w-[120px] sm:w-auto sm:text-right">
              <div className="text-xs text-slate-500">{ui.price}</div>
              <div className="text-lg">
                <Price value={selectedVariant?.price} />
              </div>
            </div>
          </div>

          {selectedStock <= 0 ? <div className="mt-3 text-sm text-rose-600">{ui.outOfStock}</div> : null}

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-semibold">{ui.reviews}</div>
                <div className="text-xs text-slate-500">{user ? ui.shareFeedback : ui.loginToReview}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <label className="text-xs font-semibold uppercase text-slate-500">{ui.rating}</label>
              <Input type="number" min={1} max={5} value={rating} onChange={(event) => setRating(Number(event.target.value))} />

              <label className="mt-2 text-xs font-semibold uppercase text-slate-500">{ui.comment}</label>
              <Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder={ui.commentPlaceholder} />

              <Button
                className="mt-3"
                onClick={async () => {
                  if (!user) {
                    notifyError(ui.loginBeforeReview);
                    return;
                  }

                  try {
                    await ReviewsAPI.create({ product_id: product.id, rating, comment });
                    const refreshed = await CatalogAPI.product(id);
                    setProduct(refreshed);
                    setComment("");
                    setRating(5);
                    success(ui.submitted);
                  } catch (error) {
                    const detailedErrors = error?.response?.data?.errors
                      ? Object.values(error.response.data.errors).flat().filter(Boolean)
                      : [];
                    notifyError(detailedErrors[0] || error?.response?.data?.message || ui.submitError);
                  }
                }}
              >
                {ui.submit}
              </Button>

              <div className="mt-6 grid gap-3">
                {(product.reviews || []).slice(0, 6).map((review) => (
                  <div key={review.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold">⭐ {review.rating}/5</div>
                    <div className="mt-1 text-sm text-slate-600">{review.comment || ui.dash}</div>
                  </div>
                ))}
                {(product.reviews || []).length === 0 ? <div className="text-sm text-slate-500">{ui.noReviews}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
