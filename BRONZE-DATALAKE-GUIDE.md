# Bronze Datalake Guide

**For:** All agents (GCP, PC-1, PC-2)
**Purpose:** How to collect, structure, and monitor Bronze data
**Last updated:** 2026-07-25

## What is the Bronze Datalake?

The Bronze datalake is the foundation of our content engine. Every Silver article and published piece of content starts as structured Bronze data. Without strong Bronze, Silver is weak.

## Your Role

| Agent | Primary Bronze Work |
|-------|-------------------|
| **GCP** | Registry management, quality review, monitoring, prioritization |
| **PC-1** | YouTube transcription, auto-enrichment, monitoring scripts, deduplication |
| **PC-2** | Blog extraction, content collection, metadata enrichment, image download |

## How to Collect

### YouTube Transcription (PC-1)
1. Pick a channel from `content-db/raw/registry/sources-registry.json`
2. Get top 5 videos from last 30 days
3. Run `node scripts/transcribe-youtube.js <url>`
4. Save to `content-db/raw/youtube/{language}/`
5. Ensure each item has: title, channel, url, transcript, duration, language, date, links

### Blog Extraction (PC-2)
1. Pick a blog from the registry
2. Get top 10 articles from last 30 days
3. For each article: extract title, author, URL, full text, word count, images, links
4. Save to `content-db/blogs/{source-name}/`
5. Ensure metadata completeness >80%

## Schema Required

Every Bronze item MUST have these fields:

```json
{
  "source_id": "from registry",
  "title": "original title",
  "url": "original URL",
  "language": "ISO code (pt, en, es, de, pl, zh, ko, ja)",
  "category": "one of: import-from-china, make-money-online, dropshipping, product-tips, alibaba-1688",
  "published_date": "YYYY-MM-DD",
  "collected_date": "YYYY-MM-DD",
  "word_count": 1234,
  "content": "full text or transcript"
}
```

Recommended (boosts quality grade):
- `images`, `links.external`, `links.internal`
- `description`, `key_takeaways`, `topic_tags`

## Quality Grading

| Grade | Criteria |
|-------|----------|
| **A** | All required fields + recommended fields, completeness >80%, <12 months old |
| **B** | All required fields, completeness 60-80% |
| **C** | Missing required fields OR >12 months old OR incomplete content |

## Monitoring

After collection, check:
1. **Freshness:** Is the content <12 months old?
2. **Completeness:** Are all required fields filled?
3. **Deduplication:** Is this content already collected?
4. **Source coverage:** What % of the source's content have we extracted?

## Key Rules

1. **Never skip metadata** — title alone is useless
2. **Always include source_id** — links back to registry
3. **Collect full content** — not just titles/summaries
4. **Track links** — internal (our site) and external (sources)
5. **Grade everything** — A/B/C on collection
6. **Report gaps** — if a source has 100 articles and we have 5, that's a gap

## Registry Updates

When you discover a new source:
1. Add it to `content-db/raw/registry/sources-registry.json`
2. Set authority_score, collection_priority, topics
3. Create a task for collection
4. Update collection_summary totals
