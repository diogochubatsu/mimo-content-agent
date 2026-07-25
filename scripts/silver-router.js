#!/usr/bin/env node

/**
 * Silver Router - Directs bronze content to correct silver templates
 * Usage: node scripts/silver-router.js
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');
const TEMPLATES_DIR = path.join(process.cwd(), 'content-db', 'templates');

const CATEGORY_TEMPLATES = {
  electronics: 'silver-electronics.md',
  fashion: 'silver-fashion.md',
  home: 'silver-home.md',
  fitness: 'silver-fitness.md',
  beauty: 'silver-beauty.md',
  pet: 'silver-pet.md',
  auto: 'silver-auto.md',
  general: 'silver.md'
};

const CATEGORY_KEYWORDS = {
  electronics: ['bluetooth', 'earbuds', 'led', 'charger', 'cable', 'speaker', 'phone'],
  fashion: ['clothing', 'shoes', 'accessories', 'jewelry', 'bag', 'watch'],
  home: ['home', 'decor', 'kitchen', 'furniture', 'lighting', 'gadget'],
  fitness: ['yoga', 'fitness', 'resistance', 'bands', 'mat', 'gym', 'workout'],
  beauty: ['beauty', 'skincare', 'makeup', 'tools', 'cosmetic'],
  pet: ['pet', 'dog', 'cat', 'animal', 'fish', 'bird'],
  auto: ['car', 'auto', 'vehicle', 'accessories', 'dash cam', 'seat cover']
};

function detectCategory(content) {
  const text = JSON.stringify(content).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return 'general';
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
  console.log('=== Silver Router ===\n');
  
  const items = loadAllBronze();
  console.log(`Loaded ${items.length} bronze items\n`);
  
  const routing = {};
  
  for (const item of items) {
    const category = detectCategory(item.data);
    const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.general;
    
    if (!routing[category]) {
      routing[category] = { count: 0, template, items: [] };
    }
    routing[category].count++;
    routing[category].items.push(item.file);
  }
  
  console.log('Routing results:');
  for (const [cat, data] of Object.entries(routing)) {
    console.log(`\n${cat.toUpperCase()} (${data.count} items):`);
    console.log(`  Template: ${data.template}`);
    console.log(`  Items: ${data.items.slice(0, 3).join(', ')}${data.items.length > 3 ? '...' : ''}`);
  }
  
  // Save routing config
  const routingConfig = {
    timestamp: new Date().toISOString(),
    total_items: items.length,
    routing
  };
  
  const configPath = path.join(process.cwd(), 'content-db', 'silver-routing.json');
  fs.writeFileSync(configPath, JSON.stringify(routingConfig, null, 2));
  console.log(`\nRouting config saved to: ${configPath}`);
}

main();
