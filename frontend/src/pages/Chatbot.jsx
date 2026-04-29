import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Send, Sparkles, MapPin, Star, ArrowRight,
  RotateCcw, ChevronRight, IndianRupee, Users,
} from "lucide-react";
import useChatStore  from "../store/chatStore.js";
import useAuthStore  from "../store/authStore";
import "./Chatbot.css";

const EVENT_TYPES = [
  { icon: "💍", label: "Shaadi",       desc: "Wedding Ceremony" },
  { icon: "🌿", label: "Mehndi",       desc: "Pre-Wedding" },
  { icon: "💛", label: "Haldi",        desc: "Ritual Ceremony" },
  { icon: "🎂", label: "Birthday",     desc: "Celebrations" },
  { icon: "👶", label: "Baby Shower",  desc: "Godh Bharai" },
  { icon: "🏠", label: "Griha Pravesh",desc: "House Warming" },
  { icon: "🎓", label: "Graduation",   desc: "Farewell Party" },
  { icon: "💑", label: "Anniversary",  desc: "Celebrations" },
];

const CITIES = [
  "Mumbai", "Delhi", "Jaipur", "Udaipur", "Bangalore",
  "Hyderabad", "Chennai", "Pune", "Indore", "Lucknow",
  "Ahmedabad", "Kolkata",
];

const PLAN_COLORS = {
  budget:   { bg: "#EAF3DE", color: "#27500A", border: "#97C459" },
  standard: { bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
  premium:  { bg: "#EEEDFE", color: "#3C3489", border: "#AFA9EC" },
};

function TypingDots() {
  return (
    <div className="typing-indicator">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div key={i} className="typing-indicator__dot"
          style={{ animationDelay: `${delay}s` }} />
      ))}
    </div>
  );
}

