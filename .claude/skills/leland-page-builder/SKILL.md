---
name: leland-page-builder
description: >
  Design a new Leland-branded page for this repo and ship it, from idea to a
  production React page in this Vite multi-page site. Use this skill when the user
  wants a page designed, not merely registered: "build me a page", "new landing
  page", "design a page for [event/campaign/partner/product]", "make a Leland page",
  or any request that starts from a brief rather than from finished markup. It covers
  the full lifecycle: a self-contained HTML prototype in the Leland light brand,
  iteration until the user is happy, then conversion to a React page component with
  scoped CSS. This file is also the brand design spec for this repo, and REBRAND.md
  cites it as the source of truth for the design tokens. For registering a page that
  already exists, use the add-a-page skill instead. This skill is for this Vite repo;
  it does not produce Astro output.
---

# Leland Page Builder

You are a page builder agent for the AI Builder Program site. Your job is to take a
user from idea → polished prototype → production React page, in two phases.

This repo is a Vite multi-page build. Pages are root `*.html` entry files plus React
components under `src/pages/`. There is no server and no database: `wrangler.toml`
declares `[assets] directory = "./dist"`, so Cloudflare serves static output only.

---

## Phase 1: Design & Iterate

In this phase you act as a creative partner. The goal is to get the user excited
about what they see before worrying about production concerns.

### Step 1 — Understand the brief

Ask the user what they are building. You need at minimum:
- **What is the page for?** (podcast, feature launch, event, campaign, etc.)
- **Who is the audience?**
- **Any specific content?** (copy, stats, episode data, speaker names, etc.)

Do not over-interview. If the user gives you a clear description, start building
immediately. Fill in reasonable placeholder content — it's easier to edit than to
wait.

### Step 2 — Build the prototype with the Leland design system

Build the HTML prototype following the Leland design system rules exactly.
Use a single self-contained HTML file. Apply every token and pattern below —
never deviate from them.

#### Fonts

Two custom font families. Both are self-hosted in this repo under `public/`, so
reference them by absolute URL. Copy the `@font-face` block from
`src/pages/home-rebrand.css` rather than writing a new one.

| Font | Role | CSS variable |
|------|------|-------------|
| **Season** | Serif display headings — hero titles, section titles, large card titles | `--font-serif: 'Season', Georgia, serif` |
| **Macan** | All body text, labels, buttons, descriptions | `--font-body: 'Macan', -apple-system, sans-serif` |

**Macan weight mapping** — Macan's naming is non-standard. Pay attention:

| File | CSS `font-weight` | Name | Usage |
|------|-------------------|------|-------|
| `/assets/fonts/Macan/Macan-Regular.woff2` | 300 | Regular (light) | Light body text |
| `/assets/fonts/Macan/Macan-Book.woff2` | 400 | Book (normal) | Default body text |
| `/assets/fonts/Macan/Macan-Medium.woff2` | 500 | Medium | Buttons, emphasis |
| `/assets/fonts/Macan/Macan-SemiBold.woff2` | 600 | SemiBold | Uppercase labels, bold emphasis |

**Season** has a single weight: `/assets/fonts/Season/SeasonMix-Medium.woff2` at
`font-weight: 500`.

Match that capitalisation exactly. The repo ships `Macan-SemiBold`, not
`Macan-Semibold`. macOS ignores the difference and Cloudflare returns 404 for it.
Each family also ships a `.woff` beside the `.woff2` as a fallback source.

Never substitute a system font stack. The files are present, and the fallbacks
(Georgia, system sans-serif) exist only to cover the moment before the webfont
loads.

#### Two brands live in this repo — use the light one

`src/index.css` defines a `:root` block for the **legacy dark theme**: black
background, lime `--accent: #A5E446`, white text. Older pages still use it.

The **light brand** below is the current one. It lives in
`src/pages/home-rebrand.css`, scoped under `html.rb-home` and `body.rb-home`.
Build new pages in the light brand unless the user asks for the dark one.

Because both themes coexist, a new page's CSS must be scoped. See Phase 2 Step 3.

#### Color Tokens

Define these as CSS custom properties. Use the variables — never hardcode values.

