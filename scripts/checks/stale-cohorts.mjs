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

let COURSE_COHORTS
try {
  ;({ COURSE_COHORTS } = await import(pathToFileURL(DATA).href))
} catch {
  console.error(
    'src/pages/courseData.js failed to load, so the cohort report could not run.\n' +
      'This usually means a recent edit introduced a syntax error.\n' +
      'Fix: run `npm run build` in your terminal to see the real error, then correct src/pages/courseData.js.'
  )
  process.exit(1)
}

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
// Report B (unknown.length) is measurement for the follow-up consolidation
// project, not an actionable finding yet — it stays in the printed report
// but must not drive the exit code, or the weekly cron never goes quiet.
process.exit(passed.length ? 1 : 0)
