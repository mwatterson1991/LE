import React, { useState, useEffect, useRef, useMemo } from 'react'
import posthog from 'posthog-js'
import Marquee from 'react-fast-marquee'
import { motion } from 'motion/react'
import { COURSE_COHORTS } from './courseData'
import { PLEDGE_TOTAL } from '../pledgeData'
import { BorderBeam } from 'border-beam'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import './home-rebrand.css'
import './leland-ai.css'

const CTA_URL = 'https://joinleland.typeform.com/to/nXD9kytE'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const SOCIAL_PROOF = [
  { type: 'logo', name: 'google', alt: 'Google', h: 32 },
  { type: 'logo', name: 'JPMorganChase', alt: 'JP Morgan Chase', h: 26 },
  { type: 'logo', name: 'bain', alt: 'Bain', h: 26 },
  { type: 'logo', name: 'qhp-capital', alt: 'QHP Capital', h: 38 },
  { type: 'logo', name: 'gsv-ventures', alt: 'GSV', h: 38 },
  { type: 'logo', name: 'Partners_Group_Logo_2024', alt: 'Partners Group', h: 34 },
  { type: 'logo', name: 'runpod', alt: 'RunPod', h: 32 },
]

const PHOTO_CARDS = [
  {
    title: 'Upskill your people',
    description: 'Teach your team to build with AI: agents and workflows, not just chatbot prompts.',
    to: '/program',
    video: 'Animated Gradient - 06.mp4',
    cohortBadge: true,
    logo: 'aibp-stacked-light.png',
    ctas: [
      { label: 'For individuals', to: '/program', primary: true },
      { label: 'For teams', to: '/program-for-teams' },
    ],
  },
  {
    title: 'Deploy custom AI workflows',
    description: 'Leland scopes, builds, and deploys AI systems and workflows tailored to your business needs.',
    to: '/services',
    img: 'homepage-cards/deploy-agentic-workflows.png',
  },
  {
    title: 'Recruit AI-native talent',
    description: 'Proven AI-native operators for your team, sourced and vetted on real builds.',
    to: '/recruit',
    img: 'homepage-cards/ai-native-talent.png',
  },
]

function NextCohortBadge() {
  const now = new Date()
  const l1 = COURSE_COHORTS[1] || []
  const next = l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso) && new Date(c.iso + 'T15:00:00Z') >= now)
    || l1.find(c => c.enrollUrl && !c.soldOut && /^\d{4}-\d{2}-\d{2}$/.test(c.iso))
  if (!next) return null
  const target = new Date(next.iso + 'T15:00:00Z')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const month = months[target.getUTCMonth()].toUpperCase()
  const day = target.getUTCDate()
  const display = `${fullMonths[target.getUTCMonth()]} ${day}`

  return (
    <div className="cd-link lai-cohort-badge">
      <div className="cd-cal">
        <span className="cd-cal-month">{month}</span>
        <span className="cd-cal-day">{day}</span>
      </div>
      <div className="cd-info">
        <span className="cd-info-title">Next cohort</span>
        <span className="cd-info-date">Starts {display}</span>
      </div>
    </div>
  )
}

