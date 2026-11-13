import React, { useEffect, useRef, useState } from 'react'
import { Head, Window, useInView, useCycle, useTypewriter, Avatar } from '../kit'
import { TOOLS, BUILDS, asset, BOOK_DEMO_URL } from '../data'
import './tools.css'

const toolSrc = (name) => asset(TOOLS.find((t) => t.name === name).src)
const build = (author) => BUILDS.find((b) => b.author === author)

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])
  return reduced
}

function LelandMark({ size = 24, color = '#222' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 55 55" fill={color} aria-hidden="true">
      <path d="M27.3834 40.9646C34.5786 40.9646 41.0473 43.8914 45.5177 48.5484L39.6349 54.4106C38.842 55.2007 37.5574 55.1613 36.6824 54.4631C34.206 52.4874 30.9501 51.288 27.3834 51.288C23.8141 51.288 20.5561 52.489 18.079 54.4673C17.2028 55.1671 15.9151 55.2061 15.1221 54.4131L9.25316 48.5442C13.7234 43.8896 20.1903 40.9646 27.3834 40.9646Z" />
      <path d="M14.5392 29.4609C18.5488 28.0972 22.8738 27.3536 27.3834 27.3536C37.674 27.3536 47.0034 31.2249 53.8163 37.5039C54.6109 38.2362 54.5995 39.477 53.835 40.2406L47.9635 46.1054C42.8508 40.8829 35.5231 37.6112 27.3834 37.6112C19.2586 37.6112 11.9427 40.8709 6.83137 46.0767C5.95688 45.1982 2.33697 41.5498 0.573347 39.7728C-0.0107259 39.1842 -0.164501 38.2946 0.18579 37.543L16.9767 1.51902C17.4086 0.592411 18.3382 6.75896e-06 19.3606 0H28.271L14.5392 29.4609Z" />
      <path d="M39.5095 0C40.9524 0 41.907 1.49824 41.2975 2.80597L31.0979 24.6887C29.8531 24.5812 28.5922 24.5262 27.3176 24.5262C24.9338 24.5262 22.5977 24.7183 20.3259 25.0869L32.019 0H39.5095Z" />
    </svg>
  )
}

// No Copilot logo in the asset set: a neutral gradient glyph stands in.
function CopilotGlyph({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="vtl-cop-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect x="3" y="7" width="16" height="18" rx="6" fill="url(#vtl-cop-a)" />
      <rect x="13" y="7" width="16" height="18" rx="6" fill="url(#vtl-cop-a)" opacity="0.75" />
      <circle cx="12" cy="16" r="1.8" fill="#fff" />
      <circle cx="20" cy="16" r="1.8" fill="#fff" />
    </svg>
  )
}

// The Claude, Gemini and Cursor logos ship as white glyphs, so every tool
// renders as an app-icon tile in its brand color.
function ToolIcon({ name, size = 28 }) {
  const style = { width: size, height: size, borderRadius: Math.round(size * 0.28) }
  if (name === 'Copilot') {
    return <span className="vtl-ti vtl-ti-copilot" style={style}><CopilotGlyph size={Math.round(size * 0.78)} /></span>
  }
  return (
    <span className={`vtl-ti vtl-ti-${name.toLowerCase()}`} style={style}>
      <img src={toolSrc(name)} alt="" />
    </span>
  )
}

function LelandCard({ title, meta, cta = 'Open skill' }) {
  return (
    <div className="vtl-lcard">
      <div className="vtl-lcard-top">
        <span className="vtl-lcard-mark"><LelandMark size={13} color="#fff" /></span>
        <span className="vtl-lcard-from">Suggested by Leland</span>
      </div>
      <p className="vtl-lcard-title">{title}</p>
      <p className="vtl-lcard-meta">{meta}</p>
      <div className="vtl-lcard-actions">
        <span className="vtl-lcard-btn">{cta} →</span>
        <span className="vtl-lcard-ghost">Add to roadmap</span>
      </div>
    </div>
  )
}

/* A: in the chat ------------------------------------------------------- */
const A_USER = 'Help me prep for my QBR next Tuesday'
const A_REPLY = 'Happy to. Lead with the quarter against target, the two deals that moved the number, and one clear ask for next quarter. Want me to draft the outline?'

function useChatTimeline(active, reduced) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!active) return
    if (reduced) { setPhase(4); return }
    const steps = [
      [1, 500],
      [2, A_USER.length * 38 + 500],
      [3, 1100],
      [4, A_REPLY.length * 13 + 400],
      [0, 6200],
    ]
    let i = 0
    let t
    const run = () => {
      const [next, wait] = steps[i]
      t = setTimeout(() => { setPhase(next); i = (i + 1) % steps.length; run() }, wait)
    }
    run()
    return () => clearTimeout(t)
  }, [active, reduced])
  return phase
}

