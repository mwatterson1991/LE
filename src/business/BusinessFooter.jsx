import React from 'react'
import { linkHref } from './siteMap'

// Business-site footer (Dave's wireframe columns). The leland.ai Footer stays
// untouched for the live pages.
const COLUMNS = [
  { title: 'AI Transformation', links: [
    { label: 'Platform', href: '/ai' },
    { label: 'Services', href: '/services' },
    { label: 'Assessment', href: '/ai/assessment', stub: true },
    { label: 'Curriculum', href: '/ai/curriculum', stub: true },
  ] },
  { title: 'AI for teams', links: [
    { label: 'HR & People', href: '/ai/for/hr', stub: true },
    { label: 'Sales', href: '/ai/for/sales', stub: true },
    { label: 'Marketing', href: '/ai/for/marketing', stub: true },
    { label: 'Operations', href: '/ai/for/operations', stub: true },
  ] },
  { title: 'Talent', links: [
    { label: 'Hiring', href: '/recruit' },
    { label: 'Outplacement', href: '/outplacement', stub: true },
  ] },
  { title: 'Universities', links: [
    { label: 'Career centers', href: '/universities/career-centers', stub: true },
    { label: 'MBA programs', href: '/universities/mba-programs', stub: true },
    { label: 'Undergrad', href: '/universities/undergrad', stub: true },
  ] },
  { title: 'Company', links: [
    { label: 'Customers', href: '/customers', stub: true },
    { label: 'Partners', href: '/partners', stub: true },
    { label: 'Security', href: '/security', stub: true },
    { label: 'For individuals ↗', href: 'https://www.joinleland.com' },
  ] },
]

export default function BusinessFooter() {
  return (
    <footer className="bh-footer">
      <div className="bh-wrap">
        <div className="bh-footer-top">
          <div className="bh-footer-brand">
            <img src={`${import.meta.env.BASE_URL}assets/logos/New Leland Logo/Full Logo/Logo-White.svg`} alt="Leland" />
            <span>for Business</span>
          </div>
          <div className="bh-footer-cols">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <h4>{c.title}</h4>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.label}><a href={linkHref(l)} title={l.stub ? 'Page not built yet' : undefined}>{l.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="bh-footer-bottom">
          <span>© 2026 Leland Inc.</span>
          <a href="https://www.joinleland.com/privacy">Privacy</a>
          <a href="https://www.joinleland.com/legal">Legal</a>
        </div>
      </div>
    </footer>
  )
}
