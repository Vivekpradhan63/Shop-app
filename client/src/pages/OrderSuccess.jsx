import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";

function itemImage(p) {
  const url = p?.images?.[0];
  return url || "https://placehold.co/80x80/e2e8f0/64748b?text=Item";
}

export default function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order?._id) {
    return <Navigate to="/" replace />;
  }

  const items = order.items || [];

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <CheckCircle2 className="h-16 w-16 text-green-600" aria-hidden />
        <h1 className="text-2xl font-bold">Thank you for your order</h1>
        <p className="text-muted-foreground">Your order has been placed successfully.</p>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            Order ID
            <span className="font-mono text-base">{order._id}</span>
          </CardTitle>
          <Badge variant={orderStatusBadgeVariant(order.orderStatus)} className="w-fit capitalize">
            {order.orderStatus}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Shipping to</p>
            <p className="font-medium">{order.shippingAddress}</p>
          </div>
          <Separator />
          <div className="space-y-3">
            <p className="font-semibold">Items</p>
            <ul className="space-y-2">
              {items.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <img
                    src={itemImage(line.product)}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{line.product?.name || "Product"}</p>
                    <p className="text-muted-foreground">
                      Qty {line.quantity} × ₹{Number(line.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">₹{(line.quantity * Number(line.price)).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{Number(order.totalPrice).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="min-h-12 flex-1 sm:flex-none">
          <Link to="/orders">View My Orders</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-12 flex-1 sm:flex-none">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
