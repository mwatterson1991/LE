# Repo Guardrails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give non-engineer contributors automated guardrails — a `CLAUDE.md`, three check scripts, a required pull request gate, a weekly staleness cron, two hooks, and three skills — so engineering does not review every change.

**Architecture:** Three node scripts under `scripts/checks/` hold all rules, over one shared `lib.mjs` that owns the root directory, the source file walk, and the error format. `npm run check` runs the two gate scripts, and CI runs the same command, so CI can never enforce a rule a contributor cannot reproduce locally. A Claude hook runs `registry.mjs` directly, because it fires only on root-HTML writes and has no need for the asset check. Each rule has one implementation. Every script takes its root directory from `CHECK_ROOT`, which lets the test suite run the real scripts against a throwaway fixture and assert on real exit codes.

**Tech Stack:** Node 22 (`node --test`, `fs.readdirSync` recursive, top-level await), no new npm dependencies, GitHub Actions, `gh` CLI, `sips` for images.

## Global Constraints

- **No new npm dependencies.** Node built-ins only. `node:test` is the test runner.
- **Node 22.** `package.json` gains no `engines` field; CI pins `node-version: 22`.
- **Every script accepts `CHECK_ROOT`.** Default is `process.cwd()`. The tests depend on this.
- **Exit codes are the contract.** `0` clean, `1` findings. Nothing else.
- **Failure messages name the file, the problem, and the exact fix.** No stack traces. This audience cannot act on a trace.
- **Green on day one.** Every gate check passes against the repo as it stands. Verified before planning: 24 root HTML files and 24 Vite inputs with no drift, and 0 missing asset references across 73 scanned files.
- **ASD-STE100 for all prose** in `CLAUDE.md` and the skills: one idea per sentence, active voice, no contractions.

---

### Task 1: `registry.mjs` — pages, Vite inputs, and internal links

This is the check that prevents the silent 404. A page added without a `vite.config.js` input entry builds clean locally and never ships.

The resolution mechanism is `public/_redirects`. It currently holds one rule, `/program/v2 /program-v2 200`, which is how a clean URL reaches a differently named file. The check reads that file rather than keeping a hand-maintained allowlist, so the redirects file stays the single source of truth.

**Files:**
- Create: `scripts/checks/lib.mjs`
- Create: `scripts/checks/registry.mjs`
- Create: `scripts/checks/checks.test.mjs`
- Modify: `package.json` (add the `check` script)
- Modify: `.gitignore` (ignore the test fixture directory)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `scripts/checks/lib.mjs` exports `ROOT` (a resolved absolute path string), `rootPages()` returning root HTML file names, `sourceFiles(pattern = /\.(jsx?|css)$/)` returning absolute paths to root HTML files plus matching files under `src/`, and `reporter(name)` returning `{ fail(title, lines), finish(summary) }`. All three scripts use these. Tasks 2 and 3 depend on these exact names.
  - `scripts/checks/registry.mjs` as a CLI. Reads `CHECK_ROOT` (default `process.cwd()`). Exits `0` clean, `1` on findings. Task 5's hook and Task 4's workflow both invoke it.
  - `checks.test.mjs` exports the fixture helper `makeFixture(name, files)` and holds the `run(script, root)` helper. Tasks 2 and 3 append tests to this file.

- [ ] **Step 1: Write the failing test**

Create `scripts/checks/checks.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/checks/checks.test.mjs`
Expected: FAIL. Every test errors, because `scripts/checks/registry.mjs` does not exist. The `spawnSync` result has a non-zero status and stderr contains `Cannot find module`.

- [ ] **Step 3: Write the shared library**

All three checks need the same three things: the root directory, a walk over the
files that hold links and references, and one error format. Write them once.

Create `scripts/checks/lib.mjs`:

```js
import fs from 'node:fs'
import path from 'node:path'

export const ROOT = path.resolve(process.env.CHECK_ROOT ?? process.cwd())

export function rootPages() {
  return fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))
}

export function sourceFiles(pattern = /\.(jsx?|css)$/) {
  const files = rootPages().map(f => path.join(ROOT, f))
  const src = path.join(ROOT, 'src')
  if (fs.existsSync(src)) {
    for (const rel of fs.readdirSync(src, { recursive: true })) {
      if (pattern.test(rel)) files.push(path.join(src, rel))
    }
  }
  return files
}

export function reporter(name) {
  const problems = []
  return {
    fail(title, lines) {
      problems.push(`✗ ${title}\n${lines.map(line => `  ${line}`).join('\n')}`)
    },
    finish(summary) {
      if (problems.length) {
        console.log(problems.join('\n\n'))
        console.log(`\n${problems.length} problem(s) found. Nothing was changed.`)
        process.exit(1)
      }
      console.log(`✓ ${name}: ${summary}`)
    },
  }
}
```

`sourceFiles` returns root HTML files plus everything under `src/` that matches
the pattern. `reporter` owns both the message shape and the exit code, so no
check can invent its own contract.

