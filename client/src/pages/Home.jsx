import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);

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
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [products, active]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/15 via-background to-background p-8 md:p-12">
        <div className="relative z-10 max-w-xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Fresh finds, delivered simply.</h1>
          <p className="text-muted-foreground text-lg">
            Browse categories, read reviews, and checkout in seconds — no payment step, just a shipping address.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link to="/products">Shop all products</Link>
          </Button>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        <Button
          type="button"
          variant={active === "all" ? "default" : "outline"}
          className="shrink-0"
          onClick={() => setActive("all")}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c}
            type="button"
            variant={active === c ? "default" : "outline"}
            className="shrink-0 capitalize"
            onClick={() => setActive(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No products in this category yet.</p>
      )}
    </div>
  );
}
