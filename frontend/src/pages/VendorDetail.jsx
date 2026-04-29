import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, ArrowLeft, Calendar, MessageCircle,
  Phone, CheckCircle, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Instagram, Globe, Youtube,
  Clock, Users, IndianRupee, Sparkles,
} from "lucide-react";
import { getVendorDetail } from "../api/vendors";
import { createBooking }   from "../api/bookings";
import useAuthStore        from "../store/authStore";
import "./VendorDetail.css";

const CATEGORY_EMOJI = {
  PHOTOGRAPHER:   "📸",
  DECORATOR:      "🌸",
  CATERER:        "🍽️",
  VENUE:          "🏛️",
  DJ_MUSIC:       "🎧",
  MAKEUP:         "💄",
  MEHNDI:         "🤲",
  DHOL_BAND:      "🥁",
  PANDIT:         "🙏",
  TRANSPORT:      "🚗",
  TENT_FURNITURE: "⛺",
};

const EVENT_TYPES = [
  "Shaadi", "Mehndi", "Haldi", "Birthday",
  "Baby Shower", "Griha Pravesh", "Anniversary", "Graduation",
];

function BookingModal({ vendor, onClose }) {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    event_type:  "",
    event_date:  "",
    guest_count: "",
    package:     "",
    message:     "",
  });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const mutation = useMutation({
    mutationFn: (data) => createBooking(data),
    onSuccess: () => setSuccess(true),
    onError:   (err) => {
      setError(err.response?.data?.event_date?.[0] ||
               err.response?.data?.detail ||
               "Failed to send booking request.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    mutation.mutate({
      vendor:      vendor.id,
      event_type:  form.event_type,
      event_date:  form.event_date,
      guest_count: Number(form.guest_count),
      package:     form.package || undefined,
      message:     form.message,
    });
  };

  return (
    <motion.div className="modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div className="modal-box"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}>

        {success ? (
          <div className="modal-success">
            <div className="modal-success__icon"><CheckCircle size={40} /></div>
            <h3>Booking Request Sent!</h3>
            <p>
              {vendor.business_name} will review your request and respond shortly.
              You can track it in your dashboard.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn-primary" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </button>
              <button className="btn-outline" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3 className="modal-title">Request Booking</h3>
              <p className="modal-sub">{vendor.business_name}</p>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            {error && (
              <div className="auth-error" style={{ margin: "0 0 16px" }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-field">
                <label>Event Type</label>
                <select value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  required>
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Event Date</label>
                <input type="date" value={form.event_date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  required />
              </div>

              <div className="modal-field">
                <label>Number of Guests</label>
                <input type="number" placeholder="e.g. 200" min={1}
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                  required />
              </div>

              {vendor.packages?.length > 0 && (
                <div className="modal-field">
                  <label>Package (optional)</label>
                  <select value={form.package}
                    onChange={(e) => setForm({ ...form, package: e.target.value })}>
                    <option value="">No specific package</option>
                    {vendor.packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{Number(p.price).toLocaleString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-field">
                <label>Message to Vendor</label>
                <textarea rows={3} placeholder="Tell the vendor about your event..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              {!user && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                  You need to{" "}
                  <Link to="/login" style={{ color: "var(--gold)" }}>sign in</Link>
                  {" "}to send a booking request.
                </p>
              )}

              <button type="submit" className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "13px" }}
                disabled={mutation.isPending}>
                {mutation.isPending
                  ? <><span className="auth-spinner" /> Sending...</>
                  : "Send Booking Request"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function VendorDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [imgIndex, setImgIndex]     = useState(0);
  const [showModal, setShowModal]   = useState(false);

  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ["vendor", id],
    queryFn:  () => getVendorDetail(id).then((r) => r.data),
    enabled:  !!id,
  });

  if (isLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
      <Loader2 size={40} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (isError || !vendor) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: "var(--font-display)", marginBottom: 12 }}>Vendor not found</h2>
        <button className="btn-primary" onClick={() => navigate("/vendors")}>Browse Vendors</button>
      </div>
    </div>
  );

  const images  = vendor.images  || [];
  const packages = vendor.packages || [];

  const prevImg = () => setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImg = () => setImgIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="vd-page">
      {/* Back */}
      <div className="container" style={{ padding: "20px 24px 0" }}>
        <button className="vd-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to Vendors
        </button>
      </div>

      {/* Hero */}
      <div className="vd-hero">
        <div className="vd-hero__bg" />
        <div className="container vd-hero__inner">
          <div className="vd-hero__avatar">
            {vendor.cover_image
              ? <img src={vendor.cover_image} alt={vendor.business_name} />
              : <span>{CATEGORY_EMOJI[vendor.category] || "🎪"}</span>}
          </div>
          <div className="vd-hero__info">
            <div className="vd-hero__tags">
              <span className="vd-tag">{vendor.category?.replace("_", " ")}</span>
              {vendor.is_verified && (
                <span className="vd-tag vd-tag--verified">
                  <CheckCircle size={11} /> Verified
                </span>
              )}
            </div>
            <h1 className="vd-hero__name display-heading">{vendor.business_name}</h1>
            <div className="vd-hero__meta">
              <span><MapPin size={13} /> {vendor.city}{vendor.state ? `, ${vendor.state}` : ""}</span>
              <span><Clock size={13} /> {vendor.experience_years}+ years experience</span>
              <span><Star size={13} fill="#C8903A" color="#C8903A" /> {vendor.rating} ({vendor.total_reviews} reviews)</span>
            </div>
          </div>
          <div className="vd-hero__price">
            <div className="vd-hero__price-label">Starting from</div>
            <div className="vd-hero__price-val">
              ₹{Number(vendor.starting_price).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      <div className="container vd-body">
        {/* Left */}
        <div className="vd-left">

          {/* Portfolio Gallery */}
          {images.length > 0 && (
            <div className="vd-section">
              <h2 className="vd-section-title">Portfolio</h2>
              <div className="vd-gallery">
                <div className="vd-gallery__main">
                  <img
                    src={images[imgIndex]?.image}
                    alt={images[imgIndex]?.caption || "Portfolio"}
                  />
                  {images.length > 1 && (
                    <>
                      <button className="vd-gallery__nav vd-gallery__nav--prev" onClick={prevImg}>
                        <ChevronLeft size={20} />
                      </button>
                      <button className="vd-gallery__nav vd-gallery__nav--next" onClick={nextImg}>
                        <ChevronRight size={20} />
                      </button>
                      <div className="vd-gallery__dots">
                        {images.map((_, i) => (
                          <button key={i}
                            className={`vd-gallery__dot ${i === imgIndex ? "active" : ""}`}
                            onClick={() => setImgIndex(i)} />
                        ))}
                      </div>
                    </>
                  )}
                  {images[imgIndex]?.caption && (
                    <div className="vd-gallery__caption">{images[imgIndex].caption}</div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="vd-gallery__thumbs">
                    {images.map((img, i) => (
                      <img key={i} src={img.image} alt=""
                        className={`vd-gallery__thumb ${i === imgIndex ? "active" : ""}`}
                        onClick={() => setImgIndex(i)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About */}
          <div className="vd-section">
            <h2 className="vd-section-title">About</h2>
            <p className="vd-about">
              {vendor.description || "No description provided yet."}
            </p>
            <div className="vd-social">
              {vendor.instagram_url && (
                <a href={vendor.instagram_url} target="_blank" rel="noreferrer" className="vd-social-link">
                  <Instagram size={16} /> Instagram
                </a>
              )}
              {vendor.youtube_url && (
                <a href={vendor.youtube_url} target="_blank" rel="noreferrer" className="vd-social-link">
                  <Youtube size={16} /> YouTube
                </a>
              )}
              {vendor.website_url && (
                <a href={vendor.website_url} target="_blank" rel="noreferrer" className="vd-social-link">
                  <Globe size={16} /> Website
                </a>
              )}
            </div>
          </div>

          {/* Packages */}
          {packages.length > 0 && (
            <div className="vd-section">
              <h2 className="vd-section-title">Packages</h2>
              <div className="vd-packages">
                {packages.map((pkg, i) => (
                  <div key={pkg.id}
                    className={`vd-package ${pkg.is_popular ? "vd-package--popular" : ""}`}>
                    {pkg.is_popular && (
                      <div className="vd-package__badge">Most Popular</div>
                    )}
                    <div className="vd-package__name">{pkg.name}</div>
                    <div className="vd-package__price">
                      ₹{Number(pkg.price).toLocaleString("en-IN")}
                    </div>
                    {pkg.description && (
                      <p className="vd-package__desc">{pkg.description}</p>
                    )}
                    <ul className="vd-package__includes">
                      {(Array.isArray(pkg.includes) ? pkg.includes : []).map((item, j) => (
                        <li key={j}>
                          <CheckCircle size={12} color="var(--teal)" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={pkg.is_popular ? "btn-primary" : "btn-outline"}
                      style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
                      onClick={() => setShowModal(true)}>
                      Book This Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="vd-right">
          <div className="vd-sidebar-card">
            <h3 className="vd-sidebar-title">Get in Touch</h3>
            <p className="vd-sidebar-note">
              Send a booking request to check availability and get a quote.
              Your contact details are kept private.
            </p>
            <button className="btn-primary"
              style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
              onClick={() => setShowModal(true)}>
              <Calendar size={15} /> Request Booking
            </button>
            <button className="btn-outline"
              style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
              onClick={() => setShowModal(true)}>
              <MessageCircle size={15} /> Send Message
            </button>
          </div>

          <div className="vd-sidebar-card vd-sidebar-card--dark">
            <div className="vd-sidebar-dark__icon"><Sparkles size={22} /></div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12, lineHeight: 1.6 }}>
              Not sure? Let AI help you plan your full event with the right vendors.
            </p>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => navigate("/plan")}>
              <Sparkles size={14} /> Plan with AI
            </button>
          </div>

          {/* Quick Stats */}
          <div className="vd-sidebar-card">
            <h3 className="vd-sidebar-title">Quick Stats</h3>
            <div className="vd-stats">
              <div className="vd-stat">
                <Star size={16} fill="#C8903A" color="#C8903A" />
                <div>
                  <div className="vd-stat__val">{vendor.rating}</div>
                  <div className="vd-stat__label">{vendor.total_reviews} Reviews</div>
                </div>
              </div>
              <div className="vd-stat">
                <Users size={16} color="var(--teal)" />
                <div>
                  <div className="vd-stat__val">{vendor.total_bookings}</div>
                  <div className="vd-stat__label">Bookings Done</div>
                </div>
              </div>
              <div className="vd-stat">
                <Clock size={16} color="var(--gold)" />
                <div>
                  <div className="vd-stat__val">{vendor.experience_years}+</div>
                  <div className="vd-stat__label">Years Exp.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <BookingModal vendor={vendor} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}