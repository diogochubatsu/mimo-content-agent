# Skill: Script Factory

Create new scripts following standard patterns.

## When to Use

- Creating new utility scripts
- Adding automation to the pipeline
- Building tools for content processing

## Standard Script Template

```javascript
#!/usr/bin/env node

/**
 * [Script Name]
 * Usage: node scripts/[name].js [args]
 */

import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  // ...
};

// Main function
function main() {
  console.log('=== [Script Name] ===\n');
  // Implementation
}

main();
```

## Naming Convention

- `add-[feature].js` — Add something to articles
- `validate-[thing].js` — Validate data
- `check-[metric].js` — Check a metric
- `generate-[output].js` — Generate output
- `[action]-[target].js` — Action on target

## Rules

1. Always include usage comment
2. Use ES modules (import/export)
3. Log progress to console
4. Handle errors gracefully
5. Commit after creation
