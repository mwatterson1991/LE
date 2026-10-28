# LE — developer hand-off: wiring real connections

LE is a static site (GitHub Pages). The only backend is the Cloudflare Worker in `worker/`. This document says what to build so the Connect page shows, per asset LE made, where it was posted or run, what it cost, and what it returned — and lets a marketer set budget per creative. You should be able to execute it without asking anyone. Where an endpoint name is marked **verify in docs**, check the provider's reference before coding; do not guess.

## 1. Architecture

1. Browser (`index.html`, `js/le.js`) ↔ Worker (`worker/worker.js`) ↔ provider APIs. The browser never talks to a provider directly (the one exception, a personal Anthropic key in `localStorage le-key`, stays as-is for solo use).
2. The Worker URL is stored in the browser as `localStorage le-api` (`CFG.api` in `js/le.js`, line ~257). Every call is `fetch(CFG.api + '/route')`.
3. Provider tokens live only in the Worker: static tokens as Cloudflare secrets (`wrangler secret put`), OAuth tokens in KV under `tok:{provider}`. Nothing token-shaped is ever returned to the browser.
4. Projects (the assets LE made) are in `localStorage le-projects` (array, newest first, max 60; see `addProject`). They have no stable id today. Add one: `id: crypto.randomUUID()` in `addProject`. That id is `asset_id` everywhere below.
5. Routes the Worker serves today: `POST /opus` (Anthropic proxy), `GET|PUT /projects`, `GET|PUT /queue` (KV blobs). LE currently calls only `/opus`; `/projects` and `/queue` exist but `le.js` does not call them yet.
6. New routes to add: `/connect/status`, `/connect/:provider/auth`, `/connect/:provider/callback`, `/placements`, `/metrics`, `/budget`, `/publish`, `/slack/events`.
7. Storage: keep KV for tokens and the two existing blobs. Add D1 (SQLite) for placements, metric snapshots and budgets — you need joins and date ranges, KV can't do that.
8. Metrics are pulled on a Cron Trigger (nightly, plus a 15-minute job for the last 2 days) and written as snapshots. `GET /metrics` reads snapshots; it never calls a provider on the request path.
9. Auth for the Worker itself: today it is open with `access-control-allow-origin: *`. Before adding tokens, require `Authorization: Bearer ${LE_APP_TOKEN}` (a secret) on every route except the OAuth callback and `/slack/events`, and restrict CORS to the Pages origin. Store the app token in `localStorage le-app-token`; LE sends it on each call.
10. The browser is the UI for exactly one thing: the Connect page (`renderConnect`, `CONNS`, `connReq` in `js/le.js` ~line 361). Replace the hard-coded `st:()=>'Connected'` strings with the result of `GET /connect/status`, and the `—` spend/results cells with `GET /metrics`.

## 2. The contract

All JSON. All timestamps ISO 8601 UTC. Money in the ad account's currency, as a decimal string (`"12.34"`), never floats or cents. Errors: `{error: "message", code: "short_code"}` with a 4xx/5xx status.

### `GET /connect/status`

```json
{
  "figma":    {"connected": true,  "account": "Leland (team)",          "since": "2026-11-02T18:00:00Z"},
  "drive":    {"connected": true,  "account": "le-reader@...iam.gserviceaccount.com", "since": "..."},
  "notion":   {"connected": true,  "account": "LE integration",         "since": "..."},
  "opus":     {"connected": true,  "account": "org key",                "since": "..."},
  "slack":    {"connected": true,  "account": "#marketing-requests",    "since": "..."},
  "linkedin": {"connected": false, "account": null, "since": null, "reason": "no token"},
  "instagram":{"connected": false, "account": null, "since": null},
  "meta":     {"connected": true,  "account": "act_123456789 · Leland", "since": "..."},
  "gads":     {"connected": false, "account": null, "since": null, "reason": "developer token pending"},
  "youtube":  {"connected": false, "account": null, "since": null},
  "posthog":  {"connected": true,  "account": "project 12345",          "since": "..."}
}
```

Keys match `CONNS[].id` in `le.js`. `connected` means: a token exists **and** a cheap read call succeeded in the last 24 h (cache the check in KV `status:{provider}`, TTL 24 h). `reason` is optional, human-readable, short.

### `GET /connect/:provider/auth` and `GET /connect/:provider/callback`

