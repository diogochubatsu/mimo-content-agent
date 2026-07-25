#!/usr/bin/env node

/**
 * Score bronze sources A/B/C
 * Usage: node scripts/score-bronze.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');

function scoreSource(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  let data;
  
  try {
    data = JSON.parse(content);
  } catch (e) {
    return { file: path.relative(process.cwd(), filepath), score: 'F', reason: 'Invalid JSON' };
  }
  
  // Handle arrays - check first item
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { file: path.relative(process.cwd(), filepath), score: 'F', reason: 'Empty array' };
    }
    data = data[0]; // Check first item
  }
  
  let score = 100;
  const issues = [];
  
  // Check required fields
  if (!data.date) { score -= 20; issues.push('missing date'); }
  if (!data.language) { score -= 15; issues.push('missing language'); }
  if (!data.platform) { score -= 15; issues.push('missing platform'); }
  if (!data.url) { score -= 10; issues.push('missing url'); }
  
  // Check data quality
  if (typeof data === 'object' && Object.keys(data).length < 3) {
    score -= 20;
    issues.push('minimal data');
  }
  
  // Check file size
  const size = Buffer.byteLength(content);
  if (size < 100) { score -= 30; issues.push('very small file'); }
  
  // Assign grade
  let grade;
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else grade = 'F';
  
  return {
    file: path.relative(process.cwd(), filepath),
    score,
    grade,
    issues
  };
}

function main() {
  console.log('=== Bronze Source Scorer ===\n');
  
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
        results.push(scoreSource(itemPath));
      }
    }
  }
  
  scanDir(BRONZE_DIR);
  
  // Sort by score
  results.sort((a, b) => b.score - a.score);
  
  console.log(`${'File'.padEnd(50)} ${'Score'.padEnd(8)} Grade Issues`);
  console.log('-'.repeat(90));
  
  for (const r of results) {
    console.log(
      `${r.file.padEnd(50)} ${String(r.score).padEnd(8)} ${r.grade.padEnd(6)} ${r.issues.join(', ')}`
    );
  }
  
  // Summary
  const grades = { A: 0, B: 0, C: 0, F: 0 };
  results.forEach(r => grades[r.grade]++);
  
  console.log(`\nSummary: A=${grades.A}, B=${grades.B}, C=${grades.C}, F=${grades.F}`);
  console.log(`Total: ${results.length} sources`);
}

main();
