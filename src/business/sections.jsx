import React, { useState } from 'react'
import Marquee from 'react-fast-marquee'
import { NAV, CONSUMER_AI_URL, linkHref } from './siteMap'

// Sections shared by the business homepage and the /ai page. Markup and class
// names match LelandAIPage.jsx so they inherit the live leland.ai styling.

// Spot illustrations come from the Leland Product Illustrations library in
// Figma (blue variant), exported as SVG into public/assets/business/illustrations.
export function Illus({ name, className = '' }) {
  return (
    <img
      className={`biz-illus ${className}`}
      src={`${import.meta.env.BASE_URL}assets/business/illustrations/${name}.svg`}
      alt=""
      loading="lazy"
      decoding="async"
    />
  )
}

const SOCIAL_PROOF = [
  { name: 'google', alt: 'Google', h: 32 },
  { name: 'JPMorganChase', alt: 'JP Morgan Chase', h: 26 },
  { name: 'bain', alt: 'Bain', h: 26 },
  { name: 'qhp-capital', alt: 'QHP Capital', h: 38 },
  { name: 'gsv-ventures', alt: 'GSV', h: 38 },
  { name: 'Partners_Group_Logo_2024', alt: 'Partners Group', h: 34 },
  { name: 'runpod', alt: 'RunPod', h: 32 },
  { name: 'shopify', alt: 'Shopify', h: 34, dir: 'logos' },
  { name: 'mcdonalds', alt: "McDonald's", h: 32, dir: 'logos' },
  { name: 'gitlab-logo-400-rgb', alt: 'GitLab', h: 48, dir: 'logos' },
  { name: 'datavant', alt: 'Datavant', h: 26, dir: 'logos' },
  { name: 'american_express', alt: 'American Express', h: 15, dir: 'logos' },
  { name: 'adobe', alt: 'Adobe', h: 26, dir: 'logos' },
]

export function LogoTicker() {
  return (
    <div className="lai-hero-ticker">
      <div className="logo-ticker logo-ticker-cards">
        <span className="logo-ticker-label">Trusted by teams at</span>
        <Marquee gradient={false} speed={35}>
          {[0, 1].flatMap((round) =>
            SOCIAL_PROOF.map(({ name, alt, h, dir }) => (
              <img
                key={`${alt}-${round}`}
                src={`${import.meta.env.BASE_URL}${dir || 'assets/logos'}/${name}.svg`}
                alt={alt}
                style={{ height: h }}
                className="logo-ticker-img"
              />
            ))
          )}
        </Marquee>
      </div>
    </div>
  )
}

const AI_WHO = NAV.find((n) => n.label === 'AI Transformation').who

const WHO_ILLUS = {
  'HR & People': 'unlock-potential',
  Sales: 'handshake',
  Marketing: 'megaphone',
  Operations: 'time-management',
  'Financial services': 'investment',
  'Higher education': 'graduation',
  'Consumer brands': 'attract-audience',
  'Growth · 25 to 500': 'business-growth',
  'Enterprise · 500+': 'global-network',
}

// Dave's open question: separate /ai/for/* pages, or an on-page clickthrough?
// This does both: tabs on the page, each card deep-links to its own URL, so we
// can ship the tabs first and only build the pages that have a customer story.
export function WhoItsFor({ title = 'Built for every team, industry, and stage', sub = 'Role-specific builds and curriculum, not generic webinars.' }) {
  const [tab, setTab] = useState(AI_WHO[0].group)
  const active = AI_WHO.find((g) => g.group === tab)
  return (
    <section className="biz-who">
      <div className="lai-container">
        <h2 className="lai-section-title">{title}</h2>
        <p className="lai-section-sub">{sub}</p>
        <div className="biz-tabs" role="tablist">
          {AI_WHO.map((g) => (
            <button
              key={g.group}
              role="tab"
              aria-selected={g.group === tab}
              className={`biz-tab${g.group === tab ? ' biz-tab-on' : ''}`}
              onClick={() => setTab(g.group)}
            >
              {g.group}
            </button>
          ))}
        </div>
        {/* key on the tab so the grid remounts and the cards re-stagger in */}
        <div className="biz-who-grid" key={tab}>
          {active.links.map((l) => (
            <a key={l.label} href={linkHref(l)} className="biz-card biz-who-card">
              <Illus name={WHO_ILLUS[l.label]} />
              <span className="biz-card-title">{l.label}</span>
              <span className="biz-placeholder-text">[Top build for this audience + customer proof point]</span>
              <span className="lai-feature-cta">See how</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ForIndividualsBar() {
  return (
    <div className="biz-individuals-bar">
      Learning AI for yourself? <a href={CONSUMER_AI_URL}>Explore the AI Builder Program on joinleland.com ↗</a>
    </div>
  )
}

export function Prefooter({ heading, desc, ctaLabel, ctaUrl, onClick }) {
  return (
    <section className="prefooter" id="cta">
      <div className="prefooter-inner">
        <div className="prefooter-text">
          <h2 className="prefooter-heading">{heading}</h2>
          <p className="prefooter-desc">{desc}</p>
        </div>
        <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="prefooter-cta" onClick={onClick}>{ctaLabel}</a>
      </div>
    </section>
  )
}
