import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/utils/axiosInstance";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatPrice } from "@/lib/formatters";

function cartImage(src) {
  return src || "https://placehold.co/160x160/e2e8f0/64748b?text=Item";
}

export default function Cart() {
  usePageTitle("Cart");
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const placeOrder = async () => {
    if (!address.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to place an order");
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post("/orders", {
        shippingAddress: address.trim(),
        items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
      });
      clearCart();
      setDialogOpen(false);
      toast.success("Order placed");
      navigate("/order-success", { state: { order: data } });
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Cart</h1>
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild>
              <Link to="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((line) => (
              <Card key={line.productId}>
                <CardContent className="p-4 flex gap-4">
                  <img
                    src={cartImage(line.image)}
                    alt=""
                    className="h-24 w-24 rounded-md object-cover shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/160x160/e2e8f0/64748b?text=Item";
                    }}
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="font-semibold line-clamp-2">{line.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(line.price)} each</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Decrease"
                        onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{line.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Increase"
                        onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeFromCart(line.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    {formatPrice(line.quantity * Number(line.price))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator />
          
          <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span>Shipping</span>
                <span className="text-muted-foreground">Calculated at next step</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
          
          <Button
            className="w-full min-h-12 text-lg"
            size="lg"
            onClick={() => setDialogOpen(true)}
          >
            Checkout ({formatPrice(totalPrice)})
          </Button>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipping address</DialogTitle>
            <DialogDescription>Enter where we should deliver this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ship-addr">Address</Label>
            <Input
              id="ship-addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, postal code"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={submitting} onClick={placeOrder}>
              {submitting ? "Placing…" : "Confirm order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
