import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Head, useInView, CountUp, EASE_OUT } from '../kit'
import { TOOLS, asset, BOOK_DEMO_URL } from '../data'
import './problem.css'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const SOURCE_NOTE = '[Placeholder figures: replace with a sourced survey before launch]'

/* ---------- A. The gap, as bars ---------- */

function ProblemA() {
  const [ref, inView] = useInView()
  return (
    <section className="vk-sec vk-bg-white">
      <div className="vk-wrap" ref={ref}>
        <Head eyebrow="The problem" title="Buying AI tools isn’t the same as becoming AI-native" sub="Most companies already pay for Copilot, ChatGPT or Claude. Very few people use them in a way that changes their week." />
        <div className={`vp-a-chart${inView ? ' is-in' : ''}`}>
          <div className="vp-a-row">
            <div className="vp-a-meta">
              <b className="vp-a-num"><CountUp to={85} start={inView} duration={1200} suffix="%" /></b>
              <span>of employees have access to an AI tool</span>
            </div>
            <div className="vp-a-track"><span className="vp-a-fill vp-a-fill-1" /></div>
          </div>
          <div className="vp-a-row">
            <div className="vp-a-meta">
              <b className="vp-a-num vp-a-num-deep"><CountUp to={25} start={inView} duration={1200} suffix="%" /></b>
              <span>use it regularly for real work</span>
            </div>
            <div className="vp-a-track">
              <span className="vp-a-fill vp-a-fill-2" />
              <span className="vp-a-gap">
                <span className="vp-a-gap-label"><b>The gap</b> 60 points of paid-for, unused capability</span>
              </span>
            </div>
          </div>
          <div className="vp-a-axis" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((n) => <span key={n} style={{ left: `${n}%` }}>{n}%</span>)}
          </div>
        </div>
        <div className="vp-a-foot">
          <p>Closing that gap is a people problem, not a software problem. <b>That’s the work Leland does.</b></p>
          <span className="vp-note">{SOURCE_NOTE}</span>
        </div>
      </div>
    </section>
  )
}

/* ---------- B. 100 people ---------- */

// Deterministic shuffle so the grid looks organic but renders the same on server and client.
const RANK = (() => {
  const idx = Array.from({ length: 100 }, (_, i) => i)
  let seed = 7
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let i = idx.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]]
  }
  const rank = new Array(100)
  idx.forEach((cell, r) => { rank[cell] = r })
  return rank
})()

const WAFFLE_STEPS = [
  { n: 100, label: 'employees', caption: 'Take 100 people at a typical company.', tone: 'gray' },
  { n: 85, label: 'got a license', caption: '85 of them have been given an AI tool.', tone: 'light' },
  { n: 25, label: 'use it weekly', caption: 'Only 25 use it at least once a week.', tone: 'deep' },
  { n: 6, label: 'built something', caption: 'Just 6 have built something that saves them real time.', tone: 'yellow' },
]
const toneFor = (rank, step) => {
  if (step >= 3 && rank < 6) return 'yellow'
  if (step >= 2 && rank < 25) return 'deep'
  if (step >= 1 && rank < 85) return 'light'
  return 'gray'
}

function useWaffleSteps(active) {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!active || !auto) return undefined
    if (prefersReducedMotion()) { setStep(3); return undefined }
    const t = setInterval(() => setStep((s) => (s + 1) % WAFFLE_STEPS.length), 2600)
    return () => clearInterval(t)
  }, [active, auto])
  return [step, (s) => { setAuto(false); setStep(s) }]
}

function Person() {
  return (
    <svg viewBox="0 0 20 24" aria-hidden="true">
      <circle cx="10" cy="6" r="5" />
      <path d="M1 24c0-5.5 4-9.5 9-9.5s9 4 9 9.5z" />
    </svg>
  )
}

