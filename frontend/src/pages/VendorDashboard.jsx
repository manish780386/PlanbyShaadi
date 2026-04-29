import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3, Inbox, Calendar, IndianRupee,
  Settings, Bell, Star, Eye, Loader2,
  MessageCircle, CheckCircle, XCircle,
  TrendingUp, Camera,
} from "lucide-react";
import {
  getVendorLeads, acceptBooking, declineBooking, completeBooking,
} from "../api/bookings.js";
import {
  getMyVendorProfile, getVendorEarnings,
} from "../api/vendors";
import useAuthStore from "../store/authStore";
import "./Dashboard.css";

const TABS = [
  { id: "overview",  label: "Overview",    icon: BarChart3 },
  { id: "leads",     label: "New Leads",   icon: Inbox },
  { id: "bookings",  label: "Bookings",    icon: Calendar },
  { id: "earnings",  label: "Earnings",    icon: IndianRupee },
  { id: "profile",   label: "My Profile",  icon: Settings },
];

const STATUS_STYLE = {
  PENDING:   { bg: "#FAEEDA", color: "#633806", label: "Pending" },
  CONFIRMED: { bg: "#EAF3DE", color: "#27500A", label: "Confirmed" },
  COMPLETED: { bg: "#E6F1FB", color: "#0C447C", label: "Completed" },
  CANCELLED: { bg: "#FCEBEB", color: "#791F1F", label: "Cancelled" },
  REJECTED:  { bg: "#FCEBEB", color: "#791F1F", label: "Rejected" },
};

