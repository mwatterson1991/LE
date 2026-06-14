# Multi-session coordination — leland.ai subpages

We are building the leland.ai subpages across **several parallel Claude Code sessions**, all committing to `main`. This doc keeps us from clobbering each other's pages or causing merge conflicts. **Read this before editing shared files.**

Paste this whole file (or its path) into each session so everyone follows the same rules.

---

## 1. Who owns what (one session per page)

| Page | Route | Page file (yours alone) | Page-only CSS (yours alone) |
|------|-------|--------------------------|------------------------------|
| Home | `/` | `src/pages/LelandAIPage.jsx` | *(uses shared CSS — see note)* |
| AI Services | `/services` | `src/pages/ServicesPage.jsx` | `src/pages/services.css` (`svc-` prefix) |
| Recruit | `/recruit` | `src/pages/RecruitPage.jsx` | `src/pages/recruit.css` (`rcr-` prefix) |
| 100M Pledge | `/pledge` | `src/pages/PledgePage.jsx` | `src/pages/pledge.css` (`plg-` prefix) |

**Rule:** Only edit the page file and page-CSS for the page your session owns. Never edit another page's `*.jsx` or its prefixed CSS file.

---

## 2. SHARED files — handle with care (coordinate before editing)

These are imported by **every** page. An edit here can break or restyle all four pages and is the #1 source of merge conflicts:

- `src/pages/leland-ai.css` — the big one. `lai-` prefix. Imported by home, services, recruit, pledge, program, teams.
- `src/pages/home-rebrand.css` — design tokens (`--blue`, `--yellow`, fonts, etc.) + base `.hero`, footer, nav.
- `src/components/Nav.jsx`, `src/components/Footer.jsx`, `src/components/Faq.jsx` — shared components on every page.
- `src/App.jsx` — routing + analytics page-name map.
- `src/pledgeData.js` — shared by home band + pledge page.
- `public/data/featured-reviews.json` — shared reviews data.
- `public/assets/**` — shared images/logos/fonts.

**If you must touch a shared file:**
1. Say so in your commit message (e.g. `shared(leland-ai.css): ...`) so others can rebase.
2. Keep it **additive and minimal** — add new rules; do not rename, restructure, or change values of existing shared selectors.
3. `git pull --rebase` immediately before and after.
4. Never change a design **token** in `home-rebrand.css` without telling the other sessions — it cascades to all pages.

---

## 3. CSS isolation pattern (do this for all new styles)

Put **new styles in your page's own prefixed CSS file**, not in `leland-ai.css`.

- Services → `services.css`, prefix new classes `svc-`
- Recruit → `recruit.css`, prefix `rcr-`
- Pledge → `pledge.css`, prefix `plg-`
- Home → has no isolated file yet; if the home session adds a lot, create `home.css` and use a `home-` prefix.

Do **not** redefine another prefix's classes in your file. Genuinely shared primitives that already exist in `leland-ai.css` (`.lai-container`, `.lai-section-title`, `.lai-hero`, `.lai-cta-yellow`, `.lai-feature*`) may be **reused as-is**, but if you need them to look different on your page, override them **scoped to your page** in your own file, e.g.:

```css
/* services.css — scope overrides so they can't leak to other pages */
.svc-page .lai-section-title { font-size: 40px; }
```
(Add a `svc-page` wrapper class on the Services root if you need this.)

---

## 4. Git protocol

- `git pull --rebase origin main` **before starting a batch** and **before every push**.
- Commit small and push often — short-lived diffs conflict far less than big ones.
- One logical change per commit. Prefix shared-file commits with `shared(...)`.
- The deploy runs on every push to `main` (`.github/workflows/deploy.yml` → GitHub Pages). **Run `npm run build` locally before pushing** so a broken build doesn't block everyone's deploys.
- If you create a new page file, wire its route in `src/App.jsx` **and commit the file in the same push** — never push a route that imports an uncommitted file (it breaks the build for everyone).

---

## 5. Current known state (update as it changes)

- `leland-ai.css` is actively edited by multiple sessions — treat as hot. Most page-specific `lai-` blocks for Services (use-cases grid, paths, agent cards) still live here; they will migrate to `services.css` in a coordinated cleanup once sessions settle.
- There is an untracked `src/pages/TeamsProgramPage.jsx` in some working trees — not yet routed/committed. Don't push it half-wired.
- `/teams` (`B2BPage.jsx`) is the older B2B page, left as-is for now.

---

## 6. Quick checklist before you push

- [ ] Did I only edit my page's files + my prefixed CSS?
- [ ] If I touched a shared file, is the change additive + flagged in the commit message?
- [ ] `git pull --rebase` done?
- [ ] `npm run build` passes?
- [ ] New routes/files committed together?