| Token | Value | Usage |
|-------|-------|-------|
| `--yellow` | `#FFD667` | Primary CTA background |
| `--yellow-hover` | `#F7CB53` | CTA hover state |
| `--white` | `#FFFFFF` | White backgrounds |
| `--gray-dark` | `#222222` | Primary text, dark backgrounds |
| `--gray-light` | `#4C4C4C` | Secondary/body text |
| `--blue` | `#80ACED` | Accent color (rare) |
| `--cream` | `#F0EBE0` | Warm neutral background |
| `--gray-hover` | `rgba(34,34,34,0.05)` | Subtle hover states |

**The brand yellow is a background colour only.** `#FFD667` is unreadable as text
on white. For a gold text accent — a label, a checkmark, a price emphasis — use
`#8a6d1a` instead.

#### Section Backgrounds

Alternate these to create visual rhythm across the page:

| Background | Value | When to use |
|------------|-------|-------------|
| White | `var(--white)` | Default content sections |
| Cream | `#f3f1e6` | Warm accent sections, stats bars, final CTAs |
| Light gray | `#f9f9f9` | FAQ, neutral sections |
| Dark | `var(--gray-dark)` | Credibility bands, pledges, high-contrast moments |

#### Typography Scale

| Role | Font | Size (desktop) | Size (mobile) | Weight |
|------|------|----------------|---------------|--------|
| Hero title | `--font-serif` | 64px | 40px | 500 |
| Section title | `--font-serif` | 40px | 30px | 500 |
| Card title (serif) | `--font-serif` | 24–28px | — | 500 |
| Card title (sans) | inherited | 16–17px | — | 700 |
| Body text | inherited | 15–17px | — | 400 |
| Body subhead | inherited | 17–18px | 15–16px | 400 |
| Uppercase label | inherited | 13–14px | — | 600, `text-transform: uppercase`, `letter-spacing: 0.05em` |
| Small text | inherited | 13–14px | — | 400–500 |

Section titles are always centered:

```css
.section-title {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 40px;
  color: var(--gray-dark);
  margin: 0 0 12px;
  text-align: center;
}
.section-sub {
  font-size: 17px;
  line-height: 1.5;
  color: var(--gray-light);
  text-align: center;
  margin: 0 auto 48px;
  max-width: 600px;
}
```

#### Layout

Every section follows this structure:

```html
<section class="section-name">
  <div class="section-container">
    <!-- content -->
  </div>
</section>
```

`.section-container`: `max-width: 1280px; margin: 0 auto; width: 100%;`

Padding goes on the `<section>`, not the container:
- Desktop: `padding: 80px 48px`
- Mobile: `padding: 56px 20px`
- Hero: `padding: 128px 48px 72px` (desktop), `96px 20px 48px` (mobile)

#### Buttons

All buttons use `border-radius: 999px` (pill shape) and `transition: background 0.2s`.

**Primary CTA (Yellow Pill):**
```css
background: var(--yellow);
color: var(--gray-dark);
font-weight: 500;
font-size: 16px;
padding: 16px 32px;
border-radius: 999px;
```
Hover: `background: var(--yellow-hover);`

**Secondary CTA (Ghost Pill):**
```css
background: var(--white);
color: var(--gray-dark);
font-weight: 500;
font-size: 16px;
padding: 16px 32px;
border-radius: 999px;
border: 1px solid rgba(0, 0, 0, 0.15);
```
Hover: `border-color: rgba(0, 0, 0, 0.3); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);`

#### Cards

Use `border-radius: 16px` and `padding: 32px`.

Solid variant: `background: var(--white);`

Bordered variant:
```css
border: 1px solid rgba(0, 0, 0, 0.1);
transition: box-shadow 0.2s;
```
Hover: `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);`

#### Responsive

Single breakpoint: `@media (max-width: 768px)`. Grids collapse to `1fr`.
CTA buttons go `width: 100%` when stacked on mobile.

#### Logos

The two SVGs below are for the **prototype only**, so it renders standalone with no
server. In production the page uses this repo's `<Nav />` and `<Footer />`
components, which already carry the correct marks — do not paste logo markup into a
React page. This repo also ships its own AI Builder Program marks in
`public/assets/logos/`, including `AI-Builder-Program-Logo.svg` and
`aibp-light.png`. Note that `public/logos/` is a different directory holding
third-party company logos such as `amazon.svg`.

For the prototype, paste these inline — never reference an external file.

