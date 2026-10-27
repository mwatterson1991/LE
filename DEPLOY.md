# Deploy LE — step by step, no guessing

## 1. GitHub (5 minutes)
1. github.com → **+** (top right) → **New repository** → Repository name `le` → choose **Private** → **Create repository**.
2. On the empty repo page, click the link **uploading an existing file**.
3. Open the unzipped `le` folder in Finder. Press ⌘A to select everything inside it. Drag the selection onto the GitHub page. Wait for the progress bar (the videos take a minute).
4. Scroll down → **Commit changes**.
5. In the repo: **Settings** (tab) → **Pages** (left sidebar) → under *Build and deployment*, Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → **Save**.
6. Wait two minutes, reload that page. The link at the top is LE, live. Fonts, exports, everything works there.

Private repos need GitHub Pro/Team for Pages. If you're on Free, either upgrade (one click on the Pages screen) or make the repo public *after* deleting the `fonts/` folder (then LE falls back to system fonts until you host the fonts elsewhere).

## 2. Custom domain (optional)
Repo → **Add file → Create new file** → name it `CNAME` → contents `le.joinleland.com` → Commit. Ask whoever runs DNS to add a CNAME record `le` → `<your-github-username>.github.io`.

## 3. Turn on Opus (1 minute)
Open LE → **Me → Connect Opus** → paste an Anthropic API key from console.anthropic.com → OK. The key stays in your browser only.

## 4. Team Opus + shared "Ready to post" (15 minutes, optional)
1. Install Node from nodejs.org.
2. Open Terminal. Type `cd ` (with a space), drag the `worker` folder from Finder into the Terminal window, press Return.
3. `npx wrangler login` → press Return → a browser opens → Allow. (Free Cloudflare account is fine.)
4. `npx wrangler kv namespace create LE` → copy the `id = "..."` line it prints into `wrangler.toml`, replacing REPLACE_WITH_KV_ID.
5. `npx wrangler secret put ANTHROPIC_KEY` → paste the key → Return.
6. `npx wrangler deploy` → it prints a URL like `https://le-api.<you>.workers.dev`.
7. In LE: **Me → Connect Opus** → leave the key blank → OK → paste that URL.

## 5. Give Claude the library (1 minute)
Open LE → **Brand → Use LE in Claude → Copy skill**. Paste into Claude as a new skill named `le`. From then on anyone can say "make a Leland post about X" in Claude and it pulls from the real library.
