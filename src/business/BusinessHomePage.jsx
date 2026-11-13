import React, { useEffect } from 'react'
import posthog from 'posthog-js'
import Marquee from 'react-fast-marquee'
import { motion, MotionConfig } from 'motion/react'
import { BorderBeam } from 'border-beam'
import { usePledgeData } from '../pledgeData'
import Footer from '../components/Footer'
import BusinessNav from './BusinessNav'
import { LogoTicker, WhoItsFor, ForIndividualsBar, Prefooter, Illus } from './sections'
import { BOOK_DEMO_URL, ASSESSMENT_URL } from './siteMap'
import '../pages/home-rebrand.css'
import '../pages/leland-ai.css'
import './business.css'

// business.joinleland.com homepage (template outline).
// Same section rhythm as today's leland.ai home, restructured so AI
// Transformation is the flagship and Talent / Universities / Advertising each
// get a fork. Bracketed copy is placeholder for the content pass.

// Strong ease-out (Emil's --ease-out); short travel so sections settle rather than fly.
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

const FORKS = [
  {
    label: 'Flagship',
    title: 'AI Transformation',
    description: 'Assess every employee, train them on real builds, and prove the ROI to leadership.',
    to: '/ai',
    video: 'Animated Gradient - 06.mp4',
    featured: true,
  },
  {
    label: 'Talent',
    title: 'Hire and transition',
    description: 'Recruit AI-native operators. Support people in transition with outplacement coaching.',
    to: '/recruit',
    img: 'homepage-cards/ai-native-talent.png',
  },
  {
    label: 'Universities',
    title: 'Student outcomes',
    description: 'Expert coaching for career centers, MBA programs, and undergrad.',
    to: '#todo:/universities',
    img: 'team-conference.jpg',
  },
  {
    label: 'Advertising',
    title: 'Reach ambitious people',
    description: 'Put your brand in front of people actively investing in their careers.',
    to: '#todo:/advertise',
    img: 'woman-video-call-waving.jpg',
  },
]

const PILLARS = [
  { title: 'Assess', illus: 'survey', desc: 'Score every person on how they actually use AI. Each gets a personal roadmap the same day.' },
  { title: 'Transform', illus: 'deep-learning', desc: 'Curriculum from Level 0 to 4, live and async, with role-specific builds and coaching.' },
  { title: 'Community builds', illus: 'social-connection', desc: 'A library of what real practitioners built with AI, by role and industry.' },
  { title: 'In your tools', illus: 'hologram', desc: 'Leland inside Claude, Copilot, and ChatGPT, right where your team works.' },
  { title: 'Admin dashboard', illus: 'business-growth', desc: 'Readiness by team, builds shipped, and outcomes. ROI, not course completions.' },
  { title: 'Portfolio', illus: 'best-employee', desc: 'Every verified build goes on the person’s portfolio. Proof of skill they keep.' },
]

const ROLES = ['Operations Builder', 'GTM Engineer', 'AI-Native Engineer', 'Marketing Builder', 'Finance Builder', 'Product Builder', 'Data & Analytics', 'Customer Support']

const track = (source) => () => posthog.capture('biz--cta_click', { source })

function useBodyClass() {
  useEffect(() => {
    document.title = 'Leland for Business'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home', 'biz-page')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home', 'biz-page')
    }
  }, [])
}

