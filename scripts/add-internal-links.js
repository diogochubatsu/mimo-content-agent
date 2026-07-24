#!/usr/bin/env node

/**
 * Add internal links between silver articles
 * Usage: node scripts/add-internal-links.js
 */

import fs from 'fs';
import path from 'path';

const SILVER_DIR = path.join(process.cwd(), 'content-db', 'silver');

function getArticles() {
  if (!fs.existsSync(SILVER_DIR)) return [];
  
  return fs.readdirSync(SILVER_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      slug: f.replace('.md', ''),
      file: f,
      path: path.join(SILVER_DIR, f)
    }));
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : null;
}

function extractKeywords(content) {
  const keywords = new Set();
  const contentLower = content.toLowerCase();
  
  const commonKeywords = [
    '1688', 'alibaba', 'amazon', 'import', 'china', 'supplier',
    'dropship', 'fba', 'margin', 'profit', 'wholesale', 'led',
    'phone', 'kitchen', 'fitness', 'beauty', 'pet', 'car'
  ];
  
  commonKeywords.forEach(kw => {
    if (contentLower.includes(kw)) keywords.add(kw);
  });
  
  return Array.from(keywords);
}

function findRelatedArticles(currentArticle, allArticles) {
  const currentKeywords = extractKeywords(
    fs.readFileSync(currentArticle.path, 'utf8')
  );
  
  return allArticles
    .filter(a => a.slug !== currentArticle.slug)
    .map(a => {
      const keywords = extractKeywords(fs.readFileSync(a.path, 'utf8'));
      const overlap = currentKeywords.filter(k => keywords.includes(k));
      return { ...a, score: overlap.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function addInternalLinks(content, relatedArticles) {
  const linksSection = `\n\n## Related Articles\n\n${relatedArticles
    .map(a => `- [${a.title || a.slug}](/articles/${a.slug})`)
    .join('\n')}`;
  
  return content + linksSection;
}

// Main execution
const articles = getArticles();
let updated = 0;

for (const article of articles) {
  const content = fs.readFileSync(article.path, 'utf8');
  const title = extractTitle(content);
  
  // Skip if already has Related Articles section
  if (content.includes('## Related Articles')) {
    continue;
  }
  
  const related = findRelatedArticles(article, articles);
  if (related.length === 0) continue;
  
  const updatedContent = addInternalLinks(content, related);
  fs.writeFileSync(article.path, updatedContent);
  
  console.log(`✓ ${article.slug} - Added ${related.length} internal links`);
  updated++;
}

console.log(`\nUpdated ${updated} articles with internal links`);
