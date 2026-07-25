#!/usr/bin/env node
/**
 * Bronze-to-Silver Converter
 * Takes a short bronze article (<2000 words) and generates a Silver expansion template
 * with sections, tables, FAQ, citations, and structured data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const TEMPLATES_DIR = path.join(__dirname, '..', 'content-db', 'templates');

// Silver article template structure
const SILVER_TEMPLATE = `---
title: "{{TITLE}}"
description: "{{DESCRIPTION}}"
slug: "{{SLUG}}"
keywords: [{{KEYWORDS}}]
date: {{DATE}}
tier: silver
source: bronze-to-silver
---

# {{TITLE}}

**Updated:** {{DATE}} | **Reading time:** {{READING_TIME}} min | **Expert reviewed**

## Table of Contents
- [Executive Summary](#executive-summary)
- [Section 1: {{SECTION_1}}](#section-1)
- [Section 2: {{SECTION_2}}](#section-2)
- [Section 3: {{SECTION_3}}](#section-3)
- [Comparison Tables](#comparison-tables)
- [Step-by-Step Guide](#step-by-step-guide)
- [FAQ](#faq)
- [Related Guides](#related-guides)
- [Sources](#sources)

## Executive Summary

{{EXECUTIVE_SUMMARY}}

## Section 1: {{SECTION_1}}

{{SECTION_1_CONTENT}}

## Section 2: {{SECTION_2}}

{{SECTION_2_CONTENT}}

## Section 3: {{SECTION_3}}

{{SECTION_3_CONTENT}}

## Comparison Tables

| Metric | 1688 | Alibaba | AliExpress | DHgate |
|--------|------|---------|------------|--------|
| Price Level | Cheapest | Mid-range | Budget | Budget |
| MOQ | Low (50+) | Medium (100+) | None | Low |
| Export Support | No | Yes | Yes | Yes |
| Buyer Protection | Limited | Trade Assurance | Basic | Escrow |
| English Support | No | Yes | Yes | Yes |

## Step-by-Step Guide

1. **Research suppliers** on the platform
2. **Request samples** before bulk orders
3. **Negotiate pricing** for volume discounts
4. **Verify supplier ratings** and reviews
5. **Use Trade Assurance** or escrow for payment
6. **Arrange shipping** (sea for bulk, air for samples)
7. **Inspect quality** before final payment

## Frequently Asked Questions (FAQ)

### What is the best platform to buy from China?
The best platform depends on your needs: 1688 for lowest prices (requires agent), Alibaba for ease of use and buyer protection, AliExpress for single items, and DHgate for small wholesale orders.

### How much does it cost to import from China?
Total cost includes product price + shipping ($2-8/kg by sea) + import duties (0-25%) + agent fees (3-8%). Budget 130-150% of the FOB product price.

### Is it safe to buy from Chinese suppliers?
Yes, with proper verification. Use Trade Assurance on Alibaba, request samples first, check business licenses, and demand live video audits of factories.

## Related Guides

- [How to Import from China](/articles/import-china-guide)
- [1688 vs Alibaba Comparison](/articles/1688-vs-alibaba)
- [Shipping from China Guide](/articles/shipping-from-china)
- [Import Taxes by Country](/articles/import-taxes-by-country)

## Sources & References

- [Alibaba.com](https://alibaba.com)
- [1688.com](https://1688.com)
- [Jingsourcing Blog](https://jingsourcing.com/blog/)
- [US CBP Import Regulations](https://cbp.gov/trade/basic-import-export)
`;

function generateSilverFromBronze(bronzeFile) {
    const content = fs.readFileSync(bronzeFile, 'utf8');
    
    // Extract bronze data
    const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?\s*$/m) || 
                       content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(bronzeFile, '.md');
    
    const descMatch = content.match(/description:\s*["']?([^"'\n]+)["']?\s*$/m) ||
                      content.match(/summary:\s*["']?([^"'\n]+)["']?\s*$/m);
    const description = descMatch ? descMatch[1].trim() : `Complete guide to ${title.toLowerCase()} with data, comparisons, and step-by-step instructions.`;
    
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
    const date = new Date().toISOString().split('T')[0];
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Generate Silver template
    let silver = SILVER_TEMPLATE
        .replace(/\{\{TITLE\}\}/g, title)
        .replace(/\{\{DESCRIPTION\}\}/g, description)
        .replace(/\{\{SLUG\}\}/g, slug)
        .replace(/\{\{DATE\}\}/g, date)
        .replace(/\{\{READING_TIME\}\}/g, Math.max(readingTime, 15))
        .replace(/\{\{KEYWORDS\}\}/g, title.toLowerCase().split(' ').slice(0, 5).join(', '))
        .replace(/\{\{EXECUTIVE_SUMMARY\}\}/g, `This comprehensive guide covers ${title.toLowerCase()} with real data, price comparisons, and step-by-step instructions for importers and dropshippers.`)
        .replace(/\{\{SECTION_1\}\}/g, 'Platform Overview')
        .replace(/\{\{SECTION_1_CONTENT\}\}/g, 'Detailed analysis of the platform, its features, and target audience.')
        .replace(/\{\{SECTION_2\}\}/g, 'Price Comparison & Analysis')
        .replace(/\{\{SECTION_2_CONTENT\}\}/g, 'Real data on pricing, MOQs, and cost breakdowns.')
        .replace(/\{\{SECTION_3\}\}/g, 'Step-by-Step Guide')
        .replace(/\{\{SECTION_3_CONTENT\}\}/g, 'Detailed instructions for getting started.');
    
    return { silver, slug, title };
}

function run() {
    // Process all bronze directories
    const blogDir = path.join(__dirname, '..', 'content-db', 'blogs');
    let converted = 0;
    
    const dirs = fs.readdirSync(blogDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
    
    for (const dir of dirs) {
        const dirPath = path.join(blogDir, dir);
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const wordCount = content.split(/\s+/).length;
            
            // Only convert if <2000 words and has meaningful content
            if (wordCount < 500) continue;
            if (wordCount >= 2000) continue; // Already Silver quality
            
            const { silver, slug, title } = generateSilverFromBronze(filePath);
            
            // Check if Silver version already exists
            const silverPath = path.join(SILVER_DIR, `${slug}.md`);
            if (fs.existsSync(silverPath)) continue;
            
            fs.writeFileSync(silverPath, silver);
            converted++;
            console.log(`  ✓ ${slug}.md (${wordCount}w → template generated)`);
        }
    }
    
    console.log(`\nConverted ${converted} bronze articles to Silver templates`);
    console.log(`These need manual content expansion to reach 2000+ words`);
}

run();
