#!/usr/bin/env node
/**
 * Collect articles from new Brazilian PT blogs
 * Sources: Yampi Blog, Hotmart Blog, Sebrae Notícias
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractArticle } from './blog-extractor-template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(process.cwd(), 'content-db', 'blogs', 'new-pt-sources');

// Blog sources to collect from
const BLOG_SOURCES = [
  {
    name: 'Yampi Blog',
    baseUrl: 'https://www.yampi.com.br',
    listingUrl: 'https://www.yampi.com.br/blog/',
    extractLinks: (html) => {
      const links = [];
      const regex = /href="(https:\/\/www\.yampi\.com\.br\/blog\/[^"]+)"/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const url = match[1];
        // Match article slugs: /blog/slug-name/
        if (url.match(/\/blog\/[a-z0-9-]+\/?$/) && 
            !url.includes('/page/') && 
            !url.includes('/category/') && 
            !url.includes('/tag/') &&
            !url.includes('/feed/') &&
            !url.includes('/wp-') &&
            !url.includes('.png') &&
            !url.includes('.jpg') &&
            !url.includes('.xml')) {
          links.push(url);
        }
      }
      return [...new Set(links)];
    }
  },
  {
    name: 'Hotmart Blog',
    baseUrl: 'https://hotmart.com',
    listingUrl: 'https://hotmart.com/pt-br/blog',
    extractLinks: (html) => {
      const links = [];
      const regex = /href="(\/pt-br\/blog\/[^"]+)"/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const path = match[1];
        // Match article slugs: /pt-br/blog/slug-name/
        if (path.match(/\/pt-br\/blog\/[a-z0-9-]+\/?$/) && 
            !path.includes('/categorias/') && 
            !path.includes('/page/') &&
            !path.includes('/materiais')) {
          links.push(`https://hotmart.com${path}`);
        }
      }
      return [...new Set(links)];
    }
  },
  {
    name: 'Sebrae Notícias',
    baseUrl: 'https://agenciasebrae.com.br',
    listingUrl: 'https://agenciasebrae.com.br',
    extractLinks: (html) => {
      const links = [];
      const regex = /href="(https:\/\/agenciasebrae\.com\.br\/[^"]+)"/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const url = match[1];
        // Match article slugs: /category/article-slug/
        if (url.match(/\/agenciasebrae\.com\.br\/[a-z-]+\/[a-z0-9-]+\/?$/) && 
            !url.includes('/editorias/') && 
            !url.includes('/page/') && 
            !url.includes('/tag/') && 
            !url.includes('/category/') &&
            !url.includes('/wp-') &&
            !url.includes('.png') &&
            !url.includes('.jpg') &&
            !url.includes('.xml') &&
            !url.includes('.php') &&
            !url.includes('/feed/')) {
          links.push(url);
        }
      }
      return [...new Set(links)];
    }
  }
];

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MiMoBot/1.0)' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    
    if (!response.ok) {
      console.error(`HTTP ${response.status} for ${url}`);
      return null;
    }
    
    return await response.text();
  } catch (e) {
    console.error(`Error fetching ${url}: ${e.message}`);
    return null;
  }
}

async function collectFromSource(source, maxArticles = 10) {
  console.log(`\n=== Collecting from ${source.name} ===`);
  
  const html = await fetchPage(source.listingUrl);
  if (!html) {
    console.error(`Failed to fetch listing page for ${source.name}`);
    return [];
  }
  
  const links = source.extractLinks(html);
  console.log(`Found ${links.length} article links`);
  
  const articlesToCollect = links.slice(0, maxArticles);
  console.log(`Collecting ${articlesToCollect.length} articles`);
  
  const articles = [];
  
  for (const url of articlesToCollect) {
    console.log(`Collecting: ${url}`);
    const article = await extractArticle(url);
    
    if (article.error) {
      console.error(`  Error: ${article.error}`);
      continue;
    }
    
    article.source = source.name;
    article.source_url = source.baseUrl;
    
    articles.push(article);
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return articles;
}

function saveArticleAsMarkdown(article, index, sourceName) {
  const slug = article.title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
  
  const filename = `${String(index).padStart(2, '0')}-${slug}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
source: "${article.source}"
url: "${article.url}"
date: "${article.published_date}"
summary: "${(article.description || '').replace(/"/g, '\\"').substring(0, 200)}"
tags: [${(article.topic_tags || []).map(t => `"${t}"`).join(', ')}]
---

`;
  
  const content = `# ${article.title}

**Fonte:** ${article.source} | **Data:** ${article.published_date}

${article.content}

---

*Artigo coletado automaticamente em ${article.collected_date}*
`;
  
  fs.writeFileSync(filepath, frontmatter + content);
  console.log(`  Saved: ${filename}`);
  
  return filename;
}

async function main() {
  console.log('=== New PT Blog Collection ===');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let totalArticles = 0;
  const collectedFiles = [];
  
  for (const source of BLOG_SOURCES) {
    const articles = await collectFromSource(source, 10);
    
    if (articles.length === 0) {
      console.log(`No articles collected from ${source.name}`);
      continue;
    }
    
    console.log(`\nSaving ${articles.length} articles from ${source.name}...`);
    
    for (let i = 0; i < articles.length; i++) {
      const filename = saveArticleAsMarkdown(articles[i], totalArticles + i + 1, source.name);
      collectedFiles.push(filename);
    }
    
    totalArticles += articles.length;
    console.log(`Total so far: ${totalArticles} articles`);
  }
  
  console.log(`\n=== Collection Complete ===`);
  console.log(`Total articles collected: ${totalArticles}`);
  console.log(`Files saved to: ${OUTPUT_DIR}`);
  
  const report = {
    timestamp: new Date().toISOString(),
    total_articles: totalArticles,
    sources: BLOG_SOURCES.map(s => s.name),
    files: collectedFiles
  };
  
  const reportPath = path.join(OUTPUT_DIR, 'collection-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${reportPath}`);
  
  return totalArticles;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = await main();
  process.exit(count > 0 ? 0 : 1);
}