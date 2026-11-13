import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Head, Avatar, Window, useInView, useCycle, CountUp, EASE_OUT } from '../kit'
import { BUILDS, PEOPLE, LEVELS, TOOLS, LOGOS, asset, buildImg, logoSrc, BOOK_DEMO_URL } from '../data'
import './offerings.css'

const img = (p) => asset(`images/${p}`)
const GRADIENT_VIDEO = img('Animated Gradient - 06.mp4')

const OFFERS = [
  {
    key: 'ai',
    label: 'Flagship',
    title: 'AI Transformation',
    short: 'AI',
    desc: 'Assess every employee, train them on real builds, and prove the ROI to leadership.',
    bullets: ['Readiness score for every person', 'Role-specific builds and live sessions', 'Admin dashboard leadership can read'],
    cta: 'Explore the platform',
    photo: null,
  },
  {
    key: 'talent',
    label: 'Talent',
    title: 'Hire and transition',
    short: 'Talent',
    desc: 'Recruit AI-native operators. Support people in transition with outplacement coaching.',
    bullets: ['Shortlists of verified AI-native operators', 'Portfolios of real builds, not resumes', 'Outplacement coaching with experts'],
    cta: 'Hire with Leland',
    photo: img('homepage-cards/ai-native-talent.png'),
  },
  {
    key: 'uni',
    label: 'Universities',
    title: 'Student outcomes',
    short: 'Universities',
    desc: 'Expert coaching for career centers, MBA programs, and undergrad.',
    bullets: ['1:1 coaching from people who did it', 'AI skills built into career prep', 'Outcomes reporting for your program'],
    cta: 'Partner with us',
    photo: img('team-conference.jpg'),
  },
  {
    key: 'ads',
    label: 'Advertising',
    title: 'Reach ambitious people',
    short: 'Advertising',
    desc: 'Put your brand in front of people actively investing in their careers.',
    bullets: ['Audiences actively changing careers', 'Sponsored events and newsletters', 'Targeting by goal, school and role'],
    cta: 'Advertise with Leland',
    photo: img('woman-video-call-waving.jpg'),
  },
]

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ---------- A. Photo cards ---------- */