**Full text logo (navbar)** — Black wordmark, used in the top navigation bar.
Link it to `https://www.joinleland.com`.

```svg
<svg width="256" height="55" viewBox="0 0 256 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M27.3834 40.9646C34.5786 40.9646 41.0473 43.8914 45.5177 48.5484L39.6349 54.4106C38.842 55.2007 37.5574 55.1613 36.6824 54.4631C34.206 52.4874 30.9501 51.288 27.3834 51.288C23.8141 51.288 20.5561 52.489 18.079 54.4673C17.2028 55.1671 15.9151 55.2061 15.1221 54.4131L9.25316 48.5442C13.7234 43.8896 20.1903 40.9646 27.3834 40.9646Z" fill="#222222"/>
<path d="M14.5392 29.4609C18.5488 28.0972 22.8738 27.3536 27.3834 27.3536C37.674 27.3536 47.0034 31.2249 53.8163 37.5039C54.6109 38.2362 54.5995 39.477 53.835 40.2406L47.9635 46.1054C42.8508 40.8829 35.5231 37.6112 27.3834 37.6112C19.2586 37.6112 11.9427 40.8709 6.83137 46.0767C5.95688 45.1982 2.33697 41.5498 0.573347 39.7728C-0.0107259 39.1842 -0.164501 38.2946 0.18579 37.543L16.9767 1.51902C17.4086 0.592411 18.3382 6.75896e-06 19.3606 0H28.271L14.5392 29.4609Z" fill="#222222"/>
<path d="M39.5095 0C40.9524 0 41.907 1.49824 41.2975 2.80597L31.0979 24.6887C29.8531 24.5812 28.5922 24.5262 27.3176 24.5262C24.9338 24.5262 22.5977 24.7183 20.3259 25.0869L32.019 0H39.5095Z" fill="#222222"/>
<path d="M114.159 15.5586C125.663 15.5586 131.824 23.228 130.378 35.0459H107.244C108.061 39.7605 111.331 41.332 114.285 41.332C116.862 41.332 119.189 40.2006 119.503 38.9434H129.875C127.172 47.1153 119.754 49.8184 114.662 49.8184C105.233 49.8183 97.5635 44.6637 97.5635 32.6572C97.5635 21.6566 104.73 15.5587 114.159 15.5586ZM161.653 15.5586C166.745 15.5586 169.763 17.3195 171.963 19.3311L172.592 16.25H182.084V49.1895H172.528L171.334 41.332H170.517C171.208 47.0524 165.928 49.8184 161.653 49.8184C151.218 49.8183 146.001 41.2692 146.001 32.6572C146.001 24.1082 151.218 15.5587 161.653 15.5586ZM255.445 49.1865H245.891L244.696 41.3291H243.879C244.193 47.4262 239.29 49.8153 235.016 49.8154C224.581 49.8154 219.362 41.2662 219.362 32.6543C219.362 24.1052 224.581 15.5557 235.016 15.5557C240.107 15.5558 243.124 17.3158 245.324 19.3271V5.18359H255.508L255.445 49.1865ZM143.438 5.24609L143.376 49.249L133.192 49.1865L133.255 5.18359L143.438 5.24609ZM206.363 15.5586C211.706 15.5588 216.798 18.828 216.798 26.3711V49.1895H206.614V29.2627C206.614 25.8684 204.477 24.548 201.963 24.5479C199.637 24.5479 197.122 26.3714 195.802 28.1943V49.1895H185.618V16.25L195.174 16.1875L196.368 24.0449H197.185C197.185 17.9476 202.089 15.5586 206.363 15.5586ZM81.583 37.9287H96.4814V49.1182H71.3994V7.06348L81.583 7.00098V37.9287ZM164.294 24.5479C159.579 24.5479 156.688 28.1941 156.688 32.6572C156.688 37.1204 159.579 40.7666 164.294 40.7666C169.071 40.7665 171.9 37.1203 171.9 32.6572C171.9 28.1942 169.071 24.548 164.294 24.5479ZM237.655 24.5449C232.941 24.545 230.049 28.1912 230.049 32.6543C230.049 37.1173 232.941 40.7626 237.655 40.7627C242.433 40.7627 245.262 37.1173 245.262 32.6543C245.262 28.1912 242.433 24.5449 237.655 24.5449ZM114.662 23.2275C110.828 23.2276 108.313 25.1139 107.433 28.7598H120.948V28.3828C120.948 25.2398 117.994 23.2275 114.662 23.2275Z" fill="#222222"/>
</svg>
```

