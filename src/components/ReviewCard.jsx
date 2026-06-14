import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export const AVATAR_COLORS = ['#3E8E7E', '#5B7BB4', '#9A6FB0', '#C2774A', '#4F8A8B', '#A0793D']

export const REVIEW_COLLAPSED_HEIGHT = 280  // ~12 lines at 15px/1.55

// Render review text with **inline bold** spans for emphasis
export function renderReviewText(text) {
  return (text || '').split('**').map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="review-card-hl">{part}</strong>
      : part
  )
}

// Keep anonymous reviews out of the first 8, then sprinkle them in among the rest
export function orderReviews(list) {
  const isAnon = r => !r.name || String(r.name).trim().toLowerCase() === 'anonymous'
  const named = list.filter(r => !isAnon(r))
  const anon = list.filter(isAnon)
  const front = named.slice(0, 8)
  const restNamed = named.slice(8)
  const tail = []
  let ni = 0, ai = 0
  while (ni < restNamed.length || ai < anon.length) {
    if (ni < restNamed.length) tail.push(restNamed[ni++])
    if (ai < anon.length) tail.push(anon[ai++])
  }
  return [...front, ...tail]
}

export function ReviewStars({ count = 5 }) {
  return (
    <div className="review-card-stars">
      {[...Array(count)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="var(--gray-dark)">
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewAvatar({ review }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = (review.name || '?').trim().charAt(0).toUpperCase() || '?'
  const colorSeed = (review.name || '').split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
  const initialColor = AVATAR_COLORS[colorSeed % AVATAR_COLORS.length]
  if (review.photo_url && !imgFailed) {
    return (
      <img
        className="review-card-avatar"
        src={review.photo_url}
        alt=""
        loading="lazy"
        onError={e => { const s = e.currentTarget; if (s.src.includes('.jpg')) { s.src = s.src.replace('.jpg', '.png') } else { setImgFailed(true) } }}
      />
    )
  }
  return (
    <div className="review-card-avatar review-card-avatar-initial" style={{ backgroundColor: initialColor }} aria-hidden="true">
      {initial}
    </div>
  )
}

function ReviewModal({ review, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return createPortal(
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <button className="rv-modal-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="review-card-header">
          <ReviewAvatar review={review} />
          <div className="review-card-info">
            <span className="review-card-name">{review.name || 'Anonymous'}</span>
            {review.subtitle && <span className="review-card-subtitle">{review.subtitle}</span>}
          </div>
        </div>
        <div className="review-card-meta">
          <ReviewStars count={review.stars || 5} />
        </div>
        <p className="rv-modal-text">&ldquo;{renderReviewText(review.text || '')}&rdquo;</p>
      </div>
    </div>,
    document.body
  )
}

// review shape: { name, subtitle, stars, text, photo_url }
export default function ReviewCard({ review }) {
  const [clamped, setClamped] = useState(false)
  const [open, setOpen] = useState(false)
  const innerRef = useRef(null)
  const text = review.text || ''

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    setClamped(el.scrollHeight > REVIEW_COLLAPSED_HEIGHT + 1)
  }, [text])

  return (
    <>
      <div
        className={'tcard tcard-review' + (clamped ? ' rv-clamped' : '')}
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
      >
        <div className="review-card-header">
          <ReviewAvatar review={review} />
          <div className="review-card-info">
            <span className="review-card-name">{review.name || 'Anonymous'}</span>
            {review.subtitle && <span className="review-card-subtitle">{review.subtitle}</span>}
          </div>
        </div>
        <div className="review-card-meta">
          <ReviewStars count={review.stars || 5} />
        </div>
        <div
          className={'rv-text-wrap' + (clamped ? ' rv-text-collapsed' : '')}
          style={clamped ? { maxHeight: REVIEW_COLLAPSED_HEIGHT + 'px' } : undefined}
        >
          <p ref={innerRef} className="review-card-text">&ldquo;{renderReviewText(text)}&rdquo;</p>
        </div>
        {clamped && <div className="rv-text-fade" />}
      </div>
      {open && <ReviewModal review={review} onClose={() => setOpen(false)} />}
    </>
  )
}
