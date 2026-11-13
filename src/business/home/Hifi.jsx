import React, { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { motion, AnimatePresence, useInView } from 'motion/react'
import { HIFI_HERO, HIFI_DASH, HIFI_TRANSFORM, HIFI_STORIES } from '../content/home'
import { BOOK_DEMO_URL, ASSESSMENT_URL } from '../siteMap'

// Dave's Hi-fi 4 ("Nature dark, product hero"): white product UI on vivid
// imagery over a black page.

const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`
const hifi = (n) => asset(`business/hifi/${n}.webp`)
const person = (f) => asset(`business/v/people/${f}.webp`)
const build = (n) => asset(`business/v/builds/build-${String(n).padStart(2, '0')}.webp`)
const EASE_OUT = [0.23, 1, 0.32, 1]
const track = (source) => () => posthog.capture('biz--cta_click', { source })

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  return reduced
}

/* ---------------------------------------------------------------- Hero */

/** Steps through the dashboard's nav while in view; a click takes over. */
function useTour(length, inView, ms = 3800) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  const [manual, setManual] = useState(false)
  useEffect(() => {
    if (!inView || manual || reduced) return undefined
    const t = setInterval(() => setI((x) => (x + 1) % length), ms)
    return () => clearInterval(t)
  }, [inView, manual, reduced, length, ms])
  const pick = (n) => { setManual(true); setI(n) }
  return [i, pick]
}

function Bars({ rows, max = 5 }) {
  return (
    <div className="bx-bars">
      {rows.map(([name, v], i) => (
        <div className="bx-bar" key={name}>
          <span>{name}</span>
          <div className="bx-track"><i style={{ '--w': v / max, animationDelay: `${120 + i * 70}ms` }} /></div>
          <b>{v.toFixed(1)}</b>
        </div>
      ))}
    </div>
  )
}

function Rows({ items }) {
  return (
    <ul className="bx-rows">
      {items.map((it) => (
        <li key={it.title}>
          {it.img ? <img src={it.img} alt="" /> : null}
          <div><b>{it.title}</b><span>{it.meta}</span></div>
          {it.side ? <em>{it.side}</em> : null}
        </li>
      ))}
    </ul>
  )
}

function Chart({ series }) {
  const max = Math.max(...series)
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * 300},${90 - (v / max) * 80}`).join(' ')
  return (
    <svg className="bx-chart" viewBox="0 0 300 96" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={`0,96 ${pts} 300,96`} className="bx-chart-area" />
      <polyline points={pts} className="bx-chart-line" pathLength="1" />
    </svg>
  )
}

