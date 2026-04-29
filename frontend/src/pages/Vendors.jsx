import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, MapPin, Star, SlidersHorizontal,
  X, ChevronDown, Loader2,
} from "lucide-react";
import { useVendors } from "../hooks/useVendors.js";
import "./Vendors.css";

const CATEGORIES = [
  { value: "",              label: "All" },
  { value: "PHOTOGRAPHER",  label: "Photographer" },
  { value: "DECORATOR",     label: "Decorator" },
  { value: "CATERER",       label: "Caterer" },
  { value: "VENUE",         label: "Venue" },
  { value: "DJ_MUSIC",      label: "DJ & Music" },
  { value: "MAKEUP",        label: "Makeup Artist" },
  { value: "MEHNDI",        label: "Mehndi Artist" },
  { value: "DHOL_BAND",     label: "Dhol & Band" },
  { value: "TENT_FURNITURE",label: "Tent & Furniture" },
];

const CITIES = [
  "Mumbai", "Delhi", "Jaipur", "Udaipur", "Bangalore",
  "Hyderabad", "Chennai", "Pune", "Indore", "Lucknow",
  "Ahmedabad", "Kolkata",
];

const BUDGET_RANGES = [
  { label: "Any Budget",     min: "",      max: "" },
  { label: "Under ₹10,000", min: "0",     max: "10000" },
  { label: "₹10K – ₹30K",  min: "10000", max: "30000" },
  { label: "₹30K – ₹60K",  min: "30000", max: "60000" },
  { label: "₹60K – ₹1L",   min: "60000", max: "100000" },
  { label: "Above ₹1L",     min: "100000",max: "" },
];

const CATEGORY_EMOJI = {
  PHOTOGRAPHER:   "📸",
  DECORATOR:      "🌸",
  CATERER:        "🍽️",
  VENUE:          "🏛️",
  DJ_MUSIC:       "🎧",
  MAKEUP:         "💄",
  MEHNDI:         "🤲",
  INVITATION:     "💌",
  DHOL_BAND:      "🥁",
  PANDIT:         "🙏",
  TRANSPORT:      "🚗",
  TENT_FURNITURE: "⛺",
};

