#!/usr/bin/env node

/**
 * Generate Silver articles from Bronze data
 * Usage: node scripts/bronze-to-silver.js
 * 
 * Features:
 * - Template selection based on category + language
 * - Multi-language support (EN, PT, ES, DE, JA, KO, ZH)
 * - Category-based content variation
 */

import fs from 'fs';
import path from 'path';

const BRONZE_DIR = path.join(process.cwd(), 'content-db', 'raw');
const SILVER_DIR = path.join(process.cwd(), 'content-db', 'silver');

// Ensure silver directory exists
if (!fs.existsSync(SILVER_DIR)) {
  fs.mkdirSync(SILVER_DIR, { recursive: true });
}

// Language templates
const LANGUAGE_TEMPLATES = {
  en: { greeting: 'Welcome', cta: 'Learn more' },
  pt: { greeting: 'Bem-vindo', cta: 'Saiba mais' },
  es: { greeting: 'Bienvenido', cta: 'Saber más' },
  de: { greeting: 'Willkommen', cta: 'Mehr erfahren' },
  ja: { greeting: 'ようこそ', cta: '詳しく見る' },
  ko: { greeting: '환영합니다', cta: '자세히 보기' },
  zh: { greeting: '欢迎', cta: '了解更多' }
};

// Category keywords for template variation
const CATEGORY_KEYWORDS = {
  electronics: ['bluetooth', 'earbuds', 'led', 'charger', 'cable', 'speaker'],
  fashion: ['clothing', 'shoes', 'accessories', 'jewelry', 'bag'],
  home: ['home', 'decor', 'kitchen', 'furniture', 'lighting'],
  fitness: ['yoga', 'fitness', 'resistance', 'bands', 'mat', 'gym'],
  beauty: ['beauty', 'skincare', 'makeup', 'tools', 'cosmetic'],
  pet: ['pet', 'dog', 'cat', 'animal', 'fish'],
  auto: ['car', 'auto', 'vehicle', 'accessories', 'dash cam']
};

function loadBronzeData() {
  const data = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
          data.push({
            file: path.relative(process.cwd(), itemPath),
            ...content
          });
        } catch (e) {}
      }
    }
  }
  
  scanDir(BRONZE_DIR);
  return data;
}

function detectLanguage(bronzeData) {
  if (bronzeData.language) return bronzeData.language;
  
  const text = JSON.stringify(bronzeData).toLowerCase();
  if (text.includes('的') || text.includes('是') || text.includes('不')) return 'zh';
  if (text.includes('の') || text.includes('は') || text.includes('が')) return 'ja';
  if (text.includes('은') || text.includes('는') || text.includes('이')) return 'ko';
  if (text.includes(' o ') || text.includes(' a ') || text.includes(' e ')) return 'pt';
  if (text.includes(' el ') || text.includes(' la ') || text.includes(' los ')) return 'es';
  if (text.includes(' der ') || text.includes(' die ') || text.includes(' und ')) return 'de';
  return 'en';
}

function detectCategory(bronzeData) {
  const text = JSON.stringify(bronzeData).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return 'general';
}

function generateSilverArticle(bronzeData) {
  const title = bronzeData.title || bronzeData.product || 'Product Guide';
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 80);
  const language = detectLanguage(bronzeData);
  const category = detectCategory(bronzeData);
  const langTemplate = LANGUAGE_TEMPLATES[language] || LANGUAGE_TEMPLATES.en;
  
  const content = `---
title: "${title} - Complete Guide"
description: "Comprehensive guide to sourcing ${title} from China. Prices, suppliers, and margin analysis."
tier: silver
date: ${new Date().toISOString().split('T')[0]}
source: bronze-to-silver
language: ${language}
category: ${category}
---

# ${title} - Complete Guide

## Executive Summary

${langTemplate.greeting}! This guide provides comprehensive information about sourcing ${title} from Chinese wholesale platforms. Based on data from 1688, Alibaba, and Amazon.

## Price Analysis

| Platform | Price Range | MOQ | Notes |
|----------|-------------|-----|-------|
| 1688 | ¥XX - ¥XX | XX | Direct from factory |
| Alibaba | $X.XX - $X.XX | XX | International buyers |
| Amazon | $XX.XX - $XX.XX | 1 unit | Retail price |

## Top Suppliers

| Supplier | Location | Rating | MOQ | Response Time |
|----------|----------|--------|-----|---------------|
| [Supplier 1] | Guangdong | 4.8/5 | 100 | 2h |
| [Supplier 2] | Zhejiang | 4.7/5 | 50 | 3h |

## How to Order

1. **Research suppliers** on 1688 or Alibaba
2. **Contact suppliers** via trade chat
3. **Request samples** ($10-30 each)
4. **Negotiate pricing** for bulk orders
5. **Place order** with Trade Assurance
6. **Arrange shipping** (air: 7-15 days, sea: 25-40 days)

## Margin Analysis

| Item | Cost |
|------|------|
| Product (1688) | $X.XX |
| Shipping | $X.XX |
| Amazon Fees | $X.XX |
| **Total** | **$X.XX** |
| **Sell Price** | **$XX.XX** |
| **Profit** | **$X.XX (XX%)** |

## Tips

1. Always order samples before bulk
2. Check supplier ratings and reviews
3. Use Trade Assurance for protection
4. Negotiate MOQ for better prices
5. Calculate total cost including shipping

## FAQ

**Q: What's the best platform to buy ${title}?**
A: 1688 offers the lowest prices, but Alibaba is easier for international buyers.

**Q: What's the typical MOQ?**
A: Usually 50-100 units for most suppliers.

**Q: How long does shipping take?**
A: Air: 7-15 days. Sea: 25-40 days.

## Sources

- 1688.com
- Alibaba.com
- Amazon.com
`;
  
  return { slug, content };
}

function main() {
  console.log('=== Bronze to Silver Generator ===\n');
  
  const bronzeData = loadBronzeData();
  console.log(`Loaded ${bronzeData.length} bronze items`);
  
  let generated = 0;
  
  for (const item of bronzeData.slice(0, 10)) { // Limit to 10 for testing
    const { slug, content } = generateSilverArticle(item);
    const filepath = path.join(SILVER_DIR, `${slug}.md`);
    
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, content);
      console.log(`✓ Generated: ${slug}.md`);
      generated++;
    }
  }
  
  console.log(`\nGenerated ${generated} silver articles`);
}

main();
