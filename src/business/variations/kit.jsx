import React, { useEffect, useRef, useState } from 'react'
import { personImg } from './data'

// Shared primitives for the variation sections. Keep these small; each section
// file owns its own layout and CSS (prefixed per section).

export const EASE_OUT = [0.23, 1, 0.32, 1]

/** Section heading block used by most variants. `align` = left | center. */
export function Head({ eyebrow, title, sub, align = 'left', dark = false, children }) {
  return (
    <div className={`vk-head vk-head-${align}${dark ? ' vk-head-dark' : ''}`}>
      {eyebrow ? <span className="vk-eyebrow">{eyebrow}</span> : null}
      <h2 className="vk-title">{title}</h2>
      {sub ? <p className="vk-sub">{sub}</p> : null}
      {children}
    </div>
  )
}

/** Fake browser / app window chrome around a mockup. */
export function Window({ url, dark = false, children, className = '' }) {
  return (
    <div className={`vk-window${dark ? ' vk-window-dark' : ''} ${className}`}>
      <div className="vk-window-bar">
        <span /><span /><span />
        {url ? <em>{url}</em> : null}
      </div>
      <div className="vk-window-body">{children}</div>
    </div>
  )
}

export function Avatar({ img, size = 40, ring = false, className = '' }) {
  return (
    <img
      className={`vk-avatar${ring ? ' vk-avatar-ring' : ''} ${className}`}
      src={personImg(img)}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  )
}

/** true once the element has scrolled into view (fires once). */
export function useInView(options = { rootMargin: '-80px' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect() }
    }, options)
    io.observe(el)
    return () => io.disconnect()
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, inView]
}

/** Index that advances every `ms` while `active` (for auto-cycling demos). */
export function useCycle(length, ms = 2600, active = true) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!active || length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % length), ms)
    return () => clearInterval(t)
  }, [length, ms, active])
  return [i, setI]
}

/** Number that counts up from 0 once `start` is true. */
export function CountUp({ to, start = true, duration = 1400, format = (n) => Math.round(n).toLocaleString('en-US'), prefix = '', suffix = '' }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      setN(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, start, duration])
  return <>{prefix}{format(n)}{suffix}</>
}

/** Text that types itself out once `start` is true. */
export function useTypewriter(text, start = true, speed = 22) {
  const [out, setOut] = useState('')
  useEffect(() => {
    if (!start) return
    setOut('')
    let i = 0
    const t = setInterval(() => {
      i += 1
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [text, start, speed])
  return out
}

export function Pill({ children, tone = 'neutral' }) {
  return <span className={`vk-pill vk-pill-${tone}`}>{children}</span>
}
