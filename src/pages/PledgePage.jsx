import React, { useEffect, useRef } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import './home-rebrand.css'
import './leland-ai.css'
import './pledge.css'
import { PLEDGE_TOTAL, PLEDGE_TODAY, PLEDGE_SERIES } from '../pledgeData'

const COUNTER_TARGET = PLEDGE_TOTAL

// Real reviews pulled from AI Builder Program graduates (public/data/featured-reviews.json).
const REVIEWS = [
  {
    body: 'This course was incredible. Instructors and TAs were super hands on. Walked away with real skills to help me grow a side business and optimize my day to day work.',
    name: 'Andrew S.',
    meta: 'AI Builder Program graduate',
    initials: 'AS',
  },
  {
    body: 'I went from knowing briefly about what an agent was to building completed automated workflows. This program completely transformed the way I see AI, from a buzzword to something that genuinely enhances my work.',
    name: 'Maclean L.',
    meta: 'AI Builder Program graduate',
    initials: 'ML',
  },
  {
    body: 'During this class I built four additional websites outside of my portfolio along with multiple workflows. It was extremely helpful in becoming an AI power user within my team and company.',
    name: 'Caroline L.',
    meta: 'AI Builder Program graduate',
    initials: 'CL',
  },
  {
    body: "I've used this course to create many skill workflows that I use every day. It's saved me so much time.",
    name: 'Cody B.',
    meta: 'AI Builder Program graduate',
    initials: 'CB',
  },
]

function fmt(n) {
  if (n >= 1000) return Math.round(n / 1000) + 'k'
  return String(n)
}

