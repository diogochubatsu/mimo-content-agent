#!/usr/bin/env node

/**
 * Content router - Directs bronze content to correct templates based on language
 * Usage: node scripts/content-router.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');
const TEMPLATES_DIR = path.join(process.cwd(), 'content-db', 'templates');

const LANGUAGE_TEMPLATES = {
  'en': 'bronze-en.md',
  'pt': 'bronze-pt.md',
  'pt-br': 'bronze-pt.md',
  'es': 'bronze-es.md',
  'de': 'bronze-de.md',
  'ja': 'bronze-ja.md',
  'ko': 'bronze-ko.md',
  'zh': 'bronze-zh.md',
  'pl': 'bronze-pl.md'
};

function detectLanguage(content) {
  // Simple language detection based on common words
  const text = JSON.stringify(content).toLowerCase();
  
  if (text.includes(' the ') || text.includes(' and ') || text.includes(' is ')) return 'en';
  if (text.includes(' o ') || text.includes(' a ') || text.includes(' e ')) return 'pt';
  if (text.includes(' el ') || text.includes(' la ') || text.includes(' los ')) return 'es';
  if (text.includes(' der ') || text.includes(' die ') || text.includes(' und ')) return 'de';
  if (text.includes('の') || text.includes('は') || text.includes('が')) return 'ja';
  if (text.includes('은') || text.includes('는') || text.includes('이')) return 'ko';
  if (text.includes('的') || text.includes('是') || text.includes('不')) return 'zh';
  if (text.includes(' jest ') || text.includes(' nie ') || text.includes(' i ')) return 'pl';
  
  return 'en'; // Default to English
}

function getTemplate(language) {
  return LANGUAGE_TEMPLATES[language] || 'bronze-en.md';
}

function loadAllBronze() {
  const items = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items_list = fs.readdirSync(dir);
    for (const item of items_list) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
          items.push({
            file: path.relative(process.cwd(), itemPath),
            data: content
          });
        } catch (e) {}
      }
    }
  }
  
  scanDir(BRONZE_DIR);
  return items;
}

function main() {
  console.log('=== Content Router ===\n');
  
  const items = loadAllBronze();
  console.log(`Loaded ${items.length} bronze items\n`);
  
  const routing = {};
  
  for (const item of items) {
    const language = item.data.language || detectLanguage(item.data);
    const template = getTemplate(language);
    
    if (!routing[language]) {
      routing[language] = { count: 0, template, items: [] };
    }
    routing[language].count++;
    routing[language].items.push(item.file);
  }
  
  console.log('Routing results:');
  for (const [lang, data] of Object.entries(routing)) {
    console.log(`\n${lang.toUpperCase()} (${data.count} items):`);
    console.log(`  Template: ${data.template}`);
    console.log(`  Items: ${data.items.slice(0, 3).join(', ')}${data.items.length > 3 ? '...' : ''}`);
  }
  
  // Save routing config
  const routingConfig = {
    timestamp: new Date().toISOString(),
    total_items: items.length,
    routing
  };
  
  const configPath = path.join(process.cwd(), 'content-db', 'routing-config.json');
  fs.writeFileSync(configPath, JSON.stringify(routingConfig, null, 2));
  console.log(`\nRouting config saved to: ${configPath}`);
}

main();
