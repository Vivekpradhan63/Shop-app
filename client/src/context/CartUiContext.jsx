import { createContext, useContext, useMemo, useState } from "react";

const CartUiContext = createContext(null);

export function CartUiProvider({ children }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const value = useMemo(() => ({ sheetOpen, setSheetOpen }), [sheetOpen]);
  return <CartUiContext.Provider value={value}>{children}</CartUiContext.Provider>;
}

export function useCartUi() {
  const ctx = useContext(CartUiContext);
  if (!ctx) throw new Error("useCartUi must be used within CartUiProvider");
  return ctx;
}
