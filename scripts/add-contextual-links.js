#!/usr/bin/env node

/**
 * Add contextual internal links within article content
 * Usage: node scripts/add-contextual-links.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');

function getArticles() {
  const articles = [];
  
  for (const tier of ['bronze', 'silver']) {
    const dir = path.join(CONTENT_DIR, tier);
    if (!fs.existsSync(dir)) continue;
    
    fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .forEach(f => {
        articles.push({
          slug: f.replace('.md', ''),
          tier,
          file: f,
          path: path.join(dir, f)
        });
      });
  }
  
  return articles;
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
    'phone', 'kitchen', 'fitness', 'beauty', 'pet', 'car', 'yoga',
    'bluetooth', 'earbuds', 'resistance', 'bands', 'gadgets'
  ];
  
  commonKeywords.forEach(kw => {
    if (contentLower.includes(kw)) keywords.add(kw);
  });
  
  return Array.from(keywords);
}

function findRelatedArticles(currentArticle, allArticles) {
  const content = fs.readFileSync(currentArticle.path, 'utf8');
  const currentKeywords = extractKeywords(content);
  
  return allArticles
    .filter(a => a.slug !== currentArticle.slug)
    .map(a => {
      const aContent = fs.readFileSync(a.path, 'utf8');
      const keywords = extractKeywords(aContent);
      const title = extractTitle(aContent);
      const overlap = currentKeywords.filter(k => keywords.includes(k));
      return { ...a, title, score: overlap.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function addContextualLinks(content, relatedArticles) {
  // Add contextual links within the content
  let updated = content;
  
  // Find paragraphs that mention related topics and add links
  for (const article of relatedArticles) {
    if (!article.title) continue;
    
    // Create a simpler link text from the title
    const linkText = article.title
      .replace(/^#+\s+/, '')
      .substring(0, 50);
    
    // Add link in the "See also" or "Learn more" style at the end
    const linkEntry = `- [${linkText}](/articles/${article.slug})`;
    
    // Check if link already exists
    if (!updated.includes(article.slug)) {
      // Add to Related Articles section if it exists
      if (updated.includes('## Related Articles')) {
        updated = updated.replace(
          '## Related Articles\n\n',
          `## Related Articles\n\n${linkEntry}\n`
        );
      } else {
        // Add new section at the end
        updated += `\n\n## Related Articles\n\n${linkEntry}`;
      }
    }
  }
  
  return updated;
}

// Main execution
const articles = getArticles();
let updated = 0;

for (const article of articles) {
  const content = fs.readFileSync(article.path, 'utf8');
  
  const related = findRelatedArticles(article, articles);
  if (related.length === 0) continue;
  
  const updatedContent = addContextualLinks(content, related);
  
  if (updatedContent !== content) {
    fs.writeFileSync(article.path, updatedContent);
    console.log(`✓ ${article.tier}/${article.slug} - Added ${related.length} contextual links`);
    updated++;
  }
}

console.log(`\nUpdated ${updated} articles with contextual links`);
