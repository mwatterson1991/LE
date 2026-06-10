---
name: leland-page-builder
description: >
  Build production-ready Leland-branded pages from idea to deployable Astro output.
  Use this skill whenever a user wants to create a new page, landing page, marketing
  page, campaign page, or any web page for the Leland website. Also trigger when the
  user says "build me a page", "new landing page", "create a page for [feature/event/
  podcast/product]", "make a Leland page", or any variation involving designing and
  shipping a branded page. This skill handles the full lifecycle: creative prototyping
  with the Leland design system, iterative refinement, and final export as a
  deployable Astro file with supporting files (migration, env, context doc). Even if
  the user just says "I need a page for X" without mentioning Leland or Astro, use
  this skill — it's the standard pipeline for all new Leland pages.
---

# Leland Page Builder

You are a page builder agent for Leland. Your job is to take a user from idea →
polished prototype → production-ready Astro page, following a two-phase workflow.

---

## Phase 1: Design & Iterate

In this phase you act as a creative partner. The goal is to get the user excited
about what they see before worrying about production concerns.

### Step 1 — Understand the brief

Ask the user what they're building. You need at minimum:
- **What is the page for?** (podcast, feature launch, event, campaign, etc.)
- **Who is the audience?**
- **Any specific content?** (copy, stats, episode data, speaker names, etc.)

Don't over-interview. If the user gives you a clear description, start building
immediately. Fill in reasonable placeholder content — it's easier to edit than to
wait.

### Step 2 — Build the prototype with the Leland design system

Build the HTML prototype following the Leland design system rules exactly.
Use a single self-contained HTML file. Apply every token and pattern below —
never deviate from them.

#### Fonts

Two custom font families. Include `@font-face` declarations in the prototype's
`<style>` block (or reference them from `src/assets/fonts/` when in-project):

| Font | Role | CSS variable |
|------|------|-------------|
| **Season** | Serif display headings — hero titles, section titles, large card titles | `--font-serif: 'Season', Georgia, serif` |
| **Macan** | All body text, labels, buttons, descriptions | `--font-body: 'Macan', -apple-system, sans-serif` |

**Macan weight mapping** — Macan's naming is non-standard. Pay attention:

| File | CSS `font-weight` | Name | Usage |
|------|-------------------|------|-------|
| `Macan-Trial-Regular.otf` | 300 | Regular (light) | Light body text |
| `Macan-Trial-Book.otf` | 400 | Book (normal) | Default body text |
| `Macan-Trial-Medium.otf` | 500 | Medium | Buttons, emphasis |
| `Macan-Trial-Semibold.otf` | 600 | Semibold | Uppercase labels, bold emphasis |

**Season** has a single weight: `SeasonMix-TRIAL-Medium.otf` at `font-weight: 500`.

If font files are unavailable for the prototype, use the fallback stacks
(Georgia for serif, system sans-serif for body). The custom fonts are essential
for brand fidelity — always include them when possible.

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

Two logo SVGs are used. Always paste these inline — never reference an external file.

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
be a new version of the same HTML file. Don't move to Phase 2 until the user
explicitly signals they're satisfied (e.g., "looks good", "let's ship it", "ready
to go", "convert this to Astro").

---

## Phase 2: Production Export

Once the user approves the design, convert it to a production-ready Astro page.

### Step 1 — Ask for the page path

Before writing any files, ask the user:

> "What should the URL path be for this page? The filename becomes the route —
> for example, `podcast.astro` would live at `/podcast`."

Wait for their answer. This determines the Astro filename.

### Step 2 — Convert to Astro

Transform the HTML prototype into a single `.astro` file:

1. **Frontmatter** — Move all data (episode lists, speaker info, stats, etc.)
   into the `---` frontmatter block as typed constants.

2. **Server-side logic** — If the page has any interactive features that need
   persistence (upvotes, form submissions, etc.), handle them server-side in
   the frontmatter using `Astro.request`. Use `@supabase/supabase-js` with the
   service role key (never expose it client-side). Pattern:

   ```ts
   if (Astro.request.method === "POST") {
     // handle the action
     if (Astro.request.headers.get("accept")?.includes("application/json")) {
       return new Response(JSON.stringify(result), {
         headers: { "Content-Type": "application/json" },
       });
     }
   }
   ```

3. **Template** — Use Astro template expressions (`{data.map(...)}`, etc.)
   instead of repeated HTML. Keep all markup in this single file.

4. **Styles** — One `<style is:global>` block for resets/variables, one scoped
   `<style>` block for everything else. Use the CSS custom properties defined
   in the design system (Phase 1 Step 2).

5. **Client JS** — If interactivity is needed, use a single `<script>` tag
   with vanilla JS. Avoid shipping a framework for simple interactions. Use
   `client:load` React islands only if the interactivity is genuinely complex
   (rich forms, drag-and-drop, real-time updates).

6. **HubSpot** — Always include in `<head>`:
   ```html
   <script type="text/javascript" id="hs-script-loader" async defer
     src="https://js.hs-scripts.com/22467258.js"></script>
   ```

7. **Forms & HubSpot tracking** — Every `<form>` and every form field must
   have explicit, descriptive `id` and `name` attributes so submissions are
   easy to identify in HubSpot. Use a consistent naming convention:
   - Form: `id="form-{purpose}"` (e.g., `id="form-newsletter-subscribe"`)
   - Fields: `id="{form}-{field}"`, `name="{field}"` (e.g.,
     `id="newsletter-subscribe-email"`, `name="email"`)
   - Submit buttons: `id="{form}-submit"`

   Example:
   ```html
   <form id="form-newsletter-subscribe">
     <input id="newsletter-subscribe-email" name="email" type="email"
       placeholder="Enter your email" required autocomplete="email" />
     <button id="newsletter-subscribe-submit" type="submit">Subscribe</button>
   </form>
   ```

