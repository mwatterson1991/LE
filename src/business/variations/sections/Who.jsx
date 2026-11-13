import React, { useEffect, useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { Head, Avatar, useInView, useCycle } from '../kit'
import { BUILDS, PEOPLE, LOGOS, logoSrc, buildImg, illus, BOOK_DEMO_URL } from '../data'
import './who.css'

const byId = (id) => BUILDS.find((b) => b.id === id)
const logo = (name) => LOGOS.find((l) => l.name === name)

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ------------------------------------------------------------------ A */
// Today's tabs component, rebuilt in our own markup: By team / industry / size.

const TABS = [
  {
    group: 'By team',
    cards: [
      { label: 'Sales', art: 'handshake', build: 24 },
      { label: 'Marketing', art: 'megaphone', build: 21 },
      { label: 'Operations', art: 'time-management', build: 3 },
      { label: 'HR & People', art: 'unlock-potential', build: 17 },
    ],
  },
  {
    group: 'By industry',
    cards: [
      { label: 'Financial services', art: 'investment', proof: '[Customer proof point for analysts and bankers]' },
      { label: 'Higher education', art: 'graduation', proof: '[Customer proof point for faculty and staff]' },
      { label: 'Consumer brands', art: 'attract-audience', proof: '[Customer proof point for brand and retail teams]' },
    ],
  },
  {
    group: 'By size',
    cards: [
      { label: 'Growth · 25 to 500', art: 'business-growth', proof: 'Everyone in one cohort, live within a week.' },
      { label: 'Enterprise · 500+', art: 'global-network', proof: 'Private cohorts per function, admin reporting and an embedded Head of AI.' },
    ],
  },
]

function WhoA() {
  const [tab, setTab] = useState(0)
  const active = TABS[tab]
  return (
    <section className="vk-sec vk-bg-tint vw-a">
      <div className="vk-wrap">
        <Head align="center" eyebrow="Who it’s for" title="Built for every team, industry and size" sub="Role-specific builds and curriculum, not generic webinars." />
        <div className="vw-a-tabs" role="tablist" style={{ '--i': tab }}>
          <span className="vw-a-tab-ind" aria-hidden="true" />
          {TABS.map((t, i) => (
            <button key={t.group} role="tab" aria-selected={i === tab} className={`vw-a-tab${i === tab ? ' is-on' : ''}`} onClick={() => setTab(i)}>
              {t.group}
            </button>
          ))}
        </div>
        {/* key on the tab so the cards remount and re-stagger in */}
        <div className={`vw-a-grid vw-a-n${active.cards.length}`} key={tab}>
          {active.cards.map((c, i) => {
            const b = c.build ? byId(c.build) : null
            return (
              <a href="#" key={c.label} className="vw-a-card" style={{ '--d': `${i * 50}ms` }} onClick={(e) => e.preventDefault()}>
                <span className="vw-a-art"><img src={illus(c.art)} alt="" loading="lazy" /></span>
                <span className="vw-a-label">{c.label}</span>
                <span className="vw-a-proof">
                  {b ? <em>Top build</em> : null}
                  {b ? b.title : c.proof}
                </span>
                <span className="vw-a-foot">
                  {b ? <span className="vw-a-hrs">{b.hours} hrs/wk back</span> : <span />}
                  <span className="vk-link">See how</span>
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ B */
// "I lead [Sales]": the role select drives the builds below.

const ROLES = [
  { role: 'Sales', team: 'sales team', builds: [24, 22] },
  { role: 'Operations', team: 'ops team', builds: [3, 4] },
  { role: 'Finance', team: 'finance team', builds: [9, 10] },
  { role: 'Marketing', team: 'marketing team', builds: [21, 7] },
  { role: 'Support', team: 'support team', builds: [23, 25] },
]

// Auto-cycles roles while in view, until the visitor picks one.
function useRoleDemo(inView) {
  const [touched, setTouched] = useState(false)
  const [i, setI] = useCycle(ROLES.length, 3600, inView && !touched)
  const choose = (next) => { setTouched(true); setI(next) }
  return [i, choose]
}

function WhoB() {
  const [ref, inView] = useInView()
  const [i, choose] = useRoleDemo(inView)
  const r = ROLES[i]
  const builds = r.builds.map(byId)
  const hours = builds.reduce((s, b) => s + b.hours, 0)
  return (
    <section className="vk-sec vk-bg-white vw-b" ref={ref}>
      <div className="vk-wrap">
        <span className="vk-eyebrow">Who it’s for</span>
        <h2 className="vw-b-sentence">
          I lead{' '}
          <label className="vw-b-select">
            <span className="vw-b-select-val" key={r.role}>{r.role}</span>
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <select value={i} onChange={(e) => choose(Number(e.target.value))} aria-label="Your team">
              {ROLES.map((x, k) => <option key={x.role} value={k}>{x.role}</option>)}
            </select>
          </label>
          .<br />
          <span className="vw-b-muted">Here’s what my {r.team} builds.</span>
        </h2>

        <div className="vw-b-grid" key={r.role}>
          {builds.map((b, k) => (
            <article className="vw-b-card" key={b.id} style={{ '--d': `${k * 60}ms` }}>
              <div className="vw-b-shot"><img src={buildImg(b.id)} alt="" loading="lazy" /></div>
              <div className="vw-b-body">
                <h3>{b.title}</h3>
                <div className="vw-b-meta">
                  <span className="vw-b-author"><b>{b.author}</b> · {b.role}</span>
                  <span className="vw-b-tool">{b.tool}</span>
                </div>
              </div>
            </article>
          ))}
          <div className="vw-b-stat" style={{ '--d': '120ms' }}>
            <span className="vw-b-stat-num">{hours}</span>
            <span className="vw-b-stat-unit">hrs a week back</span>
            <p>From these two builds alone, for each person who uses them.</p>
            <a className="vk-btn vk-btn-dark" href={BOOK_DEMO_URL} target="_blank" rel="noreferrer">See the {r.role.toLowerCase()} track</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ C */
// Faces mosaic: each portrait flips to what that person built.

const FACES = [
  { p: 0, b: 24 }, { p: 1, b: 17 }, { p: 2, b: 3 }, { p: 3, b: 9 }, { p: 4, b: 25 },
  { p: 5, b: 21 }, { p: 6, b: 22 }, { p: 9, b: 23 }, { p: 10, b: 15 }, { p: 14, b: 10 },
]
// A scattered order so the auto-flip doesn't read as a left-to-right wave.
const FLIP_ORDER = [2, 7, 4, 0, 6, 5, 1, 3]

function WhoC() {
  const [ref, inView] = useInView()
  const [hovering, setHovering] = useState(false)
  const [tapped, setTapped] = useState(null)
  const [step] = useCycle(FLIP_ORDER.length, 2200, inView && !hovering && tapped === null)
  const auto = FLIP_ORDER[step]
  return (
    <section className="vk-sec vk-bg-wash vw-c" ref={ref}>
      <div className="vk-wrap">
        <div className="vw-c-head">
          <Head eyebrow="Who it’s for" title="Every role builds something different" sub="Same platform, cut to fit each job. Hover a face to see what they built." />
        </div>
        <div className="vw-c-grid" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
          {FACES.map((f, i) => {
            const person = PEOPLE[f.p]
            const b = byId(f.b)
            const flipped = tapped === null ? (!hovering && inView && auto === i) : tapped === i
            return (
              <button
                type="button"
                key={person.img}
                className={`vw-c-tile${flipped ? ' is-flipped' : ''}${inView ? ' is-in' : ''}`}
                style={{ '--d': `${i * 45}ms` }}
                onClick={() => setTapped(tapped === i ? null : i)}
                aria-label={`${person.role}: ${b.title}`}
              >
                <span className="vw-c-inner">
                  <span className="vw-c-front">
                    <Avatar img={person.img} size={240} className="vw-c-photo" />
                    <span className="vw-c-tag">{person.role}</span>
                  </span>
                  <span className="vw-c-back">
                    <span className="vw-c-back-top">
                      <Avatar img={person.img} size={28} />
                      <span>{person.role}</span>
                    </span>
                    <span className="vw-c-built">Built</span>
                    <span className="vw-c-title">{b.title}</span>
                    <span className="vw-c-back-foot">
                      <span><b>{b.hours} hrs</b>/wk back</span>
                      <span className="vw-c-tool">{b.tool}</span>
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="vw-c-note">[Sample profiles. The builds are real community builds.]</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ D */
// Industry rows, each a slow logo marquee with an industry-specific outcome.

const INDUSTRIES = [
  { name: 'Financial services', outcome: '[Analysts cut model prep from days to hours]', logos: ['JPMorgan Chase', 'Morgan Stanley', 'American Express', 'Bain'], speed: 26 },
  { name: 'Consumer & retail', outcome: '[Brand teams ship campaign creative 3x faster]', logos: ['Nike', "McDonald's", 'Walmart', 'Etsy', 'Shopify'], speed: 20, rev: true },
  { name: 'Technology', outcome: '[Every function builds agents, not just engineering]', logos: ['Google', 'Adobe', 'Salesforce', 'Cisco', 'Figma', 'LinkedIn', 'Miro', 'GitLab'], speed: 32 },
  { name: 'Health & higher ed', outcome: '[Ops and faculty teams automate weekly reporting]', logos: ['Datavant'], placeholders: 3, speed: 16, rev: true },
]

function WhoD() {
  return (
    <section className="vk-sec vk-bg-white vw-d">
      <div className="vk-wrap">
        <Head eyebrow="By industry" title="Curriculum that speaks your industry" sub="Builds, examples and live sessions tuned to how your sector actually works." />
        <div className="vw-d-rows">
          {INDUSTRIES.map((ind) => (
            <div className="vw-d-row" key={ind.name}>
              <div className="vw-d-label">
                <h3>{ind.name}</h3>
                <p>{ind.outcome}</p>
              </div>
              <div className="vw-d-track">
                <Marquee speed={ind.speed} direction={ind.rev ? 'right' : 'left'} autoFill pauseOnHover>
                  {ind.logos.map((n) => {
                    const l = logo(n)
                    return (
                      <span className="vw-d-logo" key={n}>
                        <img src={logoSrc(l)} alt={l.name} style={{ height: Math.min(Math.max(l.h, 22), 30) }} loading="lazy" />
                      </span>
                    )
                  })}
                  {Array.from({ length: ind.placeholders || 0 }, (_, k) => (
                    <span className="vw-d-logo vw-d-ph" key={`ph-${k}`}>[Customer logo]</span>
                  ))}
                </Marquee>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ E */
// Company size slider: the recommended setup and a small org chart grow with it.

const STOPS = [25, 50, 100, 250, 500, 1000, 2500, 5000]
const SETUP = [
  { min: 0, label: 'Platform seats for everyone', note: 'Assessment, curriculum and the builds library' },
  { min: 0, label: 'Admin dashboard', note: 'Readiness and impact by team' },
  { min: 100, label: 'Private cohort', note: '4 live sessions for your people only' },
  { min: 250, label: 'Strategic planning session', note: 'Where AI pays off first, team by team' },
  { min: 500, label: 'Custom role-specific builds', note: 'Built around your stack and workflows' },
  { min: 1000, label: 'Embedded Head of AI', note: 'A Leland operator on your team, monthly' },
]
const DEPTS = ['Sales', 'Ops', 'Finance', 'Marketing', 'People', 'Product']

function useSizeDemo(inView) {
  const [idx, setIdx] = useState(1)
  const touched = useRef(false)
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    // One-time auto demo: walk the slider up to 1,000 so the setup visibly grows.
    let k = 1
    const t = setInterval(() => {
      if (touched.current) { clearInterval(t); return }
      k += 1
      setIdx(k)
      if (k >= 5) clearInterval(t)
    }, 700)
    return () => clearInterval(t)
  }, [inView])
  const set = (v) => { touched.current = true; setIdx(v) }
  return [idx, set]
}

function WhoE() {
  const [ref, inView] = useInView()
  const [idx, setIdx] = useSizeDemo(inView)
  const size = STOPS[idx]
  const deptCount = Math.min(DEPTS.length, 2 + Math.floor(idx * 0.6))
  const perDept = Math.min(9, 2 + idx)
  const pct = (idx / (STOPS.length - 1)) * 100
  return (
    <section className="vk-sec vk-bg-tint vw-e" ref={ref}>
      <div className="vk-wrap">
        <Head align="center" eyebrow="By company size" title="The right setup at 25 people or 5,000" sub="Drag to your headcount. You only pay for what fits." />
        <div className="vw-e-card">
          <div className="vw-e-left">
            <div className="vw-e-size">
              <span className="vw-e-num">{size.toLocaleString('en-US')}{idx === STOPS.length - 1 ? '+' : ''}</span>
              <span className="vw-e-unit">employees</span>
            </div>
            <div className="vw-e-slider" style={{ '--p': `${pct}%` }}>
              <input
                type="range"
                min={0}
                max={STOPS.length - 1}
                step={1}
                value={idx}
                onChange={(e) => setIdx(Number(e.target.value))}
                aria-label="Company size"
                aria-valuetext={`${size} employees`}
              />
              <div className="vw-e-ticks" aria-hidden="true">
                {STOPS.map((s, k) => <span key={s} className={k <= idx ? 'is-on' : ''}>{s >= 1000 ? `${s / 1000}k` : s}</span>)}
              </div>
            </div>
            <ul className="vw-e-setup">
              {SETUP.map((s) => (
                <li key={s.label} className={size >= s.min ? 'is-on' : ''}>
                  <span className="vw-e-check" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="12" height="12"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span><b>{s.label}</b><em>{s.note}</em></span>
                </li>
              ))}
            </ul>
            <p className="vw-e-note">[Sample recommendation. Your plan is itemized to your company.]</p>
          </div>

          <div className="vw-e-right" aria-hidden="true">
            <div className="vw-e-org">
              <div className="vw-e-root">
                <Avatar img="pic-12" size={44} ring />
                <span>Your company</span>
              </div>
              <div className="vw-e-bus" />
              <div className="vw-e-depts">
                {DEPTS.map((d, k) => (
                  <div key={d} className={`vw-e-dept${k < deptCount ? ' is-on' : ''}`} style={{ '--d': `${k * 40}ms` }}>
                    <span className="vw-e-dept-name">{d}</span>
                    <div className="vw-e-dots">
                      {Array.from({ length: 9 }, (_, j) => (
                        <span key={j} className={j < perDept && k < deptCount ? 'is-on' : ''} style={{ '--d': `${j * 30 + k * 20}ms` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`vw-e-hoa${size >= 1000 ? ' is-on' : ''}`}>
                <Avatar img="kristen-h" size={28} />
                <span><b>Embedded Head of AI</b> joins your team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default { A: WhoA, B: WhoB, C: WhoC, D: WhoD, E: WhoE }
