#!/usr/bin/env node

/**
 * Generate HTML report of bronze quality
 * Usage: node scripts/generate-quality-report.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');
const REPORTS_DIR = path.join(process.cwd(), 'content-db', 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function scoreSource(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  let data;
  
  try {
    data = JSON.parse(content);
  } catch (e) {
    return { file: path.relative(process.cwd(), filepath), score: 'F', grade: 'F' };
  }
  
  let score = 100;
  
  if (!data.date) score -= 20;
  if (!data.language) score -= 15;
  if (!data.platform) score -= 15;
  if (!data.url) score -= 10;
  
  const size = Buffer.byteLength(content);
  if (size < 100) score -= 30;
  
  let grade;
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else grade = 'F';
  
  return { file: path.relative(process.cwd(), filepath), score, grade };
}

function generateHTML(results) {
  const grades = { A: 0, B: 0, C: 0, F: 0 };
  results.forEach(r => grades[r.grade]++);
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>Bronze Quality Report</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { color: #333; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .grade-card { padding: 20px; border-radius: 8px; text-align: center; }
    .grade-a { background: #d4edda; }
    .grade-b { background: #fff3cd; }
    .grade-c { background: #f8d7da; }
    .grade-f { background: #f5c6cb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Bronze Quality Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  
  <div class="summary">
    <div class="grade-card grade-a"><h2>A</h2><p>${grades.A}</p></div>
    <div class="grade-card grade-b"><h2>B</h2><p>${grades.B}</p></div>
    <div class="grade-card grade-c"><h2>C</h2><p>${grades.C}</p></div>
    <div class="grade-card grade-f"><h2>F</h2><p>${grades.F}</p></div>
  </div>
  
  <h2>Details</h2>
  <table>
    <tr><th>File</th><th>Score</th><th>Grade</th></tr>
    ${results.map(r => `<tr><td>${r.file}</td><td>${r.score}</td><td>${r.grade}</td></tr>`).join('')}
  </table>
</body>
</html>`;
}

function main() {
  console.log('=== Bronze Quality Report ===\n');
  
  const results = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.json')) {
        results.push(scoreSource(itemPath));
      }
    }
  }
  
  scanDir(BRONZE_DIR);
  
  const html = generateHTML(results);
  const reportPath = path.join(REPORTS_DIR, `quality-report-${new Date().toISOString().split('T')[0]}.html`);
  fs.writeFileSync(reportPath, html);
  
  console.log(`Report saved to: ${reportPath}`);
  console.log(`Total sources: ${results.length}`);
}

main();
