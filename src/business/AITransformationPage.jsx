import React, { useEffect } from 'react'
import posthog from 'posthog-js'
import { motion, MotionConfig } from 'motion/react'
import { BorderBeam } from 'border-beam'
import Footer from '../components/Footer'
import BusinessNav from './BusinessNav'
import { LogoTicker, WhoItsFor, ForIndividualsBar, Prefooter, Illus } from './sections'
import { BOOK_DEMO_URL, ASSESSMENT_URL } from './siteMap'
import '../pages/home-rebrand.css'
import '../pages/leland-ai.css'
import './business.css'

// business.joinleland.com/ai: the AI Transformation Platform page, and where
// leland.ai will redirect. Structure follows the strategy doc: why companies
// get stuck -> six pillars -> what AI-native means -> services -> who it's for.
// Bracketed copy and dashed boxes are placeholders for content and visuals.

const EASE_OUT = [0.23, 1, 0.32, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const reveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' }, variants: fadeUp }
const revealGroup = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' }, variants: stagger }
const child = { variants: fadeUp }
const img = (p) => `${import.meta.env.BASE_URL}assets/images/${p}`
const track = (source) => () => posthog.capture('biz--cta_click', { page: 'ai', source })

const BLOCKERS = [
  { stuck: 'No one can see where everyone is', answer: 'Assessment and admin dashboard', illus: 'directional-board' },
  { stuck: 'Last year’s training is already stale', answer: 'Content kept current by practitioners', illus: 'hourglass' },
  { stuck: 'A license doesn’t change habits', answer: 'Builds, live sessions, coaching, roadmaps', illus: 'target-goal' },
  { stuck: 'Data, access, and policy lag behind', answer: 'Strategic planning and Leland in your tools', illus: 'success-key' },
  { stuck: 'Generic webinars miss real roles', answer: 'Role- and industry-specific builds', illus: 'project-report' },
]

const PILLARS = [
  {
    label: 'Assess',
    title: 'Know exactly where everyone is',
    desc: 'Self-report plus real usage data from Copilot, Claude, or ChatGPT. Every person gets a personal build roadmap the same day; leadership gets an org-wide readiness map.',
    visual: 'survey',
  },
  {
    label: 'Transform',
    title: 'Change how people work, not just what they know',
    desc: 'An opinionated curriculum from Level 0 to 4, live and async, with role-specific builds and coaching. The AI Builder Program is one program inside it.',
    visual: 'tools',
  },
  {
    label: 'Community builds',
    title: 'See what people in your role have already built',
    desc: 'A library of real builds from CEOs, sales leaders, and practitioners at comparable companies. Every build is submitted, community-validated, or Leland-verified.',
    visual: 'social-connection',
  },
  {
    label: 'In your tools',
    title: 'Leland inside Claude, Copilot, and ChatGPT',
    desc: 'Builds, skills, and tutorials surfaced while people work, then proactive suggestions that feed each person’s roadmap.',
    visual: 'hologram',
  },
  {
    label: 'Admin dashboard',
    title: 'Prove the ROI to leadership',
    desc: 'Readiness by team and level, engagement, builds submitted, cohort progress, and certification. Outcomes, not completions.',
    visual: 'business-growth',
  },
  {
    label: 'Portfolio',
    title: 'A credential your people keep',
    desc: 'Every verified build lands on the person’s Leland portfolio. A certificate says you learned it; a verified build proves you can do it.',
    visual: 'best-employee',
  },
]

function useBodyClass() {
  useEffect(() => {
    document.title = 'AI Transformation Platform | Leland for Business'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home', 'biz-page')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home', 'biz-page')
    }
  }, [])
}

