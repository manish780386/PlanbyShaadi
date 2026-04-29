import { useState } from "react";
import { Link }     from "react-router-dom";
import { motion }   from "framer-motion";
import { Mail, Phone, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth }  from "../hooks/useAuth.js";
import "./Auth.css";

export default function Login() {
  const { login, loading, error, clearError } = useAuth();

  const [mode,     setMode]     = useState("email"); // "email" | "phone"
  const [form,     setForm]     = useState({ email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); clearError(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = mode === "email"
      ? { email: form.email, password: form.password }
      : { phone: form.phone, password: form.password };
    await login(payload);
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left__bg">
          {["💍","🌸","🎂","👶","🎉","💛","🏰","🎭"].map((e, i) => (
            <motion.div key={i} className="auth-float-emoji"
              style={{ left:`${10+(i%4)*22}%`, top:`${15+Math.floor(i/4)*38}%`,
                fontSize: i%3===0?40:i%3===1?28:20, opacity: i%3===0?0.25:0.12 }}
              animate={{ y:[0, i%2===0?-14:14, 0] }}
              transition={{ repeat:Infinity, duration:3+i*0.4, ease:"easeInOut" }}>
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
              Welcome<br /><em>back</em>
            </h1>
            <p className="auth-left__sub">
              50,000+ couples trust PlanMyShaadi to plan their perfect celebration.
            </p>
          </div>
          <div className="auth-testimonial">
            <div className="auth-testimonial__avatar">PS</div>
            <div>
              <p className="auth-testimonial__text">"Found our wedding photographer in 10 minutes!"</p>
              <p className="auth-testimonial__name">Priya S. — Mumbai Wedding, 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <motion.div className="auth-right"
        initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
        transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}>
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Sign in</h2>
            <p className="auth-form-sub">Choose how you want to sign in</p>
          </div>

          {/* Mode Toggle */}
          <div className="auth-role-toggle" style={{ marginBottom: 20 }}>
            <button className={`auth-role-btn ${mode==="email"?"active":""}`} onClick={() => setMode("email")}>
              <Mail size={13} style={{ marginRight:5, verticalAlign:"middle" }} /> Email
            </button>
            <button className={`auth-role-btn ${mode==="phone"?"active":""}`} onClick={() => setMode("phone")}>
              <Phone size={13} style={{ marginRight:5, verticalAlign:"middle" }} /> Phone
            </button>
          </div>

          {error && (
            <motion.div className="auth-error" initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "email" ? (
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail size={15} className="auth-input-icon" />
                  <input type="email" placeholder="you@example.com"
                    value={form.email} onChange={e => set("email", e.target.value)}
                    className="auth-input" autoComplete="email" required />
                </div>
              </div>
            ) : (
              <div className="auth-field">
                <label className="auth-label">Phone Number</label>
                <div className="auth-input-wrap">
                  <Phone size={15} className="auth-input-icon" />
                  <span className="auth-input-prefix">+91</span>
                  <input type="tel" placeholder="9876543210" maxLength={10}
                    value={form.phone} onChange={e => set("phone", e.target.value)}
                    className="auth-input auth-input--prefix" required />
                </div>
              </div>
            )}

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
              </div>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input type={showPass?"text":"password"} placeholder="Your password"
                  value={form.password} onChange={e => set("password", e.target.value)}
                  className="auth-input" autoComplete="current-password" required />
                <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit btn-primary" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <>Sign In <ArrowRight size={15}/></>}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch-link">Create one free</Link>
          </p>
          <p className="auth-switch" style={{ marginTop:8 }}>
            Are you a vendor?{" "}
            <Link to="/register?role=VENDOR" className="auth-switch-link">Register as Vendor</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}