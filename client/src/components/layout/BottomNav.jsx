import { NavLink } from "react-router-dom";
import { Home, Search, ShoppingCart, Package, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const linkClass =
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground min-h-12";

export default function BottomNav({ onCartClick }) {
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="mx-auto flex max-w-7xl items-stretch justify-around">
        <NavLink
          to="/"
          className={({ isActive }) => cn(linkClass, isActive && "text-primary")}
        >
          <Home className="h-5 w-5" />
          Home
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => cn(linkClass, isActive && "text-primary")}
        >
          <Search className="h-5 w-5" />
          Search
        </NavLink>
        <button type="button" className={cn(linkClass)} onClick={onCartClick}>
          <span className="relative inline-flex">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -right-2 -top-2 h-4 min-w-4 rounded-full px-1 text-[9px] p-0 flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </Badge>
            )}
          </span>
          Cart
        </button>
        <NavLink
          to="/orders"
          className={({ isActive }) => cn(linkClass, isActive && "text-primary")}
        >
          <Package className="h-5 w-5" />
          Orders
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => cn(linkClass, isActive && "text-primary")}
        >
          <User className="h-5 w-5" />
          Profile
        </NavLink>
      </div>
    </nav>
  );
}
