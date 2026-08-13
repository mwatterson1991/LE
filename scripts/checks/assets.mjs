import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { ROOT, sourceFiles, reporter } from './lib.mjs'

const { fail, finish } = reporter('assets')
const BASE = process.env.CHECK_BASE ?? 'origin/main'
const VIDEO = /\.(mp4|webm|mov)$/i
const ASSET = /\.(png|jpe?g|svg|webp|gif|avif|mp4|webm|mov|woff2?|pdf|ico|ics)$/i
const IMAGE_BUDGET = 400 * 1024
const VIDEO_BUDGET = 2 * 1024 * 1024

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`
}

const REF = /(?:src|href)="([^"]+)"|url\((['"]?)([^'")]+)\2\)/g
let scanned = 0

for (const file of sourceFiles()) {
  const text = fs.readFileSync(file, 'utf8')
  const reported = new Set()
  for (const match of text.matchAll(REF)) {
    const raw = match[1] ?? match[3]
    if (!raw || !raw.startsWith('/') || raw.startsWith('//')) continue
    if (!ASSET.test(raw.split(/[?#]/)[0])) continue
    const rel = decodeURIComponent(raw.split(/[?#]/)[0])
    if (reported.has(rel)) continue
    reported.add(rel)
    scanned += 1
    if (fs.existsSync(path.join(ROOT, 'public', rel))) continue
    fail('Asset does not exist', [
      `${path.relative(ROOT, file)} references ${raw}`,
      `but public${rel} is not in the repo.`,
      'Fix: add the file at that exact path, or correct the reference.',
      'Paths are case sensitive in production and are not on macOS.',
    ])
  }
}

const diff = spawnSync('git', ['diff', '--name-only', '--diff-filter=d', `${BASE}...HEAD`], {
  cwd: ROOT,
  encoding: 'utf8',
})

if (diff.status !== 0) {
  console.log(`  note: size budget skipped, cannot compare against ${BASE}`)
} else {
  const changed = diff.stdout.split('\n').filter(f => f.startsWith('public/') && ASSET.test(f))
  for (const rel of changed) {
    const full = path.join(ROOT, rel)
    if (!fs.existsSync(full)) continue
    const size = fs.statSync(full).size
    const budget = VIDEO.test(rel) ? VIDEO_BUDGET : IMAGE_BUDGET
    if (size <= budget) continue
    fail('Asset is too large', [
      `${rel} is ${kb(size)}. The budget is ${kb(budget)}.`,
      'Large files slow the page down, and page speed decides conversion.',
      VIDEO.test(rel)
        ? `Fix: ffmpeg -i "${rel}" -vcodec libx264 -crf 30 -an "${rel}.small.mp4"`
        : `Fix: sips -Z 1600 -s format jpeg -s formatOptions 72 "${rel}" --out "${rel}"`,
      'The add-an-image skill does this for you. Ask Claude to use it.',
    ])
  }
}

finish(`${scanned} references resolve, changed files within budget`)
