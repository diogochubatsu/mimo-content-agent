# Skill: Metadata Fixer

Fix missing metadata in JSON source files.

## When to Use

- JSON files missing required fields (date, url, language, platform)
- Validating bronze source metadata
- Preparing files for pipeline processing

## Quick Commands

```bash
# Fix all files in a directory
node scripts/validate-bronze-schema.js

# Fix specific file
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('file.json'));
data.date = '2026-07-25';
data.url = 'https://example.com';
data.language = 'en';
data.platform = 'source';
fs.writeFileSync('file.json', JSON.stringify(data, null, 2));
"
```

## Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| date | Publication date | 2026-07-25 |
| url | Source URL | https://example.com |
| language | ISO code | en, pt, es, de, ja, ko, zh |
| platform | Source platform | reddit, tiktok, youtube, blog |

## Rules

1. Use file modification date if no date exists
2. Default language to 'en' if unknown
3. Always commit after fixing
