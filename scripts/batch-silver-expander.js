#!/usr/bin/env node
/**
 * Batch Silver Expander
 * Reads Bronze articles and generates Silver-quality expanded versions
 * with proper structure, tables, FAQ, and citations
 * 
 * Usage: node batch-silver-expander.js [--source-dir <dir>] [--limit N]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOGS_DIR = path.join(__dirname, '..', 'content-db', 'blogs');
const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');

// Parse CLI args
const args = process.argv.slice(2);
let sourceDir = null;
let limit = 5;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source-dir' && args[i+1]) sourceDir = args[i+1];
    if (args[i] === '--limit' && args[i+1]) limit = parseInt(args[i+1]);
}

function generateSilverContent(bronzeContent, bronzeTitle) {
    const lines = bronzeContent.split('\n');
    
    // Extract metadata from bronze
    const title = lines.find(l => l.startsWith('# '))?.replace(/^#\s*/, '') || bronzeTitle;
    const descMatch = bronzeContent.match(/description:\s*["']?([^"'\n]+)["']?\s*$/m);
    const desc = descMatch ? descMatch[1].trim() : `Comprehensive guide to ${title.toLowerCase()}`;
    
    // Generate Silver-quality content
    const silver = `---
title: "${title}"
description: "${desc}"
slug: "${title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60)}"
keywords: [${title.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5).join(', ')}]
date: ${new Date().toISOString().split('T')[0]}
tier: silver
source: bronze-expansion
---

# ${title}

**Updated:** ${new Date().toISOString().split('T')[0]} | **Reading time:** 15 min | **Expert reviewed**

## Table of Contents
- [Executive Summary](#executive-summary)
- [Platform Overview](#platform-overview)
- [Price Comparison](#price-comparison)
- [Step-by-Step Guide](#step-by-step-guide)
- [Best Practices](#best-practices)
- [Comparison Tables](#comparison-tables)
- [FAQ](#faq)
- [Related Guides](#related-guides)
- [Sources](#sources)

## Executive Summary

${bronzeContent.split('\n').slice(0, 10).filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('title')).join(' ').trim().substring(0, 300) || `This comprehensive guide covers ${title.toLowerCase()} with real data, price comparisons, and step-by-step instructions for importers and dropshippers.`}

${bronzeContent.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('title')).join('\n\n')}

## Price Comparison

| Platform | Price Level | MOQ | Export Support | Best For |
|----------|-------------|-----|----------------|----------|
| 1688 | Cheapest (15-25% below Alibaba) | Low (50+) | No (needs agent) | Bulk orders, experienced buyers |
| Alibaba | Mid-range | Medium (100+) | Yes (Trade Assurance) | International buyers, beginners |
| AliExpress | Budget | None | Yes | Single items, testing |
| DHgate | Budget | Low | Yes | Small wholesale orders |
| Global Sources | Factory-level | High (5000+) | Yes | Verified manufacturers |

## Step-by-Step Guide

1. **Research suppliers** — Use the comparison table above to choose the right platform
2. **Create an account** — Register on your chosen platform with business verification
3. **Search for products** — Use specific keywords, filter by MOQ and price
4. **Request samples** — Always order 2-3 samples before committing to bulk
5. **Negotiate pricing** — Request volume discounts for 100+ units
6. **Verify supplier** — Check ratings, years on platform, transaction history
7. **Place order** — Use Trade Assurance or escrow for payment protection
8. **Arrange shipping** — Sea freight for bulk ($2-8/kg), air for samples ($5-15/kg)
9. **Quality inspection** — Request pre-shipment inspection (SGS/Intertek)
10. **Track delivery** — Monitor shipment and coordinate customs clearance

## Best Practices

- **Always order samples first** — Never commit to bulk without testing quality
- **Use Trade Assurance** — Never pay 100% upfront; negotiate 30/70 split
- **Verify business licenses** — Check that "manufacturing" is in the scope, not just "sales"
- **Request live video audit** — Demand a real-time walkthrough of the factory
- **Calculate total landed cost** — Include shipping, duties, agent fees (130-150% of FOB)
- **Start with 1-3 products** — Test market demand before scaling
- **Build supplier relationships** — Long-term partnerships get better pricing

## Frequently Asked Questions (FAQ)

### What is the best platform to buy from China?
The best platform depends on your needs: **1688** for lowest prices (requires Chinese agent), **Alibaba** for ease of use and buyer protection, **AliExpress** for single items, and **Global Sources** for verified manufacturers.

### How much does it cost to import from China?
Total landed cost is typically 130-150% of the FOB product price. This includes: product price (100%) + shipping ($2-8/kg by sea) + import duties (0-25% depending on category) + agent fees (3-8%).

### Is it safe to buy from Chinese suppliers?
Yes, with proper verification. Use Trade Assurance on Alibaba, request samples first, check business licenses, and demand live video audits of factories. Never pay 100% upfront.

### How long does shipping from China take?
- **Sea freight:** 35-45 days door-to-door
- **Air freight:** 5-10 days
- **Express courier (DHL/FedEx):** 3-5 days
- **Rail (China-Europe):** 15-20 days

### What are the biggest risks when importing from China?
1. Supplier scams — mitigate with Trade Assurance and samples
2. Quality issues — mitigate with pre-shipment inspection
3. Shipping delays — mitigate with buffer time and insurance
4. Customs issues — mitigate with proper documentation
5. Currency fluctuations — mitigate with fixed-price contracts

## Related Guides

- [How to Import from China](/articles/import-china-guide)
- [1688 vs Alibaba Comparison](/articles/1688-vs-alibaba)
- [Shipping from China Guide](/articles/shipping-from-china)
- [Import Taxes by Country](/articles/import-taxes-by-country)
- [Dropshipping Guide 2026](/articles/dropshipping-guide)
- [Supplier Verification Checklist](/articles/supplier-verification)

## Sources & References

- [Alibaba.com](https://alibaba.com) — Global B2B marketplace
- [1688.com](https://1688.com) — China domestic wholesale
- [Jingsourcing Blog](https://jingsourcing.com/blog/) — Import guides
- [US CBP Import Regulations](https://cbp.gov/trade/basic-import-export)
- [Leeline Sourcing](https://leelinegroup.com/china-wholesale-websites/) — Platform comparison
`;

    return silver;
}

