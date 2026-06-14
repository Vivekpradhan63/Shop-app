import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatPrice } from "@/lib/formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderStatusBadgeVariant } from "@/utils/orderStatus";

const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered"];

function shortId(id) {
  return id ? `${id.slice(0, 8)}...` : "-";
}

function imageOf(item) {
  return item?.product?.images?.[0] || "https://placehold.co/64x64/e2e8f0/64748b?text=Item";
}

export default function AdminOrders() {
  usePageTitle("Admin Orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/orders?limit=1000");
      setOrders(data.orders || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return orders.filter((o) => {
      const statusOk = tab === "all" || o.orderStatus === tab;
      if (!statusOk) return false;
      if (!q) return true;
      const idMatch = o._id.toLowerCase().includes(q);
      const nameMatch = (o.user?.name || "").toLowerCase().includes(q);
      return idMatch || nameMatch;
    });
  }, [orders, tab, query]);

  const updateStatus = async (orderId, orderStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await axiosInstance.put(`/orders/${orderId}/status`, { orderStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      if (selectedOrder?._id === orderId) setSelectedOrder(data);
      toast.success("Order status updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground text-sm">Track and update all customer orders.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid h-auto grid-cols-3 gap-1 sm:grid-cols-5">
              {STATUSES.map((s) => (
                <TabsTrigger key={s} value={s} className="capitalize">
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name or order ID"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono text-xs">{shortId(o._id)}</TableCell>
                  <TableCell className="font-medium">{o.user?.name || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{o.phone || o.user?.phone || "-"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate" title={o.shippingAddress}>{o.shippingAddress || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{o.items?.length || 0}</TableCell>
                  <TableCell>{formatPrice(o.totalPrice)}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusBadgeVariant(o.orderStatus)} className="capitalize">
                      {o.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Select
                      value={o.orderStatus}
                      disabled={updatingId === o._id}
                      onValueChange={(v) => updateStatus(o._id, v)}
                    >
                      <SelectTrigger className="inline-flex w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" size="sm" variant="outline" onClick={() => setSelectedOrder(o)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">No orders found.</p>}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Review customer address, items, and status.</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
                <p><span className="font-medium">Customer:</span> {selectedOrder.user?.name || "-"}</p>
                <p><span className="font-medium">Phone:</span> {selectedOrder.phone || selectedOrder.user?.phone || "-"}</p>
                <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p className="sm:col-span-2"><span className="font-medium">Shipping:</span> {selectedOrder.shippingAddress}</p>
                <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                <p><span className="font-medium">Status:</span> <Badge className="ml-2 capitalize" variant={orderStatusBadgeVariant(selectedOrder.orderStatus)}>{selectedOrder.orderStatus}</Badge></p>
              </div>

              <div className="space-y-3">
                {selectedOrder.items?.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-md border p-3">
                    <img src={imageOf(line)} alt="" className="h-12 w-12 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{line.product?.name || "Product"}</p>
                      <p className="text-sm text-muted-foreground">Qty {line.quantity} x {formatPrice(line.price)}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(Number(line.price) * Number(line.quantity))}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
