# Source Evaluation Report

**Date:** 2026-07-25
**Session:** Source Evaluation Cron (08:33 UTC)

## Summary

- **Total:** 148 records across 19 files
- **Quality A:** 8 sources (42%) — Complete metadata
- **Quality B:** 4 sources (21%) — Partial metadata
- **Quality C:** 7 sources (36%) — Empty or no metadata

## Quality Distribution

| Quality | Sources | Records | Percentage |
|---------|---------|---------|------------|
| A | 8 | 78 | 42% |
| B | 4 | 58 | 21% |
| C | 7 | 12 | 36% |

## A-Quality Sources (Complete)

| Source | Records | Status |
|--------|---------|--------|
| amazon/trending-products-2026.json | 30 | Complete |
| youtube-intl/videos.json | 15 | Complete |
| news/trade-news-2026.json | 8 | Complete |
| youtube-pt/videos.json | 5 | Complete |
| youtube-es/videos.json | 5 | Complete |
| youtube-ja/videos.json | 5 | Complete |
| youtube-ko/videos.json | 5 | Complete |
| youtube-de/videos.json | 5 | Complete |

## B-Quality Sources (Partial)

| Source | Records | Missing Fields |
|--------|---------|----------------|
| tiktok/trending-videos.json | 20 | url, title, category |
| tiktok/trending-videos-2.json | 20 | url, title, category |
| 1688-guides.json | 10 | url, title, category |
| reddit/extra-reddit-posts.json | 8 | date, url, title, category |

## C-Quality Sources (Empty/Broken)

| Source | Records | Issue |
|--------|---------|-------|
| weibo/trends.json | 12 | Missing source, category |
| collection-report.json | 0 | Empty file |
| tiktok-trending.json | 0 | Empty file |
| youtube-dropshipping.json | 0 | Empty file |
| pinterest/trends-2026.json | 0 | Empty file |
| trends/google-trends.json | 0 | Empty file |
| reddit/trending_posts_2026-07-24.json | 0 | Empty file |

## Action Items

1. **Fix weibo/trends.json** — Add source, category fields (12 records)
2. **Enrich 1688-guides.json** — Add url, title, category (10 records)
3. **Enrich tiktok files** — Add url, title, category (40 records)
4. **Fix reddit/extra-reddit-posts.json** — Add date, url, title, category (8 records)
5. **Remove or fix empty files** — 6 empty files to handle

## Target

- Current: 42% A-quality
- Target: 80% A-quality by end of session
