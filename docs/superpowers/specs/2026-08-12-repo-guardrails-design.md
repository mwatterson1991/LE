# Repo guardrails for non-engineer contributors

Date: 2026-08-12
Status: approved, ready for implementation planning

## Problem

Most commits in this repo come from non-engineers. Engineering does not want to
review every change. The repo has no `CLAUDE.md`, no CI, no hooks, and no
checks. Nothing catches a mistake before it reaches production.

Production deploys run from Cloudflare, which builds automatically on push to
`main`. A broken build therefore ships nothing and keeps the previous deploy
live. The failure is silent. Nobody learns that the change did not ship.

The risks in this repo are not code style. They are, in order:

1. **Duplicated cohort and price data.** `src/pages/courseData.js` holds
   `COURSE_COHORTS` and `ENROLL_URLS`. The same dates are also hardcoded in
   `src/App.jsx`, `src/pages/HomePageRebrand.jsx`,
   `src/pages/ProgramV2Page.jsx`, and about 15 root HTML files. Commit
   `8048846` swept five landing page files by hand. Commit `6e7fc2b` patched
   `App.jsx` and `HomePageRebrand.jsx` as two separate discoveries. A missed
   file advertises a passed date or a dead enroll URL.
2. **Silent deploy failure.** No pull request check exists. A page added
   without a `vite.config.js` input entry builds clean and returns 404 in
   production.
3. **Broken links and missing assets.** Commit `54c23e0` fixed footer 404s.
4. **Asset weight.** `public/` holds 83 MB. One image is 12 MB. One video is
   10 MB. Page weight decides conversion on a marketing site.
5. **Very large page files.** `src/App.jsx` is 1,777 lines and holds the
   router. Two page files exceed 2,300 lines. Every editor touches the same
   files.

## Scope

This spec covers guardrails only: `CLAUDE.md`, the checks, the CI gate, the
hooks, and the skills.

Consolidating the duplicated cohort data is a refactor, not a guardrail. It
gets its own spec and its own pull request. This spec builds the report that
measures the problem, so the refactor starts with real numbers.

## Sequence

Three pull requests, in this order:

1. `CLAUDE.md`, the check scripts, the CI gate, the hooks, and the skills. The
   gate passes against the repo as it stands today.
2. Consolidate the cohort data. Separate spec.
3. Promote report B of `stale-cohorts.mjs` to a blocking pull request check,
   once step 2 makes it pass. Report A stays a cron report forever.

A gate that fails on day one gets bypassed, not obeyed. Every check in step 1
is green against the current repo, or it is grandfathered.

## File layout

```
CLAUDE.md                          about 30 lines, always loaded
scripts/checks/lib.mjs             shared root, file walk, and error format
scripts/checks/registry.mjs        pages, vite inputs, internal links
scripts/checks/assets.mjs          asset refs exist, size budget on changed files
scripts/checks/stale-cohorts.mjs   time-driven staleness report
scripts/checks/checks.test.mjs     node:test, proves the checks catch a real break
.github/workflows/pr-checks.yml    the merge gate
.github/workflows/cohort-watch.yml weekly cron
.claude/settings.json              two hooks
.claude/skills/add-a-page/SKILL.md
.claude/skills/roll-cohort-dates/SKILL.md
.claude/skills/add-an-image/SKILL.md
```

`npm run check` runs the gate scripts, and CI runs the same command, so CI can
never enforce a rule that a contributor cannot reproduce locally. The hook runs
`registry.mjs` directly, because it fires only on root-HTML writes and has no
need for the asset check. Each rule has one implementation.

## Component: `registry.mjs`

**Purpose.** Prove that every page ships and every internal link resolves.

**Input.** The repository working tree.

**Method.** Import `vite.config.js` directly. `defineConfig` returns the plain
object, so the real input map is available without text parsing.

**Assertions.**

1. Every root `*.html` file has an entry in the Vite input map.
2. Every input entry points at a file that exists.
3. Every internal `href="/x"` in `src/` and root HTML resolves to a page.

4. Every target in `public/_redirects` resolves to a real page.

**Clean URL resolution.** `public/_redirects` already exists and holds
`/program/v2 /program-v2 200`. That file is how a clean URL reaches a
differently named build output, so the check reads it as the source of truth. No
hand-maintained allowlist is needed. A link resolves when it matches
`index.html`, matches `<name>.html`, or follows a redirect rule to something
that does. An unmatched link fails and names both fixes: create the page, or add
a redirect rule.

**Exit code.** 0 when clean, 1 on any failure.

**Current state.** Passes. 24 root HTML files and 24 Vite inputs, with no
drift.

