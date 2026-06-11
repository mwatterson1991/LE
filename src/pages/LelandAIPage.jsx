import React, { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'motion/react'
import './home-rebrand.css'
import './leland-ai.css'

const CTA_URL = 'https://joinleland.typeform.com/to/nXD9kytE'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const SOCIAL_PROOF = [
  { type: 'logo', name: 'google-white', alt: 'Google', h: 20 },
  { type: 'text', text: 'JP Morgan Chase' },
  { type: 'logo', name: 'bain-white', alt: 'Bain', h: 16 },
  { type: 'text', text: 'QHP Capital' },
  { type: 'text', text: 'GSV' },
  { type: 'text', text: 'Partners Group' },
  { type: 'text', text: 'RunPod' },
]

const OFFERINGS = [
  {
    kicker: 'TRAIN',
    title: 'Upskill your people',
    desc: 'Teach your team to build with AI: agents and workflows, not just chatbot prompts.',
    link: '/program',
    linkLabel: 'Learn more →',
    internal: true,
  },
  {
    kicker: 'BUILD',
    title: 'Deploy agentic workflows & infrastructure',
    desc: 'We scope, build, and run the agentic workflows and AI-native infrastructure inside your business.',
    link: CTA_URL,
    linkLabel: 'Learn more →',
  },
  {
    kicker: 'HIRE',
    title: 'Add AI-native talent',
    desc: 'Bring proven AI-native operators onto your full-time team, sourced and assessed on real builds.',
    link: CTA_URL,
    linkLabel: 'Learn more →',
  },
]

const UNIVERSAL_AGENTS = [
  { name: 'Company brain', desc: 'Answers any question across your tools, docs, and data' },
  { name: 'Chief of staff agent', desc: 'Preps you for meetings, tracks follow-ups, runs your day' },
  { name: 'Inbox & calendar agents', desc: 'Triage email, draft replies, protect focus time' },
  { name: 'Meeting agents', desc: 'Notes, action items, and follow-through automatically' },
  { name: 'Research agents', desc: 'Deep research on any prospect, market, or question in minutes' },
]

const FUNCTION_SOLUTIONS = [
  {
    title: 'Sales & RevOps',
    desc: 'Outbound pipeline-generation agents that prospect, research, and personalize at scale. Lead enrichment, auto-drafted follow-ups, and deal-risk flagging.',
  },
  {
    title: 'Marketing',
    desc: 'Growth marketing agents that run and scale experiments. Funnel optimization, content engines, and competitive monitoring.',
  },
  {
    title: 'Operations',
    desc: 'Analyst agent teams that automate manual workflows. Data bot internal lookups and process automation that removes bottlenecks.',
  },
  {
    title: 'Finance & Accounting',
    desc: 'Monthly reporting agents (40 hours → 40 minutes). Invoice, AP/AR, and reconciliation automation. Faster forecasting and close.',
  },
  {
    title: 'Customer Support',
    desc: 'Ticket triage and drafted responses that deflect volume. Knowledge-base agents that resolve issues instantly.',
  },
  {
    title: 'Exec & Strategy',
    desc: 'Board and investor reporting agents. Cross-functional dashboards that surface what matters.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Leland built and deployed an agent team that automated the work of our analysts, freeing them up for higher-value work.',
    name: 'Partner',
    role: 'Private equity firm',
  },
  {
    quote: "I'm saving around 15 hours a week. My team can execute without coming to me for everything.",
    name: 'VP',
    role: 'Commercial manufacturer',
  },
  {
    quote: 'My team will go from spending 40 hours to 40 minutes on these reports.',
    name: 'Accountant',
    role: 'Growth-stage startup',
  },
]

const STEPS = [
  { num: '01', title: 'Book a strategy call', desc: 'Tell us about your team and goals. We\u2019ll discuss where AI actually fits.' },
  { num: '02', title: 'Get your AI roadmap', desc: 'We assess your people, workflows, and tools, and give you a clear plan.' },
  { num: '03', title: 'Execute with Leland', desc: 'Train your team, deploy agents, hire the talent you need.' },
  { num: '04', title: 'Measure & improve', desc: 'Track what\u2019s working and adjust as your team grows.' },
]

const FAQ_ITEMS = [
  {
    q: 'What size company is Leland AI best for?',
    a: 'Leland works with companies ranging from growth-stage startups to large enterprises. Whether you have a team of 20 or 2,000, we tailor training, builds, and hiring to match your size and maturity.',
  },
  {
    q: 'Do our employees need a technical background?',
    a: 'No. Our programs are designed for managers, operators, marketers, and knowledge workers. No coding experience is required — your team will learn to build real AI systems using no-code and low-code tools.',
  },
  {
    q: 'We already use AI chat tools — do we still need this?',
    a: 'Chat tools are a starting point, not a strategy. Most teams use AI for one-off prompts. We help you move to agentic workflows, automated systems, and real infrastructure that compounds over time.',
  },
  {
    q: 'How is this different from hiring an AI consultant?',
    a: 'Consultants give you a deck. We train your people, build your systems, and place AI-native operators on your team. You walk away with capabilities, not just recommendations.',
  },
  {
    q: 'What does it cost?',
    a: 'Pricing depends on the scope: training cohorts, custom builds, and hiring all have different models. Book a strategy call and we\u2019ll walk through options that fit your budget and goals.',
  },
]

const ChevronIcon = () => (
  <svg className="lai-faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

function FaqItem({ item, open, onToggle }) {
  return (
    <div className={`lai-faq-item${open ? ' open' : ''}`} onClick={onToggle}>
      <div className="lai-faq-q">
        <h3 className="lai-faq-question">{item.q}</h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}>
          <ChevronIcon />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="faq-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="lai-faq-answer">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LelandAIPage() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const navRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const wrapper = nav.closest('.rb-nav-wrapper')
    if (!wrapper) return
    const measure = () => {
      wrapper.style.setProperty('--nav-height', `${nav.offsetHeight}px`)
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <>
      {/* ====== Navigation ====== */}
      <div className={`rb-nav-wrapper${scrolled ? ' rb-nav-scrolled' : ''}`}>
        <nav className="rb-nav lai-nav" ref={navRef} role="navigation">
          <div className="rb-nav-lockup">
            <a href="https://www.joinleland.com" className="rb-nav-logo">
              {scrolled
                ? <img className="rb-logo-dark" src={`${import.meta.env.BASE_URL}assets/logo-dark.svg`} alt="Leland" />
                : <img className="rb-logo-white" src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" />
              }
            </a>
            <span className="rb-nav-lockup-divider" />
            <span className="lai-nav-suffix">AI</span>
          </div>
          <div className="rb-nav-actions">
            <a
              href={CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rb-nav-getstarted"
              onClick={() => posthog.capture('lai--cta_click', { source: 'nav' })}
            >
              Book an AI strategy call
            </a>
          </div>
        </nav>
      </div>

      {/* ====== Hero ====== */}
      <section className="hero lai-hero" id="hero">
        <div className="container">
          <div className="lai-hero-glow" />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lai-hero-content">
            <h1>Make your organization AI-native</h1>
            <p className="hero-sub">Bring your people and processes into the AI era.</p>
            <a
              href={CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lai-cta-primary"
              onClick={() => posthog.capture('lai--cta_click', { source: 'hero' })}
            >
              Book an AI strategy call
            </a>
          </motion.div>
        </div>
      </section>

      {/* ====== Social Proof ====== */}
      <section className="lai-social-proof">
        <div className="lai-container">
          <div className="lai-social-proof-inner">
            <span className="lai-social-proof-label">Trusted by leading organizations</span>
            <div className="lai-social-proof-logos">
              {SOCIAL_PROOF.map((item, i) =>
                item.type === 'logo' ? (
                  <img
                    key={i}
                    src={`${import.meta.env.BASE_URL}assets/logos/${item.name}.svg`}
                    alt={item.alt}
                    style={{ height: item.h }}
                    className="lai-social-proof-logo"
                  />
                ) : (
                  <span key={i} className="lai-social-proof-text">{item.text}</span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====== Offerings ====== */}
      <section className="lai-offerings">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="lai-section-title">An AI-native business needs three things</h2>
            <p className="lai-section-sub">We deliver all three.</p>
          </motion.div>
          <div className="lai-offerings-grid">
            {OFFERINGS.map((o) => (
              <motion.div key={o.title} className="lai-offering-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <span className="lai-offering-kicker">{o.kicker}</span>
                <h3 className="lai-offering-title">{o.title}</h3>
                <p className="lai-offering-desc">{o.desc}</p>
                {o.internal ? (
                  <a href={o.link} className="lai-offering-link">{o.linkLabel}</a>
                ) : (
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="lai-offering-link">{o.linkLabel}</a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Credibility Band ====== */}
      <section className="lai-credibility">
        <div className="lai-container">
          <motion.div className="lai-credibility-inner" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="lai-credibility-quote">
              Most leaders already know becoming AI-native is a top priority. What stops them isn't willingness — it's structure: how to drive adoption, where to start, what infrastructure is needed, how to do it securely.{' '}
              <span className="lai-credibility-highlight">We've cleared those blockers for 250+ teams, and we can do it for yours.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ====== Use Cases ====== */}
      <section className="lai-use-cases">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="lai-section-title">What AI can do for your business</h2>
            <p className="lai-section-sub">&ldquo;AI strategy&rdquo; stays abstract until you see the work. Here's what teams build.</p>
          </motion.div>

          {/* Universal agents band */}
          <motion.div className="lai-universal-band" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 className="lai-universal-band-title">Universal agents everyone needs</h3>
            <div className="lai-universal-list">
              {UNIVERSAL_AGENTS.map((a) => (
                <div key={a.name} className="lai-universal-item">
                  <span className="lai-universal-item-name">{a.name}</span>
                  <span className="lai-universal-item-desc">{a.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Function cards */}
          <div className="lai-functions-grid">
            {FUNCTION_SOLUTIONS.map((f) => (
              <motion.div key={f.title} className="lai-function-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h4 className="lai-function-card-title">{f.title}</h4>
                <p className="lai-function-card-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Callout */}
          <motion.div className="lai-use-cases-callout" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p>
              <strong>Two ways to get there.</strong> Your team can learn to build these in the AI Builder Program, or we can build and deploy them for you. Most companies do both.
            </p>
            <div className="lai-use-cases-callout-links">
              <a href="/program" className="lai-link-secondary">AI Builder Program →</a>
              <a href={CTA_URL} target="_blank" rel="noopener noreferrer" className="lai-cta-primary">Book a strategy call</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== Testimonials ====== */}
      <section className="lai-testimonials">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="lai-section-title">What our clients say</h2>
          </motion.div>
          <div className="lai-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} className="lai-testimonial-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <p className="lai-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="lai-testimonial-author">
                  <span className="lai-testimonial-name">{t.name}</span>
                  <span className="lai-testimonial-role">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== How It Works ====== */}
      <section className="lai-how-it-works">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="lai-section-title">How it works</h2>
          </motion.div>
          <div className="lai-steps-grid">
            {STEPS.map((s) => (
              <motion.div key={s.num} className="lai-step" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <span className="lai-step-number">{s.num}</span>
                <h3 className="lai-step-title">{s.title}</h3>
                <p className="lai-step-desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div className="lai-how-cta" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <a
              href={CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lai-cta-primary"
              onClick={() => posthog.capture('lai--cta_click', { source: 'how-it-works' })}
            >
              Book an AI strategy call
            </a>
          </motion.div>
        </div>
      </section>

      {/* ====== Mission Pledge ====== */}
      <section className="lai-pledge">
        <div className="lai-container">
          <motion.div className="lai-pledge-inner" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="lai-pledge-label">The 100M Pledge</span>
            <h2 className="lai-pledge-title">We're on a mission to train 100 million people to build with AI.</h2>
          </motion.div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="lai-faq">
        <div className="lai-container">
          <h2 className="lai-section-title">Frequently asked questions</h2>
          <div className="lai-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== Final CTA ====== */}
      <section className="lai-final-cta" id="cta">
        <div className="lai-final-cta-glow" />
        <div className="lai-container">
          <motion.div className="lai-final-cta-inner" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="lai-final-cta-title">Ready to make your business AI-native?</h2>
            <p className="lai-final-cta-desc">Book a free strategy call and get a custom AI roadmap for your team.</p>
            <a
              href={CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lai-cta-primary"
              onClick={() => posthog.capture('lai--cta_click', { source: 'final-cta' })}
            >
              Book an AI strategy call
            </a>
          </motion.div>
        </div>
      </section>

      {/* ====== Pre-Footer CTA ====== */}
      <section className="prefooter">
        <div className="prefooter-inner">
          <h2 className="prefooter-heading">Take the next step toward your goals</h2>
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="prefooter-cta"
            onClick={() => posthog.capture('lai--cta_click', { source: 'prefooter' })}
          >
            Book a strategy call
          </a>
        </div>
      </section>

      {/* ====== Footer ====== */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <img src={`${import.meta.env.BASE_URL}assets/logos/New Leland Logo/Icon/Icon-White.svg`} alt="Leland" className="footer-logo" />
            <div className="footer-bottom">
              <div className="footer-social">
                <a href="https://www.linkedin.com/school/joinleland/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href="https://www.instagram.com/joinleland/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
              </div>
              <p className="footer-copyright">Copyright 2026 Leland Inc.<br />All rights reserved.</p>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h4 className="footer-col-heading">Platform</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com" className="footer-col-link">Home</a></li>
                <li><a href="https://www.joinleland.com/events" className="footer-col-link">Free Events</a></li>
                <li><a href="https://www.joinleland.com/bootcamps" className="footer-col-link">Bootcamps</a></li>
                <li><a href="https://www.joinleland.com/plus" className="footer-col-link">Leland+</a></li>
                <li><a href="https://www.joinleland.com/become-an-expert" className="footer-col-link">Become a coach</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-heading">Popular</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/category/mba" className="footer-col-link">MBA</a></li>
                <li><a href="https://www.joinleland.com/ai" className="footer-col-link">AI Productivity</a></li>
                <li><a href="https://www.joinleland.com/category/management-consulting" className="footer-col-link">Management Consulting</a></li>
                <li><a href="https://www.joinleland.com/category/gre" className="footer-col-link">GRE</a></li>
                <li><a href="https://www.joinleland.com/category/private-equity" className="footer-col-link">Private Equity</a></li>
                <li><a href="https://www.joinleland.com/category/product-management" className="footer-col-link">Product Management</a></li>
                <li><a href="https://www.joinleland.com/category/career-development" className="footer-col-link">Career Development</a></li>
                <li><a href="https://www.joinleland.com/category/college" className="footer-col-link">College</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-heading">Partnerships</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/partnerships" className="footer-col-link">Partner with Leland</a></li>
                <li><a href="https://www.joinleland.com/universities" className="footer-col-link">For Universities</a></li>
                <li><a href="https://www.joinleland.com/ai-transformation" className="footer-col-link">AI Transformation</a></li>
                <li><a href="https://www.joinleland.com/outplacement" className="footer-col-link">Outplacement</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-heading">Company</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/reviews" className="footer-col-link">Reviews</a></li>
                <li><a href="https://www.joinleland.com/careers" className="footer-col-link">Careers</a></li>
                <li><a href="https://www.joinleland.com/library" className="footer-col-link">Library</a></li>
              </ul>
              <h4 className="footer-col-heading footer-col-heading-sub">Resources</h4>
              <ul className="footer-col-links">
                <li><a href="https://www.joinleland.com/support" className="footer-col-link">Support</a></li>
                <li><a href="https://www.joinleland.com/legal" className="footer-col-link">Legal</a></li>
                <li><a href="https://www.joinleland.com/privacy" className="footer-col-link">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
