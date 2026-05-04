import { Outlet, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import CartSheet from "@/components/CartSheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CartUiProvider, useCartUi } from "@/context/CartUiContext";

function MainLayoutInner() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { sheetOpen, setSheetOpen } = useCartUi();
  const navigate = useNavigate();

  const onCartNav = () => {
    if (isDesktop) setSheetOpen(true);
    else navigate("/cart");
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <BottomNav onCartClick={onCartNav} />
      <CartSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

export default function MainLayout() {
  return (
    <CartUiProvider>
      <MainLayoutInner />
    </CartUiProvider>
  );
}
