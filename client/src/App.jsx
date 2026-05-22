import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout.jsx";
import AdminLayout from "@/components/layout/AdminLayout.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import AdminRoute from "@/components/AdminRoute.jsx";

const Home = lazy(() => import("@/pages/Home.jsx"));
const Products = lazy(() => import("@/pages/Products.jsx"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail.jsx"));
const Cart = lazy(() => import("@/pages/Cart.jsx"));
const OrderSuccess = lazy(() => import("@/pages/OrderSuccess.jsx"));
const Orders = lazy(() => import("@/pages/Orders.jsx"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail.jsx"));
const Invoice = lazy(() => import("@/pages/Invoice.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));
const Register = lazy(() => import("@/pages/Register.jsx"));
const Profile = lazy(() => import("@/pages/Profile.jsx"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard.jsx"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts.jsx"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders.jsx"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers.jsx"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin.jsx"));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-slate-50">
    <Loader2 className="w-12 h-12 text-primary animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* All main app pages require login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Printable Invoice (No Layout) */}
          <Route path="/orders/:id/invoice" element={<Invoice />} />
        </Route>

        {/* Public pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="groceries" element={<AdminProducts />} />
            <Route path="products" element={<Navigate to="/admin/groceries" replace />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}


