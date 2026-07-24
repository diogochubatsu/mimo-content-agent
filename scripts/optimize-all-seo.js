#!/usr/bin/env node

/**
 * Run all SEO optimizations on all articles
 * Usage: node scripts/optimize-all-seo.js
 */

import { execSync } from 'child_process';

console.log('=== SEO Optimization Pipeline ===\n');

// 1. Add meta tags
console.log('1. Adding meta tags...');
try {
  execSync('node scripts/add-seo-meta.js', { encoding: 'utf8', stdio: 'inherit' });
  console.log('✓ Meta tags added\n');
} catch (error) {
  console.error('✗ Meta tags failed:', error.message);
}

// 2. Add internal links
console.log('2. Adding internal links...');
try {
  execSync('node scripts/add-internal-links.js', { encoding: 'utf8', stdio: 'inherit' });
  console.log('✓ Internal links added\n');
} catch (error) {
  console.error('✗ Internal links failed:', error.message);
}

// 3. Add schema.org
console.log('3. Adding schema.org markup...');
try {
  execSync('node scripts/add-schema.js', { encoding: 'utf8', stdio: 'inherit' });
  console.log('✓ Schema.org added\n');
} catch (error) {
  console.error('✗ Schema.org failed:', error.message);
}

// 4. Validate sources
console.log('4. Validating sources...');
try {
  execSync('node scripts/validate-sources.js', { encoding: 'utf8', stdio: 'inherit' });
  console.log('✓ Sources validated\n');
} catch (error) {
  console.error('✗ Validation failed:', error.message);
}

console.log('=== SEO Optimization Complete ===');
