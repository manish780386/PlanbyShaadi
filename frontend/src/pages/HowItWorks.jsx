import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Sparkles, Star, Calendar, CheckCircle,
  ArrowRight, MessageSquare, Shield, IndianRupee,
  Users, Clock, Award, Heart,
} from "lucide-react";
import "./HowItWorks.css";

const STEPS = [
  {
    num:   "01",
    icon:  MapPin,
    color: "gold",
    title: "Choose Your City & Event",
    desc:  "Select your city from 80+ cities across India and pick your event type — Shaadi, Mehndi, Birthday, Baby Shower and more. Our platform shows you the best local vendors instantly.",
    points: [
      "80+ cities covered across India",
      "8 event types supported",
      "Location-based vendor recommendations",
    ],
  },
  {
    num:   "02",
    icon:  Sparkles,
    color: "rose",
    title: "Chat with AI Planner",
    desc:  "Tell our Claude-powered AI your event type, city, budget and guest count. Get 3 personalized plans — Budget, Standard and Premium — with full vendor breakdowns and checklists.",
    points: [
      "Budget, Standard & Premium plans",
      "Vendor category wise breakdown",
      "Timeline & checklist included",
    ],
  },
  {
    num:   "03",
    icon:  Star,
    color: "teal",
    title: "Browse & Compare Vendors",
    desc:  "Explore verified vendor profiles with real portfolio images, packages, reviews and ratings. Filter by city, category, budget and rating. Compare vendors side by side.",
    points: [
      "Verified vendor profiles",
      "Real portfolio images",
      "Detailed packages & pricing",
    ],
  },
  {
    num:   "04",
    icon:  MessageSquare,
    color: "gold",
    title: "Send Booking Request",
    desc:  "Send a booking request directly to the vendor. All communication happens through our platform — your phone number and email are never shared with vendors.",
    points: [
      "Private contact — no number sharing",
      "Real-time chat with vendor",
      "Booking request with event details",
    ],
  },
  {
    num:   "05",
    icon:  IndianRupee,
    color: "rose",
    title: "Pay Securely",
    desc:  "Once the vendor confirms your booking, pay securely through Razorpay. We support UPI, credit/debit cards and net banking. Platform fee is only 5% — one of the lowest in the market.",
    points: [
      "Razorpay secure payments",
      "UPI, cards, net banking",
      "Only 5% platform commission",
    ],
  },
  {
    num:   "06",
    icon:  Heart,
    color: "teal",
    title: "Celebrate & Review",
    desc:  "After your event, leave a verified review for your vendors. Your feedback helps other couples make the right decisions. Only users who completed a booking can leave reviews.",
    points: [
      "Verified reviews only",
      "Helps the community",
      "Rating auto-updated on vendor profile",
    ],
  },
];

const FOR_USERS = [
  { icon: Shield,    title: "Private Contact",     desc: "Your phone number and email are never shared with vendors." },
  { icon: Sparkles,  title: "AI-Powered Planning",  desc: "Get personalized event plans with real vendor suggestions in minutes." },
  { icon: CheckCircle, title: "Verified Vendors",   desc: "All vendors go through a 4-step verification before listing." },
  { icon: IndianRupee, title: "Secure Payments",    desc: "Pay through Razorpay with full refund protection." },
];

const FOR_VENDORS = [
  { icon: Users,    title: "Get More Leads",       desc: "Reach couples actively looking for vendors in your city." },
  { icon: Calendar, title: "Manage Bookings",       desc: "Accept or decline booking requests from your dashboard." },
  { icon: Award,    title: "Build Your Reputation", desc: "Collect verified reviews and grow your rating over time." },
  { icon: Clock,    title: "No Hidden Charges",     desc: "Only pay a 5% commission when a booking is completed." },
];