**Icon logo (footer)** — White icon mark, used in the footer on dark backgrounds.

```svg
<svg width="828" height="837" viewBox="0 0 828 837" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M416.453 623C525.88 623 624.257 667.51 692.244 738.336L602.778 827.49C590.719 839.506 571.181 838.906 557.874 828.289C520.213 798.241 470.696 780 416.453 780C362.171 780 312.622 798.266 274.95 828.351C261.624 838.995 242.04 839.587 229.98 827.528L140.724 738.271C208.709 667.484 307.059 623 416.453 623Z" fill="white"/>
<path d="M221.116 448.049C282.094 427.309 347.87 416 416.453 416C572.955 416 714.84 474.876 818.452 570.369C830.536 581.506 830.363 600.376 818.736 611.99L729.44 701.183C651.686 621.758 540.243 572 416.453 572C292.889 572 181.628 621.575 103.893 700.746C90.5937 687.385 35.5412 631.9 8.71961 604.874C-0.163122 595.923 -2.50178 582.393 2.82555 570.964L258.185 23.1016C264.753 9.00953 278.892 0.000102792 294.44 0H429.953L221.116 448.049Z" fill="white"/>
<path d="M600.871 0C622.813 0 637.332 22.7856 628.062 42.6738L472.944 375.472C454.013 373.838 434.837 373 415.453 373C379.199 373 343.671 375.922 309.122 381.527L486.953 0H600.871Z" fill="white"/>
</svg>
```

#### Other conventions

- White page background; white or cream cards — no dark card backgrounds
- Logo bar images: `opacity: 0.5; filter: grayscale(100%)`

Save the prototype as `leland-[descriptive-name].html` and present it to the user.

### Step 3 — Iterate

Let the user react. They may want to:
- Change copy, layout, colors (within the design system)
- Add/remove sections
- Adjust responsive behavior
- Add interactivity (upvotes, forms, filters, etc.)

Keep iterating on the HTML prototype until the user is happy. Each revision should
be a new version of the same HTML file. Do not move to Phase 2 until the user
explicitly signals they are satisfied, for example "looks good", "let's ship it",
or "ready to go".

---

## Phase 2: Production Export

Once the user approves the design, convert the prototype into a React page in this
repo. There is no server and no database here, so this phase produces markup,
styles, and registration — nothing else.

### Step 1 — Ask for the page path, then choose the page shape

Before writing any files, ask the user:

> "What should the URL path be for this page? For example `/summit` is served by
> `summit.html`. A path that does not match a file name needs a redirect rule, which
> is one extra line."

Wait for their answer. It determines the entry file name and the route.

**Then choose the shape.** This repo ships two, and picking the wrong one wastes
work:

| Shape | Count today | Use it when | What you write |
|---|---|---|---|
| **React page** | 17 of 24 pages | The page shares the site chrome, reuses `Nav`, `Footer`, `CohortPicker`, or reads `courseData.js` | Entry HTML that loads `/src/main.jsx`, a component in `src/pages/`, a route in `App.jsx` |
| **Standalone HTML** | 7 of 24 pages | A one-off campaign or partner page that shares nothing and must not touch the shared bundle | One self-contained `.html` file with its own `<style>` and `<script>`; no component, no route |

`bundle-3.html`, `bundle-5.html`, `level-1-lp.html`, both `leland-ai-builders-b2b*`
pages, and the MBA and law landing pages are the standalone shape. Ask the user
which they want when it is not obvious. A campaign page with bespoke design is
usually standalone; anything that shows cohort dates should be a React page, so it
reads `courseData.js` instead of hardcoding them.

**If the user chooses standalone**, skip Steps 2 and 3 below. You still need Step 4's
Vite input entry, Step 5's head tags, and Step 6's verification. Move the
prototype's `<style>` and `<script>` blocks into the file as they are — that is
exactly what the existing standalone pages do — and add the PostHog snippet
yourself, because `main.jsx` never runs for these pages.

### Step 2 — Write the page component (React shape only)

Skip this step for a standalone page.

Create `src/pages/<Name>Page.jsx`. Follow the existing components in that directory,
for example `src/pages/ServicesPage.jsx`.

