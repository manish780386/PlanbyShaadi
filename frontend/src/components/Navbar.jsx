import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, ChevronDown, Menu, X, Sparkles,
  LayoutDashboard, LogOut, User, Building2,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { useAuth }  from "../hooks/useAuth";
import "./Navbar.css";

const CITIES = [
  { name: "Mumbai",    state: "Maharashtra", emoji: "🌊" },
  { name: "Delhi",     state: "NCR",         emoji: "🏛️" },
  { name: "Jaipur",    state: "Rajasthan",   emoji: "🌸" },
  { name: "Udaipur",   state: "Rajasthan",   emoji: "🏰" },
  { name: "Bangalore", state: "Karnataka",   emoji: "🌿" },
  { name: "Hyderabad", state: "Telangana",   emoji: "💎" },
  { name: "Chennai",   state: "Tamil Nadu",  emoji: "🌺" },
  { name: "Kolkata",   state: "West Bengal", emoji: "🎭" },
  { name: "Pune",      state: "Maharashtra", emoji: "☕" },
  { name: "Ahmedabad", state: "Gujarat",     emoji: "🎪" },
  { name: "Indore",    state: "Madhya Pradesh", emoji: "🍛" },
  { name: "Lucknow",   state: "Uttar Pradesh",  emoji: "🌙" },
];

const NAV_LINKS = [
  { label: "How It Works", path: "/how-it-works" },
  { label: "Vendors",      path: "/vendors" },
  { label: "Plan with AI", path: "/plan" },
];

export default function Navbar() {
  const [city,        setCity]        = useState("Mumbai");
  const [cityOpen,    setCityOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userMenuOpen,setUserMenuOpen]= useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  const dropRef    = useRef(null);
  const userRef    = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();
  const { logout } = useAuth();
  const user       = useAuthStore((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))  setCityOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectCity = (name) => {
    setCity(name);
    setCityOpen(false);
    navigate(`/vendors?city=${name}`);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const dashboardPath =
    user?.role === "VENDOR" ? "/vendor/dashboard"
    : user?.role === "ADMIN" ? "/admin/dashboard"
    : "/dashboard";

  return (
    <motion.nav
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

      <div className="navbar__inner container">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon"><Sparkles size={16} /></div>
          <span className="navbar__logo-text">PlanMyShaadi</span>
        </Link>

        {/* City Picker */}
        <div className="navbar__city" ref={dropRef}>
          <button className="navbar__city-btn"
            onClick={() => setCityOpen(!cityOpen)}>
            <MapPin size={14} className="navbar__city-pin" />
            <span>{city}</span>
            <ChevronDown size={13}
              className={`navbar__city-chevron ${cityOpen ? "open" : ""}`} />
          </button>

          <AnimatePresence>
            {cityOpen && (
              <motion.div className="city-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{ opacity: 0,    y: 8,   scale: 0.96 }}
                transition={{ duration: 0.18 }}>
                <p className="city-dropdown__label">Choose your city</p>
                <div className="city-dropdown__grid">
                  {CITIES.map((c) => (
                    <button key={c.name}
                      className={`city-option ${city === c.name ? "active" : ""}`}
                      onClick={() => selectCity(c.name)}>
                      <span className="city-option__emoji">{c.emoji}</span>
                      <div>
                        <div className="city-option__name">{c.name}</div>
                        <div className="city-option__state">{c.state}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Nav */}
        <div className="navbar__links">
          {NAV_LINKS.map((l) => (
            <Link key={l.path} to={l.path}
              className={`navbar__link ${location.pathname === l.path ? "active" : ""}`}>
              {l.label}
            </Link>
          ))}

          {user ? (
            /* Logged in — avatar + dropdown */
            <div className="navbar__user-menu" ref={userRef}>
              <button className="navbar__avatar"
                onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="navbar__avatar-circle">
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="navbar__avatar-name">
                  {user.full_name?.split(" ")[0]}
                </span>
                <ChevronDown size={12} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div className="user-dropdown"
                    initial={{ opacity: 0, y: 8,  scale: 0.96 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{    opacity: 0, y: 6,  scale: 0.96 }}
                    transition={{ duration: 0.15 }}>
                    <div className="user-dropdown__header">
                      <div className="user-dropdown__name">{user.full_name}</div>
                      <div className="user-dropdown__email">
                        {user.email || user.phone}
                      </div>
                      <div className="user-dropdown__role">{user.role}</div>
                    </div>
                    <Link to={dashboardPath} className="user-dropdown__item"
                      onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link to="/plan" className="user-dropdown__item"
                      onClick={() => setUserMenuOpen(false)}>
                      <Sparkles size={14} /> AI Planner
                    </Link>
                    <div className="user-dropdown__divider" />
                    <button className="user-dropdown__item user-dropdown__logout"
                      onClick={handleLogout}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Not logged in */
            <div className="navbar__auth-btns">
              <Link to="/login" className="navbar__link">Sign In</Link>
              <Link to="/register" className="btn-primary navbar__cta">
                <Sparkles size={14} /> Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="navbar__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.path} to={l.path}
                className="mobile-menu__link"
                onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={dashboardPath} className="mobile-menu__link"
                  onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={14} style={{ marginRight: 8 }} />
                  Dashboard
                </Link>
                <button className="mobile-menu__link mobile-menu__logout"
                  onClick={handleLogout}>
                  <LogOut size={14} style={{ marginRight: 8 }} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-menu__auth">
                <Link to="/login" className="btn-outline"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </div>
            )}
            <div className="mobile-menu__vendor-link">
              <Building2 size={14} />
              <Link to="/register?role=VENDOR"
                onClick={() => setMobileOpen(false)}>
                Are you a Vendor? Register here
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}