- [ ] **Step 4: Write the registry check**

Create `scripts/checks/registry.mjs`:

```js
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
  if (seen.has(target)) return false
  seen.add(target)
  if (target === '/') return pages.includes('index.html')
  if (pages.includes(`${target.slice(1)}.html`)) return true
  const rule = redirects.find(r => normalize(r.from) === target)
  return rule ? resolves(rule.to, pages, redirects, seen) : false
}

const config = (await import(pathToFileURL(path.join(ROOT, 'vite.config.js')).href)).default
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
```

The link loop skips any URL whose last segment carries a file extension, because those are assets and belong to Task 2.

- [ ] **Step 5: Add the npm script and ignore the fixture**

In `package.json`, add to `scripts`:

```json
"check": "node scripts/checks/registry.mjs"
```

Append to `.gitignore`:

```
tmp-check-fixture
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node --test scripts/checks/checks.test.mjs`
Expected: PASS, 4 tests.

Then run: `npm run check`
Expected: `✓ registry: 24 pages registered, all internal links resolve`

- [ ] **Step 7: Prove the check catches a real break**

```bash
cp index.html unregistered-page.html
npm run check    # expect exit 1 naming unregistered-page.html
rm unregistered-page.html
npm run check    # expect exit 0 again
```

- [ ] **Step 8: Commit**

```bash
git add scripts/checks package.json .gitignore
git commit -m "Add page registry check

Fails when a root HTML file has no vite.config.js input entry, when an input
points at a missing file, when a _redirects target resolves to nothing, or
when an internal link goes nowhere. Reads public/_redirects as the source of
truth for clean URLs instead of a hand-maintained allowlist."
```

---

### Task 2: `assets.mjs` — references resolve, new files stay small

Two rules in one script. Every referenced asset must exist, and any asset added or changed in the pull request must fit the budget. The existing 83 MB in `public/` is grandfathered, because the budget looks only at changed files.

**Files:**
- Create: `scripts/checks/assets.mjs`
- Modify: `scripts/checks/checks.test.mjs` (append tests)
- Modify: `package.json` (extend the `check` script)

**Interfaces:**
- Consumes: `ROOT`, `sourceFiles(pattern)`, and `reporter(name)` from `scripts/checks/lib.mjs` (Task 1). Also `makeFixture(name, files)` and `run(script, root)` from `scripts/checks/checks.test.mjs` (Task 1).
- Produces: `scripts/checks/assets.mjs` as a CLI. Reads `CHECK_ROOT` (default `process.cwd()`) and `CHECK_BASE` (default `origin/main`). Exits `0` clean, `1` on findings.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/checks/checks.test.mjs`:

```js
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
```

The encoded test is the one that matters. Three references in this repo contain `%20`, and a check without `decodeURIComponent` reports the files as missing when they are present.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test scripts/checks/checks.test.mjs`
Expected: FAIL on the three new tests with `Cannot find module` for `assets.mjs`. The four Task 1 tests still pass.

- [ ] **Step 3: Write the implementation**

Create `scripts/checks/assets.mjs`:

```js
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
```

- [ ] **Step 4: Extend the npm script**

In `package.json`, replace the `check` script with:

```json
"check": "node scripts/checks/registry.mjs && node scripts/checks/assets.mjs"
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test scripts/checks/checks.test.mjs`
Expected: PASS, 7 tests.

Run: `npm run check`
Expected: both check lines print, and the assets line reports the reference count. The size budget prints its skip note when `origin/main` is not fetched locally. That is correct behavior, not a failure.

- [ ] **Step 6: Prove the budget catches a real break**

```bash
cp public/assets/images/value-prop-1.jpg public/assets/images/tmp-huge.jpg
git add public/assets/images/tmp-huge.jpg
CHECK_BASE=$(git merge-base HEAD main) npm run check   # expect exit 1, "12000 KB"
git rm -f --cached public/assets/images/tmp-huge.jpg && rm public/assets/images/tmp-huge.jpg
```

- [ ] **Step 7: Commit**

```bash
git add scripts/checks/assets.mjs scripts/checks/checks.test.mjs package.json
git commit -m "Add asset reference and size budget check

References are URL-decoded before the file system test, because three current
references contain %20 and exist on disk. The size budget applies only to
files changed in the pull request, so the existing 83 MB in public/ is
grandfathered and the gate is green on day one."
```

---

### Task 3: `stale-cohorts.mjs` — the time-driven report

This one never joins `npm run check`. Staleness is driven by the calendar, not by a diff, and no pull request is open on the morning a cohort date passes.

Two reports. Report A finds cohorts whose date has passed while they still sell. Report B finds date strings hardcoded in page files that `courseData.js` does not know about, which measures the duplication that the follow-up consolidation spec removes.

**Files:**
- Create: `scripts/checks/stale-cohorts.mjs`
- Modify: `scripts/checks/checks.test.mjs` (append one test)

