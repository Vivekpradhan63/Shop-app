import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AdminLogin() {
  usePageTitle("Admin Login");
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to={from} replace />;
  } else if (isAuthenticated) {
    // If authenticated as normal user, they shouldn't be here, send to home
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // The backend accepts "identifier" which maps to either email or phone
      const data = await login(email.trim(), password);
      if (data.user?.role !== "admin") {
        throw new Error("Access denied. You do not have admin privileges.");
      }
      toast.success("Admin access granted");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Admin login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin Portal Login</CardTitle>
          <CardDescription>Restricted access. Please enter your admin email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Authenticating…" : "Sign In to Admin Portal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
