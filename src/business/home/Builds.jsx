import React, { useEffect, useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { UGC, STATEMENT } from '../content/home'

const asset = (p) => `${import.meta.env.BASE_URL}assets/${p}`
const STREAM = 'https://customer-14xsjmjbqk93tdwp.cloudflarestream.com'
// Stream has no MP4 download on these, so the wall plays short animated
// thumbnails and the real player only loads when someone opens a build.
const preview = (id) => `${STREAM}/${id}/thumbnails/thumbnail.gif?time=3s&duration=4s&height=240`
const player = (id) => `${STREAM}/${id}/iframe?autoplay=true&letterboxColor=transparent`
const EASE_OUT = [0.23, 1, 0.32, 1]

function useOpenVideo() {
  const [open, setOpen] = useState(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  return [open, setOpen]
}

// Every build sits on a brand photo as a framed screen, so recordings of very
// different quality read as one consistent set.
const FRAMES = ['nat-water', 'nat-clay', 'nat-trees', 'nat-wheat', 'nat-clouds', 'nat-flowers']

function BuildCard({ v, i, onOpen }) {
  return (
    <button type="button" className="bu-card" onClick={() => onOpen(v)} aria-label={`Play ${v.title} by ${v.author}`}>
      <img className="bu-card-bg" src={asset(`business/hifi/${FRAMES[i % FRAMES.length]}.webp`)} alt="" loading="lazy" />
      <span className="bu-screen">
        <img src={preview(v.id)} alt="" loading="lazy" />
        <span className="bu-play" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 12 12"><path d="M3 1.8v8.4L10 6z" fill="currentColor" /></svg>
        </span>
      </span>
      <span className="bu-card-meta">
        <b>{v.title}</b>
        <span>{v.author}</span>
      </span>
    </button>
  )
}

export function BuildWall() {
  const [open, setOpen] = useOpenVideo()
  const half = Math.ceil(UGC.videos.length / 2)
  const rows = [UGC.videos.slice(0, half), UGC.videos.slice(half)]
  return (
    <section className="bh-sec bu-sec">
      <div className="bh-wrap">
        <motion.div className="bh-head" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5, ease: EASE_OUT }}>
          <h2>{UGC.title}</h2>
        </motion.div>
      </div>
      <div className="bu-rows">
        {rows.map((row, r) => (
          <Marquee key={r} speed={22} direction={r ? 'right' : 'left'} pauseOnHover autoFill>
            {row.map((v, i) => <BuildCard key={v.id} v={v} i={i + r * 3} onOpen={setOpen} />)}
          </Marquee>
        ))}
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div className="bu-modal" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.div className="bu-modal-box" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }} transition={{ duration: 0.25, ease: EASE_OUT }}>
              <iframe src={player(open.id)} title={open.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              <div className="bu-modal-foot">
                <span><b>{open.title}</b> by {open.author}</span>
                <button type="button" onClick={() => setOpen(null)} aria-label="Close">✕</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

/** Full-bleed photo band: one line of type over motion-blurred commuters. */
export function StatementBand() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1])
  return (
    <section ref={ref} className="bu-band">
      <motion.img src={asset('business/hifi/tunnel.webp')} alt="" style={{ scale }} />
      <div className="bu-band-veil" aria-hidden="true" />
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-120px' }} transition={{ duration: 0.6, ease: EASE_OUT }}>
        {STATEMENT.line}
      </motion.h2>
    </section>
  )
}