- `auth`: generates `state` (random, stored in KV `oauth:{state}` → `{provider, return}`, TTL 10 min), 302-redirects to the provider's authorize URL with the scopes in section 3. Query `?return=<LE url>` says where to send the user afterwards.
- `callback`: provider redirects here with `code` and `state`. Exchange code for tokens server-side, store `tok:{provider}` = `{access_token, refresh_token, expires_at, account_id, account_name, scopes, obtained_at}` in KV, delete the state key, 302 to `return?connected=<provider>`.
- For providers with static credentials (Figma, Drive, Notion, Slack, PostHog, Anthropic) `auth` returns `{"static": true}` and status comes from the secret's presence plus a test call.
- Refresh: a helper `token(env, provider)` returns a valid access token, refreshing when `expires_at - now < 5 min`. Google and LinkedIn need this; Meta system-user tokens do not expire.

### `POST /placements`

Request:
```json
{"asset_id": "uuid-from-le-projects", "provider": "meta", "kind": "ad",
 "external_id": "120210000000000", "url": "https://...", "created_at": "2026-11-03T09:00:00Z",
 "meta": {"campaign_id": "...", "adset_id": "...", "utm_content": "le-uuid"}}
```
`kind` is `post` (organic) or `ad`. `external_id` is the provider's id for the thing that carries metrics (ad id, post URN, IG media id, YouTube video id). Response: `{"placement_id": "plc_...", ...echo}`. Idempotent on `(provider, external_id)`.

### `GET /placements?asset_id=`

`{"placements": [{placement_id, asset_id, provider, kind, external_id, url, created_at, meta, daily_budget}]}`. Without `asset_id`, returns all, newest first, max 500.

### `GET /metrics?asset_id=&from=&to=`

`from`/`to` are dates (`YYYY-MM-DD`), default last 28 days. Response, one row per placement, summed over the range:

```json
{"from": "2026-10-06", "to": "2026-11-03", "currency": "USD",
 "placements": [
   {"placement_id": "plc_1", "provider": "meta", "kind": "ad", "url": "...",
    "impressions": 48210, "clicks": 612, "spend": "341.20", "conversions": 19,
    "ctr": 0.0127, "cpc": "0.56", "cpa": "17.96",
    "daily_budget": "25.00", "last_synced": "2026-11-03T06:02:11Z"},
   {"placement_id": "plc_2", "provider": "linkedin", "kind": "post",
    "impressions": 9100, "clicks": 140, "spend": "0", "conversions": 3,
    "ctr": 0.0154, "cpc": null, "cpa": null, "daily_budget": null, "last_synced": "..."}
 ],
 "totals": {"impressions": 57310, "clicks": 752, "spend": "341.20", "conversions": 22}}
```

`ctr = clicks / impressions`, `cpc = spend / clicks`, `cpa = spend / conversions`; `null` when the divisor is 0 or spend is 0. `conversions` is the provider's primary conversion (Meta: lead or `offsite_conversion` as configured; Google: `metrics.conversions`; organic posts: PostHog `lead_created` events whose `utm_content` matches `meta.utm_content`). Also accept `?placement_id=` and `?daily=1` (returns per-day rows instead of a sum).

### `POST /budget`

```json
{"placement_id": "plc_1", "daily_budget": "40.00"}
```
Writes to the provider (section 3) and records the change in `budgets`. Response: `{"placement_id", "daily_budget", "applied_at", "provider_object": "adset_1234"}`. Returns `409` with `reason` when the provider's budget object is shared across several creatives (Google campaign budgets, Meta campaign-budget-optimisation) — see gotchas. LE should show the reason as-is.

### `POST /publish` (Phase 3)

```json
{"asset_id": "...", "provider": "linkedin", "kind": "post", "text": "...", "media_url": "https://<pages>/assets/..."}
```
Returns a placement (same shape as `POST /placements`). The Worker fetches `media_url`, uploads it, creates the post, and inserts the placement itself.

### D1 schema

