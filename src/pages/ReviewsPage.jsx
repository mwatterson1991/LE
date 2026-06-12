import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import '../index.css'
import './home-rebrand.css'

function useColumnCount() {
  const getCount = useCallback(() => {
    const w = window.innerWidth
    if (w >= 1100) return 4
    if (w >= 820) return 3
    if (w >= 540) return 2
    return 1
  }, [])
  const [count, setCount] = useState(getCount)
  useEffect(() => {
    const handler = () => setCount(getCount())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [getCount])
  return count
}

function StarRow() {
  return (
    <div className="review-card-stars">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="var(--gray-dark)">
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  )
}

const COLLAPSED_HEIGHT = 140  // ~6 lines at 15px/1.55

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const [naturalH, setNaturalH] = useState(null)
  const wrapRef = useRef(null)
  const innerRef = useRef(null)
  const text = review.review || ''

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const h = el.scrollHeight
    setNaturalH(h)
    setClamped(h > COLLAPSED_HEIGHT + 1)
  }, [text])

  const handleClick = () => {
    if (!clamped || expanded) return
    const wrap = wrapRef.current
    if (wrap && naturalH) {
      wrap.style.maxHeight = naturalH + 'px'
    }
    setExpanded(true)
  }

  return (
    <div
      className={'tcard tcard-review' + (clamped && !expanded ? ' rv-clamped' : '')}
      onClick={handleClick}
      style={clamped && !expanded ? { cursor: 'pointer' } : undefined}
    >
      <div className="review-card-header">
        <div className="review-card-info">
          <span className="review-card-name">{review.display_name || 'Anonymous'}</span>
          {review.level && (
            <span className="review-card-subtitle">
              {review.level === 'L2' ? 'Completed Level 2' : 'Completed Level 1'}
            </span>
          )}
        </div>
      </div>
      <div className="review-card-meta">
        <StarRow />
      </div>
      <div
        ref={wrapRef}
        className={'rv-text-wrap' + (!expanded && clamped ? ' rv-text-collapsed' : '')}
        style={!expanded && clamped ? { maxHeight: COLLAPSED_HEIGHT + 'px' } : expanded && naturalH ? { maxHeight: naturalH + 'px' } : undefined}
        onTransitionEnd={() => {
          if (expanded && wrapRef.current) wrapRef.current.style.maxHeight = 'none'
        }}
      >
        <p ref={innerRef} className="review-card-text">
          &ldquo;{text}&rdquo;
        </p>
      </div>
      {clamped && !expanded && <div className="rv-text-fade" />}
    </div>
  )
}

export default function ReviewsPage() {
  const [featured, setFeatured] = useState([])
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'AI Builder Reviews | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/data/featured-reviews.json').then(r => r.json()).catch(() => []),
      fetch('/data/reviews-list.json').then(r => r.json()).catch(() => []),
    ]).then(([f, all]) => {
      setFeatured((f || []).filter(r => !r.legacy))
      setFeed((all || []).filter(r => r.rating === 5 && !r.legacy))
      setLoading(false)
    })
  }, [])

  const colCount = useColumnCount()

  // Combined: featured first, then unique 5-star feed (dedup by quote signature)
  const combined = useMemo(() => {
    const seen = new Set(featured.map(r => (r.review || '').slice(0, 80)))
    const tail = feed.filter(r => !seen.has((r.review || '').slice(0, 80)))
    return [...featured, ...tail]
  }, [featured, feed])

  // Distribute cards round-robin into columns
  const columns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => [])
    combined.forEach((r, i) => cols[i % colCount].push(r))
    return cols
  }, [combined, colCount])

  return (
    <div className="rv-page">
      <header className="rv-hero">
        <div className="container">
          <a href="/program" className="rv-back">← Back to AI Builder Program</a>
          <h1 className="rv-title">
            What AI Builder grads are saying
          </h1>
        </div>
      </header>

      <main className="container rv-grid-wrap">
        {loading ? (
          <p className="rv-empty">Loading reviews…</p>
        ) : combined.length === 0 ? (
          <p className="rv-empty">No reviews yet.</p>
        ) : (
          <div className="rv-masonry">
            {columns.map((col, ci) => (
              <div className="rv-masonry-col" key={ci}>
                {col.map((r, ri) => <ReviewCard key={ri} review={r} />)}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="rv-footer">
        <div className="container">
          <p className="rv-footer-line">Want to join them?</p>
          <a href="/#pricing" className="rv-footer-btn">Enroll in the next cohort →</a>
        </div>
      </footer>
    </div>
  )
}
