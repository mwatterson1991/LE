import React, { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { motion } from 'motion/react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Faq from '../components/Faq'
import './home-rebrand.css'
import './leland-ai.css'
import './services.css'

const CTA_URL = 'https://joinleland.typeform.com/to/nXD9kytE'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

// Pedigree logos — where our AI Deployment Engineers have built.
// NOTE: confirm/replace with the real list before ship.
const PEDIGREE_LOGOS = [
  { src: '/assets/logos/google.svg', alt: 'Google' },
  { src: '/assets/logos/meta.svg', alt: 'Meta' },
  { src: '/assets/logos/Amazon_logo.svg', alt: 'Amazon' },
  { src: '/assets/logos/OpenAI Logo 1.svg', alt: 'OpenAI' },
  { src: '/assets/logos/Spotify Logo 2024.svg', alt: 'Spotify' },
  { src: '/assets/logos/intiut.svg', alt: 'Intuit' },
]

// Why AI deployment stalls — the three gaps. Infrastructure is the one Services owns.
const STALL_REASONS = [
  {
    tag: 'Tools',
    desc: 'Your team doesn’t have access to the best models, or doesn’t know which to reach for.',
  },
  {
    tag: 'People',
    desc: 'No one is trained to actually build the agents and automations that move the needle.',
  },
  {
    tag: 'Infrastructure for agents',
    desc: 'There’s no connective tissue. No agentic workflows, no AI-native systems tying it all together.',
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
    desc: 'Monthly reporting agents (40 hours to 40 minutes). Invoice, AP/AR, and reconciliation automation. Faster forecasting and close.',
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

const WHY_LELAND = [
  {
    title: 'A network of thousands of AI operators',
    desc: 'We draw from the deepest bench of AI-native builders anywhere, matched to your business and your stack.',
  },
  {
    title: 'Creators of the AI Builder Program',
    desc: 'We train the people building AI inside top companies, so we know exactly what works in the real world.',
  },
  {
    title: 'A team living at the frontier',
    desc: 'We spend every day learning, teaching, and pushing the state of the art, then bring it straight to your business.',
  },
]

const STEPS = [
  { num: '01', title: 'Book a strategy call', desc: 'We learn your team, your goals, and where AI will actually move the needle.' },
  { num: '02', title: 'Get your AI roadmap', desc: 'We audit your people, workflows, and tools, then map the highest-impact builds.' },
  { num: '03', title: 'We build and deploy', desc: 'Our AI Deployment Engineers ship working agents and infrastructure, in weeks.' },
  { num: '04', title: 'Your team takes the wheel', desc: 'We train your people to run and extend everything we build, so it compounds.' },
]

const FAQ_ITEMS = [
  {
    q: 'What size company is Leland AI best for?',
    a: 'Leland works with companies ranging from growth-stage startups to large enterprises. Whether you have a team of 20 or 2,000, we tailor training, builds, and hiring to match your size and maturity.',
  },
  {
    q: 'Do our employees need a technical background?',
    a: 'No. Our programs are designed for managers, operators, marketers, and knowledge workers. No coding experience is required, your team will learn to build real AI systems using no-code and low-code tools.',
  },
  {
    q: 'We already use AI chat tools, do we still need this?',
    a: 'Chat tools are a starting point, not a strategy. Most teams use AI for one-off prompts. We help you move to agentic workflows, automated systems, and real infrastructure that compounds over time.',
  },
  {
    q: 'What does it cost?',
    a: 'Pricing depends on the scope: training cohorts, custom builds, and hiring all have different models. Book a strategy call and we’ll walk through options that fit your budget and goals.',
  },
]

export default function ServicesPage() {
  const [showFunctions, setShowFunctions] = useState(false)

  useEffect(() => {
    document.title = 'AI Services | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  return (
    <>
      <Nav variant="light" />

      {/* ====== Hero ====== */}
      <section className="hero lai-hero lai-hero-plain svc-hero" id="hero">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lai-hero-content">
            <h1>We build and deploy the <span className="svc-hl">AI systems</span> your business needs</h1>
            <p className="hero-sub">From strategy to deployed agents, Leland scopes and builds the agentic workflows and AI-native infrastructure that drive immediate impact.</p>
            <div className="lai-hero-ctas">
              <a
                href={CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lai-cta-yellow"
                onClick={() => posthog.capture('services--cta_click', { source: 'hero' })}
              >
                <span className="nav-cta-full">Talk to our team</span>
                <span className="nav-cta-short">Book a call</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== Pedigree bar ====== */}
      <section className="svc-pedigree">
        <div className="lai-container">
          <p className="svc-pedigree-label">The engineers deploying your AI have built at the best</p>
          <div className="svc-pedigree-logos">
            {PEDIGREE_LOGOS.map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} className="svc-pedigree-logo" loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* ====== Why AI deployment stalls ====== */}
      <section className="svc-stalls">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="svc-section-head">
            <h2 className="lai-section-title">Most AI initiatives stall for three reasons</h2>
            <p className="lai-section-sub">Buying licenses isn’t a strategy. When AI fails to take hold inside a company, it almost always comes down to one of three gaps.</p>
          </motion.div>
          <div className="svc-stalls-grid">
            {STALL_REASONS.map((r, i) => (
              <motion.div
                key={r.tag}
                className={`svc-stall-card ${r.highlight ? 'svc-stall-card--highlight' : ''}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <span className="svc-stall-num">{`0${i + 1}`}</span>
                <h3 className="svc-stall-tag">{r.tag}</h3>
                <p className="svc-stall-desc">{r.desc}</p>
                {r.highlight && <span className="svc-stall-badge">Where Leland Services comes in</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== What it is (solution turn) ====== */}
      <section className="svc-what">
        {/* Background photo. The left-weighted scrim (.svc-what-overlay) keeps the
            left-aligned copy legible while the people on the right stay visible. */}
        <img
          className="svc-what-bg"
          src={`${import.meta.env.BASE_URL}assets/images/services-deployment-bg.jpg`}
          alt=""
        />
        <div className="svc-what-overlay" />
        <div className="lai-container svc-what-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="svc-what-inner">
            <span className="svc-what-eyebrow">Leland AI Services</span>
            <h2 className="svc-what-title">Your AI deployment team, on demand</h2>
            <p className="svc-what-desc">We embed senior AI Deployment Engineers with your team to scope, build, and deploy the agents and infrastructure your business needs. We don’t hand you a strategy deck. We ship working systems, then make sure your team can run them.</p>
          </motion.div>
        </div>
      </section>

      {/* ====== What we build ====== */}
      <section className="lai-use-cases">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="lai-use-cases-eyebrow">What teams build with Leland</span>
            <h2 className="lai-section-title">What AI can do for your business</h2>
            <p className="lai-section-sub">AI strategy stays abstract until you see the work. Here’s what teams build, starting with the universal agents everyone needs.</p>
          </motion.div>

          {/* Universal agents — 3x2 grid, last cell is the "see more" caret */}
          <div className="lai-agents-grid">
            {UNIVERSAL_AGENTS.map((a) => (
              <motion.div key={a.name} className="lai-agent-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h4 className="lai-agent-card-title">{a.name}</h4>
                <p className="lai-agent-card-desc">{a.desc}</p>
              </motion.div>
            ))}
            <motion.button
              type="button"
              className={`lai-agent-more ${showFunctions ? 'is-open' : ''}`}
              onClick={() => setShowFunctions((v) => !v)}
              aria-expanded={showFunctions}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="lai-agent-more-label">
                {showFunctions ? 'Hide function-specific builds' : 'See builds by function'}
              </span>
              <span className="lai-agent-more-sub">Sales, marketing, ops, finance, support, exec</span>
              <span className="lai-agent-more-caret" aria-hidden="true">{showFunctions ? '▲' : '▼'}</span>
            </motion.button>
          </div>

          {/* Function-specific solutions, revealed under the caret */}
          {showFunctions && (
            <motion.div
              className="lai-functions-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {FUNCTION_SOLUTIONS.map((f) => (
                <div key={f.title} className="lai-function-card">
                  <h4 className="lai-function-card-title">{f.title}</h4>
                  <p className="lai-function-card-desc">{f.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ====== Why Leland ====== */}
      <section className="svc-why">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="svc-section-head">
            <h2 className="lai-section-title">Why teams build with Leland</h2>
            <p className="lai-section-sub">Consultants hand you a deck. We hand you working systems and the people who know how to run them.</p>
          </motion.div>
          <div className="svc-why-grid">
            {WHY_LELAND.map((w) => (
              <motion.div key={w.title} className="svc-why-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h3 className="svc-why-card-title">{w.title}</h3>
                <p className="svc-why-card-desc">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== Build + Train work together ====== */}
      <section className="svc-together">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="svc-section-head">
            <h2 className="lai-section-title">A velocity bridge to impact.</h2>
            <p className="lai-section-sub">We deploy agents, workflows, and infrastructure so you move faster now, then train your people to manage and extend it all.</p>
          </motion.div>
          <div className="svc-together-flow">
            <motion.div className="svc-together-card svc-together-card--primary" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="svc-together-step">First, we build</span>
              <h3 className="svc-together-title">Leland builds &amp; deploys</h3>
              <p className="svc-together-desc">Our AI Deployment Engineers scope, build, and ship the agents, workflows, and infrastructure your business needs, in weeks not quarters.</p>
              <a
                href={CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="svc-together-link"
                onClick={() => posthog.capture('services--cta_click', { source: 'together-build' })}
              >
                Book a strategy call →
              </a>
            </motion.div>
            <div className="svc-together-connector" aria-hidden="true">
              <span className="svc-together-then">then</span>
            </div>
            <motion.div className="svc-together-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="svc-together-step">Then, your team owns it</span>
              <h3 className="svc-together-title">Your team takes the wheel</h3>
              <p className="svc-together-desc">We train your people in the AI Builder Program to manage, improve, and keep building on what we’ve shipped, so it keeps paying off long after.</p>
              <a
                href="/program"
                className="svc-together-link"
                onClick={() => posthog.capture('services--cta_click', { source: 'together-train' })}
              >
                Explore the AI Builder Program →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== How It Works ====== */}
      <section className="svc-process">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="svc-section-head">
            <span className="svc-process-eyebrow">How it works</span>
            <h2 className="lai-section-title">From first call to deployed in weeks</h2>
            <p className="lai-section-sub">A fast, clear path from “where does AI fit?” to working systems your team owns.</p>
          </motion.div>
          <div className="svc-process-track">
            {STEPS.map((s) => (
              <motion.div key={s.num} className="svc-process-step" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <span className="svc-process-badge">{s.num}</span>
                <h3 className="svc-process-title">{s.title}</h3>
                <p className="svc-process-desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div className="svc-process-cta" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <a
              href={CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="svc-cta-dark"
              onClick={() => posthog.capture('services--cta_click', { source: 'how-it-works' })}
            >
              Talk to our team
            </a>
          </motion.div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="lai-faq">
        <div className="lai-container">
          <h2 className="lai-section-title">Frequently asked questions</h2>
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ====== Pre-Footer CTA ====== */}
      <section className="prefooter" id="cta">
        <div className="prefooter-inner">
          <div className="prefooter-text">
            <h2 className="prefooter-heading">Ready to make your business AI-native?</h2>
            <p className="prefooter-desc">Book a free strategy call and get a custom AI roadmap for your team.</p>
          </div>
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="prefooter-cta"
            onClick={() => posthog.capture('services--cta_click', { source: 'prefooter' })}
          >
            Talk to our team
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
