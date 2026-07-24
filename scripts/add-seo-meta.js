#!/usr/bin/env node

/**
 * Script to add SEO metadata to existing articles
 * Usage: node scripts/add-seo-meta.js
 */

import fs from 'fs';
import path from 'path';
import { generateSEOMetadata, generateSchema } from '../src/agents/seo.js';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');
const DIRS = ['bronze', 'silver'];

function processArticle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
  
  // Extract content (skip frontmatter)
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
  
  const article = {
    title,
    content: contentWithoutFrontmatter,
    createdAt: new Date().toISOString()
  };
  
  // Generate SEO metadata
  const metadata = generateSEOMetadata(article, {
    primaryKeyword: extractKeyword(title)
  });
  
  // Generate schema
  const schema = generateSchema(article, metadata.slug);
  
  // Check if frontmatter exists
  const hasFrontmatter = content.startsWith('---');
  
  if (hasFrontmatter) {
    // Update existing frontmatter
    const updated = content.replace(
      /^---\n([\s\S]*?)---/,
      (match, frontmatter) => {
        const newFrontmatter = updateFrontmatter(frontmatter, metadata);
        return `---\n${newFrontmatter}---`;
      }
    );
    fs.writeFileSync(filePath, updated);
  } else {
    // Add new frontmatter
    const frontmatter = createFrontmatter(metadata);
    fs.writeFileSync(filePath, `${frontmatter}\n${content}`);
  }
  
  return metadata;
}

function extractKeyword(title) {
  // Simple keyword extraction
  const keywords = ['led strips', 'phone cases', 'kitchen gadgets', 'yoga mats', 'bluetooth'];
  const lowerTitle = title.toLowerCase();
  
  for (const kw of keywords) {
    if (lowerTitle.includes(kw)) return kw;
  }
  
  // Extract first meaningful words
  const words = title.split(' ').filter(w => w.length > 3);
  return words.slice(0, 2).join(' ').toLowerCase();
}

function createFrontmatter(metadata) {
  return `---
title: "${metadata.title}"
description: "${metadata.description}"
keywords: [${metadata.keywords.map(k => `"${k}"`).join(', ')}]
slug: "${metadata.slug}"
canonical: "${metadata.canonical}"
og:
  title: "${metadata.og.title}"
  description: "${metadata.og.description}"
  type: "${metadata.og.type}"
  image: "${metadata.og.image}"
---`;
}

function updateFrontmatter(frontmatter, metadata) {
  // Simple update - replace or add fields
  let updated = frontmatter;
  
  if (!updated.includes('description:')) {
    updated += `description: "${metadata.description}"\n`;
  }
  
  if (!updated.includes('keywords:')) {
    updated += `keywords: [${metadata.keywords.map(k => `"${k}"`).join(', ')}]\n`;
  }
  
  if (!updated.includes('canonical:')) {
    updated += `canonical: "${metadata.canonical}"\n`;
  }
  
  return updated;
}

// Main execution
let processed = 0;

for (const dir of DIRS) {
  const dirPath = path.join(CONTENT_DIR, dir);
  
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const metadata = processArticle(filePath);
      console.log(`✓ ${dir}/${file} - Keywords: ${metadata.keywords.join(', ')}`);
      processed++;
    } catch (error) {
      console.error(`✗ ${dir}/${file} - ${error.message}`);
    }
  }
}

console.log(`\nProcessed ${processed} articles`);
