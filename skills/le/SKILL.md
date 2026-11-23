---
name: le
description: LE is Leland's repository of marketing work — the images, photos, logos, GIFs, films, fonts, taglines and posts people draw from — plus the brand rules. Use it whenever making any Leland marketing asset (post, image, deck, video, email, page) to fetch the approved asset or line and stay inside the rules. Trigger on "Leland asset", "on brand", "launch kit", "/le".
---
# LE — Leland's repository

LE is the repository. You are the hands. Nobody needs to open LE to use it.

## 1. Read these first
- Manifest, every asset: https://mwatterson1991.github.io/LE/data/manifest.json
- Copy, every line with its source: https://mwatterson1991.github.io/LE/data/copy.json
- Brand brief: https://mwatterson1991.github.io/LE/BRAND-BRIEF.md
- Sales-deck rules: https://mwatterson1991.github.io/LE/SALES-DECK.md
- Chat interface guidelines (logo, orb, voice, answers, widgets, icons, type, colour, images, intro, section screens, motion, scores, ten rules): https://mwatterson1991.github.io/LE/brand/chat-guidelines.html
- Brand board: https://mwatterson1991.github.io/LE/brand/board.html

Fetch the manifest and the brief before making anything. If a file cannot be fetched, say so; do not work from memory.

