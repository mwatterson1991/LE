# AI Builder Homepage Rebrand (light Leland brand)

Branch: `ai-builder-rebrand-1`. Rebuilds the homepage (`/`) in the new Leland light brand while preserving every line of copy, every URL, and every PostHog event. No other page is touched.

## What changed

| File | Change |
|---|---|
| `src/pages/HomePageRebrand.jsx` | **New.** Machine-generated copy of the `HomePage` function (and its homepage-only helpers) from `src/App.jsx`, with visual-only edits: dark hero canvas/photo removed, photo-overlay bands replaced with flat brand bands, CardSwap 3D replaced with a static 3-certificate grid, nav rebuilt as `header.rb-nav`, white tool/partner logo variants swapped for dark ones, Marquee edge fades set to white. All copy, hrefs, and `posthog.capture` calls verified identical to production. |
| `src/pages/home-rebrand.css` | **New.** The entire new-brand theme. Every rule scoped under `html.rb-home` / `body.rb-home`, so it is inert on all other pages even though Vite bundles it globally. Loads Season + Macan via `@font-face` and re-themes shared components (CohortPicker, GetThisExpensed, LPPopup) by redefining the CSS custom properties. |
| `src/App.jsx` | **2 lines.** Import `HomePageRebrand`; route `/` to it instead of `HomePage`. The legacy `HomePage` remains in App.jsx, unused. |
| `public/assets/fonts/Macan/`, `public/assets/fonts/Season/` | **New.** Self-hosted brand webfonts (woff2 + woff). |
| `public/assets/logo-dark.svg` | **New.** `logo-white.svg` recolored `#222222` for the light nav. |
| `.claude/skills/leland-page-builder/SKILL.md` | **New.** The brand design spec (source of truth for tokens used here). |

## Design tokens

Per `.claude/skills/leland-page-builder/SKILL.md`:

- **Fonts:** Season serif 500 for headings; Macan 300/400/500/600 for everything else. Buttons always Macan 500.
- **Colors:** yellow `#FFD667` (primary CTA bg, hover `#F7CB53`), gray-dark `#222222`, gray-light `#4C4C4C`, cream `#F0EBE0`/`#f3f1e6`, light gray `#f9f9f9`, blue `#80ACED` (rare accent; darkened to `#4A7FCC` when used as text).
- **Buttons:** pill `border-radius: 999px`. Cards: radius 16, white/cream only, 1px `rgba(0,0,0,.1)` border, hover shadow.
- Exactly two dark `#222` bands: "Be the AI expert" and "Walk away certified."
- Text-accent gold `#8a6d1a` substitutes for the old lime in label/check/price accents (the brand yellow is background-only — unreadable as text on white).

## How to revert

1. **Fast:** in `src/App.jsx`, change `return <HomePageRebrand />` back to `return <HomePage />`. The old dark homepage is still fully intact in App.jsx.
2. **Full:** revert the merge commit (`git revert`) or close the PR. No shared file other than the 2-line App.jsx change is modified.

## Maintenance warning — cohort date rolls

The `courses` array (cohort dates, sold-out flags, enroll URLs) now exists in **two places**: `src/App.jsx` (legacy, inert) and `src/pages/HomePageRebrand.jsx` (live). While this branch is active, roll cohorts in **HomePageRebrand.jsx**. Once the rebrand sticks, delete the legacy `HomePage` + helpers from App.jsx in a follow-up PR to end the duplication.

## Known follow-ups

- **Level thumbnails** (`public/assets/thumbnails/thumbnail-level*.png`) still carry the old dark/lime artwork. They sit acceptably inside bordered white cards, but should be re-rendered in the new brand.
- **Font licensing:** confirm Leland's web license covers self-hosting Macan/Season on ai.joinleland.com before merging to main.
- Delete legacy `HomePage` from App.jsx after the rebrand is accepted (ends cohort-data duplication).

## QA performed (2026-06-10, desktop only per scope)

- **Copy parity:** normalized `innerText` diff vs production ai.joinleland.com — 616/616 lines identical (only diffs: buttons no longer CSS-uppercased; rotating hero phrase caught mid-cycle).
- **URL + analytics parity:** every `href` and every `posthog.capture(event, source)` identical to production source.
- **Fonts:** only Macan/Season computed on the page; zero Calibre/Departure Mono.
- **Cross-page regression:** `/level-1`, `/teams`, `/reviews` confirmed pixel-state unchanged (black bg, Calibre, lime `#A5E446`, no `rb-home` class) — no CSS bleed.
- **Interactions:** countdown ticks, FAQ + level accordions toggle, which-level dropdown opens, cohort picker renders (14 buttons), expense selector (8 options), no horizontal scrollbar.
- **Design cohesion:** section rhythm white/cream/gray with exactly two `#222` bands; zero computed lime anywhere; all CTAs pill-shaped.
- `npm run build` compiles all 16 entries.
