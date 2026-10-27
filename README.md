# LE — Leland's asset engine

Come here, grab an on-brand asset, or make one in seconds. Or don't come here at all: `/le` gives Claude the whole library.

## Run
`npx serve .` (or any static server) and open the URL. Opening `index.html` directly works for browsing but blocks exports, because browsers won't let a `file://` page draw images to a canvas.

## What's in it
- **Make** — pick Image, Video or Deck. Below it, **Ready to post**: real launch-kit assets paired with the real post copy. Pick where, pick when, Schedule. Three clicks.
- **Library** — the Community launch kit (51 images, 9 cuts), the 5 launch films, their soundtracks, 20 brand backgrounds, 47 library photos, 8 graphics, 165 icons, 4 taglines, 12 post ideas. Click anything to preview in place; back button and Esc both return you.
- **Editor** — Image: Season headline with one `[blue]` phrase, Macan subhead, button, background, position. Video: the launch-film template — hook, product shot, outro, music. Deck: slides on the same system. Everything downloads as real files (PNG, MP4/WebM with music, slides as PNGs).
- **Brand** — fonts, logo, color, taglines, how we talk about it, guardrails, the Claude skill, Opus connection.

## Fonts
`fonts/` has Season Mix Medium and Macan Book/Medium/SemiBold as woff2, pulled from apps.joinleland.com. Keep this repo private — they're licensed.

## Structure
    index.html · css/le.css · js/le.js
    data/manifest.json      every asset + copy + brand, the file Claude reads
    assets/kit/             launch kit images (+ thumbs/, video/)
    assets/films/           the five launch films (+ posters)
    assets/audio/           soundtracks from the films
    assets/img/             brand backgrounds (+ xs/)
    assets/photos/ graphics/ icons/   design library
    fonts/                  Season + Macan
    skills/le/SKILL.md      the Claude skill
    worker/                 optional proxy for shared Opus + shared queue

## Add an asset
Drop the file in the right `assets/` folder and add an entry to `data/manifest.json` (`id`, `type`, `group`, `title`, `tags`, `src`, `thumb`). That's the whole system — LE and Claude both read the manifest.

## Opus
Me → Connect Opus → paste a key (stays in your browser). The brief bar and Rewrite then write real copy inside the guardrails. Scripted fallback otherwise. For a team key, deploy `worker/` (see DEPLOY.md).
