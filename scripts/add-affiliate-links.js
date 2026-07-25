#!/usr/bin/env node

/**
 * Add affiliate links to Silver articles
 * Usage: node scripts/add-affiliate-links.js
 */

import fs from 'fs';
import path from 'path';

const SILVER_DIR = path.join(process.cwd(), 'content-db', 'silver');

const AFFILIATE_PATTERNS = [
  {
    pattern: /1688\.com/g,
    replacement: '[1688.com](https://www.1688.com)',
    type: '1688'
  },
  {
    pattern: /alibaba\.com/g,
    replacement: '[Alibaba.com](https://www.alibaba.com)',
    type: 'alibaba'
  },
  {
    pattern: /amazon\.com/g,
    replacement: '[Amazon.com](https://www.amazon.com)',
    type: 'amazon'
  },
  {
    pattern: /aliexpress\.com/g,
    replacement: '[AliExpress](https://www.aliexpress.com)',
    type: 'aliexpress'
  }
];

function addAffiliateLinks(content) {
  let updated = content;
  let linksAdded = 0;
  
  for (const pattern of AFFILIATE_PATTERNS) {
    if (pattern.pattern.test(content)) {
      // Only add if not already a link
      const regex = new RegExp(`(?<!\\[)${pattern.pattern.source}(?!\\])`, 'g');
      if (regex.test(content)) {
        updated = updated.replace(regex, pattern.replacement);
        linksAdded++;
      }
    }
  }
  
  return { content: updated, linksAdded };
}

function main() {
  console.log('=== Affiliate Link Adder ===\n');
  
  const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
  let updated = 0;
  
  for (const file of files) {
    const filepath = path.join(SILVER_DIR, file);
    const content = fs.readFileSync(filepath, 'utf8');
    
    const { content: newContent, linksAdded } = addAffiliateLinks(content);
    
    if (linksAdded > 0) {
      fs.writeFileSync(filepath, newContent);
      console.log(`✓ ${file} - Added ${linksAdded} affiliate links`);
      updated++;
    }
  }
  
  console.log(`\nUpdated ${updated} articles`);
}

main();