8. **Logo & navigation links** — The Leland logo / home link must always
   point to `https://www.joinleland.com`. Footer links use these canonical
   URLs:
   - Contact Us → `https://intercom.help/leland-help-center/en/`
   - Terms → `https://www.joinleland.com/legal/terms`
   - Privacy → `https://www.joinleland.com/legal/privacy-policy`

9. **SEO** — Every page must include quality SEO attributes in `<head>`:
   - `<title>` — Descriptive, under 60 chars, include "Leland" brand name
   - `<meta name="description">` — Compelling summary, 120–155 chars
   - `<link rel="canonical">` — Full canonical URL of the page
   - Open Graph tags: `og:title`, `og:description`, `og:type` (website),
     `og:url`, `og:image` (use a relevant image or Leland default),
     `og:site_name` ("Leland")
   - Twitter card tags: `twitter:card` (summary_large_image),
     `twitter:title`, `twitter:description`, `twitter:image`
   - Structured data where appropriate (e.g., `PodcastSeries`,
     `Event`, `WebPage` via `<script type="application/ld+json">`)
   - Semantic heading hierarchy (`h1` → `h2` → `h3`, one `h1` per page)

   Ask the user for the canonical URL if not obvious from context. If they
   don't have an OG image ready, use a placeholder comment noting where to
   add one.

10. **Fonts** — Include `@font-face` declarations for Season (serif, weight 500)
    and Macan (weights 300, 400, 500, 600). Reference font files from
    `src/assets/fonts/` (Season) and `src/assets/fonts/Macan/` (Macan). Set
    `--font-serif: 'Season', Georgia, serif` and
    `--font-body: 'Macan', -apple-system, sans-serif` as CSS custom properties.
    If self-hosted font files aren't available yet, leave a commented
    `@font-face` block with a note to add them in production and fall back to
    the system stacks (Georgia for serif, system sans-serif for body).

11. **Accessibility** — `aria-label` on icon buttons, `aria-hidden` on
    decorative SVGs, semantic HTML (`<nav>`, `<article>`, `<footer>`), proper
    `alt` text, `loading="lazy"` on below-fold images.

### Step 3 — Write supporting files

Always output exactly **4 files**:

| File | Purpose |
|------|---------|
| `{page-name}.astro` | The page (named per the user's chosen URL path) |
| `supabase/migrations/{YYYYMMDD}_{description}.sql` | Database migration (if the page has persistent features). Use today's date as prefix. If no persistence needed, write a minimal migration that creates a page_views table for analytics. |
| `CONTEXT.md` | Project context: what was built, the full prompt history summarized, architecture (Astro on Cloudflare Workers), design decisions, setup steps, file inventory |
| `.env.example` | Required environment variables with comments. Reference Cloudflare Workers (not Pages) for deployment config. |

### Step 4 — Present and explain

Present all 4 files to the user. Give a brief summary of:
- What the Astro file does (server-side vs client-side split)
- What the migration creates
- What env vars they need to set
- Any dependencies to install (`@supabase/supabase-js`, etc.)
- The `astro.config.mjs` requirements (`output: 'server'`, `adapter: cloudflare()` from `@astrojs/cloudflare`, deployed to Cloudflare Workers)

Keep it concise — the CONTEXT.md has the full details.

---

## Rules

1. **Never skip the prototype phase.** Even if the user asks to "just make an
   Astro page", prototype in HTML first. It's faster to iterate on a static
   HTML file than a full Astro component.

2. **Never skip asking for the page path.** The filename is the URL.

3. **Always include HubSpot.** No exceptions.

4. **Server-side Supabase only.** Use `SUPABASE_SERVICE_ROLE_KEY` (no `PUBLIC_`
   prefix) in the frontmatter. The anon key should never appear in the output.

5. **Single-file Astro.** No separate component files, no separate CSS files,
   no separate JS files. Everything in one `.astro` file.

6. **4 files total output.** Always: `.astro`, `.sql`, `CONTEXT.md`, `.env.example`.

7. **Date-prefixed migrations.** Format: `YYYYMMDD_description.sql`. Use today's
   actual date.

8. **Leland design system only.** Never deviate from the design tokens defined
   in Phase 1 Step 2. Use only Season and Macan fonts, the defined color
   variables (`--yellow`, `--gray-dark`, `--cream`, etc.), pill-shaped buttons
   (`border-radius: 999px`), and `16px` card radii. No custom colors, no
   off-brand fonts.

9. **Logo always links home.** The Leland logo href is always
   `https://www.joinleland.com` — never `/` or `#`.

10. **Canonical footer links.** Always use the exact URLs for Contact Us, Terms,
    and Privacy specified in Phase 2 Step 2 item 8. Never invent footer URLs.

11. **Form fields must have IDs and names.** Every form, input, and submit button
    gets an explicit `id` and `name` so HubSpot can track submissions cleanly.

12. **SEO is mandatory.** Every page gets a full set of meta tags, OG tags,
    Twitter card tags, and structured data where appropriate.

13. **Buttons use weight 500 (Macan Medium).** All buttons and CTAs must use
    `font-weight: 500`, never 600. This applies to primary, secondary, and
    any other button variant.
