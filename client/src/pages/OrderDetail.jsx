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

function itemImage(p) {
  const url = p?.images?.[0];
  return url || "https://placehold.co/96x96/e2e8f0/64748b?text=Item";
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const items = order.items || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order detail</h1>
          <p className="font-mono text-sm text-muted-foreground mt-1">{order._id}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Placed {new Date(order.createdAt).toLocaleString()}
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
          <CardTitle>Shipping address</CardTitle>
        </CardHeader>
        <CardContent>
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
                    Quantity {line.quantity} × ₹{Number(line.price).toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">₹{(line.quantity * Number(line.price)).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{Number(order.totalPrice).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" asChild className="w-full sm:w-auto">
        <Link to="/orders">Back to my orders</Link>
      </Button>
    </div>
  );
}
