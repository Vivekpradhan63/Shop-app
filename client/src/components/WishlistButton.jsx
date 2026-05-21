import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

/**
 * Heart toggle button for wishlisting a product.
 * Props:
 *   product  : product object (needs _id, name, price, images, etc.)
 *   size     : "sm" | "md" | "lg"
 *   className: extra classes
 */
export default function WishlistButton({ product, size = "md", className }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const btnSize = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  }[size];

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200",
        "bg-background/80 backdrop-blur shadow-md border border-border/50",
        "hover:scale-110 active:scale-95",
        btnSize,
        wishlisted
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-red-400",
        className,
      )}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-all duration-200",
          wishlisted ? "fill-current scale-110" : "",
        )}
      />
    </button>
  );
}
