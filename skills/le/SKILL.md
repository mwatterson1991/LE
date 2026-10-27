---
name: le
description: Leland's brand asset library (LE). Use whenever making any Leland marketing asset, post, image, video, email or deck — to find approved images, videos, icons, music, taglines and post copy, and to stay inside the brand guardrails. Trigger on "Leland asset", "brand image", "launch kit", "on brand", "/le".
---

# LE — Leland asset library

LE is the repository. You are the hands. Nobody needs to open LE to use it.

## 1. Load the manifest
Fetch `LE_URL/data/manifest.json` (LE_URL is where index.html is hosted, e.g. https://le.joinleland.com/).
It contains:
- `brand` — fonts, colors, taglines, pitch, FAQ, audience tracks, guardrails, store links
- `assets[]` — every file: `id`, `type` (image|video|audio|icon), `group`, `title`, `sub`, `tags[]`, `src` (relative to LE_URL), `thumb`/`poster`, `best` (which post ideas it fits)
- `posts[]` — the 12 launch post ideas, verbatim, each with `assets[]` it pairs with

Groups: `hero` `header` `card` `aibp` `aipost` (launch kit images) · `film` `kit` (videos) · `background` `photo` · `graphic` · `icon` · `music`.

## 2. Pick, don't invent
Match the ask against `tags`, `title`, `sub` and `best`. Return the full URL (`LE_URL + src`). Never make up an asset or quote the sample numbers inside graphics as real.

## 3. Write inside the brand
- Headlines in **Season** (weight 500), everything else in **Macan**. Monochrome plus photography.
- One blue phrase per headline, written as `[brackets]` — "One conversation could [open the door]." LE renders brackets blue.
- Approved taglines: Own your future. · Accomplish your goals. · The home for ambition. · Get there, with the people who’ve been there.
- Voice: confident, warm, specific. No hype, no exclamation marks, no emojis.
- Launch films end with: logomark + "Leland" + a tagline with one blue phrase + App Store / Google Play.

## 4. Guardrails (verbatim from the launch kit)
- Post on Oct 15 or later. Nothing before.
- Lead with learning from people who've done it. Meeting peers is a bonus, not the headline.
- Say "experts post with real names," not "every post."
- Real stories beat generic lines. If you have one, use it.
- Don't call the Community product AI-powered.
- Don't make up numbers, and don't quote the sample numbers in the graphics as real.
- CTA: "Come ask" or "Follow along," with a link to the App Store, Google Play or web.

## 5. To make something, not just find it
Open `LE_URL/#editor` for a person, or build it yourself: a still is a background from `background`/`hero` + Season headline + Macan subhead + logomark top-left. A launch video is three beats: hook (typed, blue phrase) → product shot (a `card`/`aipost` image, or a screenshot) → outro. Music comes from `music`.
