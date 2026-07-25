#!/usr/bin/env node

/**
 * SEO optimization tool for 8 languages
 * Usage: node scripts/seo-multilang.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');

const LANGUAGES = {
  en: { name: 'English', dir: 'silver' },
  pt: { name: 'Portuguese', dir: 'silver' },
  es: { name: 'Spanish', dir: 'silver' },
  de: { name: 'German', dir: 'silver' },
  ja: { name: 'Japanese', dir: 'silver' },
  ko: { name: 'Korean', dir: 'silver' },
  zh: { name: 'Chinese', dir: 'silver' },
  pl: { name: 'Polish', dir: 'silver' }
};

function detectLanguage(content) {
  const text = content.toLowerCase();
  if (text.includes('的') || text.includes('是') || text.includes('不')) return 'zh';
  if (text.includes('の') || text.includes('は') || text.includes('が')) return 'ja';
  if (text.includes('은') || text.includes('는') || text.includes('이')) return 'ko';
  if (text.includes(' o ') || text.includes(' a ') || text.includes(' e ')) return 'pt';
  if (text.includes(' el ') || text.includes(' la ') || text.includes(' los ')) return 'es';
  if (text.includes(' der ') || text.includes(' die ') || text.includes(' und ')) return 'de';
  if (text.includes(' jest ') || text.includes(' nie ') || text.includes(' i ')) return 'pl';
  return 'en';
}

function analyzeSEO(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const issues = [];
  
  // Check title length
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch && titleMatch[1].length > 60) {
    issues.push('Title too long');
  }
  
  // Check meta description
  if (!content.includes('description:')) {
    issues.push('No meta description');
  }
  
  // Check schema
  if (!content.includes('application/ld+json')) {
    issues.push('No schema markup');
  }
  
  // Check internal links
  const links = (content.match(/\]\(\/articles\//g) || []).length;
  if (links < 2) {
    issues.push('Low internal links');
  }
  
  return {
    file: path.relative(process.cwd(), filepath),
    issues,
    score: Math.max(0, 100 - (issues.length * 15))
  };
}

function main() {
  console.log('=== SEO Multi-Language Tool ===\n');
  
  const silverDir = path.join(CONTENT_DIR, 'silver');
  if (!fs.existsSync(silverDir)) {
    console.log('No silver directory found');
    return;
  }
  
  const files = fs.readdirSync(silverDir).filter(f => f.endsWith('.md'));
  console.log(`Analyzing ${files.length} silver articles\n`);
  
  const byLang = {};
  let totalScore = 0;
  
  for (const file of files) {
    const filepath = path.join(silverDir, file);
    const content = fs.readFileSync(filepath, 'utf8');
    const lang = detectLanguage(content);
    const seo = analyzeSEO(filepath);
    
    if (!byLang[lang]) {
      byLang[lang] = { count: 0, totalScore: 0 };
    }
    byLang[lang].count++;
    byLang[lang].totalScore += seo.score;
    totalScore += seo.score;
  }
  
  console.log('SEO Scores by Language:');
  for (const [lang, data] of Object.entries(byLang)) {
    const avgScore = Math.round(data.totalScore / data.count);
    console.log(`  ${lang.toUpperCase()}: ${data.count} articles, avg score: ${avgScore}/100`);
  }
  
  console.log(`\nOverall average score: ${Math.round(totalScore / files.length)}/100`);
}

main();