**Interfaces:**
- Consumes: `ROOT` and `sourceFiles(pattern)` from `scripts/checks/lib.mjs` (Task 1). This script does **not** use `reporter`, because it always prints a report and its exit code means "findings", not "broken". Also `src/pages/courseData.js` exports `COURSE_COHORTS` and `SESSION_SCHEDULES`. `COURSE_COHORTS` is an object keyed `1` to `5`; each value is an array of `{ label, iso, scheduleDays, sessionTimes, enrollUrl, soldOut? }`. Note that `iso` is not always a bare date: level 1 holds `'2026-07-14-utah'`, so the script uses `iso.slice(0, 10)`.
- Produces: `scripts/checks/stale-cohorts.mjs` as a CLI. Writes a GitHub-flavored markdown report to stdout. Exits `0` when clean, `1` when it finds anything, which is what Task 4's workflow branches on. Reads `CHECK_ROOT` and `CHECK_TODAY` (an ISO date, for tests).

- [ ] **Step 1: Write the failing test**

Append to `scripts/checks/checks.test.mjs`:

```js
test('stale-cohorts flags a passed cohort that still sells', () => {
  const result = spawnSync('node', [path.join(REPO, 'scripts/checks/stale-cohorts.mjs')], {
    cwd: REPO,
    encoding: 'utf8',
    env: { ...process.env, CHECK_ROOT: REPO, CHECK_TODAY: '2099-01-01' },
  })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /## Report A/)
  assert.match(result.stdout, /Level 1/)
})
```

A `CHECK_TODAY` far in the future makes every cohort in the repo stale, so the test needs no fixture and cannot rot as real dates roll forward.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/checks/checks.test.mjs`
Expected: FAIL with `Cannot find module` for `stale-cohorts.mjs`. The 7 earlier tests still pass.

- [ ] **Step 3: Write the implementation**

Create `scripts/checks/stale-cohorts.mjs`:

```js
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT, sourceFiles } from './lib.mjs'

const TODAY = process.env.CHECK_TODAY ?? new Date().toISOString().slice(0, 10)
const DATA = path.join(ROOT, 'src/pages/courseData.js')

const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December|' +
  'Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec'
const DATE_TEXT = new RegExp(`\\b(?:${MONTHS})\\.?\\s+\\d{1,2}\\b`, 'g')

const { COURSE_COHORTS } = await import(pathToFileURL(DATA).href)

const passed = []
for (const [level, cohorts] of Object.entries(COURSE_COHORTS)) {
  for (const cohort of cohorts) {
    const day = String(cohort.iso).slice(0, 10)
    if (day >= TODAY) continue
    if (!cohort.enrollUrl || cohort.soldOut) continue
    passed.push({ level, label: cohort.label, day })
  }
}

const known = new Set(
  (fs.readFileSync(DATA, 'utf8').match(DATE_TEXT) ?? []).map(s => s.replace('.', ''))
)

const pageFiles = sourceFiles(/\.jsx?$/).filter(f => f !== DATA)

const unknown = []
for (const file of pageFiles) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    for (const found of line.match(DATE_TEXT) ?? []) {
      if (known.has(found.replace('.', ''))) continue
      unknown.push({ file: path.relative(ROOT, file), line: index + 1, found })
    }
  })
}

const out = [`# Cohort data report for ${TODAY}`, '']

out.push('## Report A: cohorts that have started and still sell', '')
if (passed.length === 0) {
  out.push('None. Every enrollable cohort is in the future.', '')
} else {
  out.push('These cohorts have started and still carry an enroll URL.', '')
  out.push('| Level | Cohort | Start date |', '| --- | --- | --- |')
  for (const row of passed) out.push(`| Level ${row.level} | ${row.label} | ${row.day} |`)
  out.push('')
  out.push('`CohortPicker` hides started cohorts, so these are not on sale through')
  out.push('the picker right now. The risk is the fallback in `ENROLL_URL`: when no')
  out.push('future cohort remains for a level, checkout links to a started one.')
  out.push('Levels with a single cohort reach that state first.', '')
  out.push('Fix: mark each one `soldOut: true`, or remove it from `COURSE_COHORTS`')
  out.push('in `src/pages/courseData.js`. Ask Claude to use the roll-cohort-dates skill.', '')
}

out.push('## Report B: dates in page files that courseData.js does not know', '')
if (unknown.length === 0) {
  out.push('None.', '')
} else {
  out.push(`${unknown.length} hardcoded date string(s) in ${new Set(unknown.map(u => u.file)).size} file(s).`)
  out.push('Each one is a copy that a date roll can miss.', '')
  const byFile = new Map()
  for (const row of unknown) {
    if (!byFile.has(row.file)) byFile.set(row.file, [])
    byFile.get(row.file).push(`line ${row.line}: ${row.found}`)
  }
  for (const [file, hits] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
    out.push(`- **${file}** — ${hits.length}`)
    for (const hit of hits.slice(0, 5)) out.push(`  - ${hit}`)
    if (hits.length > 5) out.push(`  - and ${hits.length - 5} more`)
  }
  out.push('')
}

