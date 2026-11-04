import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import App from './App.jsx'
import { SiteDataProvider, readEmbeddedSiteData } from './siteData.jsx'
import './index.css'

posthog.init('phc_VD7xQuJG51OK9yk9bvigoWWtJLCiLLSFy35ybhLyPDI', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
})

const app = (
  <StrictMode>
    <SiteDataProvider data={readEmbeddedSiteData()}>
      <App />
    </SiteDataProvider>
  </StrictMode>
)

// Built pages arrive with their HTML already rendered (scripts/build.mjs),
// so React takes over that markup instead of drawing the page again. `npm run
// dev` serves an empty #root, which still needs a normal first render.
const root = document.getElementById('root')
if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
