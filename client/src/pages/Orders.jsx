import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";
import { usePageTitle } from "@/hooks/usePageTitle";
import SkeletonList from "@/components/shared/SkeletonList";
import EmptyState from "@/components/shared/EmptyState";
import { formatPrice, formatDate } from "@/lib/formatters";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Orders() {
  usePageTitle("My Orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");

  const loadOrders = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/orders/my-orders?page=${p}&limit=10`);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load orders");
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  const cancelOrder = async (id, e) => {
    e.preventDefault(); // Prevent navigating to details
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const { data } = await axiosInstance.put(`/orders/${id}/cancel`);
      setOrders(orders.map(o => o._id === id ? data : o));
      toast.success("Order cancelled");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not cancel order");
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter(o => o.orderStatus === filter);
  }, [orders, filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
      
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="w-full sm:w-auto overflow-x-auto justify-start flex-nowrap scrollbar-none">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <SkeletonList count={3} />
      ) : orders.length === 0 ? (
        <EmptyState 
          title="No orders yet" 
          description="You haven't placed any orders yet. Start exploring our products!" 
          actionText="Browse Products" 
          actionLink="/products" 
        />
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
          No orders found matching this status.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <Link key={o._id} to={`/orders/${o._id}`} className="block">
                <Card className="transition-colors hover:bg-accent/40 shadow-sm hover:shadow-md">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">Order #{o._id.slice(-8)}</span>
                        <Badge variant={orderStatusBadgeVariant(o.orderStatus)} className="capitalize">
                          {o.orderStatus}
                        </Badge>
                      </div>
                      <p className="font-semibold text-base">
                        {formatDate(o.createdAt)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {o.items?.length || 0} items
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <p className="text-xl font-bold">{formatPrice(o.totalPrice)}</p>
                      {o.orderStatus === "pending" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                          onClick={(e) => cancelOrder(o._id, e)}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button 
                variant="outline" 
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