console.log(out.join('\n'))
process.exit(passed.length || unknown.length ? 1 : 0)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/checks/checks.test.mjs`
Expected: PASS, 8 tests.

- [ ] **Step 5: Run the report against today and record the number**

Run: `node scripts/checks/stale-cohorts.mjs`

Expected, measured on 2026-08-12 while planning: Report A lists 6 cohorts, and Report B lists **339 hardcoded date strings across 15 files**. The largest are `SiliconSlopesAiBuilderPage.jsx` at 67, `TeamsProgramPage.jsx` at 65, and `HomePageRebrand.jsx` at 49. Put the numbers you get in the commit message. They are the baseline the consolidation spec must drive down.

If your Report B count is far below 339, the date regex is not matching. Check that both the full and abbreviated month names are in the `MONTHS` string.

- [ ] **Step 6: Commit**

```bash
git add scripts/checks/stale-cohorts.mjs scripts/checks/checks.test.mjs
git commit -m "Add cohort staleness report

Report A finds cohorts that have started while they still carry an enroll URL.
Report B counts hardcoded dates that courseData.js does not know about.

Deliberately not part of npm run check. Staleness is driven by the calendar,
so no pull request is open when a date goes stale. Task 4 runs this weekly."
```

---

### Task 4: The CI gate and the weekly cron

**Files:**
- Create: `.github/workflows/pr-checks.yml`
- Create: `.github/workflows/cohort-watch.yml`

**Interfaces:**
- Consumes: `npm run check` from Tasks 1 and 2, `node --test scripts/checks/checks.test.mjs`, `npm run build`, and `scripts/checks/stale-cohorts.mjs` from Task 3 with its exit code contract.
- Produces: a status check named `checks` for branch protection.

Note: this repo removed its GitHub Actions in commit `cf3efd6`. Cloudflare builds from `main` on its own, so neither workflow deploys anything. `pr-checks.yml` is a gate and `cohort-watch.yml` is a reporter.

- [ ] **Step 1: Write the pull request gate**

Create `.github/workflows/pr-checks.yml`:

```yaml
name: PR checks

on:
  pull_request:
    branches: [main]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Repo checks
        run: npm run check
        env:
          CHECK_BASE: origin/${{ github.base_ref }}
      - name: Check the checks
        run: node --test scripts/checks/checks.test.mjs
      - name: Production build
        run: npm run build
```

`fetch-depth: 0` is required. Without the full history the size budget cannot diff against the base branch, and it would silently skip.

- [ ] **Step 2: Write the weekly cron**

Create `.github/workflows/cohort-watch.yml`:

```yaml
name: Cohort watch

on:
  schedule:
    - cron: '0 14 * * 1'
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  watch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Build the report
        id: report
        run: |
          if node scripts/checks/stale-cohorts.mjs > report.md; then
            echo "findings=false" >> "$GITHUB_OUTPUT"
          else
            echo "findings=true" >> "$GITHUB_OUTPUT"
          fi
      - name: File or update the issue
        if: steps.report.outputs.findings == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh label create cohort-watch --color FBCA04 --description "Cohort data needs a refresh" || true
          existing=$(gh issue list --label cohort-watch --state open --json number --jq '.[0].number // empty')
          if [ -n "$existing" ]; then
            gh issue comment "$existing" --body-file report.md
          else
            gh issue create --title "Cohort data needs a refresh" --label cohort-watch --body-file report.md
          fi
```

There is no `npm ci` step, because `stale-cohorts.mjs` imports only `courseData.js`, which has no imports of its own. The job stays fast.

The existing-issue lookup prevents a weekly duplicate. A repeated finding becomes a comment on the open issue, so the guardrail does not get muted as spam.

- [ ] **Step 3: Verify the workflow files parse**

Run: `node -e "const fs=require('node:fs'); for (const f of fs.readdirSync('.github/workflows')) console.log(f, fs.readFileSync('.github/workflows/'+f,'utf8').split('\n').length + ' lines')"`
Expected: both files listed. Real validation happens on the first pull request; `act` is not installed and is not worth adding.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/pr-checks.yml .github/workflows/cohort-watch.yml
git commit -m "Add PR check gate and weekly cohort watch

PR checks runs npm run check, the check test suite, and the production build.
Cloudflare still deploys from main, so neither workflow deploys.

Cohort watch runs Mondays and files or updates one issue, so a repeated
finding never becomes weekly spam."
```

- [ ] **Step 5: Note the manual follow-up**

Branch protection is set in the GitHub UI, not in the repo. After this branch merges, require the `checks` status check on `main`. Until that is on, CI is decoration. Add this to the pull request description so it is not forgotten.

---

### Task 5: Two hooks

Hooks make an action impossible. Advice belongs in skills, so there are only two.

