#!/usr/bin/env node

/**
 * Batch generate articles from a topics file
 * Usage: node scripts/batch-generate.js topics.json
 */

import fs from 'fs';
import path from 'path';
import { runPipeline } from '../src/pipeline.js';
import { isTopicProcessed } from '../src/cache.js';

const topicsFile = process.argv[2];

if (!topicsFile) {
  console.log('Usage: node scripts/batch-generate.js <topics.json>');
  console.log('\nTopics file format:');
  console.log('[');
  console.log('  { "topic": "LED Strips", "tier": "bronze" },');
  console.log('  { "topic": "Phone Cases", "tier": "silver" }');
  console.log(']');
  process.exit(1);
}

function loadTopics(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
}

async function main() {
  console.log('=== Batch Article Generator ===\n');
  
  const topics = loadTopics(topicsFile);
  console.log(`Loaded ${topics.length} topics from ${topicsFile}\n`);
  
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (let i = 0; i < topics.length; i++) {
    const { topic, tier = 'bronze' } = topics[i];
    
    console.log(`[${i + 1}/${topics.length}] Processing: ${topic} (${tier})`);
    
    // Check cache
    if (isTopicProcessed(topic, tier)) {
      console.log(`  ⏭️  Skipped (already processed)\n`);
      skipped++;
      continue;
    }
    
    try {
      const filepath = runPipeline({ topic, tier });
      if (filepath) {
        console.log(`  ✅ Generated: ${filepath}\n`);
        generated++;
      } else {
        console.log(`  ⏭️  Skipped (cached)\n`);
        skipped++;
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('=== Batch Complete ===');
  console.log(`Generated: ${generated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
