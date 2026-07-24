#!/usr/bin/env node

/**
 * Add schema.org Article markup to all articles
 * Usage: node scripts/add-schema.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');
const SITE_URL = 'https://importguide1688.com';

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : null;
}

function extractDescription(content) {
  const lines = content.split('\n').filter(l => 
    l.trim() && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('```')
  );
  return lines[0] || '';
}

function generateSchema(title, description, slug, tier) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description.substring(0, 200),
    author: {
      '@type': 'Organization',
      name: 'Import Guide 1688'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Import Guide 1688',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`
      }
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${slug}`
    },
    articleSection: tier,
    keywords: ['import', 'china', '1688', 'alibaba', 'supplier']
  };
}

function addSchemaToArticle(filePath, slug, tier) {
  const content = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(content);
  const description = extractDescription(content);
  
  if (!title) return false;
  
  const schema = generateSchema(title, description, slug, tier);
  const schemaScript = `\n\n<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  
  // Add schema at end of file
  if (!content.includes('application/ld+json')) {
    fs.writeFileSync(filePath, content + schemaScript);
    return true;
  }
  
  return false;
}

// Main execution
let updated = 0;

for (const tier of ['bronze', 'silver']) {
  const dir = path.join(CONTENT_DIR, tier);
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const slug = file.replace('.md', '');
    const filePath = path.join(dir, file);
    
    if (addSchemaToArticle(filePath, slug, tier)) {
      console.log(`✓ ${tier}/${slug} - Schema added`);
      updated++;
    }
  }
}

console.log(`\nAdded schema.org to ${updated} articles`);