```sql
CREATE TABLE placements (
  placement_id TEXT PRIMARY KEY,
  asset_id     TEXT NOT NULL,
  provider     TEXT NOT NULL,             -- meta|gads|linkedin|instagram|youtube
  kind         TEXT NOT NULL,             -- post|ad
  external_id  TEXT NOT NULL,
  url          TEXT,
  created_at   TEXT NOT NULL,
  meta         TEXT,                      -- JSON: campaign_id, adset_id, utm_content, ...
  UNIQUE (provider, external_id)
);
CREATE INDEX placements_asset ON placements(asset_id);

CREATE TABLE metric_snapshots (
  placement_id TEXT NOT NULL REFERENCES placements(placement_id),
  day          TEXT NOT NULL,             -- YYYY-MM-DD in the ad account's time zone
  impressions  INTEGER NOT NULL DEFAULT 0,
  clicks       INTEGER NOT NULL DEFAULT 0,
  spend_minor  INTEGER NOT NULL DEFAULT 0,-- cents; convert to decimal string on output
  currency     TEXT NOT NULL DEFAULT 'USD',
  conversions  INTEGER NOT NULL DEFAULT 0,
  raw          TEXT,                      -- provider row as JSON, for debugging
  synced_at    TEXT NOT NULL,
  PRIMARY KEY (placement_id, day)
);

CREATE TABLE budgets (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  placement_id   TEXT NOT NULL REFERENCES placements(placement_id),
  daily_minor    INTEGER NOT NULL,
  currency       TEXT NOT NULL,
  provider_object TEXT NOT NULL,          -- adset id / campaign budget resource name
  set_by         TEXT,
  applied_at     TEXT NOT NULL,
  ok             INTEGER NOT NULL,        -- 1 applied, 0 provider rejected
  error          TEXT
);
```

Upsert snapshots with `INSERT ... ON CONFLICT(placement_id, day) DO UPDATE` so re-syncing the last 2 days corrects attribution lag. `wrangler.toml` additions:

```toml
[[d1_databases]]
binding = "DB"
database_name = "le"
database_id = "REPLACE_WITH_D1_ID"
[triggers]
crons = ["5 6 * * *", "*/15 * * * *"]   # nightly full 28-day resync; 15-min last-2-days
```

Add a `scheduled(event, env, ctx)` export next to `fetch`. Secrets (`wrangler secret put`): `LE_APP_TOKEN`, `ANTHROPIC_KEY`, `FIGMA_TOKEN`, `GOOGLE_SA_JSON`, `NOTION_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `POSTHOG_PERSONAL_KEY`, `META_APP_ID`, `META_APP_SECRET`, `META_SYSTEM_USER_TOKEN`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GADS_DEVELOPER_TOKEN`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`. Non-secret ids go in `[vars]`: `META_AD_ACCOUNT_ID`, `GADS_CUSTOMER_ID`, `GADS_LOGIN_CUSTOMER_ID`, `LINKEDIN_ORG_ID`, `POSTHOG_PROJECT_ID`, `POSTHOG_HOST`, `DRIVE_BRAND_FOLDER_ID`, `NOTION_CASE_STUDY_DB`.

## 3. Distribute-and-measure providers

### Meta Ads (Facebook + Instagram ads)

| | |
|---|---|
| API | Marketing API (Graph API, `https://graph.facebook.com/v21.0/`; use the newest version at build time) |
| Auth | System User token from Business Manager (long-lived, no expiry). No OAuth flow needed for Phase 1. OAuth only if you later want per-user login. |
| Scopes / permissions | `ads_read` (metrics), `ads_management` (budget writes), `business_management`, `pages_read_engagement`, `read_insights` |
| Metrics per creative | `GET /act_{AD_ACCOUNT_ID}/insights?level=ad&fields=ad_id,ad_name,impressions,clicks,spend,actions,ctr,cpc&time_range={"since":"...","until":"..."}&time_increment=1`. Conversions: pick from `actions[]` by `action_type` (`lead`, `offsite_conversion.fb_pixel_lead`, or a custom conversion) — decide once, put it in `[vars] META_CONVERSION_ACTION`. |
| Match ad → asset | `GET /{ad_id}?fields=creative{id,image_hash,thumbnail_url,object_story_spec,name}`. Name the creative `le:{asset_id}` when LE uploads it; for ads made outside LE, match on `image_hash` of the file LE exported (store the hash on upload). |
| Upload creative | `POST /act_{id}/adimages` (bytes or `url`), `POST /act_{id}/advideos`. Creating the ad itself (`adcreatives`, `ads`) is Phase 3+ and optional. |
| Budget write | Budget lives on the ad set, not the ad: `POST /{adset_id}` with `daily_budget=<minor units>`. If the campaign uses Advantage campaign budget, the ad set has none → return 409 with `reason: "campaign budget optimisation"`. |
| Rate limits | Insights calls are scored per ad account; the response header `x-business-use-case-usage` tells you load. Stay under ~one insights call per ad account per minute in the cron job; ask for all ads in one call with `level=ad`, paginate with `after`. |
| Owner must provide | Ad account id (`act_…`), a Meta app (Business type) in the Leland Business Manager, a System User with Admin on the ad account and the app, token generated with the permissions above |
| Gotchas | `ads_management` and `ads_read` at Advanced Access need App Review and Business Verification; in Development mode they work only for users with a role on the app, which is fine for an internal tool with a System User. Attribution windows mean yesterday's numbers change for up to 7 days; resync. Spend is in the ad account currency. |

