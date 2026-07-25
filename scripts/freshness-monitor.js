#!/usr/bin/env node

/**
 * Monitor bronze source freshness
 * Usage: node scripts/freshness-monitor.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');
const ALERTS_DIR = path.join(process.cwd(), 'content-db', 'alerts');

const MAX_AGE_DAYS = 30;

// Ensure alerts directory exists
if (!fs.existsSync(ALERTS_DIR)) {
  fs.mkdirSync(ALERTS_DIR, { recursive: true });
}

function checkFreshness(filepath) {
  const stat = fs.statSync(filepath);
  const ageDays = Math.floor((Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24));
  
  return {
    file: path.relative(process.cwd(), filepath),
    lastModified: stat.mtime.toISOString().split('T')[0],
    ageDays,
    fresh: ageDays <= MAX_AGE_DAYS,
    alert: ageDays > MAX_AGE_DAYS
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

function generateAlert(staleItems) {
  return {
    timestamp: new Date().toISOString(),
    alert_type: 'freshness',
    message: `${staleItems.length} sources are older than ${MAX_AGE_DAYS} days`,
    stale_items: staleItems.map(i => ({
      file: i.file,
      lastModified: i.lastModified,
      ageDays: i.ageDays
    }))
  };
}

function main() {
  console.log('=== Freshness Monitor ===\n');
  
  const results = scanDirectory(BRONZE_DIR);
  
  let fresh = 0;
  let stale = 0;
  const staleItems = [];
  
  for (const result of results) {
    if (result.fresh) {
      fresh++;
    } else {
      stale++;
      staleItems.push(result);
    }
  }
  
  console.log(`Total sources: ${results.length}`);
  console.log(`Fresh: ${fresh}`);
  console.log(`Stale: ${stale}`);
  
  if (staleItems.length > 0) {
    console.log('\n⚠️ Stale sources (>30 days old):');
    for (const item of staleItems) {
      console.log(`  ${item.file} - Last modified: ${item.lastModified} (${item.ageDays} days ago)`);
    }
    
    // Generate alert
    const alert = generateAlert(staleItems);
    const alertPath = path.join(ALERTS_DIR, `freshness-alert-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(alertPath, JSON.stringify(alert, null, 2));
    console.log(`\nAlert saved to: ${alertPath}`);
  } else {
    console.log('\n✓ All sources are fresh');
  }
}

main();