**Files:**
- Create: `.claude/hooks/block-generated-writes.mjs`
- Create: `.claude/hooks/check-page-registry.mjs`
- Create: `.claude/settings.json`

**Interfaces:**
- Consumes: `scripts/checks/registry.mjs` from Task 1.
- Produces: nothing that later tasks use.

Claude Code hooks read a JSON event on stdin. The field this needs is `tool_input.file_path`. Exit code `2` blocks the call for `PreToolUse` and feeds stderr back to Claude for `PostToolUse`. Any other non-zero code is a hook error, so both scripts exit `0` or `2` only.

- [ ] **Step 1: Write the generated-write blocker**

Create `.claude/hooks/block-generated-writes.mjs`:

```js
let raw = ''
for await (const chunk of process.stdin) raw += chunk

let filePath = ''
try {
  filePath = JSON.parse(raw || '{}').tool_input?.file_path ?? ''
} catch {
  process.exit(0)
}

if (/(^|\/)(dist|node_modules)\//.test(filePath)) {
  console.error(
    `Refusing to write ${filePath}.\n` +
      'dist/ and node_modules/ are generated and git-ignored, so the change would be lost.\n' +
      'Edit the source in src/ or a root .html file, then run npm run build.'
  )
  process.exit(2)
}
process.exit(0)
```

A malformed payload exits `0`. A hook must never block work because it failed to parse something.

- [ ] **Step 2: Write the page registry hook**

Create `.claude/hooks/check-page-registry.mjs`:

```js
import path from 'node:path'
import { spawnSync } from 'node:child_process'

let raw = ''
for await (const chunk of process.stdin) raw += chunk

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
let filePath = ''
try {
  filePath = JSON.parse(raw || '{}').tool_input?.file_path ?? ''
} catch {
  process.exit(0)
}

if (!filePath) process.exit(0)
const rel = path.relative(root, filePath)
if (!/^[^/]+\.html$/.test(rel)) process.exit(0)

const result = spawnSync('node', [path.join(root, 'scripts/checks/registry.mjs')], {
  cwd: root,
  encoding: 'utf8',
})
if (result.status === 0) process.exit(0)

console.error(`${rel} changed and the page registry check now fails:\n\n${result.stdout}`)
process.exit(2)
```

The regex `^[^/]+\.html$` matches root pages only, so edits under `src/` do not trigger it.

- [ ] **Step 3: Write the settings file**

Create `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/block-generated-writes.mjs\"",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/check-page-registry.mjs\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

Only `.claude/settings.local.json` is personal. This file is committed and shared, which is the point.

- [ ] **Step 4: Verify both hooks by feeding them a payload**

```bash
echo '{"tool_input":{"file_path":"/x/dist/index.html"}}' \
  | node .claude/hooks/block-generated-writes.mjs; echo "exit=$?"   # expect exit=2

echo '{"tool_input":{"file_path":"/x/src/App.jsx"}}' \
  | node .claude/hooks/block-generated-writes.mjs; echo "exit=$?"   # expect exit=0

CLAUDE_PROJECT_DIR=$PWD sh -c 'echo "{\"tool_input\":{\"file_path\":\"$PWD/program.html\"}}" \
  | node .claude/hooks/check-page-registry.mjs'; echo "exit=$?"     # expect exit=0
```

- [ ] **Step 5: Commit**

```bash
git add .claude/hooks .claude/settings.json
git commit -m "Add two Claude hooks

PreToolUse blocks writes under dist/ and node_modules/, which are generated
and git-ignored. PostToolUse runs the page registry check after a root HTML
write, so a missing vite input entry gets fixed in the same turn instead of
at CI."
```

---

### Task 6: `CLAUDE.md`

The repo has none today. This is the cheapest guardrail in the plan, because it loads on every session.

**Files:**
- Create: `CLAUDE.md`

**Interfaces:**
- Consumes: `npm run check` from Tasks 1 and 2, and the three skill names from Tasks 7 and 8.
- Produces: nothing.

- [ ] **Step 1: Write the file**

Create `CLAUDE.md`:

```markdown
# CLAUDE.md

This repo is the AI Builder Program marketing site. Most contributors are not
engineers. Keep changes small, and let the checks catch mistakes.

## Before you open a pull request

Run `npm run check` and `npm run build`. Both must pass. CI runs the same two
commands, so a local pass means a green pull request.

## Cohort dates and prices

`src/pages/courseData.js` is the source of truth. `COURSE_COHORTS` holds every
cohort and `ENROLL_URLS` holds every checkout link.

Dates are still hardcoded in many page files. That is known duplication, and it
is the top source of bugs in this repo. Never add a new hardcoded date. When a
date has to change, use the roll-cohort-dates skill so every copy moves
together.

## Adding a page

Every root `*.html` file needs an entry in the `input` map in `vite.config.js`.
Without it the page builds locally and returns 404 in production. Use the
add-a-page skill, which covers the whole checklist.

