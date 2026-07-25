#!/usr/bin/env node

/**
 * Compare same product across platforms
 * Usage: node scripts/cross-platform-compare.js <product>
 */

import fs from 'fs';
import path from 'path';

const PLATFORMS = ['1688', 'alibaba', 'amazon', 'aliexpress'];

function searchBronze(product) {
  const results = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
          const text = JSON.stringify(data).toLowerCase();
          if (text.includes(product.toLowerCase())) {
            results.push({
              file: path.relative(process.cwd(), itemPath),
              data
            });
          }
        } catch (e) {}
      }
    }
  }
  
  scanDir(path.join(process.cwd(), 'content-db', 'raw'));
  return results;
}

function main() {
  const product = process.argv[2] || 'LED';
  
  console.log(`=== Cross-Platform Comparison: ${product} ===\n`);
  
  const results = searchBronze(product);
  
  if (results.length === 0) {
    console.log(`No results found for "${product}"`);
    return;
  }
  
  console.log(`Found ${results.length} matching sources:\n`);
  
  for (const r of results) {
    console.log(`- ${r.file}`);
    if (r.data.title) console.log(`  Title: ${r.data.title}`);
    if (r.data.platform) console.log(`  Platform: ${r.data.platform}`);
  }
  
  // Compare across platforms
  console.log('\nPlatform Comparison:');
  for (const platform of PLATFORMS) {
    const platformResults = results.filter(r => 
      r.data.platform === platform || r.file.includes(platform)
    );
    console.log(`${platform}: ${platformResults.length} sources`);
  }
}

main();
