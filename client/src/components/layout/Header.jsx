import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useCartUi } from "@/context/CartUiContext";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { setSheetOpen } = useCartUi();

  const onCartClick = () => {
    if (isDesktop) setSheetOpen(true);
    else navigate("/cart");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        <Link to="/" className="text-lg font-bold tracking-tight shrink-0">
          ShopApp
        </Link>

        {/* Search bar — grows to fill space on desktop */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && user?.role === "admin" && (
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/admin">Admin</Link>
            </Button>
          )}
          {isAuthenticated ? (
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/profile">Profile</Link>
            </Button>
          ) : (
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Login</Link>
            </Button>
          )}

          {/* Cart icon button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative"
            aria-label="Cart"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px] flex items-center justify-center p-0"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </Badge>
            )}
          </Button>

          {isAuthenticated && (
            <Button
              type="button"
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Mobile search bar — shown below header row */}
      <div className="sm:hidden px-4 pb-2">
        <SearchBar />
      </div>
    </header>
  );
}
