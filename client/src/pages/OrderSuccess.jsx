import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2, ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";

function itemImage(p) {
  const url = p?.images?.[0];
  return url || "https://placehold.co/80x80/e2e8f0/64748b?text=Item";
}

export default function OrderSuccess() {
  usePageTitle("Order Success");
  const location = useLocation();
  const order = location.state?.order;

  if (!order?._id) {
    return <Navigate to="/" replace />;
  }

  const items = order.items || [];

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <CheckCircle2 className="h-16 w-16 text-green-600 animate-pulse" aria-hidden />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Thank you for your order</h1>
        <p className="text-muted-foreground">Your order has been placed successfully.</p>
      </div>

      <Card className="text-left shadow-md border-muted/60">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            Order ID
            <span className="font-mono text-base text-primary">{order._id}</span>
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

      <div className="flex flex-col items-center gap-8 pt-4">
        {/* Proceed Helper Indicator */}
        <div className="relative flex flex-col items-center w-full">
          <div className="animate-bounce mb-2 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
              Proceed from here to track your order!
            </span>
            <ArrowDown className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center w-full">
            <Button asChild className="min-h-12 flex-1 relative overflow-hidden group shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all duration-300">
              <Link to="/orders" className="flex items-center justify-center gap-2">
                <span>View My Orders</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-12 flex-1 border-muted-foreground/20 hover:bg-muted/50 transition-colors">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
