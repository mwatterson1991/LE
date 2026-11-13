import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Head, Window, Avatar, useInView, useCycle, CountUp, EASE_OUT } from '../kit'
import { BUILDS, PEOPLE, LEVELS, buildImg, BOOK_DEMO_URL } from '../data'
import './admin.css'

const build = (author) => BUILDS.find((b) => b.author === author)
const person = (name) => PEOPLE.find((p) => p.name === name)

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])
  return reduced
}

function sparkPath(values, w, h, pad = 2) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const step = (w - pad * 2) / (values.length - 1)
  return values
    .map((v, i) => {
      const x = pad + i * step
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2)
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function Spark({ values, w = 120, h = 36, draw = true, className = '' }) {
  const d = sparkPath(values, w, h)
  return (
    <svg className={`vad-spark ${className}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <path d={d} pathLength="1" className={`vad-spark-line${draw ? ' vad-draw' : ''}`} />
    </svg>
  )
}

/* A: the dashboard ----------------------------------------------------- */
const A_KPIS = [
  { label: 'Active people', to: 1284, delta: '+12% this month' },
  { label: 'Builds shipped', to: 342, delta: '+48 this month' },
  { label: 'Hours saved / week', to: 2910, delta: '+390 vs last month' },
  { label: 'At Level 2 or above', to: 61, suffix: '%', delta: 'from 18% in Q2' },
]
const A_TEAMS = [
  { team: 'Sales', pct: 72 },
  { team: 'Finance', pct: 64 },
  { team: 'Operations', pct: 58 },
  { team: 'Marketing', pct: 55 },
  { team: 'Support', pct: 47 },
  { team: 'People', pct: 41 },
]
const A_WEEKLY = [6, 9, 8, 14, 17, 16, 23, 27, 31, 36, 44, 52]
const A_RECENT = ['Priya S.', 'Thomas N.', 'Dana L.', 'Kira F.'].map(build)

function BuildsChart({ on }) {
  const w = 520
  const h = 180
  const max = 60
  const pts = A_WEEKLY.map((v, i) => [12 + (i * (w - 24)) / (A_WEEKLY.length - 1), h - 16 - (v / max) * (h - 36)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0]} ${h - 16} L${pts[0][0]} ${h - 16} Z`
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="vad-a-chart" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="vad-a-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#80aced" stopOpacity="0.35" />
          <stop offset="1" stopColor="#80aced" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={w} y1={20 + f * (h - 36)} y2={20 + f * (h - 36)} stroke="rgba(0,0,0,0.06)" />)}
      <path d={area} fill="url(#vad-a-area)" className={`vad-a-area${on ? ' vad-on' : ''}`} />
      <path d={line} pathLength="1" className={`vad-a-line${on ? ' vad-draw' : ''}`} />
      <circle cx={last[0]} cy={last[1]} r="5" className={`vad-a-dot${on ? ' vad-on' : ''}`} />
    </svg>
  )
}