export default function VendorDashboard() {
  const [tab, setTab] = useState("overview");
  const user          = useAuthStore((s) => s.user);
  const queryClient   = useQueryClient();

  const { data: leadsData, isLoading: loadingLeads } = useQuery({
    queryKey: ["vendor-leads"],
    queryFn:  () => getVendorLeads().then((r) => r.data),
  });

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn:  () => getMyVendorProfile().then((r) => r.data),
  });

  const { data: earningsData } = useQuery({
    queryKey: ["vendor-earnings"],
    queryFn:  () => getVendorEarnings().then((r) => r.data),
  });

  const leads    = leadsData?.results    || leadsData    || [];
  const bookings = leads; // leads endpoint returns all bookings for vendor
  const pending  = leads.filter((b) => b.status === "PENDING");
  const confirmed = leads.filter((b) => b.status === "CONFIRMED");

  const acceptMutation = useMutation({
    mutationFn: (id) => acceptBooking(id),
    onSuccess:  () => queryClient.invalidateQueries(["vendor-leads"]),
  });

  const declineMutation = useMutation({
    mutationFn: (id) => declineBooking(id),
    onSuccess:  () => queryClient.invalidateQueries(["vendor-leads"]),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => completeBooking(id),
    onSuccess:  () => queryClient.invalidateQueries(["vendor-leads"]),
  });

  return (
    <div className="dashboard-page">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <div className="container dashboard-topbar__inner">
          <div>
            <p className="dashboard-greeting">Vendor Dashboard</p>
            <h1 className="dashboard-name">
              {profileData?.business_name || user?.full_name} 📸
            </h1>
          </div>
          <div className="dashboard-topbar__right">
            {profileData?.is_verified && (
              <div className="dashboard-event-badge" style={{ background: "#EAF3DE", color: "#27500A", borderColor: "rgba(42,122,112,0.25)" }}>
                <CheckCircle size={13} /> Verified
              </div>
            )}
            <div className="dashboard-event-badge">
              <Star size={13} fill="var(--gold)" color="var(--gold)" />
              {profileData?.rating || "0.0"} Rating
            </div>
            <button className="dashboard-notif"><Bell size={18} /></button>
            <div className="dashboard-avatar" style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))" }}>
              {user?.full_name?.charAt(0) || "V"}
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
              <t.icon size={16} />
              {t.label}
              {t.id === "leads" && pending.length > 0 && (
                <span style={{
                  marginLeft: "auto", background: "var(--rose-light)",
                  color: "var(--rose)", fontSize: 10, fontWeight: 600,
                  padding: "2px 7px", borderRadius: 100,
                }}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main */}
        <div className="dashboard-main">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-stats">
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#EEEDFE", color: "#534AB7" }}>
                    <Inbox size={18} />
                  </div>
                  <div className="dash-stat-val">{pending.length}</div>
                  <div className="dash-stat-label">New Leads</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#EAF3DE", color: "#3B6D11" }}>
                    <CheckCircle size={18} />
                  </div>
                  <div className="dash-stat-val">{confirmed.length}</div>
                  <div className="dash-stat-label">Confirmed</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#FAEEDA", color: "#854F0B" }}>
                    <IndianRupee size={18} />
                  </div>
                  <div className="dash-stat-val">
                    ₹{((earningsData?.total_earned || 0) / 1000).toFixed(0)}K
                  </div>
                  <div className="dash-stat-label">Total Earned</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon" style={{ background: "#FAECE7", color: "#993C1D" }}>
                    <Star size={18} />
                  </div>
                  <div className="dash-stat-val">{profileData?.rating || "0.0"}</div>
                  <div className="dash-stat-label">Avg Rating</div>
                </div>
              </div>

              {/* Recent leads */}
              <div className="dash-section">
                <div className="dash-section-header">
                  <h3 className="dash-section-title">Recent Leads</h3>
                  <button className="dash-section-link" onClick={() => setTab("leads")}>
                    View all
                  </button>
                </div>
                {loadingLeads ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <Loader2 size={24} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : pending.length === 0 ? (
                  <p style={{ fontSize: 14, color: "var(--text-muted)", padding: "12px 0" }}>
                    No new leads yet.
                  </p>
                ) : (
                  pending.slice(0, 3).map((b) => (
                    <div key={b.id} className="lead-card-full">
                      <div className="lead-card__avatar">
                        {b.user?.full_name?.charAt(0) || "U"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="lead-card__name">{b.event_type}</div>
                        <div className="lead-card__detail">
                          📅 {b.event_date} · 👥 {b.guest_count} guests
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}
                            onClick={() => acceptMutation.mutate(b.id)}
                            disabled={acceptMutation.isPending}>
                            <CheckCircle size={13} /> Accept
                          </button>
                          <button className="btn-outline" style={{ fontSize: 12, padding: "6px 14px" }}
                            onClick={() => declineMutation.mutate(b.id)}
                            disabled={declineMutation.isPending}>
                            <XCircle size={13} /> Decline
                          </button>
                        </div>
                      </div>
                      {b.total_amount > 0 && (
                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--teal)", flexShrink: 0 }}>
                          ₹{Number(b.total_amount).toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* LEADS */}
          {tab === "leads" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-page-header">
                <h2 className="dash-page-title">New Leads</h2>
                <span className="dash-count">{pending.length} pending</span>
              </div>
              {loadingLeads ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : pending.length === 0 ? (
                <div className="vendors-empty">
                  <div className="vendors-empty__emoji">📬</div>
                  <div className="vendors-empty__title">No new leads</div>
                  <div className="vendors-empty__sub">Booking requests will appear here.</div>
                </div>
              ) : (
                pending.map((b) => (
                  <div key={b.id} className="booking-card" style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 36 }}>🎪</div>
                    <div className="booking-card__info">
                      <div className="booking-card__name">{b.event_type}</div>
                      <div className="booking-card__meta">
                        <span>📅 {b.event_date}</span>
                        <span>👥 {b.guest_count} guests</span>
                      </div>
                      {b.message && (
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>
                          "{b.message}"
                        </div>
                      )}
                    </div>
                    <div className="booking-card__right">
                      <button className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}
                        onClick={() => acceptMutation.mutate(b.id)}
                        disabled={acceptMutation.isPending}>
                        <CheckCircle size={14} /> Accept
                      </button>
                      <button className="btn-outline" style={{ fontSize: 12, padding: "8px 16px" }}
                        onClick={() => declineMutation.mutate(b.id)}
                        disabled={declineMutation.isPending}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* BOOKINGS */}
          {tab === "bookings" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-page-header">
                <h2 className="dash-page-title">All Bookings</h2>
                <span className="dash-count">{bookings.length} total</span>
              </div>
              {loadingLeads ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : bookings.length === 0 ? (
                <div className="vendors-empty">
                  <div className="vendors-empty__emoji">📅</div>
                  <div className="vendors-empty__title">No bookings yet</div>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="booking-card">
                    <div style={{ fontSize: 36 }}>🎪</div>
                    <div className="booking-card__info">
                      <div className="booking-card__name">{b.event_type}</div>
                      <div className="booking-card__cat">{b.guest_count} guests</div>
                      <div className="booking-card__meta">
                        <span>📅 {b.event_date}</span>
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
                      {b.total_amount > 0 && (
                        <div className="booking-card__price">
                          ₹{Number(b.total_amount).toLocaleString("en-IN")}
                        </div>
                      )}
                      {b.status === "CONFIRMED" && b.is_paid && (
                        <button className="btn-outline" style={{ fontSize: 12, padding: "6px 12px" }}
                          onClick={() => completeMutation.mutate(b.id)}>
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* EARNINGS */}
          {tab === "earnings" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-page-header">
                <h2 className="dash-page-title">Earnings</h2>
              </div>
              <div className="budget-summary">
                <div className="budget-summary__card">
                  <div className="budget-summary__label">Total Earned</div>
                  <div className="budget-summary__val">
                    ₹{Number(earningsData?.total_earned || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="budget-summary__card">
                  <div className="budget-summary__label">Total Bookings</div>
                  <div className="budget-summary__val" style={{ color: "var(--teal)" }}>
                    {earningsData?.total_bookings || 0}
                  </div>
                </div>
                <div className="budget-summary__card">
                  <div className="budget-summary__label">Avg Rating</div>
                  <div className="budget-summary__val" style={{ color: "var(--gold)" }}>
                    {earningsData?.rating || "0.0"} ★
                  </div>
                </div>
              </div>
              <div className="dash-section" style={{ marginTop: 20 }}>
                <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                  Detailed earnings breakdown coming soon. Connect Razorpay to enable payouts.
                </p>
              </div>
            </motion.div>
          )}

          {/* PROFILE */}
          {tab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="dash-page-header">
                <h2 className="dash-page-title">My Profile</h2>
                <button className="btn-primary" style={{ fontSize: 13, padding: "9px 18px" }}>
                  Save Changes
                </button>
              </div>
              {loadingProfile ? (
                <div style={{ textAlign: "center", padding: 60 }}>
                  <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : (
                <div className="dash-section">
                  <div className="profile-photo-section">
                    <div className="profile-photo">
                      {profileData?.cover_image
                        ? <img src={profileData.cover_image} alt="cover"
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 20 }} />
                        : <span style={{ fontSize: 40 }}>📸</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>Business Cover Photo</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                        Upload a high-quality image (min 500×500px)
                      </div>
                      <button className="btn-outline" style={{ fontSize: 13 }}>
                        <Camera size={14} style={{ marginRight: 6 }} /> Upload Photo
                      </button>
                    </div>
                  </div>
                  <div className="profile-form">
                    {[
                      { label: "Business Name",      val: profileData?.business_name,    key: "business_name" },
                      { label: "City",               val: profileData?.city,             key: "city" },
                      { label: "Starting Price (₹)", val: profileData?.starting_price,   key: "starting_price" },
                      { label: "Experience (years)", val: profileData?.experience_years, key: "experience_years" },
                    ].map((f) => (
                      <div key={f.key} className="profile-field">
                        <label className="auth-label">{f.label}</label>
                        <input type="text" defaultValue={f.val || ""}
                          className="profile-input" />
                      </div>
                    ))}
                    <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                      <label className="auth-label">Description</label>
                      <textarea rows={4} defaultValue={profileData?.description || ""}
                        className="profile-input" style={{ resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}