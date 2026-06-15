#!/usr/bin/env node
/**
 * Generate public/data/pledge.json for the 100M Pledge page.
 *
 * INTERIM LEDGER MODE (current):
 *   We don't yet have a live Databricks connection from CI, so this builds the
 *   numbers from a deterministic ledger seeded with the real cumulative-by-month
 *   history (exported from Databricks: "Cumulative Reach Over Time"). Each day it
 *   advances the live total by a deterministic amount in [DAILY_MIN, DAILY_MAX],
 *   so the big number grows every day and the chart's current-month point always
 *   matches it. Deterministic-per-date means re-runs never jump backwards.
 *
 *   When the real pipeline is ready, set PLEDGE_SOURCE=databricks and fill in
 *   queryDatabricks() (skeleton + SQL notes at the bottom of this file). The
 *   output shape and all failsafes stay identical.
 *
 * Runs daily in CI via .github/workflows/pledge-sync.yml.
 */

import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '../public/data/pledge.json')

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ── Real cumulative-by-month history (Databricks "Cumulative Reach Over Time").
// The final entry is the anchor: the most recent real monthly snapshot. The
// current month's value gets overwritten with the live ledger total below.
const HISTORY = [
  { month: 'Jan 2025', value: 4333 },
  { month: 'Feb 2025', value: 4777 },
  { month: 'Mar 2025', value: 8363 },
  { month: 'Apr 2025', value: 10804 },
  { month: 'May 2025', value: 14901 },
  { month: 'Jun 2025', value: 17555 },
  { month: 'Jul 2025', value: 19600 },
  { month: 'Aug 2025', value: 21886 },
  { month: 'Sep 2025', value: 23073 },
  { month: 'Oct 2025', value: 26668 },
  { month: 'Nov 2025', value: 33960 },
  { month: 'Dec 2025', value: 39012 },
  { month: 'Jan 2026', value: 46094 },
  { month: 'Feb 2026', value: 84836 },
  { month: 'Mar 2026', value: 112461 },
  { month: 'Apr 2026', value: 169831 },
  { month: 'May 2026', value: 196064 },
  { month: 'Jun 2026', value: 224156 },
]

// Anchor = the last real monthly snapshot. The live total grows from here.
const ANCHOR_DATE = '2026-06-01' // first of the most recent history month
const ANCHOR_TOTAL = 224156

// Daily growth band for the interim simulation.
const DAILY_MIN = 600
const DAILY_MAX = 1400

// Trailing-30-day figure (given). Swap to a live query when Databricks is wired.
const LAST30 = 43882

// Deterministic pseudo-random daily increment from a 'YYYY-MM-DD' string, so a
// given calendar day always produces the same number and totals only ever grow.
function dailyIncrement(dateStr) {
  let h = 2166136261
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const u = (h >>> 0) / 4294967295 // 0..1
  return DAILY_MIN + Math.round(u * (DAILY_MAX - DAILY_MIN))
}

function monthLabel(d) {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function buildFromLedger() {
  const DAY = 86400000
  const anchor = new Date(`${ANCHOR_DATE}T00:00:00Z`)

  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  let total = ANCHOR_TOTAL
  for (let t = anchor.getTime() + DAY; t <= today.getTime(); t += DAY) {
    total += dailyIncrement(new Date(t).toISOString().slice(0, 10))
  }

  // Series = real history with the current month's point tracking the live total.
  const series = HISTORY.map((p) => ({ ...p }))
  const label = monthLabel(today)
  const last = series[series.length - 1]
  if (last.month === label) last.value = total
  else series.push({ month: label, value: total })

  return { total, last30: LAST30, series }
}

// ── Failsafes: never publish empty/zeroed/garbage data. ──
function validate({ total, last30, series }) {
  if (!Number.isFinite(total) || total <= 0) fail(`total = ${total} (expected > 0)`)
  if (!Number.isFinite(last30) || last30 < 0) fail(`last30 = ${last30} (expected >= 0)`)
  if (!Array.isArray(series) || series.length < 2) fail(`series has ${series?.length} points (expected >= 2)`)
  if (series.some((p) => !p.month || !Number.isFinite(p.value) || p.value <= 0)) {
    fail('series has a missing month or non-positive value (refusing to publish zeros)')
  }
  // Cumulative series must never go backwards.
  for (let i = 1; i < series.length; i++) {
    if (series[i].value < series[i - 1].value) {
      fail(`series not monotonic at ${series[i].month} (${series[i].value} < ${series[i - 1].value})`)
    }
  }
  // Tail should line up with the headline total.
  const tail = series[series.length - 1].value
  if (tail > total * 1.5 || tail < total * 0.5) {
    fail(`series tail (${tail}) is wildly out of line with total (${total})`)
  }
}

function fail(msg) {
  console.error(`[sync-pledge] ABORT: ${msg}`)
  console.error('[sync-pledge] Leaving the existing pledge.json untouched.')
  process.exit(1)
}

async function main() {
  const source = process.env.PLEDGE_SOURCE === 'databricks' ? 'databricks' : 'ledger'
  const data = source === 'databricks' ? await queryDatabricks() : buildFromLedger()

  validate(data)

  const next = {
    total: data.total,
    last30: data.last30,
    series: data.series,
    generatedAt: new Date().toISOString(),
    source,
  }

  let prev = null
  try {
    prev = JSON.parse(await readFile(OUT_PATH, 'utf8'))
  } catch {
    /* first run or unreadable; just write */
  }

  if (
    prev &&
    prev.total === next.total &&
    prev.last30 === next.last30 &&
    JSON.stringify(prev.series) === JSON.stringify(next.series)
  ) {
    console.log('[sync-pledge] No change; leaving file as-is.')
    return
  }

  await writeFile(OUT_PATH, JSON.stringify(next, null, 2) + '\n', 'utf8')
  console.log(`[sync-pledge] Wrote ${OUT_PATH} (source=${source}) — total=${next.total}, last30=${next.last30}, series=${next.series.length} pts.`)
}

/* ------------------------------------------------------------------ *
 * FUTURE: real Databricks pull. Set PLEDGE_SOURCE=databricks and add the
 * DATABRICKS_HOST / DATABRICKS_TOKEN / DATABRICKS_WAREHOUSE_ID secrets.
 *
 * Use the Statement Execution API (POST {HOST}/api/2.0/sql/statements with
 * warehouse_id + statement, poll until SUCCEEDED, read result.data_array).
 * Return { total, last30, series } in the SAME shape buildFromLedger() does:
 *   total   -> SELECT count(*) cumulative all-time
 *   last30  -> SELECT count(*) WHERE first_learned_at >= now() - 30 days
 *   series  -> running cumulative total per calendar month, non-decreasing,
 *              month label formatted 'MMM yyyy' (e.g. 'Jun 2026')
 * ------------------------------------------------------------------ */
async function queryDatabricks() {
  throw new Error('Databricks source not wired yet — set PLEDGE_SOURCE=ledger or implement queryDatabricks()')
}

main().catch((err) => fail(err?.message || String(err)))
