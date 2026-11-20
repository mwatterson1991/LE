import React, { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'motion/react'
import { HIFI_HERO, HIFI_TRANSFORM, HIFI_STORIES } from '../content/home'
import { DotImage, GlassScore } from './fx'
import { BOOK_DEMO_URL, ASSESSMENT_URL } from '../siteMap'

// Dave's Hi-fi 4 ("Nature dark, product hero"): white product UI on vivid
// imagery over a black page.

const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`
const hifi = (n) => asset(`business/hifi/${n}.webp`)
const EASE_OUT = [0.23, 1, 0.32, 1]
const track = (source) => () => posthog.capture('biz--cta_click', { source })

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  return reduced
}

/* ---------------------------------------------------------------- Hero */

/* -------------------------------------------------------------- Logos */

// Logos already shown on leland.ai. Each slot flips in place to the next logo.
const LOGOS = [
  { src: 'assets/logos/google.svg', alt: 'Google', h: 26 },
  { src: 'assets/logos/JPMorganChase.svg', alt: 'JPMorgan Chase', h: 20 },
  { src: 'assets/logos/bain.svg', alt: 'Bain & Company', h: 20 },
  { src: 'logos/shopify.svg', alt: 'Shopify', h: 28 },
  { src: 'logos/mcdonalds.svg', alt: "McDonald's", h: 26 },
  { src: 'logos/adobe.svg', alt: 'Adobe', h: 22 },
  { src: 'logos/american_express.svg', alt: 'American Express', h: 14 },
  { src: 'logos/datavant.svg', alt: 'Datavant', h: 20 },
  { src: 'logos/gitlab-logo-400-rgb.svg', alt: 'GitLab', h: 40 },
  { src: 'assets/logos/gsv-ventures.svg', alt: 'GSV', h: 30 },
  { src: 'assets/logos/Partners_Group_Logo_2024.svg', alt: 'Partners Group', h: 26 },
  { src: 'assets/logos/runpod.svg', alt: 'RunPod', h: 24 },
  { src: 'logos/clozd.svg', alt: 'Clozd', h: 20 },
]
const SLOTS = 6

function useLogoSlots() {
  const [slots, setSlots] = useState(() => Array.from({ length: SLOTS }, (_, i) => i))
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return undefined
    let turn = 0
    const t = setInterval(() => {
      setSlots((cur) => {
        const free = LOGOS.map((_, i) => i).filter((i) => !cur.includes(i))
        const next = [...cur]
        next[(turn * 4) % SLOTS] = free[turn % free.length]
        return next
      })
      turn += 1
    }, 1400)
    return () => clearInterval(t)
  }, [reduced])
  return slots
}

export function LogoStrip() {
  const slots = useLogoSlots()
  return (
    <div className="bx-logostrip" aria-label="Trusted by teams at these companies">
      {slots.map((li, s) => {
        const l = LOGOS[li]
        return (
          <div className="bx-logoslot" key={s}>
            <AnimatePresence initial={false}>
              <motion.img
                key={l.alt}
                src={`${import.meta.env.BASE_URL}${l.src}`}
                alt={l.alt}
                style={{ height: l.h }}
                initial={{ opacity: 0, rotateX: -80, y: 12 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, rotateX: 80, y: -12 }}
                transition={{ duration: 0.55, ease: EASE_OUT }}
              />
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function HeroHifi() {
  const h = HIFI_HERO
  return (
    <section className="bx-hero bx-light">
      <div className="bx-wrap bx-hero-inner">
        <motion.div className="bx-hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }}>
          <span className="bx-aeo">{h.eyebrow}</span>
          <h1>{h.title}</h1>
          <p>{h.sub}</p>
          <div className="bx-ctas">
            <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="bx-btn bx-btn-y" onClick={track('hero')}>{h.primaryCta} <span aria-hidden="true">→</span></a>
            <a href={ASSESSMENT_URL} className="bx-btn bx-btn-l" onClick={track('hero-assessment')}>{h.secondaryCta}</a>
          </div>
        </motion.div>
        <motion.div className="bx-hero-frame" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}>
          <DotImage className="bx-fill" src={hifi('nat-clouds')} eager />
          <GlassScore label="Company AI-Native Score" meta="Q4" score={3.4} note="AI Fluent · up 1.2 since July" />
        </motion.div>
      </div>
      <LogoStrip />
    </section>
  )
}

/* ------------------------------------------------- Transformation cards */

export function TransformCards() {
  const t = HIFI_TRANSFORM
  return (
    <section className="bx-sec bx-light">
      <div className="bx-wrap">
        <div className="bx-head">
          <span className="bx-aeo">{t.eyebrow}</span>
          <h2>{t.title}</h2>
          <p>{t.sub}</p>
        </div>
        <div className="bx-cards">
          {t.cards.map((c, i) => (
            <motion.div
              className={`bx-fcard bx-fcard-${c.key}`}
              key={c.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
            >
              <DotImage className="bx-fill" src={hifi(c.bg)} />
              <div className="bx-shade" />
              {c.key === 'assess' ? <GlassScore size="sm" label="Your AI profile" score={3.2} note="AI Fluent" next="Next: automate your weekly report" /> : <span />}
              <div className="bx-fcard-copy">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- Customer stories */

// Four identical cards: logo, result, quote, then the person as a cut-out
// standing on the card's bottom edge.
export function Stories() {
  const st = HIFI_STORIES
  return (
    <section className="bx-sec">
      <div className="bx-wrap">
        <div className="bx-head">
          <span className="bx-aeo">{st.eyebrow}</span>
          <h2>{st.title}</h2>
        </div>
        <div className="bx-stories">
          {st.cards.map((c, i) => (
            <motion.article
              className="bx-tcard"
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.07 * i, ease: EASE_OUT }}
            >
              <DotImage className="bx-fill" src={hifi(c.bg)} />
              <div className="bx-veil" />
              <img className="bx-tcard-logo" src={asset(`business/hifi/${c.logo}`)} alt={c.company} />
              <div className="bx-stat"><b>{c.stat[0]}</b><span>{c.stat[1]}</span></div>
              <blockquote>“{c.quote}”</blockquote>
              <div className="bx-tcard-foot">
                <div className="bx-tcard-who"><b>{c.name}</b><span>{c.title}</span></div>
                <img className="bx-tcard-cut" src={hifi(c.photo)} alt={c.name} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
