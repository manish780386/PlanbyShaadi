import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar, Heart, CheckSquare, IndianRupee,
  MapPin, Star, Bell, Sparkles, LayoutDashboard,
  ChevronRight, Plus, Loader2, ArrowRight,
} from "lucide-react";
import { getMyBookings } from "../api/bookings";
import { getAISessions } from "../api/chat";
import useAuthStore from "../store/authStore";
import "./Dashboard.css";

const TABS = [
  { id: "overview",  label: "Overview",    icon: LayoutDashboard },
  { id: "bookings",  label: "My Bookings", icon: Calendar },
  { id: "ai-plans",  label: "AI Plans",    icon: Sparkles },
];

const STATUS_STYLE = {
  PENDING:   { bg: "#FAEEDA", color: "#633806", label: "Pending" },
  CONFIRMED: { bg: "#EAF3DE", color: "#27500A", label: "Confirmed" },
  COMPLETED: { bg: "#E6F1FB", color: "#0C447C", label: "Completed" },
  CANCELLED: { bg: "#FCEBEB", color: "#791F1F", label: "Cancelled" },
  REJECTED:  { bg: "#FCEBEB", color: "#791F1F", label: "Rejected" },
};

export default function UserDashboard() {
  const [tab, setTab] = useState("overview");
  const navigate      = useNavigate();
  const user          = useAuthStore((s) => s.user);

  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn:  () => getMyBookings().then((r) => r.data),
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ["ai-sessions"],
    queryFn:  () => getAISessions().then((r) => r.data),
  });

  const bookings = bookingsData?.results || bookingsData || [];
  const sessions = sessionsData?.results || sessionsData || [];

  const totalSpent = bookings
    .filter((b) => b.is_paid)
    .reduce((s, b) => s + Number(b.total_amount), 0);

  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  return (
    <div className="dashboard-page">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <div className="container dashboard-topbar__inner">
          <div>
            <p className="dashboard-greeting">Welcome back,</p>
            <h1 className="dashboard-name">{user?.full_name} 👋</h1>
          </div>
          <div className="dashboard-topbar__right">
            <div className="dashboard-event-badge">
              <MapPin size={13} /> {user?.city || "Your City"}
            </div>
            <button className="dashboard-notif"><Bell size={18} /></button>
            <div className="dashboard-avatar">
              {user?.full_name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-body">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          {TABS.map((t) => (
            <button key={t.id}
              className={`dash-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
          <div className="dash-sidebar-divider" />
          <Link to="/plan" className="dash-ai-btn">
            <Sparkles size={14} /> Chat with AI Planner
          </Link>
          <Link to="/vendors" className="dash-ai-btn" style={{ marginTop: 6 }}>
            <Plus size={14} /> Browse Vendors
          </Link>
        </div>

        {/* Main */}
        <div className="dashboard-main">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-stats">
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#EEEDFE", color: "#534AB7" }}>
                    <Calendar size={18} />
                  </div>
                  <div className="dash-stat-val">{bookings.length}</div>
                  <div className="dash-stat-label">Total Bookings</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#EAF3DE", color: "#3B6D11" }}>
                    <Calendar size={18} />
                  </div>
                  <div className="dash-stat-val">{confirmedCount}</div>
                  <div className="dash-stat-label">Confirmed</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#FAEEDA", color: "#854F0B" }}>
                    <IndianRupee size={18} />
                  </div>
                  <div className="dash-stat-val">
                    ₹{(totalSpent / 1000).toFixed(0)}K
                  </div>
                  <div className="dash-stat-label">Total Spent</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#FAECE7", color: "#993C1D" }}>
                    <Sparkles size={18} />
                  </div>
                  <div className="dash-stat-val">{sessions.length}</div>
                  <div className="dash-stat-label">AI Plans Created</div>
                </div>
              </div>

              {/* Recent bookings */}
              <div className="dash-section">
                <div className="dash-section-header">
                  <h3 className="dash-section-title">Recent Bookings</h3>
                  <button className="dash-section-link" onClick={() => setTab("bookings")}>
                    View all <ChevronRight size={13} />
                  </button>
                </div>
                {loadingBookings ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <Loader2 size={24} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : bookings.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 14 }}>
                    No bookings yet.{" "}
                    <Link to="/vendors" style={{ color: "var(--gold)" }}>Browse vendors</Link>
                  </div>
                ) : (
                  bookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="booking-row"
                      onClick={() => navigate(`/bookings/${b.id}`)}
                      style={{ cursor: "pointer" }}>
                      <div className="booking-row__info">
                        <div className="booking-row__name">{b.vendor_name}</div>
                        <div className="booking-row__meta">
                          <MapPin size={11} /> {b.vendor_city} · {b.event_type} · {b.event_date}
                        </div>
                      </div>
                      <span className="booking-status"
                        style={{
                          background: STATUS_STYLE[b.status]?.bg,
                          color:      STATUS_STYLE[b.status]?.color,
                        }}>
                        {STATUS_STYLE[b.status]?.label}
                      </span>
                      <div className="booking-row__price">
                        ₹{Number(b.total_amount).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* AI Plans preview */}
              <div className="dash-section">
                <div className="dash-section-header">
                  <h3 className="dash-section-title">Recent AI Plans</h3>
                  <button className="dash-section-link" onClick={() => setTab("ai-plans")}>
                    View all <ChevronRight size={13} />
                  </button>
                </div>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 14 }}>
                    No AI plans yet.{" "}
                    <Link to="/plan" style={{ color: "var(--gold)" }}>Start planning</Link>
                  </div>
                ) : (
                  sessions.slice(0, 2).map((s) => (
                    <div key={s.id} className="booking-row">
                      <div className="booking-row__info">
                        <div className="booking-row__name">{s.event_type} in {s.city}</div>
                        <div className="booking-row__meta">
                          Budget: ₹{Number(s.budget).toLocaleString("en-IN")} ·
                          Guests: {s.guest_count} ·
                          {new Date(s.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* BOOKINGS */}
          {tab === "bookings" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-page-header">
                <h2 className="dash-page-title">My Bookings</h2>
                <Link to="/vendors" className="btn-primary" style={{ fontSize: 13, padding: "9px 18px" }}>
                  <Plus size={14} /> Book a Vendor
                </Link>
              </div>

              {loadingBookings ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : bookings.length === 0 ? (
                <div className="vendors-empty">
                  <div className="vendors-empty__emoji">📅</div>
                  <div className="vendors-empty__title">No bookings yet</div>
                  <div className="vendors-empty__sub">Browse vendors and send your first booking request.</div>
                  <Link to="/vendors" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
                    Browse Vendors <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="booking-card">
                    <div style={{ fontSize: 36 }}>
                      {b.vendor_cat === "PHOTOGRAPHER" ? "📸"
                        : b.vendor_cat === "DECORATOR" ? "🌸"
                        : b.vendor_cat === "CATERER"   ? "🍽️"
                        : "🎪"}
                    </div>
                    <div className="booking-card__info">
                      <div className="booking-card__name">{b.vendor_name}</div>
                      <div className="booking-card__cat">{b.event_type}</div>
                      <div className="booking-card__meta">
                        <span><MapPin size={11} /> {b.vendor_city}</span>
                        <span><Calendar size={11} /> {b.event_date}</span>
                      </div>
                    </div>
                    <div className="booking-card__right">
                      <span className="booking-status"
                        style={{
                          background: STATUS_STYLE[b.status]?.bg,
                          color:      STATUS_STYLE[b.status]?.color,
                        }}>
                        {STATUS_STYLE[b.status]?.label}
                      </span>
                      <div className="booking-card__price">
                        ₹{Number(b.total_amount).toLocaleString("en-IN")}
                      </div>
                      {b.status === "CONFIRMED" && !b.is_paid && (
                        <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* AI PLANS */}
          {tab === "ai-plans" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-page-header">
                <h2 className="dash-page-title">My AI Plans</h2>
                <Link to="/plan" className="btn-primary" style={{ fontSize: 13, padding: "9px 18px" }}>
                  <Sparkles size={14} /> New Plan
                </Link>
              </div>

              {loadingSessions ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : sessions.length === 0 ? (
                <div className="vendors-empty">
                  <div className="vendors-empty__emoji">🤖</div>
                  <div className="vendors-empty__title">No AI plans yet</div>
                  <div className="vendors-empty__sub">Use our AI planner to generate event plans.</div>
                  <Link to="/plan" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
                    <Sparkles size={14} /> Start Planning
                  </Link>
                </div>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="booking-card">
                    <div style={{ fontSize: 36 }}>
                      {s.event_type === "Shaadi"      ? "💍"
                        : s.event_type === "Birthday" ? "🎂"
                        : s.event_type === "Mehndi"   ? "🌿"
                        : "🎉"}
                    </div>
                    <div className="booking-card__info">
                      <div className="booking-card__name">{s.event_type}</div>
                      <div className="booking-card__cat">{s.city}</div>
                      <div className="booking-card__meta">
                        <span>Budget: ₹{Number(s.budget).toLocaleString("en-IN")}</span>
                        <span>Guests: {s.guest_count}</span>
                        <span>{s.messages?.length || 0} messages</span>
                      </div>
                    </div>
                    <div className="booking-card__right">
                      <div style={{ fontSize: 12, color: "var(--text-light)" }}>
                        {new Date(s.created_at).toLocaleDateString("en-IN")}
                      </div>
                      <Link to="/plan" className="btn-outline" style={{ fontSize: 12, padding: "6px 14px" }}>
                        Continue
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}