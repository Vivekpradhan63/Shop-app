import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/utils/axiosInstance";
import { useState } from "react";
import { formatPrice } from "@/lib/formatters";
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

function cartImage(src) {
  return src || "https://placehold.co/120x120/e2e8f0/64748b?text=Item";
}

export default function CartSheet({ open, onOpenChange }) {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const discountAmount = appliedCoupon 
    ? (totalPrice * appliedCoupon.discountPercentage) / 100 
    : 0;
  const finalTotal = totalPrice - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await axiosInstance.post("/coupons/validate", { code: couponCode.trim() });
      setAppliedCoupon(data);
      toast.success("Coupon applied!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

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
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });
      clearCart();
      setCheckoutOpen(false);
      onOpenChange(false);
      toast.success("Order placed");
      navigate("/order-success", { state: { order: data } });
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your cart</SheetTitle>
            <SheetDescription>{items.length} items</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm">Your cart is empty.</p>
            ) : (
              items.map((line) => (
                <div key={line.productId} className="flex gap-3">
                  <img
                    src={cartImage(line.image)}
                    alt=""
                    className="h-20 w-20 rounded-md object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{line.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(line.price)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{line.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-destructive"
                        aria-label="Remove"
                        onClick={() => removeFromCart(line.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input 
                placeholder="Promo Code" 
                value={couponCode} 
                onChange={e => setCouponCode(e.target.value)} 
                disabled={!!appliedCoupon || validatingCoupon}
                className="h-9"
              />
              {appliedCoupon ? (
                <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-destructive h-9">Remove</Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={applyCoupon} disabled={!couponCode || validatingCoupon} className="h-9">
                  {validatingCoupon ? "Wait..." : "Apply"}
                </Button>
              )}
            </div>
            
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
            <Button className="w-full" asChild variant="secondary">
              <Link to="/cart" onClick={() => onOpenChange(false)}>
                Open full cart
              </Link>
            </Button>
            <Button
              className="w-full"
              disabled={items.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              Place Order
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipping address</DialogTitle>
            <DialogDescription>We will use this address for delivery.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="sheet-ship">Address</Label>
            <Input
              id="sheet-ship"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, postal code"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={submitting} onClick={placeOrder}>
              {submitting ? "Placing…" : "Confirm order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
