import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/orders/my-orders");
        if (!cancelled) setOrders(data);
      } catch (e) {
        toast.error(e.response?.data?.message || "Could not load orders");
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">You have not placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} className="block">
              <Card className="transition-colors hover:bg-accent/40">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{o._id}</p>
                    <p className="font-semibold mt-1">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {o.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold">₹{Number(o.totalPrice).toFixed(2)}</p>
                    <Badge variant={orderStatusBadgeVariant(o.orderStatus)} className="capitalize">
                      {o.orderStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
