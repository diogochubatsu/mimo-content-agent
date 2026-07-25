#!/usr/bin/env node

/**
 * Auto-enrich bronze records
 * Adds missing fields based on content analysis
 * Usage: node scripts/auto-enrich-bronze.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');

function detectLanguage(content) {
  const text = JSON.stringify(content).toLowerCase();
  if (text.includes('的') || text.includes('是') || text.includes('不')) return 'zh';
  if (text.includes('の') || text.includes('は') || text.includes('が')) return 'ja';
  if (text.includes('은') || text.includes('는') || text.includes('이')) return 'ko';
  if (text.includes(' o ') || text.includes(' a ') || text.includes(' e ')) return 'pt';
  if (text.includes(' el ') || text.includes(' la ') || text.includes(' los ')) return 'es';
  if (text.includes(' der ') || text.includes(' die ') || text.includes(' und ')) return 'de';
  return 'en';
}

function detectPlatform(filepath) {
  if (filepath.includes('reddit')) return 'reddit';
  if (filepath.includes('tiktok')) return 'tiktok';
  if (filepath.includes('youtube')) return 'youtube';
  if (filepath.includes('amazon')) return 'amazon';
  if (filepath.includes('pinterest')) return 'pinterest';
  if (filepath.includes('1688')) return '1688';
  if (filepath.includes('weibo')) return 'weibo';
  return 'unknown';
}

function enrichFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  let data;
  
  try {
    data = JSON.parse(content);
  } catch (e) {
    return false;
  }
  
  let modified = false;
  
  // Add date if missing
  if (!data.date) {
    const stat = fs.statSync(filepath);
    data.date = stat.mtime.toISOString().split('T')[0];
    modified = true;
  }
  
  // Add language if missing
  if (!data.language) {
    data.language = detectLanguage(data);
    modified = true;
  }
  
  // Add platform if missing
  if (!data.platform) {
    data.platform = detectPlatform(filepath);
    modified = true;
  }
  
  // Add url if missing
  if (!data.url) {
    data.url = `https://${data.platform}.com`;
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return true;
  }
  
  return false;
}

function scanDirectory(dir) {
  let enriched = 0;
  
  if (!fs.existsSync(dir)) return enriched;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      enriched += scanDirectory(itemPath);
    } else if (item.endsWith('.json')) {
      if (enrichFile(itemPath)) {
        console.log(`✓ Enriched: ${path.relative(process.cwd(), itemPath)}`);
        enriched++;
      }
    }
  }
  
  return enriched;
}

function main() {
  console.log('=== Auto-Enrich Bronze ===\n');
  
  const enriched = scanDirectory(BRONZE_DIR);
  
  console.log(`\nEnriched ${enriched} files`);
}

main();
