import { useEffect, useState } from 'react'

// Single source of truth for the 100M Pledge counter shown on the org page
// (LelandAIPage) and the /pledge page (PledgePage). Both call usePledgeData(),
// which serves the baked-in numbers below immediately and then overrides them
// with the live S3 feed once it loads.
//
// The constants below are the FALLBACK: they render instantly and are kept as-is
// if the fetch fails or returns a bad payload, so the UI never shows zeros or an
// empty chart.
export const PLEDGE_TOTAL = 222742
export const PLEDGE_GOAL = 100000000

// Monthly cumulative total. The live `series` from the feed drives the growth
// chart; this is the fallback used only if that series is missing or malformed.
// The final entry should match PLEDGE_TOTAL above.
export const PLEDGE_SERIES = [
  { month: 'May 2025', value: 4200 },
  { month: 'Jun 2025', value: 9800 },
  { month: 'Jul 2025', value: 17500 },
  { month: 'Aug 2025', value: 27000 },
  { month: 'Sep 2025', value: 39000 },
  { month: 'Oct 2025', value: 54000 },
  { month: 'Nov 2025', value: 71000 },
  { month: 'Dec 2025', value: 92000 },
  { month: 'Jan 2026', value: 116000 },
  { month: 'Feb 2026', value: 141000 },
  { month: 'Mar 2026', value: 166000 },
  { month: 'Apr 2026', value: 190000 },
  { month: 'May 2026', value: 208000 },
  { month: 'Jun 2026', value: PLEDGE_TOTAL },
]

// Live, hourly-updated feed (public S3). Payload shape:
//   { date, total_reach, pct_of_goal, goal, series: [{ month, value }] }
// `total_reach` is the headline number and `series` drives the growth chart.
// `goal`/`pct_of_goal` are captured but not rendered anywhere yet.
//
// Still missing from the feed: `last30` (people learning in the last 30 days).
// Until it's published, last30 is null and the pledge page hides its "last 30
// days" line; the line reappears automatically once the feed includes the field.
const PLEDGE_DATA_URL =
  'https://leland-prod-postgres-sync.s3.us-west-2.amazonaws.com/ai-reach/latest.json'

const DEFAULT_PLEDGE = {
  total: PLEDGE_TOTAL,
  last30: null,
  series: PLEDGE_SERIES,
  goal: PLEDGE_GOAL,
  pctOfGoal: PLEDGE_GOAL ? PLEDGE_TOTAL / PLEDGE_GOAL : null,
}

// The headline is the only field we currently require from the feed; everything
// else has a fallback. Reject anything without a sane total_reach.
function isValidReach(raw) {
  return (
    !!raw &&
    typeof raw === 'object' &&
    Number.isFinite(raw.total_reach) &&
    raw.total_reach > 0
  )
}

// Validates the (not-yet-published) series array for when it eventually appears.
function isValidSeries(s) {
  return (
    Array.isArray(s) &&
    s.length >= 2 &&
    s.every(
      (p) =>
        p && typeof p.month === 'string' && Number.isFinite(p.value) && p.value > 0
    )
  )
}

// Map the S3 payload onto the shape the pages consume, filling anything the feed
// doesn't publish yet from the fallback constants. Returns null if the payload is
// unusable, in which case callers keep the fallback.
function normalizePledge(raw) {
  if (!isValidReach(raw)) return null
  const total = raw.total_reach

  const hasSeries = isValidSeries(raw.series)
  let series = hasSeries ? raw.series : PLEDGE_SERIES
  if (!hasSeries) {
    // Defensive fallback: the feed normally publishes `series`, but if it's ever
    // missing or malformed we keep the static curve and pin its last point to the
    // live total so the chart endpoint still matches the headline.
    series = series.map((p, i) =>
      i === series.length - 1 ? { ...p, value: total } : p
    )
  }

  return {
    total,
    last30:
      Number.isFinite(raw.last30) && raw.last30 >= 0 ? raw.last30 : null,
    series,
    goal: Number.isFinite(raw.goal) && raw.goal > 0 ? raw.goal : PLEDGE_GOAL,
    pctOfGoal: Number.isFinite(raw.pct_of_goal) ? raw.pct_of_goal : null,
  }
}

// Serves the fallback immediately, then swaps in live data on mount. A failed or
// invalid fetch silently keeps the fallback.
export function usePledgeData() {
  const [pledge, setPledge] = useState(DEFAULT_PLEDGE)

  useEffect(() => {
    let cancelled = false
    fetch(PLEDGE_DATA_URL, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((raw) => {
        const next = normalizePledge(raw)
        if (!cancelled && next) setPledge(next)
      })
      .catch(() => {
        /* keep the baked-in fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return pledge
}
