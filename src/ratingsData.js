import { useEffect, useState } from 'react'

// Single source of truth for the AI Builder Program review rating shown in the
// hero of the program pages (/program, /program/v2, /siliconslopes). Each calls
// useRatingsData(), which serves the baked-in numbers below immediately and then
// overrides them with the live S3 feed once it loads.
//
// The constants below are the FALLBACK: they render instantly and are kept as-is
// if the fetch fails or returns a bad payload, so the hero never shows a blank or
// nonsensical rating. Keep them roughly in sync with the live feed by hand, the
// same way pledgeData.js keeps its fallback current.
export const RATING_AVG = 4.8 // raw average; the hero rounds it to 1 decimal for display
export const RATING_COUNT = 425

// Live feed (public S3). Payload shape:
//   { date, avg_rating, n_ratings }
// `avg_rating` and `n_ratings` drive the hero headline. `date` is captured for
// reference but not rendered.
const RATINGS_DATA_URL =
  'https://public-shareable-files.s3.us-west-2.amazonaws.com/aibp-ratings/latest.json'

const DEFAULT_RATINGS = {
  avg: RATING_AVG,
  count: RATING_COUNT,
}

// Reject anything without a sane avg_rating (0–5) and a positive n_ratings, so a
// malformed payload can't blank the hero or advertise an impossible rating.
function isValidRatings(raw) {
  return (
    !!raw &&
    typeof raw === 'object' &&
    Number.isFinite(raw.avg_rating) &&
    raw.avg_rating > 0 &&
    raw.avg_rating <= 5 &&
    Number.isFinite(raw.n_ratings) &&
    raw.n_ratings > 0
  )
}

// Map the S3 payload onto the shape the pages consume. Returns null if the payload
// is unusable, in which case callers keep the fallback.
function normalizeRatings(raw) {
  if (!isValidRatings(raw)) return null
  return {
    avg: raw.avg_rating,
    count: raw.n_ratings,
  }
}

// Serves the fallback immediately, then swaps in live data on mount. A failed or
// invalid fetch silently keeps the fallback.
export function useRatingsData() {
  const [ratings, setRatings] = useState(DEFAULT_RATINGS)

  useEffect(() => {
    let cancelled = false
    fetch(RATINGS_DATA_URL, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((raw) => {
        const next = normalizeRatings(raw)
        if (!cancelled && next) setRatings(next)
      })
      .catch(() => {
        /* keep the baked-in fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return ratings
}