function ImageRevealSection() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh
      const end = 0
      const raw = 1 - (rect.top - end) / (start - end)
      setProgress(Math.min(1, Math.max(0, raw)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2

  const containerScale = 0.8 + eased * 0.2

  return (
    <section className="img-reveal-section" ref={sectionRef}>
      <div
        className="img-reveal-container"
        style={{ transform: `scale(${containerScale})`, background: '#5E6E79' }}
      >
        <div className="img-reveal-content lai-reveal-content">
          <h2 className="img-reveal-heading">75% of executives rank AI as a top-three strategic priority.</h2>
          <p className="img-reveal-source">Source: BCG AI Radar, 2025 (survey of 1,803 executives)</p>
          <p className="img-reveal-desc">
            What stops most teams isn't willingness, it's structure: where to start, how to drive adoption, what infrastructure you need, and how to do it securely. We've cleared those blockers for 250+ teams, and we can do it for yours.
          </p>
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lai-cta-yellow img-reveal-cta"
            onClick={() => posthog.capture('lai--cta_click', { source: 'image-reveal' })}
          >
            Talk to our team
          </a>
        </div>
      </div>
    </section>
  )
}

function PledgeChart() {
  const W = 460, H = 240
  const pad = { t: 26, r: 16, b: 40, l: 24 }
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b
  const k = 5, N = 120

  const { line, area, earlyLine, earlyArea } = useMemo(() => {
    const pts = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const x = pad.l + t * gW
      const y = pad.t + gH - gH * (Math.exp(k * t) - 1) / (Math.exp(k) - 1)
      pts.push([x, y])
    }
    const toPath = arr => arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('')
    const baseline = pad.t + gH
    const line = toPath(pts)
    const area = line + 'L' + (pad.l + gW).toFixed(1) + ',' + baseline + 'L' + pad.l + ',' + baseline + 'Z'
    const early = pts.filter(p => p[0] <= pad.l + gW * 0.1)
    const earlyLine = toPath(early)
    const last = early[early.length - 1]
    const earlyArea = earlyLine + 'L' + last[0].toFixed(1) + ',' + baseline + 'L' + pad.l + ',' + baseline + 'Z'
    return { line, area, earlyLine, earlyArea }
  }, [])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="lai-pledge-svg" aria-label="Exponential growth toward 100 million people trained">
      <line x1="24" y1="200" x2="444" y2="200" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <line x1="24" y1="152" x2="444" y2="152" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="24" y1="104" x2="444" y2="104" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="24" y1="56" x2="444" y2="56" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="24" y1="26" x2="444" y2="26" stroke="rgba(255,214,103,0.3)" strokeWidth="1" strokeDasharray="4 6" />
      <text x="440" y="20" textAnchor="end" fill="rgba(255,214,103,0.7)" fontSize="11" fontFamily="Macan, sans-serif" fontWeight="500">100M people</text>
      <path d={area} fill="rgba(255,255,255,0.05)" />
      <path d={earlyArea} fill="rgba(255,214,103,0.16)" />
      <path d={line} stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
      <path d={earlyLine} stroke="#FFD667" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function AgentDiagram() {
  const center = { x: 92, y: 150 }
  const agents = [
    { x: 300, y: 46, label: 'Sales' },
    { x: 376, y: 112, label: 'Ops' },
    { x: 392, y: 196, label: 'Finance' },
    { x: 330, y: 256, label: 'Support' },
    { x: 240, y: 256, label: 'Research' },
  ]
  return (
    <svg viewBox="0 0 440 300" className="lai-agent-diagram" aria-label="Leland orchestrating a team of AI agents">
      <defs>
        <radialGradient id="lai-agent-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(128,172,237,0.35)" />
          <stop offset="100%" stopColor="rgba(128,172,237,0)" />
        </radialGradient>
      </defs>
      {agents.map((a, i) => (
        <line key={`l-${i}`} x1={center.x} y1={center.y} x2={a.x} y2={a.y} className="lai-agent-line" />
      ))}
      <circle cx={center.x} cy={center.y} r="64" fill="url(#lai-agent-glow)" />
      {agents.map((a, i) => (
        <g key={`n-${i}`}>
          <circle cx={a.x} cy={a.y} r="28" className="lai-agent-node" />
          <text x={a.x} y={a.y + 4} textAnchor="middle" className="lai-agent-node-label">{a.label}</text>
        </g>
      ))}
      <circle cx={center.x} cy={center.y} r="42" className="lai-agent-center" />
      <text x={center.x} y={center.y + 5} textAnchor="middle" className="lai-agent-center-label">Leland</text>
    </svg>
  )
}

export default function LelandAIPage() {
  useEffect(() => {
    document.title = 'Leland for Organizations'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  return (
    <>
      <Nav variant="transparent" />

      {/* ====== Hero ====== */}
      <section className="hero lai-hero" id="hero">
        <div
          className="lai-hero-bg"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/hero-images/office-placeholder-3.jpg)` }}
        />
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lai-hero-content">
            <h1>Make your organization AI-native</h1>
            <p className="hero-sub">Bring your team and processes into the modern AI era.</p>
            <div className="lai-hero-ctas">
              <a
                href={CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lai-cta-yellow"
                onClick={() => posthog.capture('lai--cta_click', { source: 'hero' })}
              >
                <span className="nav-cta-full">Talk to our team</span>
                <span className="nav-cta-short">Talk to us</span>
              </a>
              <BorderBeam size="sm" colorVariant="colorful" theme="dark" strength={1} borderRadius={999}>
                <a href="/program" className="lai-cta-primary lai-cta-beam">
                  AI Builder Program
                </a>
              </BorderBeam>
            </div>
          </motion.div>
        </div>
        <div className="lai-hero-ticker">
          <div className="logo-ticker logo-ticker-cards">
            <span className="logo-ticker-label">Trusted by teams at</span>
            <Marquee gradient={false} speed={35}>
              {[...Array(2)].flatMap((_, round) =>
                SOCIAL_PROOF.map(({ name, alt, h }) => (
                  <img
                    key={`${alt}-${round}`}
                    src={`${import.meta.env.BASE_URL}assets/logos/${name}.svg`}
                    alt={alt}
                    style={{ height: h }}
                    className="logo-ticker-img"
                  />
                ))
              )}
            </Marquee>
          </div>
        </div>
      </section>

      {/* ====== Offerings ====== */}
      <section className="lai-photo-cards-section">
        <div className="lai-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="lai-section-title">Transform your business with end-to-end AI solutions</h2>
            <p className="lai-section-sub">Leland uplevels both your workforce and your workflows.</p>
          </motion.div>
          <div className="cards-grid">
            {PHOTO_CARDS.map((card) => {
              const inner = (
                <>
                  {card.video ? (
                    <video
                      className="photo-card-bg photo-card-video"
                      src={`${import.meta.env.BASE_URL}assets/images/${card.video}`}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <div
                      className="photo-card-bg"
                      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/${card.img})` }}
                    />
                  )}
                  <div className="photo-card-scrim" />
                  {card.cohortBadge && <NextCohortBadge />}
                  <div className="photo-card-content">
                    {card.logo && (
                      <img
                        src={`${import.meta.env.BASE_URL}assets/logos/${card.logo}`}
                        alt=""
                        className="photo-card-logo"
                      />
                    )}
                    <h3 className="photo-card-title">{card.title}</h3>
                    <p className="photo-card-desc">{card.description}</p>
                    {card.ctas ? (
                      <div className="photo-card-ctas">
                        {card.ctas.map((c) => (
                          <a
                            key={c.label}
                            href={c.to}
                            className={`photo-card-btn ${c.primary ? 'photo-card-btn-primary' : 'photo-card-btn-secondary'}`}
                            {...(c.to.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            {c.label}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="photo-card-cta">Learn more</span>
                    )}
                  </div>
                </>
              )

              return card.ctas ? (
                <motion.div
                  className="photo-card"
                  key={card.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  {inner}
                </motion.div>
              ) : (
                <motion.a
                  href={card.to}
                  className="photo-card"
                  key={card.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  {...(card.to.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {inner}
                </motion.a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====== Image Reveal ====== */}
      <ImageRevealSection />

      {/* ====== Feature: AI Builder Program ====== */}
      <section className="lai-feature">
        <div className="lai-container lai-feature-inner">
          <motion.div className="lai-feature-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="lai-feature-label">AI Builder Program</span>
            <h2 className="lai-feature-title">Transform your team into AI builders in 6 to 10 weeks</h2>
            <p className="lai-feature-desc">A live, cohort-based program that turns you and your team into AI builders. New tools, agents, and workflows every week, taught by people who ship with AI every day.</p>
            <div className="lai-feature-ctas">
              <a href="/program" className="lai-feature-btn lai-feature-btn-primary">For individuals</a>
              <a href="/program-for-teams" className="lai-feature-btn lai-feature-btn-secondary">For teams</a>
            </div>
          </motion.div>
          <motion.div className="lai-feature-visual" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="lai-tools-card">
              <video className="lai-tools-card-bg" src={`${import.meta.env.BASE_URL}assets/images/Animated Gradient - 06.mp4`} autoPlay loop muted playsInline />
              <div className="lai-tools-card-overlay">
                <span className="lai-tools-card-label">Tools you'll master &middot; updated weekly</span>
                <div className="lai-tools-row">
                  {['claude-ai', 'cursor-1', 'n8n', 'gemini-ai', 'anthropic', 'google'].map((t) => (
                    <span className="lai-tool-chip" key={t}>
                      <img src={`${import.meta.env.BASE_URL}assets/logos/tools/${t}.png`} alt={t} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== Feature: Deploy agentic workflows ====== */}
      <section className="lai-feature lai-feature-reverse">
        <div className="lai-container lai-feature-inner">
          <motion.div className="lai-feature-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="lai-feature-label">AI Services</span>
            <h2 className="lai-feature-title">Let Leland build and deploy AI inside your organization</h2>
            <p className="lai-feature-desc">We&rsquo;re your velocity bridge to an AI-native operation. Leland scopes, builds, and runs the agentic workflows for you, so you get there faster without rebuilding your team.</p>
            <a href="/services" className="lai-feature-cta">Learn more</a>
          </motion.div>
          <motion.div className="lai-feature-visual" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <AgentDiagram />
          </motion.div>
        </div>
      </section>

      {/* ====== Mission Pledge ====== */}
      <section className="lai-pledge">
        <div className="lai-container">
          <div className="lai-pledge-grid">
            <motion.div className="lai-pledge-left" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <span className="lai-pledge-label">The 100M Pledge</span>
              <h2 className="lai-pledge-title">We&rsquo;re on a mission to train 100 million people to build with AI.</h2>
              <div className="lai-pledge-stat">
                <span className="lai-pledge-number">{PLEDGE_TOTAL.toLocaleString('en-US')}</span>
                <span className="lai-pledge-sub">people trained and counting</span>
              </div>
              <a href="/pledge" className="lai-pledge-cta">See the pledge &rarr;</a>
            </motion.div>
            <motion.div className="lai-pledge-right" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <PledgeChart />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== Feature: Hire AI-native talent ====== */}
      <section className="lai-feature">
        <div className="lai-container lai-feature-inner">
          <motion.div className="lai-feature-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="lai-feature-label">Recruit</span>
            <h2 className="lai-feature-title">Add AI-native talent to your team</h2>
            <p className="lai-feature-desc">Leland has trained thousands of AI-native operators and builders. When you&rsquo;re ready to hire, we match you with people who already ship with AI from day one.</p>
            <a href="/recruit" className="lai-feature-cta">Learn more</a>
          </motion.div>
          <motion.div className="lai-feature-visual" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="lai-roles-card">
              {['Operations Builder', 'GTM Engineer', 'AI-Native Engineer', 'Marketing Builder', 'Finance Builder', 'Product Builder', 'Data & Analytics', 'Customer Support'].map((r) => (
                <span className="lai-role-chip" key={r}>{r}</span>
              ))}
            </div>
          </motion.div>
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
            onClick={() => posthog.capture('lai--cta_click', { source: 'prefooter' })}
          >
            Talk to our team
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
