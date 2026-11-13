import React, { useEffect, useState } from 'react'
import { Head, Avatar, Pill, useInView, useCycle } from '../kit'
import { BUILDS, INSTRUCTORS, buildImg, personImg, BOOK_DEMO_URL } from '../data'
import './services.css'

const byId = (id) => BUILDS.find((b) => b.id === id)

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ------------------------------------------------------------------ A */
// How an engagement runs: the progress line draws and each step opens in turn.

const STEPS = [
  {
    name: 'Strategy session',
    when: 'Week 1',
    title: 'Find where AI pays off first',
    body: 'We meet your leadership team, map the work by function and pick the handful of workflows worth changing first.',
    inc: ['Strategic planning session with your leads', 'Readiness snapshot from the assessment', 'A ranked list of first builds, team by team'],
  },
  {
    name: 'Private cohort',
    when: 'Weeks 2 to 5',
    title: 'Train your people, together',
    body: 'A cohort just for your company: four live sessions taught by practitioners, with weekly builds on your real work.',
    inc: ['4 live sessions for your people only', 'Weekly build assignments, reviewed', 'Examples drawn from your industry'],
  },
  {
    name: 'Custom builds',
    when: 'Weeks 4 to 10',
    title: 'Ship the builds that matter',
    body: 'Our builders pair with your teams to ship company and role-specific builds, then hand them over documented.',
    inc: ['Company or role-specific builds', 'Coaching packs for the people who own them', 'Builds added to your private library'],
  },
  {
    name: 'Embedded Head of AI',
    when: 'Monthly',
    title: 'Keep the momentum',
    body: 'A Leland operator joins your team part-time, runs the roadmap and reports progress to leadership every month.',
    inc: ['A named operator on your team', 'Monthly roadmap and impact review', 'Office hours for every team'],
  },
]

function useStepDemo(inView) {
  const [touched, setTouched] = useState(false)
  const [i, setI] = useCycle(STEPS.length, 4200, inView && !touched)
  const choose = (k) => { setTouched(true); setI(k) }
  return [i, choose]
}

