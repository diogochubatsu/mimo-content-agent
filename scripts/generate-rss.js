#!/usr/bin/env node

/**
 * Generate RSS feed from content-db articles
 * Usage: node scripts/generate-rss.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');
const SITE_DIR = path.join(process.cwd(), 'site', 'public');
const SITE_URL = 'https://importguide1688.com';

function getArticles() {
  const articles = [];
  
  for (const tier of ['bronze', 'silver']) {
    const dir = path.join(CONTENT_DIR, tier);
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
      
      // Extract first paragraph as description
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      const description = lines[0] || '';
      
      articles.push({
        title,
        slug: file.replace('.md', ''),
        tier,
        description: description.substring(0, 200)
      });
    }
  }
  
  return articles.sort((a, b) => b.slug.localeCompare(a.slug));
}

function generateRSS(articles) {
  const items = articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE_URL}/articles/${article.slug}</link>
      <description><![CDATA[${article.description}]]></description>
      <category>${article.tier}</category>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid>${SITE_URL}/articles/${article.slug}</guid>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Import Guide 1688</title>
    <link>${SITE_URL}</link>
    <description>Your guide to importing products from China</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

// Main execution
const articles = getArticles();
const rss = generateRSS(articles);

const outputPath = path.join(SITE_DIR, 'feed.xml');
fs.writeFileSync(outputPath, rss);

console.log(`Generated RSS feed with ${articles.length} articles`);
console.log(`Output: ${outputPath}`);
