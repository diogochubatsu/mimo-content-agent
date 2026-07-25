#!/usr/bin/env node

/**
 * Validate bronze JSON schema
 * Usage: node scripts/validate-bronze-schema.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');

const REQUIRED_FIELDS = ['date', 'source_url', 'language', 'platform'];

function validateJSON(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  let data;
  
  try {
    data = JSON.parse(content);
  } catch (error) {
    return { valid: false, errors: [`Invalid JSON: ${error.message}`] };
  }
  
  const errors = [];
  const warnings = [];
  
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check date format
  if (data.date && isNaN(Date.parse(data.date))) {
    warnings.push(`Invalid date format: ${data.date}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function scanDirectory(dir) {
  const results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results.push(...scanDirectory(itemPath));
    } else if (item.endsWith('.json')) {
      const relativePath = path.relative(process.cwd(), itemPath);
      const validation = validateJSON(itemPath);
      results.push({
        file: relativePath,
        ...validation
      });
    }
  }
  
  return results;
}

// Main execution
console.log('=== Bronze Schema Validation ===\n');

const results = scanDirectory(BRONZE_DIR);

let valid = 0;
let invalid = 0;

for (const result of results) {
  if (result.valid) {
    console.log(`✓ ${result.file}`);
    valid++;
  } else {
    console.log(`✗ ${result.file}`);
    for (const error of result.errors) {
      console.log(`  ERROR: ${error}`);
    }
    for (const warning of result.warnings) {
      console.log(`  WARNING: ${warning}`);
    }
    invalid++;
  }
}

console.log(`\nResults: ${valid} valid, ${invalid} invalid`);
console.log(`Compliance: ${Math.round(valid / (valid + invalid) * 100)}%`);