1. **Data as module constants.** Put speaker lists, stats, FAQ entries, and similar
   content in `const` declarations above the component. Never inline a long array in
   the middle of the markup.
2. **Cohort dates and prices come from `src/pages/courseData.js`.** `COURSE_COHORTS`
   and `ENROLL_URLS` are the source of truth. Never hardcode a date or a price on a
   new page. This is the top source of bugs in this repo, and the cohort-watch
   report exists because of it.
3. **Reuse the shared components.** Import `Nav` and `Footer` from
   `src/components/`. Use `CohortPicker` for cohort selection and `Faq` for FAQ
   sections rather than rebuilding them.
4. **Interactivity uses React state**, not a `<script>` tag. This repo already
   depends on `motion` and `gsap` if the design needs animation.
5. **No server-side code.** There is no database, no Supabase, and no request
   handler. A form must post to an external endpoint, such as a Typeform or HubSpot
   URL. Existing pages use `https://joinleland.typeform.com/to/...` links.

### Step 3 — Write the page CSS, scoped (React shape only)

Skip this step for a standalone page, whose `<style>` block is already isolated to
its own file and cannot leak.

Create `src/pages/<name>.css` and import it from the component.

**Vite bundles every CSS file into one global stylesheet.** An unscoped rule on your
new page changes all 24 pages in this repo. This is the single easiest way to break
production from a new page.

Scope every rule under one class that only your page sets, exactly as
`src/pages/home-rebrand.css` scopes everything under `html.rb-home` and
`body.rb-home`:

```css
body.summit-page .hero { padding: 128px 48px 72px; }
body.summit-page .section-title { font-family: var(--font-serif); }
```

Set that class on `<body>` from the page component:

```jsx
import { useEffect } from 'react'

useEffect(() => {
  document.body.classList.add('summit-page')
  return () => document.body.classList.remove('summit-page')
}, [])
```

Redefine the design tokens inside your scope rather than editing a shared file. That
is how the light brand re-themes `CohortPicker`, `GetThisExpensed`, and `LPPopup`
without touching them.

### Step 4 — Register the page

Hand this off to the **add-a-page** skill, which owns the registration checklist and
is kept in step with the repo. It covers all six places: the root HTML entry file,
the `input` map in `vite.config.js`, the import and route in `src/App.jsx`, the
analytics `pageNames` map, a `public/_redirects` rule when the URL and file name
differ, and the `Footer` link for a permanent page.

Two points from that checklist are worth repeating, because missing either ships a
broken page:

- **Route order matters.** `src/App.jsx` matches with a chain of `startsWith` checks,
  so a route sharing a prefix with an existing one must sit above it.
- **A missing `vite.config.js` input entry builds clean locally and returns 404 in
  production.**

Copy `reviews.html` as the entry file. It is the smallest. Do not copy
`program.html`, because it carries a PostHog feature-flag redirect that belongs only
to `/program`.

### Step 5 — Head tags and analytics

The entry HTML file owns everything in `<head>`.

1. **SEO** — as specified in Phase 1: a `<title>` under 60 characters including
   "Leland", a 120 to 155 character `<meta name="description">`, a canonical link,
   Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`,
   `og:site_name`), Twitter card tags, structured data where it applies, and one
   `h1` per page.
2. **PostHog depends on the shape.** A React page loads `/src/main.jsx`, which
   initialises PostHog already, so add nothing and capture events with
   `posthog.capture('event_name')` inside the component. A **standalone page never
   runs `main.jsx`**, so it must load PostHog itself. Copy the `posthog.init` block
   from an existing standalone page such as `bundle-5.html`.
   Only 17 of the 24 pages here get PostHog from `main.jsx`, and
   `leland-mba-landing-page.html` has no PostHog at all — do not assume it is
   present.
3. **Google Tag Manager** is present on the entry files. The page name in the
   `page_view` event comes from the `pageNames` map in `src/App.jsx`, which the
   add-a-page checklist covers. Without an entry the page reports as `Home`.
4. **HubSpot only when the page needs it.** Some pages load it and most do not, so
   ask before adding it. When the user wants HubSpot form tracking, include the
   loader in `<head>`:
   ```html
   <script type="text/javascript" id="hs-script-loader" async defer
     src="https://js.hs-scripts.com/22467258.js"></script>
   ```
5. **Form fields need IDs and names** whenever a form exists, so submissions are
   identifiable downstream. Form: `id="form-{purpose}"`. Fields:
   `id="{form}-{field}"`, `name="{field}"`. Submit: `id="{form}-submit"`.
6. **Canonical outbound links.** The Leland logo and home link always point to
   `https://www.joinleland.com`. Footer links come from the `Footer` component, so
   never invent footer URLs.
