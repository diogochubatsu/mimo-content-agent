#!/usr/bin/env node

/**
 * Pipeline metrics dashboard
 * Usage: node scripts/pipeline-metrics.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function countFiles(dir, extension) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => f.endsWith(extension)).length;
}

function getBronzeStats() {
  const rawDir = path.join(CONTENT_DIR, 'raw');
  let total = 0;
  let byLanguage = {};
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.json')) {
        total++;
        try {
          const data = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
          const lang = data.language || 'unknown';
          byLanguage[lang] = (byLanguage[lang] || 0) + 1;
        } catch (e) {}
      }
    }
  }
  
  scanDir(rawDir);
  return { total, byLanguage };
}

function getSilverStats() {
  const silverDir = path.join(CONTENT_DIR, 'silver');
  return {
    total: countFiles(silverDir, '.md')
  };
}

function getBronzeStats2() {
  const bronzeDir = path.join(CONTENT_DIR, 'bronze');
  return {
    total: countFiles(bronzeDir, '.md')
  };
}

function main() {
  console.log('=== Pipeline Metrics Dashboard ===\n');
  
  const bronze = getBronzeStats();
  const bronzeArticles = getBronzeStats2();
  const silver = getSilverStats();
  
  console.log('📊 Bronze Layer (Raw Data):');
  console.log(`   Total files: ${bronze.total}`);
  console.log('   By language:');
  for (const [lang, count] of Object.entries(bronze.byLanguage)) {
    console.log(`     ${lang}: ${count}`);
  }
  
  console.log('\n📄 Bronze Articles:');
  console.log(`   Total: ${bronzeArticles.total}`);
  
  console.log('\n📄 Silver Articles:');
  console.log(`   Total: ${silver.total}`);
  
  console.log('\n📈 Pipeline Efficiency:');
  console.log(`   Bronze → Silver conversion: ${silver.total > 0 ? Math.round(silver.total / bronze.total * 100) : 0}%`);
  
  // Save metrics
  const metrics = {
    timestamp: new Date().toISOString(),
    bronze_raw: bronze,
    bronze_articles: bronzeArticles,
    silver: silver
  };
  
  const metricsPath = path.join(CONTENT_DIR, 'pipeline-metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  console.log(`\nMetrics saved to: ${metricsPath}`);
}

main();
