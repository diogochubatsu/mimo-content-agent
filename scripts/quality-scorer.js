#!/usr/bin/env node

/**
 * Quality Scorer - Analyzes silver articles and generates quality reports
 * Scores articles on: word count, structure, FAQ count, source count
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const OUTPUT_FILE = path.join(__dirname, '..', 'quality-report.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const yaml = match[1];
  const meta = {};
  for (const line of yaml.split('\n')) {
    const kv = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (kv) meta[kv[1]] = kv[2];
  }
  return meta;
}

function countWords(content) {
  const text = content.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function analyzeStructure(content) {
  const h2 = (content.match(/^## /gm) || []).length;
  const h3 = (content.match(/^### /gm) || []).length;
  const tables = (content.match(/\|.*\|/g) || []).length;
  const lists = (content.match(/^- /gm) || []).length;
  const codeBlocks = (content.match(/^```/gm) || []).length / 2;
  
  return { h2, h3, tables, lists, codeBlocks };
}

function countFAQ(content) {
  const faqMatch = content.match(/## FAQ[\s\S]*?(?=## |$)/);
  if (!faqMatch) return 0;
  
  const faqContent = faqMatch[0];
  const questions = (faqContent.match(/\*\*[^*]+\?\*\*/g) || []).length;
  const h3 = (faqContent.match(/^### /gm) || []).length;
  
  return Math.max(questions, h3);
}

function countSources(content) {
  const sourcesMatch = content.match(/## Sources[\s\S]*?(?=## |$)/);
  if (!sourcesMatch) return 0;
  
  const sources = (sourcesMatch[0].match(/^- /gm) || []).length;
  const links = (sourcesMatch[0].match(/\[.*?\]\(.*?\)/g) || []).length;
  
  return Math.max(sources, links);
}

function calculateScore(wordCount, structure, faqCount, sourceCount) {
  let score = 0;
  
  // Word count scoring (max 25 points)
  if (wordCount >= 2500) score += 25;
  else if (wordCount >= 2000) score += 20;
  else if (wordCount >= 1500) score += 15;
  else if (wordCount >= 1000) score += 10;
  else if (wordCount >= 500) score += 5;
  
  // Structure scoring (max 25 points)
  let structureScore = 0;
  if (structure.h2 >= 5) structureScore += 10;
  else if (structure.h2 >= 3) structureScore += 5;
  if (structure.h3 >= 10) structureScore += 10;
  else if (structure.h3 >= 5) structureScore += 5;
  if (structure.tables >= 1) structureScore += 3;
  if (structure.lists >= 5) structureScore += 2;
  score += Math.min(25, structureScore);
  
  // FAQ scoring (max 25 points)
  if (faqCount >= 8) score += 25;
  else if (faqCount >= 6) score += 20;
  else if (faqCount >= 4) score += 15;
  else if (faqCount >= 2) score += 10;
  else if (faqCount >= 1) score += 5;
  
  // Source scoring (max 25 points)
  if (sourceCount >= 15) score += 25;
  else if (sourceCount >= 10) score += 20;
  else if (sourceCount >= 8) score += 15;
  else if (sourceCount >= 5) score += 10;
  else if (sourceCount >= 3) score += 5;
  
  return Math.round(score);
}

function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function main() {
  const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
  
  const report = {
    generatedAt: new Date().toISOString(),
    totalArticles: files.length,
    articles: [],
    summary: {
      avgScore: 0,
      avgWordCount: 0,
      avgFAQ: 0,
      avgSources: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
      topArticles: [],
      bottomArticles: []
    }
  };

  let totalScore = 0;
  let totalWords = 0;
  let totalFAQ = 0;
  let totalSources = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(SILVER_DIR, file), 'utf-8');
    const meta = parseFrontmatter(content);
    const wordCount = countWords(content);
    const structure = analyzeStructure(content);
    const faqCount = countFAQ(content);
    const sourceCount = countSources(content);
    const score = calculateScore(wordCount, structure, faqCount, sourceCount);
    const grade = getGrade(score);

    totalScore += score;
    totalWords += wordCount;
    totalFAQ += faqCount;
    totalSources += sourceCount;
    report.summary.gradeDistribution[grade]++;

    report.articles.push({
      file,
      title: meta?.title || 'Untitled',
      slug: meta?.slug || '',
      wordCount,
      structure,
      faqCount,
      sourceCount,
      score,
      grade
    });
  }

  report.summary.avgScore = Math.round(totalScore / files.length);
  report.summary.avgWordCount = Math.round(totalWords / files.length);
  report.summary.avgFAQ = Math.round(totalFAQ / files.length * 10) / 10;
  report.summary.avgSources = Math.round(totalSources / files.length * 10) / 10;

  report.articles.sort((a, b) => b.score - a.score);
  report.summary.topArticles = report.articles.slice(0, 5).map(a => ({
    file: a.file,
    title: a.title,
    score: a.score,
    grade: a.grade
  }));
  report.summary.bottomArticles = report.articles.slice(-5).map(a => ({
    file: a.file,
    title: a.title,
    score: a.score,
    grade: a.grade
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
  
  console.log('\n=== QUALITY REPORT ===');
  console.log(`Total articles: ${files.length}`);
  console.log(`Average score: ${report.summary.avgScore}/100`);
  console.log(`Grade distribution:`, report.summary.gradeDistribution);
  console.log(`\nTop 5:`);
  report.summary.topArticles.forEach((a, i) => {
    console.log(`  ${i+1}. ${a.score} (${a.grade}) - ${a.title}`);
  });
  console.log(`\nBottom 5:`);
  report.summary.bottomArticles.forEach((a, i) => {
    console.log(`  ${i+1}. ${a.score} (${a.grade}) - ${a.title}`);
  });
  console.log(`\nReport saved to: ${OUTPUT_FILE}`);
}

main();
