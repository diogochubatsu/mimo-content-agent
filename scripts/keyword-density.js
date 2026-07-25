#!/usr/bin/env node

/**
 * Keyword density analyzer
 * Usage: node scripts/keyword-density.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function calculateDensity(text, keyword) {
  const words = text.toLowerCase().split(/\s+/);
  const keywordLower = keyword.toLowerCase();
  const count = words.filter(w => w.includes(keywordLower)).length;
  return ((count / words.length) * 100).toFixed(2);
}

function analyzeArticle(filepath, primaryKeyword) {
  const content = fs.readFileSync(filepath, 'utf8');
  
  // Remove markdown formatting
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*.*?\*\*/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '');
  
  const density = calculateDensity(text, primaryKeyword);
  const wordCount = text.split(/\s+/).length;
  
  return {
    file: path.relative(process.cwd(), filepath),
    wordCount,
    keyword: primaryKeyword,
    density: parseFloat(density),
    status: density >= 1 && density <= 2 ? 'OK' : density < 1 ? 'Low' : 'High'
  };
}

function main() {
  console.log('=== Keyword Density Analyzer ===\n');
  
  const primaryKeyword = '1688'; // Default keyword
  console.log(`Analyzing keyword: "${primaryKeyword}"\n`);
  
  const articles = [];
  
  for (const tier of ['bronze', 'silver']) {
    const dir = path.join(CONTENT_DIR, tier);
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      articles.push(analyzeArticle(path.join(dir, file), primaryKeyword));
    }
  }
  
  console.log(`${'File'.padEnd(45)} ${'Words'.padEnd(8)} ${'Density'.padEnd(10)} Status`);
  console.log('-'.repeat(75));
  
  for (const article of articles.slice(0, 15)) {
    const statusIcon = article.status === 'OK' ? '✓' : article.status === 'Low' ? '↓' : '↑';
    console.log(
      `${article.file.padEnd(45)} ${String(article.wordCount).padEnd(8)} ${(article.density + '%').padEnd(10)} ${statusIcon} ${article.status}`
    );
  }
  
  // Summary
  const ok = articles.filter(a => a.status === 'OK').length;
  const low = articles.filter(a => a.status === 'Low').length;
  const high = articles.filter(a => a.status === 'High').length;
  
  console.log(`\nSummary: ${ok} OK, ${low} Low, ${high} High`);
  console.log('Recommended density: 1-2%');
}

main();
