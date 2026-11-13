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
const EASE_OUT = [0.23, 1, 0.32, 1]
const track = (source) => () => posthog.capture('biz--cta_click', { source })

// Logos already shown on leland.ai. Rendered white on the dark page.
const LOGOS = [
  { src: 'assets/logos/google.svg', alt: 'Google', h: 26 },
  { src: 'assets/logos/JPMorganChase.svg', alt: 'JPMorgan Chase', h: 20 },
  { src: 'assets/logos/bain.svg', alt: 'Bain & Company', h: 20 },
  { src: 'logos/shopify.svg', alt: 'Shopify', h: 28 },
  { src: 'logos/mcdonalds.svg', alt: "McDonald's", h: 26 },
  { src: 'logos/adobe.svg', alt: 'Adobe', h: 22 },
  { src: 'logos/american_express.svg', alt: 'American Express', h: 14 },
  { src: 'logos/datavant.svg', alt: 'Datavant', h: 20 },
]

function useCountUp(to, start, ms = 1400) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!start) return undefined
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms)
      setN(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, start, ms])
  return n
}

/** Rotates a list: every `ms` the next item slides in on top. */
function useRotatingFeed(items, visible = 3, ms = 2600) {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setInterval(() => setOffset((o) => o + 1), ms)
    return () => clearInterval(t)
  }, [ms])
  return Array.from({ length: visible }, (_, i) => {
    const idx = (offset + i) % items.length
    return { ...items[idx], key: `${offset + i}` }
  })
}

/* ---------------------------------------------------------------- Hero */

