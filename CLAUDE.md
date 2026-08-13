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
