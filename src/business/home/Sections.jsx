import React, { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'motion/react'
import { CountUp } from './fx'
import { usePledgeData } from '../../pledgeData'
import { useRatingsData } from '../../ratingsData'
import { PROOF, PATHS, STORY_AI, DEEP_DIVE, STORY_OTHER, BEYOND, ENTERPRISE, FAQ, FINAL_CTA } from '../content/home'
import { BOOK_DEMO_URL, ASSESSMENT_URL } from '../siteMap'

const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`
const build = (n) => asset(`business/v/builds/build-${String(n).padStart(2, '0')}.webp`)
const person = (f) => asset(`business/v/people/${f}.webp`)
const EASE_OUT = [0.23, 1, 0.32, 1]
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } } }
const reveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' }, variants: fadeUp }
const group = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' }, variants: { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } } }
const child = { variants: fadeUp }
const track = (source) => () => posthog.capture('biz--cta_click', { source })

function Arrow() {
  return <span className="bh-arrow" aria-hidden="true">→</span>
}

/* ---------- 2. Logos + proof ---------- */
export function Proof() {
  const { total } = usePledgeData()
  const { avg, count } = useRatingsData()
  const live = {
    trained: total.toLocaleString('en-US'),
    rating: `${avg.toFixed(1)}★`,
  }
  return (
    <section className="bh-sec bh-proof">
      <div className="bh-wrap">
        <motion.div className="bh-stats" {...group}>
          {PROOF.stats.map((s) => (
            <motion.div className="bh-stat" key={s.label} {...child}>
              <b>{s.key ? live[s.key] : s.value}</b>
              <span>{s.key === 'rating' ? `${s.label}, ${count.toLocaleString('en-US')}+ reviews` : s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- 3. Paths ---------- */
export function PathsA() {
  const ai = PATHS.ai
  return (
    <section className="bh-sec">
      <div className="bh-wrap">
        <motion.div className="bh-head" {...reveal}>
          <h2>{PATHS.title}</h2>
        </motion.div>
        <motion.a href={ai.cta.href} className="bh-path-ai" {...reveal}>
          <div className="bh-path-ai-copy">
            <span className="bh-eyebrow bh-eyebrow-dark">{ai.label}</span>
            <h3>{ai.title}</h3>
            <span className="bh-btn bh-btn-blue">{ai.cta.label} <Arrow /></span>
          </div>
          <div className="bh-path-ai-ph">Placeholder: platform visual</div>
        </motion.a>
        <motion.div className="bh-path-grid" {...group}>
          {PATHS.others.map((o) => (
            <motion.a href={o.href} className="bh-path" key={o.title} {...child}>
              <b>{o.title}</b>
              <Arrow />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export function PathsB() {
  const rows = [{ ...PATHS.ai, desc: PATHS.ai.desc, href: PATHS.ai.cta.href, title: PATHS.ai.label, featured: true }, ...PATHS.others]
  return (
    <section className="bh-sec bh-paths-b">
      <div className="bh-hero-bg" aria-hidden="true">
        <video src={asset('images/Animated Gradient - 06.mp4')} autoPlay loop muted playsInline />
        <div className="bh-hero-veil" />
      </div>
      <div className="bh-wrap">
        <motion.h2 className="bh-paths-b-title" {...reveal}>{PATHS.title}</motion.h2>
        <motion.div className="bh-rows" {...group}>
          {rows.map((r, i) => (
            <motion.a href={r.href} key={r.title} className={`bh-glass bh-row${r.featured ? ' is-featured' : ''}`} {...child}>
              <span className="bh-row-n">{String(i + 1).padStart(2, '0')}</span>
              <b>{r.title}</b>
              <span className="bh-row-d">{r.desc}</span>
              <span className="bh-row-go" aria-hidden="true">→</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- 4. Story 1 ---------- */
export function StoryAI() {
  const s = STORY_AI
  return (
    <section className="bh-sec bh-tint">
      <div className="bh-wrap">
        <motion.h2 className="bh-h2" {...reveal}>{s.title}</motion.h2>
        <motion.div className="bh-story" {...reveal}>
          <div className="bh-story-media">
            <img src={build(9)} alt="" />
            <span className="bh-story-tag">Built in the AI Builder Program</span>
          </div>
          <div className="bh-story-body">
            <span className="bh-stars" aria-label="5 out of 5">★★★★★</span>
            <blockquote>“{s.quote}”</blockquote>
            <div className="bh-story-foot">
              <div><b>{s.name}</b><span>{s.role}</span></div>
              <div className="bh-story-metric"><b>{s.metric}</b><span>{s.metricLabel}</span></div>
            </div>
            <a className="bh-link" href={s.href}>{s.cta}</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- 5. AI deep dive ---------- */
function StepVisual({ n }) {
  if (n === '01') {
    return (
      <div className="bh-sv bh-sv-assess">
        <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="32" className="bh-ring-bg" /><circle cx="40" cy="40" r="32" className="bh-ring" pathLength="100" /></svg>
        <div><b>Level 3</b><span>Builder</span></div>
      </div>
    )
  }
  if (n === '02') {
    return (
      <div className="bh-sv bh-sv-learn">
        <img src={person('andrew-q')} alt="" />
        <div><span className="bh-livechip"><i className="bh-live" />Live</span><b>Build your first agent team</b></div>
      </div>
    )
  }
  if (n === '03') {
    return <div className="bh-sv bh-sv-build"><img src={build(22)} alt="" /></div>
  }
  return (
    <div className="bh-sv bh-sv-measure">
      {[38, 52, 47, 66, 74, 88].map((h, i) => <i key={i} style={{ '--h': h / 100, animationDelay: `${i * 70}ms` }} />)}
    </div>
  )
}

function Services() {
  const s = DEEP_DIVE.services
  return (
    <motion.div className="bh-services" {...reveal}>
      <div className="bh-services-media"><img src={build(24)} alt="" /></div>
      <div className="bh-services-copy">
        <span className="bh-eyebrow">{s.label}</span>
        <b>{s.title}</b>
        <p>{s.desc}</p>
        <a className="bh-link" href={s.cta.href}>{s.cta.label}</a>
      </div>
    </motion.div>
  )
}

function BuiltFor() {
  return (
    <div className="bh-builtfor">
      <span>Built for</span>
      {DEEP_DIVE.builtFor.map((b) => <a key={b} href="#todo:/ai/for" className="bh-chip">{b}</a>)}
    </div>
  )
}

export function DeepDiveA() {
  const d = DEEP_DIVE
  return (
    <section className="bh-sec">
      <div className="bh-wrap">
        <motion.div className="bh-head-row" {...reveal}>
          <div className="bh-head"><span className="bh-eyebrow">{d.label}</span><h2>{d.title}</h2></div>
          <a href={d.cta.href} className="bh-btn bh-btn-dark">{d.cta.label} <Arrow /></a>
        </motion.div>
        <motion.div className="bh-steps" {...group}>
          {d.steps.map((s) => (
            <motion.div className="bh-step" key={s.n} {...child}>
              <StepVisual n={s.n} />
              <span className="bh-step-n">{s.n}</span>
              <b>{s.title}</b>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
        <Services />
        <BuiltFor />
      </div>
    </section>
  )
}

export function DeepDiveB() {
  const d = DEEP_DIVE
  return (
    <section className="bh-sec bh-dark">
      <div className="bh-wrap bh-sticky-grid">
        <div className="bh-sticky">
          <span className="bh-eyebrow bh-eyebrow-dark">{d.label}</span>
          <h2>{d.title}</h2>
          <a href={d.cta.href} className="bh-btn bh-btn-blue">{d.cta.label} <Arrow /></a>
        </div>
        <div className="bh-sticky-steps">
          {d.steps.map((s) => (
            <motion.div className="bh-sticky-step" key={s.n} {...reveal}>
              <StepVisual n={s.n} />
              <div><span className="bh-step-n">{s.n}</span><b>{s.title}</b><p>{s.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="bh-wrap"><Services /><BuiltFor /></div>
    </section>
  )
}

/* ---------- 6. Story 2 ---------- */
export function StoryOther() {
  const s = STORY_OTHER
  return (
    <section className="bh-sec">
      <div className="bh-wrap">
        <motion.div className="bh-story-dark" {...reveal}>
          <div className="bh-story-dark-copy">
            <span className="bh-eyebrow bh-eyebrow-dark">{s.label}</span>
            <blockquote>“{s.quote}”</blockquote>
            <div className="bh-story-foot">
              <div><b>{s.name}</b><span>{s.role}</span></div>
              <div className="bh-story-metric"><b>{s.metric}</b><span>{s.metricLabel}</span></div>
            </div>
          </div>
          <div className="bh-arch"><img src={asset('images/team-conference.jpg')} alt="" /></div>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- 7. Beyond AI ---------- */
// University logos take turns in one slot, flipping in place.
function useTurns(length, ms = 2200) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setInterval(() => setI((n) => (n + 1) % length), ms)
    return () => clearInterval(t)
  }, [length, ms])
  return i
}

function UniLogos({ logos }) {
  const i = useTurns(logos.length)
  return (
    <div className="bh-uni-slot">
      <AnimatePresence initial={false}>
        <motion.img
          key={logos[i]}
          src={asset(`business/hifi/uni/${logos[i]}.svg`)}
          alt={logos[i]}
          initial={{ opacity: 0, rotateX: -80, y: 14 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, rotateX: 80, y: -14 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        />
      </AnimatePresence>
    </div>
  )
}

export function Beyond() {
  return (
    <section className="bh-sec bh-tint">
      <div className="bh-wrap">
        <motion.h2 className="bh-h2" {...reveal}>{BEYOND.title}</motion.h2>
        <motion.div className="bh-beyond" {...group}>
          {BEYOND.cards.map((c) => (
            <motion.a href={c.href} className="bh-beyond-card" key={c.key} {...child}>
              <div className="bh-beyond-visual">
                {c.faces ? (
                  <div className="bh-faces">
                    {c.faces.map((f, i) => (
                      <motion.img key={f} src={person(f)} alt="" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: EASE_OUT }} />
                    ))}
                  </div>
                ) : null}
                {c.logos ? <UniLogos logos={c.logos} /> : null}
                {c.stat ? <div className="bh-beyond-stat"><b><CountUp value={c.stat[0]} suffix={c.stat[1]} duration={1.8} /></b><span>{c.stat[2]}</span></div> : null}
              </div>
              <b>{c.title}</b>
              <p>{c.desc}</p>
              <span className="bh-link">{c.cta}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- 8. Enterprise ---------- */
// Lucide-style 24px line icons, drawn on a 1.75 stroke.
const ENT_ICONS = [
  <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>,
  <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  <><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
]
const MODEL_LOGOS = ['claude-ai', 'openai', 'gemini-ai']
export function Enterprise() {
  return (
    <section className="bh-sec bh-dark">
      <div className="bh-wrap">
        <motion.div className="bh-head" {...reveal}><span className="bh-eyebrow bh-eyebrow-dark">{ENTERPRISE.label}</span><h2>{ENTERPRISE.title}</h2></motion.div>
        <motion.div className="bh-ent" {...group}>
          {ENTERPRISE.items.map((it, i) => (
            <motion.div className="bh-ent-item" key={it.title} {...child}>
              {ENT_ICONS[i] ? (
                <span className="bh-ent-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ENT_ICONS[i]}</svg></span>
              ) : (
                <span className="bh-ent-models">{MODEL_LOGOS.map((m) => <img key={m} src={asset(`logos/tools/${m}.png`)} alt="" />)}</span>
              )}
              <b>{it.title}</b>
              <p>{it.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- 9. FAQ ---------- */
export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="bh-sec bh-tint">
      <div className="bh-wrap bh-faq">
        <h2 className="bh-h2">{FAQ.title}</h2>
        <div className="bh-faq-list">
          {FAQ.items.map((it, i) => (
            <div className={`bh-faq-item${open === i ? ' is-open' : ''}`} key={it.q}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {it.q}<span aria-hidden="true">+</span>
              </button>
              <div className="bh-faq-a"><div><p>{it.a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- 10. Final CTA ---------- */
export function FinalCta() {
  const f = FINAL_CTA
  return (
    <section className="bh-sec">
      <div className="bh-wrap">
        <motion.div className="bh-final" {...reveal}>
          <img className="bh-final-photo" src={asset('business/hifi/escalator.webp')} alt="" loading="lazy" />
          <div className="bh-final-veil" aria-hidden="true" />
          <div className="bh-final-inner">
            <h2>{f.title}</h2>
            <div className="bh-ctas">
              <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="bh-btn bh-btn-blue" onClick={track('final')}>{f.primary}</a>
              <a href={ASSESSMENT_URL} className="bh-btn bh-btn-glass">{f.secondary}</a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
