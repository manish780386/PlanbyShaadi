import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  MapPin, Sparkles, ArrowRight, ArrowLeft,
  AlertCircle, CheckCircle, Building2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

const CITIES = [
  "Mumbai", "Delhi", "Jaipur", "Udaipur", "Bangalore",
  "Hyderabad", "Chennai", "Pune", "Indore", "Lucknow",
  "Ahmedabad", "Kolkata", "Surat", "Bhopal", "Nagpur",
];

const VENDOR_CATS = [
  { value: "PHOTOGRAPHER",   label: "Photographer" },
  { value: "DECORATOR",      label: "Decorator" },
  { value: "CATERER",        label: "Caterer" },
  { value: "VENUE",          label: "Venue" },
  { value: "DJ_MUSIC",       label: "DJ & Music" },
  { value: "MAKEUP",         label: "Makeup Artist" },
  { value: "MEHNDI",         label: "Mehndi Artist" },
  { value: "INVITATION",     label: "Invitation Designer" },
  { value: "DHOL_BAND",      label: "Dhol & Band" },
  { value: "PANDIT",         label: "Pandit / Priest" },
  { value: "TRANSPORT",      label: "Transport & Cars" },
  { value: "TENT_FURNITURE", label: "Tent & Furniture" },
];

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains uppercase",    ok: /[A-Z]/.test(password) },
    { label: "Contains number",       ok: /\d/.test(password) },
    { label: "Contains special char", ok: /[!@#$%^&*]/.test(password) },
  ];
  const score  = checks.filter((c) => c.ok).length;
  const colors = ["", "#E24B4A", "#EF9F27", "#639922", "#1D9E75"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="pwd-strength">
      <div className="pwd-strength__bars">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pwd-strength__bar"
            style={{ background: i <= score ? colors[score] : "var(--sand)" }} />
        ))}
      </div>
      <span className="pwd-strength__label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
      <div className="pwd-checks">
        {checks.map((c) => (
          <div key={c.label} className={`pwd-check ${c.ok ? "ok" : ""}`}>
            <CheckCircle size={10} /> {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const { register, loading, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();

  const defaultRole = searchParams.get("role") === "VENDOR" ? "VENDOR" : "";
  const [role,     setRole]     = useState(defaultRole);
  const [step,     setStep]     = useState(defaultRole ? 1 : 0);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    full_name:     "",
    email:         "",
    phone:         "",
    city:          "",
    password:      "",
    confirmPass:   "",
    business_name: "",
    category:      "",
  });

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    clearError();
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPass) return;

    const payload = {
      full_name: form.full_name || form.business_name,
      email:     form.email   || undefined,
      phone:     form.phone   || undefined,
      password:  form.password,
      password2: form.confirmPass,
      role,
      city:      form.city,
    };

    await register(payload);
  };

  const steps =
    role === "VENDOR"
      ? ["Account Type", "Business Info", "Login Setup"]
      : ["Account Type", "Personal Info", "Login Setup"];

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-left__bg">
          {["💍", "🌸", "🎂", "👶", "🎉", "💛", "🏰", "🎭"].map((e, i) => (
            <motion.div key={i} className="auth-float-emoji"
              style={{
                left:     `${10 + (i % 4) * 22}%`,
                top:      `${15 + Math.floor(i / 4) * 38}%`,
                fontSize: i % 3 === 0 ? 40 : i % 3 === 1 ? 28 : 20,
                opacity:  i % 3 === 0 ? 0.25 : 0.12,
              }}
              animate={{ y: [0, i % 2 === 0 ? -14 : 14, 0] }}
              transition={{ repeat: Infinity, duration: 3 + i * 0.4, ease: "easeInOut" }}>
              {e}
            </motion.div>
          ))}
        </div>
        <div className="auth-left__content">
          <Link to="/" className="auth-logo">
            <div className="auth-logo__icon"><Sparkles size={18} /></div>
            <span>PlanMyShaadi</span>
          </Link>
          <div className="auth-left__headline">
            <h1 className="display-heading auth-left__title">
              Join India's<br /><em>smartest</em><br />event platform
            </h1>
            <p className="auth-left__sub">
              50,000+ couples trust PlanMyShaadi. Find verified vendors, plan with AI.
            </p>
          </div>
          {role && (
            <div className="auth-steps-left">
              {steps.map((s, i) => (
                <div key={s} className={`auth-step-item ${i === step ? "active" : i < step ? "done" : ""}`}>
                  <div className="auth-step-dot">
                    {i < step ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                  </div>
                  <span className="auth-step-label">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <motion.div className="auth-right"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}>
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {step === 0 ? "Create your account"
                : step === 1
                  ? role === "USER" ? "Tell us about you" : "Your business"
                  : "Set up login"}
            </h2>
            <p className="auth-form-sub">
              {step === 0
                ? "Choose how you want to use PlanMyShaadi"
                : `Step ${step + 1} of ${steps.length}`}
            </p>
          </div>

          {error && (
            <motion.div className="auth-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}>
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* Step 0 — Role */}
            {step === 0 && (
              <motion.div key="s0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}>
                <div className="role-cards">
                  <div className={`role-card ${role === "USER" ? "active" : ""}`}
                    onClick={() => setRole("USER")}>
                    <div className="role-card__icon">👰</div>
                    <div className="role-card__title">Couple / User</div>
                    <div className="role-card__sub">Find vendors & plan your event</div>
                    {role === "USER" && <div className="role-card__check"><CheckCircle size={16} /></div>}
                  </div>
                  <div className={`role-card ${role === "VENDOR" ? "active" : ""}`}
                    onClick={() => setRole("VENDOR")}>
                    <div className="role-card__icon">🏢</div>
                    <div className="role-card__title">Vendor / Business</div>
                    <div className="role-card__sub">List your services & get bookings</div>
                    {role === "VENDOR" && <div className="role-card__check"><CheckCircle size={16} /></div>}
                  </div>
                </div>
                <button className="auth-submit btn-primary" onClick={next} disabled={!role}>
                  Continue <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {/* Step 1 — User */}
            {step === 1 && role === "USER" && (
              <motion.form key="s1u"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => { e.preventDefault(); next(); }}
                className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrap">
                    <User size={15} className="auth-input-icon" />
                    <input type="text" placeholder="Priya Sharma"
                      value={form.full_name}
                      onChange={(e) => set("full_name", e.target.value)}
                      className="auth-input" required />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Your City</label>
                  <div className="auth-input-wrap">
                    <MapPin size={15} className="auth-input-icon" />
                    <select value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className="auth-input auth-select" required>
                      <option value="">Select city</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-btn-row">
                  <button type="button" className="auth-back btn-outline" onClick={back}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button type="submit" className="auth-submit btn-primary">
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 1 — Vendor */}
            {step === 1 && role === "VENDOR" && (
              <motion.form key="s1v"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => { e.preventDefault(); next(); }}
                className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Business Name</label>
                  <div className="auth-input-wrap">
                    <Building2 size={15} className="auth-input-icon" />
                    <input type="text" placeholder="Royal Frames Studio"
                      value={form.business_name}
                      onChange={(e) => set("business_name", e.target.value)}
                      className="auth-input" required />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Service Category</label>
                  <div className="auth-input-wrap">
                    <Sparkles size={15} className="auth-input-icon" />
                    <select value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className="auth-input auth-select" required>
                      <option value="">Select category</option>
                      {VENDOR_CATS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">City of Operation</label>
                  <div className="auth-input-wrap">
                    <MapPin size={15} className="auth-input-icon" />
                    <select value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      className="auth-input auth-select" required>
                      <option value="">Select city</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-btn-row">
                  <button type="button" className="auth-back btn-outline" onClick={back}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button type="submit" className="auth-submit btn-primary">
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2 — Login Setup */}
            {step === 2 && (
              <motion.form key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail size={15} className="auth-input-icon" />
                    <input type="email" placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="auth-input" autoComplete="email" />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Phone (optional)</label>
                  <div className="auth-input-wrap">
                    <Phone size={15} className="auth-input-icon" />
                    <span className="auth-input-prefix">+91</span>
                    <input type="tel" placeholder="9876543210" maxLength={10}
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className="auth-input auth-input--prefix" />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Create Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={15} className="auth-input-icon" />
                    <input type={showPass ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="auth-input" autoComplete="new-password" />
                    <button type="button" className="auth-eye"
                      onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={15} className="auth-input-icon" />
                    <input type="password" placeholder="Re-enter password"
                      value={form.confirmPass}
                      onChange={(e) => set("confirmPass", e.target.value)}
                      className="auth-input" autoComplete="new-password" />
                    {form.confirmPass && (
                      <span className="auth-input-check">
                        {form.password === form.confirmPass
                          ? <CheckCircle size={15} color="#1D9E75" />
                          : <AlertCircle size={15} color="#E24B4A" />}
                      </span>
                    )}
                  </div>
                </div>
                <p className="auth-terms">
                  By creating an account you agree to our{" "}
                  <Link to="/terms" className="auth-switch-link">Terms</Link> and{" "}
                  <Link to="/privacy" className="auth-switch-link">Privacy Policy</Link>.
                </p>
                <div className="auth-btn-row">
                  <button type="button" className="auth-back btn-outline" onClick={back}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button type="submit" className="auth-submit btn-primary" disabled={loading}>
                    {loading
                      ? <span className="auth-spinner" />
                      : <>Create Account <ArrowRight size={15} /></>}
                  </button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}