import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ShoppingBag } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/shared/SkeletonCard";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Home() {
  usePageTitle("Home");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/products");
        if (!cancelled) {
          setProducts(data);
          const cats = [...new Set(data.map((p) => p.category).filter(Boolean))];
          setCategories(cats.sort());
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    try {
      const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      setRecentlyViewed(viewed);
    } catch (e) {
      console.error(e);
    }
    
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8 md:p-16 shadow-sm">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-foreground">
            Fresh finds, <span className="text-primary">delivered simply.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl">
            Browse our premium selection of categories, read reviews, and checkout in seconds. Experience shopping without the friction.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Button asChild size="lg" className="rounded-full shadow-md hover:shadow-lg transition-all px-8 h-12 text-base">
              <Link to="/products">
                <ShoppingBag className="mr-2 h-5 w-5" /> Shop all products
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
          <Button
            type="button"
            variant={active === "all" ? "default" : "outline"}
            className="shrink-0 rounded-full px-6"
            onClick={() => setActive("all")}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              type="button"
              variant={active === c ? "default" : "outline"}
              className="shrink-0 capitalize rounded-full px-6"
              onClick={() => setActive(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 border rounded-xl border-dashed">No products found in this category.</p>
        )}
      </div>
      
      {!loading && recentlyViewed.length > 0 && (
        <div className="space-y-6 pt-8 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
