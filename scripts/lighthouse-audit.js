#!/usr/bin/env node

/**
 * Simple Lighthouse audit script
 * Usage: node scripts/lighthouse-audit.js
 */

import fs from 'fs';
import path from 'path';

const SITE_DIR = path.join(process.cwd(), 'site');

function analyzeSite() {
  console.log('=== Lighthouse Audit (Static Analysis) ===\n');
  
  const issues = [];
  const recommendations = [];
  
  // Check for package.json
  const packageJson = path.join(SITE_DIR, 'package.json');
  if (fs.existsSync(packageJson)) {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    console.log(`✓ Package.json found: ${pkg.name || 'unnamed'}`);
    
    // Check dependencies
    if (pkg.dependencies) {
      const deps = Object.keys(pkg.dependencies);
      console.log(`  Dependencies: ${deps.length}`);
    }
  }
  
  // Check for pages
  const pagesDir = path.join(SITE_DIR, 'pages');
  if (fs.existsSync(pagesDir)) {
    const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));
    console.log(`✓ Pages: ${pages.length}`);
  }
  
  // Check for components
  const componentsDir = path.join(SITE_DIR, 'components');
  if (fs.existsSync(componentsDir)) {
    const components = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
    console.log(`✓ Components: ${components.length}`);
  }
  
  // Check for styles
  const stylesDir = path.join(SITE_DIR, 'styles');
  if (fs.existsSync(stylesDir)) {
    const styles = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));
    console.log(`✓ Stylesheets: ${styles.length}`);
  }
  
  // Check for SEO
  const seoFile = path.join(componentsDir, 'SEO.js');
  if (fs.existsSync(seoFile)) {
    console.log('✓ SEO component found');
  } else {
    issues.push('No SEO component found');
  }
  
  // Check for analytics
  const layoutFile = path.join(componentsDir, 'Layout.js');
  if (fs.existsSync(layoutFile)) {
    const layout = fs.readFileSync(layoutFile, 'utf8');
    if (layout.includes('plausible')) {
      console.log('✓ Plausible analytics configured');
    } else {
      issues.push('Plausible analytics not configured');
    }
  }
  
  // Check for sitemap
  const sitemapFile = path.join(pagesDir, 'sitemap.xml.js');
  if (fs.existsSync(sitemapFile)) {
    console.log('✓ Dynamic sitemap found');
  } else {
    issues.push('No dynamic sitemap');
  }
  
  // Check for robots.txt
  const robotsFile = path.join(SITE_DIR, 'public', 'robots.txt');
  if (fs.existsSync(robotsFile)) {
    console.log('✓ robots.txt found');
  } else {
    issues.push('No robots.txt');
  }
  
  // Recommendations
  recommendations.push('Add meta descriptions to all pages');
  recommendations.push('Implement lazy loading for images');
  recommendations.push('Add structured data (Article, FAQ)');
  recommendations.push('Optimize images to WebP format');
  recommendations.push('Add Open Graph tags for social sharing');
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Issues: ${issues.length}`);
  console.log(`Recommendations: ${recommendations.length}`);
  
  if (issues.length > 0) {
    console.log('\nIssues:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log('\nRecommendations:');
  recommendations.forEach(rec => console.log(`  - ${rec}`));
}

analyzeSite();