function PillarVisual({ visual }) {
  if (visual === 'tools') {
    return (
      <div className="lai-tools-card">
        <video className="lai-tools-card-bg" src={img('Animated Gradient - 06.mp4')} autoPlay loop muted playsInline />
        <div className="lai-tools-card-overlay">
          <span className="lai-tools-card-label">Tools your team will master &middot; updated weekly</span>
          <div className="lai-tools-row">
            {['claude-ai', 'cursor-1', 'n8n', 'gemini-ai', 'anthropic', 'google'].map((t) => (
              <span className="lai-tool-chip" key={t}>
                <img src={`${import.meta.env.BASE_URL}assets/logos/tools/${t}.png`} alt={t} />
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }
  // Concept illustration now; swap for real product UI screenshots once built.
  return (
    <div className="biz-illus-panel">
      <Illus name={visual} className="biz-illus-xl" />
    </div>
  )
}

export default function AITransformationPage() {
  useBodyClass()

  return (
    <MotionConfig reducedMotion="user">
      <BusinessNav variant="transparent" />

      {/* 1. Hero: the current leland.ai hero, retitled for the platform */}
      <section className="hero lai-hero" id="hero">
        <div className="lai-hero-bg" style={{ backgroundImage: `url(${img('hero-images/office-placeholder-3.jpg')})` }} />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lai-hero-content">
            <span className="biz-hero-eyebrow">AI Transformation Platform</span>
            <h1>Make your organization<br /> AI-native</h1>
            <p className="hero-sub">Assess every employee, train them on real builds, and prove the impact to leadership.</p>
            <div className="lai-hero-ctas">
              <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="lai-cta-yellow" onClick={track('hero')}>Book a demo</a>
              <BorderBeam size="sm" colorVariant="colorful" theme="dark" strength={1} borderRadius={999}>
                <a href={ASSESSMENT_URL} className="lai-cta-primary lai-cta-beam" onClick={track('hero-assessment')}>Take the AI assessment</a>
              </BorderBeam>
            </div>
          </motion.div>
        </div>
        <LogoTicker />
      </section>

      {/* 2. Why companies get stuck -> what answers it */}
      <section className="lai-photo-cards-section">
        <div className="lai-container">
          <motion.div {...reveal}>
            <h2 className="lai-section-title">Buying AI isn’t the same as becoming AI-native</h2>
            <p className="lai-section-sub">Most companies have the tools. Here’s why they stall, and what fixes it.</p>
          </motion.div>
          <motion.div className="biz-blockers" {...revealGroup}>
            {BLOCKERS.map((b) => (
              <motion.div className="biz-card biz-blocker" key={b.stuck} {...child}>
                <Illus name={b.illus} />
                <p className="biz-card-title">{b.stuck}</p>
                <p className="biz-blocker-answer">{b.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. The six pillars, alternating feature rows like today's home */}
      {PILLARS.map((p, i) => (
        <section className={`lai-feature${i % 2 ? ' lai-feature-reverse biz-flip' : ''}`} key={p.label} id={p.label.toLowerCase().replace(/\s+/g, '-')}>
          <div className="lai-container lai-feature-inner">
            <motion.div className="lai-feature-text" {...reveal}>
              <span className="lai-feature-label">{p.label}</span>
              <h2 className="lai-feature-title">{p.title}</h2>
              <p className="lai-feature-desc">{p.desc}</p>
            </motion.div>
            <motion.div className="lai-feature-visual" {...reveal}>
              <PillarVisual visual={p.visual} />
            </motion.div>
          </div>
        </section>
      ))}

      {/* 4. What AI-native means: the nine principles, reuses the orange band */}
      <section className="lai-pledge">
        <div className="lai-container">
          <div className="lai-pledge-grid">
            <motion.div className="lai-pledge-left" {...reveal}>
              <span className="lai-pledge-label">What AI-native means</span>
              <h2 className="lai-pledge-title">Nine operating principles. One standard for people and companies.</h2>
              <a href={ASSESSMENT_URL} className="lai-pledge-cta">Find your level &rarr;</a>
            </motion.div>
            <motion.div className="lai-pledge-right biz-levels" {...reveal}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div className="biz-level" key={n} style={{ height: `${n * 18 + 10}%` }}>
                  <span>L{n}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Services: the slate reveal card, linking to the services page */}
      <section className="img-reveal-section">
        <div className="img-reveal-container" style={{ background: '#5E6E79' }}>
          <div className="img-reveal-content lai-reveal-content">
            <h2 className="img-reveal-heading">Want it built for you? We build it with your team.</h2>
            <p className="img-reveal-desc">
              Strategic planning, private cohorts, custom role-specific builds, coaching, and embedded Heads of AI. Priced on top of the platform and always itemized.
            </p>
            <a href="/services" className="img-reveal-cta">Explore services</a>
          </div>
        </div>
      </section>

      {/* 6. Who it's for */}
      <WhoItsFor />

      {/* 7. Proof: placeholder until case studies exist */}
      <section className="lai-feature biz-tint">
        <div className="lai-container">
          <h2 className="lai-section-title">[Customer results]</h2>
          <p className="lai-section-sub">Case study cards: company, team, what they built, measured outcome.</p>
          <div className="biz-who-grid">
            {[1, 2, 3].map((n) => <div className="biz-visual-placeholder biz-case" key={n}>[Case study {n}]</div>)}
          </div>
        </div>
      </section>

      <Prefooter
        heading="Ready to make your business AI-native?"
        desc="Book a demo and get a custom AI roadmap for your team."
        ctaLabel="Book a demo"
        ctaUrl={BOOK_DEMO_URL}
        onClick={track('prefooter')}
      />
      <ForIndividualsBar />
      <Footer />
    </MotionConfig>
  )
}
