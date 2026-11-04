import { useSyncExternalStore } from 'react'

// "Now" for anything a page renders from the date or time: the next cohort, the
// default checkout link, the scarcity counts, the footer year.
//
// Pages are rendered to HTML at build time (scripts/prerender.mjs) and then
// taken over by React in the browser. If the browser computed those values from
// a different "now" than the build did, the HTML would not match and React
// would throw it away and redraw the page.
//
// useNow() avoids that. While rendering at build time, and during the browser's
// first pass over that HTML, it returns the build time, so both sides agree.
// React then re-renders straight away with the visitor's real time. Visitors
// always see current dates; crawlers see the dates as of the last deploy.
//
// Never call new Date() or Date.now() while rendering. Use useNow() and pass
// the result into whatever needs it. Inside useEffect and event handlers, the
// real clock is fine.

// Injected by vite.config.js `define`. Falls back to the load time if missing.
const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : Date.now()
const LOAD_TIME = Date.now()

const subscribe = () => () => {}
const getClientNow = () => LOAD_TIME
const getBuildNow = () => BUILD_TIME

export function useNow() {
  return new Date(useSyncExternalStore(subscribe, getClientNow, getBuildNow))
}

// Today's calendar date as 'YYYY-MM-DD', for anything that counts days or asks
// "has this cohort started yet". Compare it with cohort.iso.slice(0, 10) as
// strings, or pass both to daysBetween(). Never use setHours/getDate for this.
//
// Why a string: Cloudflare builds in UTC, but visitors are in their own
// timezone, so the same moment can be a different calendar day on each side.
// While the build and the browser's first pass render, this returns the build
// date in Pacific time, computed the same way everywhere. After that it switches
// to the visitor's own local date.
const SITE_TIME_ZONE = 'America/Los_Angeles'
const ymdIn = (time, timeZone) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(time)
const BUILD_DAY = ymdIn(BUILD_TIME, SITE_TIME_ZONE)
const LOAD_DAY = ymdIn(LOAD_TIME, undefined)
const getClientDay = () => LOAD_DAY
const getBuildDay = () => BUILD_DAY

export function useToday() {
  return useSyncExternalStore(subscribe, getClientDay, getBuildDay)
}

// Whole days from `fromYmd` to `toYmd` (both 'YYYY-MM-DD'). Negative if `toYmd`
// is earlier. Pure calendar arithmetic, so no timezone can shift it.
export function daysBetween(fromYmd, toYmd) {
  const utc = ymd => Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10))
  return Math.round((utc(toYmd) - utc(fromYmd)) / 86400000)
}