function ServicesA() {
  const [ref, inView] = useInView()
  const [i, choose] = useStepDemo(inView)
  const s = STEPS[i]
  return (
    <section className="vk-sec vk-bg-white vs-a" ref={ref}>
      <div className="vk-wrap">
        <div className="vs-a-top">
          <Head eyebrow="Services" title="Want it built for you? We build it with your team." sub="Pick any step on its own or run them in order. Each one is itemized, never bundled." />
          <a className="vk-btn vk-btn-blue" href={BOOK_DEMO_URL} target="_blank" rel="noreferrer">Plan an engagement</a>
        </div>

        <div className="vs-a-track" style={{ '--p': inView ? i / (STEPS.length - 1) : 0 }} role="tablist">
          <span className="vs-a-line" aria-hidden="true" />
          <span className="vs-a-fill" aria-hidden="true" />
          {STEPS.map((st, k) => (
            <button
              key={st.name}
              role="tab"
              aria-selected={k === i}
              className={`vs-a-step${k === i ? ' is-on' : ''}${k < i ? ' is-done' : ''}`}
              onClick={() => choose(k)}
            >
              <span className="vs-a-node">{k + 1}</span>
              <span className="vs-a-step-text">
                <span className="vs-a-name">{st.name}</span>
                <span className="vs-a-when">{st.when}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="vs-a-detail" key={s.name}>
          <div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <div className="vs-a-who">
              {INSTRUCTORS.map((p) => <Avatar key={p.img} img={p.img} size={34} ring />)}
              <span>Run by Leland practitioners</span>
            </div>
          </div>
          <div>
            <div className="vs-a-inc-label">What’s included</div>
            <ul className="vs-a-inc">
              {s.inc.map((x, k) => <li key={x} style={{ '--d': `${80 + k * 60}ms` }}>{x}</li>)}
            </ul>
          </div>
        </div>
        <p className="vs-a-note">[Sample timeline. Engagements are scoped per company.]</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ B */
// The menu: every service itemized, restaurant-menu style.

const MENU = [
  { course: 'To start', items: [
    { name: 'Strategic planning session', unit: 'Per session', desc: 'Your leadership team and ours map where AI pays off first.' },
  ] },
  { course: 'Training', items: [
    { name: 'Private cohort', unit: '4 live sessions', desc: 'A cohort for your company only, with weekly builds on real work.' },
    { name: 'Live session', unit: 'Per session', desc: 'One practitioner-led session on the topic your team needs now.' },
  ] },
  { course: 'Building', items: [
    { name: 'Custom content', unit: 'Per build', desc: 'Company or role-specific builds, made with the people who will use them.' },
  ] },
  { course: 'Ongoing', items: [
    { name: 'Coaching', unit: 'Packs of sessions', desc: 'One-on-one time with a builder for the people driving adoption.' },
    { name: 'Embedded Head of AI', unit: 'Monthly', desc: 'A Leland operator on your team who runs the roadmap and reports to leadership.' },
  ] },
]

function ServicesB() {
  return (
    <section className="vk-sec vs-b">
      <div className="vk-wrap">
        <div className="vs-b-menu">
          <div className="vs-b-crest">Leland · Services</div>
          <h2 className="vs-b-title">À la carte</h2>
          <p className="vs-b-tag">Order what you need. Skip what you don’t.</p>
          <svg className="vs-b-orn" width="120" height="12" viewBox="0 0 120 12" aria-hidden="true">
            <path d="M0 6h48M72 6h48" stroke="currentColor" strokeWidth="1" />
            <path d="M60 1l5 5-5 5-5-5z" fill="currentColor" />
          </svg>
          {MENU.map((c) => (
            <div className="vs-b-course" key={c.course}>
              <h3>{c.course}</h3>
              {c.items.map((it) => (
                <div className="vs-b-item" key={it.name}>
                  <div className="vs-b-line">
                    <span className="vs-b-name">{it.name}</span>
                    <span className="vs-b-dots" aria-hidden="true" />
                    <span className="vs-b-unit">{it.unit}</span>
                  </div>
                  <p className="vs-b-desc">{it.desc}</p>
                </div>
              ))}
            </div>
          ))}
          <p className="vs-b-foot">Every line is itemized. <b>You see one company total</b>, with nothing bundled in.</p>
          <div className="vs-b-cta">
            <a className="vk-btn vk-btn-dark" href={BOOK_DEMO_URL} target="_blank" rel="noreferrer">Build your order</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ C */
// Agents at work: the orchestrator routes tasks to agents, which light up as they finish.

const CENTER = { x: 140, y: 200 }
const AGENTS = [
  { x: 380, y: 62, label: 'Sales', task: 'Drafted follow-ups for 14 new leads', base: 212 },
  { x: 470, y: 158, label: 'Ops', task: 'Reconciled yesterday’s shipments', base: 96 },
  { x: 468, y: 266, label: 'Finance', task: 'Flagged 3 invoices over budget', base: 141 },
  { x: 380, y: 352, label: 'Support', task: 'Answered 22 pricing questions', base: 388 },
  { x: 252, y: 372, label: 'Research', task: 'Summarized 5 competitor launches', base: 57 },
]
const LOG_TIMES = ['now', '2s ago', '4s ago', '6s ago', '8s ago']

function useAgentTicker(inView) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    const t = setInterval(() => setTick((n) => n + 1), 1700)
    return () => clearInterval(t)
  }, [inView])
  return tick
}

function ServicesC() {
  const [ref, inView] = useInView()
  const tick = useAgentTicker(inView)
  const n = AGENTS.length
  const active = tick % n
  const log = Array.from({ length: Math.min(4, tick + 1) }, (_, k) => tick - k)
  const done = (i) => AGENTS[i].base + (tick >= i ? Math.floor((tick - i) / n) + 1 : 0)
  const a = AGENTS[active]
  return (
    <section className="vk-sec vk-bg-dark vs-c" ref={ref}>
      <div className="vk-wrap vs-c-grid">
        <div>
          <Head dark eyebrow="Services" title="We design the agents. Your team runs them." sub="Leland builders map your workflows, wire up agents for each team and train your people to own them." />
          <div className="vs-c-log">
            <div className="vs-c-log-head">
              <span><i className="vk-live-dot" /> Agent activity</span>
              <span>Sample</span>
            </div>
            <ul>
              {log.map((t, k) => {
                const ag = AGENTS[t % n]
                return (
                  <li key={t}>
                    <span className="vs-c-chip">{ag.label}</span>
                    <span>{ag.task}</span>
                    <em>{LOG_TIMES[k]}</em>
                  </li>
                )
              })}
            </ul>
          </div>
          <p className="vs-c-note">[Sample activity from an illustrative deployment.]</p>
        </div>

        <svg className="vs-c-svg" viewBox="0 0 560 420" role="img" aria-label="Leland orchestrating a team of AI agents">
          <defs>
            <radialGradient id="vs-c-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(128,172,237,0.45)" />
              <stop offset="100%" stopColor="rgba(128,172,237,0)" />
            </radialGradient>
          </defs>
          <circle cx={CENTER.x} cy={CENTER.y} r="190" className="vs-c-ring" />
          <circle cx={CENTER.x} cy={CENTER.y} r="300" className="vs-c-ring" />
          {AGENTS.map((ag, i) => (
            <line key={`l-${ag.label}`} x1={CENTER.x} y1={CENTER.y} x2={ag.x} y2={ag.y} className={`vs-c-line${i === active && inView ? ' is-on' : ''}`} />
          ))}
          <circle cx={CENTER.x} cy={CENTER.y} r="92" className="vs-c-center-glow" />
          {inView ? (
            <circle
              key={tick}
              cx={CENTER.x}
              cy={CENTER.y}
              r="6"
              className="vs-c-packet"
              style={{ '--dx': `${a.x - CENTER.x}px`, '--dy': `${a.y - CENTER.y}px` }}
            />
          ) : null}
          {AGENTS.map((ag, i) => (
            <g key={ag.label} className={`vs-c-agent${i === active && inView ? ' is-on' : ''}`}>
              <circle key={i === active ? `h-${tick}` : 'h'} cx={ag.x} cy={ag.y} r="34" className="vs-c-halo" />
              <circle cx={ag.x} cy={ag.y} r="34" className="vs-c-node" />
              <text x={ag.x} y={ag.y - 1} textAnchor="middle" className="vs-c-label">{ag.label}</text>
              <text x={ag.x} y={ag.y + 15} textAnchor="middle" className="vs-c-count">{done(i)} done</text>
            </g>
          ))}
          <circle cx={CENTER.x} cy={CENTER.y} r="48" className="vs-c-center" />
          <text x={CENTER.x} y={CENTER.y + 6} textAnchor="middle" className="vs-c-center-label">Leland</text>
        </svg>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ D */
// Your embedded team: real instructor cards fan out from a stack.

const FAN = [
  { x0: '110%', r0: '-6deg', r1: '-3deg', y1: '18px', z: 1, chips: ['[Agents & n8n]', '[Sales workflows]'], slots: ['Tue 10:00', 'Wed 2:30', 'Thu 9:00'] },
  { x0: '0%', r0: '2deg', r1: '0deg', y1: '0px', z: 3, chips: ['[Strategy]', '[Claude Code]'], slots: ['Mon 11:00', 'Tue 4:00', 'Fri 10:30'] },
  { x0: '-110%', r0: '6deg', r1: '3deg', y1: '18px', z: 2, chips: ['[Ops automation]', '[Coaching]'], slots: ['Wed 9:30', 'Thu 1:00', 'Fri 3:00'] },
]

function ServicesD() {
  const [ref, inView] = useInView()
  const [picked, setPicked] = useState({ 1: 0 })
  return (
    <section className="vk-sec vk-bg-tint vs-d" ref={ref}>
      <div className="vk-wrap">
        <Head align="center" eyebrow="Services" title="Meet the people who build it with you" sub="Practitioners who ship AI at work every day run your sessions, builds and coaching." />
        <div className={`vs-d-fan${inView ? ' is-in' : ''}`}>
          {INSTRUCTORS.map((p, i) => {
            const f = FAN[i]
            return (
              <article
                key={p.img}
                className="vs-d-card"
                style={{ '--x0': f.x0, '--r0': f.r0, '--r1': f.r1, '--y1': f.y1, '--z': f.z, '--d': `${120 + i * 70}ms` }}
              >
                <div className="vs-d-photo">
                  <img src={personImg(p.img)} alt={p.name} loading="lazy" />
                  <span className="vs-d-badge"><i /> Available this week</span>
                </div>
                <div className="vs-d-body">
                  <h3>{p.name}</h3>
                  <div className="vs-d-role">{p.role}</div>
                  <div className="vs-d-chips">{f.chips.map((c) => <Pill key={c} tone="blue">{c}</Pill>)}</div>
                  <div className="vs-d-cal">
                    <div className="vs-d-cal-head">
                      <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Book time
                      </span>
                      <em>30 min</em>
                    </div>
                    <div className="vs-d-slots">
                      {f.slots.map((s, k) => (
                        <button type="button" key={s} className={picked[i] === k ? 'is-on' : ''} onClick={() => setPicked({ [i]: k })}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <div className="vs-d-services">
          {['Strategic planning session', 'Private cohort · 4 live sessions', 'Custom builds', 'Coaching packs', 'Embedded Head of AI'].map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ E */
// Before → after: sticky-note process wipes into the real n8n workflow we built.

const NOTES = [
  { t: 'Rewrite call notes', s: 'After every call', c: '#ffe58a', x: 6, y: 16, r: '-4deg' },
  { t: 'Update the CRM by hand', s: '15 min each', c: '#ffc9d6', x: 37, y: 10, r: '3deg' },
  { t: 'Email the recap', s: 'Copy, paste, send', c: '#bfe3ff', x: 68, y: 18, r: '-2deg' },
  { t: 'Create follow-up tasks', s: 'Often forgotten', c: '#c9f0cf', x: 14, y: 56, r: '2deg' },
  { t: 'Ping the manager in Slack', s: 'Every deal', c: '#ffe58a', x: 46, y: 54, r: '-3deg' },
]

function useWipeDemo(inView) {
  const [after, setAfter] = useState(false)
  const [touched, setTouched] = useState(false)
  useEffect(() => {
    if (!inView || touched || prefersReducedMotion()) return
    const t = setInterval(() => setAfter((v) => !v), 3600)
    const first = setTimeout(() => setAfter(true), 1200)
    return () => { clearInterval(t); clearTimeout(first) }
  }, [inView, touched])
  const set = (v) => { setTouched(true); setAfter(v) }
  return [after, set]
}

function ServicesE() {
  const [ref, inView] = useInView()
  const [after, setAfter] = useWipeDemo(inView)
  const b = byId(3)
  return (
    <section className="vk-sec vk-bg-white vs-e" ref={ref}>
      <div className="vk-wrap vs-e-grid">
        <div>
          <Head eyebrow="Services" title="From sticky notes to a running workflow" sub="We sit with your team, map the manual process, then build the agent that does it." />
          <div className={`vs-e-toggle${after ? ' is-after' : ''}`} role="tablist">
            <span className="vs-e-toggle-ind" aria-hidden="true" />
            <button role="tab" aria-selected={!after} className={!after ? 'is-on' : ''} onClick={() => setAfter(false)}>Before</button>
            <button role="tab" aria-selected={after} className={after ? 'is-on' : ''} onClick={() => setAfter(true)}>After</button>
          </div>
          <div className="vs-e-stats">
            <div><b>5 → 1</b><span>manual steps</span></div>
            <div><b>{b.hours} hrs</b><span>back every week</span></div>
          </div>
          <p className="vs-e-credit">Real build: “{b.title}” by {b.author}, {b.role}.</p>
        </div>

        <div className={`vs-e-stage${after ? ' is-after' : ''}`}>
          <div className="vs-e-before" aria-hidden={after}>
            <span className="vs-e-before-label">Before · post-call process</span>
            <svg className="vs-e-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M30 30 C 33 26, 35 26, 38 26" vectorEffect="non-scaling-stroke" />
              <path d="M61 26 C 64 28, 66 30, 69 32" vectorEffect="non-scaling-stroke" />
              <path d="M78 40 C 70 52, 50 50, 38 64" vectorEffect="non-scaling-stroke" />
              <path d="M38 70 C 41 70, 43 69, 47 68" vectorEffect="non-scaling-stroke" />
            </svg>
            {NOTES.map((nt) => (
              <div key={nt.t} className="vs-e-note" style={{ left: `${nt.x}%`, top: `${nt.y}%`, background: nt.c, '--r': nt.r }}>
                <span>{nt.t}</span>
                <small>{nt.s}</small>
              </div>
            ))}
            <span className="vs-e-clock">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              {b.hours} hrs a week, by hand
            </span>
          </div>
          <div className="vs-e-after" aria-hidden={!after}>
            <span className="vs-e-after-label">After · one n8n workflow</span>
            <img src={buildImg(b.id)} alt="The n8n workflow that automates post-call tasks" loading="lazy" />
            <span className="vs-e-saved"><i /> Runs after every call</span>
          </div>
          <div className="vs-e-wipe" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default { A: ServicesA, B: ServicesB, C: ServicesC, D: ServicesD, E: ServicesE }
