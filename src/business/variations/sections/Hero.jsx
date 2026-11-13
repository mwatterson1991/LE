import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Avatar, Window, useInView, useCycle, useTypewriter, EASE_OUT } from '../kit'
import { BUILDS, PEOPLE, LEVELS, asset, buildImg, BOOK_DEMO_URL } from '../data'
import './hero.css'

const photo = asset('images/hero-images/office-placeholder-3.jpg')
const fmt = (n) => Math.round(n).toLocaleString('en-US')

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Ctas({ dark = false }) {
  return (
    <div className="vh-ctas">
      <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="vk-btn vk-btn-blue vh-btn-lg">Book a demo</a>
      <a href="#assessment" className={`vk-btn vk-btn-ghost vh-btn-lg${dark ? ' vh-ghost-dark' : ''}`}>Take the AI assessment</a>
    </div>
  )
}

/* ---------- A. Photo hero + live ticker ---------- */

const TICKER = [
  { label: 'Builds shipped today', start: 1284, step: [1, 3], every: 1700 },
  { label: 'People assessed', start: 48210, step: [2, 9], every: 1100 },
  { label: 'Hours saved this year', start: 1206480, step: [11, 48], every: 900 },
  { label: 'Teams onboarded', start: 252, step: [0, 1], every: 5200 },
]

function useTicking(start, [min, max], every) {
  const [n, setN] = useState(start)
  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const t = setInterval(() => setN((x) => x + min + Math.round(Math.random() * (max - min))), every)
    return () => clearInterval(t)
  }, [min, max, every])
  return n
}

function TickerStat({ s }) {
  const n = useTicking(s.start, s.step, s.every)
  return (
    <div className="vh-a-stat">
      <span className="vh-a-num">
        {/* Keyed so each new value rolls in from below instead of swapping in place. */}
        <span key={n} className="vh-roll">{fmt(n)}</span>
      </span>
      <span className="vh-a-label">{s.label}</span>
    </div>
  )
}

function HeroA() {
  return (
    <section className="vh-a">
      <div className="vh-a-bg" style={{ backgroundImage: `url("${photo}")` }} />
      <div className="vh-a-scrim" />
      <div className="vk-wrap vh-a-content">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }} className="vh-a-copy">
          <span className="vh-eyebrow-pill">AI Transformation Platform</span>
          <h1 className="vh-h1">Make your organization AI-native</h1>
          <p className="vh-lede vh-lede-dark">Assess every employee, train them on real builds, and prove the impact to leadership.</p>
          <Ctas dark />
        </motion.div>
      </div>
      <div className="vh-a-ticker">
        <div className="vk-wrap vh-a-ticker-row">
          <span className="vh-a-live"><span className="vk-live-dot" /> Live <em>[sample]</em></span>
          {TICKER.map((s) => <TickerStat key={s.label} s={s} />)}
        </div>
      </div>
    </section>
  )
}

/* ---------- B. Product-forward hero ---------- */

const TEAMS = [
  { name: 'Sales', pct: 78, level: 3 },
  { name: 'Marketing', pct: 66, level: 2 },
  { name: 'Operations', pct: 59, level: 2 },
  { name: 'Finance', pct: 44, level: 2 },
  { name: 'Support', pct: 37, level: 1 },
  { name: 'People', pct: 28, level: 1 },
]

function usePointerParallax() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    const move = (e) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    }
    const leave = () => { el.style.setProperty('--mx', 0); el.style.setProperty('--my', 0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [])
  return ref
}

