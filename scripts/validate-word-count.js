#!/usr/bin/env node

/**
 * Validate word counts for articles
 * Usage: node scripts/validate-word-count.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');

const TIER_LIMITS = {
  bronze: { min: 800, max: 1200 },
  silver: { min: 1500, max: 2500 },
  gold: { min: 3000, max: Infinity }
};

function countWords(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  return content.split(/\s+/).filter(w => w.length > 0).length;
}

function analyzeArticle(filepath, tier) {
  const wordCount = countWords(filepath);
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.bronze;
  
  let status = 'OK';
  if (wordCount < limits.min) status = 'Too short';
  if (wordCount > limits.max) status = 'Too long';
  
  return {
    file: path.relative(process.cwd(), filepath),
    tier,
    wordCount,
    min: limits.min,
    max: limits.max === Infinity ? '∞' : limits.max,
    status
  };
}

function main() {
  console.log('=== Word Count Validator ===\n');
  
  const articles = [];
  
  for (const tier of ['bronze', 'silver', 'gold']) {
    const dir = path.join(CONTENT_DIR, tier);
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      articles.push(analyzeArticle(path.join(dir, file), tier));
    }
  }
  
  console.log(`${'File'.padEnd(50)} ${'Tier'.padEnd(8)} ${'Words'.padEnd(8)} ${'Range'.padEnd(12)} Status`);
  console.log('-'.repeat(90));
  
  for (const article of articles.slice(0, 15)) {
    const statusIcon = article.status === 'OK' ? '✓' : '✗';
    console.log(
      `${article.file.padEnd(50)} ${article.tier.padEnd(8)} ${String(article.wordCount).padEnd(8)} ${(`${article.min}-${article.max}`).padEnd(12)} ${statusIcon} ${article.status}`
    );
  }
  
  // Summary
  const ok = articles.filter(a => a.status === 'OK').length;
  const tooShort = articles.filter(a => a.status === 'Too short').length;
  const tooLong = articles.filter(a => a.status === 'Too long').length;
  
  console.log(`\nSummary: ${ok} OK, ${tooShort} Too short, ${tooLong} Too long`);
}

main();
