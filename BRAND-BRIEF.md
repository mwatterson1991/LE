# Leland 2.0 — working brief for anyone making assets in LE

Source of truth: `brand/board.html` (the living brand board). Open it in a browser. Everything below is derived from it.


## Leonardo 3.0 rules (Oct 29, 2026, from Michael)
1. White is the default field (#FFFFFF). Beige/paper are occasional, not everywhere. One field color per tile.
2. No eyebrow text. No small caps label above a headline ("ABOUT LELAND", "WHAT WE HEARD"). No subcopy under it. The headline stands alone.
3. Yellow is an accent, used sparingly, never as a background and never under or behind text. The lockup may sit on yellow; words may not.
4. #3963D7 (the Follow-button blue) is UI, not brand. Never use it in assets. The brand blue is #80ACED. On light fields the accent phrase is #80ACED, used sparingly.
5. Text limits per slide/tile: headline ≤ 10 words; body ≤ 40 words total; ≤ 3 items. If a slide needs more, it is two slides.
6. Illustrate the concept instead of describing it. One illustration or diagram per slide, large. Claude does not draw illustrations; it writes the ChatGPT image prompt (see assets/illus/PROMPTS.md), the image is generated there, dropped into assets/illus/, and the renderer picks it up. Diagrams (timelines, layers, grids) are drawn in code.
7. Type: Season Mix headlines, Macan body. At most two body sizes on a slide.

## Palette update (Nov 25, 2026, from Michael's colour board)
Sampled from the board he sent. Five steps per family, dark to light; blank steps on the board are not defined yet.
| family | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| blue | #31419B | #4362D0 | #89ABE8 | #C9D8F5 | #E4ECFA |
| yellow | (rust #893D1B) | | #F9DA7F | #FCEDBF | #FDF5DF |
| green | #1E4937 | #306E54 | | #CCEADE | #E6F5EF |
| red | #8E2D21 | #C83E2E | #EB7E72 | #FAE7E4 | #FCF3F2 |
| tan | #764833 | #B16F44 | #E7D5B9 | #F3EADC | #FAF7F2 |
| slate | #616E78 | #8A99A5 | | | |
| clay | #AC5F37 | | | | |
| alternate green (potential) | #39472F | #577144 | #82A267 | | #F3F6F0 |
- Coloured text (the one accent phrase in a headline) uses blue 2, #4362D0. Blue 3 (#89ABE8, the old #80ACED) is for fills and fields, not text: it is too pale to read.
- This supersedes rule 4 above: #4362D0 is brand. The banned colour is the old Leland green #15B078, not green as such; the greens on this board are allowed.
- Yellow #F9DA7F may sit behind a numeral as a small badge (rank circles). It is still never a field behind a headline.

## Palette (marketing assets)
| name | hex | use |
|---|---|---|
| yellow | #FFD96F | the brand color. Big flat fields behind the lockup or a headline; the app icon |
| blue | #80ACED | second field color; sky photos; UI tints |
| slate | #869AA6 | cool neutral field |
| beige | #F3F1E6 | warm light field |
| tan | #EBD4B5 | warm mid field |
| paper | #F9F8F3 | off-white page |
| ink | #010101 | type, the mark |
| neutral | #222222 | body text on light |
| follow | #3963D7 | UI only (the LE tool). Never in assets. |
| white | #FFFFFF | type and lockup on photos, blue, slate, black |

Rules: one field color per tile. Ink type on yellow/beige/tan/paper; white type on blue/slate/black/photos. No gradients, no green ever. The mark is ink or white, never yellow itself (it sits ON yellow). The LE tool's own chrome is monochrome; that is not the brand palette.

## Type
- Season Mix 500 (`fonts/SeasonMix-Medium.woff2`) for headlines. Sentence case, tight letter-spacing (-.02em), 4–8 words.
- Macan 400/500/600 (`fonts/Macan-*.woff2`) for everything else.
- One phrase in a headline may be colored (blue #80ACED on light, or white on blue) — never more than one.

## Lockups
- `assets/brand/logo.svg` (mark + wordmark, ink), `assets/brand/logo-white.svg`, `assets/brand/mark.svg`, `assets/brand/mark-white.svg`. Vector; use these, not the PNG.
- On photos the mark/lockup is white and sits in a corner or large and centered.

## Photography
- Real people in real cities, mid-stride, mid-moment; stairs, crosswalks, doorways; warm light; slight grain. See `assets/brand/board-*.webp` (from the board) and `assets/photos/`.
- Sky photos (blue) and dark streak backgrounds carry a white lockup.

## Illustration
- 299 blue line illustrations in `assets/illustrations/` (black line, #80ACED fills). Use on paper/beige/white, one or three at a time, never as a background texture.
- 9 flat illustrations in `assets/illus/flat/` (manifest group `flat`; wide, square and tall crops). One per image, large, edge to edge on half the tile.

## Copy
- Tagline on the board: "The home for ambitious people." Approved: Own your future. · Accomplish your goals. · The home for ambition. · Get there, with the people who've been there.
- Voice: direct, concrete, warm, no hype, no exclamation points, no em dashes. Name the school, the company, the number, the person. Say expert, not coach.

## Assets available to renderers (data/manifest.json)
groups: hero, header, card, aibp, aipost (launch kit) · film, kit, scene (video) · gif · background, photo, expert (headshots), graphic, flat (flat illustrations), illustration (line), org (logos, with mono.black/mono.white), icon, music.
