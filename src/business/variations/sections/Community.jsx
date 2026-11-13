import React, { useEffect, useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { motion } from 'motion/react'
import { Head, Avatar, useInView, useCycle, CountUp, EASE_OUT } from '../kit'
import { BUILDS, PEOPLE, buildImg, BOOK_DEMO_URL } from '../data'
import './community.css'

const ROLE_COLOR = {
  Sales: '#7BA4E0',
  Operations: '#A8C3A0',
  Marketing: '#F5C84B',
  Finance: '#E5C9A8',
  Support: '#C7B6E6',
  Product: '#F0A486',
  People: '#9CCFC2',
  Data: '#5E6E79',
  Education: '#D8CFBE',
}
const initials = (name) => name.split(' ').map((w) => w[0]).join('').replace('.', '').slice(0, 2).toUpperCase()
const byId = (id) => BUILDS.find((b) => b.id === id)

function Initials({ name, role, size = 28 }) {
  return (
    <span className="vc-ini" style={{ width: size, height: size, background: ROLE_COLOR[role] || '#ddd', fontSize: size * 0.38 }}>
      {initials(name)}
    </span>
  )
}

function Verified() {
  return (
    <span className="vc-verified">
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
        <path d="M8 1l1.8 1.3 2.2-.1.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.1L8 15l-1.8-1.3-2.2.1-.7-2.1-1.8-1.3.7-2.1-.7-2.1 1.8-1.3.7-2.1 2.2.1z" fill="currentColor" />
        <path d="M5.5 8.2l1.7 1.7 3.4-3.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified
    </span>
  )
}

/* ------------------------------------------------------------------ A */
/* The library: every spine is a real build; hover pulls a book out. */

const SHELVES = [BUILDS.slice(0, 8), BUILDS.slice(8, 16)]
// Deterministic spine sizes so prerender matches the client.
const spineW = (i) => 52 + ((i * 37) % 5) * 6
const spineH = (i) => 78 + ((i * 53) % 4) * 7

function CommunityA() {
  const [ref, inView] = useInView()
  const [hover, setHover] = useState(null)
  const [auto] = useCycle(BUILDS.length, 2400, inView && hover === null)
  const activeId = hover ?? BUILDS[auto].id
  const b = byId(activeId)
  return (
    <section className="vk-sec vc-a" ref={ref}>
      <div className="vk-wrap">
        <Head
          eyebrow="The build library"
          title="See what people in your role have already built"
          sub="Every book on the shelf is a real build from a real member. Find one for your job, copy what works, and start ahead."
        />
        <div className="vc-a-grid">
          <div className="vc-a-case" onMouseLeave={() => setHover(null)}>
            {SHELVES.map((shelf, si) => (
              <div className="vc-a-shelf" key={si}>
                <div className="vc-a-books">
                  {shelf.map((bk, j) => {
                    const i = si * 8 + j
                    const on = bk.id === activeId
                    return (
                      <button
                        type="button"
                        key={bk.id}
                        className={`vc-a-spine${on ? ' is-on' : ''}`}
                        style={{ width: spineW(i), height: `${spineH(i)}%`, background: ROLE_COLOR[bk.role] }}
                        onMouseEnter={() => setHover(bk.id)}
                        onFocus={() => setHover(bk.id)}
                        onBlur={() => setHover(null)}
                        aria-label={bk.title}
                      >
                        <span className="vc-a-spine-t">{bk.title}</span>
                        <span className="vc-a-spine-r">{bk.role.slice(0, 3)}</span>
                      </button>
                    )
                  })}
                  {si === 0 ? <span className="vc-a-end" aria-hidden /> : <span className="vc-a-plant" aria-hidden><i /><i /><i /></span>}
                </div>
                <div className="vc-a-board" />
              </div>
            ))}
            <div className="vc-a-legend">
              {Object.keys(ROLE_COLOR).slice(0, 7).map((r) => (
                <span key={r}><i style={{ background: ROLE_COLOR[r] }} />{r}</span>
              ))}
            </div>
          </div>
          <article className="vc-a-preview" aria-live="polite">
            <div className="vc-a-cover" key={b.id}>
              <img src={buildImg(b.id)} alt="" loading="lazy" />
            </div>
            <div className="vc-a-meta">
              <div className="vc-a-tags">
                <span className="vc-role" style={{ background: ROLE_COLOR[b.role] }}>{b.role}</span>
                <Verified />
              </div>
              <h3 key={`t${b.id}`}>{b.title}</h3>
              <div className="vc-a-by">
                <Initials name={b.author} role={b.role} />
                <span><b>{b.author}</b> · {b.tool} · {b.hours}h to build</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ B */
/* Binoculars: a two-lens mask drifts over a blurred wall of builds. */

const WALL = [...BUILDS, BUILDS[0], BUILDS[3]]

function useBinoculars(stageRef, active) {
  useEffect(() => {
    const el = stageRef.current
    if (!el || !active) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let w = el.clientWidth
    let h = el.clientHeight
    const pos = { x: w * 0.5, y: h * 0.5 }
    let target = null
    const set = () => {
      el.style.setProperty('--bx', `${pos.x}px`)
      el.style.setProperty('--by', `${pos.y}px`)
    }
    set()
    if (reduced) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      target = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { target = null }
    const onResize = () => { w = el.clientWidth; h = el.clientHeight }
    if (fine) {
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
    }
    window.addEventListener('resize', onResize)
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const s = (t - t0) / 1000
      const goal = target || {
        x: w * 0.5 + w * 0.32 * Math.sin(s * 0.42),
        y: h * 0.5 + h * 0.22 * Math.sin(s * 0.71 + 0.6),
      }
      pos.x += (goal.x - pos.x) * (target ? 0.16 : 0.06)
      pos.y += (goal.y - pos.y) * (target ? 0.16 : 0.06)
      set()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [stageRef, active])
}

function Wall({ className }) {
  return (
    <div className={`vc-b-wall ${className}`}>
      {WALL.map((b, i) => (
        <figure key={i} className="vc-b-tile">
          <img src={buildImg(b.id)} alt="" loading="lazy" />
          <figcaption><span className="vc-role" style={{ background: ROLE_COLOR[b.role] }}>{b.role}</span>{b.title}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function CommunityB() {
  const [ref, inView] = useInView({ rootMargin: '0px' })
  const stageRef = useRef(null)
  useBinoculars(stageRef, inView)
  return (
    <section className="vk-sec vk-bg-dark vc-b" ref={ref}>
      <div className="vk-wrap">
        <Head
          dark
          align="center"
          eyebrow="Look over the fence"
          title="See exactly what your peers are building"
          sub="Thousands of real builds from people in your role and industry. Stop guessing what good looks like."
        />
      </div>
      <div className="vc-b-stage" ref={stageRef}>
        <Wall className="vc-b-blur" />
        <Wall className="vc-b-sharp" />
        <div className="vc-b-rim" aria-hidden><i /><i /><b /></div>
        <span className="vc-b-hint">Move your cursor to look around</span>
      </div>
      <div className="vk-wrap vc-b-cta">
        <a className="vk-btn vk-btn-blue" href={BOOK_DEMO_URL}>Book a demo</a>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ C */
/* Build carousel: two rows of real build cards, opposite directions. */

function BuildCard({ b }) {
  return (
    <article className="vc-card">
      <div className="vc-card-shot"><img src={buildImg(b.id)} alt="" loading="lazy" /></div>
      <div className="vc-card-body">
        <div className="vc-card-tags">
          <span className="vc-role" style={{ background: ROLE_COLOR[b.role] }}>{b.role}</span>
          <Verified />
        </div>
        <b className="vc-card-title">{b.title}</b>
        <div className="vc-card-by">
          <Initials name={b.author} role={b.role} size={24} />
          <span>{b.author}</span>
          <em>{b.tool}</em>
        </div>
      </div>
    </article>
  )
}

function CommunityC() {
  const rowA = BUILDS.filter((_, i) => i % 2 === 0)
  const rowB = BUILDS.filter((_, i) => i % 2 === 1)
  return (
    <section className="vk-sec vk-bg-wash vc-c">
      <div className="vk-wrap">
        <Head
          align="center"
          eyebrow="Community builds"
          title="A head start for every role"
          sub="Real builds from practitioners and from every customer's team. Filter by role, open one, and make it yours."
        />
      </div>
      <div className="vc-c-rows">
        <Marquee speed={32} pauseOnHover autoFill gradient gradientColor="#eef3fc" gradientWidth={80}>
          {rowA.map((b) => <BuildCard key={b.id} b={b} />)}
        </Marquee>
        <Marquee speed={32} direction="right" pauseOnHover autoFill gradient gradientColor="#eef3fc" gradientWidth={80}>
          {rowB.map((b) => <BuildCard key={b.id} b={b} />)}
        </Marquee>
      </div>
      <div className="vc-c-cta">
        <a className="vk-btn vk-btn-dark" href={BOOK_DEMO_URL}>Browse the library</a>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ D */
/* Who built what: a directory of company · person · build · time saved. */

// Sample rows for layout only. Company names are fictional on purpose: never pair
// real customer logos with invented people or builds.
const DIRECTORY = [
  { logo: 'Northwind', person: 0, build: 22, saved: 6, group: 'Sales' },
  { logo: 'Brightline', person: 2, build: 16, saved: 4, group: 'Operations' },
  { logo: 'Halcyon', person: 5, build: 21, saved: 5, group: 'Marketing' },
  { logo: 'Meridian', person: 14, build: 10, saved: 7, group: 'Finance' },
  { logo: 'Fieldstone', person: 1, build: 17, saved: 9, group: 'People' },
  { logo: 'Oakridge', person: 6, build: 24, saved: 8, group: 'Sales' },
  { logo: 'Lumen', person: 3, build: 9, saved: 4, group: 'Finance' },
  { logo: 'Acme', person: 9, build: 23, saved: 5, group: 'Operations' },
]
const GROUPS = ['All', 'Sales', 'Operations', 'Finance', 'Marketing', 'People']

function useRoleFilter() {
  const [group, setGroup] = useState('All')
  const rows = group === 'All'
    ? DIRECTORY
    : [...DIRECTORY.filter((r) => r.group === group), ...DIRECTORY.filter((r) => r.group !== group)]
  return { group, setGroup, rows }
}

function CommunityD() {
  const [ref, inView] = useInView()
  const { group, setGroup, rows } = useRoleFilter()
  return (
    <section className="vk-sec vk-bg-white" ref={ref}>
      <div className="vk-wrap">
        <div className="vc-d-top">
          <Head
            eyebrow="Who built what"
            title="Your peers are already shipping"
            sub="Leaders and operators at companies like yours share what they built and how much time it gives back."
          />
          <div className="vc-d-filters" role="tablist" aria-label="Filter by role">
            {GROUPS.map((g) => (
              <button key={g} type="button" role="tab" aria-selected={group === g} className={`vc-d-filter${group === g ? ' is-on' : ''}`} onClick={() => setGroup(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="vc-d-table">
          <div className="vc-d-head">
            <span>Company</span><span>Built by</span><span>What they built</span><span>Time saved</span>
          </div>
          <ul className="vc-d-list">
            {rows.map((r, i) => {
              const p = PEOPLE[r.person]
              const b = byId(r.build)
              const dim = group !== 'All' && r.group !== group
              return (
                <motion.li key={r.logo} layout transition={{ duration: 0.45, ease: EASE_OUT }} className={`vc-d-row${dim ? ' is-dim' : ''}`}>
                  <div className={`vc-d-inner${inView ? ' is-in' : ''}`} style={{ transitionDelay: inView && group === 'All' ? `${i * 70}ms` : '0ms' }}>
                    <span className="vc-d-logo vc-d-wordmark"><i aria-hidden="true">{r.logo[0]}</i>{r.logo}</span>
                    <span className="vc-d-person">
                      <Avatar img={p.img} size={40} />
                      <span><b>{p.name}</b><em>{p.role}</em></span>
                    </span>
                    <span className="vc-d-build">
                      <img src={buildImg(b.id)} alt="" loading="lazy" />
                      <span>{b.title}</span>
                    </span>
                    <span className="vc-d-saved"><b>[{r.saved}h]</b><em>per week</em></span>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>
        <p className="vc-note">Sample rows with fictional companies. Swap in real customers (logo, person, build, hours) once they approve.</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ E */
/* Spotlight reel: stories-style player that auto-advances. */

const REEL = [22, 21, 17, 9, 19, 25].map(byId)
const REEL_MS = 5000

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  return reduced
}

function CommunityE() {
  const [ref, inView] = useInView()
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const b = REEL[i]
  const next = () => setI((x) => (x + 1) % REEL.length)
  const prev = () => setI((x) => (x - 1 + REEL.length) % REEL.length)
  const running = inView && !reduced
  return (
    <section className="vk-sec vk-bg-slate vc-e" ref={ref}>
      <div className="vk-wrap vc-e-grid">
        <div className="vc-e-copy">
          <Head
            dark
            eyebrow="Build spotlight"
            title="Real builds, shipped by real people"
            sub="Every week we spotlight what members built, so the next person can remix it in an afternoon."
          />
          <div className="vc-e-stats" key={b.id}>
            <h3>{b.title}</h3>
            <dl>
              <div><dt>Hours to build</dt><dd><CountUp to={b.hours} start={inView} duration={700} /></dd></div>
              <div><dt>Remixes</dt><dd>[<CountUp to={b.hours * 23 + 11} start={inView} duration={900} />]</dd></div>
              <div><dt>Built with</dt><dd className="vc-e-tool">{b.tool}</dd></div>
            </dl>
            <div className="vc-e-by">
              <Initials name={b.author} role={b.role} size={32} />
              <span><b>{b.author}</b> · {b.role}</span>
              <Verified />
            </div>
          </div>
        </div>

        <div
          className={`vc-e-player${paused ? ' is-paused' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="vc-e-bars">
            {REEL.map((r, k) => (
              <span key={r.id} className="vc-e-bar">
                <i
                  key={k === i ? `run-${i}` : `idle-${k}`}
                  className={k < i ? 'is-done' : k === i && running ? 'is-run' : ''}
                  style={{ animationDuration: `${REEL_MS}ms` }}
                  onAnimationEnd={k === i ? next : undefined}
                />
              </span>
            ))}
          </div>
          <div className="vc-e-head">
            <Initials name={b.author} role={b.role} size={30} />
            <span><b>{b.author}</b> {b.role}</span>
            <em>{i + 1} / {REEL.length}</em>
          </div>
          <div className="vc-e-media">
            {REEL.map((r, k) => (
              <img
                key={r.id}
                src={buildImg(r.id)}
                alt={k === i ? r.title : ''}
                className={`vc-e-img${k === i ? ' is-on' : ''}${k === i && running ? ' is-zoom' : ''}`}
                loading="lazy"
              />
            ))}
          </div>
          <button type="button" className="vc-e-tap vc-e-tap-l" onClick={prev} aria-label="Previous build" />
          <button type="button" className="vc-e-tap vc-e-tap-r" onClick={next} aria-label="Next build" />
        </div>
      </div>
    </section>
  )
}

export default { A: CommunityA, B: CommunityB, C: CommunityC, D: CommunityD, E: CommunityE }
