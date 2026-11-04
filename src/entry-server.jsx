// Build-time entry. scripts/build.mjs imports this after the Vite builds and
// renders each page to HTML, so crawlers and AI answer engines read real
// content instead of an empty <div id="root">. It never runs in the browser.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { SiteDataProvider } from './siteData.jsx'
import { setRenderPath } from './components/partnerOffer.js'

// `data` maps public/data file names to their parsed contents. Returns the HTML
// plus the subset of `data` the page read, which the prerender embeds so the
// browser's first render matches.
export function render(path, data) {
  setRenderPath(path)
  const used = new Set()
  const html = renderToString(
    <StrictMode>
      <SiteDataProvider data={data} used={used}>
        <App path={path} />
      </SiteDataProvider>
    </StrictMode>,
  )
  setRenderPath(null)
  const usedData = Object.fromEntries([...used].map(file => [file, data[file]]))
  return { html, usedData }
}
