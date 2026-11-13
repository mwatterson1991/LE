import React, { useEffect, useRef, useState } from 'react'
import { Head, Window, Avatar, useInView, useCycle, CountUp, useTypewriter, Pill } from '../kit'
import { PEOPLE, PRINCIPLES, LEVELS, BOOK_DEMO_URL } from '../data'
import './assess.css'

/* ------------------------------------------------------------------ A */
/* Assessment flow: task → score → roadmap, auto-playing in one window. */

const A_STEPS = ['Do a real task', 'Get your level', 'Get your roadmap']
const A_PROMPT = 'Summarize these 40 call notes into the top 5 objections. Quote the customer for each, flag anything you are unsure about, and format it as a table I can paste into Slack.'
const A_SIGNALS = ['Gave context', 'Set the format', 'Asked it to flag doubt', 'Plans to verify quotes']
const A_ROADMAP = [
  { wk: 'Week 1', t: 'Turn your best prompts into a reusable playbook', tag: 'Prompt' },
  { wk: 'Week 2', t: 'Automate your weekly pipeline report', tag: 'Automate' },
  { wk: 'Week 3', t: 'Build a call-prep agent for your team', tag: 'Build' },
  { wk: 'Week 4', t: 'Share it and coach two teammates', tag: 'Share' },
]

