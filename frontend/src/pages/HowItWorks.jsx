import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, MessageSquare, Star, Calendar, Sparkles, ArrowRight } from 'lucide-react'

const STEPS = [
  { icon: MapPin, num: '01', title: 'Choose Your City', desc: 'Select your event city from 80+ cities across India. Our platform curates the best local vendors based on your location.', color: 'gold' },
  { icon: Sparkles, num: '02', title: 'Chat with AI Planner', desc: 'Tell our Claude-powered AI about your event — type, date, budget, and guest count. Get instant personalized recommendations.', color: 'rose' },
  { icon: Star, num: '03', title: 'Browse & Compare', desc: 'Explore verified vendor profiles with portfolios, reviews, and packages. Compare side-by-side to find your perfect match.', color: 'teal' },
  { icon: Calendar, num: '04', title: 'Book with Confidence', desc: 'Book directly through the platform with secure payments. Track your bookings and manage your entire event in one place.', color: 'gold' },
]

const FAQS = [
  { q: 'Is PlanMyShaadi free to use?', a: 'Yes! Browsing vendors, using the AI planner, and comparing options is completely free. We only charge a small service fee when you confirm a booking.' },
  { q: 'How are vendors verified?', a: 'All vendors go through our 4-step verification process — ID verification, portfolio review, reference checks, and a quality assessment. We only list the best.' },
  { q: 'Can I book vendors from multiple cities?', a: 'Absolutely! You can discover vendors city by city. Many of our premium photographers and decorators also travel to different cities.' },
  { q: 'How does the AI chatbot help?', a: 'Our AI planner (powered by Claude) helps you estimate budgets, create checklists, understand what vendors to book and when, and suggests the best options based on your requirements.' },
]

const colors = { gold: 'var(--gold)', rose: 'var(--rose)', teal: 'var(--teal)' }
const bgs = { gold: 'var(--gold-pale)', rose: 'var(--rose-pale)', teal: 'var(--teal-light)' }

export default function HowItWorks() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      {/* Hero */}
      <section style={{ background: 'var(--deep)', padding: '70px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(200,144,58,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="section-tag" style={{ justifyContent: 'center', display: 'inline-flex' }}>
              <Sparkles size={12} /> How It Works
            </div>
            <h1 className="display-heading" style={{ fontSize: 'clamp(36px, 5vw, 62px)', color: 'white', marginBottom: 16 }}>
              Plan Your Event in<br /><em style={{ color: 'var(--gold-light)' }}>4 Simple Steps</em>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto' }}>
              From discovering vendors to booking your dream team — PlanMyShaadi makes event planning effortless.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px', display: 'flex', gap: 20, alignItems: 'flex-start' }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: bgs[step.color], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <step.icon size={22} color={colors[step.color]} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-light)', fontWeight: 300 }}>{step.num}</div>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 10, fontWeight: 500 }}>{step.title}</h3>
                  <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--alt">
        <div className="container" style={{ maxWidth: 720 }}>
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="section-tag"><MessageSquare size={12} /> FAQ</div>
            <h2 className="display-heading section-heading">Common Questions</h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <h4 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>{faq.q}</h4>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="section-tag" style={{ justifyContent: 'center', display: 'inline-flex' }}><Sparkles size={12} /> Get Started</div>
            <h2 className="display-heading section-heading">Ready to Plan Your Event?</h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>Chat with our AI planner or browse vendors directly.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/plan" className="btn-primary"><Sparkles size={15} /> Chat with AI Planner</Link>
              <Link to="/vendors" className="btn-outline">Browse Vendors <ArrowRight size={14} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}