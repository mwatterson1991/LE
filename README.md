# LE — Leland's repository

A repository of our work and the images people draw from, plus one skill. `/le` gives Claude the whole of it.

## Run
`npx serve .` (or any static server) and open the URL. Opening `index.html` directly works for browsing but blocks exports, because browsers won't let a `file://` page draw images to a canvas.

## What's in it
- **Make** — Image (six types, one of them a chart) and Deck. Video reads "Coming soon"; its code is parked in `js/unused/`.
- **Library** — Images (launch kit, backgrounds, photos, experts, illustrations, graphics, logos, icons), GIFs (and Leo, the animated face, as a pack), Videos (films, intros and outros, scenes, music), Copy (taglines, voice, posts), Fonts.
- **Projects** — drafts autosave here; delete from the row.
- **Skill** — the `/le` skill, assembled from the manifest, copy.json and BRAND-BRIEF.md. Copy it or download the .md.
- **Motion** — how Leland moves: text, buttons, transitions, logo, timing. One rule a line, each with a demo that replays on hover.
- **Brand** — the brand board and the brief, then the chat interface guidelines (`brand/chat-guidelines.html`).

## Fonts
`fonts/` has Season Mix Medium and Macan Book/Medium/SemiBold as woff2, pulled from apps.joinleland.com. Keep this repo private — they're licensed.

## Structure
    index.html · css/le.css
    js/le.js                the app
    js/templates.js         image types (canvas)        js/deck.js · js/present.js   decks
    js/mark.js · js/orb.js  the animated mark and orb, lifted from the chat interface guidelines
    js/unused/              parked: video maker, case study builder, five retired image types
    data/manifest.json      every asset, the file Claude reads
    data/copy.json          every line with its source, and the voice
    brand/                  board.html · chat-guidelines.html
    assets/                 kit/ films/ scenes/ audio/ img/ photos/ brand/ graphics/ illustrations/ orgs/ icons/ gifs/ leo/
    fonts/                  Season Mix, Macan, and Macan with a plain question mark (-Q, built by tools/macan-q.py)
    skills/le/SKILL.md      the skill as a file (same text as the Skill page)
    tools/                  macan-q.py · manifest-nov23.py

## Add an asset
Drop the file in the right `assets/` folder and add an entry to `data/manifest.json` (`id`, `type`, `group`, `title`, `tags`, `src`, `thumb`). That's the whole system — LE and Claude both read the manifest.
