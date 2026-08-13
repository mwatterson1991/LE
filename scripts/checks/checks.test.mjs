import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assetBudget } from './lib.mjs'

const REPO = path.resolve(fileURLToPath(new URL('../../', import.meta.url)))

function run(script, root) {
  return spawnSync('node', [path.join(REPO, 'scripts/checks', script)], {
    cwd: REPO,
    encoding: 'utf8',
    env: { ...process.env, CHECK_ROOT: root },
  })
}

// The fixture lives inside the repo so that `import 'vite'` inside the
// fixture's vite.config.js resolves through the repo's node_modules.
export function makeFixture(name, files) {
  const dir = path.join(REPO, 'tmp-check-fixture', name)
  fs.rmSync(dir, { recursive: true, force: true })
  for (const [rel, body] of Object.entries(files)) {
    const target = path.join(dir, rel)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, body)
  }
  return dir
}

const VITE_CONFIG = `
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
export default defineConfig({
  build: { rollupOptions: { input: {
    main: resolve(__dirname, 'index.html'),
    good: resolve(__dirname, 'good.html'),
  } } },
})
`

test('registry passes against the real repo', () => {
  const result = run('registry.mjs', REPO)
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('registry fails on an unregistered page', () => {
  const root = makeFixture('unregistered', {
    'vite.config.js': VITE_CONFIG,
    'index.html': '<html></html>',
    'good.html': '<html></html>',
    'orphan.html': '<html></html>',
    'public/_redirects': '',
  })
  const result = run('registry.mjs', root)
  assert.equal(result.status, 1)
  assert.match(result.stdout, /orphan\.html/)
  assert.match(result.stdout, /vite\.config\.js/)
})

test('registry fails on a link with no page and no redirect', () => {
  const root = makeFixture('deadlink', {
    'vite.config.js': VITE_CONFIG,
    'index.html': '<a href="/nowhere">go</a>',
    'good.html': '<html></html>',
    'public/_redirects': '',
  })
  const result = run('registry.mjs', root)
  assert.equal(result.status, 1)
  assert.match(result.stdout, /\/nowhere/)
})

test('registry accepts a link that resolves through _redirects', () => {
  const root = makeFixture('redirected', {
    'vite.config.js': VITE_CONFIG,
    'index.html': '<a href="/pretty">go</a>',
    'good.html': '<html></html>',
    'public/_redirects': '/pretty /good 200\n',
  })
  const result = run('registry.mjs', root)
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('assets passes against the real repo', () => {
  const result = run('assets.mjs', REPO)
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('assets fails on a reference to a file that does not exist', () => {
  const root = makeFixture('missing-asset', {
    'index.html': '<img src="/assets/nope.png">',
    'public/_redirects': '',
  })
  const result = run('assets.mjs', root)
  assert.equal(result.status, 1)
  assert.match(result.stdout, /nope\.png/)
})

test('assets accepts a URL-encoded reference whose file exists', () => {
  const root = makeFixture('encoded-asset', {
    'index.html': '<img src="/logos/My%20Logo.svg">',
    'public/logos/My Logo.svg': '<svg/>',
    'public/_redirects': '',
  })
  const result = run('assets.mjs', root)
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('assetBudget returns correct limit and fix for JPEG', () => {
  const entry = assetBudget('public/images/photo.jpg')
  assert.equal(entry.limit, 400 * 1024)
  assert.match(entry.fix('public/images/photo.jpg'), /sips/)
})

test('assetBudget returns correct limit and fix for MP4', () => {
  const entry = assetBudget('public/videos/demo.mp4')
  assert.equal(entry.limit, 2 * 1024 * 1024)
  assert.match(entry.fix('public/videos/demo.mp4'), /ffmpeg/)
})

test('assetBudget returns correct fix for PDF (no sips)', () => {
  const entry = assetBudget('public/files/guide.pdf')
  assert.match(entry.fix('public/files/guide.pdf'), /Compress/)
  assert.doesNotMatch(entry.fix('public/files/guide.pdf'), /sips/)
})

test('assetBudget returns null for unknown extension', () => {
  const entry = assetBudget('public/data.txt')
  assert.equal(entry, null)
})
