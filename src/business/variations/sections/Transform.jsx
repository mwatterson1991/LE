import React, { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { Head, Window, Avatar, useInView, useCycle, Pill } from '../kit'
import { INSTRUCTORS, TOOLS, SESSIONS, BUILDS, LEVELS, buildImg, asset, BOOK_DEMO_URL } from '../data'
import './transform.css'

const GRADIENT_VIDEO = asset('images/Animated%20Gradient%20-%2006.mp4')
const CODING_VIDEO = asset('videos/coding-1.mp4')
const build = (id) => BUILDS.find((b) => b.id === id)

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden>
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ------------------------------------------------------------------ A */
/* Inside a lesson: the real course UI, progress check walking the list. */

const LESSONS = [
  'Introduction',
  'Your AI Playbook',
  'How an LLM works',
  'Research a topic you care about',
  'Turn your research into a brief',
  'Build something you can share',
  'Reflect',
  'Next lesson',
]
const LESSON_MS = 3200

function TransformA() {
  const [ref, inView] = useInView()
  // Walk the "current" lesson from 1 to 5, then loop.
  const [k] = useCycle(5, LESSON_MS, inView)
  const current = k + 1
  return (
    <section className="vk-sec vk-bg-tint" ref={ref}>
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="AI Builder Program"
          title="Change how people work, not just what they know"
          sub="Short lessons from practitioners, then a real build every week. People finish with things they made, not certificates."
        />
        <Window url="ai.joinleland.com/foundations/lesson-1" className="vt-a-window">
          <div className="vt-a-app">
            <aside className="vt-a-side">
              <span className="vt-a-course">AI Foundations</span>
              <b className="vt-a-lesson">Lesson 1 · AI Basics · 90m</b>
              <div className="vt-a-progress"><i style={{ transform: `scaleX(${current / LESSONS.length})` }} /></div>
              <ol className="vt-a-list">
                {LESSONS.map((l, i) => {
                  const state = i < current ? 'done' : i === current ? 'now' : 'todo'
                  return (
                    <li key={l} className={`vt-a-item is-${state}`}>
                      <span className="vt-a-dot">{state === 'done' ? <Check /> : null}</span>
                      <span>{l}</span>
                    </li>
                  )
                })}
              </ol>
            </aside>
            <div className="vt-a-main">
              <span className="vt-a-crumb">Lesson 1 · AI Basics</span>
              <h3 key={current} className="vt-a-title">{LESSONS[current]}</h3>
              <div className="vt-a-player">
                <video className="vt-a-bg" src={GRADIENT_VIDEO} autoPlay muted loop playsInline aria-hidden />
                <div className="vt-a-slide">
                  <span>Part {current + 1} of 8</span>
                  <b key={current}>{LESSONS[current]}</b>
                </div>
                <div className="vt-a-pip">
                  <Avatar img={INSTRUCTORS[0].img} size={92} />
                </div>
                <div className="vt-a-controls">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden><path d="M4 2.5v11l9-5.5z" fill="#fff" /></svg>
                  <div className="vt-a-scrub"><i key={current} className={inView ? 'is-run' : ''} /></div>
                  <span>{String(current * 3 + 2).padStart(2, '0')}:14</span>
                </div>
              </div>
              <div className="vt-a-foot">
                <div className="vt-a-teacher">
                  <Avatar img={INSTRUCTORS[0].img} size={36} />
                  <div><b>{INSTRUCTORS[0].name}</b><span>{INSTRUCTORS[0].role}</span></div>
                </div>
                <span className="vt-a-next">Next <span aria-hidden>→</span></span>
              </div>
            </div>
          </div>
        </Window>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ B */
/* Level path: five AIBP-style covers; a marker walks the path. */

const COVERS = [
  { color: '#E5C9A8', ink: '#3b2a17', course: 'Foundations', build: 'Your personal AI playbook' },
  { color: '#7BA4E0', ink: '#14294d', course: 'Everyday AI', build: 'A research brief you can share' },
  { color: '#F5C84B', ink: '#3d2c00', course: 'Workflows', build: 'Your first automation' },
  { color: '#A8C3A0', ink: '#1d3318', course: 'Agents', build: 'An agent your team uses' },
  { color: '#5E6E79', ink: '#ffffff', course: 'AI systems', build: 'A system for your function' },
]

function Cover({ level, color, ink, course, className = '' }) {
  const id = `vt-stripe-${level}`
  return (
    <div className={`vt-cover ${className}`} style={{ background: color, color: ink }}>
      <svg className="vt-cover-l" viewBox="0 0 200 260" aria-hidden>
        <defs>
          <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
            <rect width="11" height="22" fill={ink} fillOpacity={ink === "#ffffff" ? 0.3 : 0.2} />
          </pattern>
          <clipPath id={`${id}-c`}>
            <path d="M84 0h62v176h54v84H84z" />
          </clipPath>
        </defs>
        <rect width="200" height="260" fill={`url(#${id})`} clipPath={`url(#${id}-c)`} />
      </svg>
      <span className="vt-cover-brand">AI Builder Program</span>
      <span className="vt-cover-meta">
        <em>Level {level}</em>
        <b>{course}</b>
      </span>
    </div>
  )
}

function TransformB() {
  const [ref, inView] = useInView()
  const [active, setActive] = useCycle(5, 2400, inView)
  return (
    <section className="vk-sec vk-bg-white" ref={ref}>
      <div className="vk-wrap">
        <Head
          eyebrow="Five levels"
          title="A plan with levels you earn"
          sub="Like a great gym program: everyone starts where they are, and each level ends with something real you built."
        />
        <div className="vt-b-scroll">
          <div className="vt-b-track">
            <div className="vt-b-covers">
              {COVERS.map((c, i) => (
                <button
                  type="button"
                  key={c.course}
                  className={`vt-b-item${active === i ? ' is-on' : ''}${i < active ? ' is-past' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Level ${i}: ${c.course}`}
                >
                  <Cover level={i} {...c} />
                  <span className="vt-b-name">L{i} · {LEVELS[i].name}</span>
                  <span className="vt-b-build">You build: {c.build}</span>
                </button>
              ))}
            </div>
            <div className="vt-b-path">
              <span className="vt-b-line"><i style={{ transform: `scaleX(${active / 4})` }} /></span>
              {COVERS.map((c, i) => (
                <span key={i} className={`vt-b-dot${i <= active ? ' is-on' : ''}`} style={{ left: `${(i + 0.5) * 20}%` }} />
              ))}
              <span className="vt-b-marker" style={{ transform: `translateX(${active * 100}%)` }}>
                <span className="vt-b-you">
                  <Avatar img="pic-05" size={22} />
                  You are here
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ C */
/* This week, live: calendar strip + next session with attendees joining. */

const STRIP = [
  ['Mon', 13], ['Tue', 14], ['Wed', 15], ['Thu', 16], ['Fri', 17],
  ['Mon', 20], ['Tue', 21], ['Wed', 22], ['Thu', 23], ['Fri', 24],
]
const SESSION_TEACHER = [0, 1, 2, 0]
const ATTENDEES = ['pic-02', 'pic-09', 'pic-06', 'pic-11', 'pic-04', 'pic-13', 'pic-08', 'pic-15']

function useJoining(count, active) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(count); return }
    let i = 0
    const t = setInterval(() => {
      i += 1
      setN(i)
      if (i >= count) clearInterval(t)
    }, 520)
    return () => clearInterval(t)
  }, [count, active])
  return n
}

function TransformC() {
  const [ref, inView] = useInView()
  const joined = useJoining(ATTENDEES.length, inView)
  const live = SESSIONS[0]
  const t = INSTRUCTORS[SESSION_TEACHER[0]]
  return (
    <section className="vk-sec vk-bg-wash" ref={ref}>
      <div className="vk-wrap">
        <div className="vt-c-top">
          <Head
            eyebrow="Live, every week"
            title="Taught live by people who build"
            sub="Practitioners teach live sessions every week. Your people ask questions, build along, and leave with it working."
          />
          <a className="vk-link" href={BOOK_DEMO_URL}>See the full calendar</a>
        </div>

        <div className="vt-c-strip" role="list">
          {STRIP.map(([d, n]) => {
            const s = SESSIONS.find((x) => x.date === n)
            return (
              <div key={n} role="listitem" className={`vt-c-day${s ? ' has' : ''}${n === live.date ? ' is-live' : ''}`}>
                <span>{d}</span>
                <b>{n}</b>
                <i />
              </div>
            )
          })}
        </div>

        <div className="vt-c-grid">
          <article className="vt-c-live">
            <div className="vt-c-livehead">
              <span className="vt-c-badge"><span className="vk-live-dot" /> Live now</span>
              <span className="vt-c-when">{live.day} {live.date} · 12:00 PM ET</span>
            </div>
            <h3>{live.title}</h3>
            <div className="vt-c-host">
              <Avatar img={t.img} size={44} />
              <div><b>{t.name}</b><span>{t.role}</span></div>
              <Pill tone="dark">Level {live.level}</Pill>
            </div>
            <div className="vt-c-join">
              <div className="vt-c-stack">
                {ATTENDEES.map((a, i) => (
                  <span key={a} className={`vt-c-att${i < joined ? ' is-in' : ''}`} style={{ zIndex: 20 - i }}>
                    <Avatar img={a} size={34} />
                  </span>
                ))}
              </div>
              <span className="vt-c-count">{joined > 0 ? `${joined * 17 + 3} joined [sample]` : 'Starting'}</span>
              <a className="vk-btn vk-btn-blue vt-c-btn" href={BOOK_DEMO_URL}>Join session</a>
            </div>
          </article>
          {SESSIONS.slice(1).map((s, i) => {
            const it = INSTRUCTORS[SESSION_TEACHER[i + 1]]
            return (
              <article key={s.title} className="vt-c-card" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="vt-c-date"><span>{s.day}</span><b>{s.date}</b></div>
                <h4>{s.title}</h4>
                <div className="vt-c-meta">
                  <Avatar img={it.img} size={28} />
                  <span>{it.name}</span>
                  <Pill tone="blue">L{s.level}</Pill>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ D */
/* Reps, every week: a deck of real builds dealt forward on a timer. */

const WEEKS = [
  { wk: 1, skill: 'Research and analyze', id: 7 },
  { wk: 2, skill: 'Turn data into answers', id: 15 },
  { wk: 3, skill: 'Automate a workflow', id: 3 },
  { wk: 4, skill: 'Ship your first agent', id: 23 },
  { wk: 5, skill: 'Build a dashboard', id: 18 },
  { wk: 6, skill: 'Ship a real tool', id: 17 },
]

function TransformD() {
  const [ref, inView] = useInView()
  const [top, setTop] = useCycle(WEEKS.length, 2800, inView)
  const prev = (top - 1 + WEEKS.length) % WEEKS.length
  return (
    <section className="vk-sec vk-bg-white" ref={ref}>
      <div className="vk-wrap vt-d-grid">
        <div>
          <Head
            eyebrow="Reps, every week"
            title="Every week ends with something built"
            sub="No passive watching. Each week has a build, a coach who reviews it, and a gallery where it lives."
          />
          <ol className="vt-d-weeks">
            {WEEKS.map((w, i) => (
              <li key={w.wk}>
                <button type="button" className={`vt-d-week${i === top ? ' is-on' : ''}${i < top ? ' is-done' : ''}`} onClick={() => setTop(i)}>
                  <span className="vt-d-wk">Week {w.wk}</span>
                  <span>{w.skill}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="vt-d-deck">
          {WEEKS.map((w, i) => {
            const order = (i - top + WEEKS.length) % WEEKS.length
            const b = build(w.id)
            return (
              <article
                key={w.wk}
                className={`vt-d-card${i === prev && inView ? ' is-leaving' : ''}`}
                style={{
                  zIndex: 10 - order,
                  opacity: order > 3 ? 0 : 1,
                  transform: `translateY(${order * -18}px) scale(${1 - order * 0.05})`,
                }}
                aria-hidden={order !== 0}
              >
                <div className="vt-d-cardhead">
                  <Pill tone="yellow">Week {w.wk}</Pill>
                  <span>{b.tool}</span>
                </div>
                <div className="vt-d-shot"><img src={buildImg(b.id)} alt="" loading="lazy" /></div>
                <div className="vt-d-cardfoot">
                  <b>{b.title}</b>
                  <span>{b.author} · {b.role} · built in {b.hours}h</span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ E */
/* Taught by builders: big screen recording, instructor chips, tool marquee. */

function TransformE() {
  const [ref, inView] = useInView()
  const [now] = useCycle(INSTRUCTORS.length, 2600, inView)
  return (
    <section className="vk-sec vk-bg-dark vt-e" ref={ref}>
      <div className="vk-wrap">
        <Head
          dark
          align="center"
          eyebrow="Taught by builders"
          title="Learn from people who ship with AI every day"
          sub="Every session is hands-on: real tools, real screens, real work. Not slides about the future."
        />
        <div className="vt-e-frame">
          <div className="vt-e-bar">
            <span /><span /><span />
            <em><span className="vk-live-dot" /> Live session · {SESSIONS[3].title}</em>
          </div>
          <div className="vt-e-video">
            <video src={CODING_VIDEO} autoPlay muted loop playsInline aria-label="Screen recording of an instructor building with Claude Code" />
            <div className="vt-e-chips">
              {INSTRUCTORS.map((p, i) => (
                <div key={p.img} className={`vt-e-chip${now === i ? ' is-on' : ''}`}>
                  <Avatar img={p.img} size={40} />
                  <div>
                    <b>{p.name}</b>
                    <span>{now === i ? 'Teaching now' : p.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="vt-e-label">Hands-on with the tools your team already has</p>
      </div>
      <div className="vt-e-marquee">
        <Marquee speed={36} gradient gradientColor="#161616" gradientWidth={120} autoFill>
          {TOOLS.map((tool) => (
            <span key={tool.name} className={`vt-e-tool vt-e-tool-${tool.name.toLowerCase()}`}>
              <img src={asset(tool.src)} alt={tool.name === 'n8n' ? 'n8n' : ''} />
              {tool.name === 'n8n' ? null : tool.name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}

export default { A: TransformA, B: TransformB, C: TransformC, D: TransformD, E: TransformE }
