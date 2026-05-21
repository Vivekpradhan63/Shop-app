import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import axiosInstance from "@/utils/axiosInstance";
import { getImageUrl } from "@/utils/getImageUrl";
import { cn } from "@/lib/utils";

function thumb(images) {
  const src = getImageUrl(images?.[0]);
  return src || "https://placehold.co/48x48/e2e8f0/64748b?text=?";
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState(null); // cached list
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch full product list once and cache
  const ensureProducts = async () => {
    if (allProducts !== null) return allProducts;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/products");
      setAllProducts(data);
      return data;
    } catch {
      setAllProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const products = await ensureProducts();
      if (cancelled) return;
      const q = debouncedQuery.toLowerCase();
      const filtered = products
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q),
        )
        .slice(0, 8);
      setResults(filtered);
      setOpen(true);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (product) => {
    setQuery("");
    setOpen(false);
    navigate(`/products/${product._id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearQuery = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Search products…"
          className={cn(
            "h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            "transition-all duration-200",
          )}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {loading ? (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border bg-background shadow-2xl",
            "animate-in fade-in-0 slide-in-from-top-2 duration-200",
          )}
          role="listbox"
        >
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-border">
              {results.map((product) => (
                <li key={product._id} role="option">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                    onClick={() => handleSelect(product)}
                  >
                    <img
                      src={thumb(product.images)}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover shrink-0 border"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {product.category || "Product"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-primary">
                      ₹{Number(product.price).toFixed(0)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
