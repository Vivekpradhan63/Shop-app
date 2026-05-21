import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";
import OrderStatusStepper from "@/components/OrderStatusStepper";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatPrice, formatDate } from "@/lib/formatters";
import { Printer, XCircle } from "lucide-react";

function itemImage(p) {
  const url = p?.images?.[0];
  return url || "https://placehold.co/96x96/e2e8f0/64748b?text=Item";
}

export default function OrderDetail() {
  usePageTitle("Order Detail");
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        if (!cancelled) setOrder(data);
      } catch (e) {
        toast.error(e.response?.data?.message || "Order not found");
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">We could not load this order.</p>
        <Button asChild>
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    try {
      const { data } = await axiosInstance.put(`/orders/${id}/cancel`);
      setOrder(data);
      toast.success("Order cancelled successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const items = order.items || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Order Detail</h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">Order #{order._id}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={orderStatusBadgeVariant(order.orderStatus)} className="capitalize text-sm px-3 py-1">
          {order.orderStatus}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusStepper status={order.orderStatus} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {order.phone && (
            <p className="text-sm text-muted-foreground">
              📞 {order.phone}
            </p>
          )}
          <p>{order.shippingAddress}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-4">
            {items.map((line, i) => (
              <li key={i} className="flex gap-4">
                <img
                  src={itemImage(line.product)}
                  alt=""
                  className="h-20 w-20 rounded-md object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{line.product?.name || "Product"}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity {line.quantity} × {formatPrice(line.price)}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(line.quantity * Number(line.price))}</p>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" asChild className="flex-1 sm:flex-none">
          <Link to="/orders">Back to my orders</Link>
        </Button>
        <Button 
          variant="secondary" 
          asChild 
          className="flex-1 sm:flex-none"
        >
          <Link to={`/orders/${id}/invoice`} target="_blank">
            <Printer className="mr-2 h-4 w-4" /> Download Invoice
          </Link>
        </Button>
        {order.orderStatus === "pending" && (
          <Button 
            variant="destructive" 
            className="flex-1 sm:flex-none sm:ml-auto"
            onClick={cancelOrder}
            disabled={cancelling}
          >
            <XCircle className="mr-2 h-4 w-4" /> {cancelling ? "Cancelling..." : "Cancel Order"}
          </Button>
        )}
      </div>
    </div>
  );
}
