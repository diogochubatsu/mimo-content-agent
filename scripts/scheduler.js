#!/usr/bin/env node

/**
 * Scheduler - Publish articles automatically based on content calendar
 * Usage: node scripts/scheduler.js
 */

import fs from 'fs';
import path from 'path';

const CALENDAR_FILE = path.join(process.cwd(), 'content-db', 'content-calendar.json');
const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function loadCalendar() {
  if (!fs.existsSync(CALENDAR_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(CALENDAR_FILE, 'utf8'));
}

function getArticlesForDay(day) {
  const calendar = loadCalendar();
  if (!calendar) return [];
  
  const articles = [];
  
  for (const week of Object.values(calendar.calendar)) {
    for (const task of week.tasks) {
      if (task.day === day && task.type === 'content' && task.articles) {
        articles.push(...task.articles);
      }
    }
  }
  
  return articles;
}

function checkArticleExists(topic, tier) {
  const dir = path.join(CONTENT_DIR, tier);
  if (!fs.existsSync(dir)) return false;
  
  const files = fs.readdirSync(dir);
  return files.some(f => f.toLowerCase().includes(topic.toLowerCase().replace(/\s+/g, '-')));
}

function main() {
  console.log('=== Content Scheduler ===\n');
  
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  console.log(`Today: ${dayName} (${today.toDateString()})\n`);
  
  const articles = getArticlesForDay(dayName);
  
  if (articles.length === 0) {
    console.log('No articles scheduled for today.');
    return;
  }
  
  console.log(`Scheduled articles for ${dayName}:`);
  
  for (const article of articles) {
    const exists = checkArticleExists(article.topic, article.tier);
    const status = exists ? '✅ Exists' : '⏳ Pending';
    console.log(`  ${status} - ${article.topic} (${article.tier})`);
  }
  
  console.log('\nTo generate pending articles, run:');
  console.log('node scripts/batch-generate.js topics.json');
}

main();