A clean URL that does not match a file name needs a rule in
`public/_redirects`. That is how `/program/v2` reaches `program-v2.html`.

## Images and video

The budget is 400 KB per image and 2 MB per video. Camera and stock exports run
20 to 40 times over it. Use the add-an-image skill, which resizes before the
file is committed. Page weight decides conversion on this site.

## Never edit these

`dist/` and `node_modules/` are generated and git-ignored. Edit the source, then
run `npm run build`. A hook blocks writes to both.

## How it deploys

Cloudflare builds from `main` automatically. A broken build ships nothing and
silently keeps the previous version live, so a red pull request check means the
change would not have shipped.
```

- [ ] **Step 2: Verify every claim in the file**

```bash
npm run check && npm run build   # the two commands the file promises
grep -c "COURSE_COHORTS\|ENROLL_URLS" src/pages/courseData.js   # expect 2 or more
cat public/_redirects            # expect the /program/v2 rule
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Add CLAUDE.md

Loads every session. Names the source of truth for cohort data, the page
registration rule, the asset budget, the two commands to run before a pull
request, and how Cloudflare deploys."
```

---

### Task 7: `add-a-page` skill

The full checklist for a new page. Six places, and a miss in any one of them ships a broken page.

**Files:**
- Create: `.claude/skills/add-a-page/SKILL.md`

**Interfaces:**
- Consumes: `vite.config.js` input map, `public/_redirects`, the `pageNames` map at `src/App.jsx:1724`, the route chain starting at `src/App.jsx:1737`, the internal link list in `src/components/Footer.jsx:50-54`.
- Produces: nothing.

Facts to encode, all verified in the current tree:

- `src/App.jsx` routes on `window.location.pathname` with a chain of `path.startsWith(...)` checks that begins at line 1737. Order matters. `/program-for-teams` is tested before `/program`, and `/program/v2` before `/program`. A new route that shares a prefix with an existing one must go above it.
- The analytics page name comes from the `pageNames` map at line 1724, and falls back to `'Home'`. A page added without an entry reports as `Home` in the data layer.
- `src/components/Nav.jsx` has no internal links. Only `Footer.jsx` does, at lines 50 to 54.

- [ ] **Step 1: Write the skill**

Create `.claude/skills/add-a-page/SKILL.md`:

```markdown
---
name: add-a-page
description: >
  Add a new page to the AI Builder Program marketing site, or wire up a page
  that already exists but does not appear in production. Use when the user asks
  for a new page, a new landing page, a campaign URL, a partner page, or a new
  route. Also use when a page works locally and 404s in production, which is
  almost always a missing Vite input entry.
---

# Add a page

This site is a Vite multi-page build. Each page needs an entry in six places.
A miss in any one of them ships a broken page.

Run `npm run check` at the end. It catches items 1, 2, and 4 automatically.

## 1. The HTML entry file

Create `<name>.html` in the repo root. Copy an existing one, for example
`program.html`, which is the smallest. Keep the `<div id="root">` and the module
script that loads `/src/main.jsx`. Update `<title>` and the meta description.

## 2. The Vite input map

Add the file to `build.rollupOptions.input` in `vite.config.js`:

```js
'<name>': resolve(__dirname, '<name>.html'),
```

**This is the step that gets missed.** Without it the page builds locally and
returns 404 in production, because Cloudflare only serves what the build wrote
to `dist/`.

## 3. The route in src/App.jsx

`App` routes on `window.location.pathname` with a chain of `startsWith` checks.
Add a branch that returns the page component:

```jsx
if (path.startsWith('/<name>')) {
  return <YourPage />
}
```

**Order matters.** A route that shares a prefix with an existing route must go
above it. `/program-for-teams` sits above `/program` for this reason. If you put
it below, `/program` matches first and the new page never renders.

## 4. A redirect, only if the URL does not match the file name

A clean URL that matches the file name needs nothing. `/reviews` reaches
`reviews.html` on its own.

A URL with a different shape needs a rule in `public/_redirects`:

```
/program/v2 /program-v2 200
```

Status `200` rewrites and keeps the URL in the address bar. Status `301`
redirects and changes it. Marketing URLs almost always want `200`.

## 5. The analytics page name

Add the path to the `pageNames` map in `src/App.jsx`:

```js
'/<name>': 'Readable Name',
```

Without it the page reports as `Home` in the data layer, and its traffic is
invisible in reporting.

## 6. Footer links, when the page is permanent

`src/components/Footer.jsx` holds the internal links, in the AI Builder column.
`Nav.jsx` has no internal links, so it needs no change.

Skip this for a campaign or partner page that should not be discoverable.

## Verify before you finish

```bash
npm run check   # registry and assets
npm run build   # the real production build
npm run dev     # then open http://localhost:5173/<name>
```

