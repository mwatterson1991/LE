import React, { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { NAV, BOOK_DEMO_URL, LOGIN_URL, linkHref, isExternal } from './siteMap'

// The business.joinleland.com header. Same chrome as the current leland.ai nav
// (rb-nav / lai-nav classes, transparent over a dark hero, white once
// scrolled); only the link set and the mega-menu panels are new.

const ext = (href) => (isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})

const Caret = () => (
  <svg className="lai-nav-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

function NavLink({ link, className }) {
  return (
    <a href={linkHref(link)} className={className} title={link.stub ? 'Page not built yet' : undefined} {...ext(link.href)}>
      <b>{link.label}</b>
      {link.desc ? <span>{link.desc}</span> : null}
    </a>
  )
}

function MegaPanel({ item, id }) {
  return (
    <div className={`biz-mega${item.columns ? ' biz-mega-sm' : item.feature ? ' biz-mega-lg' : ''}`} id={id} role="region" aria-label={item.label}>
      <div className="biz-mega-cols">
        {item.columns ? (
          item.columns.map((col) => (
            <div className="biz-mega-col" key={col.cap}>
              <span className="biz-mega-cap">{col.cap}</span>
              {col.links.map((l) => <NavLink key={l.label} link={l} className="biz-mega-item" />)}
            </div>
          ))
        ) : (
          <>
            <div className="biz-mega-col">
              <span className="biz-mega-cap">What you buy</span>
              {item.buy.map((l) => <NavLink key={l.label} link={l} className="biz-mega-item" />)}
            </div>
            <div className="biz-mega-col biz-mega-col-wide">
              <span className="biz-mega-cap">Who it’s for</span>
              <div className="biz-mega-groups">
                {item.who.map((g) => (
                  <div className="biz-mega-group" key={g.group}>
                    <span className="biz-mega-group-label">{g.group}</span>
                    {g.links.map((l) => (
                      <a key={l.label} href={linkHref(l)} className="biz-mega-link" title={l.stub ? 'Page not built yet' : undefined}>{l.label}</a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {item.feature ? (
              <a className="biz-mega-col biz-mega-feature" href={item.feature.href} {...ext(item.feature.href)}>
                <span className="biz-mega-cap">Start here</span>
                <b>{item.feature.title}</b>
                <span>{item.feature.desc}</span>
                <span className="biz-mega-feature-cta">{item.feature.cta} →</span>
              </a>
            ) : null}
          </>
        )}
      </div>
      {item.footnote ? (
        <div className="biz-mega-bar">
          {item.footnote.text}{' '}
          <a href={item.footnote.href} {...ext(item.footnote.href)}>{item.footnote.link} ↗</a>
        </div>
      ) : null}
      {item.aiBar ? (
        <div className="biz-mega-bar biz-mega-bar-ai">
          <span className="biz-ai-tag">AI built in</span>
          {item.aiBar.text} <a href={linkHref(item.aiBar)}>AI Transformation →</a>
        </div>
      ) : null}
    </div>
  )
}

function useNavScroll(navRef) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const nav = navRef.current
    const wrapper = nav?.closest('.rb-nav-wrapper')
    if (!wrapper) return
    const measure = () => wrapper.style.setProperty('--nav-height', `${nav.offsetHeight}px`)
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [navRef])
  return scrolled
}

// Click-to-open menus. Outside click and Escape close; moving from one open
// menu straight to another skips the enter animation (`wasSwitch`) so browsing
// the nav feels instant instead of replaying the fade each time.
function useMegaMenu(navRef) {
  const [state, setState] = useState({ open: null, wasSwitch: false })
  useEffect(() => {
    if (!state.open) return
    const onDown = (e) => { if (!navRef.current?.contains(e.target)) setState({ open: null, wasSwitch: false }) }
    const onKey = (e) => { if (e.key === 'Escape') setState({ open: null, wasSwitch: false }) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [state.open, navRef])
  const toggle = (label) => setState((s) => (
    s.open === label ? { open: null, wasSwitch: false } : { open: label, wasSwitch: s.open !== null }
  ))
  return { openMenu: state.open, wasSwitch: state.wasSwitch, toggleMenu: toggle }
}

function useMobileMenu() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    document.body.classList.toggle('rb-nav-menu-open', open)
    return () => document.body.classList.remove('rb-nav-menu-open')
  }, [open])
  return [open, setOpen]
}

/**
 * @param {'transparent'|'light'} variant  transparent overlays a dark hero.
 */
export default function BusinessNav({ variant = 'transparent' }) {
  const navRef = useRef(null)
  const scrolled = useNavScroll(navRef)
  const [, setMenuOpen] = useMobileMenu()
  const { openMenu, wasSwitch, toggleMenu } = useMegaMenu(navRef)
  const transparent = variant === 'transparent'
  const showDarkLogo = !transparent || scrolled || openMenu !== null
  const onCtaClick = () => posthog.capture('biz--cta_click', { source: 'nav' })

  return (
    <>
      <div className={`rb-nav-wrapper biz-nav-wrapper${transparent ? '' : ' rb-nav-light'}${scrolled || openMenu ? ' rb-nav-scrolled' : ''}`}>
        <nav className="rb-nav lai-nav biz-nav" ref={navRef} role="navigation">
          <div className="rb-nav-lockup">
            <a href="/business" className="rb-nav-logo biz-nav-logo">
              <img
                className={showDarkLogo ? 'rb-logo-dark' : 'rb-logo-white'}
                src={`${import.meta.env.BASE_URL}assets/logos/New Leland Logo/Full Logo/${showDarkLogo ? 'Logo-Black' : 'Logo-White'}.svg`}
                alt="Leland"
              />
              <span className="lai-nav-suffix biz-nav-suffix">for Business</span>
            </a>
            <div className="lai-nav-links biz-nav-links">
              {NAV.map((item) => {
                const isOpen = openMenu === item.label
                const panelId = `biz-mega-${item.label.toLowerCase().replace(/\s+/g, '-')}`
                return (
                  <div className={`biz-nav-item${isOpen ? ' is-open' : ''}`} key={item.label} data-instant={isOpen && wasSwitch ? '' : undefined}>
                    <button
                      type="button"
                      className="lai-nav-link lai-nav-dropdown-trigger biz-nav-trigger"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleMenu(item.label)}
                    >
                      {item.label} <Caret />
                    </button>
                    <MegaPanel item={item} id={panelId} />
                  </div>
                )
              })}
            </div>
          </div>
          <div className="rb-nav-actions">
            <a href={LOGIN_URL} className="lai-nav-link biz-nav-login">Log in</a>
            <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="rb-nav-getstarted" onClick={onCtaClick}>
              Book a demo
            </a>
          </div>
          <button className="lai-nav-hamburger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <span /><span /><span />
          </button>
        </nav>
      </div>

      <div className="lai-mobile-menu">
        <div className="lai-mobile-menu-header">
          <img className="lai-mobile-menu-logo" src={`${import.meta.env.BASE_URL}assets/logos/New Leland Logo/Full Logo/Logo-Black.svg`} alt="Leland" />
          <span className="lai-mobile-menu-divider" />
          <span className="lai-mobile-menu-label">for Business</span>
        </div>
        <button className="lai-mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
        <div className="lai-mobile-menu-links biz-mobile-links">
          {NAV.map((item) => (
            <details key={item.label} className="biz-mobile-group">
              <summary className="lai-mobile-menu-link">{item.label}</summary>
              {(item.buy || item.columns.flatMap((c) => c.links)).map((l) => (
                <a key={l.label} href={linkHref(l)} className="biz-mobile-sublink" onClick={() => setMenuOpen(false)}>{l.label}</a>
              ))}
            </details>
          ))}
          <a href={LOGIN_URL} className="lai-mobile-menu-link">Log in</a>
        </div>
        <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer" className="lai-mobile-menu-cta" onClick={() => { onCtaClick(); setMenuOpen(false) }}>
          Book a demo
        </a>
      </div>
    </>
  )
}