function HeroB() {
  const parallax = usePointerParallax()
  const [ref, inView] = useInView()
  const build = BUILDS[1]
  return (
    <section className="vh-b vk-sec" ref={parallax}>
      <div className="vk-wrap vh-b-grid" ref={ref}>
        <div className="vh-b-copy">
          <span className="vk-eyebrow">AI Transformation Platform</span>
          <h1 className="vh-h1 vh-h1-ink">Make your organization AI-native</h1>
          <p className="vh-lede">See where every team stands, train people on the work they actually do, and show leadership what changed.</p>
          <Ctas />
          <div className="vh-b-proof">
            <div className="vh-stack">
              {PEOPLE.slice(0, 5).map((p) => <Avatar key={p.img} img={p.img} size={32} ring />)}
            </div>
            <span>[250+] teams already rolling out Leland</span>
          </div>
        </div>

        <div className={`vh-b-stage${inView ? ' is-in' : ''}`}>
          <div className="vh-layer vh-layer-1">
            <Window url="app.leland.ai/admin" className="vh-b-dash">
              <div className="vh-dash-head">
                <div>
                  <b>Readiness by team</b>
                  <span>Northwind · 1,240 people</span>
                </div>
                <span className="vk-pill vk-pill-green">[+18%] this quarter</span>
              </div>
              <div className="vh-dash-kpis">
                <div><span>Avg. level</span><b>2.1</b></div>
                <div><span>Builds shipped</span><b>386</b></div>
                <div><span>Hours saved / wk</span><b>1,920</b></div>
              </div>
              <ul className="vh-bars">
                {TEAMS.map((t, i) => (
                  <li key={t.name}>
                    <span className="vh-bar-name">{t.name}</span>
                    <span className="vh-bar-track">
                      <span className="vh-bar-fill" style={{ '--w': t.pct / 100, '--d': `${200 + i * 70}ms`, background: LEVELS[t.level].color }} />
                    </span>
                    <span className="vh-bar-val">L{t.level}</span>
                  </li>
                ))}
              </ul>
            </Window>
          </div>

          <div className="vh-layer vh-layer-2">
            <div className="vh-float vh-float-a">
              <div className="vh-card vh-build">
                <img src={buildImg(build.id)} alt="" loading="lazy" />
                <div className="vh-build-meta">
                  <span className="vh-verified">✓ Verified build</span>
                  <b>{build.title}</b>
                  <span>{build.author} · {build.role} · saves {build.hours} hrs/wk</span>
                </div>
              </div>
            </div>
          </div>

          <div className="vh-layer vh-layer-3">
            <div className="vh-float vh-float-b">
              <div className="vh-card vh-road">
                <span className="vh-road-title">Your roadmap · Level 2</span>
                <ul>
                  <li className="is-done"><i>✓</i> Write prompts that sound like you</li>
                  <li className="is-done"><i>✓</i> Delegate research to an agent</li>
                  <li className="is-next"><i /> Automate your weekly report</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- C. Role-rotating headline ---------- */

const ROLES = [
  { word: 'sales team', people: ['pic-01', 'pic-07', 'pic-12', 'pic-05', 'pic-09'], build: BUILDS[0] },
  { word: 'finance team', people: ['pic-04', 'pic-15', 'pic-11', 'pic-09', 'pic-03'], build: BUILDS[6] },
  { word: 'HR team', people: ['pic-02', 'pic-08', 'pic-14', 'pic-10', 'pic-06'], build: BUILDS[12] },
  { word: 'marketing team', people: ['pic-06', 'pic-14', 'pic-05', 'pic-07', 'pic-02'], build: BUILDS[9] },
  { word: 'whole company', people: ['pic-12', 'pic-09', 'pic-01', 'pic-04', 'pic-13', 'pic-02', 'pic-11'], build: BUILDS[3] },
]
const personBy = Object.fromEntries(PEOPLE.map((p) => [p.img, p]))

function HeroC() {
  const [ref, inView] = useInView()
  const [i] = useCycle(ROLES.length, 2600, inView)
  const r = ROLES[i]
  return (
    <section className="vh-c vk-sec" ref={ref}>
      <div className="vh-c-glow" aria-hidden="true" />
      <div className="vk-wrap vh-c-inner">
        <span className="vh-eyebrow-pill vh-eyebrow-light">AI Transformation Platform</span>
        <h1 className="vh-h1 vh-h1-ink vh-c-title">
          <span>Make your</span>
          <span className="vh-c-slot" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={r.word}
                className="vh-c-word"
                initial={{ opacity: 0, y: '0.45em', filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: '-0.45em', filter: 'blur(8px)' }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                {r.word}
              </motion.span>
            </AnimatePresence>
          </span>
          <span>AI-native</span>
        </h1>
        <p className="vh-lede vh-c-lede">Role-specific training, real builds and a readiness score for every person. Not another webinar.</p>

        <div className="vh-c-people">
          <AnimatePresence mode="popLayout" initial={false}>
            {r.people.map((img, j) => (
              <motion.div
                key={`${r.word}-${img}`}
                className="vh-c-face"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: j * 0.05 }}
              >
                <Avatar img={img} size={56} ring />
                <span>{personBy[img].role}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="vh-c-build">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={r.build.id}
              className="vh-c-build-inner"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              <img src={buildImg(r.build.id)} alt="" loading="lazy" />
              <span><b>Popular build:</b> {r.build.title}</span>
              <span className="vk-pill vk-pill-blue">{r.build.hours} hrs/wk saved</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <Ctas />
      </div>
    </section>
  )
}

/* ---------- D. Type your company ---------- */

const DEMO_DOMAIN = 'northwind.com'
const RECS = [BUILDS[1], BUILDS[7], BUILDS[2]]
const D_TEAMS = [
  { name: 'Sales', v: 0.62 },
  { name: 'Operations', v: 0.55 },
  { name: 'Finance', v: 0.41 },
  { name: 'Support', v: 0.33 },
]

// idle -> typing -> thinking -> result. The demo plays once in view; a visitor
// can then type their own domain and rerun it.
function useCompanyDemo(inView) {
  const [phase, setPhase] = useState('idle')
  const [domain, setDomain] = useState('')
  const typed = useTypewriter(DEMO_DOMAIN, phase === 'typing', 85)

  useEffect(() => {
    if (inView && phase === 'idle') setPhase('typing')
  }, [inView, phase])

  useEffect(() => {
    if (phase === 'typing' && typed === DEMO_DOMAIN) {
      setDomain(DEMO_DOMAIN)
      const t = setTimeout(() => setPhase('thinking'), 450)
      return () => clearTimeout(t)
    }
    if (phase === 'thinking') {
      const t = setTimeout(() => setPhase('result'), 1100)
      return () => clearTimeout(t)
    }
    return undefined
  }, [phase, typed])

  const value = phase === 'typing' ? typed : domain
  const clean = (domain || DEMO_DOMAIN).replace(/^https?:\/\//, '').replace(/\/.*$/, '') || DEMO_DOMAIN
  const actions = {
    change: (v) => { setDomain(v); if (phase === 'typing' || phase === 'idle') setPhase('edit') },
    submit: () => { if (domain.trim()) setPhase('thinking') },
  }
  return { phase, value, shownDomain: clean, actions }
}

function HeroD() {
  const [ref, inView] = useInView()
  const { phase, value, shownDomain, actions } = useCompanyDemo(inView)
  const showResult = phase === 'result'
  return (
    <section className="vh-d vk-sec" ref={ref}>
      <div className="vk-wrap vh-d-inner">
        <span className="vk-eyebrow">AI Transformation Platform</span>
        <h1 className="vh-h1 vh-h1-ink vh-d-title">How AI-native is your company?</h1>
        <p className="vh-lede vh-d-lede">Enter your website. We’ll estimate where your teams stand and what to build first.</p>

        <form className="vh-d-form" onSubmit={(e) => { e.preventDefault(); actions.submit() }}>
          <span className="vh-d-prefix">https://</span>
          <input
            className="vh-d-input"
            value={value}
            onChange={(e) => actions.change(e.target.value)}
            placeholder="yourcompany.com"
            aria-label="Company website"
            spellCheck={false}
          />
          <button type="submit" className="vk-btn vk-btn-dark vh-d-go">
            {phase === 'thinking' ? <span className="vh-d-spin" aria-label="Analyzing" /> : 'Analyze'}
          </button>
        </form>

        <div className={`vh-d-card${showResult ? ' is-in' : ''}${phase === 'thinking' ? ' is-thinking' : ''}`}>
          <div className="vh-d-card-head">
            <span className="vh-d-favicon">{shownDomain.charAt(0).toUpperCase()}</span>
            <b>{shownDomain}</b>
            <span className="vk-pill vk-pill-yellow">Sample estimate</span>
          </div>
          <div className="vh-d-cols">
            <div className="vh-d-col vh-d-s1">
              <span className="vh-d-k">Estimated AI readiness</span>
              <div className="vh-d-score">
                <svg viewBox="0 0 120 120" className="vh-d-ring" aria-hidden="true">
                  <circle cx="60" cy="60" r="50" className="vh-d-ring-bg" />
                  <circle cx="60" cy="60" r="50" className="vh-d-ring-fg" pathLength="100" />
                </svg>
                <div><b>1.8</b><span>of 4 · ready for Level 2</span></div>
              </div>
              <ul className="vh-d-teams">
                {D_TEAMS.map((t) => (
                  <li key={t.name}><span>{t.name}</span><i><em style={{ '--w': t.v }} /></i></li>
                ))}
              </ul>
            </div>
            <div className="vh-d-col vh-d-s2">
              <span className="vh-d-k">3 builds to start with</span>
              <ul className="vh-d-recs">
                {RECS.map((b) => (
                  <li key={b.id}>
                    <img src={buildImg(b.id)} alt="" loading="lazy" />
                    <div><b>{b.title}</b><span>{b.role} · saves ~{b.hours} hrs/wk</span></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="vh-d-col vh-d-s3">
              <span className="vh-d-k">Suggested program</span>
              <div className="vh-d-prog">
                <b>Level 1 to 2 rollout</b>
                <span>12 weeks · 3 private cohorts</span>
                <ul>
                  <li>Readiness assessment for everyone</li>
                  <li>Weekly live builds by role</li>
                  <li>Admin dashboard for leadership</li>
                </ul>
                <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="vk-btn vk-btn-blue">Get the full plan</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- E. Wall of real builds ---------- */

// Every build screenshot on disk (build-08 was removed as broken).
const WALL_IDS = [22, 24, 23, 3, 4, 7, 9, 10, 16, 21, 19, 25, 17, 18, 15, 1, 2, 5, 6, 11, 12, 13, 14, 20, 26, 27]
const COLS = [0, 1, 2, 3, 4].map((c) => WALL_IDS.filter((_, i) => i % 5 === c))
const SPEEDS = [46, 34, 52, 38, 44]

function HeroE() {
  return (
    <section className="vh-e">
      <div className="vh-e-wall" aria-hidden="true">
        {COLS.map((ids, c) => (
          <div key={c} className={`vh-e-col${c % 2 ? ' is-down' : ''}`} style={{ '--dur': `${SPEEDS[c]}s` }}>
            <div className="vh-e-track">
              {[...ids, ...ids].map((id, j) => (
                <img key={`${id}-${j}`} src={buildImg(id)} alt="" loading="lazy" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="vh-e-shade" />
      <div className="vk-wrap vh-e-copy">
        <span className="vh-eyebrow-pill">Built by teams like yours</span>
        <h1 className="vh-h1">Your people can build this. We’ll show them how.</h1>
        <p className="vh-lede vh-lede-dark">Every tile is a real build from someone in sales, finance, ops or support. Leland makes it the norm across your organization.</p>
        <Ctas dark />
      </div>
    </section>
  )
}

export default { A: HeroA, B: HeroB, C: HeroC, D: HeroD, E: HeroE }
