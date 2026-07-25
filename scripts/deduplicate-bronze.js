#!/usr/bin/env node

/**
 * Deduplication engine for bronze content
 * Usage: node scripts/deduplicate-bronze.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');

function loadAllContent() {
  const content = [];
  
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
          content.push({
            file: path.relative(process.cwd(), itemPath),
            data
          });
        } catch (e) {}
      }
    }
  }
  
  scanDir(BRONZE_DIR);
  return content;
}

function normalizeText(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1, str2) {
  const words1 = normalizeText(str1).split(' ');
  const words2 = normalizeText(str2).split(' ');
  
  const intersection = words1.filter(w => words2.includes(w));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

function findDuplicates(content) {
  const duplicates = [];
  
  for (let i = 0; i < content.length; i++) {
    for (let j = i + 1; j < content.length; j++) {
      const item1 = content[i];
      const item2 = content[j];
      
      // Check URL similarity
      if (item1.data.url && item2.data.url) {
        if (item1.data.url === item2.data.url) {
          duplicates.push({
            type: 'exact_url',
            file1: item1.file,
            file2: item2.file,
            url: item1.data.url
          });
          continue;
        }
      }
      
      // Check title similarity
      if (item1.data.title && item2.data.title) {
        const similarity = calculateSimilarity(item1.data.title, item2.data.title);
        if (similarity > 0.7) {
          duplicates.push({
            type: 'similar_title',
            file1: item1.file,
            file2: item2.file,
            similarity: Math.round(similarity * 100)
          });
        }
      }
    }
  }
  
  return duplicates;
}

function main() {
  console.log('=== Bronze Deduplication ===\n');
  
  const content = loadAllContent();
  console.log(`Loaded ${content.length} content items`);
  
  const duplicates = findDuplicates(content);
  
  if (duplicates.length === 0) {
    console.log('\n✓ No duplicates found');
  } else {
    console.log(`\nFound ${duplicates.length} potential duplicates:\n`);
    
    for (const dup of duplicates) {
      console.log(`- ${dup.type}: ${dup.file1} ↔ ${dup.file2}`);
      if (dup.similarity) {
        console.log(`  Similarity: ${dup.similarity}%`);
      }
      if (dup.url) {
        console.log(`  URL: ${dup.url}`);
      }
    }
  }
  
  console.log(`\nTotal items: ${content.length}`);
  console.log(`Duplicates: ${duplicates.length}`);
}

main();
