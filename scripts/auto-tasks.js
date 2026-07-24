#!/usr/bin/env node

/**
 * Auto-generate tasks based on article gaps
 * Usage: node scripts/auto-tasks.js
 */

import fs from 'fs';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'TASKS.json');
const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function loadTasks() {
  return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

function saveTasks(data) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

function getExistingArticles() {
  const articles = [];
  
  for (const tier of ['bronze', 'silver', 'gold']) {
    const dir = path.join(CONTENT_DIR, tier);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      files.forEach(f => articles.push({ tier, slug: f.replace('.md', '') }));
    }
  }
  
  return articles;
}

function findGaps(articles) {
  const gaps = [];
  
  // Check for missing tier coverage
  const tiers = ['bronze', 'silver', 'gold'];
  for (const tier of tiers) {
    const count = articles.filter(a => a.tier === tier).length;
    if (count < 5) {
      gaps.push({
        type: 'missing_tier',
        tier,
        current: count,
        target: 5,
        priority: 'high'
      });
    }
  }
  
  // Check for products without articles
  const products = ['led-strips', 'phone-cases', 'bluetooth-earbuds', 'kitchen-gadgets', 'fitness-equipment'];
  for (const product of products) {
    const hasArticle = articles.some(a => a.slug.includes(product));
    if (!hasArticle) {
      gaps.push({
        type: 'missing_product',
        product,
        priority: 'medium'
      });
    }
  }
  
  return gaps;
}

function generateTasks(gaps, existingTasks) {
  const newTasks = [];
  let taskNumber = existingTasks.length + 1;
  
  for (const gap of gaps) {
    const taskId = `T${String(taskNumber).padStart(3, '0')}`;
    
    let description = '';
    if (gap.type === 'missing_tier') {
      description = `Create ${5 - gap.current} more ${gap.tier} articles (currently ${gap.current})`;
    } else if (gap.type === 'missing_product') {
      description = `Create article for product: ${gap.product}`;
    }
    
    newTasks.push({
      id: taskId,
      from: 'gcp',
      to: 'pc-2',
      type: 'create',
      target: gap.product || `${gap.tier}-articles`,
      description,
      files: [],
      acceptance: 'Article published in content-db',
      priority: gap.priority,
      status: 'pending',
      created: new Date().toISOString(),
      result: null,
      depends_on: [],
      blocks: []
    });
    
    taskNumber++;
  }
  
  return newTasks;
}

// Main execution
const data = loadTasks();
const articles = getExistingArticles();
const gaps = findGaps(articles);

console.log('Found gaps:');
gaps.forEach(gap => {
  console.log(`  - ${gap.type}: ${gap.tier || gap.product} (priority: ${gap.priority})`);
});

const newTasks = generateTasks(gaps, data.tasks);
data.tasks.push(...newTasks);

saveTasks(data);

console.log(`\nGenerated ${newTasks.length} new tasks`);
