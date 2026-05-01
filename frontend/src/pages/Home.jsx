import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Sparkles, Star, ArrowRight, MapPin,
  Camera, Flower2, Music, ChefHat, Palette,
  Building2, Users, Award, TrendingUp, Heart,
} from "lucide-react";
import { getVendors }  from "../api/vendors";
import { getEvents }   from "../api/chat";
import useAuthStore    from "../store/authStore";
import "./Home.css";

const CITIES = [
  { name: "Mumbai",    emoji: "🌊" },
  { name: "Delhi",     emoji: "🏛️" },
  { name: "Jaipur",    emoji: "🌸" },
  { name: "Udaipur",   emoji: "🏰" },
  { name: "Bangalore", emoji: "🌿" },
  { name: "Hyderabad", emoji: "💎" },
];

const FALLBACK_EVENTS = [
  { id: 1, name: "Shaadi",        icon: "💍", slug: "shaadi" },
  { id: 2, name: "Mehndi",        icon: "🌿", slug: "mehndi" },
  { id: 3, name: "Haldi",         icon: "💛", slug: "haldi" },
  { id: 4, name: "Birthday",      icon: "🎂", slug: "birthday" },
  { id: 5, name: "Baby Shower",   icon: "👶", slug: "baby-shower" },
  { id: 6, name: "Griha Pravesh", icon: "🏠", slug: "griha-pravesh" },
  { id: 7, name: "Graduation",    icon: "🎓", slug: "graduation" },
  { id: 8, name: "Anniversary",   icon: "💑", slug: "anniversary" },
];

const VENDOR_CATS = [
  { icon: Camera,    label: "Photographers",  value: "PHOTOGRAPHER", color: "#C8903A" },
  { icon: Flower2,   label: "Decorators",     value: "DECORATOR",    color: "#C05070" },
  { icon: ChefHat,   label: "Caterers",       value: "CATERER",      color: "#2A7A70" },
  { icon: Music,     label: "DJ & Music",     value: "DJ_MUSIC",     color: "#C8903A" },
  { icon: Palette,   label: "Makeup Artists", value: "MAKEUP",       color: "#C05070" },
  { icon: Building2, label: "Venues",         value: "VENUE",        color: "#2A7A70" },
];

const STATS = [
  { icon: Users,    value: "50,000+", label: "Happy Couples" },
  { icon: Building2,value: "12,000+", label: "Verified Vendors" },
  { icon: MapPin,   value: "80+",     label: "Cities Covered" },
  { icon: Award,    value: "4.8★",    label: "Avg. Rating" },
];