function Dashboard() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const score = useCountUp(HIFI_DASH.score, inView)
  const feed = useRotatingFeed(HIFI_DASH.shipped)
  const d = HIFI_DASH
  return (
    <div className={`bx-app${inView ? ' is-in' : ''}`} ref={ref}>
      <aside className="bx-side">
        <img className="bx-side-logo" src={asset('logos/New Leland Logo/Full Logo/Logo-Black.svg')} alt="Leland" />
        {d.nav.map((n, i) => <span key={n} className={i === 0 ? 'is-on' : ''}>{n}</span>)}
      </aside>
      <div className="bx-main">
        <div className="bx-main-top">
          <b>{d.greeting}</b>
          <span>{d.period}</span>
        </div>
        <div className="bx-card bx-score">
          <div className="bx-row-between">
            <span className="bx-lbl">AI-Native Score</span>
            <span className="bx-tag">{d.delta}</span>
          </div>
          <div className="bx-score-num">
            <b>{score.toFixed(1)}</b><em>/ 5</em><span className="bx-band">{d.band}</span>
          </div>
          <div className="bx-scale" aria-hidden="true">
            {['Starter', 'Explorer', 'Fluent', 'Proficient', 'AI-Native'].map((b) => <i key={b}><span>{b}</span></i>)}
            <u style={{ '--x': d.score / 5 }} />
          </div>
          <div className="bx-teams">
            {d.teams.map(([t, v], i) => (
              <div key={t} className="bx-team">
                <span>{t}</span>
                <div className="bx-track"><i style={{ '--w': v / 5, transitionDelay: `${200 + i * 80}ms` }} /></div>
                <b>{v.toFixed(1)}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="bx-col">
          <div className="bx-card bx-live">
            <img src={person(d.session.img)} alt="" />
            <div>
              <span className="bx-lbl"><i className="bx-dot" />Live with an expert</span>
              <b>{d.session.title}</b>
              <span>{d.session.meta}</span>
            </div>
            <span className="bx-join">Join</span>
          </div>
          <div className="bx-card bx-feed">
            <span className="bx-lbl">Shipped this week</span>
            <ul>
              <AnimatePresence initial={false}>
                {feed.map((f) => (
                  <motion.li
                    key={f.key}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                  >
                    <b>{f.title}</b><span>{f.team}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>
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
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}>
          <Dashboard />
        </motion.div>
        <div className="bx-logos">
          <span>Trusted by teams at</span>
          {LOGOS.map((l) => <img key={l.alt} src={`${import.meta.env.BASE_URL}${l.src}`} alt={l.alt} style={{ height: l.h }} loading="lazy" />)}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------- Transformation cards */

const PRINCIPLES = [
  ['AI-first', 'Is AI your first step on new work?', 4.1],
  ['Builder', 'Are you building systems that handle core parts of your job?', 2.4],
  ['Judgment', 'Do you direct and review AI’s work?', 3.6],
]

function AssessUI({ on }) {
  return (
    <div className={`bx-ui bx-assess${on ? ' is-in' : ''}`}>
      <div className="bx-row-between">
        <span className="bx-ui-k">Your AI profile · from Claude</span>
        <span className="bx-band">AI Fluent</span>
      </div>
      <div className="bx-assess-score"><b>3.2</b><em>/ 5</em></div>
      {PRINCIPLES.map(([name, q, v], i) => (
        <div className="bx-princ" key={name}>
          <div className="bx-row-between"><b>{name}</b><span>{v.toFixed(1)}</span></div>
          <p>{q}</p>
          <div className="bx-track"><i style={{ '--w': v / 5, transitionDelay: `${150 + i * 90}ms` }} /></div>
        </div>
      ))}
      <div className="bx-start">Start here: automate your weekly report <span aria-hidden="true">→</span></div>
    </div>
  )
}

function LearnUI() {
  return (
    <div className="bx-ui bx-learn">
      <span className="bx-ui-k"><i className="bx-dot" />Live now</span>
      <b>Make every output sound like you</b>
      <div className="bx-learn-who">
        <img src={person('dessy-k')} alt="" />
        <span>Dessy K. · AI Builder instructor</span>
      </div>
      <div className="bx-stack">
        {['pic-03', 'pic-06', 'pic-09', 'pic-11'].map((p) => <img key={p} src={person(p)} alt="" />)}
        <span>+24 from Sales</span>
      </div>
    </div>
  )
}

function BuildUI() {
  return (
    <div className="bx-builds">
      <div className="bx-ui bx-build">
        <i className="bx-run" /><div><b>Invoice triage agent</b><span>Ops · shipped with Leland in week 2</span></div>
      </div>
      <div className="bx-ui bx-build">
        <i className="bx-run" /><div><b>Pipeline digest</b><span>Sales · runs every morning</span></div>
      </div>
    </div>
  )
}

export function TransformCards() {
  const t = HIFI_TRANSFORM
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const ui = { assess: <AssessUI on={inView} />, learn: <LearnUI />, build: <BuildUI /> }
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
              {ui[c.key]}
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

function Who({ s }) {
  return (
    <div className="bx-who">
      <img className="bx-who-face" src={hifi(s.photo)} alt={s.name} />
      <div><b>{s.name}</b><span>{s.title}</span></div>
    </div>
  )
}

function Company({ s }) {
  return (
    <div className="bx-co">
      {s.logo ? <img src={asset(s.logo)} alt="" /> : null}
      <span>{s.company}</span>
    </div>
  )
}

export function Stories() {
  const st = HIFI_STORIES
  const f = st.featured
  return (
    <section className="bx-sec">
      <div className="bx-wrap">
        <div className="bx-head">
          <span className="bx-aeo">{st.eyebrow}</span>
          <h2>{st.title}</h2>
        </div>
        <div className="bx-stories">
          <motion.article className="bx-tcard bx-tcard-feature" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, ease: EASE_OUT }}>
            <img className="bx-fill" src={hifi(f.bg)} alt="" loading="lazy" />
            <div className="bx-veil" />
            <Company s={f} />
            <div className="bx-tcard-portrait"><img src={hifi(f.photo)} alt={f.name} /></div>
            <div className="bx-tcard-body">
              <blockquote>“{f.quote}”</blockquote>
              <div className="bx-stat"><b>{f.stat[0]}</b><span>{f.stat[1]}</span></div>
              <Who s={f} />
            </div>
          </motion.article>
          {st.cards.map((c, i) => (
            <motion.article className="bx-tcard" key={c.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay: 0.08 * (i + 1), ease: EASE_OUT }}>
              <img className="bx-fill" src={hifi(c.bg)} alt="" loading="lazy" />
              <div className="bx-veil" />
              <Company s={c} />
              <div className="bx-tcard-body">
                <div className="bx-stat"><b>{c.stat[0]}</b><span>{c.stat[1]}</span></div>
                <blockquote>“{c.quote}”</blockquote>
                <Who s={c} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