function PledgeChart() {
  const W = 840
  const H = 300
  const padL = 6
  const padR = 6
  const padT = 18
  const padB = 30
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const data = PLEDGE_SERIES
  const maxV = data[data.length - 1].value
  const n = data.length

  const x = (i) => padL + (i / (n - 1)) * innerW
  const y = (v) => padT + innerH * (1 - v / maxV)

  const linePts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
  const linePath = 'M' + linePts.join(' L')
  const areaPath =
    linePath +
    ` L${x(n - 1).toFixed(1)},${(padT + innerH).toFixed(1)}` +
    ` L${x(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  const gridVals = [0.25, 0.5, 0.75, 1].map((p) => p * maxV)
  // Show a readable subset of month labels.
  const labelIdx = [0, Math.round((n - 1) * 0.33), Math.round((n - 1) * 0.66), n - 1]

  return (
    <div className="plg-chart-wrap">
      <svg className="plg-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Cumulative people learning AI on Leland, growing every month">
        <defs>
          <linearGradient id="plgArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--yellow, #FFD667)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--yellow, #FFD667)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} className="plg-chart-grid" />
            <text x={padL + 2} y={y(v) - 6} className="plg-chart-ylabel">{fmt(v)}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#plgArea)" />
        <path d={linePath} className="plg-chart-line" />
        <circle cx={x(n - 1)} cy={y(maxV)} r="6" className="plg-chart-dot" />
      </svg>
      <div className="plg-chart-xlabels">
        {labelIdx.map((i) => (
          <span key={i} style={{ left: `${(x(i) / W) * 100}%` }}>{data[i].month}</span>
        ))}
      </div>
    </div>
  )
}

export default function PledgePage() {
  const counterRef = useRef(null)

  useEffect(() => {
    document.title = 'The 100 Million Pledge | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  // Animated count-up on load
  useEffect(() => {
    const el = counterRef.current
    if (!el) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      el.textContent = COUNTER_TARGET.toLocaleString()
      return
    }

    const start = performance.now()
    const duration = 2000
    function tick(now) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(COUNTER_TARGET * eased).toLocaleString()
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  return (
    <>
      <Nav variant="light" />

      <main>
        {/* ===== HERO ===== */}
        <section className="plg-hero" id="counter">
          <div className="plg-section-container">

            <h1>
              Leland is committed to helping <em>100 million</em> people learn AI.
            </h1>

            <p className="plg-hero-sub">
              The world is changing quickly. Leland exists to help you change with it. Our pledge is simple: we refuse to let real people be left behind in the AI era.
            </p>

            <div className="plg-counter-card">
              <div className="plg-counter-head">
                <div className="plg-counter-head-label">People learning AI on Leland</div>
                <div className="plg-counter-live">Updated monthly</div>
              </div>
              <div className="plg-counter-row">
                <div className="plg-counter-value" ref={counterRef}>{COUNTER_TARGET.toLocaleString()}</div>
                <div className="plg-counter-today"><b>+{PLEDGE_TODAY.toLocaleString()}</b> today</div>
              </div>

              <PledgeChart />

              <div className="plg-counter-caption">Cumulative people learning AI on Leland, growing every month.</div>
            </div>
          </div>
        </section>

        {/* ===== MANIFESTO ===== */}
        <section className="plg-section plg-bg-cream" id="manifesto">
          <div className="plg-section-container">
            <div className="plg-section-eyebrow">Why we&rsquo;re making this pledge</div>
            <h2 className="plg-section-title">We exist to unlock <em>human</em> potential.</h2>
            <p className="plg-section-sub">The world has already changed. AI is not coming, it&rsquo;s here. We refuse to let real people be left behind.</p>

            <div className="plg-manifesto-grid">
              <div>
                <p>AI is rewriting the economy in real time. Entire industries are being restructured. Job descriptions that existed six months ago are disappearing. New ones are being invented every week.</p>
                <p className="plg-dim">People feel it. They feel behind. They feel anxious. They know they need to act, but they don&rsquo;t know where to go.</p>
                <p className="plg-dim">In an AI world, intelligence is abundant. What&rsquo;s scarce is trust. What&rsquo;s scarce is community. What&rsquo;s scarce is the kind of human connection that actually changes outcomes. Leland is built around that reality.</p>
                <p className="plg-dim">So we&rsquo;re making a commitment. One hundred million people, learning AI on Leland.</p>
              </div>
              <div className="plg-quote-card">
                <blockquote>&ldquo;The world has already changed. AI is not coming, it&rsquo;s here. We refuse to let real people be left behind in the process.&rdquo;</blockquote>
                <div className="plg-quote-byline">
                  <div className="plg-quote-avatar">JK</div>
                  <div className="plg-quote-byline-text">
                    <b>John Koelliker</b>
                    Founder &amp; CEO, Leland
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WAYS TO GET INVOLVED ===== */}
        <section className="plg-section plg-bg-white" id="ways">
          <div className="plg-section-container">
            <div className="plg-section-eyebrow">How to get involved</div>
            <h2 className="plg-section-title">Four ways to learn AI with Leland.</h2>
            <p className="plg-section-sub">Leland has the largest collection of AI events, courses, and coaches in the world. Start free, go deep, or get 1:1 guidance. Whatever gets you building.</p>

            <div className="plg-ways">
              <div className="plg-way">
                <span className="plg-way-tag">01 &middot; Free</span>
                <div className="plg-way-title">Get involved at an AI event</div>
                <div className="plg-way-desc">Live builds, expert panels, and workshops every week. Free to attend. Bring a laptop, leave with something shipped.</div>
                <div className="plg-way-meta">Next event &middot; 3 days</div>
                <a href="https://www.joinleland.com/career/ai-automation-and-agents/events" className="plg-way-cta">See upcoming events</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">02 &middot; Cohort</span>
                <div className="plg-way-title">Join the AI Builder Program</div>
                <div className="plg-way-desc">Our flagship program. Ship real AI products start to finish. Join the alumni community building together long after.</div>
                <div className="plg-way-meta">Next cohort &middot; Opens soon</div>
                <a href="https://ai.joinleland.com" className="plg-way-cta">Apply to AI Builder</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">03 &middot; 1:1</span>
                <div className="plg-way-title">Book an AI coach</div>
                <div className="plg-way-desc">Work directly with a coach who&rsquo;s built in production. Prompt engineering, agent design, team enablement, career pivots.</div>
                <div className="plg-way-meta">Book &middot; From $149</div>
                <a href="https://www.joinleland.com/search/career/ai-automation-and-agents" className="plg-way-cta">Browse AI coaches</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">04 &middot; Membership</span>
                <div className="plg-way-title">Access AI content on Leland+</div>
                <div className="plg-way-desc">Self-serve AI content, live discussions, playbooks, and AI-powered career tools. The lowest-friction way in.</div>
                <div className="plg-way-meta">Leland+ &middot; Monthly</div>
                <a href="https://www.joinleland.com" className="plg-way-cta">Join Leland+</a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SOCIAL PROOF ===== */}
        <section className="plg-section plg-bg-cream" id="proof">
          <div className="plg-section-container">
            <div className="plg-section-eyebrow">What people are saying</div>
            <h2 className="plg-section-title">Real people, <em>real progress</em>.</h2>
            <p className="plg-section-sub">Pulled straight from AI Builder Program graduates.</p>

            <div className="plg-proof">
              {REVIEWS.map((r) => (
                <div className="plg-quote-card plg-bordered" key={r.name}>
                  <div className="plg-quote-body">&ldquo;{r.body}&rdquo;</div>
                  <div className="plg-quote-byline">
                    <div className="plg-quote-avatar">{r.initials}</div>
                    <div className="plg-quote-byline-text"><b>{r.name}</b>{r.meta}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="plg-proof-more">
              <a href="/reviews" className="plg-way-cta">See more reviews</a>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="plg-final">
          <div className="plg-section-container">
            <h2>This is just <em>the beginning</em>.</h2>
            <p>One hundred million people learning AI on Leland. It starts with you.</p>
            <div className="plg-final-ctas">
              <a href="https://ai.joinleland.com" className="btn btn-primary">Get started learning</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
