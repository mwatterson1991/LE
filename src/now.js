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
