import React, { useState, useEffect } from 'react'
import posthog from 'posthog-js'

const RAFFLE_URL = 'https://joinleland.typeform.com/to/Fghze06B'
const SHOWN_KEY = 'lp-popup-shown-session'
const CONVERTED_KEY = 'lp-popup-converted'
const FLAG_KEY = 'ai-builder-lp-popup'
const VARIANT = 'raffle'

function isMobile() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
}

function safeCapture(event, props) {
  try {
    posthog.capture(event, props)
  } catch (_) {
    // posthog may not be initialized yet — fail silently
  }
}

export default function LPPopup() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  // Trigger setup — runs once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(CONVERTED_KEY)) return
    if (sessionStorage.getItem(SHOWN_KEY)) return

    // PostHog feature flag: 'control' variant opts out, anything else (or undefined) shows.
    try {
      const flag = posthog.getFeatureFlag?.(FLAG_KEY)
      if (flag === 'control' || flag === 'off' || flag === false) return
    } catch (_) {}

    let shown = false
    const mobile = isMobile()
    const timeDelay = 10000

    const show = (trigger) => {
      if (shown) return
      shown = true
      try { sessionStorage.setItem(SHOWN_KEY, '1') } catch (_) {}
      setOpen(true)
      safeCapture('lp_popup_shown', { variant: VARIANT, trigger })
      cleanup()
    }

    const timer = setTimeout(() => show('time'), timeDelay)

    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight
      if (!docHeight) return
      const scrollPct = (window.scrollY + window.innerHeight) / docHeight
      if (scrollPct > 0.5) show('scroll')
    }

    const onMouseOut = (e) => {
      // Exit-intent: cursor leaves viewport via the top edge
      if (e.clientY <= 0 && !e.relatedTarget && !e.toElement) show('exit_intent')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    if (!mobile) document.addEventListener('mouseout', onMouseOut)

    function cleanup() {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mouseout', onMouseOut)
    }

    return cleanup
  }, [])

  // ESC dismiss + body scroll lock while open
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') handleDismiss('esc')
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleDismiss = (source) => {
    safeCapture('lp_popup_dismissed', { variant: VARIANT, source })
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 200)
  }

  const handleCta = () => {
    try { localStorage.setItem(CONVERTED_KEY, '1') } catch (_) {}
    safeCapture('lp_popup_cta_click', { variant: VARIANT })
    // Don't close — let the link open in a new tab naturally
  }

  if (!open) return null

  return (
    <div
      className={`lp-popup-overlay${closing ? ' lp-popup-overlay-closing' : ''}`}
      onClick={() => handleDismiss('overlay')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lp-popup-title"
    >
      <div className="lp-popup" onClick={(e) => e.stopPropagation()}>
        <button
          className="lp-popup-close"
          aria-label="Close"
          onClick={() => handleDismiss('close_btn')}
        >
          ×
        </button>
        <p className="lp-popup-eyebrow">Join 25,000+ AI Builders</p>
        <h2 id="lp-popup-title" className="lp-popup-title">
          Win a free seat in the<br />AI Builder Program
        </h2>
        <p className="lp-popup-sub">
          Enter the drawing and join 25,000+ AI Builders getting weekly resources, prompts, and other expert tips.
        </p>
        <a
          href={RAFFLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg lp-popup-cta"
          onClick={handleCta}
        >
          Enter to win <span className="arrow">→</span>
        </a>
        <p className="lp-popup-fine">Takes 30 seconds. We pick a winner monthly.</p>
      </div>
    </div>
  )
}
