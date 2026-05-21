import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Eye, EyeOff, ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  usePageTitle("Admin Login");
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-12">
      {/* Decorative background blobs (Red/Purple for Admin distinction) */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-rose-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-2xl" />

      <div className="relative w-full max-w-md">
        {/* ── Brand Header ── */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-2xl shadow-rose-500/40">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Admin{" "}
              <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
                PORTAL
              </span>
            </h1>
            <p className="mt-1 text-sm font-medium text-rose-300/70 tracking-widest uppercase">
              Restricted Access
            </p>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome back, Admin</h2>
            <p className="mt-1 text-sm text-blue-200/60">
              Sign in to manage operations
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-blue-100">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/50" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/10 bg-white/10 pl-10 text-white placeholder:text-white/30 focus:border-rose-400 focus:ring-rose-400/30 h-12"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-blue-100">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/50" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-white/10 pl-10 pr-10 text-white placeholder:text-white/30 focus:border-rose-400 focus:ring-rose-400/30 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={submitting}
              className="group relative w-full h-12 overflow-hidden bg-gradient-to-r from-rose-500 to-purple-600 font-semibold text-white shadow-lg shadow-rose-500/30 hover:from-rose-600 hover:to-purple-700 transition-all duration-300 border-0"
            >
              <span className="flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In to Admin Portal
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </Button>
          </form>

        </div>

      </div>
    </div>
  );
}