function VariantA() {
  const [ref, inView] = useInView()
  return (
    <section className="vk-sec vk-bg-tint vad-a" ref={ref}>
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="Admin dashboard"
          title="See the impact, not course completions"
          sub="Readiness by team, builds shipped and hours saved, live. The numbers your CFO actually asks about."
        />
        <Window url="leland.ai/admin" className={`vad-a-win${inView ? ' vad-a-win-on' : ''}`}>
          <div className="vad-a-app">
            <aside className="vad-a-side">
              <span className="vad-a-org"><span className="vad-a-orglogo">A</span>Acme Inc.</span>
              {['Overview', 'Teams', 'People', 'Builds', 'Roadmaps', 'Reports'].map((n, i) => (
                <span key={n} className={`vad-a-nav${i === 0 ? ' vad-a-nav-on' : ''}`}>{n}</span>
              ))}
            </aside>
            <div className="vad-a-main">
              <div className="vad-a-top">
                <div>
                  <b>AI transformation</b>
                  <span>Q3 2026 · all teams</span>
                </div>
                <span className="vad-a-sample">Sample data</span>
              </div>
              <div className="vad-a-kpis">
                {A_KPIS.map((k, i) => (
                  <div key={k.label} className="vad-a-kpi" style={{ transitionDelay: `${i * 60}ms` }}>
                    <span>{k.label}</span>
                    <b><CountUp to={k.to} start={inView} suffix={k.suffix || ''} /></b>
                    <em>{k.delta}</em>
                  </div>
                ))}
              </div>
              <div className="vad-a-grid">
                <div className="vad-a-card">
                  <div className="vad-a-card-h"><b>Readiness by team</b><span>% at Level 2+</span></div>
                  <div className="vad-a-bars">
                    {A_TEAMS.map((t, i) => (
                      <div key={t.team} className="vad-a-bar">
                        <span>{t.team}</span>
                        <span className="vad-a-track"><i style={{ transform: `scaleX(${inView ? t.pct / 100 : 0})`, transitionDelay: `${200 + i * 70}ms` }} /></span>
                        <b>{t.pct}%</b>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="vad-a-card">
                  <div className="vad-a-card-h"><b>Builds shipped per week</b><span>last 12 weeks</span></div>
                  <BuildsChart on={inView} />
                </div>
                <div className="vad-a-card vad-a-recent">
                  <div className="vad-a-card-h"><b>Recent verified builds</b><span>View all</span></div>
                  <div className="vad-a-list">
                    {A_RECENT.map((b) => (
                      <div key={b.id} className="vad-a-row">
                        <img src={buildImg(b.id)} alt="" loading="lazy" />
                        <div><b>{b.title}</b><span>{b.author} · {b.role}</span></div>
                        <em>{b.hours} hrs/wk</em>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Window>
      </div>
    </section>
  )
}

/* B: big numbers ------------------------------------------------------- */
const B_STATS = [
  { to: 18420, label: 'Hours saved this year', spark: [2, 3, 3, 5, 6, 8, 9, 12, 14, 17, 19, 23], live: true },
  { to: 342, label: 'Verified builds shipped', spark: [1, 2, 4, 5, 8, 11, 13, 17, 21, 24, 29, 34] },
  { to: 61, suffix: '%', label: 'Of people at Level 2+', spark: [12, 14, 18, 19, 24, 28, 33, 38, 44, 49, 55, 61] },
  { to: 7.4, suffix: '×', label: 'Return on program spend', spark: [1, 1.4, 2, 2.3, 3.1, 3.6, 4.2, 4.9, 5.5, 6.1, 6.8, 7.4], decimals: 1 },
]

function useLiveTicker(active, reduced) {
  const [extra, setExtra] = useState(0)
  useEffect(() => {
    if (!active || reduced) return
    let t
    const start = setTimeout(() => {
      t = setInterval(() => setExtra((x) => x + 1), 1800)
    }, 1800)
    return () => { clearTimeout(start); clearInterval(t) }
  }, [active, reduced])
  return extra
}

function VariantB() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const extra = useLiveTicker(inView, reduced)
  return (
    <section className="vk-sec vad-b" ref={ref}>
      <div className="vad-b-glow" aria-hidden="true" />
      <div className="vk-wrap">
        <div className="vad-b-top">
          <Head dark eyebrow="Prove the ROI" title="Numbers you can put in front of the board" />
          <p className="vad-b-note">[Sample figures from a 1,200-person rollout, first nine months]</p>
        </div>
        <div className="vad-b-grid">
          {B_STATS.map((s, i) => (
            <div key={s.label} className={`vad-b-stat${inView ? ' vad-b-on' : ''}`} style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="vad-b-num">
                {extra && s.live ? (
                  <span>{(s.to + extra).toLocaleString('en-US')}</span>
                ) : (
                  <CountUp to={s.to} start={inView} duration={1800} format={(n) => (s.decimals ? n.toFixed(1) : Math.round(n).toLocaleString('en-US'))} />
                )}
                {s.suffix ? <small>{s.suffix}</small> : null}
              </div>
              <div className="vad-b-label">
                {s.live ? <span className="vk-live-dot" /> : null}
                {s.label}
              </div>
              <Spark values={s.spark} w={200} h={44} draw={inView} className="vad-b-spark" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* C: the board slide --------------------------------------------------- */
const C_BARS = [
  { m: 'Apr', v: 12 },
  { m: 'May', v: 18 },
  { m: 'Jun', v: 24 },
  { m: 'Jul', v: 33 },
  { m: 'Aug', v: 46 },
  { m: 'Sep', v: 61 },
]
const C_CALLOUTS = [
  { big: '61%', text: 'of people at Level 2+, up from 18% in Q2' },
  { big: '2,910', text: 'hours saved every week across 6 teams' },
  { big: '342', text: 'verified builds, 71% still in daily use' },
]

function VariantC() {
  const [ref, inView] = useInView()
  return (
    <section className="vk-sec vad-c" ref={ref}>
      <div className="vk-wrap vad-c-grid">
        <div className="vad-c-copy">
          <Head
            eyebrow="Board-ready"
            title="Your next board slide, already made"
            sub="Leland turns readiness, builds and hours saved into a one-page update. Export it to Slides, PowerPoint or PDF."
          />
          <div className="vad-c-exports">
            <span>Slides</span><span>PowerPoint</span><span>PDF</span>
          </div>
          <a className="vk-btn vk-btn-dark" href={BOOK_DEMO_URL}>Book a demo</a>
        </div>

        <div className={`vad-c-stage${inView ? ' vad-c-on' : ''}`}>
          <div className="vad-c-laptop">
            <div className="vad-c-screen">
              <div className="vad-c-slide">
                <div className="vad-c-slide-head">
                  <span>Acme Inc. · Board update</span>
                  <span>[Sample]</span>
                </div>
                <h3>AI transformation: Q3 update</h3>
                <div className="vad-c-slide-body">
                  <div className="vad-c-chart">
                    <span className="vad-c-chart-t">People at Level 2+</span>
                    <div className="vad-c-cols">
                      {C_BARS.map((b, i) => (
                        <div key={b.m} className="vad-c-col">
                          <span className="vad-c-barwrap">
                            <span className="vad-c-bar" style={{ height: `${(b.v / 61) * 100}%` }}>
                              <span className="vad-c-val" style={{ transitionDelay: `${700 + i * 90}ms` }}>{b.v}%</span>
                              <i className={i === C_BARS.length - 1 ? 'vad-c-hl' : ''} style={{ transitionDelay: `${300 + i * 90}ms` }} />
                            </span>
                          </span>
                          <span className="vad-c-m">{b.m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="vad-c-calls">
                    {C_CALLOUTS.map((c, i) => (
                      <div key={c.big} className="vad-c-call" style={{ transitionDelay: `${900 + i * 120}ms` }}>
                        <b>{c.big}</b>
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="vad-c-slide-foot"><span>Prepared with Leland</span><span>3 / 12</span></div>
              </div>
            </div>
            <div className="vad-c-base" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* D: live feed --------------------------------------------------------- */
const D_EVENTS = [
  { kind: 'build', who: 'Jordan Lee', team: 'Sales', text: (b) => <>shipped <b>{b.title}</b></>, b: 'Priya S.', meta: 'saves 8 hrs/wk' },
  { kind: 'level', team: 'Finance', text: () => <><b>Finance</b> reached Level 2 · Practitioner</>, meta: '14 of 22 people' },
  { kind: 'skill', who: 'Grace Kim', team: 'Marketing', text: () => <>used <b>Competitor brief</b> inside ChatGPT</>, meta: '3rd time this week' },
  { kind: 'build', who: 'Ava Brooks', team: 'Finance', text: (b) => <>shipped <b>{b.title}</b></>, b: 'Thomas N.', meta: 'saves 4 hrs/wk' },
  { kind: 'verify', who: 'Isla Turner', team: 'Support', text: (b) => <>got <b>{b.title}</b> verified</>, b: 'Dana L.', meta: 'reviewed by Leland' },
  { kind: 'level', team: 'Operations', text: () => <><b>Operations</b> crossed 50% at Level 2+</>, meta: 'up 9 pts this month' },
  { kind: 'build', who: 'Sam Rivera', team: 'Operations', text: (b) => <>shipped <b>{b.title}</b></>, b: 'Kira F.', meta: 'saves 3 hrs/wk' },
  { kind: 'skill', who: 'Leo Martins', team: 'Sales', text: () => <>used <b>QBR deck builder</b> inside Claude</>, meta: 'built by Alex W.' },
]
const D_TIMES = ['now', '1m', '4m', '7m', '12m']
const D_ICON = { level: '▲', verify: '✓' }

function useFeed(active, reduced) {
  const [feed, setFeed] = useState(() => [4, 3, 2, 1, 0].map((n) => ({ id: n, ev: D_EVENTS[n] })))
  useEffect(() => {
    if (!active || reduced) return
    let n = 5
    const t = setInterval(() => {
      const id = n
      n += 1
      setFeed((f) => [{ id, ev: D_EVENTS[id % D_EVENTS.length] }, ...f].slice(0, 5))
    }, 2400)
    return () => clearInterval(t)
  }, [active, reduced])
  return feed
}

function FeedItem({ ev }) {
  const p = ev.who ? person(ev.who) : null
  const b = ev.b ? build(ev.b) : null
  return (
    <div className="vad-d-item">
      {p ? <Avatar img={p.img} size={40} /> : <span className={`vad-d-icon vad-d-icon-${ev.kind}`}>{D_ICON[ev.kind]}</span>}
      <div className="vad-d-txt">
        <p>{p ? <b>{p.name} </b> : null}{ev.text(b)}</p>
        <span><em className="vad-d-team">{ev.team}</em>{ev.meta}</span>
      </div>
    </div>
  )
}

function VariantD() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const feed = useFeed(inView, reduced)
  return (
    <section className="vk-sec vk-bg-white vad-d" ref={ref}>
      <div className="vk-wrap vad-d-grid">
        <div>
          <Head
            eyebrow="Live activity"
            title="Watch the change happen, one build at a time"
            sub="Every shipped build, level-up and skill used shows up the moment it happens. No end-of-quarter survey required."
          />
          <div className="vad-d-week">
            <div><b><CountUp to={48} start={inView} /></b><span>builds this week</span></div>
            <div><b><CountUp to={390} start={inView} /></b><span>hours saved</span></div>
            <div><b><CountUp to={3} start={inView} /></b><span>teams leveled up</span></div>
          </div>
          <p className="vad-d-note">[Sample week]</p>
        </div>
        <div className="vad-d-card">
          <div className="vad-d-card-h"><span className="vk-live-dot" /> Activity · Acme Inc.</div>
          <div className="vad-d-list">
            <AnimatePresence initial={false}>
              {feed.map((f, i) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.98 }}
                  animate={{ opacity: i === 4 ? 0.45 : 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="vad-d-row"
                >
                  <FeedItem ev={f.ev} />
                  <span className="vad-d-time">{D_TIMES[i]}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* E: leaderboard ------------------------------------------------------- */
const E_TEAMS = [
  { team: 'Sales', faces: ['pic-01', 'pic-07', 'pic-12'], month: { level: 2.6, builds: 21, hours: 168, trend: [3, 4, 6, 5, 8, 9, 11] }, quarter: { level: 2.6, builds: 58, hours: 412, trend: [8, 9, 12, 14, 16, 19, 21] } },
  { team: 'Finance', faces: ['pic-04', 'pic-15', 'pic-11'], month: { level: 2.3, builds: 9, hours: 74, trend: [2, 2, 3, 3, 4, 4, 5] }, quarter: { level: 2.3, builds: 44, hours: 455, trend: [9, 11, 14, 13, 16, 18, 20] } },
  { team: 'Operations', faces: ['pic-03', 'pic-09', 'pic-13'], month: { level: 2.1, builds: 17, hours: 191, trend: [2, 4, 5, 7, 9, 12, 15] }, quarter: { level: 2.1, builds: 39, hours: 330, trend: [5, 7, 8, 10, 12, 13, 15] } },
  { team: 'Marketing', faces: ['pic-06', 'pic-14', 'pic-02'], month: { level: 1.9, builds: 12, hours: 97, trend: [4, 5, 5, 6, 6, 7, 8] }, quarter: { level: 1.9, builds: 31, hours: 268, trend: [6, 7, 9, 9, 10, 12, 12] } },
  { team: 'Support', faces: ['pic-10', 'pic-05', 'pic-08'], month: { level: 1.6, builds: 14, hours: 132, trend: [1, 2, 4, 6, 7, 9, 12] }, quarter: { level: 1.6, builds: 22, hours: 201, trend: [3, 4, 4, 5, 6, 8, 9] } },
]
const E_PERIODS = [
  { key: 'month', label: 'This month' },
  { key: 'quarter', label: 'This quarter' },
]

function VariantE() {
  const [ref, inView] = useInView()
  const [picked, setPicked] = useState(false)
  const [p, setP] = useCycle(E_PERIODS.length, 4200, inView && !picked)
  const period = E_PERIODS[p].key
  const rows = [...E_TEAMS].sort((a, b) => b[period].hours - a[period].hours)

  return (
    <section className="vk-sec vk-bg-wash vad-e" ref={ref}>
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="Team leaderboard"
          title="Know which teams are pulling ahead"
          sub="Ranked by hours saved, with readiness and builds alongside. Friendly competition does the rest."
        />
        <div className="vad-e-card">
          <div className="vad-e-bar">
            <div className="vad-e-toggle" role="tablist">
              {E_PERIODS.map((x, i) => (
                <button key={x.key} role="tab" aria-selected={i === p} className={`vad-e-tg${i === p ? ' vad-e-tg-on' : ''}`} onClick={() => { setPicked(true); setP(i) }}>
                  {i === p ? <motion.span layoutId="vad-e-pill" className="vad-e-pill" transition={{ duration: 0.3, ease: EASE_OUT }} /> : null}
                  <span className="vad-e-tg-l">{x.label}</span>
                </button>
              ))}
            </div>
            <span className="vad-e-sample">[Sample data]</span>
          </div>
          <div className="vad-e-head">
            <span>#</span><span>Team</span><span>Readiness</span><span className="vad-e-num">Builds</span><span className="vad-e-num">Hours saved</span><span className="vad-e-trendh">Trend</span>
          </div>
          <div className="vad-e-rows">
            {rows.map((r, i) => {
              const d = r[period]
              const lvl = LEVELS[Math.floor(d.level)]
              return (
                <motion.div key={r.team} layout transition={{ duration: 0.5, ease: EASE_OUT }} className={`vad-e-row${i === 0 ? ' vad-e-first' : ''}`}>
                  <span className="vad-e-rank">{i + 1}</span>
                  <span className="vad-e-team">
                    <span className="vad-e-faces">{r.faces.map((f) => <Avatar key={f} img={f} size={28} ring />)}</span>
                    <b>{r.team}</b>
                  </span>
                  <span className="vad-e-ready">
                    <span className="vad-e-track"><i style={{ transform: `scaleX(${inView ? d.level / 4 : 0})` }} /></span>
                    <em>L{d.level.toFixed(1)} · {lvl.name}</em>
                  </span>
                  <span className="vad-e-num">{d.builds}</span>
                  <span className="vad-e-num vad-e-hours">{d.hours.toLocaleString('en-US')}</span>
                  <span className="vad-e-trend"><Spark key={period} values={d.trend} w={96} h={28} draw={inView} /></span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default { A: VariantA, B: VariantB, C: VariantC, D: VariantD, E: VariantE }
