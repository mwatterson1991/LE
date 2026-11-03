import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react'
import '../index.css'
import './home-rebrand.css'
import ReviewCard, { orderReviews } from '../components/ReviewCard'
import { useSiteData } from '../siteData.jsx'

// Where "back" goes. The reviews page is reachable from more than one landing
// page, so it reads ?from= instead of assuming /program. Only known internal
// paths are honoured, so a crafted ?from= can't bounce anyone off-site, and an
// absent or unrecognised value keeps the original /program behaviour.
const RETURN_PATHS = {
  program: '/program',
  'program-single-price': '/program-single-price',
}

function returnPath() {
  if (typeof window === 'undefined') return '/program'
  const from = new URLSearchParams(window.location.search).get('from')
  return RETURN_PATHS[from] || '/program'
}

// The build-time render has no screen width, so it lays out the desktop column
// count, and the browser corrects it before the first paint.
function useColumnCount() {
  const getCount = useCallback(() => {
    const w = window.innerWidth
    if (w >= 1100) return 4
    if (w >= 820) return 3
    if (w >= 540) return 2
    return 1
  }, [])
  const [count, setCount] = useState(4)
  useLayoutEffect(() => {
    const handler = () => setCount(getCount())
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [getCount])
  return count
}

export default function ReviewsPage() {
  const featuredFile = useSiteData('featured-reviews.json')
  const feedFile = useSiteData('reviews-list.json')
  const loading = featuredFile === null || feedFile === null
  const featured = useMemo(() => (featuredFile || []).filter(r => !r.legacy), [featuredFile])
  const feed = useMemo(() => (feedFile || []).filter(r => r.rating === 5 && !r.legacy), [feedFile])

  useLayoutEffect(() => {
    document.title = 'AI Builder Reviews | Leland'
    document.documentElement.classList.add('rb-home')
    document.body.classList.add('rb-home')
    return () => {
      document.documentElement.classList.remove('rb-home')
      document.body.classList.remove('rb-home')
    }
  }, [])

  const colCount = useColumnCount()
  // ?from= is only known in the browser, so read it after the first render.
  const [backTo, setBackTo] = useState('/program')
  useEffect(() => setBackTo(returnPath()), [])

  // Combined: featured first, then unique 5-star feed (dedup by quote signature),
  // normalized to the shared ReviewCard shape and ordered the same way as /program
  const combined = useMemo(() => {
    const seen = new Set(featured.map(r => (r.review || '').slice(0, 80)))
    const tail = feed.filter(r => !seen.has((r.review || '').slice(0, 80)))
    const normalized = [...featured, ...tail].map(r => ({
      name: r.display_name || 'Anonymous',
      subtitle: r.level === 'L2' ? 'Completed Level 2' : 'Completed Level 1',
      stars: r.rating || 5,
      text: r.review || '',
      photo_url: r.photo_url || null,
    }))
    return orderReviews(normalized)
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
          <div className="rv-hero-links">
            <a href={backTo} className="rv-back">← Back to AI Builder Program</a>
            <a href="https://www.lelandcourses.com/program/results/" target="_blank" rel="noopener noreferrer" className="btn btn-primary rv-results-cta">
              See our results <span className="arrow">→</span>
            </a>
          </div>
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
          <div className="rv-footer-cta-row">
            <a href={`${backTo}#pricing`} className="rv-footer-btn">Enroll in the next cohort →</a>
            <a href="https://www.lelandcourses.com/program/results/" target="_blank" rel="noopener noreferrer" className="rv-footer-btn rv-footer-btn-secondary">See our results</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
