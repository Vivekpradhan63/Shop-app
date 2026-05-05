import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { getImageUrl } from "@/utils/getImageUrl";

function img(src) {
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
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/products/${id}`);
      setProduct(data);
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
          : { ...product, reviews: data.reviews }
      );
      setReviewComment("");
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border bg-muted aspect-square">
          <img src={img(product.images?.[0])} alt={product.name} className="h-full w-full object-cover" />
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((src, i) => (
              <img key={i} src={img(src)} alt="" className="h-20 w-20 rounded-md object-cover border" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <StarRating value={product.ratings || 0} className="mt-2" />
          <p className="mt-4 text-3xl font-bold">₹{Number(product.price).toFixed(2)}</p>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
          <p className="text-sm text-muted-foreground mt-2">In stock: {product.stock}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="qty" className="sr-only">
            Quantity
          </Label>
          <Input
            id="qty"
            type="number"
            min={1}
            className="w-24"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
          <Button type="button" size="lg" onClick={onAdd} disabled={product.stock < 1}>
            Add to Cart
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Reviews</h2>
          {isAuthenticated && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <form onSubmit={submitReview} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min={1}
                      max={5}
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Input
                      id="comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience"
                    />
                  </div>
                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? "Submitting…" : "Submit review"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
            {reviews.map((r) => (
              <Card key={r._id}>
                <CardContent className="p-4 flex gap-3">
                  <Avatar>
                    <AvatarFallback>{r.user?.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{r.user?.name || "Customer"}</p>
                    <StarRating value={r.rating} className="scale-90 origin-left" />
                    <p className="text-sm mt-1">{r.comment}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