### Google Ads

| | |
|---|---|
| API | Google Ads API (REST, `https://googleads.googleapis.com/v18/` — use the current version; **verify in docs**). GAQL queries via `customers/{CUSTOMER_ID}/googleAds:searchStream`. |
| Auth | OAuth 2.0 (web flow through `/connect/gads/auth`), scope `https://www.googleapis.com/auth/adwords`, `access_type=offline` to get a refresh token. Headers on every call: `developer-token`, `login-customer-id` (the manager account if the ad account is under an MCC). |
| Metrics per creative | `SELECT ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.ad.final_urls, campaign.id, campaign.campaign_budget, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, segments.date FROM ad_group_ad WHERE segments.date BETWEEN '…' AND '…'`. `cost_micros / 1e6` is spend. For Performance Max, creatives are `asset_group_asset`; metrics there are per asset group, not per image (**verify in docs**). |
| Match ad → asset | Put `utm_content=le-{asset_id}` in `final_url_suffix` or name the ad `le:{asset_id}`. Image assets: `asset.image_asset.full_size.url` — compare file hash. |
| Upload creative | `AssetService.MutateAssets` with image bytes (Phase 3, optional). |
| Budget write | Budget is per campaign (`campaign_budget.amount_micros`) via `customers/{id}/campaignBudgets:mutate`. One campaign usually holds many ads → return 409 unless the campaign contains exactly one LE placement, or the marketer confirmed. |
| Rate limits | Basic access: 15,000 operations/day; searchStream is cheap. Nightly + 15-min jobs are far under. |
| Owner must provide | Developer token (from the MCC's API Center), the customer id (`123-456-7890`, strip dashes), the MCC id, a Google Cloud project with the Ads API enabled and an OAuth client (web), and an account with Standard access to the ad account to run the OAuth consent. |
| Gotchas | Developer token starts as **Test access** (test accounts only). Apply for **Basic access** (form in API Center; typically 1–2 weeks). Google OAuth consent screen in "Testing" limits refresh tokens to 7 days — publish the consent screen (internal users of the Workspace org is enough). Conversions are fractional floats. |

### LinkedIn

| | |
|---|---|
| API | Marketing API (`https://api.linkedin.com/rest/`, headers `Linkedin-Version: YYYYMM`, `X-Restli-Protocol-Version: 2.0.0`). Organic page posting and stats: Community Management API product. Ads: Advertising API product. |
| Auth | OAuth 2.0 three-legged through `/connect/linkedin/auth`. Access tokens last 60 days; refresh tokens (365 days) are granted only to apps with programmatic refresh enabled (**verify in docs**). Plan for re-auth every 60 days: `status.reason = "token expired, reconnect"`. |
| Scopes | Organic: `r_organization_social`, `w_organization_social`, `r_organization_admin`. Ads: `r_ads`, `r_ads_reporting`, `rw_ads`. |
| Organic metrics per post | `GET /rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:{ORG_ID}&ugcPosts=List(urn:li:ugcPost:…)` (or `shares=List(...)` for older posts; param name **verify in docs**). Gives `impressionCount`, `clickCount`, `likeCount`, `commentCount`, `shareCount`. No spend. |
| Ad metrics per creative | `GET /rest/adAnalytics?q=analytics&pivot=CREATIVE&dateRange=(start:(year:,month:,day:),end:(...))&timeGranularity=DAILY&accounts=List(urn:li:sponsoredAccount:{id})&fields=impressions,clicks,costInLocalCurrency,externalWebsiteConversions,pivotValues` |
| Publish a post | `POST /rest/posts` with `author: "urn:li:organization:{ORG_ID}"`, `commentary`, `visibility: "PUBLIC"`, `distribution.feedDistribution: "MAIN_FEED"`, `content.media.id` (image URN). Image: `POST /rest/images?action=initializeUpload` → PUT bytes to `uploadUrl` → use returned `image` URN. Carousels (document posts): `POST /rest/documents?action=initializeUpload` with the PDF the Story maker exports. Response header `x-restli-id` is the post URN → `external_id`. |
| Budget write | Ads budget is per campaign: `POST /rest/adCampaigns/{id}` partial update with `dailyBudget: {amount, currencyCode}` (**verify in docs**). Same 409 rule as Google. |
| Rate limits | Per-app and per-member daily limits shown in the developer portal; stats calls are low-volume. Posting: no hard limit worth knowing for a company page. |
| Owner must provide | A LinkedIn developer app owned by the Leland company page, approval for Community Management API (and Advertising API if ads), the organization id, and a person who is **Super admin** of the page to run the OAuth consent. Ads also need the sponsored account id and that person as account manager. |
| Gotchas | Community Management API access requires an application form and review (weeks). Personal-profile posting (John's account) is not available through this API; don't promise it. Versioned API: pin `Linkedin-Version` and bump quarterly. |

### Instagram (organic)

| | |
|---|---|
| API | Instagram Graph API via the same Meta app (`graph.facebook.com`). Needs an Instagram **Professional** (Business or Creator) account linked to a Facebook Page. The newer "Instagram API with Instagram Login" avoids the Page requirement but has a separate token and scope set (**verify in docs**); pick one and don't mix. |
| Scopes | `instagram_basic`, `instagram_content_publish`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` |
| Find the IG user | `GET /{PAGE_ID}?fields=instagram_business_account` → `IG_USER_ID` |
| Publish | Two steps: `POST /{IG_USER_ID}/media` with `image_url` (must be a public URL — the GitHub Pages asset URL works) and `caption`; then `POST /{IG_USER_ID}/media_publish` with `creation_id`. Reels: `media_type=REELS`, `video_url`, poll `GET /{container_id}?fields=status_code` until `FINISHED`. Carousels: children containers then `media_type=CAROUSEL`. Returned `id` → `external_id`. |
| Metrics per post | `GET /{IG_MEDIA_ID}/insights?metric=reach,likes,comments,saved,shares,views` (metric names changed in 2024–25; `impressions` is gone for new media — **verify in docs**). Map `views` → impressions, link clicks aren't exposed; use PostHog UTM clicks instead. |
| Rate limits | Content publishing: 25 posts per 24 h per IG user. Insights: standard Graph API per-app/user limits. |
| Owner must provide | Confirmation the IG account is Professional and linked to the Leland Facebook Page; the Page id; the System User needs the Page assigned in Business Manager. |
| Gotchas | Image specs: JPEG only for `image_url`, aspect 4:5 to 1.91:1 — LE's exports are PNG; convert in the Worker (or export JPEG from LE for this path). Stories can't be published via API from a business account for most apps. |

### YouTube

| | |
|---|---|
| API | YouTube Data API v3 (`https://www.googleapis.com/youtube/v3/`) for upload and lifetime stats; YouTube Analytics API v2 for per-day views. Same Google Cloud project and OAuth client as Google Ads. |
| Scopes | `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.readonly`, `https://www.googleapis.com/auth/yt-analytics.readonly` |
| Publish | Resumable upload: `POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`, then PUT the bytes. Costs **1,600 quota units**. Returned `id` → `external_id`, url `https://youtu.be/{id}`. |
| Metrics per video | Lifetime: `GET /videos?part=statistics&id=…` (1 unit): `viewCount`, `likeCount`, `commentCount`. Per day: Analytics `GET https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=&endDate=&metrics=views,estimatedMinutesWatched,averageViewPercentage&dimensions=day&filters=video=={id}`. Map views → impressions; clicks = PostHog UTM clicks from the description link. No spend. |
| Rate limits | Default quota **10,000 units/day** → about 6 uploads/day if you do nothing else. Stats reads are cheap. Quota increase is a form, slow. |
| Owner must provide | Channel access: the person running OAuth must be an owner/manager of the Leland channel (Brand Account). |
| Gotchas | Until the Google OAuth app passes verification for the `youtube.upload` scope, uploaded videos may be locked to **private** (**verify in docs** — this policy has changed). Submit for verification early; it needs a privacy policy URL and a demo video. |

### PostHog

| | |
|---|---|
| API | Query API: `POST {POSTHOG_HOST}/api/projects/{PROJECT_ID}/query` with body `{"query":{"kind":"HogQLQuery","query":"SELECT …"}}`. Host is `https://us.posthog.com` or `https://eu.posthog.com` (check the project). |
| Auth | **Personal API key** (`phx_…`) with scope `query:read`, header `Authorization: Bearer`. The project API key (`phc_…`) is for event ingestion only and cannot read. |
| What to query | Clicks and conversions per placement by UTM: `SELECT properties.utm_content AS c, countIf(event='$pageview') AS clicks, countIf(event='lead_created') AS leads FROM events WHERE timestamp >= '…' AND properties.utm_content LIKE 'le-%' GROUP BY c`. Also `person.properties.$initial_utm_content` for conversions that happen on a later session. Event names `lead_created` / `booking_made` must be confirmed in the project (ROADMAP question 6). |
| Rate limits | Query endpoints: 120 requests/min per key (**verify in docs**); one query per cron run is plenty. |
| Owner must provide | Project id, region, a personal API key scoped to that project with `query:read` only, and the names of the lead/booking events. |
| Gotchas | HogQL has a row/time limit per query; keep date ranges to 28 days. UTMs only work if every LE placement carries `utm_content=le-{asset_id}` — `POST /placements` should refuse `kind: post` without `meta.utm_content`. |

## 4. Create providers

| Provider | Auth | Calls | Owner must provide | Notes |
|---|---|---|---|---|
| Figma | Personal access token (`X-Figma-Token` header) or a scoped token with `file_content:read` (**verify in docs**). Secret `FIGMA_TOKEN`. | `GET /v1/files/{key}?depth=2` to list frames; `GET /v1/images/{key}?ids=1:2,1:3&format=svg` (or `png&scale=2`) returns temporary URLs (expire ~30 days) → fetch, store in `assets/`, add to `data/manifest.json`. | File key of the brand file, the illustration page/frame ids, a token from an account on the team. | Today's 299 illustrations were pulled this way by hand. Worker route `POST /figma/sync` (Phase 2, optional) re-exports changed frames. Rate limits are per-plan and undocumented in detail; back off on 429. |
| Google Drive | Service account JSON in secret `GOOGLE_SA_JSON`; sign a JWT in the Worker (WebCrypto RS256), exchange for an access token, scope `https://www.googleapis.com/auth/drive.readonly`. | `GET /drive/v3/files?q='{FOLDER_ID}' in parents and trashed=false&fields=files(id,name,mimeType,md5Checksum,modifiedTime)&supportsAllDrives=true&includeItemsFromAllDrives=true`; `GET /drive/v3/files/{id}?alt=media`. | Share the brand library folder (and `coach_images`) with the service account email as Viewer. If it is a Shared Drive, add the service account as a member. Folder id from the URL. | Used for status (list succeeds) and for a `POST /drive/sync` job that pulls new library photos. Read-only. |
| Notion | Internal integration token, secret `NOTION_TOKEN`, header `Notion-Version: 2022-06-28` (or newer). | `POST /v1/pages` with `parent.database_id = NOTION_CASE_STUDY_DB` and `properties.Name.title`, children blocks for the Story maker output; `POST /v1/search` for status. | Create the integration at notion.so/my-integrations (workspace: Leland, capabilities: read + insert content), share the case-study database with it, give you the database id. | ~3 req/s average. Route `POST /notion/draft` (Phase 2). |
| Slack | Bot token `xoxb-…` secret `SLACK_BOT_TOKEN`, signing secret `SLACK_SIGNING_SECRET`. Scopes: `chat:write`, `files:write`, `channels:history`, `app_mentions:read`, `commands`. | Incoming: Events API → Worker `POST /slack/events` (answer `url_verification` challenge; verify `X-Slack-Signature` HMAC with the signing secret, reject if timestamp older than 5 min). Store requests in KV `queue` (already read by `/queue`). Outgoing: `chat.postMessage` to confirm. | Create the Slack app (from manifest), install to the Leland workspace, invite the bot to the requests channel, give you the channel id. | A `/le` slash command that posts into the same route is cheap and useful. |
| Anthropic (Opus) | `ANTHROPIC_KEY` secret; route `POST /opus` already proxies `v1/messages`. | Keep as-is. Add: require `LE_APP_TOKEN`, allow-list `model` values, cap `max_tokens`, log token usage to KV by day. | An org API key from console.anthropic.com. | `status.opus.connected` = key present and `GET https://api.anthropic.com/v1/models` returns 200. |

## 5. Phased plan

### Phase 1 — one week: status + Meta Ads read-only

Build: `LE_APP_TOKEN` gate, D1 tables, `GET /connect/status`, Meta insights cron (nightly 28 days + 15-min last 2 days), `POST/GET /placements`, `GET /metrics`, PostHog query for organic clicks. In `le.js`: add `id` to projects, replace `CONNS[].st` with status data, fill the Where / Spend / Results cells from `/metrics`, make `connReq` call `/connect/:provider/auth` when the provider is OAuth-based.

Accept when:
- Connect page shows green for every provider that has a working credential and grey with a `reason` for the rest; no provider credential appears in any network response.
- For an ad in the Leland ad account whose creative is named `le:{asset_id}` (or matched by image hash), the asset's row shows yesterday's impressions, clicks, spend and leads within 15 minutes of the cron, and they match Ads Manager for the same range within 2 %.
- `GET /metrics?asset_id=X&from=&to=` sums match the daily rows; `cpa` is `null` when conversions are 0.
- Re-running the cron does not duplicate rows.
- Worker rejects calls without the app token with 401; the Pages origin is the only allowed CORS origin.

### Phase 2 — Google Ads + LinkedIn organic metrics

Build: Google OAuth flow with refresh, GAQL sync, LinkedIn OAuth (60-day expiry surfaced in status), share-statistics sync, Instagram insights sync if the Meta app already has the scopes, YouTube stats via the same Google token. Optional: Figma/Drive sync routes, Notion draft route.

Accept when:
- A Google ad and a LinkedIn page post, each tagged with `utm_content=le-{asset_id}`, show on the same asset row with provider labels, and totals across providers are correct.
- Google refresh token survives more than 7 days (consent screen published).
- LinkedIn token expiry shows in status at least 7 days before it happens.
- All syncs finish in under the Worker CPU limit (split per provider into separate `ctx.waitUntil` jobs; paginate).

### Phase 3 — publish + budget writes

Build: `POST /publish` for LinkedIn posts/carousels, Instagram images/Reels, YouTube uploads; `POST /budget` for Meta ad sets and (with the 409 rule) Google/LinkedIn campaigns. In `le.js`: "Schedule" in Ready to post calls `/publish`; the placements table gets an editable Daily budget cell that calls `/budget`.

Accept when:
- Scheduling an item from LE creates a live LinkedIn company-page post with the image, and the placement row appears with its URL within one minute.
- Instagram publish works for a 4:5 image exported from LE (JPEG conversion handled) and for a Reel from the video editor.
- Changing the daily budget on a Meta placement is visible in Ads Manager within one minute, logged in `budgets`, and a second edit within 60 s is rejected with 429.
- Setting budget on a creative that shares a campaign budget returns 409 with a readable reason, and LE shows it.
- Every write route requires the app token and is logged (who, what, when) in D1.

## 6. What Michael must do first

- [ ] Give the developer the GitHub repo and a Cloudflare account (or an invite to Leland's) with Workers, KV and D1.
- [ ] Meta: ad account id, Business Manager admin access for the developer, confirm the IG account is Professional and linked to the Leland Facebook Page, create or point to a Business-type Meta app; start Business Verification.
- [ ] Google: manager account (MCC) id and customer id; apply for Google Ads API **Basic access** now (longest lead time); a Google Cloud project in the Leland Workspace with the developer as editor; who is owner/manager of the YouTube channel.
- [ ] LinkedIn: organization id, make the developer a page admin, create the developer app under the company page, apply for **Community Management API** (and Advertising API if ads run on LinkedIn).
- [ ] PostHog: project id, region, a personal API key with `query:read`, and the exact event names for lead and booking.
- [ ] Figma: file key of the brand file and a token from a team member; Drive: share the brand library folder with the service-account email the developer sends you; Notion: create the LE integration and share the case-study database with it; Slack: approve the LE app install and name the requests channel.
- [ ] Anthropic: an org API key for the Worker.
- [ ] Decide the Meta conversion action to count as a "result" (lead vs booking) and the default date range for the Connect page (28 days suggested).
- [ ] Confirm every paid ad and launch post from now on carries `utm_content=le-{asset_id}`; without that, organic results cannot be matched.