function OfferingsA() {
  return (
    <section className="vk-sec vk-bg-white">
      <div className="vk-wrap">
        <Head eyebrow="What we offer" title="One partner for AI, talent, universities and advertising" sub="AI Transformation is where most companies start. The rest of Leland is here when you need it." />
        <div className="vo-a-grid">
          {OFFERS.map((o) => (
            <a key={o.key} href="#" className={`vo-a-card${o.photo ? '' : ' is-featured'}`}>
              {o.photo
                ? <img className="vo-a-media" src={o.photo} alt="" loading="lazy" />
                : <video className="vo-a-media" src={GRADIENT_VIDEO} autoPlay loop muted playsInline />}
              <div className="vo-a-shade" />
              <div className="vo-a-body">
                <span className="vo-a-label">{o.label}</span>
                <h3>{o.title}</h3>
                <p>{o.desc}</p>
                <span className="vo-a-more">Learn more <span aria-hidden="true">→</span></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- B. Bento ---------- */

const BENTO_TEAMS = [
  { name: 'Sales', vals: [0.52, 0.71], level: 3 },
  { name: 'Marketing', vals: [0.4, 0.6], level: 2 },
  { name: 'Finance', vals: [0.3, 0.46], level: 2 },
  { name: 'Support', vals: [0.22, 0.38], level: 1 },
]
const SPARK = [12, 18, 15, 24, 22, 31, 28, 38, 35, 46, 44, 58]
const sparkPath = (pts, w, h) => {
  const max = Math.max(...pts)
  return pts.map((p, i) => `${i ? 'L' : 'M'}${((i / (pts.length - 1)) * w).toFixed(1)},${(h - (p / max) * h * 0.9).toFixed(1)}`).join(' ')
}

function MiniDashboard({ active }) {
  const [period] = useCycle(2, 3200, active)
  const [feedI] = useCycle(4, 2400, active)
  const feed = [BUILDS[0], BUILDS[6], BUILDS[2], BUILDS[9]]
  const b = feed[feedI]
  return (
    <div className="vo-b-dash">
      <div className="vo-b-dash-top">
        <span className="vo-b-dash-title">Readiness by team</span>
        <span className="vo-b-seg">
          <span className={period === 0 ? 'is-on' : ''}>Q2</span>
          <span className={period === 1 ? 'is-on' : ''}>Q3</span>
        </span>
      </div>
      <div className="vo-b-kpis">
        <div><span>People assessed</span><b><CountUp to={1240} start={active} /></b></div>
        <div><span>Builds shipped</span><b><CountUp to={386} start={active} /></b></div>
        <div><span>Hrs saved / wk</span><b><CountUp to={1920} start={active} /></b></div>
      </div>
      <ul className="vo-b-bars">
        {BENTO_TEAMS.map((t, i) => (
          <li key={t.name}>
            <span>{t.name}</span>
            <i><em style={{ transform: `scaleX(${active ? t.vals[period] : 0.02})`, background: LEVELS[t.level].color, transitionDelay: `${i * 60}ms` }} /></i>
          </li>
        ))}
      </ul>
      <div className="vo-b-feed">
        <span className="vk-live-dot" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={b.id} className="vo-b-feed-item" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
            <img src={buildImg(b.id)} alt="" />
            <span><b>{b.author}</b> shipped: {b.title}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function OfferingsB() {
  const [ref, inView] = useInView()
  return (
    <section className="vk-sec vk-bg-tint" ref={ref}>
      <div className="vk-wrap">
        <Head align="center" eyebrow="What we offer" title="AI at the center. Everything around it." sub="Start with AI Transformation. Add hiring, university partnerships or advertising when you need them." />
        <div className={`vo-b-grid${inView ? ' is-in' : ''}`}>
          <a href="#" className="vo-b-tile vo-b-ai">
            <div className="vo-b-copy">
              <span className="vo-b-label vo-b-label-light">Flagship</span>
              <h3>AI Transformation</h3>
              <p>Assess every employee, train them on real builds, and prove the ROI to leadership.</p>
            </div>
            <MiniDashboard active={inView} />
            <div className="vo-b-tools">
              {TOOLS.slice(0, 5).map((t) => <img key={t.name} src={asset(t.src)} alt={t.name} title={t.name} />)}
              <span>Works inside the tools your team already uses</span>
            </div>
          </a>

          <a href="#" className="vo-b-tile vo-b-talent">
            <div className="vo-b-copy">
              <span className="vo-b-label">Talent</span>
              <h3>Hire and transition</h3>
              <p>Recruit AI-native operators. Support people in transition.</p>
            </div>
            <div className="vo-b-cand">
              <Avatar img={PEOPLE[2].img} size={48} />
              <div className="vo-b-cand-main">
                <b>{PEOPLE[2].name}</b>
                <span>{PEOPLE[2].role} · 6 verified builds</span>
                <div className="vo-b-cand-tags">
                  <span className="vk-pill vk-pill-yellow">Level 3 Builder</span>
                  <span className="vk-pill vk-pill-neutral">n8n</span>
                  <span className="vk-pill vk-pill-neutral">Claude Code</span>
                </div>
              </div>
              <span className="vo-b-match">[96%] match</span>
            </div>
          </a>

          <a href="#" className="vo-b-tile vo-b-uni">
            <span className="vo-b-label">Universities</span>
            <div className="vo-b-ring">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="42" className="vo-b-ring-bg" />
                <circle cx="50" cy="50" r="42" className="vo-b-ring-fg" pathLength="100" />
              </svg>
              <b><CountUp to={92} start={inView} suffix="%" /></b>
            </div>
            <p><b>Student outcomes.</b> [Placed within 6 months] after expert coaching.</p>
          </a>

          <a href="#" className="vo-b-tile vo-b-ads">
            <span className="vo-b-label">Advertising</span>
            <div className="vo-b-ad-num"><b><CountUp to={2.4} start={inView} format={(n) => n.toFixed(1)} suffix="M" /></b><span>[impressions / mo]</span></div>
            <svg className="vo-b-spark" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
              <path d={`${sparkPath(SPARK, 200, 60)} L200,60 L0,60 Z`} className="vo-b-spark-fill" />
              <path d={sparkPath(SPARK, 200, 60)} className="vo-b-spark-line" />
            </svg>
            <p><b>Reach ambitious people</b> actively investing in their careers.</p>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ---------- C. Expanding panels ---------- */

function OfferingsC() {
  const [open, setOpen] = useState('ai')
  return (
    <section className="vk-sec vk-bg-white">
      <div className="vk-wrap">
        <div className="vo-c-head">
          <Head eyebrow="What we offer" title="Find your door" />
          <p className="vo-c-hint">Four ways companies work with Leland. Most start with AI.</p>
        </div>
        <div className="vo-c-row">
          {OFFERS.map((o, i) => {
            const isOpen = open === o.key
            return (
              <div
                key={o.key}
                className={`vo-c-panel${isOpen ? ' is-open' : ''}`}
                onMouseEnter={() => setOpen(o.key)}
                onFocus={() => setOpen(o.key)}
                onClick={() => setOpen(o.key)}
              >
                {o.photo
                  ? <img className="vo-c-media" src={o.photo} alt="" loading="lazy" />
                  : <video className="vo-c-media" src={GRADIENT_VIDEO} autoPlay loop muted playsInline />}
                <div className="vo-c-shade" />
                <div className="vo-c-strip" aria-hidden={isOpen}>
                  <span className="vo-c-num">0{i + 1}</span>
                  <span className="vo-c-vert">{o.title}</span>
                </div>
                <div className="vo-c-body" aria-hidden={!isOpen}>
                  <span className="vo-c-label">0{i + 1} · {o.label}</span>
                  <h3>{o.title}</h3>
                  <p>{o.desc}</p>
                  <ul>{o.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                  <a href={o.key === 'ai' ? BOOK_DEMO_URL : '#'} className="vk-btn vk-btn-blue" tabIndex={isOpen ? 0 : -1}>{o.cta}</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- D. Audience tabs ---------- */

function PreviewAI() {
  return (
    <Window url="app.leland.ai/admin">
      <div className="vo-d-pv">
        <div className="vo-d-pv-head"><b>Northwind · AI readiness</b><span className="vk-pill vk-pill-green">[+18%] QoQ</span></div>
        <div className="vo-d-kpis">
          <div><span>People assessed</span><b>1,240</b></div>
          <div><span>Builds shipped</span><b>386</b></div>
          <div><span>Avg. level</span><b>2.1</b></div>
        </div>
        <div className="vo-d-levels">
          {LEVELS.map((l, i) => (
            <div key={l.n} className="vo-d-level">
              <i style={{ height: `${[18, 46, 82, 38, 10][i]}%`, background: l.color }} />
              <span>L{l.n}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  )
}

function PreviewHire() {
  const cands = [PEOPLE[2], PEOPLE[6], PEOPLE[10]]
  return (
    <Window url="app.leland.ai/talent/shortlist">
      <div className="vo-d-pv">
        <div className="vo-d-pv-head"><b>Shortlist · GTM Engineer</b><span className="vk-pill vk-pill-blue">3 new</span></div>
        <ul className="vo-d-cands">
          {cands.map((p, i) => (
            <li key={p.img}>
              <Avatar img={p.img} size={40} />
              <div><b>{p.name}</b><span>{BUILDS[i * 3].title}</span></div>
              <span className="vk-pill vk-pill-yellow">L{3 - (i === 2 ? 1 : 0)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  )
}

function PreviewUni() {
  const rows = [['MBA class of 2026', '412', '[94%]'], ['Undergrad business', '1,080', '[88%]'], ['Career switchers', '236', '[81%]']]
  return (
    <Window url="partners.leland.ai/outcomes">
      <div className="vo-d-pv">
        <div className="vo-d-pv-head"><b>Program outcomes</b><span className="vk-pill vk-pill-neutral">Sample</span></div>
        <table className="vo-d-table">
          <thead><tr><th>Cohort</th><th>Students coached</th><th>Placed</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td><b>{r[2]}</b></td></tr>)}</tbody>
        </table>
      </div>
    </Window>
  )
}

function PreviewAds() {
  return (
    <Window url="ads.leland.ai/campaigns">
      <div className="vo-d-pv">
        <div className="vo-d-pv-head"><b>Campaign · Fall recruiting</b><span className="vk-pill vk-pill-green">Live</span></div>
        <div className="vo-d-kpis">
          <div><span>Impressions</span><b>[2.4M]</b></div>
          <div><span>Click-through</span><b>[3.1%]</b></div>
          <div><span>Sign-ups</span><b>[8,920]</b></div>
        </div>
        <svg className="vo-d-spark" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
          <path d={`${sparkPath(SPARK, 300, 80)} L300,80 L0,80 Z`} className="vo-b-spark-fill" />
          <path d={sparkPath(SPARK, 300, 80)} className="vo-b-spark-line" />
        </svg>
      </div>
    </Window>
  )
}

const AUDIENCES = [
  { tab: 'Company AI', offer: OFFERS[0], Preview: PreviewAI },
  { tab: 'Hiring', offer: OFFERS[1], Preview: PreviewHire },
  { tab: 'University', offer: OFFERS[2], Preview: PreviewUni },
  { tab: 'Advertiser', offer: OFFERS[3], Preview: PreviewAds },
]

// Auto-advances until the visitor picks a tab, then stays put.
function useAudienceTabs(active) {
  const [i, setI] = useState(0)
  const [pinned, setPinned] = useState(false)
  useEffect(() => {
    if (!active || pinned || prefersReducedMotion()) return undefined
    const t = setInterval(() => setI((x) => (x + 1) % AUDIENCES.length), 4200)
    return () => clearInterval(t)
  }, [active, pinned])
  return [i, (n) => { setPinned(true); setI(n) }]
}

function OfferingsD() {
  const [ref, inView] = useInView()
  const [i, select] = useAudienceTabs(inView)
  const a = AUDIENCES[i]
  return (
    <section className="vk-sec vk-bg-wash" ref={ref}>
      <div className="vk-wrap">
        <div className="vo-d-top">
          <h2 className="vk-title">I’m buying for</h2>
          <div className="vo-d-seg" role="tablist">
            {AUDIENCES.map((x, n) => (
              <button key={x.tab} role="tab" aria-selected={n === i} className={n === i ? 'is-on' : ''} onClick={() => select(n)}>
                {n === i ? <motion.span layoutId="vo-d-pill" className="vo-d-pill" transition={{ duration: 0.3, ease: EASE_OUT }} /> : null}
                <span className="vo-d-tab-txt">{x.tab}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="vo-d-grid">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={a.tab} className="vo-d-copy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
              <span className="vk-eyebrow">{a.offer.label}</span>
              <h3>{a.offer.title}</h3>
              <p>{a.offer.desc}</p>
              <ul>{a.offer.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <a href={i === 0 ? BOOK_DEMO_URL : '#'} className="vk-btn vk-btn-dark">{a.offer.cta}</a>
            </motion.div>
          </AnimatePresence>
          <div className="vo-d-preview">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={a.tab} className="vo-d-preview-inner" initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
                <a.Preview />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- E. Orbit ---------- */

const OUTER = [
  { o: OFFERS[1], angle: -30 },
  { o: OFFERS[2], angle: 90 },
  { o: OFFERS[3], angle: 210 },
]
const RING_LOGOS = LOGOS.filter((l) => ['Google', 'Shopify', 'Adobe', 'Salesforce', 'Cisco', 'Figma', 'Etsy', 'Miro'].includes(l.name))

function OfferingsE() {
  return (
    <section className="vk-sec vk-bg-dark vo-e">
      <div className="vk-wrap">
        <Head align="center" dark eyebrow="What we offer" title="Everything orbits AI" sub="AI Transformation is the center of gravity. Talent, universities and advertising run on the same network of experts and learners." />
        <div className="vo-e-stage">
          <div className="vo-e-ring vo-e-ring-3" />
          <div className="vo-e-ring vo-e-ring-2" />
          <div className="vo-e-ring vo-e-ring-1" />

          {/* Customer logos ride the outermost ring very slowly. */}
          <div className="vo-e-spin vo-e-spin-logos">
            {RING_LOGOS.map((l, i) => (
              <div key={l.name} className="vo-e-slot" style={{ '--a': `${(360 / RING_LOGOS.length) * i + 22}deg`, '--r': 'var(--r3)' }}>
                <div className="vo-e-counter vo-e-counter-logos">
                  <span className="vo-e-logo"><img src={logoSrc(l)} alt={l.name} /></span>
                </div>
              </div>
            ))}
          </div>

          <div className="vo-e-spin vo-e-spin-outer">
            {OUTER.map(({ o, angle }) => (
              <div key={o.key} className="vo-e-slot" style={{ '--a': `${angle}deg`, '--r': 'var(--r2)' }}>
                <div className="vo-e-counter vo-e-counter-outer">
                  <a href="#" className="vo-e-card">
                    <img src={o.photo} alt="" loading="lazy" />
                    <div><span>{o.label}</span><b>{o.title}</b><em>{o.label}</em></div>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="vo-e-spin vo-e-spin-inner">
            {TOOLS.slice(0, 4).map((t, i) => (
              <div key={t.name} className="vo-e-slot" style={{ '--a': `${90 * i + 45}deg`, '--r': 'var(--r1)' }}>
                <div className="vo-e-counter vo-e-counter-inner">
                  <span className="vo-e-tool"><img src={asset(t.src)} alt={t.name} /></span>
                </div>
              </div>
            ))}
          </div>

          <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="vo-e-core">
            <span className="vo-e-mark">L</span>
            <span className="vo-e-core-label">Flagship</span>
            <b>AI Transformation</b>
            <span className="vo-e-core-sub">Assess · Train · Prove ROI</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default { A: OfferingsA, B: OfferingsB, C: OfferingsC, D: OfferingsD, E: OfferingsE }
