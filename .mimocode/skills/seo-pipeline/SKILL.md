# Skill: SEO Pipeline

Run complete SEO optimization on all articles.

## When to Use

- After generating new articles
- Before deploying site
- Periodic SEO audit

## Quick Commands

```bash
# Run full SEO pipeline
node scripts/optimize-all-seo.js

# Or run individual steps
node scripts/add-seo-meta.js
node scripts/add-schema.js
node scripts/add-og-tags.js
node scripts/add-faq-schema.js
node scripts/add-contextual-links.js
node scripts/validate-sources.js
```

## Pipeline Steps

1. **Meta Tags** — Add title, description, keywords
2. **Schema.org** — Add Article markup
3. **Open Graph** — Add OG tags for social
4. **FAQ Schema** — Add FAQPage markup
5. **Internal Links** — Add contextual links
6. **Validation** — Check source metadata

## Rules

1. Run after any article generation
2. Check SEO audit score after
3. Commit changes
