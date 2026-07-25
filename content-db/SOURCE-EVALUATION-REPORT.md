# Source Evaluation Report

**Date:** 2026-07-25
**Evaluated:** 19 files, 148 records

## Quality Distribution

| Quality | Sources | Records | Percentage |
|---------|---------|---------|------------|
| A | 8 | 78 | 42% |
| B | 4 | 58 | 21% |
| C | 7 | 12 | 36% |

## A-Quality Sources (Complete Metadata)

These sources have all required metadata fields:

1. **youtube-pt/videos.json** - 5 records
2. **youtube-es/videos.json** - 5 records
3. **youtube-intl/videos.json** - 15 records
4. **youtube-ja/videos.json** - 5 records
5. **youtube-ko/videos.json** - 5 records
6. **youtube-de/videos.json** - 5 records
7. **amazon/trending-products-2026.json** - 30 records
8. **news/trade-news-2026.json** - 8 records

## B-Quality Sources (Partial Metadata)

These sources have some metadata but are missing fields:

1. **1688-guides.json** - 10 records
   - Missing: url, title, category
2. **tiktok/trending-videos.json** - 20 records
   - Missing: url, title, category
3. **tiktok/trending-videos-2.json** - 20 records
   - Missing: url, title, category
4. **reddit/extra-reddit-posts.json** - 8 records
   - Missing: url, date, title, category

## C-Quality Sources (Empty or No Metadata)

These sources are empty or missing critical metadata:

1. **collection-report.json** - 0 records (empty file)
2. **tiktok-trending.json** - 0 records (empty file)
3. **youtube-dropshipping.json** - 0 records (empty file)
4. **pinterest/trends-2026.json** - 0 records (empty file)
5. **weibo/trends.json** - 12 records but missing source, category
6. **trends/google-trends.json** - 0 records (empty file)
7. **reddit/trending_posts_2026-07-24.json** - 0 records (empty file)

## Recommendations

### Immediate Actions
1. **Fix C-quality sources**: Add metadata to weibo/trends.json (source, category fields)
2. **Delete empty files**: Remove collection-report.json, tiktok-trending.json, youtube-dropshipping.json, pinterest/trends-2026.json, trends/google-trends.json, reddit/trending_posts_2026-07-24.json
3. **Enrich B-quality sources**: Add url, title, category to 1688-guides.json, tiktok files, reddit/extra-reddit-posts.json

### Next Steps
1. Run metadata enrichment scripts on B-quality sources
2. Collect new A-quality sources from identified gaps
3. Target: 80% A-quality by end of session
