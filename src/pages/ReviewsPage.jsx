import React, { useState, useEffect, useMemo } from 'react'
import '../index.css'

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const Stars = () => (
  <span className="rv-stars" aria-label="5 out of 5 stars">
    {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
  </span>
)

const COLLAPSE_LIMIT = 280  // chars before "Read more"

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const text = review.review || ''
  const needsExpand = text.length > COLLAPSE_LIMIT
  const display = expanded || !needsExpand ? text : text.slice(0, COLLAPSE_LIMIT).trimEnd() + '…'

  return (
    <article className="rv-card">
      <Stars />
      <p className="rv-card-quote">{display}</p>
      {needsExpand && (
        <button
          type="button"
          className="rv-card-more"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? 'Show less' : 'Read more →'}
        </button>
      )}
      <div className="rv-card-meta">
        <span className="rv-card-name">{review.display_name || 'Anonymous'}</span>
        {review.level && (
          <>
            <span className="rv-card-dot">·</span>
            <span className="rv-card-level">{review.level === 'L2' ? 'Level 2' : 'Level 1'}</span>
          </>
        )}
      </div>
    </article>
  )
}

export default function ReviewsPage() {
  const [featured, setFeatured] = useState([])
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'AI Builder Reviews | Leland'
    Promise.all([
      fetch('/data/featured-reviews.json').then(r => r.json()).catch(() => []),
      fetch('/data/reviews-list.json').then(r => r.json()).catch(() => []),
    ]).then(([f, all]) => {
      setFeatured((f || []).filter(r => !r.legacy))
      setFeed((all || []).filter(r => r.rating === 5 && !r.legacy))
      setLoading(false)
    })
  }, [])

  // Combined: featured first, then unique 5-star feed (dedup by quote signature)
  const combined = useMemo(() => {
    const seen = new Set(featured.map(r => (r.review || '').slice(0, 80)))
    const tail = feed.filter(r => !seen.has((r.review || '').slice(0, 80)))
    return [...featured, ...tail]
  }, [featured, feed])

  return (
    <div className="rv-page">
      <header className="rv-hero">
        <div className="container">
          <a href="/" className="rv-back">← Back to AI Builder Program</a>
          <h1 className="rv-title">
            What AI Builder grads are <span className="rv-title-accent">saying</span>
          </h1>
        </div>
      </header>

      <main className="container rv-grid-wrap">
        {loading ? (
          <p className="rv-empty">Loading reviews…</p>
        ) : combined.length === 0 ? (
          <p className="rv-empty">No reviews yet.</p>
        ) : (
          <div className="rv-grid">
            {combined.map((r, i) => <ReviewCard key={i} review={r} />)}
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