export default function Vendors() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [search,    setSearch]    = useState(searchParams.get("q")        || "");
  const [category,  setCategory]  = useState(searchParams.get("category") || "");
  const [city,      setCity]      = useState(searchParams.get("city")     || "");
  const [minPrice,  setMinPrice]  = useState("");
  const [maxPrice,  setMaxPrice]  = useState("");
  const [minRating, setMinRating] = useState("");
  const [ordering,  setOrdering]  = useState("-rating");
  const [sideOpen,  setSideOpen]  = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const filters = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(category  && { category }),
    ...(city      && { city }),
    ...(minPrice  && { min_price: minPrice }),
    ...(maxPrice  && { max_price: maxPrice }),
    ...(minRating && { min_rating: minRating }),
    ordering,
  };

  const { data, isLoading, isError } = useVendors(filters);
  const vendors = data?.results || data || [];

  const clearFilters = () => {
    setSearch(""); setCategory(""); setCity("");
    setMinPrice(""); setMaxPrice(""); setMinRating("");
    setOrdering("-rating");
  };

  const setBudgetRange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="vendors-page">
      {/* Header */}
      <div className="vendors-header">
        <div className="container">
          <motion.h1 className="vendors-header__title display-heading"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Find Your Perfect Vendors
            {city && <em> in {city}</em>}
          </motion.h1>
          <motion.p className="vendors-header__sub"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {isLoading ? "Loading..." : `${vendors.length} vendors found`}
          </motion.p>

          {/* Search */}
          <motion.div className="vendors-search"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Search size={16} className="vendors-search__icon" />
            <input type="text" placeholder="Search by name, category, city..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="vendors-search__input" />
            {search && (
              <button onClick={() => setSearch("")} className="vendors-search__clear">
                <X size={14} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="vendors-tabs">
        <div className="container vendors-tabs__inner">
          {CATEGORIES.map((cat) => (
            <button key={cat.value}
              className={`vendors-tab ${category === cat.value ? "active" : ""}`}
              onClick={() => setCategory(cat.value)}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container vendors-body">
        {/* Sidebar */}
        <div className={`vendors-sidebar ${sideOpen ? "open" : ""}`}>

          <div className="filter-group">
            <div className="filter-group__label">City</div>
            <label className="filter-radio">
              <input type="radio" name="city" checked={city === ""}
                onChange={() => setCity("")} />
              <span className="filter-radio__dot" />
              <span className="filter-radio__text">All Cities</span>
            </label>
            {CITIES.map((c) => (
              <label key={c} className="filter-radio">
                <input type="radio" name="city" checked={city === c}
                  onChange={() => setCity(c)} />
                <span className="filter-radio__dot" />
                <span className="filter-radio__text">{c}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <div className="filter-group__label">Budget Range</div>
            {BUDGET_RANGES.map((b) => (
              <label key={b.label} className="filter-radio">
                <input type="radio" name="budget"
                  checked={minPrice === b.min && maxPrice === b.max}
                  onChange={() => setBudgetRange(b.min, b.max)} />
                <span className="filter-radio__dot" />
                <span className="filter-radio__text">{b.label}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <div className="filter-group__label">Minimum Rating</div>
            {["", "4.5", "4", "3.5"].map((r) => (
              <label key={r} className="filter-radio">
                <input type="radio" name="rating" checked={minRating === r}
                  onChange={() => setMinRating(r)} />
                <span className="filter-radio__dot" />
                <span className="filter-radio__text">
                  {r ? `${r}★ & above` : "Any Rating"}
                </span>
              </label>
            ))}
          </div>

          <button className="btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>

        {/* Main */}
        <div className="vendors-main">
          <div className="vendors-toolbar">
            <button className="vendors-filter-btn" onClick={() => setSideOpen(!sideOpen)}>
              <SlidersHorizontal size={15} /> Filters
            </button>
            <div className="vendors-sort">
              <span>Sort by:</span>
              <select value={ordering} onChange={(e) => setOrdering(e.target.value)}
                className="vendors-sort__select">
                <option value="-rating">Top Rated</option>
                <option value="-total_reviews">Most Reviews</option>
                <option value="starting_price">Price: Low to High</option>
                <option value="-starting_price">Price: High to Low</option>
                <option value="-created_at">Newest</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Loader2 size={36} style={{ color: "var(--gold)", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 14 }}>Finding best vendors...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="vendors-empty">
              <div className="vendors-empty__emoji">⚠️</div>
              <div className="vendors-empty__title">Could not load vendors</div>
              <div className="vendors-empty__sub">Please check your connection and try again.</div>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && vendors.length === 0 && (
            <div className="vendors-empty">
              <div className="vendors-empty__emoji">🔍</div>
              <div className="vendors-empty__title">No vendors found</div>
              <div className="vendors-empty__sub">Try adjusting your filters or search term.</div>
              <button className="btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}

          {/* Vendor Grid */}
          {!isLoading && !isError && vendors.length > 0 && (
            <div className="vendors-grid">
              {vendors.map((v, i) => (
                <motion.div key={v.id} className="vendor-list-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/vendors/${v.id}`)}>
                  <div className="vlc__image">
                    {v.cover_image_url
                      ? <img src={v.cover_image_url} alt={v.business_name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 52 }}>{CATEGORY_EMOJI[v.category] || "🎪"}</span>
                    }
                    {v.is_verified && <span className="vlc__tag">✓ Verified</span>}
                  </div>
                  <div className="vlc__body">
                    <div className="vlc__meta">
                      <span className="vlc__cat">{v.category?.replace("_", " ")}</span>
                      <span className="vlc__city">
                        <MapPin size={11} /> {v.city}
                      </span>
                    </div>
                    <h3 className="vlc__name">{v.business_name}</h3>
                    <div className="vlc__footer">
                      <div className="vlc__rating">
                        <Star size={12} fill="#C8903A" color="#C8903A" />
                        <strong>{v.rating || "New"}</strong>
                        <span>({v.total_reviews} reviews)</span>
                      </div>
                      <div className="vlc__price">
                        from ₹{Number(v.starting_price).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}