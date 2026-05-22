import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";

import { getImageUrl } from "@/utils/getImageUrl";
import { formatPrice } from "@/lib/formatters";

function productImage(images) {
  const src = getImageUrl(images?.[0]);
  if (src) return src;
  return "https://placehold.co/600x400/e2e8f0/64748b?text=Product";
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const isOutOfStock = (product.stock != null && product.stock <= 0) || product.available === false;
  const isLowStock = product.stock != null && product.stock > 0 && product.stock <= 5;

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    toast.success("Added to cart");
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/products/${product._id}`} className="block shrink-0 relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={productImage(product.images)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found";
            }}
          />
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.category && (
            <Badge variant="secondary" className="w-fit shadow-sm bg-background/80 backdrop-blur-sm">
              {product.category}
            </Badge>
          )}

        </div>
      </Link>
      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        <Link to={`/products/${product._id}`} className="font-semibold line-clamp-2 hover:underline">
          {product.name}
        </Link>
        <StarRating value={product.ratings || 0} />
        <p className="text-lg font-bold">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2 items-center">
        <Button className="w-full" type="button" onClick={onAdd} disabled={isOutOfStock}>
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
        <p className={`text-xs font-medium ${isOutOfStock ? "text-destructive" : "text-green-600"}`}>
          {isOutOfStock ? "Currently out of stock" : "✓ In Stock"}
        </p>
      </CardFooter>
    </Card>
  );
}
