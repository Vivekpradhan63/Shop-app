import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categories = ["Vegetables", "Fruits", "Dairy", "Bakery", "Beverages", "Snacks", "Other"];
const units = ["per kg", "per piece", "per litre", "per pack"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Other",
  unit: "per piece",
  stock: "",
  imageUrl: "",
  available: true,
};

function thumb(images) {
  return images?.[0] || "https://placehold.co/64x64/e2e8f0/64748b?text=G";
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/products");
      setProducts(data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load groceries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    const existingImage = p.images?.[0] || "";
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      category: p.category || "Other",
      unit: p.unit || "per piece",
      stock: String(p.stock ?? 0),
      imageUrl: existingImage,
      available: Boolean(p.available),
    });
    setImagePreview(existingImage);
    setDialogOpen(true);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Upload to server
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setForm((prev) => ({ ...prev, imageUrl: json.url }));
      setImagePreview(json.url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async () => {
    if (!form.name.trim() || form.price === "" || form.stock === "") {
      toast.error("Name, price, and stock quantity are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price),
      category: form.category,
      unit: form.unit,
      stock: Number(form.stock),
      available: Boolean(form.available),
      images: form.imageUrl ? [form.imageUrl.trim()] : [],
    };

    setSaving(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/products/${editingId}`, payload);
        toast.success("Grocery updated");
      } else {
        await axiosInstance.post("/products", payload);
        toast.success("Grocery added");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/products/${deleteTarget._id}`);
      toast.success("Grocery deleted");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Groceries Management</h1>
          <p className="text-muted-foreground text-sm">View, filter, create, update, and remove groceries.</p>
        </div>
        <Button type="button" onClick={openCreate}>Add Grocery</Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3 sm:flex sm:items-end sm:justify-between sm:space-y-0 sm:gap-3">
          <div className="w-full sm:max-w-sm space-y-2">
            <Label htmlFor="search-groceries">Search groceries</Label>
            <Input id="search-groceries" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" />
          </div>
          <div className="w-full sm:w-56 space-y-2">
            <Label>Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p._id}>
                  <TableCell><img src={thumb(p.images)} alt="" className="h-12 w-12 rounded object-cover" /></TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.unit || "per piece"}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant={p.available && p.stock > 0 ? "delivered" : "destructive"}>
                      {p.available && p.stock > 0 ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteTarget(p)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">No groceries found.</p>}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Grocery" : "Add Grocery"}</DialogTitle>
            <DialogDescription>Fill all required fields before submitting.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="g-name">Name *</Label>
              <Input id="g-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="g-price">Price *</Label>
                <Input id="g-price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-stock">Stock quantity *</Label>
                <Input id="g-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="g-desc">Description</Label>
              <textarea id="g-desc" className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* ── Photo Upload ── */}
            <div className="space-y-2">
              <Label>Product Photo</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
                style={{ minHeight: "140px" }}
              >
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 z-10">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="h-32 w-32 rounded-lg object-cover shadow"
                  />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <p className="text-sm text-muted-foreground">Click to upload or take a photo</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP up to 5MB</p>
                  </>
                )}
                {imagePreview && (
                  <p className="text-xs text-muted-foreground pb-2">Click to change photo</p>
                )}
              </div>
              {/* accepts camera capture on mobile, file picker on desktop */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImagePick}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Available</p>
                <p className="text-xs text-muted-foreground">Show this grocery as available to customers</p>
              </div>
              <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" disabled={saving} onClick={saveProduct}>{saving ? "Saving..." : editingId ? "Update Grocery" : "Add Grocery"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete grocery?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteTarget?.name}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
