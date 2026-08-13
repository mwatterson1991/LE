---
name: add-a-page
description: >
  Add a new page to this Vite multi-page marketing site by registering it in
  six places: the root HTML entry file, the build input map in vite.config.js,
  the route in src/App.jsx, the analytics pageNames map, a _redirects rule if
  the URL differs from the file name, and Footer links if permanent. Use this
  skill when the user asks for a new page, a new landing page, a campaign URL,
  a partner page, or a new route in this repo. Also use when a page works in
  development but returns 404 in production, which usually means the Vite input
  entry is missing. This skill is for this Vite-based site. For Astro pages in
  other repos, use a different skill.
---

# Add a page

This site is a Vite multi-page build. Each page needs an entry in six places.
A miss in any one of them ships a broken page.

Run `npm run check` at the end. It catches items 1, 2, and 4 automatically.

**First, which shape is the page?** 17 of the 24 pages are React pages: the entry
HTML loads `/src/main.jsx` and a component in `src/pages/` renders it. The other 7
are standalone HTML files with their own `<style>` and `<script>`, and no React at
all — `bundle-3.html`, `bundle-5.html`, `level-1-lp.html`, both
`leland-ai-builders-b2b*` pages, and the MBA and law landing pages.

A **standalone page skips steps 3 and 5**, because `App.jsx` never runs for it. It
still needs steps 1, 2, 4, and 6. It also needs its own PostHog snippet if you want
events, since `main.jsx` is what normally provides that.

Everything below describes the React shape unless a step says otherwise.

## 1. The HTML entry file

Create `<name>.html` in the repo root. Copy an existing one, for example
`reviews.html`, which is the smallest. Keep the `<div id="root">` and the module
script that loads `/src/main.jsx`. Update `<title>` and the meta description.
Do not copy `program.html`, because it carries a PostHog feature-flag redirect
that belongs only to `/program`.

## 2. The Vite input map

Add the file to `build.rollupOptions.input` in `vite.config.js`:

```js
'<name>': resolve(__dirname, '<name>.html'),
```

Contributors often miss this step. Without it the page builds locally but
returns 404 in production. Cloudflare only serves files the build wrote to `dist/`.

## 3. The page component and route

Create the page component and wire it into the app:

### 3.1 Create the component file

Create `src/pages/<YourPage>.jsx`. The convention in `src/pages/` is one
component file per page, with an optional matching CSS file beside it. Other
pages in that directory show the pattern — for example, `ReviewsPage.jsx`.

### 3.2 Add the import

Add the import at the top of `src/App.jsx`, beside the existing page imports
(lines 6–17):

```jsx
import YourPage from './pages/YourPage'
```

A missing import leaves the page blank, because `YourPage` is then undefined.
This mistake is easy to make and costs real debugging time.

### 3.3 Add the route branch

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

## 6. Nav and Footer links — ask first, do not add by default

Both lists are **curated**, not registries of every page. Do not add a new page to
either one without asking.

`src/components/Nav.jsx` holds a `NAV_LINKS` array at lines 9 to 14 with exactly
four entries: `/program`, `/services`, `/recruit`, and `/pledge`. Seven routed
pages are deliberately absent, including permanent ones such as `/reviews`,
`/teams`, `/syllabus`, and `/program-for-teams`. Being permanent does not earn a
nav slot; primary navigation is a product decision, so ask the user whether they
want the page there.

That component is also not the site-wide header. Only five page components import
it: `LelandAIPage`, `PledgePage`, `RecruitPage`, `ServicesPage`, and
`TeamsProgramPage`. The rest carry their own header markup — `HomePageRebrand`
uses `header.rb-nav`, for example. So editing `NAV_LINKS` changes those five pages
and no others.

`src/components/Footer.jsx` holds internal links in the For Organizations column
at `src/components/Footer.jsx:48`, and is imported by four page components. It is
curated the same way.

If the user does want the page in the nav, add an entry:

```jsx
{ label: 'Your Page', href: '/your-page' },
```

Skip both lists entirely for a campaign or partner page that should not be
discoverable.

## Verify before you finish

```bash
npm run check   # registry and assets
npm run build   # the real production build
npm run dev     # then open the page, but read the warning below first
```

**In dev, open a React page at `/<name>` and a standalone page at `/<name>.html`.**
The dev server falls back to `index.html` for a path it does not recognise, and that
fallback returns HTTP 200. So a standalone page opened at its clean URL looks like it
worked while rendering the React shell instead of your page. Production is not
affected: Cloudflare serves `/<name>` from `<name>.html`.

Confirm `dist/<name>.html` exists after the build. If it does not, step 2 is
missing.
