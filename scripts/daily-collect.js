#!/usr/bin/env node

/**
 * Daily collection script - Updates bronze with data from last 7 days
 * Usage: node scripts/daily-collect.js
 */

import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'content-db', 'raw');
const LOG_FILE = path.join(process.cwd(), 'logs', 'daily-collect.log');

// Ensure log directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, entry);
}

function getSourceFiles() {
  const sources = [];
  
  const dirs = ['reddit', 'tiktok', 'youtube-intl', 'youtube-pt', 'trends', 'news'];
  
  for (const dir of dirs) {
    const dirPath = path.join(RAW_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
      for (const file of files) {
        sources.push({
          dir,
          file,
          path: path.join(dirPath, file)
        });
      }
    }
  }
  
  // Also check root raw files
  const rootFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
  for (const file of rootFiles) {
    sources.push({
      dir: 'root',
      file,
      path: path.join(RAW_DIR, file)
    });
  }
  
  return sources;
}

function analyzeSource(source) {
  try {
    const content = fs.readFileSync(source.path, 'utf8');
    const data = JSON.parse(content);
    
    return {
      file: `${source.dir}/${source.file}`,
      hasData: Object.keys(data).length > 0,
      lastModified: fs.statSync(source.path).mtime,
      size: Buffer.byteLength(content)
    };
  } catch (error) {
    return {
      file: `${source.dir}/${source.file}`,
      hasData: false,
      error: error.message
    };
  }
}

function main() {
  log('=== Daily Collection Script ===');
  log('');
  
  const sources = getSourceFiles();
  log(`Found ${sources.length} source files`);
  
  let valid = 0;
  let invalid = 0;
  
  for (const source of sources) {
    const analysis = analyzeSource(source);
    
    if (analysis.hasData) {
      log(`✓ ${analysis.file} (${analysis.size} bytes)`);
      valid++;
    } else {
      log(`✗ ${analysis.file} - ${analysis.error || 'No data'}`);
      invalid++;
    }
  }
  
  log('');
  log(`Results: ${valid} valid, ${invalid} invalid`);
  log(`Last updated: ${new Date().toISOString()}`);
  
  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    total_sources: sources.length,
    valid: valid,
    invalid: invalid,
    sources: sources.map(s => ({
      file: `${s.dir}/${s.file}`,
      path: s.path
    }))
  };
  
  const reportPath = path.join(process.cwd(), 'content-db', 'raw', 'collection-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Report saved to: ${reportPath}`);
}

main();