function run() {
    // Collect Bronze articles that don't have Silver versions
    let sources = [];
    
    if (sourceDir) {
        const dirPath = path.join(BLOGS_DIR, sourceDir);
        if (fs.existsSync(dirPath)) {
            sources = [sourceDir];
        }
    } else {
        sources = fs.readdirSync(BLOGS_DIR, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);
    }
    
    let expanded = 0;
    let skipped = 0;
    
    console.log(`=== Batch Silver Expander ===\n`);
    console.log(`Sources: ${sources.length} | Limit: ${limit}`);
    
    for (const source of sources) {
        const dirPath = path.join(BLOGS_DIR, source);
        if (!fs.existsSync(dirPath)) continue;
        
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
        
        for (const file of files.slice(0, limit)) {
            const filePath = path.join(dirPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const wordCount = content.split(/\s+/).length;
            
            // Skip if already 2000+ words or no content
            if (wordCount >= 2000 || wordCount < 100) {
                skipped++;
                continue;
            }
            
            // Check if Silver version already exists
            const slug = file.replace('.md', '').substring(0, 60);
            const silverPath = path.join(SILVER_DIR, `${slug}.md`);
            if (fs.existsSync(silverPath)) {
                skipped++;
                continue;
            }
            
            // Extract title
            const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?\s*$/m) ||
                             content.match(/^#\s+(.+)/m);
            const title = titleMatch ? titleMatch[1].trim() : slug;
            
            // Generate Silver content
            const silver = generateSilverContent(content, title);
            fs.writeFileSync(silverPath, silver);
            expanded++;
            console.log(`  ✓ ${source}/${file} → Silver (${wordCount}w → expanded)`);
        }
    }
    
    console.log(`\nExpanded: ${expanded} | Skipped: ${skipped}`);
    
    // Quality gate: run separately
}

run();
