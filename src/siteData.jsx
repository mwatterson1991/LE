import { createContext, useContext, useEffect, useState } from 'react'

// JSON files in public/data (reviews, demos) that pages show.
//
// At build time, scripts/build.mjs reads these files and passes them in, so
// the reviews and demos are part of the HTML that crawlers and AI answer engines
// read. The prerender also writes whatever a page used into a
// <script id="__SITE_DATA__"> tag, and main.jsx hands that back here so the
// browser's first render matches the HTML exactly.
//
// When the data was not baked in (for example under `npm run dev`), the hook
// fetches /data/<file> like the pages always did.

const SiteDataContext = createContext({ data: {}, used: null })

export function SiteDataProvider({ data = {}, used = null, children }) {
  return <SiteDataContext.Provider value={{ data, used }}>{children}</SiteDataContext.Provider>
}

// Returns the parsed file, or null while it is still loading. A failed fetch
// returns [], matching how every caller treated errors before.
export function useSiteData(file) {
  const { data, used } = useContext(SiteDataContext)
  const preloaded = Object.hasOwn(data, file) ? data[file] : undefined
  if (used) used.add(file)

  const [fetched, setFetched] = useState(null)
  useEffect(() => {
    if (preloaded !== undefined) return
    let live = true
    fetch(`/data/${file}`)
      .then(r => (r.ok ? r.json() : []))
      .catch(() => [])
      .then(d => { if (live) setFetched(d || []) })
    return () => { live = false }
  }, [file, preloaded])

  return preloaded !== undefined ? preloaded : fetched
}

export function readEmbeddedSiteData() {
  const el = typeof document !== 'undefined' && document.getElementById('__SITE_DATA__')
  if (!el) return {}
  try {
    return JSON.parse(el.textContent) || {}
  } catch {
    return {}
  }
}
