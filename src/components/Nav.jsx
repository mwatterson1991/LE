import React, { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'

// Single source of truth for the leland.ai site nav. Used by every page so the
// links, CTA, and behavior stay consistent.
//
// Links open in a new tab so the page you came from (e.g. leland.ai home) stays
// open and is easy to return to.
const NAV_LINKS = [
  { label: 'Builder Program', href: '/program' },
  { label: 'Services', href: '/services' },
  { label: 'Recruit', href: '/recruit' },
  { label: '100M Pledge', href: '/pledge' },
]

// The nav CTA is always "Talk to our team" on every page.
const CTA_URL = 'https://joinleland.typeform.com/to/nXD9kytE'

/**
 * Shared site navigation.
 *
 * @param {'transparent'|'light'} variant  transparent = overlays a dark hero
 *   (white logo that swaps to dark on scroll); light = solid pages (dark logo).
 * @param {string} mobileLabel  optional label shown next to the logo in the
 *   mobile menu header. Omit on standard pages so the menu mirrors the desktop
 *   nav (logo + links + CTA).
 */
export default function Nav({ variant = 'transparent', mobileLabel = '' }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)
  const transparent = variant === 'transparent'

  useEffect(() => {
    const wrapper = navRef.current?.closest('.rb-nav-wrapper')
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      if (wrapper) wrapper.classList.toggle('rb-nav-cta-visible', window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu if the user scrolls while it's open. The listener is
  // only registered when the menu is open and is never invoked on mount, so
  // opening the menu can't immediately close itself.
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [menuOpen])

  useEffect(() => {
    document.body.classList.toggle('rb-nav-menu-open', menuOpen)
    return () => document.body.classList.remove('rb-nav-menu-open')
  }, [menuOpen])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const wrapper = nav.closest('.rb-nav-wrapper')
    if (!wrapper) return
    const measure = () => wrapper.style.setProperty('--nav-height', `${nav.offsetHeight}px`)
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [])

  // transparent: white logo over hero, swaps to dark once scrolled. light: always dark.
  const showDarkLogo = !transparent || scrolled
  const onCtaClick = () => posthog.capture('lai--cta_click', { source: 'nav' })

  return (
    <>
      {/* ===== NAV ===== */}
      <div className={`rb-nav-wrapper${transparent ? '' : ' rb-nav-light'}${scrolled ? ' rb-nav-scrolled' : ''}`}>
        <nav className="rb-nav lai-nav" ref={navRef} role="navigation">
          <div className="rb-nav-lockup">
            <a href="https://www.joinleland.com" className="rb-nav-logo">
              {showDarkLogo
                ? <img className="rb-logo-dark" src={`${import.meta.env.BASE_URL}assets/logo-dark.svg`} alt="Leland" />
                : <img className="rb-logo-white" src={`${import.meta.env.BASE_URL}assets/logo-white.svg`} alt="Leland" />}
            </a>
            <div className="lai-nav-links">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="lai-nav-link">{l.label}</a>
              ))}
            </div>
          </div>
          <div className="rb-nav-actions">
            <a href={CTA_URL} target="_blank" rel="noopener noreferrer" className="rb-nav-getstarted" onClick={onCtaClick}>
              <span className="nav-cta-full">Talk to our team</span>
              <span className="nav-cta-short">Book a call</span>
            </a>
          </div>
          <button className="lai-nav-hamburger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <span /><span /><span />
          </button>
        </nav>
      </div>

      {/* ===== Mobile menu overlay ===== */}
      <div className="lai-mobile-menu">
        <div className="lai-mobile-menu-header">
          <img className="lai-mobile-menu-logo" src={`${import.meta.env.BASE_URL}assets/logo-dark.svg`} alt="Leland" />
          {mobileLabel && (
            <>
              <span className="lai-mobile-menu-divider" />
              <span className="lai-mobile-menu-label">{mobileLabel}</span>
            </>
          )}
        </div>
        <button className="lai-mobile-menu-close" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
        <div className="lai-mobile-menu-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="lai-mobile-menu-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
        </div>
        <a
          href={CTA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="lai-mobile-menu-cta"
          onClick={() => { onCtaClick(); setMenuOpen(false) }}
        >
          Talk to our team
        </a>
      </div>
    </>
  )
}
