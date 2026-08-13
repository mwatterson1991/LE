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
grep -rn "August 4" --include="*.jsx" --include="*.html" --exclude-dir=node_modules --exclude-dir=dist .
grep -rn "2026-08-04" --include="*.jsx" --include="*.html" --exclude-dir=node_modules --exclude-dir=dist .
```

Search the written month name and the ISO form separately. Commit `8048846`
had to sweep five landing page files by hand, and commit `6e7fc2b` found
`App.jsx` and `HomePageRebrand.jsx` as two separate discoveries. Assume there
is one more file than you have found.

## 5. Verify

First, confirm the old date is gone from every page file:

```bash
grep -rn "August 4" --include="*.jsx" --include="*.html" --exclude-dir=node_modules --exclude-dir=dist .
grep -rn "2026-08-04" --include="*.jsx" --include="*.html" --exclude-dir=node_modules --exclude-dir=dist .
```

No page file may still contain the old date. Both greps must print zero results.

Then confirm the staleness report is clean:

```bash
node scripts/checks/stale-cohorts.mjs   # Report A must be empty
```

Report A must list no cohorts. If any remain, mark them `soldOut: true` in
`courseData.js` and re-run this check. Report B will still list remaining
duplication, which is expected until the consolidation work lands.

Then run the full test suite:

```bash
npm run check
npm run build
```

In your summary, state which levels changed and which you confirmed were
already correct. The date roll commits do this, and it makes review fast.
