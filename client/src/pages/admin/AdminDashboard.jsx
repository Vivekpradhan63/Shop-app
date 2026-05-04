import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [o, p, u] = await Promise.all([
          axiosInstance.get("/orders"),
          axiosInstance.get("/products"),
          axiosInstance.get("/users"),
        ]);
        if (!cancelled) {
          setOrders(o.data);
          setProducts(p.data);
          setUsers(u.data);
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Could not load admin data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, x) => s + Number(x.totalPrice || 0), 0);
    return {
      orderCount: orders.length,
      productCount: products.length,
      userCount: users.length,
      revenue,
    };
  }, [orders, products, users]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [orders]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of groceries, orders, users, and revenue.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Groceries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.productCount}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.orderCount}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.userCount}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">${stats.revenue.toFixed(2)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-2 pr-4">Order ID</th><th className="pb-2 pr-4">Customer</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Total</th><th className="pb-2">Status</th></tr></thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs">{o._id}</td>
                  <td className="py-3 pr-4">{o.user?.name || "—"}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-4 font-medium">${Number(o.totalPrice).toFixed(2)}</td>
                  <td className="py-3"><Badge variant={orderStatusBadgeVariant(o.orderStatus)} className="capitalize">{o.orderStatus}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && <p className="text-muted-foreground text-sm py-4">No orders yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