## 2. Leonardo 3.0 rules (verbatim from BRAND-BRIEF.md)
1. White is the default field (#FFFFFF). Beige/paper are occasional, not everywhere. One field color per tile.
2. No eyebrow text. No small caps label above a headline ("ABOUT LELAND", "WHAT WE HEARD"). No subcopy under it. The headline stands alone.
3. Yellow is an accent, used sparingly, never as a background and never under or behind text. The lockup may sit on yellow; words may not.
4. #3963D7 (the Follow-button blue) is UI, not brand. Never use it in assets. The brand blue is #80ACED. On light fields the accent phrase is #80ACED, used sparingly.
5. Text limits per slide/tile: headline ≤ 10 words; body ≤ 40 words total; ≤ 3 items. If a slide needs more, it is two slides.
6. Illustrate the concept instead of describing it. One illustration or diagram per slide, large. Claude does not draw illustrations; it writes the ChatGPT image prompt (see assets/illus/PROMPTS.md), the image is generated there, dropped into assets/illus/, and the renderer picks it up. Diagrams (timelines, layers, grids) are drawn in code.
7. Type: Season Mix headlines, Macan body. At most two body sizes on a slide.

## 3. Fetch an asset by group and title
`manifest.assets[]` is a flat list. Every entry has `id`, `type`, `group`, `title`, `tags[]` and `src`. `src` is relative: the file is at https://mwatterson1991.github.io/LE/ + src.

1. Pick the group from the table below.
2. Filter `assets` to that group.
3. Match the ask against `title` first, then `tags`, case-insensitive. If several match, prefer the title that starts with the ask.
4. Return https://mwatterson1991.github.io/LE/ + `src`. If nothing matches, say so and offer the closest titles. Never invent an asset or a URL.

Example: the ask is "the Stanford Law School logo" → group `org`, title "Stanford Law School" → https://mwatterson1991.github.io/LE/assets/orgs/Stanford_Law_School.png
Example: the ask is "a photo of someone on stairs" → group `photo`, title "Climbing wide stairs in a yellow coat" → https://mwatterson1991.github.io/LE/assets/brand/board-2.webp

| group | what it is | count | extra fields |
|---|---|---|---|
| photo | photography, true size | 65 | w, h, thumb |
| background | sky, texture and abstract fields | 20 | thumb |
| hero, header, card, aibp, aipost | launch kit images we posted | 42 | thumb |
| expert | expert headshots | 23 | thumb |
| illustration | blue line illustrations (SVG) | 299 | set |
| graphic | brand lockups and product graphics | 16 | dark (needs a dark field) |
| org | school and company logos | 199 | kind (school or company), mono.black, mono.white |
| icon | interface icons (SVG) | 165 | |
| gif | looping sales and marketing concepts | 25 | mp4, poster |
| film, kit | finished films | 11 | poster, duration |
| scene | single scenes cut from the films | 29 | style (intro, text, product, outro), from, poster |
| music | film soundtracks | 5 | duration |
| font | Season Mix and Macan (woff2) | 7 | family, weight, plainQuestionMark |
| pack | Leo, the animated face (zip) | 1 | preview, files |

Photo titles describe the scene or the action. Never describe a person by race or ethnicity when choosing, captioning or tagging a photo.

## 4. Copy
Use lines from `copy.json` as they are written; every item has `kind`, `text`, `for`, `platform` and `source`. Do not write new marketing copy when a line exists. The shelves are `tagline` and `post`; `headline`, `hook`, `cta`, `subject`, `ad`, `bio` and `quote` are in the file too.

Approved taglines: Own your future. · Accomplish your goals. · The home for ambition. · Get there, with the people who’ve been there.

Voice (copy.json → voice.summary): Leland sounds like a smart friend who has done the thing and is telling you how: short sentences, a named school or company or number in nearly every line, and warmth that comes from inviting you in ("Come ask.") rather than from adjectives. Brand surfaces stay flat and confident with no exclamation points; the energy lives in founder and employee posts, in real customer quotes, and in the specificity of the detail.

Voice rules (copy.json → voice.rules, verbatim):
1. Lead with the point. "Today we launched Leland Community." not "Thrilled to announce" (house-style; Social Kit words-to-avoid).
2. Name it: the school, the company, the number, the person. "Google, Meta and Goldman" beats "top companies" every time (Social Kit idea 5; marketing-copy-guide).
3. Sell what they'll be able to do and how fast. "Become an AI Builder in 6-10 weeks", "about two hours", "from 2 hours to 30 minutes" (marketing-copy-guide core promise; case-study posts).
4. Numbers are real or absent. Never quote the sample numbers in the graphics or videos; never round a profile stat up (Social Kit guardrails; marketing-copy-guide).
5. No exclamation points and no em dashes in Leland's own copy. Verbatim quotes keep theirs (house-style). Founder and employee LinkedIn posts run warmer, and the kit allows it ("let the energy show"), so strip the punctuation when you move a team post onto a brand surface.
6. Warm comes from the invitation: come ask, follow along, send this to someone, the door's open. Not from community-speak like join our community or find your tribe (Social Kit voice).
7. Lead with learning from people who've done it. Meeting peers is a bonus, not the headline (Social Kit guardrails).
8. Don't call Community AI-powered, personalized or algorithmic, and don't name LinkedIn as the comparison in public posts (Social Kit guardrails).
9. Say expert, never coach, in anything new. The team still says coach in Slack and Nick edited "mentors" to "coaches" in-product on 10-19, so copy from Slack with care (BRAND-BRIEF; Mike Mella in #brand 2026-06-11).
10. The first line is the hook and the logo waits. A face beats a graphic, an opinion beats an announcement, a question beats a statement (Michael L via Vica 2026-01-30; Vica 2025-10-08; John on the jobs video 2026-10-22; John 2025-06-09).
11. Headlines are sentence case, 4 to 8 words, no period unless the period is the move ("Walk away certified.") (house-style; marketing-copy-guide).
12. First-touch email is friendly, not aggressive: "Welcome to Leland 👋" doubled opens over "Meet the experts getting customers into HBS, GSB and Wharton"; the CTA names the action, "Join Your First GRE Livestream" (Christian, #email 2026-08-16 and 2026-08-27).

## 5. Brand (verbatim from BRAND-BRIEF.md)
Palette rules: One field color per tile. Ink type on yellow/beige/tan/paper; white type on blue/slate/black/photos. No gradients, no green ever. The mark is ink or white, never yellow itself (it sits ON yellow). The LE tool's own chrome is monochrome; that is not the brand palette.

Type:
- Season Mix 500 (fonts/SeasonMix-Medium.woff2) for headlines. Sentence case, tight letter-spacing (-.02em), 4–8 words.
- Macan 400/500/600 (fonts/Macan-*.woff2) for everything else.
- One phrase in a headline may be colored (blue #80ACED on light, or white on blue) — never more than one.

Lockups:
- assets/brand/logo.svg (mark + wordmark, ink), assets/brand/logo-white.svg, assets/brand/mark.svg, assets/brand/mark-white.svg. Vector; use these, not the PNG.
- On photos the mark/lockup is white and sits in a corner or large and centered.

Photography:
- Real people in real cities, mid-stride, mid-moment; stairs, crosswalks, doorways; warm light; slight grain. See assets/brand/board-*.webp (from the board) and assets/photos/.
- Sky photos (blue) and dark streak backgrounds carry a white lockup.

Illustration:
- 299 blue line illustrations in assets/illustrations/ (black line, #80ACED fills). Use on paper/beige/white, one or three at a time, never as a background texture.

## 6. Fonts
- Season Mix 500: https://mwatterson1991.github.io/LE/fonts/SeasonMix-Medium.woff2
- Macan 400 / 500 / 600 with a plain question mark: https://mwatterson1991.github.io/LE/fonts/Macan-Book-Q.woff2, https://mwatterson1991.github.io/LE/fonts/Macan-Medium-Q.woff2, https://mwatterson1991.github.io/LE/fonts/Macan-SemiBold-Q.woff2
- From the chat interface guidelines: "A plain question mark, never Macan's." Use the -Q files, or map U+003F to Helvetica Neue in CSS: `@font-face{font-family:'QMark';src:local('Helvetica Neue'),local('Helvetica'),local('Arial');unicode-range:U+003F}` and put 'QMark' first in the font stack.

## 7. Guardrails (verbatim from the launch kit, manifest.brand.guardrails)
- Post on Oct 15 or later. Nothing before.
- Lead with learning from people who've done it. Meeting peers is a bonus, not the headline.
- Say "experts post with real names," not "every post."
- Real stories beat generic lines. If you have one, use it.
- Don't call the Community product AI-powered.
- Don't make up numbers, and don't quote the sample numbers in the graphics as real.
- CTA: "Come ask" or "Follow along," with a link to the App Store, Google Play or web.

## 8. Decks
Follow https://mwatterson1991.github.io/LE/SALES-DECK.md. It sits on top of the Leonardo 3.0 rules, which still govern fields, type, lockup and text limits.