function VariantA() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const phase = useChatTimeline(inView, reduced)
  const typed = useTypewriter(A_USER, phase === 1, 38)
  const reply = useTypewriter(A_REPLY, phase >= 3, 13)
  const qbr = build('Alex W.')

  return (
    <section className="vk-sec vk-bg-tint vtl-a" ref={ref}>
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="Inside Claude, ChatGPT and Copilot"
          title="Help arrives in the middle of the work"
          sub="While your people work in their AI tool, Leland spots the moment and hands them the build their team already made."
        />
        <div className="vtl-a-stage">
          <Window url="claude.ai" className="vtl-a-window">
            <div className="vtl-a-chat">
              <aside className="vtl-a-rail">
                <span className="vtl-a-rail-new">+ New chat</span>
                <span className="vtl-a-rail-h">Recent</span>
                <span className="vtl-a-rail-item vtl-a-rail-on">QBR prep</span>
                <span className="vtl-a-rail-item">Renewal email for Northwind</span>
                <span className="vtl-a-rail-item">Pipeline notes cleanup</span>
                <span className="vtl-a-rail-item">Territory plan draft</span>
              </aside>
              <div className="vtl-a-main">
                <div className="vtl-a-thread">
                  {phase < 2 ? <div className="vtl-a-empty"><ToolIcon name="Claude" size={30} />How can I help you today?</div> : null}
                  {phase >= 2 ? (
                    <div className="vtl-a-msg vtl-a-user vtl-in">
                      <p>{A_USER}</p>
                      <Avatar img="pic-07" size={28} />
                    </div>
                  ) : null}
                  {phase === 2 ? (
                    <div className="vtl-a-msg vtl-a-bot vtl-in">
                      <ToolIcon name="Claude" size={26} />
                      <span className="vtl-dots"><i /><i /><i /></span>
                    </div>
                  ) : null}
                  {phase >= 3 ? (
                    <div className="vtl-a-msg vtl-a-bot">
                      <ToolIcon name="Claude" size={26} />
                      <p>{reply}</p>
                    </div>
                  ) : null}
                  {phase >= 4 ? (
                    <div className="vtl-a-inline vtl-slide">
                      <LelandCard
                        title="Your team uses the QBR deck builder"
                        meta={`Built by ${qbr.author} in Sales · turns your CRM export into a 10-slide QBR`}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="vtl-a-composer">
                  <span className={phase === 1 && typed ? 'vtl-a-typed' : 'vtl-a-ph'}>
                    {phase === 1 && typed ? typed : 'Reply to Claude…'}
                    {phase === 1 ? <i className="vtl-caret" /> : null}
                  </span>
                  <span className="vtl-a-send">↑</span>
                </div>
              </div>
            </div>
          </Window>

          <div className={`vtl-a-road${phase >= 4 ? ' vtl-a-road-on' : ''}`}>
            <span className="vtl-a-road-h"><LelandMark size={12} /> Your roadmap</span>
            <div className="vtl-a-road-row vtl-done"><b>✓</b> Prompting basics</div>
            <div className="vtl-a-road-row vtl-done"><b>✓</b> Write in your voice</div>
            <div className="vtl-a-road-row vtl-a-road-new"><b>✓</b> QBR deck builder <em>just now</em></div>
            <div className="vtl-a-road-row"><b /> Your first agent</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* B: connected --------------------------------------------------------- */
const B_NODES = ['Claude', 'ChatGPT', 'Copilot', 'Gemini', 'Cursor', 'Perplexity']
const B_EVENTS = [
  { node: 0, dir: 'in', text: 'Priya used the SDR follow-up skill in Claude' },
  { node: 1, dir: 'out', text: 'Suggested “Prompting basics” in ChatGPT' },
  { node: 2, dir: 'in', text: 'Finance drafted a forecast in Copilot · roadmap updated' },
  { node: 3, dir: 'out', text: 'Suggested “Summarize a long doc” in Gemini' },
  { node: 4, dir: 'in', text: 'Dalton shipped an internal tool from Cursor' },
  { node: 5, dir: 'out', text: 'Suggested “Research with sources” in Perplexity' },
]
const B_POINTS = B_NODES.map((_, k) => {
  const a = (-90 + k * 60) * (Math.PI / 180)
  return { x: 50 + 39 * Math.cos(a), y: 50 + 39 * Math.sin(a) }
})

function VariantB() {
  const [ref, inView] = useInView()
  const [i] = useCycle(B_EVENTS.length, 2600, inView)
  const ev = B_EVENTS[i]

  return (
    <section className="vk-sec vk-bg-dark vtl-b" ref={ref}>
      <div className="vtl-b-glow" aria-hidden="true" />
      <div className="vk-wrap">
        <Head
          dark
          align="center"
          eyebrow="Connected"
          title="One coach, wired into every AI tool"
          sub="Leland suggests the next skill inside the tool your people already use. What they do there flows back to their roadmap."
        />
        <div className={`vtl-orbit${inView ? ' vtl-orbit-on' : ''}`}>
          <svg className="vtl-orbit-lines" viewBox="0 0 100 100" aria-hidden="true">
            {B_POINTS.map((p, k) => {
              const dx = p.x - 50
              const dy = p.y - 50
              const len = Math.hypot(dx, dy)
              const ox = (-dy / len) * 0.9
              const oy = (dx / len) * 0.9
              return (
                <g key={k} className={ev.node === k ? 'vtl-line-hot' : ''}>
                  <line x1="50" y1="50" x2={p.x} y2={p.y} className="vtl-line-base" />
                  <line x1={50 + ox} y1={50 + oy} x2={p.x + ox} y2={p.y + oy} pathLength="100" className="vtl-pulse vtl-pulse-out" style={{ animationDelay: `${k * 0.37}s` }} />
                  <line x1={p.x - ox} y1={p.y - oy} x2={50 - ox} y2={50 - oy} pathLength="100" className="vtl-pulse vtl-pulse-in" style={{ animationDelay: `${k * 0.37 + 1.2}s` }} />
                </g>
              )
            })}
          </svg>
          <div className="vtl-orbit-center">
            <span className="vtl-ring" /><span className="vtl-ring vtl-ring-2" />
            <LelandMark size={44} />
          </div>
          {B_NODES.map((n, k) => (
            <div key={n} className={`vtl-node${ev.node === k ? ' vtl-node-hot' : ''}`} style={{ left: `${B_POINTS[k].x}%`, top: `${B_POINTS[k].y}%`, transitionDelay: `${k * 50}ms` }}>
              <span className="vtl-node-tile"><ToolIcon name={n} size={72} /></span>
              <span className="vtl-node-label">{n}</span>
            </div>
          ))}
        </div>
        <div className="vtl-b-ticker" aria-live="polite">
          <span className={`vtl-b-dir vtl-b-dir-${ev.dir}`}>{ev.dir === 'in' ? '→ Leland' : 'Leland →'}</span>
          <span key={i} className="vtl-b-text vtl-fade">{ev.text}</span>
        </div>
      </div>
    </section>
  )
}

/* C: same help, any tool ----------------------------------------------- */
const C_SKINS = [
  { key: 'claude', name: 'Claude', url: 'claude.ai' },
  { key: 'chatgpt', name: 'ChatGPT', url: 'chatgpt.com' },
  { key: 'copilot', name: 'Copilot', url: 'copilot.microsoft.com' },
]
const C_ASK = 'Draft the weekly pipeline summary for my team'

function VariantC() {
  const [ref, inView] = useInView()
  const [picked, setPicked] = useState(false)
  const [i, setI] = useCycle(C_SKINS.length, 3800, inView && !picked)
  const skin = C_SKINS[i]
  const digest = build('Marcus T.')

  return (
    <section className="vk-sec vk-bg-white vtl-c" ref={ref}>
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="Works where they work"
          title="Same help, whichever AI your team picked"
          sub="Nobody has to switch tools. The suggestion is the same in Claude, ChatGPT and Copilot."
        />
        <div className="vtl-c-tabs" role="tablist">
          {C_SKINS.map((s, k) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={k === i}
              className={`vtl-c-tab${k === i ? ' vtl-c-tab-on' : ''}`}
              onClick={() => { setPicked(true); setI(k) }}
            >
              <ToolIcon name={s.name} size={20} />
              {s.name}
              {k === i && !picked && inView ? <span key={`p${i}`} className="vtl-c-prog" /> : null}
            </button>
          ))}
        </div>
        <div className={`vtl-c-win vtl-skin-${skin.key}`}>
          <div className="vtl-c-bar">
            <span className="vtl-c-dots"><i /><i /><i /></span>
            <span className="vtl-c-url">{skin.url}</span>
          </div>
          <div className="vtl-c-body">
            <div className="vtl-c-head">
              <span key={skin.key} className="vtl-c-brand vtl-fade"><ToolIcon name={skin.name} size={22} />{skin.name}</span>
            </div>
            <div className="vtl-c-thread">
              <div className="vtl-c-user">{C_ASK}</div>
              <div className="vtl-c-bot">
                <span key={skin.key} className="vtl-fade vtl-c-boticon"><ToolIcon name={skin.name} size={24} /></span>
                <p>Here’s a first pass. Pipeline is up 12% week over week, with three deals moving to proposal. Before I go further, your team has a skill built for exactly this.</p>
              </div>
              <div className="vtl-c-card">
                <LelandCard
                  title="Weekly pipeline digest"
                  meta={`Built by ${digest.author} in Sales · pulls from your CRM and posts to Slack every Monday`}
                  cta="Use this skill"
                />
                <span className="vtl-c-pin">Same card in every tool</span>
              </div>
            </div>
            <div className="vtl-c-composer">Message {skin.name}…</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* D: turn-by-turn ------------------------------------------------------ */
const D_ROUTE = [[80, 480], [80, 370], [300, 370], [300, 210], [560, 210], [560, 330], [790, 330], [790, 110], [920, 110]]
const D_STOPS = [
  { at: 2, title: 'Prompting basics', kind: 'Tutorial · 12 min', why: 'Suggested while you rewrote a client email in ChatGPT' },
  { at: 4, title: 'Your first agent', kind: 'Live session · Thu', why: 'You asked Claude the same question 4 times this week' },
  { at: 6, title: 'Automate weekly report', kind: 'Build · n8n', why: 'Your team’s Monday report takes 3 hours by hand' },
  { at: 8, title: 'Level 2 reached', kind: 'Practitioner', why: 'Verified build added to your portfolio' },
]
const D_SEG = D_ROUTE.slice(1).map((p, k) => Math.hypot(p[0] - D_ROUTE[k][0], p[1] - D_ROUTE[k][1]))
const D_CUM = D_SEG.reduce((acc, l) => [...acc, acc[acc.length - 1] + l], [0])
const D_TOTAL = D_CUM[D_CUM.length - 1]
const D_PATH = `M${D_ROUTE.map((p) => p.join(' ')).join(' L')}`

function pointAt(len) {
  let k = D_SEG.findIndex((_, j) => D_CUM[j + 1] >= len)
  if (k < 0) k = D_SEG.length - 1
  const t = D_SEG[k] ? (len - D_CUM[k]) / D_SEG[k] : 0
  const [x0, y0] = D_ROUTE[k]
  const [x1, y1] = D_ROUTE[k + 1]
  return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]
}

// Travel at a constant speed and pause at every stop, like a nav app arriving.
function buildSchedule() {
  const speed = 0.16 // viewBox units per ms
  const out = []
  let from = 0
  D_STOPS.forEach((s) => {
    const to = D_CUM[s.at]
    out.push({ from, to, dur: (to - from) / speed })
    out.push({ from: to, to, dur: s.at === 8 ? 3200 : 1800 })
    from = to
  })
  return out
}
const D_SCHEDULE = buildSchedule()
const D_CYCLE = D_SCHEDULE.reduce((a, s) => a + s.dur, 0)

function useRouteProgress(active, reduced, dotRef, trailRef) {
  const [stop, setStop] = useState(-1)
  useEffect(() => {
    if (!active) return
    const apply = (len) => {
      const [x, y] = pointAt(len)
      if (dotRef.current) dotRef.current.setAttribute('transform', `translate(${x} ${y})`)
      if (trailRef.current) trailRef.current.style.strokeDashoffset = String(D_TOTAL - len)
      let reached = -1
      D_STOPS.forEach((s, k) => { if (len >= D_CUM[s.at] - 0.5) reached = k })
      setStop((prev) => (prev === reached ? prev : reached))
    }
    if (reduced) { apply(D_TOTAL); return }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      let t = (now - t0) % D_CYCLE
      let len = 0
      for (const s of D_SCHEDULE) {
        if (t <= s.dur) {
          const p = s.dur ? t / s.dur : 1
          const eased = s.from === s.to ? 1 : 0.5 - Math.cos(Math.PI * p) / 2
          len = s.from + (s.to - s.from) * eased
          break
        }
        t -= s.dur
      }
      apply(len)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, reduced, dotRef, trailRef])
  return stop
}

const MAP_H = [0, 110, 210, 330, 370, 480, 560]
const MAP_V = [0, 80, 190, 300, 430, 560, 680, 790, 920, 1000]
const MAP_FILL = ['#dcecd9', '#e3e7ed', '#e7eaef', '#e3e7ed', null]

function MapBackdrop() {
  const blocks = []
  MAP_V.slice(1).forEach((x1, i) => {
    MAP_H.slice(1).forEach((y1, j) => {
      const fill = MAP_FILL[(i * 7 + j * 3) % MAP_FILL.length]
      const x0 = MAP_V[i]
      const y0 = MAP_H[j]
      if (fill && y1 - y0 > 50) blocks.push(<rect key={`${i}-${j}`} x={x0 + 13} y={y0 + 13} width={x1 - x0 - 26} height={y1 - y0 - 26} rx="10" fill={fill} />)
    })
  })
  return (
    <g>
      <rect width="1000" height="560" fill="#f1f3f6" />
      {blocks}
      <path d="M0 0 H380 C350 60 260 86 170 76 C90 68 34 96 0 130 Z" fill="#d9e6f7" />
      {MAP_H.slice(1, -1).map((y) => <line key={`h${y}`} x1="0" x2="1000" y1={y} y2={y} stroke="#fff" strokeWidth="14" />)}
      {MAP_V.slice(1, -1).map((x) => <line key={`v${x}`} y1="0" y2="560" x1={x} x2={x} stroke="#fff" strokeWidth={x === 190 || x === 430 || x === 680 ? 9 : 14} />)}
    </g>
  )
}

function VariantD() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const dotRef = useRef(null)
  const trailRef = useRef(null)
  const stop = useRouteProgress(inView, reduced, dotRef, trailRef)
  const next = D_STOPS[Math.min(stop + 1, D_STOPS.length - 1)]
  const current = stop >= 0 ? D_STOPS[stop] : null
  const [sx, sy] = D_ROUTE[0]
  const arrived = stop >= D_STOPS.length - 1

  return (
    <section className="vk-sec vk-bg-wash vtl-d" ref={ref}>
      <div className="vk-wrap">
        <div className="vtl-d-top">
          <Head
            eyebrow="Turn-by-turn"
            title="Like GPS for getting good at AI"
            sub="Leland watches the road, not a syllabus. Each suggestion comes from what someone just tried to do in their AI tool."
          />
          <a href={BOOK_DEMO_URL} className="vk-btn vk-btn-dark vtl-d-cta">See it on your team</a>
        </div>
        <div className="vtl-d-map">
          <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" className="vtl-d-svg" aria-hidden="true">
            <MapBackdrop />
            <path d={D_PATH} className="vtl-d-route-halo" />
            <path d={D_PATH} className="vtl-d-route" />
            <path d={D_PATH} ref={trailRef} className="vtl-d-trail" style={{ strokeDasharray: D_TOTAL, strokeDashoffset: D_TOTAL }} />
            <circle cx={sx} cy={sy} r="9" fill="#fff" stroke="#3f6fb8" strokeWidth="4" />
            {D_STOPS.map((s, k) => {
              const [x, y] = D_ROUTE[s.at]
              return <circle key={s.title} cx={x} cy={y} r={k === 3 ? 13 : 10} className={`vtl-d-stop${stop >= k ? ' vtl-d-stop-on' : ''}`} />
            })}
            <g ref={dotRef} transform={`translate(${sx} ${sy})`}>
              <circle r="24" className="vtl-d-dot-halo" />
              <circle r="11" fill="#3f6fb8" stroke="#fff" strokeWidth="4" />
            </g>
          </svg>

          <div className="vtl-d-banner">
            <span className="vtl-d-turn" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 20V11a3 3 0 0 1 3-3h9" /><path d="m14 4 4 4-4 4" /></svg>
            </span>
            <span className="vtl-d-banner-txt">
              <small>{arrived ? 'You have arrived' : 'Next'}</small>
              <b key={arrived ? 'done' : next.title} className="vtl-fade">{arrived ? 'Level 2 · Practitioner' : next.title}</b>
            </span>
          </div>

          {D_STOPS.map((s, k) => {
            const [x, y] = D_ROUTE[s.at]
            const state = stop === k ? 'on' : stop > k ? 'past' : 'off'
            return (
              <div key={s.title} className={`vtl-d-bubble vtl-d-bubble-${state}${k === 3 ? ' vtl-d-bubble-left' : ''}`} style={{ left: `${x / 10}%`, top: `${y / 5.6}%` }}>
                <span className="vtl-d-kind">{s.kind}</span>
                <b>{s.title}</b>
                <small>{s.why}</small>
              </div>
            )
          })}

          <div className="vtl-d-eta">
            <span><b>{arrived ? 'Arrived' : `${D_STOPS.length - 1 - Math.max(stop, 0)} stops`}</b>{arrived ? ' at Level 2' : ' to Level 2'}</span>
            <span className="vtl-d-eta-bar"><i style={{ transform: `scaleX(${(stop + 1) / D_STOPS.length})` }} /></span>
          </div>
        </div>
        <div className="vtl-d-mobile" aria-live="polite">
          {current ? (
            <div key={current.title} className="vtl-fade">
              <span className="vtl-d-kind">{current.kind}</span>
              <b>{current.title}</b>
              <small>{current.why}</small>
            </div>
          ) : <div><span className="vtl-d-kind">Starting out</span><b>You, today</b><small>Leland is watching for the first moment to help.</small></div>}
        </div>
      </div>
    </section>
  )
}

/* E: one line to install ----------------------------------------------- */
const E_CMD = 'claude mcp add leland'
const E_OUT = [
  { t: 'Adding MCP server “leland”…', dim: true },
  { t: '✓ Signed in with SSO · Acme Inc.' },
  { t: '✓ Connected · 214 skills available for Sales' },
  { t: '✓ Roadmap synced · Level 2 Practitioner' },
]

function useTerminal(active, reduced) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!active) return
    if (reduced) { setStep(2 + E_OUT.length); return }
    const plan = [700, E_CMD.length * 60 + 450, 650, 600, 550, 550, 5200]
    let i = 0
    let t
    const run = () => {
      t = setTimeout(() => {
        i = (i + 1) % plan.length
        setStep(i)
        run()
      }, plan[i])
    }
    run()
    return () => clearTimeout(t)
  }, [active, reduced])
  return step
}

