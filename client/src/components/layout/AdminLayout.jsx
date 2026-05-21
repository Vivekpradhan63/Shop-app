import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBasket, PackageCheck, Store, Users, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, value: "dashboard" },
  { to: "/admin/groceries", label: "Groceries", icon: ShoppingBasket, value: "groceries" },
  { to: "/admin/orders", label: "Orders", icon: PackageCheck, value: "orders" },
  { to: "/admin/users", label: "Users", icon: Users, value: "users" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = navItems.find((i) => location.pathname === i.to || location.pathname.startsWith(`${i.to}/`))?.value || "dashboard";

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <span className="font-bold">Shop Admin</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/")}>
            Storefront
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-20 space-y-1 rounded-lg border bg-background p-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-12 items-center gap-2 rounded-md px-3 text-sm font-medium",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <div className="md:hidden rounded-lg border bg-background p-2">
            <Tabs value={current}>
              <TabsList className="grid h-auto w-full grid-cols-3">
                {navItems.map((item) => (
                  <TabsTrigger key={item.to} value={item.value} asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <main className="rounded-lg border bg-background p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
