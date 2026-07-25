#!/usr/bin/env node

/**
 * SEO audit tool
 * Usage: node scripts/seo-audit.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function analyzeArticle(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const issues = [];
  
  // Check title length
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    const title = titleMatch[1];
    if (title.length > 60) {
      issues.push(`Title too long (${title.length} chars, max 60)`);
    }
  } else {
    issues.push('No H1 title found');
  }
  
  // Check meta description
  if (!content.includes('description:')) {
    issues.push('No meta description');
  }
  
  // Check H1 presence
  if (!content.match(/^#\s+/m)) {
    issues.push('No H1 heading');
  }
  
  // Check schema markup
  if (!content.includes('application/ld+json')) {
    issues.push('No schema.org markup');
  }
  
  // Check FAQ schema
  if (!content.includes('FAQPage')) {
    issues.push('No FAQ schema');
  }
  
  // Check internal links
  const internalLinks = (content.match(/\]\(\/articles\//g) || []).length;
  if (internalLinks < 2) {
    issues.push(`Low internal links (${internalLinks}, min 2)`);
  }
  
  return {
    file: path.relative(process.cwd(), filepath),
    issues,
    score: Math.max(0, 100 - (issues.length * 15))
  };
}

function main() {
  console.log('=== SEO Audit Tool ===\n');
  
  const articles = [];
  
  for (const tier of ['bronze', 'silver']) {
    const dir = path.join(CONTENT_DIR, tier);
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      articles.push(analyzeArticle(path.join(dir, file)));
    }
  }
  
  console.log(`${'File'.padEnd(50)} ${'Score'.padEnd(8)} Issues`);
  console.log('-'.repeat(80));
  
  for (const article of articles.slice(0, 15)) {
    const issuesStr = article.issues.length > 0 ? article.issues.join('; ') : 'None';
    console.log(
      `${article.file.padEnd(50)} ${String(article.score + '/100').padEnd(8)} ${issuesStr.substring(0, 50)}`
    );
  }
  
  // Summary
  const avgScore = articles.reduce((sum, a) => sum + a.score, 0) / articles.length;
  const lowScore = articles.filter(a => a.score < 70).length;
  
  console.log(`\nAverage SEO score: ${Math.round(avgScore)}/100`);
  console.log(`Articles with score < 70: ${lowScore}`);
}

main();