function VariantE() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const step = useTerminal(inView, reduced)
  const typed = useTypewriter(E_CMD, step >= 1, 60)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(E_CMD).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <section className="vk-sec vtl-e" ref={ref}>
      <div className="vtl-e-glow" aria-hidden="true" />
      <div className="vk-wrap vtl-e-grid">
        <div className="vtl-e-text">
          <Head
            dark
            eyebrow="For IT and admins"
            title="One line to install. No new app to learn."
            sub="Connect Leland to the AI tools you already approved. People keep working where they are, and Leland shows up with the right skill."
          />
          <ul className="vtl-e-list">
            <li><ToolIcon name="Claude" size={38} /><span><b>Claude and Claude Code</b> via MCP</span></li>
            <li><ToolIcon name="ChatGPT" size={38} /><span><b>ChatGPT</b> as a connector</span></li>
            <li><ToolIcon name="Copilot" size={38} /><span><b>Microsoft Copilot</b> as an agent</span></li>
          </ul>
          <p className="vtl-e-fine">SSO, SCIM and admin controls included.</p>
        </div>

        <div className="vtl-e-panels">
          <div className="vtl-e-code">
            <div className="vtl-e-code-bar">
              <span className="vtl-e-tab vtl-e-tab-on">Claude Code</span>
              <span className="vtl-e-tab">Desktop</span>
              <span className="vtl-e-tab">ChatGPT</span>
            </div>
            <div className="vtl-e-code-body">
              <code>
                <span className="vtl-tk-c">claude</span> <span className="vtl-tk-k">mcp add</span> <span className="vtl-tk-s">leland</span>
              </code>
              <button className={`vtl-e-copy${copied ? ' vtl-e-copied' : ''}`} onClick={handleCopy} aria-label="Copy command">
                <span className="vtl-e-copy-a">Copy</span>
                <span className="vtl-e-copy-b">✓ Copied</span>
              </button>
            </div>
          </div>

          <div className="vtl-e-term">
            <div className="vtl-e-term-bar"><span /><span /><span /><em>zsh · priya@acme</em></div>
            <div className="vtl-e-term-body">
              <div><span className="vtl-e-prompt">~ $</span> {step >= 1 ? typed : ''}{step < 2 ? <i className="vtl-caret vtl-caret-light" /> : null}</div>
              {E_OUT.map((l, k) => (step >= 2 + k ? (
                <div key={k} className={`vtl-e-line${l.dim ? ' vtl-e-dim' : ''}`}>{l.t}</div>
              ) : null))}
              {step >= 2 + E_OUT.length ? <div className="vtl-e-line"><span className="vtl-e-prompt">~ $</span> <i className="vtl-caret vtl-caret-light" /></div> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default { A: VariantA, B: VariantB, C: VariantC, D: VariantD, E: VariantE }
