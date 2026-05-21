import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/shared/SkeletonCard";
import EmptyState from "@/components/shared/EmptyState";
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
import { usePageTitle } from "@/hooks/usePageTitle";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Products() {
  usePageTitle("Products");
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sync state with URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 400);
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val) p.set(key, val);
        else p.delete(key);
      });
      return p;
    });
  }, [setSearchParams]);

  // Sync debounced search to URL
  useEffect(() => {
    updateParams({ search: debouncedSearch, page: "1" });
  }, [debouncedSearch, updateParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        params.set("page", page.toString());
        
        const { data } = await axiosInstance.get(`/products?${params.toString()}`);
        if (!cancelled) {
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || 0);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, sort, page]);

  // Hardcoded standard categories
  const categories = ["Vegetables", "Fruits", "Dairy", "Bakery", "Beverages", "Snacks", "Other"];

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
                onClick={() => updateParams({ category: "", page: "1" })}
              >
                All categories
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={category === c.toLowerCase() ? "default" : "outline"}
                  className="w-full justify-start capitalize"
                  onClick={() => updateParams({ category: c.toLowerCase(), page: "1" })}
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
            <Select value={sort} onValueChange={(val) => updateParams({ sort: val, page: "1" })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Rating: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: (page - 1).toString() })}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: (page + 1).toString() })}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState 
            title="No products found"
            description="Try adjusting your search or filter to find what you're looking for."
            actionText="Clear Filters"
            actionLink="/products"
          />
        )}
      </div>
    </div>
  );
}
