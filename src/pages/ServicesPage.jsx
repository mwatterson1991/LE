import React, { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { motion } from 'motion/react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Faq from '../components/Faq'
import './home-rebrand.css'
import './leland-ai.css'

const CTA_URL = 'https://joinleland.typeform.com/to/nXD9kytE'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

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

const STEPS = [
  { num: '01', title: 'Book a strategy call', desc: 'Tell us about your team and goals. We’ll discuss where AI actually fits.' },
  { num: '02', title: 'Get your AI roadmap', desc: 'We assess your people, workflows, and tools, and give you a clear plan.' },
  { num: '03', title: 'Execute with Leland', desc: 'Train your team, deploy agents, hire the talent you need.' },
  { num: '04', title: 'Measure & improve', desc: 'Track what’s working and adjust as your team grows.' },
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
    q: 'How is this different from hiring an AI consultant?',
    a: 'Consultants give you a deck. We train your people, build your systems, and place AI-native operators on your team. You walk away with capabilities, not just recommendations.',
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
      <section className="hero lai-hero lai-hero-plain" id="hero">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lai-hero-content">
            <h1>We build and deploy the AI systems your business needs</h1>
            <p className="hero-sub">From strategy to deployed agents, Leland scopes and builds the agentic workflows and AI-native infrastructure that drive immediate impact.</p>
            <div className="lai-hero-ctas">
              <a
                href={CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lai-cta-yellow"
                onClick={() => posthog.capture('services--cta_click', { source: 'hero' })}
              >
                <span className="nav-cta-full">Book an AI strategy call</span>
                <span className="nav-cta-short">Book a call</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== Use Cases ====== */}
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

      {/* ====== Two paths ====== */}
      <section className="lai-paths">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="lai-section-title">Two ways to build with AI</h2>
            <p className="lai-section-sub">Build the agents yourself, or lean on Leland’s team of builders to accelerate you. Most companies do both.</p>
          </motion.div>
          <div className="lai-paths-grid">
            <motion.div className="lai-path-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="lai-path-tag">Build it yourself</span>
              <h3 className="lai-path-title">Build the agents yourself</h3>
              <p className="lai-path-desc">Your team learns to build real agents and workflows in the AI Builder Program, then keeps shipping long after.</p>
              <a href="/program" className="lai-path-link">Explore the AI Builder Program →</a>
            </motion.div>
            <motion.div className="lai-path-card lai-path-card-dark" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="lai-path-tag">Done with you</span>
              <h3 className="lai-path-title">Lean on Leland’s team of builders</h3>
              <p className="lai-path-desc">Our builders scope, build, and deploy the agents and infrastructure for you, so you see impact in weeks, not quarters.</p>
              <a
                href={CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lai-path-link lai-path-link-yellow"
                onClick={() => posthog.capture('services--cta_click', { source: 'two-paths' })}
              >
                Book a strategy call →
              </a>
            </motion.div>
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
              onClick={() => posthog.capture('services--cta_click', { source: 'how-it-works' })}
            >
              Book an AI strategy call
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
            Book an AI strategy call
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
