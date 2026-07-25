#!/usr/bin/env node

/**
 * Download images from source articles
 * Usage: node scripts/download-images.js
 */

import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.join(process.cwd(), 'content-db', 'raw', 'images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function createPlaceholderImage(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#f0f0f0"/>
  <text x="400" y="300" font-family="Arial" font-size="24" fill="#666" text-anchor="middle" dominant-baseline="middle">${name}</text>
</svg>`;
}

function main() {
  console.log('=== Image Downloader ===\n');
  
  // Create placeholder images for sources
  const sources = [
    '1688-supplier',
    'alibaba-product',
    'amazon-listing',
    'tiktok-trending',
    'youtube-thumbnail'
  ];
  
  let created = 0;
  
  for (const source of sources) {
    const svg = createPlaceholderImage(source.replace(/-/g, ' '));
    const outputPath = path.join(IMAGES_DIR, `${source}.svg`);
    
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, svg);
      console.log(`✓ Created: ${source}.svg`);
      created++;
    }
  }
  
  console.log(`\nCreated ${created} placeholder images`);
  console.log(`Images directory: ${IMAGES_DIR}`);
}

main();