function DashView({ view }) {
  const d = HIFI_DASH
  if (view === 'Overview') {
    const filled = Math.floor(d.score)
    return (
      <div className="bx-view">
        <span className="bx-k">AI-Native Score</span>
        <div className="bx-big"><b>{d.score.toFixed(1)}</b><span>/ 5</span></div>
        <p className="bx-line">{d.band} · {d.change}</p>
        <div className="bx-scale">
          {d.bands.map((b, i) => (
            <div key={b} className={i < filled ? 'is-full' : i === filled ? 'is-part' : ''} style={i === filled ? { '--p': d.score - filled } : undefined}>
              <i /><span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (view === 'Assessment') {
    return (
      <div className="bx-view">
        <span className="bx-k">Average score by team</span>
        <Bars rows={d.teams} />
      </div>
    )
  }
  if (view === 'Cohorts') {
    return (
      <div className="bx-view">
        <span className="bx-k">Live sessions this week</span>
        <Rows items={d.sessions.map((s) => ({ title: s.title, meta: s.when, img: person(s.img), side: s.live ? 'Join' : null }))} />
      </div>
    )
  }
  if (view === 'Builds') {
    return (
      <div className="bx-view">
        <span className="bx-k">Shipped this week</span>
        <Rows items={d.builds.map((b) => ({ title: b.title, meta: b.meta, img: build(b.build) }))} />
      </div>
    )
  }
  if (view === 'Talent') {
    return (
      <div className="bx-view">
        <span className="bx-k">Open roles</span>
        <Rows items={d.roles.map((r) => ({ title: r.title, meta: r.meta }))} />
      </div>
    )
  }
  return (
    <div className="bx-view">
      <span className="bx-k">{d.report.label}</span>
      <div className="bx-big"><b>{d.report.value}</b><span>hrs</span></div>
      <Chart series={d.report.series} />
    </div>
  )
}

function Dashboard() {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-60px' })
  const d = HIFI_DASH
  const [i, pick] = useTour(d.nav.length, inView)
  const view = d.nav[i]
  return (
    <div className="bx-app" ref={ref}>
      <aside className="bx-side">
        <img className="bx-side-logo" src={asset('logos/New Leland Logo/Full Logo/Logo-Black.svg')} alt="Leland" />
        {d.nav.map((n, idx) => (
          <button type="button" key={n} className={idx === i ? 'is-on' : ''} onClick={() => pick(idx)}>
            {idx === i ? <motion.span layoutId="bx-nav-pill" className="bx-side-pill" transition={{ duration: 0.3, ease: EASE_OUT }} /> : null}
            <span className="bx-side-label">{n}</span>
          </button>
        ))}
      </aside>
      <div className="bx-main">
        <div className="bx-main-top"><b>{d.greeting}</b><span>{d.period}</span></div>
        <div className="bx-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: EASE_OUT }}>
              <DashView view={view} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- Logos */

// Logos already shown on leland.ai. Each slot flips in place to the next logo.
const LOGOS = [
  { src: 'assets/logos/google.svg', alt: 'Google', h: 26 },
  { src: 'assets/logos/JPMorganChase.svg', alt: 'JPMorgan Chase', h: 20 },
  { src: 'assets/logos/bain.svg', alt: 'Bain & Company', h: 20 },
  { src: 'logos/shopify.svg', alt: 'Shopify', h: 28 },
  { src: 'logos/mcdonalds.svg', alt: "McDonald's", h: 26 },
  { src: 'logos/adobe.svg', alt: 'Adobe', h: 22 },
  { src: 'logos/american_express.svg', alt: 'American Express', h: 14 },
  { src: 'logos/datavant.svg', alt: 'Datavant', h: 20 },
  { src: 'logos/gitlab-logo-400-rgb.svg', alt: 'GitLab', h: 40 },
  { src: 'assets/logos/gsv-ventures.svg', alt: 'GSV', h: 30 },
  { src: 'assets/logos/Partners_Group_Logo_2024.svg', alt: 'Partners Group', h: 26 },
  { src: 'assets/logos/runpod.svg', alt: 'RunPod', h: 24 },
  { src: 'logos/clozd.svg', alt: 'Clozd', h: 20 },
]
const SLOTS = 6

function useLogoSlots() {
  const [slots, setSlots] = useState(() => Array.from({ length: SLOTS }, (_, i) => i))
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return undefined
    let turn = 0
    const t = setInterval(() => {
      setSlots((cur) => {
        const free = LOGOS.map((_, i) => i).filter((i) => !cur.includes(i))
        const next = [...cur]
        next[(turn * 4) % SLOTS] = free[turn % free.length]
        return next
      })
      turn += 1
    }, 1400)
    return () => clearInterval(t)
  }, [reduced])
  return slots
}

export function LogoStrip() {
  const slots = useLogoSlots()
  return (
    <div className="bx-logostrip" aria-label="Trusted by teams at these companies">
      {slots.map((li, s) => {
        const l = LOGOS[li]
        return (
          <div className="bx-logoslot" key={s}>
            <AnimatePresence initial={false}>
              <motion.img
                key={l.alt}
                src={`${import.meta.env.BASE_URL}${l.src}`}
                alt={l.alt}
                style={{ height: l.h }}
                initial={{ opacity: 0, rotateX: -80, y: 12 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, rotateX: 80, y: -12 }}
                transition={{ duration: 0.55, ease: EASE_OUT }}
              />
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function HeroHifi() {
  const h = HIFI_HERO
  return (
    <section className="bx-hero">
      <img className="bx-hero-bg" src={hifi('grass')} alt="" />
      <div className="bx-hero-veil" />
      <div className="bx-wrap bx-hero-inner">
        <motion.div className="bx-hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }}>
          <span className="bx-aeo">{h.eyebrow}</span>
          <h1>{h.title}</h1>
          <p>{h.sub}</p>
          <div className="bx-ctas">
            <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="bx-btn bx-btn-y" onClick={track('hero')}>{h.primaryCta} <span aria-hidden="true">→</span></a>
            <a href={ASSESSMENT_URL} className="bx-btn bx-btn-d" onClick={track('hero-assessment')}>{h.secondaryCta}</a>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}>
          <Dashboard />
        </motion.div>
      </div>
      <LogoStrip />
    </section>
  )
}

/* ------------------------------------------------- Transformation cards */

const PRINCIPLES = [
  ['AI-first', 'Is AI your first step on new work?', 4.1],
  ['Builder', 'Are you building systems that handle core parts of your job?', 2.4],
]

function AssessUI({ on }) {
  return (
    <div className={`bx-ui bx-assess${on ? ' is-in' : ''}`}>
      <span className="bx-k">Your AI profile</span>
      <div className="bx-big bx-big-sm"><b>3.2</b><span>/ 5</span></div>
      <p className="bx-line">AI Fluent</p>
      {PRINCIPLES.map(([name, q, v]) => (
        <div className="bx-princ" key={name}>
          <div className="bx-row-between"><b>{name}</b><span>{v.toFixed(1)}</span></div>
          <p>{q}</p>
          <div className="bx-track"><i style={{ '--w': v / 5 }} /></div>
        </div>
      ))}
      <div className="bx-start">Start here: automate your weekly report <span aria-hidden="true">→</span></div>
    </div>
  )
}

export function TransformCards() {
  const t = HIFI_TRANSFORM
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section className="bx-sec">
      <div className="bx-wrap">
        <div className="bx-head">
          <span className="bx-aeo">{t.eyebrow}</span>
          <h2>{t.title}</h2>
          <p>{t.sub}</p>
        </div>
        <div className="bx-cards" ref={ref}>
          {t.cards.map((c, i) => (
            <motion.div
              className={`bx-fcard bx-fcard-${c.key}`}
              key={c.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
            >
              <img className="bx-fill" src={hifi(c.bg)} alt="" loading="lazy" />
              <div className="bx-shade" />
              {c.key === 'assess' ? <AssessUI on={inView} /> : <span />}
              <div className="bx-fcard-copy">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- Customer stories */

// Four identical cards: logo, result, quote, then the person as a cut-out
// standing on the card's bottom edge.
export function Stories() {
  const st = HIFI_STORIES
  return (
    <section className="bx-sec">
      <div className="bx-wrap">
        <div className="bx-head">
          <span className="bx-aeo">{st.eyebrow}</span>
          <h2>{st.title}</h2>
        </div>
        <div className="bx-stories">
          {st.cards.map((c, i) => (
            <motion.article
              className="bx-tcard"
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.07 * i, ease: EASE_OUT }}
            >
              <img className="bx-fill" src={hifi(c.bg)} alt="" loading="lazy" />
              <div className="bx-veil" />
              <img className="bx-tcard-logo" src={asset(`business/hifi/${c.logo}`)} alt={c.company} />
              <div className="bx-stat"><b>{c.stat[0]}</b><span>{c.stat[1]}</span></div>
              <blockquote>“{c.quote}”</blockquote>
              <div className="bx-tcard-foot">
                <div className="bx-tcard-who"><b>{c.name}</b><span>{c.title}</span></div>
                <img className="bx-tcard-cut" src={hifi(c.photo)} alt={c.name} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
