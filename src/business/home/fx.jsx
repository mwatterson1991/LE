import React, { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'motion/react'

// Shared motion pieces for the homepage: brand images that resolve from dots
// (from the Leland chat-interface guidelines), numbers that count up, and the
// liquid-glass AI-Native score card.

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const DOT_STEPS = [40, 26, 16, 10, 6]

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function drawDots(canvas, img, isCancelled) {
  const r = canvas.getBoundingClientRect()
  const d = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.max(1, Math.round(r.width * d))
  canvas.height = Math.max(1, Math.round(r.height * d))
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const sc = Math.max(W / img.width, H / img.height)
  const dw = img.width * sc
  const dh = img.height * sc
  const ox = (W - dw) / 2
  const oy = (H - dh) / 2
  const tmp = document.createElement('canvas')
  const tx = tmp.getContext('2d', { willReadFrequently: true })
  for (const step of DOT_STEPS) {
    if (isCancelled()) return
    const b = step * d
    const cw = Math.ceil(W / b)
    const ch = Math.ceil(H / b)
    tmp.width = cw
    tmp.height = ch
    tx.drawImage(img, ox / b, oy / b, dw / b, dh / b)
    const px = tx.getImageData(0, 0, cw, ch).data
    ctx.clearRect(0, 0, W, H)
    for (let j = 0; j < ch; j++) {
      for (let i = 0; i < cw; i++) {
        const k = (j * cw + i) * 4
        ctx.fillStyle = `rgb(${px[k]},${px[k + 1]},${px[k + 2]})`
        ctx.beginPath()
        ctx.arc(i * b + b / 2, j * b + b / 2, b * 0.46, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    await sleep(140)
  }
}

/** A cover-cropped image that holds its space, then resolves from dots to sharp on first view. */
export function DotImage({ src, alt = '', className = '', eager = false }) {
  const ref = useRef(null)
  const canvasRef = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [sharp, setSharp] = useState(false)
  useEffect(() => {
    if (!inView) return undefined
    let cancelled = false
    if (prefersReducedMotion()) {
      setSharp(true)
      return undefined
    }
    loadImage(src)
      .then((img) => drawDots(canvasRef.current, img, () => cancelled))
      .catch(() => {})
      .finally(() => { if (!cancelled) setSharp(true) })
    return () => { cancelled = true }
  }, [inView, src])
  return (
    <div ref={ref} className={`fx-dotimg${sharp ? ' is-sharp' : ''} ${className}`}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}

/** Counts from zero to `value` the first time it scrolls into view. Renders the final value at build time. */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 1.4 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [n, setN] = useState(value)
  useEffect(() => {
    if (!prefersReducedMotion()) setN(0)
  }, [])
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return undefined
    const controls = animate(0, value, { duration, ease: [0.23, 1, 0.32, 1], onUpdate: setN })
    return () => controls.stop()
  }, [inView, value, duration])
  const text = n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return <span ref={ref} className="fx-num">{prefix}{text}{suffix}</span>
}

const BANDS = ['Starter', 'Explorer', 'Fluent', 'Proficient', 'AI-Native']

/** Liquid-glass score card. `score` is out of 5; the bar fills one band per point. */
export function GlassScore({ label, meta, score, note, next, size = 'lg' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <div ref={ref} className={`fx-glass fx-glass-${size}${inView ? ' is-in' : ''}`}>
      <div className="fx-glass-top">
        <span>{label}</span>
        {meta ? <span>{meta}</span> : null}
      </div>
      <div className="fx-glass-score">
        <b><CountUp value={score} decimals={1} /></b>
        <span>/ 5</span>
      </div>
      {note ? <p className="fx-glass-note">{note}</p> : null}
      <div className="fx-glass-bar" aria-hidden="true">
        {BANDS.map((b, i) => (
          <i key={b} style={{ '--f': Math.max(0, Math.min(1, score - i)), '--d': `${i * 90}ms` }} />
        ))}
      </div>
      <div className="fx-glass-ends" aria-hidden="true"><span>{BANDS[0]}</span><span>{BANDS[4]}</span></div>
      {next ? <div className="fx-glass-next">{next} <span aria-hidden="true">→</span></div> : null}
    </div>
  )
}
