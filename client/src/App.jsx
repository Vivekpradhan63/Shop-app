import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout.jsx";
import AdminLayout from "@/components/layout/AdminLayout.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import AdminRoute from "@/components/AdminRoute.jsx";
import Home from "@/pages/Home.jsx";
import Products from "@/pages/Products.jsx";
import ProductDetail from "@/pages/ProductDetail.jsx";
import Cart from "@/pages/Cart.jsx";
import OrderSuccess from "@/pages/OrderSuccess.jsx";
import Orders from "@/pages/Orders.jsx";
import OrderDetail from "@/pages/OrderDetail.jsx";
import Invoice from "@/pages/Invoice.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";
import Profile from "@/pages/Profile.jsx";

import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import AdminProducts from "@/pages/admin/AdminProducts.jsx";
import AdminOrders from "@/pages/admin/AdminOrders.jsx";
import AdminUsers from "@/pages/admin/AdminUsers.jsx";
import AdminLogin from "@/pages/admin/AdminLogin.jsx";

export default function App() {
  return (
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
  );
}


