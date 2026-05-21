import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatPrice, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function Invoice() {
  usePageTitle("Invoice");
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        if (!cancelled) setOrder(data);
      } catch (e) {
        toast.error("Could not load invoice data.");
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-muted-foreground">Order not found.</div>;
  }

  const items = order.items || [];

  return (
    <div className="min-h-screen bg-white text-black p-8 sm:p-12 md:p-16">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Controls - Hidden when printing */}
        <div className="flex justify-end print:hidden mb-8">
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>
        </div>

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">THE SHOP</h1>
            <p className="text-sm text-gray-500 mt-1">Fresh finds, delivered simply.</p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-2xl font-bold uppercase text-gray-800">Invoice</h2>
            <p className="text-gray-500 mt-1">Invoice #{order._id}</p>
            <p className="text-gray-500">Date: {formatDate(order.createdAt)}</p>
            <p className="text-gray-500 font-medium mt-2">
              Status: <span className="uppercase text-primary">{order.orderStatus}</span>
            </p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 border-b pb-2">Billed To</h3>
            <p className="font-medium">{order.user?.name || "Customer"}</p>
            <p className="text-gray-600">{order.user?.email}</p>
            <p className="text-gray-600">{order.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 border-b pb-2">Shipping Address</h3>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
              {order.shippingAddress}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="pt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y bg-gray-50 text-gray-700">
                <th className="py-3 px-4 font-semibold">Item</th>
                <th className="py-3 px-4 font-semibold text-right">Price</th>
                <th className="py-3 px-4 font-semibold text-right">Qty</th>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((line, i) => (
                <tr key={i} className="border-b text-gray-800">
                  <td className="py-4 px-4">
                    <p className="font-medium">{line.product?.name || "Product"}</p>
                    <p className="text-sm text-gray-500">{line.product?._id}</p>
                  </td>
                  <td className="py-4 px-4 text-right tabular-nums">{formatPrice(line.price)}</td>
                  <td className="py-4 px-4 text-right tabular-nums">{line.quantity}</td>
                  <td className="py-4 px-4 text-right font-medium tabular-nums">
                    {formatPrice(line.quantity * Number(line.price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-8">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(order.totalPrice)}</span>
            </div>
            {/* Note: Coupon applied discounts are already reflected in the order total for now */}
            <div className="flex justify-between text-gray-600 pb-3 border-b">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-16 text-center text-gray-500 text-sm">
          <p>Thank you for shopping with us!</p>
          <p>For any questions, please contact support@theshop.example.com</p>
        </div>

      </div>
    </div>
  );
}
