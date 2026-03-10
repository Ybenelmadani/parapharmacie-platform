import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Price from "../components/ui/Price";
import ImageGallery from "../components/product/ImageGallery";
import VariantPicker from "../components/product/VariantPicker";
import { CatalogAPI } from "../api/catalog";
import { useCart } from "../context/CartContext";
import { ReviewsAPI } from "../api/reviews";

const LOW_STOCK_LIMIT = 10;

export default function ProductDetails() {
  const { id } = useParams();
  const { add } = useCart();

  const [p, setP] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    CatalogAPI.product(id).then(data => {
      setP(data);
      setVariantId(data.variants?.[0]?.id || null);
    }).catch(()=>{});
  }, [id]);

  const selectedVariant = useMemo(() => p?.variants?.find(v => v.id === variantId), [p, variantId]);
  const selectedStock = Number(selectedVariant?.stock || 0);
  const stockMeta =
    selectedStock <= 0
      ? { label: "En rupture", className: "bg-rose-100 text-rose-700" }
      : selectedStock <= LOW_STOCK_LIMIT
        ? { label: `Stock faible (${selectedStock})`, className: "bg-amber-100 text-amber-700" }
        : { label: `En stock (${selectedStock})`, className: "bg-emerald-100 text-emerald-700" };

  if (!p) {
    return <Container className="py-10">Loading…</Container>;
  }

  return (
    <Container className="py-10">
      <div className="text-sm text-slate-600">
        <Link to="/products" className="hover:underline">Shop</Link> / {p.name}
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ImageGallery images={p.images || []} />

        <div>
          <div className="text-xs text-slate-500">{p.brand?.name} • {p.category?.name}</div>
          <h1 className="mt-1 text-3xl font-black">{p.name}</h1>
          <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${stockMeta.className}`}>
            {stockMeta.label}
          </div>
          <p className="mt-3 text-slate-600">{p.description}</p>

          <div className="mt-6">
            <div className="text-sm font-semibold">Choose variant</div>
            <div className="mt-3">
              <VariantPicker variants={p.variants || []} value={variantId} onChange={setVariantId} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="w-24">
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
              />
            </div>

            <Button
              className="flex-1"
              onClick={() => {
                if (!variantId) return;
                add(variantId, qty);
              }}
              disabled={!variantId || selectedStock <= 0}
            >
              Add to cart
            </Button>

            <div className="text-right min-w-[120px]">
              <div className="text-xs text-slate-500">Price</div>
              <div className="text-lg"><Price value={selectedVariant?.price} /></div>
            </div>
          </div>

          {selectedStock <= 0 && (
            <div className="mt-3 text-sm text-rose-600">Out of stock</div>
          )}

          {/* Reviews */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-semibold">Reviews</div>
                <div className="text-xs text-slate-500">Leave a review (demo user_id=1)</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Rating (1-5)</label>
              <Input type="number" min={1} max={5} value={rating} onChange={(e)=>setRating(Number(e.target.value))} />

              <label className="mt-2 text-xs font-semibold text-slate-500 uppercase">Comment</label>
              <Input value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Your comment..." />

              <Button
                className="mt-3"
                onClick={async () => {
                  await ReviewsAPI.create({ product_id: p.id, rating, comment });
                  const refreshed = await CatalogAPI.product(id);
                  setP(refreshed);
                  setComment("");
                  setRating(5);
                }}
              >
                Submit
              </Button>

              <div className="mt-6 grid gap-3">
                {(p.reviews || []).slice(0, 6).map(r => (
                  <div key={r.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold">⭐ {r.rating}/5</div>
                    <div className="text-sm text-slate-600 mt-1">{r.comment || "—"}</div>
                  </div>
                ))}
                {(p.reviews || []).length === 0 && (
                  <div className="text-sm text-slate-500">No reviews yet.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Container>
  );
}