Confirm `dist/<name>.html` exists after the build. If it does not, step 2 is
missing.
```

- [ ] **Step 2: Verify the line references still hold**

```bash
grep -n "pageNames = {" src/App.jsx                    # expect near line 1724
grep -n "path.startsWith('/program-for-teams')" src/App.jsx
grep -n "path.startsWith('/program')" src/App.jsx      # must be the later line
grep -n 'href="/program"' src/components/Footer.jsx
```

If a line number moved, correct the skill text. If `/program` appears before `/program-for-teams`, stop and say so — that would be a live routing bug, not a documentation problem.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/add-a-page/SKILL.md
git commit -m "Add add-a-page skill

Six places a new page must be registered: HTML entry, Vite input map, App.jsx
route, _redirects rule when the URL and file name differ, the analytics
pageNames map, and Footer links. Explains why route order matters."
```

---

### Task 8: `roll-cohort-dates` and `add-an-image` skills

Two short skills. Both codify work that has already been done by hand.

**Files:**
- Create: `.claude/skills/roll-cohort-dates/SKILL.md`
- Create: `.claude/skills/add-an-image/SKILL.md`

**Interfaces:**
- Consumes: `scripts/checks/stale-cohorts.mjs` from Task 3, and `src/pages/courseData.js`.
- Produces: nothing.

Measured facts for the image skill, all confirmed on this machine:

- `sips` is at `/usr/bin/sips` and ships with macOS. It **cannot write WebP**: `sips -s format webp` fails with `Can't write format: org.webmproject.webp`. So the skill uses JPEG and PNG.
- `public/assets/images/value-prop-1.jpg` is 12 MB at 7952 by 5304 pixels. `sips -Z 1600 -s format jpeg -s formatOptions 72` produces 254 KB at 1600 by 1067, which is inside the 400 KB budget. That is a 48-fold reduction.
- `ffmpeg` is present at `/opt/homebrew/bin/ffmpeg` on this machine, but it is a Homebrew install and not guaranteed elsewhere. The skill guards for it.

- [ ] **Step 1: Write the roll-cohort-dates skill**

Create `.claude/skills/roll-cohort-dates/SKILL.md`:

```markdown
---
name: roll-cohort-dates
description: >
  Update cohort start dates, session schedules, sold-out flags, or enroll URLs
  across the site. Use when the user says a cohort date changed, a cohort sold
  out, a cohort has already started, dates are stale or wrong, or when the
  cohort-watch issue asks for a refresh. Also use when adding a new cohort.
---

# Roll cohort dates

Cohort data is duplicated across many files. `src/pages/courseData.js` is the
source of truth, but dates are also hardcoded in root HTML files and in the
large page components. A partial update advertises a date that has passed, or
sells a cohort that has begun.

## 1. See the current damage

```bash
node scripts/checks/stale-cohorts.mjs
```

Report A lists cohorts that have started while they still sell. Report B lists
every hardcoded date that `courseData.js` does not know about. Read both before
you edit anything.

## 2. Get the truth

Databricks holds the real cohort records. Ask the user for the correct dates if
you cannot reach it. Never guess a date, and never carry a date forward by
adding weeks to an old one.

## 3. Update courseData.js first

Edit `src/pages/courseData.js`:

- `COURSE_COHORTS` — one array per level, keyed `1` to `5`.
- Each entry needs `label`, `iso`, `scheduleDays`, `sessionTimes`, `enrollUrl`.
- `iso` is normally `YYYY-MM-DD`. Level 1 uses `2026-07-14-utah` for an
  in-person cohort, so a suffix is allowed. Keep the first ten characters a
  valid date.
- Add `soldOut: true` rather than deleting a cohort that has started. Deleting
  loses the record; the flag stops the sale.
- `ENROLL_URLS` holds the default checkout link per level. A cohort with its
  own `enrollUrl` overrides it.

## 4. Sweep the copies

Search for the old date in every form it takes:

```bash
grep -rn "August 4" --include="*.jsx" --include="*.html" src .
grep -rn "2026-08-04" --include="*.jsx" --include="*.html" src .
```

Search the written month name and the ISO form separately. Commit `8048846`
had to sweep five landing page files by hand, and commit `6e7fc2b` found
`App.jsx` and `HomePageRebrand.jsx` as two separate discoveries. Assume there
is one more file than you have found.

## 5. Verify

```bash
node scripts/checks/stale-cohorts.mjs   # Report A must be empty
npm run check
npm run build
```

Report A must be clean. Report B will still list the remaining duplication,
which is expected until the consolidation work lands.

In your summary, state which levels changed and which you confirmed were
already correct. The date roll commits do this, and it makes review fast.
```

- [ ] **Step 2: Write the add-an-image skill**

Create `.claude/skills/add-an-image/SKILL.md`:

