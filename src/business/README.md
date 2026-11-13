# business.joinleland.com: how we work

The business site is being built here, on the `business-site` branch, before it
moves to its own domain. Everyone (Michael, Tanner, Dave) works against the same
branch and reviews the same live preview.

## Links

| What | Where |
| --- | --- |
| Live preview (latest `business-site`) | https://business-site-ai-mastery.leland-9bc.workers.dev/business |
| AI Transformation page | https://business-site-ai-mastery.leland-9bc.workers.dev/ai |
| Section variations (12 sections × 5) | https://business-site-ai-mastery.leland-9bc.workers.dev/business-variations |
| Dave's wireframes (Ideas A–E, hi-fi styles) | https://claude.ai/artifact/4p1zgQgRxN6ZpwYubFAEnK |
| Site map + nav proposal | https://claude.ai/artifact/DUWUTXSKwH6JFzaarh6KzX |
| Strategy doc | Notion: "AI Transformation Platform: Vision and Strategy" |

Preview pages are `noindex` and not linked from leland.ai. Anyone with the link
can see them, so don't put anything confidential on them.

## The loop

1. Start from the latest `business-site`:
   `git checkout business-site && git pull`
2. Make a short branch for your piece: `git checkout -b tanner/hero`
3. Work (Claude Code locally, or a cloud session at claude.ai/code on this repo).
4. Run `npm run check` and `npm run build`. Both must pass.
5. Push and open a PR **into `business-site`** (not `main`). Cloudflare comments
   on the PR with a preview link for just your change.
6. Someone else looks at the preview and approves; merge into `business-site`.
   The shared preview link updates a minute or two later.

`business-site` only goes to `main` (and live) when we decide to launch.

**Not on GitHub?** Review the preview links and leave notes in the Slack thread
or on the PR. Copy edits can go straight into the content files below through
GitHub's web editor ("Edit this file", then "Create a new branch").

## Where things live

- `src/business/content/` — **all the words**, one file per page. Edit copy here,
  never inside components. Bracketed text like `[Customer quote]` is a placeholder.
- `src/business/*Page.jsx` — page layouts (`BusinessHomePage`, `AITransformationPage`).
- `src/business/BusinessNav.jsx` + `siteMap.js` — the header and every menu item.
- `src/business/variations/` — the variations review page; borrow sections from here.
- `src/business/business.css` — styles, `biz-` class prefix.
- `public/assets/business/` — images and illustrations for these pages.

Shared leland.ai files (`src/pages/leland-ai.css`, `home-rebrand.css`,
`src/components/*`, `src/App.jsx`) affect the live site. Change them only on
purpose, and say so in the PR.

## Who's doing what

Claim a section in the Slack thread before starting so two people don't build the
same thing. Current owners:

| Area | Owner |
| --- | --- |
| Homepage build from Dave's wireframes | Michael |
| Sub-brand / visual direction | Tanner + Dave |
| Copy and proof points (quotes, logos, stats) | Dave |

## Rules of thumb

- Real numbers only. Anything unconfirmed stays in `[brackets]` until someone signs off.
- Never pair real customer logos with invented people, quotes or results.
- Images: 400 KB max (see the `add-an-image` skill). Videos: 2 MB.
- Check every change at desktop and phone width before asking for review.