export default function BusinessHomePage() {
  useBodyClass()
  const { total } = usePledgeData()

  return (
    <MotionConfig reducedMotion="user">
      <BusinessNav variant="transparent" />

      {/* 1. Hero: same photo + chrome as leland.ai; broader promise */}
      <section className="hero lai-hero" id="hero">
        <div className="lai-hero-bg" style={{ backgroundImage: `url(${img('hero-images/office-placeholder-3.jpg')})` }} />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lai-hero-content">
            <h1>Build an<br /> AI-native organization</h1>
            <p className="hero-sub">Transform your workforce with AI, hire ambitious talent, and grow with the people who’ve done it.</p>
            <div className="lai-hero-ctas">
              <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="lai-cta-yellow" onClick={track('hero')}>
                Book a demo
              </a>
              <BorderBeam size="sm" colorVariant="colorful" theme="dark" strength={1} borderRadius={999}>
                <a href={ASSESSMENT_URL} className="lai-cta-primary lai-cta-beam" onClick={track('hero-assessment')}>
                  Take the AI assessment
                </a>
              </BorderBeam>
            </div>
          </motion.div>
        </div>
        <LogoTicker />
      </section>

      {/* 2. Forks: was 3 offering cards, now AI flagship + one card per buyer menu */}
      <section className="lai-photo-cards-section">
        <div className="lai-container">
          <motion.div {...reveal}>
            <h2 className="lai-section-title">Everything Leland offers your organization</h2>
            <p className="lai-section-sub">AI transformation first, plus talent, university, and advertising partnerships.</p>
          </motion.div>
          <motion.div className="cards-grid biz-forks-grid" {...revealGroup}>
            {FORKS.map((card) => (
              <motion.a href={card.to} key={card.title} className={`photo-card${card.featured ? ' biz-fork-featured' : ''}`} {...child}>
                {card.video ? (
                  <video className="photo-card-bg photo-card-video" src={img(card.video)} autoPlay loop muted playsInline />
                ) : (
                  <div className="photo-card-bg" style={{ backgroundImage: `url(${img(card.img)})` }} />
                )}
                <div className="photo-card-scrim" />
                <div className="photo-card-content">
                  <span className="biz-fork-label">{card.label}</span>
                  <h3 className="photo-card-title">{card.title}</h3>
                  <p className="photo-card-desc">{card.description}</p>
                  <span className="photo-card-cta">Learn more</span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Problem framing: reuses the slate "reveal" card (static here) */}
      <section className="img-reveal-section">
        <div className="img-reveal-container" style={{ background: '#5E6E79' }}>
          <div className="img-reveal-content lai-reveal-content">
            <h2 className="img-reveal-heading">85% of employees have AI. Only 25% use it regularly.</h2>
            <p className="img-reveal-source">[Source TBD: confirm stat before launch]</p>
            <p className="img-reveal-desc">
              Most companies bought the tools and never saw the ROI, because they treated AI as a software rollout instead of a transformation. Transformation is a people problem. That’s what we solve.
            </p>
            <a href={ASSESSMENT_URL} className="img-reveal-cta" onClick={track('reveal-assessment')}>See where your team stands</a>
          </div>
        </div>
      </section>

      {/* 4. Flagship: the AI Transformation Platform, six pillars */}
      <section className="lai-feature biz-platform">
        <div className="lai-container">
          <motion.div className="lai-feature-text biz-platform-intro" {...reveal}>
            <span className="lai-feature-label">AI Transformation Platform</span>
            <h2 className="lai-feature-title">One platform to make every person AI-native, and prove it</h2>
            <p className="lai-feature-desc">Built on nine AI-native operating principles, each scored 1 to 5 from what people actually do. Content stays current because thousands of practitioners teach on Leland.</p>
            <div className="lai-feature-ctas">
              <a href="/ai" className="lai-feature-btn lai-feature-btn-primary">Explore the platform</a>
            </div>
          </motion.div>
          <motion.div className="biz-pillars" {...revealGroup}>
            {PILLARS.map((p) => (
              <motion.div className="biz-card biz-pillar" key={p.title} {...child}>
                <Illus name={p.illus} />
                <h3 className="biz-card-title">{p.title}</h3>
                <p className="biz-card-desc">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Who it's for (AI fork): tabs now, deep-link pages later */}
      <WhoItsFor />

      {/* 6. Services: same reverse feature as today, now framed as part of AI Transformation */}
      <section className="lai-feature biz-tint">
        <div className="lai-container lai-feature-inner">
          <motion.div className="lai-feature-text" {...reveal}>
            <span className="lai-feature-label">AI Transformation · Services</span>
            <h2 className="lai-feature-title">Want it built for you? We build it with your team.</h2>
            <p className="lai-feature-desc">Strategic planning, private cohorts, custom builds, coaching, or an embedded Head of AI. Itemized on top of the platform, never bundled in.</p>
            <a href="/services" className="lai-feature-cta">Explore services</a>
          </motion.div>
          <motion.div className="lai-feature-visual" {...reveal}>
            <div className="biz-services-visual">
              <Illus name="solution" className="biz-illus-lg" />
              <div className="biz-services-list">
              {['Strategic planning session', 'Private cohort · 4 live sessions', 'Custom role-specific builds', 'Coaching', 'Embedded Head of AI'].map((s) => (
                <span className="lai-role-chip biz-service-chip" key={s}>{s}</span>
              ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. Proof band: keeps the orange pledge band, now as a stat strip */}
      <section className="lai-pledge">
        <div className="lai-container">
          <div className="lai-pledge-grid">
            <motion.div className="lai-pledge-left" {...reveal}>
              <span className="lai-pledge-label">The 100M Pledge</span>
              <h2 className="lai-pledge-title">We’re on a mission to train 100 million people to build with AI.</h2>
              <a href="/pledge" className="lai-pledge-cta">See the pledge &rarr;</a>
            </motion.div>
            <motion.div className="lai-pledge-right biz-stats" {...reveal}>
              <div><span className="lai-pledge-number">{total.toLocaleString('en-US')}</span><span className="lai-pledge-sub">people trained</span></div>
              <div><span className="lai-pledge-number">250+</span><span className="lai-pledge-sub">teams transformed</span></div>
              <div><span className="lai-pledge-number">[N]k</span><span className="lai-pledge-sub">expert practitioners</span></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. Talent fork: reuses the role marquee from today's Recruit row */}
      <section className="lai-feature">
        <div className="lai-container lai-feature-inner">
          <motion.div className="lai-feature-text" {...reveal}>
            <span className="lai-feature-label">Talent</span>
            <h2 className="lai-feature-title">Hire AI-native talent. Support people in transition.</h2>
            <p className="lai-feature-desc">Recruit operators verified on real builds, and give departing employees expert outplacement coaching.</p>
            <div className="biz-inline-links">
              <a href="/recruit" className="lai-feature-cta">Hiring</a>
              <a href="#todo:/outplacement" className="lai-feature-cta">Outplacement</a>
            </div>
          </motion.div>
          <motion.div className="lai-feature-visual" {...reveal}>
            <div className="biz-talent-visual">
              <Illus name="handshake" className="biz-illus-lg" />
              <div className="lai-roles-card">
                <Marquee gradient={false} speed={28} pauseOnHover>
                  {ROLES.map((r) => <span className="lai-role-chip" key={r}>{r}</span>)}
                </Marquee>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. Universities + Advertising forks: compact pair, same card language */}
      <section className="lai-feature biz-tint biz-pair-section">
        <div className="lai-container biz-pair">
          {[
            { label: 'Universities', illus: 'graduation', title: 'Career outcomes for every student', desc: 'Expert coaching and AI readiness for career centers, MBA programs, and undergrad.', to: '#todo:/universities', ai: 'AI-ready graduates' },
            { label: 'Advertising', illus: 'megaphone', title: 'Reach the most ambitious audience online', desc: 'Employers, schools and programs, and test prep and tools reach people investing in what’s next.', to: '#todo:/advertise', ai: 'An audience building AI skills' },
          ].map((c) => (
            <motion.a href={c.to} className="biz-card biz-pair-card" key={c.label} {...reveal}>
              <Illus name={c.illus} className="biz-pair-illus" />
              <span className="lai-feature-label">{c.label}</span>
              <h3 className="lai-feature-title biz-pair-title">{c.title}</h3>
              <p className="lai-feature-desc">{c.desc}</p>
              <span className="biz-ai-row"><span className="biz-ai-tag">AI built in</span>{c.ai}</span>
              <span className="lai-feature-cta">Learn more</span>
            </motion.a>
          ))}
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