const CATEGORY_EMOJI = {
  PHOTOGRAPHER:   "📸",
  DECORATOR:      "🌸",
  CATERER:        "🍽️",
  VENUE:          "🏛️",
  DJ_MUSIC:       "🎧",
  MAKEUP:         "💄",
  MEHNDI:         "🤲",
};

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Home() {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn:  () => getEvents().then((r) => r.data),
  });

  const { data: featuredData } = useQuery({
    queryKey: ["vendors-featured"],
    queryFn:  () => getVendors({ ordering: "-rating", page_size: 3 }).then((r) => r.data),
  });

  const events   = eventsData?.results || eventsData || FALLBACK_EVENTS;
  const featured = featuredData?.results || featuredData || [];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search)       params.set("q",    search);
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/vendors?${params.toString()}`);
  };

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
          <div className="hero__pattern" />
        </div>

        <div className="container hero__content">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="section-tag">
              <Sparkles size={12} /> AI-Powered Event Planning
            </div>
          </motion.div>

          <motion.h1
            className="hero__heading display-heading"
            initial="hidden" animate="visible"
            variants={fadeUp} custom={1}>
            Plan Your Perfect<br />
            <em className="hero__heading-em">Celebration</em><br />
            <span className="hero__heading-sub">in Minutes</span>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial="hidden" animate="visible"
            variants={fadeUp} custom={2}>
            Discover top-rated vendors by city. Chat with our AI to get personalized
            recommendations for your Shaadi, Birthday, Mehndi & more.
          </motion.p>

          {/* Search */}
          <motion.form
            className="hero__search"
            onSubmit={handleSearch}
            initial="hidden" animate="visible"
            variants={fadeUp} custom={3}>
            <div className="hero__search-inner">
              <div className="hero__search-field">
                <Search size={18} className="hero__search-icon" />
                <input
                  type="text"
                  placeholder="Search vendors, services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="hero__search-input"
                />
              </div>
              <div className="hero__search-divider" />
              <div className="hero__search-field">
                <MapPin size={16} className="hero__search-icon" style={{ color: "var(--rose)" }} />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="hero__search-input hero__city-select">
                  <option value="">All Cities</option>
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="hero__search-btn btn-primary">
                Search
              </button>
            </div>
            <div className="hero__search-hints">
              <span>Popular:</span>
              {["Wedding Photographer", "Decorator", "Mehndi Artist", "DJ"].map((hint) => (
                <button key={hint} type="button" className="hero__hint"
                  onClick={() => { setSearch(hint); navigate(`/vendors?q=${hint}`); }}>
                  {hint}
                </button>
              ))}
            </div>
          </motion.form>

          {/* CTAs */}
          <motion.div
            className="hero__actions"
            initial="hidden" animate="visible"
            variants={fadeUp} custom={4}>
            <Link to="/plan" className="btn-primary">
              <Sparkles size={15} /> Chat with AI Planner
            </Link>
            <Link to="/vendors" className="btn-outline">
              Browse Vendors <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

        {/* Floating cards */}
        <div className="hero__float-cards">
          <motion.div className="float-card float-card--1"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
            <div className="float-card__avatar">👰</div>
            <div>
              <div className="float-card__name">Priya & Rahul</div>
              <div className="float-card__detail">Booked 8 vendors · Mumbai</div>
            </div>
          </motion.div>

          <motion.div className="float-card float-card--2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}>
            <Star size={14} fill="#C8903A" color="#C8903A" />
            <div>
              <div className="float-card__stat">4.9 / 5.0</div>
              <div className="float-card__detail">Avg. Vendor Rating</div>
            </div>
          </motion.div>

          <motion.div className="float-card float-card--3"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}>
            <div className="float-card__dot" />
            <div>
              <div className="float-card__name">AI Planner</div>
              <div className="float-card__detail">Plans in 2 minutes</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {STATS.map((s, i) => (
              <motion.div key={s.label} className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <div className="stat-card__icon"><s.icon size={20} /></div>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cities ── */}
      <section className="cities section">
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <div className="section-tag"><MapPin size={12} /> Top Cities</div>
            <h2 className="display-heading section-heading">
              Find Vendors<br /><em>Near You</em>
            </h2>
          </motion.div>
          <div className="cities__grid">
            {CITIES.map((c, i) => (
              <motion.div key={c.name} className="city-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/vendors?city=${c.name}`)}>
                <div className="city-card__emoji">{c.emoji}</div>
                <div className="city-card__name">{c.name}</div>
                <ArrowRight size={13} className="city-card__arrow" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Event Types ── */}
      <section className="events section section--alt">
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <div className="section-tag"><Heart size={12} /> All Celebrations</div>
            <h2 className="display-heading section-heading">
              Every Occasion,<br /><em>One Platform</em>
            </h2>
            <p className="section-subtitle">
              From intimate mehndi nights to grand wedding receptions — we cover every function.
            </p>
          </motion.div>
          <div className="events__grid">
            {events.slice(0, 8).map((ev, i) => (
              <motion.div key={ev.id || ev.name} className="event-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/vendors?event=${ev.name}`)}>
                <div className="event-card__emoji">{ev.icon}</div>
                <div className="event-card__label">{ev.name}</div>
                <ArrowRight size={14} className="event-card__arrow" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendor Categories ── */}
      <section className="categories section">
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <div className="section-tag"><TrendingUp size={12} /> Categories</div>
            <h2 className="display-heading section-heading">
              Find the Best<br /><em>Professionals</em>
            </h2>
          </motion.div>
          <div className="categories__grid">
            {VENDOR_CATS.map((cat, i) => (
              <motion.div key={cat.value} className="cat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                style={{ "--cat-color": cat.color }}
                onClick={() => navigate(`/vendors?category=${cat.value}`)}>
                <div className="cat-card__icon"><cat.icon size={22} /></div>
                <div className="cat-card__label">{cat.label}</div>
                <ArrowRight size={13} className="cat-card__arrow" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Vendors ── */}
      {featured.length > 0 && (
        <section className="featured section section--alt">
          <div className="container">
            <motion.div className="section-header section-header--row"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <div>
                <div className="section-tag"><Award size={12} /> Featured</div>
                <h2 className="display-heading section-heading">
                  Top Vendors <em>This Week</em>
                </h2>
              </div>
              <Link to="/vendors" className="btn-outline">
                View All <ArrowRight size={14} />
              </Link>
            </motion.div>
            <div className="featured__grid">
              {featured.map((v, i) => (
                <motion.div key={v.id} className="vendor-card"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/vendors/${v.id}`)}>
                  <div className="vendor-card__image">
                    {v.cover_image_url
                      ? <img src={v.cover_image_url} alt={v.business_name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span className="vendor-card__emoji">
                          {CATEGORY_EMOJI[v.category] || "🎪"}
                        </span>}
                    {v.is_verified && (
                      <span className="vendor-card__tag vendor-card__tag--gold">✓ Verified</span>
                    )}
                  </div>
                  <div className="vendor-card__body">
                    <div className="vendor-card__meta">
                      <span className="vendor-card__category">
                        {v.category?.replace("_", " ")}
                      </span>
                      <span className="vendor-card__city">
                        <MapPin size={11} /> {v.city}
                      </span>
                    </div>
                    <h3 className="vendor-card__name">{v.business_name}</h3>
                    <div className="vendor-card__footer">
                      <div className="vendor-card__rating">
                        <Star size={13} fill="#C8903A" color="#C8903A" />
                        <strong>{v.rating || "New"}</strong>
                        <span>({v.total_reviews})</span>
                      </div>
                      <div className="vendor-card__price">
                        from ₹{Number(v.starting_price).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AI CTA ── */}
      <section className="ai-cta section">
        <div className="container">
          <motion.div className="ai-cta__card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}>
            <div className="ai-cta__orb ai-cta__orb--1" />
            <div className="ai-cta__orb ai-cta__orb--2" />
            <div className="ai-cta__content">
              <div className="ai-cta__icon"><Sparkles size={28} /></div>
              <div className="section-tag" style={{ justifyContent: "center" }}>
                Powered by Claude AI
              </div>
              <h2 className="display-heading ai-cta__heading">
                Not sure where to start?<br />
                <em>Let AI plan it for you</em>
              </h2>
              <p className="ai-cta__subtitle">
                Tell our AI chatbot your event type, city, budget and guest count.
                Get instant vendor recommendations, checklists & timelines — free.
              </p>
              <div className="ai-cta__chat-preview">
                <div className="chat-bubble chat-bubble--user">
                  "Planning a 200-person wedding in Jaipur under ₹15 lakhs 🙏"
                </div>
                <div className="chat-bubble chat-bubble--ai">
                  <span className="chat-bubble__dot" />
                  <span className="chat-bubble__dot" style={{ animationDelay: "0.2s" }} />
                  <span className="chat-bubble__dot" style={{ animationDelay: "0.4s" }} />
                  <span>I found 12 vendors within your budget in Jaipur! Here's your plan...</span>
                </div>
              </div>
              <Link to="/plan" className="btn-primary ai-cta__btn">
                <Sparkles size={16} /> Start Planning with AI
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}