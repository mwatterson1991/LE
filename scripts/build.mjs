// `npm run build`. Three steps, in order:
//
//   1. The normal browser build into dist/, exactly what `vite build` did before.
//   2. A build-time copy of the React app (src/entry-server.jsx) into .ssr/.
//   3. For every page that mounts the React app, render it to HTML and write that
//      HTML into the page's <div id="root"> in dist/.
//
// Step 3 is why crawlers and AI answer engines can read the pages: the content
// is in the HTML itself, not only in JavaScript. In the browser, React takes
// over that HTML (hydrateRoot in src/main.jsx) and everything works as before.
//
// If any page fails to render, the build fails. Cloudflare then keeps the
// previous version live, and the pull request check shows the error.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SSR_OUT = path.join(ROOT, '.ssr')
const DATA_DIR = path.join(ROOT, 'public/data')
const ROOT_DIV = '<div id="root"></div>'

// One timestamp for both builds, so the build-time render and the browser's
// first render agree on "now" (see src/now.js). vite.config.js reads it.
process.env.BUILD_TIME ||= String(Date.now())

await build({ root: ROOT })
await build({
  root: ROOT,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.jsx', outDir: SSR_OUT, emptyOutDir: true },
})

const { render } = await import(pathToFileURL(path.join(SSR_OUT, 'entry-server.js')).href)

const data = {}
for (const file of fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))) {
  data[file] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'))
}

// JSON inside a <script> tag: escape "<" so a review containing "</script>"
// cannot end the tag early.
const embed = value => JSON.stringify(value).replace(/</g, '\\u003c')

const pages = fs.readdirSync(DIST).filter(f => f.endsWith('.html'))
const failures = []
let rendered = 0

for (const file of pages) {
  const filePath = path.join(DIST, file)
  const source = fs.readFileSync(filePath, 'utf8')
  // The standalone pages (no React app) are already plain HTML.
  if (!source.includes(ROOT_DIV)) continue

  const route = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`
  try {
    const { html, usedData } = render(route, data)
    if (!html.trim()) throw new Error('rendered empty HTML')
    const dataTag = Object.keys(usedData).length
      ? `<script id="__SITE_DATA__" type="application/json">${embed(usedData)}</script>`
      : ''
    fs.writeFileSync(filePath, source.replace(ROOT_DIV, `<div id="root">${html}</div>${dataTag}`))
    rendered++
    console.log(`prerendered ${route.padEnd(22)} ${(html.length / 1024).toFixed(0)} KB of HTML`)
  } catch (err) {
    failures.push({ route, err })
  }
}

fs.rmSync(SSR_OUT, { recursive: true, force: true })

if (failures.length) {
  for (const { route, err } of failures) {
    console.error(`\nCould not prerender ${route}:\n${err.stack || err}`)
  }
  console.error(`
${failures.length} page(s) failed to prerender. The usual cause is code that
reads window, document or localStorage while rendering. Move that read into a
useEffect, or check typeof window first. See src/now.js for dates and times.`)
  process.exit(1)
}

console.log(`prerendered ${rendered} page(s)`)
