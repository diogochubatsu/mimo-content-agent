#!/usr/bin/env node

/**
 * Comprehensive site audit
 * Usage: node scripts/comprehensive-audit.js
 */

import fs from 'fs';
import path from 'path';

const SITE_DIR = path.join(process.cwd(), 'site');
const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function checkPerformance() {
  const issues = [];
  
  // Check for large files
  const publicDir = path.join(SITE_DIR, 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
      const stat = fs.statSync(path.join(publicDir, file));
      if (stat.size > 100000) { // > 100KB
        issues.push(`Large file: ${file} (${Math.round(stat.size/1024)}KB)`);
      }
    }
  }
  
  return issues;
}

function checkSEO() {
  const issues = [];
  
  // Check for meta tags
  const layoutFile = path.join(SITE_DIR, 'components', 'Layout.js');
  if (fs.existsSync(layoutFile)) {
    const layout = fs.readFileSync(layoutFile, 'utf8');
    if (!layout.includes('max-image-preview:large')) {
      issues.push('Missing max-image-preview:large tag');
    }
    if (!layout.includes('plausible')) {
      issues.push('Analytics not configured');
    }
  }
  
  // Check for sitemap
  const sitemapFile = path.join(SITE_DIR, 'pages', 'sitemap.xml.js');
  if (!fs.existsSync(sitemapFile)) {
    issues.push('No dynamic sitemap');
  }
  
  // Check for robots.txt
  const robotsFile = path.join(SITE_DIR, 'public', 'robots.txt');
  if (!fs.existsSync(robotsFile)) {
    issues.push('No robots.txt');
  }
  
  return issues;
}

function checkAccessibility() {
  const issues = [];
  
  // Check for ARIA attributes
  const componentsDir = path.join(SITE_DIR, 'components');
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      if (content.includes('<img') && !content.includes('alt=')) {
        issues.push(`Missing alt attribute in ${file}`);
      }
    }
  }
  
  return issues;
}

function checkContent() {
  const issues = [];
  
  // Check bronze articles
  const bronzeDir = path.join(CONTENT_DIR, 'bronze');
  if (fs.existsSync(bronzeDir)) {
    const files = fs.readdirSync(bronzeDir).filter(f => f.endsWith('.md'));
    if (files.length < 10) {
      issues.push(`Only ${files.length} bronze articles (min 10)`);
    }
  }
  
  // Check silver articles
  const silverDir = path.join(CONTENT_DIR, 'silver');
  if (fs.existsSync(silverDir)) {
    const files = fs.readdirSync(silverDir).filter(f => f.endsWith('.md'));
    if (files.length < 20) {
      issues.push(`Only ${files.length} silver articles (min 20)`);
    }
  }
  
  return issues;
}

function main() {
  console.log('=== Comprehensive Site Audit ===\n');
  
  const performance = checkPerformance();
  const seo = checkSEO();
  const accessibility = checkAccessibility();
  const content = checkContent();
  
  console.log('Performance Issues:');
  performance.forEach(i => console.log(`  - ${i}`));
  if (performance.length === 0) console.log('  None found');
  
  console.log('\nSEO Issues:');
  seo.forEach(i => console.log(`  - ${i}`));
  if (seo.length === 0) console.log('  None found');
  
  console.log('\nAccessibility Issues:');
  accessibility.forEach(i => console.log(`  - ${i}`));
  if (accessibility.length === 0) console.log('  None found');
  
  console.log('\nContent Issues:');
  content.forEach(i => console.log(`  - ${i}`));
  if (content.length === 0) console.log('  None found');
  
  const totalIssues = performance.length + seo.length + accessibility.length + content.length;
  console.log(`\nTotal Issues: ${totalIssues}`);
  console.log(`Score: ${Math.max(0, 100 - (totalIssues * 10))}/100`);
}

main();
