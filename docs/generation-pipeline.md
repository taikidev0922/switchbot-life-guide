# Article Generation Pipeline

## Roles

- Rakko Keyword API: keyword discovery only.
- Supabase: keyword inventory, usage counts, and Rakko refresh history.
- Claude API: article body generation.
- OpenAI API: article image generation.
- X API: optional social reaction discovery in production mode.
- SwitchBot official blog: source facts for product information before article generation.
- Vercel Blob: published article JSON and generated image assets.
- Vercel Cron: scheduled orchestration.

## Cost Controls

The pipeline has two explicit modes:

- `ARTICLE_PIPELINE_MODE=test`: pre-launch mode. Rakko is always disabled. Claude and OpenAI only run when the `TEST_*` flags below are enabled, and default to cheaper test settings.
- `ARTICLE_PIPELINE_MODE=production`: launch mode. Production flags and production model defaults are used.

Current Cron cadence is every 3 minutes for pre-launch testing.

### Test Mode

- `TEST_CLAUDE_ARTICLE_LIVE=true`: allow Claude article generation in test mode.
- `TEST_ANTHROPIC_MODEL=claude-haiku-4-5-20251001`: low-cost Claude model for test mode.
- `TEST_CLAUDE_MAX_TOKENS=900`: shorter test-mode article output.
- `TEST_OPENAI_IMAGE_LIVE=true`: allow OpenAI image generation in test mode.
- `TEST_OPENAI_IMAGE_MODEL=gpt-image-1-mini`: lower-cost image model for test mode.
- `TEST_OPENAI_IMAGE_QUALITY=low`: low image quality setting for test mode.
- `TEST_OPENAI_IMAGE_SIZE=1024x1024`: smaller image size for test mode.

Rakko Keyword API is not called in test mode, even if `RAKKO_KEYWORD_LIVE=true` is present.
X API is also not called in test mode.

### Production Mode

- `RAKKO_KEYWORD_LIVE=true`: allow Rakko API refresh.
- `RAKKO_REFRESH_INTERVAL_DAYS=14`: minimum days between Rakko refresh runs.
- `RAKKO_KEYWORD_FETCH_LIMIT=5`: max keyword candidates fetched per Rakko call.
- `CLAUDE_ARTICLE_LIVE=true`: allow Claude article generation.
- `ANTHROPIC_MODEL=claude-sonnet-4-6`: production article model. Defaults to `claude-sonnet-4-6` when unset.
- `OPENAI_IMAGE_LIVE=true`: allow OpenAI image generation.
- `OPENAI_IMAGE_MODEL=gpt-image-2`: image generation model. Defaults to `gpt-image-2` when unset.
- `X_POST_SEARCH_LIVE=true`: allow X post search in production mode.
- `X_BEARER_TOKEN`: bearer token for X API recent search.
- `X_MAX_POST_READS_PER_ARTICLE=10`: max X posts read per article. The X recent-search endpoint uses 10 as the practical minimum request size.
- `X_MAX_EMBEDS_PER_ARTICLE=3`: max X posts embedded in an article.
- `X_POST_CACHE_DAYS=7`: reuse X search results for repeated keywords.

Recommended Claude split:

- Test mode: Haiku 4.5 for cost control and fast pipeline checks.
- Production mode: Sonnet 4.6 for article quality, nuance, and purchase-decision writing.
- Premium/manual articles: Opus 4.7 only for especially important cornerstone content.

With the default test environment, Cron can run every 3 minutes without consuming Rakko, Claude, OpenAI, or X API credits. Enable only the specific `TEST_*` paid-provider flags you want to exercise.

## Keyword Selection

Cron chooses a keyword in this order:

1. Use Supabase `keyword_candidates` if configured.
2. Pick the lowest `usage_count`, then oldest `last_used_at`, then newest `discovered_at`.
3. If `RAKKO_KEYWORD_LIVE=true` and the latest successful Rakko refresh is older than `RAKKO_REFRESH_INTERVAL_DAYS`, fetch a small batch from Rakko and upsert candidates.
4. If Supabase is missing or empty, fall back to local seed keywords.

After publishing, the selected keyword is recorded in:

- `keyword_candidates.usage_count`
- `keyword_candidates.last_used_at`
- `keyword_usage_events`

This prevents repeated use of the same keyword and gives a history for auditing.

## Article Quality Design

Each generated article now carries structured purchase-decision data:

- `officialSources`: SwitchBot official blog posts fetched before generation.
- `verdict`: conclusion shown near the top of the article.
- `buyingGuide.bestFor`: readers who are a good fit for the product.
- `buyingGuide.checkPoints`: buying checklist before the first CTA.
- `buyingGuide.cautions`: reasons to pause or verify before buying.
- `affiliateCta`: article-specific CTA headline, body, button text, and destination URL.
- `quality`: score and checklist for automated quality gates.

Production mode refuses to publish articles below `MIN_ARTICLE_QUALITY_SCORE`, defaulting to `70`. Test mode still publishes so the pipeline can be verified quickly.

## Official Source Fetching

Before Claude writes an article, the pipeline searches `https://blog.switchbot.jp/wp-json/wp/v2/posts` with the selected keyword and product name. It stores a small source context in Vercel Blob under `cms/official-sources/` and reuses it for `OFFICIAL_SOURCE_CACHE_HOURS`, defaulting to `24`.

Claude is instructed to use product specs, supported features, dates, and standards only when they appear in the official source context. If the source context is missing or thin, the article should avoid hard claims and direct readers to confirm details on the official store/support pages.

## X Post Embeds

X posts are treated as social reactions, not factual sources. Production mode can search recent X posts once per article, cache the result, and store selected post URLs in `article.xPosts`. Article pages use `https://publish.x.com/oembed` to render saved post URLs.

Cost control defaults:

- Test mode never calls X API.
- Production search is disabled until `X_POST_SEARCH_LIVE=true` and `X_BEARER_TOKEN` are set.
- Read volume is capped per article and cached by keyword/product/intent.

## Supabase Setup

Run:

```sql
-- supabase/migrations/001_keyword_management.sql
```

Required Vercel environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Use the service role key only on the server. Do not expose it to the browser.
