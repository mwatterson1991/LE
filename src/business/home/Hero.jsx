import React, { useState } from 'react'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'motion/react'
import { HERO } from '../content/home'
import { BOOK_DEMO_URL, ASSESSMENT_URL } from '../siteMap'
import { LogoTicker } from '../sections'

const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`
const build = (n) => asset(`business/v/builds/build-${String(n).padStart(2, '0')}.webp`)
const person = (f) => asset(`business/v/people/${f}.webp`)
const INSTRUCTOR_FOR = { ai: 'andrew-q', talent: 'dessy-k', uni: 'kristen-h', ads: 'pic-12' }
const EASE_OUT = [0.23, 1, 0.32, 1]
const track = (source) => () => posthog.capture('biz--cta_click', { source })

function Backdrop() {
  // Abstract brand gradient as the "nature" layer Dave's hi-fi leans on; the
  // glass panels sit over it.
  return (
    <div className="bh-hero-bg" aria-hidden="true">
      <video src={asset('images/Animated Gradient - 06.mp4')} autoPlay loop muted playsInline />
      <div className="bh-hero-veil" />
    </div>
  )
}

function Bars({ rows }) {
  return (
    <div className="bh-bars">
      {rows.map(([name, val], i) => (
        <div className="bh-bar" key={name}>
          <span>{name}</span>
          <div className="bh-bar-track"><i style={{ '--w': val / 100, animationDelay: `${120 + i * 60}ms` }} /></div>
          <b>{val}</b>
        </div>
      ))}
    </div>
  )
}

/** The product stage for one audience. `compact` drops the bottom row. */
function Stage({ k, compact = false }) {
  const s = HERO.stage[k]
  return (
    <div className={`bh-stage${compact ? ' bh-stage-compact' : ''}`}>
      <div className="bh-glass bh-stage-main">
        <div className="bh-stage-top">
          <span className="bh-lbl">{s.metricLabel}</span>
          <span className="bh-delta">{s.delta}</span>
        </div>
        <span className="bh-metric">{s.metric}</span>
        <Bars rows={s.rows} />
        <span className="bh-illus-note">Illustrative</span>
      </div>
      <div className="bh-stage-side">
        <div className="bh-glass bh-card">
          <span className="bh-lbl"><i className="bh-live" />{s.session.label}</span>
          <div className="bh-card-row">
            <img src={person(INSTRUCTOR_FOR[k])} alt="" />
            <div><b>{s.session.title}</b><span>{s.session.meta}</span></div>
          </div>
          <span className="bh-card-foot">{s.session.joined}</span>
        </div>
        <div className="bh-glass bh-card">
          <span className="bh-lbl">{s.shipped.label}</span>
          <img className="bh-card-shot" src={build(s.shipped.build)} alt="" />
          <b>{s.shipped.title}</b>
          <span>{s.shipped.meta}</span>
        </div>
      </div>
      {compact ? null : (
        <div className="bh-stage-bottom">
          {['talent', 'uni', 'ads'].map((key) => {
            const o = HERO.stage[key]
            const a = HERO.audiences.find((x) => x.key === key)
            return (
              <a className="bh-glass bh-mini" key={key} href={a.cta.href}>
                <span className="bh-lbl">{o.window}</span>
                <b>{o.shipped.title}</b>
                <span>{o.metric} {o.metricLabel.toLowerCase()}</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Ctas() {
  return (
    <div className="bh-ctas">
      <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="bh-btn bh-btn-blue" onClick={track('hero')}>{HERO.primaryCta}</a>
      <a href={ASSESSMENT_URL} className="bh-btn bh-btn-glass" onClick={track('hero-assessment')}>{HERO.secondaryCta}</a>
    </div>
  )
}

/** Idea A: centered headline, one composed product stage underneath. */
export function HeroA() {
  const a = HERO.audiences[0]
  return (
    <section className="bh-hero bh-hero-a">
      <Backdrop />
      <div className="bh-wrap bh-hero-a-inner">
        <motion.div className="bh-hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }}>
          <a className="bh-badge" href={HERO.badge.href}><em>{HERO.badge.label}</em>{HERO.badge.text} <span aria-hidden="true">→</span></a>
          <h1>{a.title}</h1>
          <p>{a.sub}</p>
          <Ctas />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}>
          <Stage k="ai" />
        </motion.div>
      </div>
      <LogoTicker />
    </section>
  )
}

/** Idea D: the audience switcher rewrites the headline and swaps the stage. */
export function HeroB() {
  const [k, setK] = useState('ai')
  const a = HERO.audiences.find((x) => x.key === k)
  return (
    <section className="bh-hero bh-hero-b">
      <Backdrop />
      <div className="bh-wrap bh-hero-b-inner">
        <div className="bh-hero-copy bh-hero-copy-left">
          <span className="bh-kicker">Workforce transformation for the age of AI</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={k} initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }} transition={{ duration: 0.22, ease: EASE_OUT }}>
              <h1>{a.title}</h1>
              <p>{a.sub}</p>
            </motion.div>
          </AnimatePresence>
          <div className="bh-switch bh-glass" role="tablist" aria-label="I'm here to">
            {HERO.audiences.map((x) => (
              <button key={x.key} type="button" role="tab" aria-selected={k === x.key} className={k === x.key ? 'is-on' : ''} onClick={() => setK(x.key)}>
                {x.tab}
              </button>
            ))}
          </div>
          <div className="bh-ctas">
            <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="bh-btn bh-btn-blue" onClick={track('hero-b')}>{HERO.primaryCta}</a>
            <a href={a.cta.href} className="bh-btn bh-btn-glass">{a.cta.label}</a>
          </div>
        </div>
        <div className="bh-glass bh-window">
          <div className="bh-window-bar"><span /><span /><span /><em>Leland for Business · {HERO.stage[k].window}</em></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={k} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.985 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
              <Stage k={k} compact />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <LogoTicker />
    </section>
  )
}