```markdown
---
name: add-an-image
description: >
  Add, replace, or shrink an image or video in this repo. Use when the user
  wants a new photo, hero image, logo, screenshot, or video on a page, when
  they hand over a file from a camera, a phone, or a stock site, or when the
  asset size check fails in a pull request.
---

# Add an image

The budget is **400 KB per image** and **2 MB per video**. Camera and stock
exports run 20 to 40 times over it. Shrink the file **before** you commit it.

Page weight decides conversion on this site. This is not housekeeping.

## Resize with sips

`sips` ships with macOS, so it needs no install.

Photos and screenshots:

```bash
sips -Z 1600 -s format jpeg -s formatOptions 72 input.jpg --out public/assets/images/name.jpg
```

`-Z 1600` caps the longest side at 1600 pixels and keeps the aspect ratio.
`formatOptions 72` sets JPEG quality. A real example from this repo: a 12 MB
file at 7952 by 5304 pixels became 254 KB at 1600 by 1067.

Use `-Z 2400` only for a full-bleed hero on a wide screen. Use `-Z 800` for a
card or thumbnail.

Images that need transparency stay PNG:

```bash
sips -Z 1200 input.png --out public/logos/name.png
```

Do not ask `sips` to write WebP. It cannot, and it fails with
`Can't write format: org.webmproject.webp`.

## Video

Check for `ffmpeg` first, because it is not installed everywhere:

```bash
command -v ffmpeg || echo "ffmpeg missing: ask the user to shrink the video, or run: brew install ffmpeg"
ffmpeg -i input.mp4 -vf "scale=-2:1080" -vcodec libx264 -crf 30 -an public/assets/videos/name.mp4
```

`-an` drops the audio track. Background video on this site is always muted, and
the audio is pure page weight.

## Where files go

- `public/assets/images/` — photos and illustrations
- `public/logos/` — brand and partner logos
- `public/assets/videos/` — video

Reference them from the site root, not with a relative path:

```jsx
<img src="/assets/images/name.jpg" alt="A short description of the picture" />
```

Never write `../public/...`. That path breaks in the build.

## Avoid spaces in file names

Three current files have spaces, which forces `%20` in the reference and is
easy to get wrong. Use hyphens for anything new.

## Always write alt text

Describe what the picture shows. Leave `alt=""` only for pure decoration.

## Verify

```bash
ls -lh public/assets/images/name.jpg   # confirm under 400 KB
npm run check
```
```

- [ ] **Step 3: Verify the commands in both skills actually run**

```bash
img=$(find public -name '*.jpg' -size +2M | head -1)
sips -Z 1600 -s format jpeg -s formatOptions 72 "$img" --out /tmp/verify.jpg
ls -lh /tmp/verify.jpg      # expect well under 400 KB
node scripts/checks/stale-cohorts.mjs | head -20
```

If any command in either skill fails, fix the skill. A skill with a broken command is worse than no skill, because it teaches the wrong thing.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/roll-cohort-dates .claude/skills/add-an-image
git commit -m "Add roll-cohort-dates and add-an-image skills

roll-cohort-dates codifies the manual sweep from 8048846 and 6e7fc2b, and
starts from the staleness report.

add-an-image uses sips, which ships with macOS. sips cannot write WebP on
current macOS, so the skill uses JPEG and PNG. Verified numbers: a 12 MB
7952px export becomes 254 KB at 1600px."
```

---

## Done means

- [ ] `npm run check` exits 0 on a clean tree.
- [ ] `node --test scripts/checks/checks.test.mjs` passes 8 tests.
- [ ] `npm run build` passes.
- [ ] A deliberately unregistered page makes `npm run check` exit 1 with a message naming the fix.
- [ ] A hook blocks a write to `dist/`.
- [ ] `node scripts/checks/stale-cohorts.mjs` prints both reports.
- [ ] The pull request description asks an admin to require the `checks` status check on `main`.

## Out of scope

Consolidating the duplicated cohort data. That is the follow-up spec. Report B
of `stale-cohorts.mjs` measures the problem and stays a report until the
consolidation makes it passable, at which point it becomes a blocking check.

## Hand this to the consolidation spec

Three findings from planning, all verified in the current tree. They belong to
the follow-up work, not to this plan.

1. **"Which cohort is next" is implemented three times, and the copies
   disagree.** `hasNotStarted` at `src/components/CohortPicker.jsx:20`,
   `new Date(c.iso) >= now` inside `ENROLL_URL` at `src/App.jsx:24` and
   `src/pages/HomePageRebrand.jsx:19`, and a stricter regex-guarded version in
   `NEXT_COHORT_DISPLAY` at `src/pages/HomePageRebrand.jsx:27`. One shared
   helper in `courseData.js` should replace all four.
2. **The `ENROLL_URL` version mishandles the suffixed ISO value.**
   `new Date('2026-07-14-utah')` is `Invalid Date`, and any comparison with it
   is `false`, so that cohort is skipped silently rather than by intent.
   `NEXT_COHORT_DISPLAY` guards against this with a regex. `ENROLL_URL` does
   not.
3. **The fallback links to a started cohort.** When no future cohort remains,
   `ENROLL_URL` falls back to the first enrollable cohort regardless of date.
   Levels 4 and 5 each hold a single cohort today, so they reach that state
   first.
