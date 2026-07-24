#!/usr/bin/env node

/**
 * Optimize images for the site
 * Usage: node scripts/optimize-images.js
 */

import fs from 'fs';
import path from 'path';

const SITE_DIR = path.join(process.cwd(), 'site', 'public');
const OUTPUT_DIR = path.join(SITE_DIR, 'optimized');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createPlaceholderImage(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#667eea"/>
  <text x="600" y="315" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">${name}</text>
</svg>`;
}

const contentDir = path.join(process.cwd(), 'content-db');
let created = 0;

for (const tier of ['bronze', 'silver']) {
  const dir = path.join(contentDir, tier);
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const slug = file.replace('.md', '');
    const svg = createPlaceholderImage(slug.replace(/-/g, ' ').substring(0, 30));
    const outputPath = path.join(OUTPUT_DIR, `${slug}.svg`);
    
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, svg);
      console.log(`✓ Created: ${slug}.svg`);
      created++;
    }
  }
}

console.log(`\nCreated ${created} placeholder images`);