function ProblemB() {
  const [ref, inView] = useInView()
  const [step, pick] = useWaffleSteps(inView)
  const s = WAFFLE_STEPS[step]
  return (
    <section className="vk-sec vk-bg-wash">
      <div className="vk-wrap" ref={ref}>
        <Head align="center" eyebrow="The problem" title="Everyone has access. Almost no one is building." />
        <div className="vp-b-grid">
          <div className="vp-b-waffle" role="img" aria-label={`${s.n} of 100 ${s.label}`}>
            {RANK.map((r, i) => (
              <span key={i} className={`vp-b-dot is-${toneFor(r, step)}`} style={{ transitionDelay: `${(r % 30) * 12}ms` }}><Person /></span>
            ))}
          </div>
          <div className="vp-b-side">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
                <div className={`vp-b-big is-${s.tone}`}>{s.n}<span>/100</span></div>
                <p className="vp-b-caption">{s.caption}</p>
              </motion.div>
            </AnimatePresence>
            <ol className="vp-b-steps">
              {WAFFLE_STEPS.map((w, i) => (
                <li key={w.label}>
                  <button className={i === step ? 'is-on' : ''} onClick={() => pick(i)}>
                    <i className={`is-${w.tone}`} />
                    <span>{w.n} {w.label}</span>
                  </button>
                </li>
              ))}
            </ol>
            <span className="vp-note">{SOURCE_NOTE}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- C. Gym membership ---------- */

const WEEKS = 13
// The handful of days anyone actually opened the tool this quarter.
const ACTIVE_DAYS = new Set([2, 3, 9, 21, 22, 40])

function ProblemC() {
  const [ref, inView] = useInView()
  return (
    <section className="vk-sec vk-bg-tint">
      <div className="vk-wrap" ref={ref}>
        <div className="vp-c-grid">
          <div className="vp-c-copy">
            <span className="vk-eyebrow">The problem</span>
            <h2 className="vk-title">You bought the membership. Nobody’s training.</h2>
            <p className="vk-sub">An AI license is a gym key card. It doesn’t change anything until people show up every week with a plan and a coach. That’s what Leland adds.</p>
            <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="vk-link">See how we get people training</a>
          </div>

          <div className={`vp-c-visual${inView ? ' is-in' : ''}`}>
            <div className="vp-c-keycard">
              <div className="vp-c-key-top">
                <span className="vp-c-key-brand">
                  <img src={asset(TOOLS[1].src)} alt="" />
                  Enterprise AI
                </span>
                <span className="vp-c-chip" aria-hidden="true" />
              </div>
              <div className="vp-c-key-mid">
                <span>AI license</span>
                <b><i className="vp-c-dot" /> Active</b>
              </div>
              <div className="vp-c-key-bot">
                <div><span>Seats</span><b>500</b></div>
                <div><span>Member since</span><b>Jan 2025</b></div>
                <div><span>Annual cost</span><b>[$180,000]</b></div>
              </div>
            </div>

            <div className="vp-c-log">
              <div className="vp-c-log-head">
                <b>Check-ins this quarter</b>
                <span>Team average</span>
              </div>
              <div className="vp-c-cal">
                {Array.from({ length: WEEKS * 5 }, (_, i) => (
                  <i key={i} className={ACTIVE_DAYS.has(i) ? 'is-on' : ''} style={{ animationDelay: `${300 + i * 14}ms` }} />
                ))}
              </div>
              <div className="vp-c-days" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
              <ul className="vp-c-rows">
                <li><span>This week</span><em>No sessions</em></li>
                <li><span>Last week</span><em>No sessions</em></li>
                <li><span>Mar 3</span><b>1 session · 4 min</b></li>
              </ul>
              <div className="vp-c-stat">
                <b><CountUp to={6} start={inView} duration={900} /></b>
                <span>active days out of {WEEKS * 5}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- D. The funnel ---------- */

const FUNNEL = [
  { label: 'Licenses bought', pct: 100 },
  { label: 'Logged in', pct: 71 },
  { label: 'Used weekly', pct: 38 },
  { label: 'Built something', pct: 12 },
  { label: 'Measurable ROI', pct: 4 },
]
const FW = 1000
const FH = 300
const COL = FW / FUNNEL.length
const BAR = 128
const barX = (i) => i * COL + (COL - BAR) / 2
const barH = (p) => Math.max(6, (p / 100) * (FH - 10))

function ProblemD() {
  const [ref, inView] = useInView()
  return (
    <section className="vk-sec vk-bg-dark">
      <div className="vk-wrap" ref={ref}>
        <Head dark eyebrow="The problem" title="Where AI spend leaks out" sub="Every company starts with 100% of licenses. By the time you ask what changed, almost nothing is left." />
        <div className={`vp-d-chart${inView ? ' is-in' : ''}`}>
          <div className="vp-d-labels">
            {FUNNEL.map((f, i) => (
              <div key={f.label} className="vp-d-label" style={{ transitionDelay: `${150 + i * 220}ms` }}>
                <b>[{f.pct}%]</b>
                <span>{f.label}</span>
                <i className="vp-d-mbar" style={{ '--w': f.pct / 100 }} />
              </div>
            ))}
          </div>
          <svg className="vp-d-svg" viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="vp-d-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#80aced" />
                <stop offset="1" stopColor="#ffd667" />
              </linearGradient>
            </defs>
            {FUNNEL.slice(0, -1).map((f, i) => {
              const n = FUNNEL[i + 1]
              const x1 = barX(i) + BAR
              const x2 = barX(i + 1)
              return <polygon key={f.label} points={`${x1},${FH - barH(f.pct)} ${x2},${FH - barH(n.pct)} ${x2},${FH} ${x1},${FH}`} className="vp-d-link" />
            })}
            {FUNNEL.map((f, i) => (
              <rect key={f.label} x={barX(i)} y={FH - barH(f.pct)} width={BAR} height={barH(f.pct)} rx="6" fill="url(#vp-d-grad)" className="vp-d-bar" />
            ))}
          </svg>
        </div>
        <div className="vp-d-foot">
          <p><b>Leland works on the three middle steps</b>: getting people in, making it a weekly habit, and turning habits into builds that show up on a dashboard.</p>
          <span className="vp-note vp-note-dark">{SOURCE_NOTE}</span>
        </div>
      </div>
    </section>
  )
}

/* ---------- E. A week, before and after ---------- */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS = [9, 10, 11, 12, 1, 2, 3, 4]
// start = hours after 9am. Manual tasks become agent runs; meetings stay put.
const BLOCKS = [
  { d: 0, s: 0, l: 1.5, t: 'Inbox triage', agent: 'Inbox sorted by agent', kind: 'manual' },
  { d: 0, s: 2, l: 1, t: 'Team standup', kind: 'meeting' },
  { d: 0, s: 4.5, l: 2, t: 'Update CRM', agent: 'CRM updated by agent', kind: 'manual' },
  { d: 1, s: 0.5, l: 2, t: 'Lead follow-ups', agent: 'Follow-ups sent by agent', kind: 'manual' },
  { d: 1, s: 4, l: 1, t: 'Pipeline review', kind: 'meeting' },
  { d: 2, s: 0, l: 1.5, t: 'Inbox triage', agent: 'Inbox sorted by agent', kind: 'manual' },
  { d: 2, s: 3, l: 2.5, t: 'Prep QBR deck', agent: 'Deck drafted by agent', kind: 'manual' },
  { d: 3, s: 1, l: 1, t: 'Customer call', kind: 'meeting' },
  { d: 3, s: 3.5, l: 2, t: 'Reconcile expenses', agent: 'Expenses matched', kind: 'manual' },
  { d: 4, s: 0, l: 1, t: 'Team standup', kind: 'meeting' },
  { d: 4, s: 2, l: 2.5, t: 'Weekly report', agent: 'Report written by agent', kind: 'manual' },
]
const FREED = BLOCKS.filter((b) => b.kind === 'manual').reduce((sum, b) => sum + b.l - 0.5, 0)

function Week({ after }) {
  return (
    <div className={`vp-e-week${after ? ' is-after' : ''}`}>
      <div className="vp-e-hours">{HOURS.map((h) => <span key={h}>{h}{h >= 9 && h < 12 ? 'am' : 'pm'}</span>)}</div>
      {DAYS.map((day, d) => (
        <div key={day} className="vp-e-day">
          <span className="vp-e-dayname">{day}</span>
          <div className="vp-e-col">
            {BLOCKS.filter((b) => b.d === d).map((b) => {
              const style = { top: `${(b.s / 8) * 100}%`, height: `${(b.l / 8) * 100}%` }
              if (b.kind === 'meeting') return <div key={b.t + b.s} className="vp-e-block is-meeting" style={style}><b>{b.t}</b></div>
              if (!after) return <div key={b.t + b.s} className="vp-e-block is-manual" style={style}><b>{b.t}</b><span>{b.l} hr{b.l === 1 ? '' : 's'} · manual</span></div>
              return (
                <div key={b.t + b.s} className="vp-e-slot" style={style}>
                  <div className="vp-e-agent"><i>✓</i>{b.agent}</div>
                  <div className="vp-e-free">+{b.l - 0.5} hr free</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Divider position (0-100, % of width showing "before"). Plays a short demo
// once in view, then hands control to the visitor's drag.
function useCompareSlider(active) {
  const [pos, setPos] = useState(50)
  const touched = useRef(false)
  useEffect(() => {
    if (!active || prefersReducedMotion()) return undefined
    const keys = [[0, 50], [900, 92], [2300, 10], [3500, 50]]
    let raf
    const t0 = performance.now()
    const ease = (p) => 1 - Math.pow(1 - p, 3)
    const tick = (t) => {
      if (touched.current) return
      const e = t - t0
      const k = keys.findIndex(([at]) => at > e)
      if (k === -1) { setPos(50); return }
      const [a0, v0] = keys[k - 1]
      const [a1, v1] = keys[k]
      setPos(v0 + (v1 - v0) * ease((e - a0) / (a1 - a0)))
      raf = requestAnimationFrame(tick)
    }
    const start = setTimeout(() => { raf = requestAnimationFrame(tick) }, 400)
    return () => { clearTimeout(start); cancelAnimationFrame(raf) }
  }, [active])

  const fromEvent = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }
  const handlers = {
    onPointerDown: (e) => { touched.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e) },
    onPointerMove: (e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromEvent(e) },
    onKeyDown: (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        touched.current = true
        setPos((p) => Math.min(100, Math.max(0, p + (e.key === 'ArrowLeft' ? -5 : 5))))
      }
    },
  }
  return [pos, handlers]
}

function ProblemE() {
  const [ref, inView] = useInView()
  const [pos, handlers] = useCompareSlider(inView)
  return (
    <section className="vk-sec vk-bg-white">
      <div className="vk-wrap" ref={ref}>
        <div className="vp-e-head">
          <Head eyebrow="The problem" title="Same week. Very different Friday." sub="A license alone leaves the busywork in place. When people learn to hand it to agents, the calendar opens up." />
          <div className="vp-e-freed"><b>[{FREED} hrs]</b><span>back in one week, for one person</span></div>
        </div>
        <div
          className="vp-e-stage"
          role="slider"
          tabIndex={0}
          aria-label="Compare a week before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          {...handlers}
        >
          <Week after />
          <div className="vp-e-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}><Week /></div>
          <div className="vp-e-divider" style={{ transform: `translateX(${pos}%)` }}>
            <span className="vp-e-line" />
            <span className="vp-e-handle" aria-hidden="true">‹ ›</span>
          </div>
          <span className="vp-e-tag vp-e-tag-l" style={{ opacity: pos > 14 ? 1 : 0 }}>Before<span className="vp-e-tag-more">: doing it by hand</span></span>
          <span className="vp-e-tag vp-e-tag-r" style={{ opacity: pos < 86 ? 1 : 0 }}>After<span className="vp-e-tag-more">: agents do the busywork</span></span>
        </div>
        <p className="vp-e-hint">Drag to compare</p>
      </div>
    </section>
  )
}

export default { A: ProblemA, B: ProblemB, C: ProblemC, D: ProblemD, E: ProblemE }
