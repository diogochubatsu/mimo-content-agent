#!/usr/bin/env node

/**
 * Check data freshness for bronze sources
 * Usage: node scripts/check-freshness.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');
const MAX_AGE_DAYS = 12;

function checkFreshness(filepath) {
  const stat = fs.statSync(filepath);
  const ageDays = Math.floor((Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24));
  
  return {
    file: path.relative(process.cwd(), filepath),
    lastModified: stat.mtime.toISOString().split('T')[0],
    ageDays,
    fresh: ageDays <= MAX_AGE_DAYS
  };
}

function scanDirectory(dir) {
  const results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results.push(...scanDirectory(itemPath));
    } else if (item.endsWith('.json')) {
      results.push(checkFreshness(itemPath));
    }
  }
  
  return results;
}

function main() {
  console.log('=== Data Freshness Check ===\n');
  
  const results = scanDirectory(BRONZE_DIR);
  
  console.log(`${'File'.padEnd(50)} ${'Last Modified'.padEnd(15)} ${'Age (days)'.padEnd(12)} Status`);
  console.log('-'.repeat(90));
  
  let fresh = 0;
  let stale = 0;
  
  for (const result of results) {
    const statusIcon = result.fresh ? '✓' : '⚠️';
    console.log(
      `${result.file.padEnd(50)} ${result.lastModified.padEnd(15)} ${String(result.ageDays).padEnd(12)} ${statusIcon} ${result.fresh ? 'Fresh' : 'Stale'}`
    );
    
    if (result.fresh) fresh++;
    else stale++;
  }
  
  console.log(`\nSummary: ${fresh} fresh, ${stale} stale (> ${MAX_AGE_DAYS} days old)`);
}

main();
