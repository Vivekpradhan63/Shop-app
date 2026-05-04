import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Card } from "@/components/ui/card";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("rating_desc");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        const { data } = await axiosInstance.get(`/products?${params.toString()}`);
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, sort]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return [...set].sort();
  }, [products]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-56 shrink-0 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant={category === "" ? "default" : "outline"}
                className="w-full justify-start capitalize"
                onClick={() => setCategory("")}
              >
                All categories
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={category === c ? "default" : "outline"}
                  className="w-full justify-start capitalize"
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </aside>

      <div className="flex-1 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56 space-y-2">
            <Label>Sort</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Rating: High to Low</SelectItem>
                <SelectItem value="rating_asc">Rating: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No products match your filters.</p>
        )}
      </div>
    </div>
  );
}
