import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";

import { getImageUrl } from "@/utils/getImageUrl";

function productImage(images) {
  const src = getImageUrl(images?.[0]);
  if (src) return src;
  return "https://placehold.co/600x400/e2e8f0/64748b?text=Product";
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success("Added to cart");
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <Link to={`/products/${product._id}`} className="block shrink-0">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={productImage(product.images)}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>
      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        <Link to={`/products/${product._id}`} className="font-semibold line-clamp-2 hover:underline">
          {product.name}
        </Link>
        <StarRating value={product.ratings || 0} />
        <p className="text-lg font-bold">₹{Number(product.price).toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" type="button" onClick={onAdd}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
