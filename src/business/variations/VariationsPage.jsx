import React, { Component, useEffect, useState } from 'react'
import { SECTIONS } from './concepts'
import { REGISTRY } from './sections'
import '../../pages/home-rebrand.css'
import '../../pages/leland-ai.css'
import '../business.css'
import './kit.css'
import './variations.css'

// /business-variations: five ways to show each selling point on the
// business.joinleland.com pages. Review page, noindex.

// One broken variant shouldn't blank the whole review page.
class VariantBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return <div className="vv-error">This variant crashed: {String(this.state.error.message || this.state.error)}</div>
    return this.props.children
  }
}

function useBodyClass() {
  useEffect(() => {
    document.title = 'Section variations | Leland for Business'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home', 'biz-page')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home', 'biz-page')
    }
  }, [])
}

function useActiveSection() {
  const [active, setActive] = useState(SECTIONS[0].id)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.dataset.section) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    document.querySelectorAll('[data-section]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

function SectionIntro({ s, index }) {
  return (
    <header className="vv-intro">
      <div className="vv-intro-num">{String(index + 1).padStart(2, '0')}</div>
      <div className="vv-intro-main">
        <span className="vv-intro-name">{s.name}</span>
        <h2 className="vv-intro-claim">{s.claim}</h2>
      </div>
      <dl className="vv-intro-notes">
        <div><dt>What it has to land</dt><dd>{s.idea}</dd></div>
        <div><dt>Analogy</dt><dd>{s.analogy}</dd></div>
      </dl>
    </header>
  )
}

function VariantLabel({ s, v }) {
  return (
    <div className="vv-label" id={`${s.id}-${v.key}`}>
      <span className="vv-label-key">{v.key}</span>
      <b>{v.label}</b>
      <span className="vv-label-meta">{v.type}</span>
      <span className="vv-label-meta">{v.medium}</span>
      {v.moves ? <span className="vv-label-moves">Moves</span> : null}
      <a className="vv-label-anchor" href={`#${s.id}-${v.key}`} aria-label="Link to this variant">#</a>
    </div>
  )
}

export default function VariationsPage() {
  useBodyClass()
  const active = useActiveSection()

  return (
    <div className="vk-root vv-page">
      <div className="vv-nav" role="navigation" aria-label="Sections">
        <a href="/business" className="vv-nav-home">Leland <span>for Business</span></a>
        <div className="vv-nav-chips">
          {SECTIONS.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={`vv-chip${active === s.id ? ' vv-chip-on' : ''}`}>
              <span>{String(i + 1).padStart(2, '0')}</span> {s.name}
            </a>
          ))}
        </div>
      </div>

      <header className="vv-hero">
        <span className="vk-eyebrow">Design review · {SECTIONS.length} sections × 5</span>
        <h1>Five ways to show every selling point</h1>
        <p>Each section starts with what it has to communicate and the analogy behind it, then five treatments that vary the format (bento, carousel, interactive, data viz, product UI, faces, logos) as well as the visual. Pick per section, mix freely.</p>
      </header>

      {SECTIONS.map((s, i) => {
        const variants = REGISTRY[s.id] || {}
        return (
          <section key={s.id} id={s.id} data-section={s.id} className="vv-section">
            <SectionIntro s={s} index={i} />
            {s.variants.map((v) => {
              const Variant = variants[v.key]
              return (
                <div className="vv-variant" key={v.key}>
                  <VariantLabel s={s} v={v} />
                  <div className="vv-stage">
                    <VariantBoundary>{Variant ? <Variant /> : <div className="vv-error">Missing</div>}</VariantBoundary>
                  </div>
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
