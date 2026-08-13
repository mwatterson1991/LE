import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT, rootPages, sourceFiles, reporter } from './lib.mjs'

const { fail, finish } = reporter('registry')

function readRedirects() {
  const file = path.join(ROOT, 'public/_redirects')
  if (!fs.existsSync(file)) return []
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [from, to] = line.split(/\s+/)
      return { from, to }
    })
}

function normalize(url) {
  const bare = url.split(/[?#]/)[0].replace(/\/$/, '')
  return bare === '' ? '/' : bare
}

function resolves(url, pages, redirects, seen = new Set()) {
  const target = normalize(url)
  // An external URL is not this repo's page to verify.
  if (/^(https?:)?\/\//.test(target)) return true
  // Splat (*) and placeholder (:) redirects expand at request time; this
  // check cannot evaluate what they expand to.
  if (target.includes('*') || target.includes(':')) return true
  if (seen.has(target)) return false
  seen.add(target)
  if (target === '/') return pages.includes('index.html')
  const name = target.replace(/\.html$/, '')
  if (pages.includes(`${name.slice(1)}.html`)) return true
  const rule = redirects.find(r => normalize(r.from) === target)
  return rule ? resolves(rule.to, pages, redirects, seen) : false
}

let config
try {
  config = (await import(pathToFileURL(path.join(ROOT, 'vite.config.js')).href)).default
} catch {
  fail('vite.config.js failed to load', [
    'vite.config.js has a syntax error, so this check could not import it.',
    'Fix: run `npm run build` in your terminal to see the real error, then correct vite.config.js.',
  ])
  finish('vite.config.js failed to load')
}
const inputs = Object.values(config.build?.rollupOptions?.input ?? {})
const inputNames = inputs.map(p => path.basename(p))
const pages = rootPages()
const redirects = readRedirects()

for (const page of pages) {
  if (inputNames.includes(page)) continue
  const name = page.replace(/\.html$/, '')
  fail('Page not registered', [
    `${page} exists but has no entry in vite.config.js.`,
    'It will build fine locally and return 404 in production.',
    `Fix: add   '${name}': resolve(__dirname, '${page}'),`,
    'to the input map in vite.config.js.',
  ])
}

for (const input of inputs) {
  if (fs.existsSync(input)) continue
  fail('Vite input points at a missing file', [
    `vite.config.js lists ${path.basename(input)}, which does not exist.`,
    'Fix: delete that line from the input map, or create the file.',
  ])
}

for (const rule of redirects) {
  if (resolves(rule.to, pages, redirects)) continue
  fail('Redirect target does not exist', [
    `public/_redirects sends ${rule.from} to ${rule.to}, which resolves to no page.`,
    `Fix: correct the target, or create ${normalize(rule.to).slice(1)}.html and register it in vite.config.js.`,
  ])
}

const linkPattern = /href="(\/[^"]*)"/g
for (const file of sourceFiles()) {
  const text = fs.readFileSync(file, 'utf8')
  const reported = new Set()
  for (const match of text.matchAll(linkPattern)) {
    const url = match[1]
    if (url.startsWith('//') || reported.has(url)) continue
    if (/\.[a-z0-9]{2,5}$/i.test(normalize(url))) continue
    if (resolves(url, pages, redirects)) continue
    reported.add(url)
    fail('Internal link goes nowhere', [
      `${path.relative(ROOT, file)} links to ${url}, which resolves to no page.`,
      'Fix one of these:',
      `  create ${normalize(url).slice(1)}.html and register it in vite.config.js, or`,
      `  add a rule to public/_redirects, for example:  ${normalize(url)} /existing-page 200`,
    ])
  }
}

finish(`${pages.length} pages registered, all internal links resolve`)
