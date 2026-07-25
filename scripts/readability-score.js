#!/usr/bin/env node

/**
 * Readability scoring tool (Flesch-Kincaid)
 * Usage: node scripts/readability-score.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function countSentences(text) {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function calculateFleschKincaid(text) {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = text.split(/\s+/).reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Flesch-Kincaid Grade Level
  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  
  // Flesch Reading Ease
  const ease = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  
  return { grade: Math.round(grade * 10) / 10, ease: Math.round(ease * 10) / 10 };
}

function analyzeArticle(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  
  // Remove markdown formatting
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*.*?\*\*/g, '')
    .replace(/\*.*?\*/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\|.*?\|/g, '');
  
  const stats = calculateFleschKincaid(text);
  const wordCount = countWords(text);
  
  return {
    file: path.relative(process.cwd(), filepath),
    wordCount,
    grade: stats.grade,
    ease: stats.ease,
    gradeLabel: stats.grade <= 6 ? 'Easy' : stats.grade <= 8 ? 'Standard' : stats.grade <= 10 ? 'Difficult' : 'Very Difficult'
  };
}

function main() {
  console.log('=== Readability Scorer ===\n');
  
  const articles = [];
  
  for (const tier of ['bronze', 'silver']) {
    const dir = path.join(CONTENT_DIR, tier);
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      articles.push(analyzeArticle(path.join(dir, file)));
    }
  }
  
  // Sort by readability (easiest first)
  articles.sort((a, b) => a.ease - b.ease);
  
  console.log(`${'File'.padEnd(50)} ${'Words'.padEnd(8)} ${'Grade'.padEnd(8)} ${'Ease'.padEnd(8)} Level`);
  console.log('-'.repeat(90));
  
  for (const article of articles.slice(0, 10)) {
    console.log(
      `${article.file.padEnd(50)} ${String(article.wordCount).padEnd(8)} ${String(article.grade).padEnd(8)} ${String(article.ease).padEnd(8)} ${article.gradeLabel}`
    );
  }
  
  // Flag difficult articles
  const difficult = articles.filter(a => a.grade > 10);
  if (difficult.length > 0) {
    console.log(`\n⚠️ ${difficult.length} articles flagged as "Very Difficult" (Grade > 10)`);
  }
}

main();
