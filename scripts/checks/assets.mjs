import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { ROOT, sourceFiles, reporter, assetBudget } from './lib.mjs'

const { fail, finish } = reporter('assets')
const BASE = process.env.CHECK_BASE ?? 'origin/main'
const ASSET = /\.(png|jpe?g|svg|webp|gif|avif|mp4|webm|mov|woff2?|pdf|ico|ics)$/i

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

let budgetRan = false
if (diff.status !== 0) {
  if (process.env.CI) {
    fail('Size budget could not run', [
      `Cannot compare against ${BASE}.`,
      'In CI, use actions/checkout with fetch-depth: 0 to fetch the full history.',
    ])
  } else {
    console.log(`⚠ size budget skipped: cannot compare against ${BASE}`)
  }
} else {
  budgetRan = true
  // A committed range diff alone only sees history. It misses a file a
  // contributor just dropped into public/ and has not committed yet, so the
  // candidate list is the union of the committed range, the working tree
  // (staged and unstaged), and untracked files under public/.
  const working = spawnSync('git', ['diff', '--name-only', 'HEAD'], { cwd: ROOT, encoding: 'utf8' })
  const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard', 'public/'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  const candidates = new Set([
    ...diff.stdout.split('\n'),
    ...(working.status === 0 ? working.stdout.split('\n') : []),
    ...(untracked.status === 0 ? untracked.stdout.split('\n') : []),
  ])
  const changed = [...candidates].filter(f => f.startsWith('public/') && ASSET.test(f))
  for (const rel of changed) {
    const entry = assetBudget(rel)
    if (!entry) continue
    const full = path.join(ROOT, rel)
    if (!fs.existsSync(full)) continue
    const size = fs.statSync(full).size
    if (size <= entry.limit) continue
    fail('Asset is too large', [
      `${rel} is ${kb(size)}. The budget is ${kb(entry.limit)}.`,
      'Large files slow the page down, and page speed decides conversion.',
      entry.fix(rel),
      'The add-an-image skill does this for you. Ask Claude to use it.',
    ])
  }
}

finish(
  budgetRan
    ? `${scanned} references resolve, changed files within budget`
    : `${scanned} references resolve, size budget not checked`
)
