import React, { useEffect, useRef } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import './home-rebrand.css'
import './leland-ai.css'
import './pledge.css'
import { usePledgeData } from '../pledgeData'

function fmt(n) {
  if (n >= 1000) return Math.round(n / 1000) + 'k'
  return String(n)
}

function PledgeChart({ series }) {
  const W = 840
  const H = 300
  const padL = 6
  const padR = 6
  const padT = 18
  const padB = 30
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const data = series
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
      <svg className="plg-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="People learning AI on Leland over time">
        <defs>
          <linearGradient id="plgArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cream, #F0EBE0)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--cream, #F0EBE0)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} className="plg-chart-grid" />
            <text x={padL + 2} y={y(v) - 6} className="plg-chart-ylabel">{fmt(v)}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#plgArea)" />
        <path d={linePath} className="plg-chart-line" pathLength="1" />
        <circle cx={x(n - 1)} cy={y(maxV)} r="6" className="plg-chart-halo" />
        <circle cx={x(n - 1)} cy={y(maxV)} r="5" className="plg-chart-dot" />
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
  const hasAnimatedRef = useRef(false)
  const displayRef = useRef(0)
  const animatingRef = useRef(false)
  const pledge = usePledgeData()

  useEffect(() => {
    document.title = 'The 100 Million Pledge | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  // Animated count-up. From 0 on first load, then from the current value to the
  // new target whenever live data updates the total.
  useEffect(() => {
    const el = counterRef.current
    if (!el) return

    const target = pledge.total
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      displayRef.current = target
      el.textContent = target.toLocaleString()
      hasAnimatedRef.current = true
      return
    }

    const from = hasAnimatedRef.current ? displayRef.current : 0
    hasAnimatedRef.current = true
    animatingRef.current = true

    const start = performance.now()
    const duration = 2000
    let raf
    function tick(now) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = Math.round(from + (target - from) * eased)
      displayRef.current = v
      el.textContent = v.toLocaleString()
      if (p < 1) raf = requestAnimationFrame(tick)
      else animatingRef.current = false
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      animatingRef.current = false
    }
  }, [pledge.total])

  // Live ticker: while the user is on the page, nudge the count up every 2s so
  // it feels alive. Pauses while the tab is hidden or the count-up is running,
  // and never reduces the number. Ephemeral and client-side; a reload re-reads
  // the real total from the live reach feed.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const id = setInterval(() => {
      if (document.hidden || animatingRef.current) return
      const el = counterRef.current
      if (!el) return
      displayRef.current += 1 + Math.floor(Math.random() * 3) // +1 to +3 every 2s
      el.textContent = displayRef.current.toLocaleString()
    }, 2000)

    return () => clearInterval(id)
  }, [])

  return (
    <>
      <Nav variant="light" />

      <main>
        {/* ===== HERO ===== */}
        <section className="plg-hero" id="counter">
          <div className="plg-section-container">

            <h1>
              Leland will help <em>100 million</em> people learn AI.
            </h1>

            <p className="plg-hero-sub">
              The world is changing quickly. Leland exists to help you change with it. Our pledge is simple: we refuse to let real people be left behind in the AI era.
            </p>

            <div className="plg-counter-card">
              <div className="plg-counter-head">
                <div className="plg-counter-head-label">People learning AI on Leland</div>
                <div className="plg-counter-live">Updated hourly</div>
              </div>
              <div className="plg-counter-row">
                <div className="plg-counter-value" ref={counterRef}>{pledge.total.toLocaleString()}</div>
                {pledge.last30 != null && (
                  <div className="plg-counter-today"><b>+{pledge.last30.toLocaleString()}</b> in the last 30 days</div>
                )}
              </div>

              <PledgeChart series={pledge.series} />
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
              <div className="plg-manifesto-copy">
                <p>AI is rewriting the economy in real time. Entire industries are being restructured. Job descriptions that existed six months ago are disappearing. New ones are being invented every week.</p>
                <p className="plg-dim">People feel it. They feel behind. They feel anxious. They know they need to act, but they don&rsquo;t know where to go.</p>
                <p className="plg-dim">In an AI world, intelligence is abundant. What&rsquo;s scarce is trust. What&rsquo;s scarce is community. What&rsquo;s scarce is the kind of human connection that actually changes outcomes. <a href="https://www.joinleland.com" target="_blank" rel="noopener noreferrer">Leland</a> is built around that reality.</p>
                <p className="plg-dim">So we&rsquo;re making a commitment. One hundred million people, learning AI on Leland.</p>
              </div>
              <div className="plg-manifesto-right">
                <div className="plg-video">
                  <iframe
                    src="https://www.youtube.com/embed/-bUFycZGWQg"
                    title="Leland launch video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="plg-quote-card plg-quote-wide">
                <blockquote>
                  <p>We are in the most urgent and important technological transformation of our lifetime. Experts estimate that in the next 4 years, over <strong>1 billion people</strong> are going to need to be upskilled.</p>
                  <p>Since our founding in 2021, we&rsquo;ve helped millions of people navigate their careers across hundreds of career paths and 100+ countries around the world.</p>
                  <p>We built Leland to unlock human potential. <em>Human potential.</em> And in a world of AI, that mission is more important than ever.</p>
                </blockquote>
                <div className="plg-quote-byline">
                  <img className="plg-quote-avatar plg-quote-avatar-img" src="/assets/john-koelliker.jpg" alt="John Koelliker" width="40" height="40" />
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
            <h2 className="plg-section-title">Several ways to learn AI on Leland.</h2>
            <p className="plg-section-sub">Leland has the largest collection of AI events, courses, and coaches in the world. Start free, go deep, or get 1:1 guidance. Whatever gets you building.</p>

            <div className="plg-ways">
              <div className="plg-way">
                <span className="plg-way-tag">01 &middot; Free</span>
                <div className="plg-way-title">Get involved at an AI event</div>
                <div className="plg-way-desc">Live builds, expert panels, and workshops every week. Free to attend. Bring a laptop, leave with something shipped.</div>
                <div className="plg-way-meta">Next event &middot; 3 days</div>
                <a href="https://www.joinleland.com/career/build-with-ai/events" target="_blank" rel="noopener noreferrer" className="plg-way-cta">See upcoming events</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">02 &middot; Cohort</span>
                <div className="plg-way-title">Join the AI Builder Program</div>
                <div className="plg-way-desc">Our flagship program. Ship real AI products start to finish. Join the alumni community building together long after.</div>
                <div className="plg-way-meta">Next cohort &middot; Opens soon</div>
                <a href="https://ai.joinleland.com" target="_blank" rel="noopener noreferrer" className="plg-way-cta">Apply to AI Builder</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">03 &middot; 1:1</span>
                <div className="plg-way-title">Book an AI coach</div>
                <div className="plg-way-desc">Work directly with a coach who&rsquo;s built in production. Prompt engineering, agent design, team enablement, career pivots.</div>
                <div className="plg-way-meta">Book &middot; From $149</div>
                <a href="https://www.joinleland.com/search/career/build-with-ai" target="_blank" rel="noopener noreferrer" className="plg-way-cta">Browse AI coaches</a>
              </div>
              <div className="plg-way">
                <span className="plg-way-tag">04 &middot; Membership</span>
                <div className="plg-way-title">Access AI content on Leland+</div>
                <div className="plg-way-desc">Self-serve AI content, live discussions, playbooks, and AI-powered career tools. The lowest-friction way in.</div>
                <div className="plg-way-meta">Leland+ &middot; Monthly</div>
                <a href="https://www.joinleland.com/plus" target="_blank" rel="noopener noreferrer" className="plg-way-cta">Join Leland+</a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="plg-final">
          <div className="plg-section-container">
            <h2>This is just <em>the beginning</em>.</h2>
            <p>One hundred million people learning AI on Leland. It starts with you.</p>
            <div className="plg-final-ctas">
              <a href="https://ai.joinleland.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Get started learning</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
