# LE — what's real, what's next, what to ask engineering

## The five flows LE is built around
1. **A visual for my post** — Make → Image. Pick a background from the drawer, type the headline (one [blue] phrase), drag it where you want it, add an illustration or a product shot, Download. Under a minute.
2. **A launch film for the thing I shipped** — Make → Video. Hook (typed / rise / words), product shot (upload a screenshot or pick a kit card), outro (Leo spins in, wordmark, tagline, badges), music from the real launch films. Render.
3. **A deck for what I'm proposing** — Make → Deck. Slides on the same system, each a 1920×1080 PNG. (Next: pptx export.)
4. **A campaign tied to Meta / Google** — not yet. Needs the ad-account connections below. Design is ready (the hidden Ads/Connections screens); data isn't.
5. **Grab an approved asset from anywhere** — Library, or `/le` in Claude. Nobody has to open LE.

## Drag and drop vs. Canva
Today: three draggable layers on the canvas (text, illustration, product shot), wheel to scale, arrow keys to nudge, inline drawer for every asset. Canva still wins on free-form: arbitrary shapes, multiple text boxes, rotation, guides, templates. Those are the next editor steps, in that order, if we want them — but the point of LE is that you never need them, because the brand system does the composing.


## Real today (no backend)
- Library of 300+ brand assets with search, tags, in-place preview, back routes
- Image export (PNG, four sizes), video export (launch-film template, music mixed, MP4/WebM), deck export (PNGs)
- Ready to post queue (local to your browser; shared via the worker)
- Opus copywriting inside the guardrails (your key, or the worker)
- Claude skill: the whole library is reachable from any chat

