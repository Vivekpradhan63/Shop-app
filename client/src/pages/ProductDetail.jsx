import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/StarRating";
import StarPicker from "@/components/StarPicker";
import ImageLightbox from "@/components/ImageLightbox";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ZoomIn, Table as TableIcon, Layers } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/shared/SkeletonCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatPrice, formatDate } from "@/lib/formatters";

import { getImageUrl } from "@/utils/getImageUrl";

function resolveImg(src) {
  const url = getImageUrl(src);
  return url || "https://placehold.co/800x600/e2e8f0/64748b?text=Product";
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Gallery state
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  usePageTitle(product ? product.name : "Product Details");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/products/${id}`);
      setProduct(data);
      setActiveImg(0);

      // Add to recently viewed
      try {
        const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const filtered = viewed.filter(p => p._id !== data._id);
        filtered.unshift({
          _id: data._id,
          name: data.name,
          price: data.price,
          images: data.images,
          category: data.category,
        });
        localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 10)));
      } catch (e) {
        console.error("Error saving recently viewed", e);
      }

      // Fetch related
      if (data.category) {
        setLoadingRelated(true);
        const relatedRes = await axiosInstance.get(`/products?category=${encodeURIComponent(data.category)}&limit=4`);
        setRelatedProducts(relatedRes.data?.products?.filter(p => p._id !== data._id).slice(0, 4) || []);
        setLoadingRelated(false);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Product not found");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onAdd = () => {
    if (!product) return;
    addToCart(product, qty);
    toast.success("Added to cart");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Log in to leave a review");
      return;
    }
    if (reviewRating < 1) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await axiosInstance.post(`/products/${id}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment,
      });
      const p = data.product;
      setProduct(
        p
          ? { ...p, reviews: data.reviews }
          : { ...product, reviews: data.reviews },
      );
      setReviewComment("");
      setReviewRating(5);
      toast.success("Review submitted");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-center text-muted-foreground">Product not available.</p>;
  }

  const reviews = product.reviews || [];
  const images = (product.images || []).map(resolveImg);
  const mainImageUrl = images[activeImg] || resolveImg(null);

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          startIndex={activeImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Image gallery column ── */}
        <div className="space-y-3">
          {/* Main image */}
          <div
            className="group relative overflow-hidden rounded-xl border bg-muted aspect-square cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={mainImageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/800x600/e2e8f0/64748b?text=Image+Not+Found";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
              <ZoomIn className="h-8 w-8 text-white opacity-0 drop-shadow-lg transition-opacity duration-200 group-hover:opacity-100" />
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 h-20 w-20 overflow-hidden rounded-md border-2 transition-all duration-150 ${
                    i === activeImg
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img 
                    src={src} 
                    alt="" 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/100x100/e2e8f0/64748b?text=IMG";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info column ── */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
            <StarRating value={product.ratings || 0} className="mt-1" />
          </div>

          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          <p className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">In stock: {product.stock} {product.unit}</span>
            ) : (
              <span className="text-red-500 font-medium">Out of stock</span>
            )}
          </p>

          {/* Qty + Add to Cart */}
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="qty" className="sr-only">Quantity</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              className="w-24"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            />
            <Button type="button" size="lg" onClick={onAdd} disabled={product.stock < 1} className="flex-1 sm:flex-none">
              Add to Cart
            </Button>
          </div>

          <Separator />

          {/* Specifications Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-muted-foreground" />
              Specifications
            </h3>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 font-medium text-muted-foreground w-1/3">Category</th>
                    <td className="px-4 py-3 capitalize">{product.category || "Uncategorized"}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Unit</th>
                    <td className="px-4 py-3 capitalize">{product.unit || "N/A"}</td>
                  </tr>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Added On</th>
                    <td className="px-4 py-3">{formatDate(product.createdAt)}</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Reviews section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Reviews{" "}
              {reviews.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
              )}
            </h2>

            {/* Review form */}
            {isAuthenticated && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <p className="text-sm font-medium">Leave a review</p>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div className="space-y-1">
                      <Label>Your rating</Label>
                      <StarPicker
                        value={reviewRating}
                        onChange={setReviewRating}
                        size="md"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="comment">Comment</Label>
                      <Input
                        id="comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience…"
                      />
                    </div>
                    <Button type="submit" disabled={submittingReview}>
                      {submittingReview ? "Submitting…" : "Submit review"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Existing reviews */}
            <div className="space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
              )}
              {reviews.map((r) => (
                <Card key={r._id}>
                  <CardContent className="p-4 flex gap-3">
                    <Avatar>
                      <AvatarFallback>{r.user?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{r.user?.name || "Customer"}</p>
                      <StarRating value={r.rating} className="scale-90 origin-left" />
                      <p className="text-sm mt-1 text-muted-foreground">{r.comment}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {(relatedProducts.length > 0 || loadingRelated) && (
        <div className="mt-16 space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Related Products</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loadingRelated ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)
            )}
          </div>
        </div>
      )}
    </>
  );
}
