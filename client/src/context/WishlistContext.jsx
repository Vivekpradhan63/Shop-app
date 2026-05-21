import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const WishlistContext = createContext(null);

const STORAGE_KEY = "shop_wishlist";

function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToWishlist = useCallback((product) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === product._id)) return prev;
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          price: product.price,
          ratings: product.ratings || 0,
          category: product.category || "",
          stock: product.stock ?? 1,
          images: product.images || [],
          description: product.description || "",
        },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const isWishlisted = useCallback(
    (productId) => items.some((i) => i.productId === productId),
    [items],
  );

  const toggleWishlist = useCallback(
    (product) => {
      if (isWishlisted(product._id)) removeFromWishlist(product._id);
      else addToWishlist(product);
    },
    [isWishlisted, addToWishlist, removeFromWishlist],
  );

  const value = useMemo(
    () => ({
      items,
      totalWishlisted: items.length,
      addToWishlist,
      removeFromWishlist,
      isWishlisted,
      toggleWishlist,
    }),
    [items, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
