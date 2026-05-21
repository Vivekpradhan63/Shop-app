import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WishlistButton from "@/components/WishlistButton";
import { getImageUrl } from "@/utils/getImageUrl";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

function productImage(images) {
  const src = getImageUrl(images?.[0]);
  return src || "https://placehold.co/400x400/e2e8f0/64748b?text=Product";
}

export default function Wishlist() {
  const { items, removeFromWishlist, totalWishlisted } = useWishlist();
  const { addToCart } = useCart();

  const onAddToCart = (item) => {
    // Build a minimal product object from the saved wishlist item
    addToCart(
      {
        _id: item.productId,
        name: item.name,
        price: item.price,
        images: item.images,
        stock: item.stock ?? 1,
      },
      1,
    );
    toast.success("Added to cart!");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        {totalWishlisted > 0 && (
          <Badge variant="secondary" className="text-sm px-2 py-0.5">
            {totalWishlisted} {totalWishlisted === 1 ? "item" : "items"}
          </Badge>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <Heart className="h-12 w-12 text-red-300 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Nothing saved yet</h2>
            <p className="text-muted-foreground max-w-xs">
              Tap the heart icon on any product to save it here for later.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            // Reconstruct minimal product object for WishlistButton
            const product = {
              _id: item.productId,
              name: item.name,
              price: item.price,
              images: item.images,
              ratings: item.ratings,
              stock: item.stock,
              category: item.category,
              description: item.description,
            };

            return (
              <div
                key={item.productId}
                className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Wishlist remove button */}
                <div className="absolute right-3 top-3 z-10">
                  <WishlistButton product={product} size="sm" />
                </div>

                {/* Image */}
                <Link to={`/products/${item.productId}`} className="block">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={productImage(item.images)}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <Link
                    to={`/products/${item.productId}`}
                    className="line-clamp-2 font-semibold hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.category && (
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  )}
                  <p className="text-lg font-bold text-primary">
                    ₹{Number(item.price).toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => onAddToCart(item)}
                      disabled={item.stock < 1}
                    >
                      {item.stock < 1 ? "Out of stock" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
