#!/usr/bin/env node

/**
 * Add Open Graph tags to all articles
 * Usage: node scripts/add-og-tags.js
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
  return (lines[0] || '').substring(0, 200);
}

function addOGTags(filePath, slug, tier) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has OG tags in frontmatter
  if (content.includes('og:')) {
    return false;
  }
  
  const title = extractTitle(content);
  const description = extractDescription(content);
  
  if (!title) return false;
  
  // Add OG tags to frontmatter
  const ogTags = `
og:
  title: "${title}"
  description: "${description}"
  type: "article"
  url: "${SITE_URL}/articles/${slug}"
  image: "${SITE_URL}/og/${slug}.png"
  site_name: "Import Guide 1688"`;
  
  // Insert after existing frontmatter
  if (content.startsWith('---')) {
    const updated = content.replace(/^---\n/, `---\n${ogTags}\n`);
    fs.writeFileSync(filePath, updated);
  } else {
    fs.writeFileSync(filePath, `---${ogTags}\n---\n${content}`);
  }
  
  return true;
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
    
    if (addOGTags(filePath, slug, tier)) {
      console.log(`✓ ${tier}/${slug} - OG tags added`);
      updated++;
    }
  }
}

console.log(`\nAdded OG tags to ${updated} articles`);