function AssessTask({ active }) {
  const typed = useTypewriter(A_PROMPT, active, 16)
  const done = active && typed.length >= A_PROMPT.length
  return (
    <div className="va-a-pane">
      <div className="va-a-taskhead">
        <Pill tone="blue">Task 3 of 8</Pill>
        <span className="va-muted">Sales · Real work sample</span>
      </div>
      <h3 className="va-a-q">You have notes from 40 customer calls. Ask AI to find the top objections.</h3>
      <div className="va-a-prompt">
        <span>{typed}</span>
        <i className="va-a-caret" />
      </div>
      <div className="va-a-signals">
        <span className="va-muted">Signals detected</span>
        {A_SIGNALS.map((s, i) => (
          <span key={s} className={`va-a-signal${done ? ' is-on' : ''}`} style={{ transitionDelay: `${i * 90}ms` }}>
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function AssessScore({ active }) {
  const r = 70
  const c = 2 * Math.PI * r
  const pct = 0.72
  return (
    <div className="va-a-pane va-a-score">
      <div className="va-a-ring">
        <svg viewBox="0 0 168 168" width="168" height="168">
          <circle cx="84" cy="84" r={r} fill="none" stroke="#EEF3FC" strokeWidth="14" />
          <circle
            cx="84" cy="84" r={r} fill="none" stroke="#F5C84B" strokeWidth="14" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={active ? c * (1 - pct) : c}
            className="va-a-ring-fg"
          />
        </svg>
        <div className="va-a-ring-label">
          <span>Level</span>
          <b>3</b>
          <em>Builder</em>
        </div>
      </div>
      <div className="va-a-bars">
        <p className="va-muted">Scored from 8 real tasks, not a survey</p>
        {[['Prompt', 0.9], ['Verify', 0.78], ['Automate', 0.55], ['Build', 0.62], ['Share', 0.34]].map(([k, v], i) => (
          <div className="va-a-bar" key={k}>
            <span>{k}</span>
            <div><i style={{ transform: `scaleX(${active ? v : 0})`, transitionDelay: `${250 + i * 70}ms` }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssessRoadmap({ active }) {
  return (
    <div className="va-a-pane">
      <div className="va-a-taskhead">
        <Pill tone="yellow">Your roadmap · Level 3 to 4</Pill>
        <span className="va-muted">Built from your results</span>
      </div>
      <ol className="va-a-road">
        {A_ROADMAP.map((r, i) => (
          <li key={r.t} className={active ? 'is-in' : ''} style={{ transitionDelay: `${150 + i * 80}ms` }}>
            <span className="va-a-wk">{r.wk}</span>
            <span className="va-a-rt">{r.t}</span>
            <Pill>{r.tag}</Pill>
          </li>
        ))}
      </ol>
    </div>
  )
}

function AssessA() {
  const [ref, inView] = useInView()
  const [step, setStep] = useCycle(3, 5600, inView)
  const panes = [AssessTask, AssessScore, AssessRoadmap]
  return (
    <section className="vk-sec vk-bg-tint" ref={ref}>
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="AI assessment"
          title="Know exactly where everyone is"
          sub="People do real tasks, not a survey. Each person gets a level and a roadmap. Leadership gets the map."
        />
        <div className="va-a-tabs" role="tablist">
          {A_STEPS.map((s, i) => (
            <button key={s} type="button" role="tab" aria-selected={step === i} className={`va-a-tab${step === i ? ' is-on' : ''}`} onClick={() => setStep(i)}>
              <span className="va-a-tabnum">{i + 1}</span>
              <span className="va-a-tablabel">{s}</span>
              <i className="va-a-tabbar"><b key={`${step}-${i}`} className={step === i && inView ? 'is-run' : ''} /></i>
            </button>
          ))}
        </div>
        <Window url="app.joinleland.com/assessment" className="va-a-window">
          <div className="va-a-stage">
            {panes.map((P, i) => (
              <div key={i} className={`va-a-slot${step === i ? ' is-on' : ''}`} aria-hidden={step !== i}>
                <P active={inView && step === i} />
              </div>
            ))}
          </div>
        </Window>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ B */
/* Org heat map: teams × principles, painting in on scroll. */

const TEAMS = ['Sales', 'Marketing', 'Finance', 'Operations', 'People', 'Product', 'Support', 'Engineering']
const HEAT = ['#EEF1F6', '#D6E3F7', '#A9C5EE', '#7BA4E0', '#3F6FB8']

// Deterministic sample scores so prerender and client match.
function score(t, p) {
  const base = [2, 2, 1, 1, 1, 3, 1, 3][t]
  const wobble = ((t * 7 + p * 13 + t * p * 3) % 5) - 2
  const skew = p === 1 ? 1 : p === 4 || p === 7 ? -1 : 0
  return Math.max(0, Math.min(4, base + Math.round(wobble / 2) + skew))
}
const GRID = TEAMS.map((_, t) => PRINCIPLES.map((_, p) => score(t, p)))

function rowSummary(t) {
  const row = GRID[t]
  const avg = row.reduce((a, b) => a + b, 0) / row.length
  return { avg: avg.toFixed(1), hi: PRINCIPLES[row.indexOf(Math.max(...row))], lo: PRINCIPLES[row.indexOf(Math.min(...row))] }
}

function AssessB() {
  const [ref, inView] = useInView({ rootMargin: '-120px' })
  const [hover, setHover] = useState(null)
  const sum = hover === null ? null : rowSummary(hover)
  const dim = (t) => (hover !== null && hover !== t ? ' is-dim' : '')
  return (
    <section className="vk-sec vk-bg-white" ref={ref}>
      <div className="vk-wrap">
        <div className="va-b-top">
          <Head
            eyebrow="Leadership view"
            title="See your whole org on one map"
            sub="Every team, scored on nine AI-native principles from real work. Spot the bright spots and the gaps at a glance."
          />
          <div className="va-b-kpis">
            <div><b><CountUp to={412} start={inView} /></b><span>people assessed</span></div>
            <div><b>1.9</b><span>average level</span></div>
            <div><b>Share</b><span>biggest gap</span></div>
          </div>
        </div>

        <div className="va-b-card">
          <div className="va-b-scroll">
            <div className="va-b-grid" onMouseLeave={() => setHover(null)}>
              <div className="va-b-corner">Team</div>
              {PRINCIPLES.map((p) => <div key={p} className="va-b-col">{p}</div>)}
              {TEAMS.map((team, t) => (
                <React.Fragment key={team}>
                  <div className={`va-b-team${hover === t ? ' is-hover' : ''}${dim(t)}`} onMouseEnter={() => setHover(t)}>{team}</div>
                  {GRID[t].map((v, p) => (
                    <div
                      key={p}
                      className={`va-b-cell${inView ? ' is-in' : ''}${dim(t)}${hover === t ? ' is-hover' : ''}`}
                      style={{ background: HEAT[v], color: v >= 3 ? '#fff' : '#3c4a5c', transitionDelay: inView && hover === null ? `${(t + p) * 35}ms` : '0ms' }}
                      onMouseEnter={() => setHover(t)}
                    >
                      L{v}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="va-b-foot">
            <div className="va-b-legend">
              {LEVELS.map((l, i) => (
                <span key={l.n}><i style={{ background: HEAT[i] }} />L{l.n} {l.name}</span>
              ))}
            </div>
            <div className="va-b-tip" aria-live="polite">
              {sum ? (
                <>
                  <b>{TEAMS[hover]}</b>
                  <span>Avg L{sum.avg}</span>
                  <span>Strongest: {sum.hi}</span>
                  <span className="va-b-gap">Gap: {sum.lo}</span>
                </>
              ) : <span className="va-muted">Hover a team for its summary</span>}
            </div>
          </div>
        </div>
        <p className="va-note">Sample data for a 412-person company. Principle names are placeholders.</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ C */
/* Radar over the nine principles; polygon morphs between series. */

const SERIES = [
  { key: 'you', label: 'You', color: '#3F6FB8', vals: [3, 4, 2, 2, 3, 2, 3, 1, 3] },
  { key: 'team', label: 'Your team', color: '#B85A2B', vals: [2, 3, 2, 1, 1, 2, 2, 2, 2] },
  { key: 'top', label: 'Top performers in your role', color: '#C9971C', vals: [4, 4, 3, 4, 3, 3, 4, 3, 4] },
]
const R_SIZE = 420
const R_C = R_SIZE / 2
const R_MAX = 140
const ZERO = PRINCIPLES.map(() => 0)

function radarPoint(i, v) {
  const a = (Math.PI * 2 * i) / 9 - Math.PI / 2
  const r = (v / 4) * R_MAX
  return [R_C + Math.cos(a) * r, R_C + Math.sin(a) * r]
}
const toPoints = (vals) => vals.map((v, i) => radarPoint(i, v).map((n) => n.toFixed(1)).join(',')).join(' ')

// SVG `points` can't be CSS-transitioned, so tween the numbers.
function useTweenArray(target, ms = 600) {
  const [vals, setVals] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = from.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { from.current = target; setVals(target); return }
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms)
      const e = 1 - Math.pow(1 - p, 4)
      const next = start.map((s, i) => s + (target[i] - s) * e)
      from.current = next
      setVals(next)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return vals
}

function AssessC() {
  const [ref, inView] = useInView()
  const [manual, setManual] = useState(false)
  const [idx, setIdx] = useCycle(3, 3400, inView && !manual)
  const s = SERIES[idx]
  const vals = useTweenArray(inView ? s.vals : ZERO, 700)
  return (
    <section className="vk-sec vk-bg-wash" ref={ref}>
      <div className="vk-wrap va-c-grid">
        <div className="va-c-copy">
          <Head
            eyebrow="Personal profile"
            title="A clear picture of every person"
            sub="Each person sees how they score on nine principles, how they compare to their team, and what the best people in their role do differently."
          />
          <div className="va-c-pills" role="tablist">
            {SERIES.map((x, i) => (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={idx === i}
                className={`va-c-pill${idx === i ? ' is-on' : ''}`}
                style={{ '--c': x.color }}
                onClick={() => { setManual(true); setIdx(i) }}
              >
                <i />{x.label}
              </button>
            ))}
          </div>
          <ul className="va-c-notes">
            <li><b>Biggest gap vs top performers</b><span>Automate and Share</span></li>
            <li><b>Next step</b><span>Level 3 automation track, starts Monday</span></li>
          </ul>
        </div>
        <div className="va-c-chart">
          <div className="va-c-chip">
            <Avatar img="pic-07" size={36} />
            <div><b>Leo Martins</b><span>Account Executive · Level 3</span></div>
          </div>
          <svg viewBox={`0 0 ${R_SIZE} ${R_SIZE}`} role="img" aria-label={`Radar chart: ${s.label}`}>
            {[1, 2, 3, 4].map((lv) => (
              <polygon key={lv} points={toPoints(PRINCIPLES.map(() => lv))} fill={lv === 4 ? '#fff' : 'none'} stroke="rgba(63,111,184,0.18)" strokeWidth="1" />
            ))}
            {PRINCIPLES.map((_, i) => {
              const [x, y] = radarPoint(i, 4)
              return <line key={i} x1={R_C} y1={R_C} x2={x} y2={y} stroke="rgba(63,111,184,0.14)" />
            })}
            {idx !== 0 && inView ? <polygon points={toPoints(SERIES[0].vals)} fill="none" stroke="#3F6FB8" strokeOpacity="0.45" strokeDasharray="4 4" strokeWidth="1.5" /> : null}
            <polygon points={toPoints(vals)} fill={s.color} fillOpacity="0.16" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" style={{ transition: 'fill 300ms ease, stroke 300ms ease' }} />
            {vals.map((v, i) => {
              const [x, y] = radarPoint(i, v)
              return <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke={s.color} strokeWidth="2" />
            })}
            {PRINCIPLES.map((p, i) => {
              const [x, y] = radarPoint(i, 4.8)
              return <text key={p} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="va-c-axis">{p}</text>
            })}
          </svg>
          {idx !== 0 ? <span className="va-c-key"><i />You</span> : null}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ D */
/* The ladder: avatars slide into their level lane one by one. */

const LANE_OF = [1, 2, 0, 1, 2, 1, 3, 1, 2, 0, 1, 2, 4, 3, 0] // index = PEOPLE index
const LANE_TOTALS = [62, 148, 121, 61, 20] // sample org of 412

function useArrivals(count, active, ms = 180) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(count); return }
    let i = 0
    const t = setInterval(() => {
      i += 1
      setN(i)
      if (i >= count) clearInterval(t)
    }, ms)
    return () => clearInterval(t)
  }, [count, active, ms])
  return n
}

function AssessD() {
  const [ref, inView] = useInView({ rootMargin: '-120px' })
  const landed = useArrivals(PEOPLE.length, inView)
  return (
    <section className="vk-sec vk-bg-white" ref={ref}>
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="Levels 0 to 4"
          title="Most of your org is closer to zero than you think"
          sub="The assessment places every person on one ladder. Now you know who to train, who to promote, and who can teach."
        />
        <div className="va-d-ladder">
          {[4, 3, 2, 1, 0].map((ln) => {
            const L = LEVELS[ln]
            const people = PEOPLE.map((p, i) => ({ ...p, i })).filter((p) => LANE_OF[p.i] === ln)
            const arrived = people.filter((p) => p.i < landed).length
            return (
              <div className="va-d-lane" key={ln}>
                <div className="va-d-label">
                  <i style={{ background: L.color }} />
                  <span className="va-d-n">L{ln}</span>
                  <b>{L.name}</b>
                </div>
                <div className="va-d-track">
                  <span className="va-d-fill" style={{ background: L.color, transform: `scaleX(${(LANE_TOTALS[ln] / 148) * (arrived / people.length)})` }} />
                  {people.map((p) => (
                    <div key={p.img} className={`va-d-face${p.i < landed ? ' is-in' : ''}`} title={`${p.name}, ${p.role}`}>
                      <Avatar img={p.img} size={44} ring />
                    </div>
                  ))}
                </div>
                <div className="va-d-count">
                  <b>{Math.round(LANE_TOTALS[ln] * (arrived / people.length))}</b>
                  <span>people</span>
                </div>
              </div>
            )
          })}
        </div>
        <p className="va-note va-note-center">Sample org of 412 people. Every person also gets a personal roadmap.</p>
        <div className="va-d-cta">
          <a className="vk-btn vk-btn-dark" href={BOOK_DEMO_URL}>See your org's ladder</a>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ E */
/* The scan: a beam sweeps an org chart and colors each node's ring. */

const ORG = [
  [11],
  [0, 5, 8],
  [6, 1, 3, 9, 4, 14, 2, 10, 12],
]
const NODE_LEVEL = { 11: 3, 0: 2, 5: 1, 8: 4, 6: 3, 1: 1, 3: 0, 9: 2, 4: 1, 14: 1, 2: 0, 10: 2, 12: 4 }
const RING = ['#9a9a9a', '#E5C9A8', '#7BA4E0', '#F5C84B', '#ffffff']

function useScanLoop(active) {
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState('idle')
  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPhase('done'); return }
    setPhase('scanning')
    const t1 = setTimeout(() => setPhase('done'), 3000)
    const t2 = setTimeout(() => { setPhase('idle') }, 7800)
    const t3 = setTimeout(() => setRun((r) => r + 1), 8600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [active, run])
  return phase
}

function AssessE() {
  const [ref, inView] = useInView()
  const phase = useScanLoop(inView)
  const lit = phase !== 'idle'
  return (
    <section className="vk-sec vk-bg-dark" ref={ref}>
      <div className="vk-wrap va-e-grid">
        <div className="va-e-copy">
          <Head
            dark
            eyebrow="Org-wide scan"
            title="An X-ray of your org's AI skills"
            sub="One assessment, every person. Within a week you see who is building, who is stuck, and where to invest."
          />
          <ul className={`va-e-legend${phase === 'done' ? ' is-on' : ''}`}>
            {LEVELS.map((l, i) => (
              <li key={l.n} style={{ transitionDelay: phase === 'done' ? `${i * 60}ms` : '0ms' }}>
                <i style={{ borderColor: RING[i] }} />L{l.n} {l.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="va-e-chart">
          {ORG.map((row, ri) => (
            <div key={ri} className={`va-e-row va-e-row-${ri}`}>
              {row.map((pi) => {
                const lv = NODE_LEVEL[pi]
                return (
                  <div
                    key={pi}
                    className={`va-e-node${lit ? ' is-lit' : ''}`}
                    style={{ '--ring': RING[lv], transitionDelay: lit ? `${250 + ri * 1000}ms` : '0ms' }}
                  >
                    <span className="va-e-av"><Avatar img={PEOPLE[pi].img} size={ri === 2 ? 40 : 54} /></span>
                    <span className="va-e-lv">L{lv}</span>
                    {ri < 2 ? <em>{PEOPLE[pi].role}</em> : null}
                  </div>
                )
              })}
            </div>
          ))}
          <div className={`va-e-beam${phase === 'scanning' ? ' is-run' : ''}`} aria-hidden />
        </div>
      </div>
    </section>
  )
}

export default { A: AssessA, B: AssessB, C: AssessC, D: AssessD, E: AssessE }
