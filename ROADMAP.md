# LE — what's real, what's next, what to ask engineering

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
