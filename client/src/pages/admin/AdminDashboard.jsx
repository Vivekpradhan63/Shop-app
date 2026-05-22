import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatPrice } from "@/lib/formatters";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  usePageTitle("Admin Dashboard");
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, lowStockProducts: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProductsList, setLowStockProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [summary, top, rev, orders, products] = await Promise.all([
          axiosInstance.get("/analytics/summary"),
          axiosInstance.get("/analytics/top-products"),
          axiosInstance.get("/analytics/revenue"),
          axiosInstance.get("/orders?limit=5"),
          axiosInstance.get("/products?limit=5&sort=stock_asc") // For low stock, we need an endpoint or just fetch 5. Let's fetch products and filter for now or we could add a new endpoint.
        ]);
        if (!cancelled) {
          setStats(summary.data);
          setTopProducts(top.data);
          
          // Map backend revenue dates to match recharts needs
          const mappedRev = rev.data.map(d => {
            const dateObj = new Date(d.date);
            return {
              date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              revenue: d.revenue,
              fullDate: d.date
            };
          });
          setRevenueData(mappedRev);
          setRecentOrders(orders.data.orders || []);
          
          // We can use the client side filter for low stock products using the existing API if needed, but since we want scalable, we should fetch products and filter them. For now, fetch all or a large number.
          const allProducts = await axiosInstance.get("/products?limit=100");
          setLowStockProductsList(allProducts.data.products?.filter(p => p.stock > 0 && p.stock <= 5).sort((a, b) => a.stock - b.stock) || []);
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

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Revenue\\n" 
      + revenueData.map(e => `${e.fullDate},${e.revenue}`).join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "revenue_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24" data-testid="loading-spinner">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of groceries, orders, users, and revenue.</p>
        </div>
        <button onClick={exportToCSV} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          Export Revenue CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "#888" }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [formatPrice(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by units sold.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data yet.</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[200px]">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.soldCount} units sold</p>
                    </div>
                    <div className="font-medium">{formatPrice(p.revenue)}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions in the store.</CardDescription>
            </div>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {o.user?.name || "Guest"}
                      <div className="text-xs text-muted-foreground font-normal">{new Date(o.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 pr-4 font-medium">{formatPrice(o.totalPrice)}</td>
                    <td className="py-3">
                      <Badge variant={orderStatusBadgeVariant(o.orderStatus)} className="capitalize text-[10px] px-2 py-0">
                        {o.orderStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && <p className="text-muted-foreground text-sm py-4 text-center">No orders yet.</p>}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Products running low on inventory.</CardDescription>
            </div>
            <Link to="/admin/groceries" className="text-sm text-primary hover:underline">Manage</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProductsList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All products are sufficiently stocked.</p>
              ) : (
                lowStockProductsList.map((p) => (
                  <div key={p._id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category || "Uncategorized"}</p>
                    </div>
                    <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600">
                      {p.stock} left
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