7. **Accessibility** — `aria-label` on icon buttons, `aria-hidden` on decorative
   SVGs, semantic elements, real `alt` text, and `loading="lazy"` on images below
   the fold.

### Step 6 — Verify before you hand it over

```bash
npm run check   # page registered, links resolve, assets exist and fit the budget
npm run build   # the real production build
npm run dev     # then open the page, but read the warning below first
```

Confirm `dist/<name>.html` exists after the build. If it does not, the Vite input
entry is missing.

**Open the right URL in dev, or you will verify the wrong page.** The dev server
does not resolve clean URLs the way production does:

| Shape | Open this in dev | Why |
|---|---|---|
| React page | `http://localhost:5173/<path>` | The dev server falls back to `index.html`, and `App.jsx` then routes on the path, so the correct page renders |
| Standalone HTML | `http://localhost:5173/<name>.html` | The clean URL falls back to `index.html` and silently renders the React shell instead of your page |

That fallback returns HTTP 200, so a standalone page opened at its clean URL looks
like it worked while showing entirely different content. Production is fine —
Cloudflare serves `/<name>` from `<name>.html`, which is why the footer links to
`/pledge` and `/services` with no redirect rule.

Then check the two things no script can check. Open one other page, for example
`/program`, and confirm your CSS did not leak into it. Open the new page at 375
pixels wide and confirm the mobile layout holds.

### Step 7 — Present and explain

Tell the user what you built: the files added, the URL it serves, which brand it
uses, and anything you left as a placeholder. Name any image that still needs
replacing, and remind them that an image over 400 KB fails `npm run check` — the
add-an-image skill shrinks it.

---

## Rules

1. **Never skip the prototype phase.** Even when the user asks you to go straight
   to the real page, prototype in one HTML file first. Iterating on a static file
   is faster than iterating on a registered React page.

2. **Never skip asking for the page path.** It decides the entry file name, the
   route, and whether a redirect rule is needed.

3. **Scope every CSS rule to your page.** Vite bundles all CSS globally, so an
   unscoped rule changes all 24 pages. See Phase 2 Step 3.

4. **No server-side code and no database.** This repo deploys static assets only.
   Never write a Supabase call, a request handler, a `.sql` migration, or an
   `.env.example`. A form posts to an external endpoint.

5. **A page is a component plus a scoped stylesheet.** `src/pages/<Name>Page.jsx`
   and `src/pages/<name>.css`, matching the existing files in that directory.

6. **Registration belongs to add-a-page.** Hand off to that skill rather than
   restating its checklist, so the two never drift apart.

7. **Cohort dates and prices come from `courseData.js`.** Never hardcode a date or
   a price on a new page.

8. **Leland design system only.** Never deviate from the design tokens defined
   in Phase 1 Step 2. Use only Season and Macan fonts, the defined color
   variables (`--yellow`, `--gray-dark`, `--cream`, etc.), pill-shaped buttons
   (`border-radius: 999px`), and `16px` card radii. No custom colors, no
   off-brand fonts. The yellow is a background colour; gold text is `#8a6d1a`.

9. **Logo always links home.** The Leland logo href is always
   `https://www.joinleland.com` — never `/` or `#`.

10. **Reuse `Nav` and `Footer`.** Never paste navigation or footer markup into a
    React page, and never invent footer URLs.

11. **Form fields must have IDs and names.** Every form, input, and submit button
    gets an explicit `id` and `name` so submissions are identifiable downstream.

12. **SEO is mandatory.** Every page gets a full set of meta tags, OG tags,
    Twitter card tags, and structured data where appropriate.

13. **Buttons use weight 500 (Macan Medium).** All buttons and CTAs must use
    `font-weight: 500`, never 600. This applies to primary, secondary, and
    any other button variant.

14. **Run `npm run check` and `npm run build` before you hand over.** Both must
    pass, and confirm your CSS did not leak into another page.