function VendorCard({ v, onClick }) {
  return (
    <div className="chat-vendor-card" onClick={onClick}>
      <div className="cvc__emoji">
        {v.category === "PHOTOGRAPHER" ? "📸"
          : v.category === "DECORATOR" ? "🌸"
          : v.category === "CATERER"   ? "🍽️"
          : v.category === "VENUE"     ? "🏛️"
          : "🎪"}
      </div>
      <div className="cvc__body">
        <div className="cvc__name">{v.business_name}</div>
        <div className="cvc__meta">
          <span className="cvc__cat">{v.category?.replace("_", " ")}</span>
          <span className="cvc__city"><MapPin size={10} />{v.city}</span>
        </div>
      </div>
      <div className="cvc__right">
        <div className="cvc__rating">
          <Star size={10} fill="#C8903A" color="#C8903A" />
          {v.rating || "New"}
        </div>
        <div className="cvc__price">
          ₹{Number(v.starting_price).toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, planKey }) {
  const [open, setOpen] = useState(false);
  const col = PLAN_COLORS[planKey];
  return (
    <div className="plan-card" style={{ borderColor: col.border, background: col.bg }}>
      <div className="plan-card__header" onClick={() => setOpen(!open)}>
        <div>
          <div className="plan-card__label" style={{ color: col.color }}>{plan.label}</div>
          <div className="plan-card__total">
            ₹{Number(plan.total).toLocaleString("en-IN")}
          </div>
          <div className="plan-card__desc">{plan.description}</div>
        </div>
        <ChevronRight size={16} style={{
          color: col.color,
          transform: open ? "rotate(90deg)" : "none",
          transition: "transform 0.2s",
          flexShrink: 0,
        }} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="plan-card__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <div className="plan-breakdown">
              {plan.breakdown?.map((item) => (
                <div key={item.category} className="plan-row">
                  <span className="plan-row__cat">{item.category}</span>
                  <span className="plan-row__tip">{item.tip}</span>
                  <span className="plan-row__amt">
                    ₹{Number(item.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
            <div className="plan-checklist">
              <div className="plan-checklist__title">Checklist</div>
              {plan.checklist?.map((item) => (
                <div key={item.task} className="plan-check-item">
                  <span className="plan-check-dot" />
                  <span className="plan-check-task">{item.task}</span>
                  <span className="plan-check-time">{item.timeline}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Chatbot() {
  const navigate   = useNavigate();
  const user       = useAuthStore((s) => s.user);
  const store      = useChatStore();
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.messages, store.loading, store.step]);

  const handleSend = async () => {
    if (!input.trim() || store.loading) return;
    const msg = input.trim();
    setInput("");
    await store.sendMessage(msg);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleStartPlan = async () => {
    if (!store.eventType || !store.city || !store.budget || !store.guestCount) return;
    await store.startSession();
  };

  return (
    <div className="chatbot-page">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header__inner">
          <div className="chatbot-avatar"><Sparkles size={20} /></div>
          <div>
            <div className="chatbot-header__name">PlanMyShaadi AI</div>
            <div className="chatbot-header__status">
              <span className="chatbot-status-dot" />
              Powered by Claude AI
            </div>
          </div>
          <button className="chatbot-reset" onClick={() => store.reset()} title="New chat">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="chatbot-messages">

        {/* Welcome */}
        {store.step === 1 && store.messages.length === 0 && (
          <motion.div className="chatbot-welcome"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="chatbot-welcome__icon"><Sparkles size={28} /></div>
            <h2 className="chatbot-welcome__title">Plan Your Dream Event</h2>
            <p className="chatbot-welcome__sub">
              {user ? `Welcome ${user.full_name}! ` : ""}
              Tell me about your event and I'll generate 3 personalized plans with real vendors.
            </p>
          </motion.div>
        )}

        {/* Step 1 — Event Type */}
        {store.step === 1 && (
          <motion.div className="chat-step"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="chat-step__label">
              <span className="chat-step__num">1</span> What event are you planning?
            </div>
            <div className="event-type-grid">
              {EVENT_TYPES.map((ev) => (
                <div key={ev.label}
                  className={`event-type-card ${store.eventType === ev.label ? "active" : ""}`}
                  onClick={() => { store.setEventType(ev.label); store.setStep(2); }}>
                  <span className="event-type-card__icon">{ev.icon}</span>
                  <span className="event-type-card__label">{ev.label}</span>
                  <span className="event-type-card__desc">{ev.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2 — City */}
        {store.step === 2 && (
          <motion.div className="chat-step"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="chat-step__label">
              <span className="chat-step__num">2</span>
              {store.eventType} {store.eventType === "Shaadi" ? "💍" : "🎉"} — Which city?
            </div>
            <div className="city-grid">
              {CITIES.map((c) => (
                <button key={c}
                  className={`city-chip ${store.city === c ? "active" : ""}`}
                  onClick={() => { store.setCity(c); store.setStep(3); }}>
                  {c}
                </button>
              ))}
            </div>
            <button className="chat-back-btn" onClick={() => store.setStep(1)}>
              ← Change event type
            </button>
          </motion.div>
        )}

        {/* Step 3 — Budget & Guests */}
        {store.step === 3 && (
          <motion.div className="chat-step"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="chat-step__label">
              <span className="chat-step__num">3</span>
              {store.eventType} in {store.city} — Budget & guests
            </div>
            <div className="budget-form">
              <div className="budget-field">
                <label><IndianRupee size={14} /> Total Budget (₹)</label>
                <input type="number" placeholder="e.g. 500000"
                  value={store.budget || ""}
                  onChange={(e) => store.setBudget(e.target.value)}
                  className="budget-input" />
                <div className="budget-hints">
                  {[100000, 500000, 1000000, 2000000].map((b) => (
                    <button key={b} className="budget-hint-chip"
                      onClick={() => store.setBudget(b)}>
                      ₹{(b / 100000).toFixed(0)}L
                    </button>
                  ))}
                </div>
              </div>
              <div className="budget-field">
                <label><Users size={14} /> Number of Guests</label>
                <input type="number" placeholder="e.g. 200"
                  value={store.guestCount || ""}
                  onChange={(e) => store.setGuestCount(e.target.value)}
                  className="budget-input" />
                <div className="budget-hints">
                  {[50, 100, 200, 300, 500].map((g) => (
                    <button key={g} className="budget-hint-chip"
                      onClick={() => store.setGuestCount(g)}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary generate-btn"
                onClick={handleStartPlan}
                disabled={store.loading || !store.budget || !store.guestCount}>
                {store.loading
                  ? <><span className="auth-spinner" /> Generating Plans...</>
                  : <><Sparkles size={16} /> Generate My Plans</>}
              </button>
            </div>
            <button className="chat-back-btn" onClick={() => store.setStep(2)}>
              ← Change city
            </button>
          </motion.div>
        )}

        {/* Chat Messages */}
        {store.messages.map((msg) => (
          <motion.div key={msg.id}
            className={`chat-msg chat-msg--${msg.role}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}>
            {msg.role === "assistant" && (
              <div className="chat-msg__avatar"><Sparkles size={13} /></div>
            )}
            <div className="chat-msg__bubble">
              {/* Text content */}
              {msg.content && (
                <div className="chat-msg__text">{msg.content}</div>
              )}

              {/* Plans */}
              {msg.plans && (
                <div className="chat-plans">
                  <div className="chat-plans__title">
                    🎯 Your 3 Personalized Plans
                  </div>
                  {Object.entries(msg.plans).map(([key, plan]) => (
                    <PlanCard key={key} planKey={key} plan={plan} />
                  ))}
                </div>
              )}

              {/* Vendor Suggestions */}
              {msg.vendors && msg.vendors.length > 0 && (
                <div className="chat-vendors">
                  <div className="chat-vendors__label">
                    🏆 Top vendors in {store.city}
                  </div>
                  {msg.vendors.slice(0, 5).map((v) => (
                    <VendorCard key={v.id} v={v}
                      onClick={() => navigate(`/vendors/${v.id}`)} />
                  ))}
                  <button className="chat-vendors__more btn-outline"
                    onClick={() => navigate(`/vendors?city=${store.city}`)}>
                    View all vendors in {store.city} <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Loading */}
        {store.loading && store.step === 4 && (
          <motion.div className="chat-msg chat-msg--assistant"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="chat-msg__avatar"><Sparkles size={13} /></div>
            <div className="chat-msg__bubble">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {/* Error */}
        {store.error && (
          <motion.div className="chat-error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ⚠️ {store.error}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Follow-up Input — only after plans generated */}
      {store.step === 4 && (
        <div className="chatbot-input-area">
          <div className="chatbot-input-box">
            <textarea ref={inputRef} value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a follow-up question..."
              rows={1} className="chatbot-input" />
            <button className="chatbot-send"
              onClick={handleSend}
              disabled={!input.trim() || store.loading}>
              <Send size={17} />
            </button>
          </div>
          <div className="chatbot-footer-note">
            {user ? "Chat history is saved to your account." : "Login to save your chat history."}
          </div>
        </div>
      )}
    </div>
  );
}