## Component: `assets.mjs`

**Purpose.** Stop missing assets and oversized new assets.

**Assertion 1, references resolve.** Collect every `src`, `href`, and
`url(...)` reference to a path ending in an asset extension. Call
`decodeURIComponent` on each path before testing the file system. Three
current references contain `%20`, and a check without decoding reports them as
missing when the files are present.

**Assertion 2, size budget.** The budget applies only to files added or
modified in the pull request, found with `git diff --name-only` against the
base branch. The existing 83 MB is grandfathered. Budget: 400 KB per image,
2 MB per video. A new 12 MB hero image fails.

**Exit code.** 0 when clean, 1 on any failure.

## Component: `stale-cohorts.mjs`

**Purpose.** Report cohort data that time has invalidated.

**Why this is not a merge gate.** Staleness is driven by the calendar, not by a
diff. No pull request is open on the morning a cohort date passes. A pull
request check cannot catch it.

**Trigger.** Weekly cron in `.github/workflows/cohort-watch.yml`.

**Output.** A GitHub issue holding two reports.

- **Report A, passed cohorts.** Every entry in `COURSE_COHORTS` whose `iso`
  date has passed while it still carries an `enrollUrl` and lacks `soldOut`.
- **Report B, raw dates in page files.** Every page file containing a date
  string that does not match `courseData.js`.

**Blocking.** Report A never blocks, because the calendar moves with no pull
request open. Report B blocks starting at step 3 of the sequence, because a
contributor who hardcodes a date does so inside a diff. Until step 2
consolidates the existing copies, report B would fail against roughly 15 files,
so it stays a report during steps 1 and 2.

Both reports feed the `roll-cohort-dates` skill.

## Failure message format

For non-engineer contributors the message is the guardrail. Every failure
prints the file, the problem, and the exact fix. No stack traces.

```
✗ Page not registered
  scaling.html exists but has no entry in vite.config.js.
  It will build fine locally and return 404 in production.
  Fix: add   'scaling': resolve(__dirname, 'scaling.html'),
  to the input map in vite.config.js.
```

## Component: `pr-checks.yml`

Runs on pull requests to `main`. Steps: install dependencies, `npm run check`,
`node --test scripts/checks/checks.test.mjs`, `npm run build`. The build takes 1.5 seconds
today, so the whole job stays well under a minute.

This workflow becomes a required status check under branch protection. Without
a required check, CI is decoration.

## Component: hooks in `.claude/settings.json`

Two hooks only. Hooks make an action impossible. Advice belongs in skills.

1. **`PreToolUse`** on `Edit|Write`. Block any write under `dist/`. That
   directory is generated by Vite and ignored by git.
2. **`PostToolUse`** on `Write`. When the written path is a root `*.html`, run
   `registry.mjs`. Claude then repairs a missing input entry in the same turn
   instead of at CI.

## Component: skills

**`add-a-page`.** The full checklist for a new page: create the HTML entry,
register the Vite input, add nav and footer links, add the PostHog page name in
the `pageNames` map in `src/App.jsx`, then run the build.

**`roll-cohort-dates`.** Codifies commit `6e7fc2b`. Read the truth from
Databricks, update `courseData.js`, sweep the inline copies, run the checks.

**`add-an-image`.** Resize and convert to WebP with `sips`, which ships with
macOS. No new dependency.

## Component: `CLAUDE.md`

About 30 lines, always loaded. Contents: `courseData.js` is the one source of
truth for cohort data; never edit `dist/`; register every new page in
`vite.config.js`; the image budget; run `npm run check` and `npm run build`
before opening a pull request.

## Testing

`scripts/checks/checks.test.mjs` uses the node built-in test runner, so it adds
no dependency. Two assertions:

1. The checks exit 0 against the repository as it stands.
2. The checks exit 1 against a temporary fixture holding an unregistered page.

CI runs this test. It guards the guard, so the gate cannot silently pass
everything.

## Rejected

- **Prettier and ESLint.** Nobody reviews style here, and a config file is a
  thing to maintain. Add later if wanted.
- **Pull request template.** Claude writes the descriptions. A checklist
  becomes noise.
- **Playwright.** No end-to-end tests yet. One smoke test may earn its place
  later.
- **A `.claude/rules/` tree.** The monorepo has twelve rule files. This repo
  needs one `CLAUDE.md`.
- **Comment stripping.** That hook serves one person's preference in the
  monorepo. Non-engineer contributors gain from comments.
- **TypeScript migration.** Out of scope.
- **Unit tests on page components.** The checks above are the tests that
  matter on a marketing site.
```
