import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Eye, EyeOff, ShieldAlert, Mail, Lock, ArrowRight, Terminal } from "lucide-react";

export default function AdminLogin() {
  usePageTitle("Admin Login – Restricted");
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  // Typing animation state
  const [typedText, setTypedText] = useState("");
  const fullText = "Authorized personnel only.";
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
  }, []);

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to={from} replace />;
  } else if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const e = {};
    if (!identifier.trim()) e.identifier = "Email or Phone is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const data = await login(identifier.trim(), password);
      if (data.user?.role !== "admin") {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        throw new Error("Access denied. Admin privileges required.");
      }
      toast.success("Welcome back, Admin.", { icon: "🛡️" });
      navigate(from, { replace: true });
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(err.response?.data?.message || err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-root">
      {/* Animated grid background */}
      <div className="admin-login-grid" aria-hidden="true" />

      {/* Glowing orbs */}
      <div className="admin-orb admin-orb-1" aria-hidden="true" />
      <div className="admin-orb admin-orb-2" aria-hidden="true" />
      <div className="admin-orb admin-orb-3" aria-hidden="true" />

      {/* Scanline overlay */}
      <div className="admin-scanlines" aria-hidden="true" />

      <div className="admin-login-wrapper">

        {/* ── TOP BADGE ── */}
        <div className="admin-top-badge">
          <span className="admin-badge-dot" />
          SYSTEM ACCESS PORTAL
        </div>

        {/* ── SHIELD ICON ── */}
        <div className="admin-shield-wrap">
          <div className="admin-shield-ring admin-shield-ring-outer" />
          <div className="admin-shield-ring admin-shield-ring-inner" />
          <div className="admin-shield-icon">
            <ShieldAlert size={32} strokeWidth={1.5} />
          </div>
        </div>

        {/* ── TITLE ── */}
        <div className="admin-title-block">
          <h1 className="admin-title">
            ADMIN <span className="admin-title-accent">CONTROL</span>
          </h1>
          {/* Typing effect */}
          <div className="admin-typing-wrap">
            <Terminal size={12} className="admin-typing-icon" />
            <span className="admin-typing-text">{typedText}</span>
            <span className="admin-cursor">▋</span>
          </div>
        </div>

        {/* ── CARD ── */}
        <div className={`admin-card${shake ? " admin-card-shake" : ""}`}>

          {/* Red top bar */}
          <div className="admin-card-topbar" />

          <div className="admin-card-inner">
            <h2 className="admin-card-heading">Sign in</h2>
            <p className="admin-card-subheading">This area is restricted to administrators.</p>

            <form onSubmit={onSubmit} className="admin-form" noValidate>

              {/* Identifier */}
              <div className="admin-field">
                <label htmlFor="admin-identifier" className="admin-label">Email or Phone Number</label>
                <div className="admin-input-wrap">
                  <Mail size={16} className="admin-input-icon" />
                  <input
                    id="admin-identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="admin@example.com or phone"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`admin-input${errors.identifier ? " admin-input-error" : ""}`}
                  />
                </div>
                {errors.identifier && <p className="admin-error-msg">{errors.identifier}</p>}
              </div>

              {/* Password */}
              <div className="admin-field">
                <label htmlFor="admin-password" className="admin-label">Password</label>
                <div className="admin-input-wrap">
                  <Lock size={16} className="admin-input-icon" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`admin-input admin-input-pr${errors.password ? " admin-input-error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="admin-eye-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="admin-error-msg">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                id="admin-login-submit"
                type="submit"
                disabled={submitting}
                className="admin-submit-btn"
              >
                {submitting ? (
                  <span className="admin-btn-inner">
                    <span className="admin-spinner" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="admin-btn-inner">
                    Authenticate
                    <ArrowRight size={16} className="admin-btn-arrow" />
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer inside card */}
          <div className="admin-card-footer">
            <span className="admin-card-footer-dot admin-card-footer-dot-green" />
            <span className="admin-card-footer-text">
              Connection Secure · TLS 1.3
            </span>
          </div>
        </div>

        {/* Back to store link */}
        <a href="/login" className="admin-back-link">
          ← Back to store login
        </a>

      </div>

      <style>{`
        /* ──────────────── ROOT ──────────────── */
        .admin-login-root {
          position: relative;
          display: flex;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #020408;
          padding: 2rem 1rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ──────────────── GRID ──────────────── */
        .admin-login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(239,68,68,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239,68,68,0.07) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        /* ──────────────── ORBS ──────────────── */
        .admin-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .admin-orb-1 {
          width: 500px; height: 500px;
          top: -150px; left: -150px;
          background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%);
        }
        .admin-orb-2 {
          width: 400px; height: 400px;
          bottom: -100px; right: -100px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
        }
        .admin-orb-3 {
          width: 300px; height: 300px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%);
          animation: admin-pulse 4s ease-in-out infinite;
        }
        @keyframes admin-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }

        /* ──────────────── SCANLINES ──────────────── */
        .admin-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
        }

        /* ──────────────── WRAPPER ──────────────── */
        .admin-login-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 440px;
          gap: 1.25rem;
        }

        /* ──────────────── TOP BADGE ──────────────── */
        .admin-top-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(239,68,68,0.7);
          text-transform: uppercase;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 999px;
          padding: 0.3rem 0.9rem;
          background: rgba(239,68,68,0.05);
          backdrop-filter: blur(8px);
        }
        .admin-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 6px #ef4444;
          animation: admin-blink 1.4s ease-in-out infinite;
        }
        @keyframes admin-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ──────────────── SHIELD ──────────────── */
        .admin-shield-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px; height: 80px;
        }
        .admin-shield-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(239,68,68,0.25);
          animation: admin-spin-ring 8s linear infinite;
        }
        .admin-shield-ring-outer {
          width: 80px; height: 80px;
        }
        .admin-shield-ring-inner {
          width: 60px; height: 60px;
          animation-direction: reverse;
          animation-duration: 5s;
          border-color: rgba(245,158,11,0.2);
        }
        @keyframes admin-spin-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .admin-shield-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #7f1d1d 0%, #1c0a02 100%);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
          box-shadow: 0 0 30px rgba(239,68,68,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* ──────────────── TITLE ──────────────── */
        .admin-title-block {
          text-align: center;
        }
        .admin-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #fff;
          line-height: 1;
          margin: 0 0 0.5rem;
        }
        .admin-title-accent {
          background: linear-gradient(90deg, #ef4444, #f59e0b);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .admin-typing-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-family: 'Courier New', monospace;
          color: rgba(239,68,68,0.6);
        }
        .admin-typing-icon { opacity: 0.5; }
        .admin-cursor {
          animation: admin-blink 1s step-end infinite;
          color: #ef4444;
        }

        /* ──────────────── CARD ──────────────── */
        .admin-card {
          width: 100%;
          border-radius: 20px;
          border: 1px solid rgba(239,68,68,0.15);
          background: rgba(10,5,5,0.85);
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(239,68,68,0.08),
            0 25px 60px rgba(0,0,0,0.6),
            0 0 80px rgba(239,68,68,0.06) inset;
          overflow: hidden;
          transition: transform 0.15s ease;
        }
        .admin-card:hover {
          transform: translateY(-2px);
        }
        @keyframes admin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .admin-card-shake {
          animation: admin-shake 0.5s ease-in-out;
        }

        /* Top colored bar */
        .admin-card-topbar {
          height: 3px;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #ef4444);
          background-size: 200% 100%;
          animation: admin-bar-slide 3s linear infinite;
        }
        @keyframes admin-bar-slide {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }

        .admin-card-inner {
          padding: 2rem;
        }
        .admin-card-heading {
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.25rem;
        }
        .admin-card-subheading {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          margin: 0 0 1.75rem;
        }

        /* ──────────────── FORM ──────────────── */
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .admin-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .admin-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .admin-input-wrap {
          position: relative;
        }
        .admin-input-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(239,68,68,0.4);
          pointer-events: none;
        }
        .admin-input {
          width: 100%;
          height: 3rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 0.9rem;
          padding: 0 1rem 0 2.6rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .admin-input::placeholder { color: rgba(255,255,255,0.2); }
        .admin-input:focus {
          border-color: rgba(239,68,68,0.5);
          background: rgba(239,68,68,0.05);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        .admin-input-pr { padding-right: 2.8rem; }
        .admin-input-error {
          border-color: rgba(239,68,68,0.6) !important;
        }
        .admin-eye-btn {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          transition: color 0.2s;
          padding: 0;
        }
        .admin-eye-btn:hover { color: rgba(255,255,255,0.7); }
        .admin-error-msg {
          font-size: 0.72rem;
          color: #f87171;
          margin: 0;
        }

        /* ──────────────── SUBMIT ──────────────── */
        .admin-submit-btn {
          width: 100%;
          height: 3rem;
          margin-top: 0.25rem;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: 1px solid rgba(239,68,68,0.4);
          border-radius: 10px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(239,68,68,0.3);
        }
        .admin-submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .admin-submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .admin-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(239,68,68,0.4);
        }
        .admin-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .admin-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .admin-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .admin-btn-arrow {
          transition: transform 0.25s ease;
        }
        .admin-submit-btn:hover:not(:disabled) .admin-btn-arrow {
          transform: translateX(4px);
        }
        .admin-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: admin-spin 0.7s linear infinite;
        }
        @keyframes admin-spin {
          to { transform: rotate(360deg); }
        }

        /* ──────────────── CARD FOOTER ──────────────── */
        .admin-card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.75rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.2);
        }
        .admin-card-footer-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }
        .admin-card-footer-dot-green {
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        .admin-card-footer-text {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.05em;
          font-family: 'Courier New', monospace;
        }

        /* ──────────────── BACK LINK ──────────────── */
        .admin-back-link {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .admin-back-link:hover { color: rgba(255,255,255,0.55); }
      `}</style>
    </div>
  );
}