## Next (in order)
1. **Host it** — GitHub Pages or design.joinleland.com. Day one.
2. **Shared state** — the worker gives everyone the same queue and projects. Half a day.
3. **Real scheduling** — "Schedule" today saves the item and copies the text. To actually post:
   - LinkedIn: Community Management API (company page posts). Needs a LinkedIn developer app + partner approval (~2–4 weeks). Personal-profile posting (John's account) is more restricted; Buffer/Hypefury-style tools do it via official partner access.
   - Instagram: Instagram Graph API, business account, content publishing is supported for images and Reels. 1 week once the Meta app is approved.
   - X: v2 API, paid tier ($100/mo basic). 1 day.
   - TikTok: Content Posting API, needs app review. 2 weeks.
   - Email: HubSpot API — create a marketing email from a template with the hero image. 2 days.
   Simplest path: pipe "Schedule" into Buffer or Zapier first (one afternoon), replace with direct APIs later.
4. **Ads, for real** — read-only first. Meta Marketing API (insights by ad), Google Ads API (needs a developer token; approval ~1–2 weeks). Store nightly in Databricks (`leland_analytics`). Then LE's Ads page shows the ads we are actually running, ranked by CPL. Only after that does "remix a winner" mean anything. ~3 weeks of one engineer.
5. **Attribution** — every ad and post needs a UTM; PostHog + HubSpot close the loop from click to lead to booking. This is the unglamorous part the whole engine depends on.
6. **Video beyond the template** — a second template (feature tour: screenshots with captions) and server-side rendering (ffmpeg) for 1080p60 with real transitions.

## Questions to ask the developers
1. Do we have a Meta Business app, and is anyone a System User on the ad account? (Needed for read-only ad insights.)
2. Do we have a Google Ads developer token, and what access level? (Test vs Basic vs Standard.)
3. Is the LinkedIn company page connected to any developer app today? Who owns it?
4. Where does the Instagram business account live, and is it linked to a Facebook Page? (Required for API posting.)
5. Are UTMs on every paid ad and launch post today? Who generates them?
6. In PostHog, is there an event that marks "lead created" and "booking made", with the UTM attached?
7. Can we get a nightly job in Databricks that writes `ad_id, date, spend, impressions, clicks, leads, bookings`? (That one table is the whole analytics layer.)
8. Where can LE be hosted inside Leland — `design.joinleland.com` already serves brand assets with CORS; can it serve this app?
9. Is there an Anthropic org key and a place to keep secrets (Cloudflare Workers, or the existing n8n)?
10. Who owns the Buffer/Zapier accounts, if any, and can "Schedule" post through them as a bridge?


## Oct 28 — what landed
- 299 product illustrations pulled straight from Figma as SVG (Communication & Social, Business & Work, Growth & Achievements). The old 3D category emojis are gone.
- Logos split into Schools (62) and Companies (137), each with generated black and white versions (`mono.black`, `mono.white`). A few solid-tile marks need a hand pass.
- 23 coach headshots from the brand library's `coach_images` (the sharp ones; low-res and odd-background ones left out).
- Every video cut into scenes (61 clips) tagged intro / text / product / outro. Scenes tab in the library, and the video editor is now scene-based: Text animation · Product shot · Animated UI (any scene clip) · Intro · Outro, reorder, remove, per-scene length.
- Motion page: director-owned presets for text animation, transitions and the logo outro. Edit speed, stagger, easing; set defaults; export JSON. The editor reads them.
- Connect page: Create (Figma, Drive, Notion, Opus, Slack) vs Distribute and measure (LinkedIn, Instagram, Meta Ads, Google Ads, YouTube, PostHog) and a "Where everything is" table — asset, format, where, spend, results. Spend and results fill when the ad accounts are wired (needs tokens; see the ten questions above).
- Story maker (from the Sep 29 Slack thread on case studies): paste a customer story → company logo, headline, who, before, what they built, quote, close. Outputs: LinkedIn carousel PDF (4:5), slide PNGs, a web page for leland.ai/customers, and the post text. Opus extracts the fields when connected; scripted read otherwise.
- Tabs are text-only (bold black on, grey off). Videos are two-up and autoplay on hover. Three duplicate launch-kit copies of films removed. Music has waveform artwork. "Copy for Claude" removed; the skill covers it.

## Oct 28, later — second pass
- Library is four shelves (Images, GIFs, Videos, Copy) with sub-shelves beneath; atoms you combine on Make.
- GIFs: five looping sales concepts built from the AIBP pitch (ladder, hours back, your work, builder mindset, AI employee) — GIF + MP4 + editable HTML source in assets/gifs/src. They also drop into videos as clips.
- Graphics recolored to the current brand (no green). Four are still old-era compositions and should be redrawn: company-deep-dives, example-resumes, coach-videos, coach-available.
- Scenes trimmed to the five finished films (29 clips). "Coaches" renamed "Experts" per house style.
- Motion presets now come from measuring the films (data/motion-ref.json): typed ~45 chars/s, words 0.45s with 0.1s stagger, logo draws on then the wordmark types (default), dissolve 0.35s. Each preset shows its reference clips. Leo spin-in kept as an option for Community only.
- Video editor: stage, a timeline of thumbnail blocks (drag to reorder), and building blocks beneath (Text, Product shot, Intro, UI clip, Concept, Outro).
- Brand page: thesis, principles, voice, do/don't, look, audiences from data/brand.json (compiled from the brand kickoff, house style, marketing copy guide). The /le skill is no longer shown; copy it from the Me menu until it becomes an org-level skill.
- DEVELOPERS.md: the hand-off for wiring Meta, Google Ads, LinkedIn, Instagram, YouTube, PostHog and the create-side tools through the Worker.


## Oct 29 — the rebuild
- The brand board (brand/board.html) is the source of truth. The palette is yellow #FFD96F, blue #80ACED, slate, beige, tan, paper, ink; the tool's chrome stays monochrome but the assets carry the color. Vector lockup extracted from the board: assets/brand/logo.svg, mark.svg (+ white).
- Make → Image → ten templates (headline on a field, photo with lockup, expert spotlight, one number, three illustrations, product moment, quote, before/after, list, announcement), each a canvas renderer in js/templates.js: preview = export. Fields: text, field color, assets, align. "Lines we've used" pulls real headlines from data/copy.json.
- Make → Video is a form: the story, three screenshots, length, music, close line, badges. The film is rendered from that; no timeline.
- Make → Deck: pick Sales / Session / All-hands / Customer story, paste what it should say, slides are parsed and rendered (js/deck.js), edit per slide, PDF or PNGs.
- Make → Case study: paste a post, fields fill (Opus if connected, a scripted reader otherwise), carousel PDF / PNGs / web page / post.
- Copy library: data/copy.json, 117 real lines mined from Slack, Notion and Drive (posts, headlines, hooks, taglines, CTAs, subjects, ads, bios) with sources, plus a voice summary and rules. The voice findings that brand.json gets wrong are in the agent report and in copy.voice.
- GIFs: 15 looping sales concepts (assets/gifs, sources in assets/gifs/src).
- No pills anywhere. No subcopy on cards. One Download button per editor. Drafts autosave to Projects.
- Still weak: org logos are favicon-size sources (blurry when large; 27 mono versions are silhouettes); the PDF export loads jsPDF from a CDN at click time; Connect is honest about needing a developer (DEVELOPERS.md).


## Nov 23 — polish pass
Full-app QA against the Leonardo 3.0 rules and SALES-DECK.md (defect log with screenshots in the session scratchpad, qa3/defects.md). 33 defects found, 33 fixed in code or assets; 8 judgment calls left as they were, listed below.

Fixed
- Image templates: white is the default field everywhere; yellow is no longer a field option (an old saved "yellow" renders white). "Line two" / "Line" subcopy fields removed from Headline, Photo with lockup and Announcement. Mark and lockup are 1.85% of the unit (the deck's LOCK 24 at 1920), down from 9.5% / 2.9%. Numbered list is capped at three points.
- Template defaults now come from data/copy.json or the deck JSON: Expert spotlight shows a manifest expert with "Leland expert" and a real headline (no invented credential or quote); Three illustrations uses "Learn from people who've done it" and three approved CTAs; Product moment uses "Real answers from people who've done it."; Numbered list uses the AIBP overview bullets; Photo with lockup uses the exact approved tagline.
- Deck engine: the section slide no longer draws a number above the title; covers, stats and the price slide default to white (SALES-DECK: no black backgrounds); close-slide lockup 36px like the cover; photo-slide lockup 36px; agenda capped at three rows. Generated illustrations are listed in assets/illus/index.json so a named-but-not-yet-generated file draws its placeholder without a 404 (PROMPTS.md says to add the file name).
- SheerID deck: the two missing illustration references no longer 404; the price slide is white.
- Case study (story.js) rewritten to the rules: white field, no eyebrows, headline alone, one blue phrase in #80ACED, the vector lockup at the deck proportion, Season + Macan, three builds at most, close slide is the CTA line alone, company name on the lockup line. Web page export matches (no eyebrow, brand blue, joinleland.com/ai).
- GIFs rebuilt (14 of 25): own-your-future and get-there on white; five-levels, cohort and your-use-case lose their eyebrow; the Level 5 card and Agents slab are blue with white type, the Live tile white; one-conversation bubbles are tan; your-feed's tag chip is beige; the verified badges and every #2f5fd6 are now #80ACED. No #3963D7 or #2f5fd6 remains in js/ or assets/gifs/src.
- Template example images and the five deck covers re-rendered from the fixed renderers.
- Tool chrome: library tabs are text only; library and project cards show the title alone; Connect rows show the name and one control ("Imported", "Connect", "Needs a developer"); panel headings are sentence case, no small caps anywhere; the screenshot count beside "Three screenshots" is gone; the preview panel shows the title and the source only; every radius is 4–6px (cards, menu, drawer, preview, stage, close/arrow buttons, palette swatches); the Me menu's Opus status is the button label itself.
- Video editor: the header button reads Download once the film has rendered.
- Film posters: the 11 films had blank first-frame posters; regenerated from content frames.
- PDF export: jsPDF 2.5.1 is vendored at js/vendor/ (CDN kept as a fallback), so deck and carousel PDFs work offline and inside locked-down networks.

Left as is (needs a call)
- SheerID deck slides with five rows (Layers, Levels, Timeline, next-step dates) and six people groups exceed "three items"; they describe the real program and schedule. Split into two slides or accept five for structural content.
- Before/after column labels, the film's store badges, Motion preset descriptions and autosaved untouched drafts in Projects are noted in the defect log but not changed.


## Nov 23, later — cleaned up
Direction from the review: LE is a repository of our work and the images people draw from, plus one solid skill. Less is more; every element needs a reason. The chrome now follows the chat interface guidelines (brand/chat-guidelines.html): its tokens, type scale, 96px section rhythm and one line colour.

Chrome
- Top-left is the mark from the guidelines (it paints down and sweeps into the curves once, again on hover) and "LE" in Helvetica Neue. The face and the "Leland" word are gone. Nav is text only, in Helvetica Neue: Make, Library, Projects, Skill, Motion, Brand.
- Search is rounded, types through real examples from the manifest, and suggests as you type (grouped by shelf; arrows, Enter, Esc). No Macan question mark anywhere: the app loads Macan-*-Q.woff2 and maps U+003F to Helvetica Neue.
- Nothing shifts between shelves: fixed-height rows, a reserved scrollbar gutter, no counts. Measured in Playwright across all 17 shelves; every position identical.
- No counts beside sub-shelves, no captions under cards. A name shows only under logos, experts and music. The Me menu, Connect and the Opus connection are gone; Developer instructions is a link on Skill.

Library
- Photos at their true shape, three to a row. 47 photos retitled by scene or action, never by race or ethnicity (tools/manifest-nov23.py). 65 photos now: the 47, six from the guidelines (Clouds, Trees, Clay, Wheat, Water, Flowers) and twelve from the brand board. More need a source.
- Logos on white, one size, name beneath. Graphics 8 to 16 (four Leland lockups, four product frames from assets/decks/frames). Nothing drawn.
- Videos: all 11 finished films on disk are on the shelf (5 launch films, 6 launch-kit cuts).
- Copy is Taglines, Voice, Posts. Click a line to copy it. The other kinds stay in data/copy.json, off the shelves.
- Fonts shelf: Season Mix, Macan Book / Medium / SemiBold, and three Macan cuts with a plain question mark (tools/macan-q.py copies the "?" from Arimo, weight-matched, into each Macan weight).
- Leo, the animated face, is a pack under GIFs (assets/leo: leo.html, leo.js, leo.svg, leo-pack.zip).

Make
- Six image types: Headline on a field, Photo with lockup, Expert spotlight, Chart, Three illustrations, Product moment. Chart is new (bars or line from typed values; default 120 min to 30 min from the ASU+GSV story in copy.json). One number, Quote, Before and after, Numbered list and Announcement are in js/unused/templates-extra.js.
- Video reads "Coming soon". The maker is in js/unused/video.js. The case study builder is out (js/unused/story.js). Deck stays.

Skill, Motion, Brand, Projects
- Skill is a page: the /le skill, built from the manifest, copy.json and BRAND-BRIEF.md (Leonardo 3.0 rules verbatim), with Copy and Download .md. skills/le/SKILL.md is the same text.
- Motion is a list of rules: the guidelines' Motion, Logo, Orb and Voice with their live demos, then the six film rules. No presets, no default, no reset, no export.
- Brand: the board, Leonardo 3.0 rules, Colour, Lockup, Type, Photography (uncropped), Illustration, each 96px apart, then the chat interface guidelines whole (Logo through Ten rules).
- Projects can be deleted from the row, with an inline confirm.

Still open
- Photo ids and file names keep the old stock-library words (the paths were kept on purpose; decks reference the ids). Rename files and ids together when there is time.
- brand/chat-guidelines.html names tree green #79A360 for the chat input; BRAND-BRIEF.md says no green in marketing assets. Both are shown as written.
- Macan-*-Q.woff2 uses Arimo's question mark (OFL). If Helvetica Neue's exact glyph is wanted in the font file, it needs a licensed source.
