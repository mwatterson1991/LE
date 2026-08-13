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

## 1. The HTML entry file

Create `<name>.html` in the repo root. Copy an existing one, for example
`program.html`, which is the smallest. Keep the `<div id="root">` and the module
script that loads `/src/main.jsx`. Update `<title>` and the meta description.

## 2. The Vite input map

Add the file to `build.rollupOptions.input` in `vite.config.js`:

```js
'<name>': resolve(__dirname, '<name>.html'),
```

**This is the step that gets missed.** Without it the page builds locally and
returns 404 in production, because Cloudflare only serves what the build wrote
to `dist/`.

## 3. The route in src/App.jsx

`App` routes on `window.location.pathname` with a chain of `startsWith` checks.
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

## 6. Footer links, when the page is permanent

`src/components/Footer.jsx` holds the internal links, in the AI Builder column.
`Nav.jsx` has no internal links, so it needs no change.

Skip this for a campaign or partner page that should not be discoverable.

## Verify before you finish

```bash
npm run check   # registry and assets
npm run build   # the real production build
npm run dev     # then open http://localhost:5173/<name>
```

Confirm `dist/<name>.html` exists after the build. If it does not, step 2 is
missing.