const FAQS = [
  {
    q: "Is PlanMyShaadi free to use?",
    a: "Yes! Browsing vendors, using the AI planner and comparing options is completely free. We only charge a 5% platform fee when a booking is confirmed and paid.",
  },
  {
    q: "How are vendors verified?",
    a: "All vendors go through our verification process — ID check, portfolio review and quality assessment. Verified vendors get a special badge on their profile.",
  },
  {
    q: "Will the vendor get my phone number?",
    a: "No. All communication happens through our in-app chat. Your phone number and email are never shared with any vendor.",
  },
  {
    q: "How does the AI chatbot work?",
    a: "Our AI planner is powered by Anthropic Claude. You tell it your event type, city, budget and guest count — it generates 3 detailed plans (Budget, Standard, Premium) with real vendor suggestions from our database.",
  },
  {
    q: "Can I book vendors from multiple cities?",
    a: "Yes! You can browse and book vendors from any city. Many premium photographers and decorators also travel to different cities.",
  },
  {
    q: "What if a vendor cancels my booking?",
    a: "If a vendor cancels a confirmed booking, you will receive a full refund within 5-7 business days. You can then rebook with another vendor.",
  },
  {
    q: "How do I register as a vendor?",
    a: "Click 'Register' and select 'Vendor / Business' as your account type. Fill in your business details, add your portfolio images and packages. Our team will verify your profile within 24-48 hours.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed through Razorpay, one of India's most trusted payment gateways. We never store your card details.",
  },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const COLOR_MAP = {
  gold: { bg: "var(--gold-pale)", color: "var(--gold)",  border: "var(--border-strong)" },
  rose: { bg: "var(--rose-pale)", color: "var(--rose)",  border: "rgba(192,80,112,0.25)" },
  teal: { bg: "var(--teal-light)",color: "var(--teal)", border: "rgba(42,122,112,0.25)" },
};

export default function HowItWorks() {
  return (
    <div className="hiw-page">

      {/* ── Hero ── */}
      <section className="hiw-hero">
        <div className="hiw-hero__bg" />
        <div className="container hiw-hero__content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            <div className="section-tag" style={{ justifyContent: "center", display: "inline-flex" }}>
              <Sparkles size={12} /> How It Works
            </div>
          </motion.div>
          <motion.h1
            className="display-heading hiw-hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            Plan Your Dream Event<br />
            <em>in 6 Simple Steps</em>
          </motion.h1>
          <motion.p
            className="hiw-hero__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}>
            From discovering vendors to celebrating your event — PlanMyShaadi
            makes every step effortless, private and secure.
          </motion.p>
          <motion.div
            className="hiw-hero__actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}>
            <Link to="/plan" className="btn-primary">
              <Sparkles size={15} /> Start Planning Free
            </Link>
            <Link to="/vendors" className="btn-outline">
              Browse Vendors <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="hiw-steps section">
        <div className="container">
          <div className="hiw-steps__grid">
            {STEPS.map((step, i) => {
              const col = COLOR_MAP[step.color];
              return (
                <motion.div
                  key={step.num}
                  className="hiw-step-card"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i % 2 === 0 ? i * 0.05 : i * 0.05}>
                  <div className="hiw-step-card__num"
                    style={{ color: col.color }}>
                    {step.num}
                  </div>
                  <div className="hiw-step-card__icon-wrap"
                    style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                    <step.icon size={24} style={{ color: col.color }} />
                  </div>
                  <h3 className="hiw-step-card__title">{step.title}</h3>
                  <p className="hiw-step-card__desc">{step.desc}</p>
                  <ul className="hiw-step-card__points">
                    {step.points.map((p) => (
                      <li key={p}>
                        <CheckCircle size={13} style={{ color: col.color, flexShrink: 0 }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── For Users & Vendors ── */}
      <section className="hiw-benefits section section--alt">
        <div className="container">
          <div className="hiw-benefits__grid">

            {/* For Users */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}>
                <div className="section-tag">
                  <Heart size={12} /> For Couples & Families
                </div>
                <h2 className="display-heading section-heading">
                  Why users<br /><em>love us</em>
                </h2>
              </motion.div>
              <div className="hiw-benefit-list">
                {FOR_USERS.map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="hiw-benefit-item"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}>
                    <div className="hiw-benefit-item__icon"
                      style={{ background: "var(--gold-pale)", color: "var(--gold)" }}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <div className="hiw-benefit-item__title">{item.title}</div>
                      <div className="hiw-benefit-item__desc">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link to="/register" className="btn-primary"
                style={{ marginTop: 28, display: "inline-flex" }}>
                Sign Up Free <ArrowRight size={14} />
              </Link>
            </div>

            {/* For Vendors */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}>
                <div className="section-tag"
                  style={{ background: "var(--teal-light)", color: "var(--teal)",
                           border: "1px solid rgba(42,122,112,0.25)" }}>
                  <Award size={12} /> For Vendors & Businesses
                </div>
                <h2 className="display-heading section-heading">
                  Grow your<br /><em>business</em>
                </h2>
              </motion.div>
              <div className="hiw-benefit-list">
                {FOR_VENDORS.map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="hiw-benefit-item"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}>
                    <div className="hiw-benefit-item__icon"
                      style={{ background: "var(--teal-light)", color: "var(--teal)" }}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <div className="hiw-benefit-item__title">{item.title}</div>
                      <div className="hiw-benefit-item__desc">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link to="/register?role=VENDOR" className="btn-primary"
                style={{ marginTop: 28, display: "inline-flex",
                         background: "var(--teal)" }}>
                List Your Business <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hiw-faq section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <div className="section-tag">
              <MessageSquare size={12} /> FAQ
            </div>
            <h2 className="display-heading section-heading">
              Common <em>Questions</em>
            </h2>
            <p className="section-subtitle">
              Everything you need to know about PlanMyShaadi.
            </p>
          </motion.div>

          <div className="hiw-faq__grid">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                className="hiw-faq-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}>
                <h4 className="hiw-faq-card__q">{faq.q}</h4>
                <p className="hiw-faq-card__a">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hiw-cta section section--alt">
        <div className="container">
          <motion.div
            className="hiw-cta__card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}>
            <div className="hiw-cta__orb hiw-cta__orb--1" />
            <div className="hiw-cta__orb hiw-cta__orb--2" />
            <div className="hiw-cta__content">
              <div className="section-tag"
                style={{ justifyContent: "center", display: "inline-flex" }}>
                <Sparkles size={12} /> Get Started Today
              </div>
              <h2 className="display-heading hiw-cta__title">
                Ready to Plan Your<br /><em>Perfect Celebration?</em>
              </h2>
              <p className="hiw-cta__sub">
                Join 50,000+ couples who have planned their dream events with PlanMyShaadi.
                It's free to get started.
              </p>
              <div className="hiw-cta__actions">
                <Link to="/plan" className="btn-primary">
                  <Sparkles size={15} /> Chat with AI Planner
                </Link>
                <Link to="/vendors" className="btn-outline"
                  style={{ color: "rgba(255,255,255,0.8)",
                           borderColor: "rgba(255,255,255,0.3)" }}>
                  Browse Vendors <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}