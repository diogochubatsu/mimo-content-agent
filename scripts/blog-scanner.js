#!/usr/bin/env node

/**
 * Blog/YouTube scanner - Extracts metadata from sources
 * Usage: node scripts/blog-scanner.js
 */

import fs from 'fs';
import path from 'path';

const SOURCES_DIR = path.join(process.cwd(), 'content-db', 'raw');
const SCANS_DIR = path.join(process.cwd(), 'content-db', 'scans');

// Ensure scans directory exists
if (!fs.existsSync(SCANS_DIR)) {
  fs.mkdirSync(SCANS_DIR, { recursive: true });
}

const BLOG_SOURCES = [
  { name: 'Amazon Seller Blog', url: 'https://sell.amazon.com/blog', type: 'blog', language: 'en' },
  { name: 'Amazing.com', url: 'https://amazing.com/blog', type: 'blog', language: 'en' },
  { name: 'Jungle Scout', url: 'https://www.junglescout.com/blog/', type: 'blog', language: 'en' },
  { name: 'Helium 10', url: 'https://www.helium10.com/blog/', type: 'blog', language: 'en' },
  { name: 'Oberlo', url: 'https://www.oberlo.com/blog', type: 'blog', language: 'en' },
  { name: 'Ecommerce Brasil', url: 'https://www.ecommercebrasil.com.br/', type: 'blog', language: 'pt' },
  { name: 'Ecommerce Germany', url: 'https://www.ecommercegermany.com/', type: 'blog', language: 'de' }
];

const YOUTUBE_SOURCES = [
  { name: 'Jungle Scout', url: 'https://youtube.com/@junglescout', type: 'youtube', language: 'en' },
  { name: 'Wholesale Ted', url: 'https://youtube.com/@wholesaleted', type: 'youtube', language: 'en' },
  { name: 'Yomi Denzel', url: 'https://youtube.com/@YomiDenzel', type: 'youtube', language: 'es' },
  { name: 'Sandro Ferreira', url: 'https://youtube.com/@sandroferreira', type: 'youtube', language: 'pt' }
];

function scanSource(source) {
  return {
    name: source.name,
    url: source.url,
    type: source.type,
    language: source.language,
    scanned_at: new Date().toISOString(),
    status: 'pending',
    articles_found: 0
  };
}

function main() {
  console.log('=== Blog/YouTube Scanner ===\n');
  
  const allSources = [...BLOG_SOURCES, ...YOUTUBE_SOURCES];
  console.log(`Scanning ${allSources.length} sources...\n`);
  
  const results = allSources.map(scanSource);
  
  // Save scan results
  const scanPath = path.join(SCANS_DIR, `scan-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(scanPath, JSON.stringify(results, null, 2));
  
  console.log('Scan results:');
  for (const result of results) {
    console.log(`  ${result.type.padEnd(10)} ${result.language.padEnd(5)} ${result.name}`);
  }
  
  console.log(`\nSaved to: ${scanPath}`);
  console.log(`Total sources: ${results.length}`);
}

main();
