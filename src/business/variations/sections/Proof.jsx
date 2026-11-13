import React, { useEffect, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { Head, Avatar, useInView, useCycle, CountUp } from '../kit'
import { PEOPLE, LOGOS, logoSrc, asset, BOOK_DEMO_URL } from '../data'
import { usePledgeData } from '../../../pledgeData'
import './proof.css'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** A number that keeps creeping up while `active`, in a fixed (deterministic) rhythm. */
function useLiveIncrement(active, ms = 1100, pattern = [1, 2, 1, 3, 1, 1, 2]) {
  const [extra, setExtra] = useState(0)
  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    let k = 0
    const t = setInterval(() => {
      const step = pattern[k % pattern.length]
      k += 1
      setExtra((n) => n + step)
    }, ms)
    return () => clearInterval(t)
  }, [active, ms]) // eslint-disable-line react-hooks/exhaustive-deps
  return extra
}

/* ------------------------------------------------------------------ A */
// Today's orange 100M Pledge band: live counter + growth chart.

function PledgeChart({ series }) {
  const W = 480, H = 250
  const padL = 6, padR = 6, padT = 16, padB = 26
  const innerW = W - padL - padR, innerH = H - padT - padB
  const maxV = series[series.length - 1].value
  const n = series.length
  const x = (i) => padL + (i / (n - 1)) * innerW
  const y = (v) => padT + innerH * (1 - v / maxV)
  const linePath = 'M' + series.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' L')
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${(padT + innerH).toFixed(1)} L${x(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`
  const fmtK = (v) => (v >= 1000 ? Math.round(v / 1000) + 'k' : String(v))
  const gridVals = [0.25, 0.5, 0.75, 1].map((p) => p * maxV)
  const labelIdx = [0, Math.round((n - 1) * 0.33), Math.round((n - 1) * 0.66), n - 1]
  return (
    <div className="lai-pchart-wrap">
      <svg className="lai-pchart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="People learning AI on Leland, growing every month">
        <defs>
          <linearGradient id="vprPledgeArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0EBE0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F0EBE0" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {gridVals.map((v) => (
          <g key={v}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} className="lai-pchart-grid" />
            <text x={padL + 2} y={y(v) - 6} className="lai-pchart-ylabel">{fmtK(v)}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#vprPledgeArea)" className="vpr-a-area" />
        <path d={linePath} className="lai-pchart-line" pathLength="1" />
        <circle cx={x(n - 1)} cy={y(maxV)} r="6" className="lai-pchart-halo" />
        <circle cx={x(n - 1)} cy={y(maxV)} r="5" className="lai-pchart-dot" />
      </svg>
      <div className="lai-pchart-xlabels">
        {labelIdx.map((i) => <span key={i} style={{ left: `${(x(i) / W) * 100}%` }}>{series[i].month}</span>)}
      </div>
    </div>
  )
}

function ProofA() {
  const { total, series } = usePledgeData()
  const [ref, inView] = useInView()
  return (
    <section className="lai-pledge vpr-a" ref={ref}>
      <div className="lai-container">
        <div className="lai-pledge-grid vpr-a-grid">
          <div className="lai-pledge-left">
            <span className="lai-pledge-label">The 100M Pledge</span>
            <h2 className="lai-pledge-title">We’re on a mission to train 100 million people to build with AI.</h2>
            <div className="vpr-a-stats">
              <div>
                <span className="lai-pledge-number"><CountUp to={total} start={inView} duration={1800} /></span>
                <span className="lai-pledge-sub">people trained</span>
              </div>
              <div>
                <span className="lai-pledge-number">250+</span>
                <span className="lai-pledge-sub">teams transformed</span>
              </div>
            </div>
            <a href="/pledge" className="lai-pledge-cta">See the pledge &rarr;</a>
          </div>
          <div className="vpr-a-chart">
            {inView ? <PledgeChart series={series} /> : <div className="vpr-a-chart-ph" />}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ B */
// Ramp-style logo grid with one featured customer tile; a highlight walks the cells.

const GRID_LOGOS = ['Google', 'JPMorgan Chase', 'Shopify', 'Adobe', 'Bain', 'Salesforce', "McDonald's", 'Nike', 'American Express', 'Figma', 'Morgan Stanley', 'GitLab', 'Cisco', 'LinkedIn']
const HIGHLIGHT_ORDER = [0, 5, 9, 2, 12, 7, 11, 3, 8, 13, 1, 6, 10, 4]

function ProofB() {
  const [ref, inView] = useInView()
  const [step] = useCycle(HIGHLIGHT_ORDER.length, 1500, inView)
  const lit = inView ? HIGHLIGHT_ORDER[step] : -1
  const person = PEOPLE[0]
  return (
    <section className="vk-sec vk-bg-white vpr-b" ref={ref}>
      <div className="vk-wrap">
        <div className="vpr-b-top">
          <Head eyebrow="Customers" title="Trusted by teams at companies you know" sub="People from these companies learn and build on Leland." />
          <a className="vk-link" href={BOOK_DEMO_URL} target="_blank" rel="noreferrer">Read customer stories</a>
        </div>
        <div className="vpr-b-grid">
          <article className="vpr-b-feature">
            <img className="vpr-b-photo" src={asset('images/hero-images/office-placeholder-3.jpg')} alt="" loading="lazy" />
            <div className="vpr-b-shade" />
            <div className="vpr-b-feature-body">
              <span className="vpr-b-chip">[Customer story]</span>
              <div className="vpr-b-metric">
                <b>[6 hrs]</b>
                <span>saved per rep, every week</span>
              </div>
              <p>“[Our reps built their own follow-up agents in the first month. Nobody asks whether AI is worth it anymore.]”</p>
              <div className="vpr-b-person">
                <Avatar img={person.img} size={40} ring />
                <span><b>[Customer name]</b>{person.role}, [Company]</span>
              </div>
            </div>
          </article>
          {GRID_LOGOS.map((name, i) => {
            const l = LOGOS.find((x) => x.name === name)
            return (
              <div key={name} className={`vpr-b-cell${lit === i ? ' is-lit' : ''}${inView ? ' is-in' : ''}`} style={{ '--d': `${i * 40}ms` }}>
                <img src={logoSrc(l)} alt={l.name} style={{ height: Math.min(Math.max(l.h, 22), 30) }} loading="lazy" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ C */
// Testimonials led by a big number. Placeholder quotes until we have real ones.

const QUOTES = [
  { metric: '[6 hrs]', unit: 'saved per rep, every week', quote: '[The sales team stopped asking what AI could do and started shipping their own agents.]', p: 0 },
  { metric: '[82%]', unit: 'of the team at Level 2 or above', quote: '[We finally know who is using AI well, and the roadmap tells everyone what to learn next.]', p: 1 },
  { metric: '[40]', unit: 'builds shipped in one quarter', quote: '[Our ops team automated the reports we used to build by hand every Monday.]', p: 8 },
  { metric: '[3x]', unit: 'faster month-end close', quote: '[Finance went from skeptical to the team everyone copies. The live sessions did that.]', p: 3 },
  { metric: '[1 day]', unit: 'to onboard 300 people', quote: '[Rollout was the easy part. The private cohort kept people building after week one.]', p: 11 },
]

function ProofC() {
  const [ref, inView] = useInView()
  const [paused, setPaused] = useState(false)
  const [i, setI] = useCycle(QUOTES.length, 5200, inView && !paused)
  const go = (k) => setI((k + QUOTES.length) % QUOTES.length)
  return (
    <section className="vk-sec vk-bg-tint vpr-c" ref={ref}>
      <div className="vk-wrap">
        <div className="vpr-c-top">
          <Head eyebrow="Results" title="Teams that did it, in their own numbers" />
          <div className="vpr-c-arrows">
            <button type="button" aria-label="Previous" onClick={() => go(i - 1)}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" aria-label="Next" onClick={() => go(i + 1)}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
        <div className="vpr-c-viewport" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="vpr-c-track" style={{ '--i': i }}>
            {QUOTES.map((q, k) => {
              const person = PEOPLE[q.p]
              return (
                <figure key={q.metric} className={`vpr-c-card${k === i ? ' is-on' : ''}${k < i ? ' is-past' : ''}`} onClick={() => setI(k)}>
                  <div className="vpr-c-metric"><b>{q.metric}</b><span>{q.unit}</span></div>
                  <blockquote>“{q.quote}”</blockquote>
                  <figcaption>
                    <Avatar img={person.img} size={44} />
                    <span><b>{person.name}</b>{person.role}, [Company]</span>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </div>
        <div className="vpr-c-dots" role="tablist">
          {QUOTES.map((q, k) => (
            <button key={q.metric} role="tab" aria-selected={k === i} aria-label={`Story ${k + 1}`} className={k === i ? 'is-on' : ''} onClick={() => setI(k)}>
              <span style={{ animationPlayState: paused || !inView ? 'paused' : 'running' }} key={k === i ? `on-${i}` : 'off'} />
            </button>
          ))}
        </div>
        <p className="vpr-c-note">[Placeholder quotes and sample personas.]</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ D */
// Dotted world map. Land is a coarse hand-written mask: for each 5° latitude
// band, the longitude spans that are land. Dots are sampled on a 3° grid.

const LAND = {
  80: [[-65, -20], [-95, -70], [15, 25], [95, 105]],
  75: [[-120, -80], [-70, -20], [55, 60], [90, 115]],
  70: [[-160, -140], [-135, -70], [-55, -22], [18, 30], [40, 180]],
  65: [[-165, -140], [-140, -62], [-52, -38], [-24, -14], [12, 30], [30, 180]],
  60: [[-165, -140], [-140, -95], [-78, -62], [-48, -42], [5, 30], [30, 165]],
  55: [[-130, -95], [-78, -60], [-6, -1], [8, 12], [20, 160]],
  50: [[-125, -55], [-5, 1], [2, 140]],
  45: [[-124, -60], [-1, 40], [40, 135], [141, 145]],
  40: [[-124, -74], [-9, 3], [9, 18], [20, 45], [54, 122], [126, 129], [139, 142]],
  35: [[-120, -76], [-6, 11], [23, 36], [36, 120], [126, 129], [132, 140]],
  30: [[-115, -81], [-10, 32], [34, 48], [50, 122]],
  25: [[-112, -97], [-81, -80], [-16, 35], [37, 56], [62, 120]],
  20: [[-105, -87], [-84, -75], [-17, 37], [42, 58], [70, 87], [92, 110], [120, 123]],
  15: [[-92, -83], [-17, 40], [43, 52], [74, 80], [97, 109], [120, 125]],
  10: [[-85, -77], [-75, -62], [-15, 51], [76, 80], [98, 106], [122, 126]],
  5: [[-78, -50], [-10, 48], [100, 104], [114, 118]],
  0: [[-80, -48], [9, 43], [98, 106], [109, 119], [120, 125]],
  '-5': [[-81, -35], [12, 40], [102, 115], [132, 150]],
  '-10': [[-78, -36], [13, 40], [110, 125], [130, 150]],
  '-15': [[-75, -39], [12, 40], [45, 50], [124, 145]],
  '-20': [[-70, -40], [13, 35], [44, 49], [114, 149]],
  '-25': [[-70, -47], [15, 33], [44, 47], [113, 153]],
  '-30': [[-71, -51], [17, 31], [115, 153]],
  '-35': [[-72, -57], [18, 26], [116, 123], [135, 150], [173, 175]],
  '-40': [[-73, -62], [145, 148], [172, 178]],
  '-45': [[-74, -66], [167, 171]],
  '-50': [[-75, -68]],
  '-55': [[-71, -66]],
}
const MAP_W = 1000
const MAP_H = 390
const LAT_TOP = 84
const LAT_SPAN = 140
const proj = (lon, lat) => [((lon + 180) / 360) * MAP_W, ((LAT_TOP - lat) / LAT_SPAN) * MAP_H]

function buildDots() {
  const dots = []
  for (let lat = 81; lat >= -56; lat -= 3) {
    const band = LAND[String(Math.max(-55, Math.min(80, Math.round(lat / 5) * 5)))] || []
    for (let lon = -178.5; lon <= 180; lon += 3) {
      if (band.some(([a, b]) => lon >= a && lon <= b)) dots.push(proj(lon, lat))
    }
  }
  return dots
}
const DOTS = buildDots()

const CITIES = [
  { name: 'San Francisco', lon: -122.4, lat: 37.8 }, { name: 'New York', lon: -74, lat: 40.7 },
  { name: 'London', lon: -0.1, lat: 51.5 }, { name: 'Bangalore', lon: 77.6, lat: 13 },
  { name: 'Singapore', lon: 103.8, lat: 1.4 }, { name: 'São Paulo', lon: -46.6, lat: -23.5 },
  { name: 'Toronto', lon: -79.4, lat: 43.7 }, { name: 'Berlin', lon: 13.4, lat: 52.5 },
  { name: 'Sydney', lon: 151.2, lat: -33.9 }, { name: 'Lagos', lon: 3.4, lat: 6.5 },
  { name: 'Tokyo', lon: 139.7, lat: 35.7 }, { name: 'Dubai', lon: 55.3, lat: 25.2 },
  { name: 'Austin', lon: -97.7, lat: 30.3 }, { name: 'Mexico City', lon: -99.1, lat: 19.4 },
  { name: 'Nairobi', lon: 36.8, lat: -1.3 }, { name: 'Madrid', lon: -3.7, lat: 40.4 },
  { name: 'Seoul', lon: 127, lat: 37.5 }, { name: 'Chicago', lon: -87.6, lat: 41.9 },
  { name: 'Johannesburg', lon: 28, lat: -26.2 }, { name: 'Paris', lon: 2.3, lat: 48.9 },
]
const EVENTS = ['finished Level 2', 'shipped a build', 'joined a live session', 'took the assessment', 'reached Level 3']

function ProofD() {
  const { total } = usePledgeData()
  const [ref, inView] = useInView()
  const extra = useLiveIncrement(inView, 900)
  const [ci] = useCycle(CITIES.length, 2100, inView)
  const city = CITIES[ci]
  const [cx, cy] = proj(city.lon, city.lat)
  return (
    <section className="vk-sec vk-bg-dark vpr-d" ref={ref}>
      <div className="vk-wrap">
        <Head dark align="center" eyebrow="Everywhere" title="People are learning on Leland right now" />
        <div className="vpr-d-counter">
          <span className="vpr-d-num">{(total + extra).toLocaleString('en-US')}</span>
          <span className="vpr-d-unit"><i className="vk-live-dot" /> people trained and counting</span>
        </div>
        <div className="vpr-d-map">
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="World map of where people learn on Leland">
            <g className="vpr-d-land">
              {DOTS.map(([x, y]) => <circle key={`${x.toFixed(1)}-${y.toFixed(1)}`} cx={x} cy={y} r="2.6" />)}
            </g>
            {CITIES.map((c, k) => {
              const [x, y] = proj(c.lon, c.lat)
              return (
                <g key={c.name} className="vpr-d-city" style={{ '--d': `${(k * 0.53) % 3.2}s` }}>
                  <circle cx={x} cy={y} r="10" className="vpr-d-ping" />
                  <circle cx={x} cy={y} r="3.6" className="vpr-d-pin" />
                </g>
              )
            })}
          </svg>
          {inView ? (
            <div
              key={ci}
              className={`vpr-d-tip${cx > MAP_W * 0.55 ? ' is-left' : ''}`}
              style={{ left: `${(cx / MAP_W) * 100}%`, top: `${(cy / MAP_H) * 100}%` }}
            >
              <b>Someone in {city.name}</b> {EVENTS[ci % EVENTS.length]}
            </div>
          ) : null}
        </div>
        <div className="vpr-d-stats">
          <div><b>250+</b><span>teams transformed</span></div>
          <div><b>[N]</b><span>countries</span></div>
          <div><b>[N]k</b><span>builds shipped</span></div>
        </div>
        <p className="vpr-d-note">[Pins and activity are illustrative. The counter is the live 100M Pledge total.]</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ E */
// Thin live stat strip between two logo marquees. Digits roll like an odometer.

function Odometer({ value }) {
  const s = value.toLocaleString('en-US')
  return (
    <span className="vpr-odo" aria-label={s}>
      {s.split('').map((ch, k) => {
        // Key from the right so digits keep their identity as the number grows.
        const key = s.length - k
        if (ch < '0' || ch > '9') return <span key={key} className="vpr-odo-sep" aria-hidden="true">{ch}</span>
        return (
          <span key={key} className="vpr-odo-digit" aria-hidden="true">
            <span className="vpr-odo-col" style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
              {'0123456789'.split('').map((d) => <span key={d}>{d}</span>)}
            </span>
          </span>
        )
      })}
    </span>
  )
}

const ROW1 = ['Google', 'JPMorgan Chase', 'Bain', 'Shopify', "McDonald's", 'GitLab', 'Datavant', 'American Express', 'Adobe']
const ROW2 = ['Morgan Stanley', 'Salesforce', 'Nike', 'Cisco', 'Etsy', 'Figma', 'LinkedIn', 'Walmart', 'Miro']

function LogoRow({ names, direction }) {
  return (
    <Marquee speed={30} direction={direction} autoFill pauseOnHover>
      {names.map((n) => {
        const l = LOGOS.find((x) => x.name === n)
        return <span className="vpr-e-logo" key={n}><img src={logoSrc(l)} alt={l.name} style={{ height: Math.min(Math.max(l.h, 20), 28) }} loading="lazy" /></span>
      })}
    </Marquee>
  )
}

function ProofE() {
  const { total } = usePledgeData()
  const [ref, inView] = useInView()
  const people = useLiveIncrement(inView, 1000)
  const builds = useLiveIncrement(inView, 2300, [1, 1, 2, 1])
  const sessions = useLiveIncrement(inView, 5200, [1])
  return (
    <section className="vk-sec vk-bg-white vpr-e" ref={ref}>
      <div className="vk-wrap">
        <p className="vpr-e-kicker">Trusted by people at 250+ companies, including</p>
      </div>
      <div className="vpr-e-row"><LogoRow names={ROW1} direction="left" /></div>
      <div className="vpr-e-strip">
        <div className="vk-wrap vpr-e-stats">
          <div>
            <span className="vpr-e-label"><i className="vk-live-dot" /> People trained</span>
            <Odometer value={total + people} />
          </div>
          <div>
            <span className="vpr-e-label">Builds shipped this week <em>Sample</em></span>
            <Odometer value={1284 + builds} />
          </div>
          <div>
            <span className="vpr-e-label">Live sessions this month <em>Sample</em></span>
            <Odometer value={96 + sessions} />
          </div>
          <div>
            <span className="vpr-e-label">Teams transformed</span>
            <span className="vpr-odo">250+</span>
          </div>
        </div>
      </div>
      <div className="vpr-e-row"><LogoRow names={ROW2} direction="right" /></div>
    </section>
  )
}

export default { A: ProofA, B: ProofB, C: ProofC, D: ProofD, E: ProofE }
