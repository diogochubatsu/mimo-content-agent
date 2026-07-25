#!/usr/bin/env node
/**
 * Keyword Radar — detects emerging keywords from competitor content
 * Analyzes RSS feed output and sitemap URLs to find trending topics
 * Cross-references with our existing content to find gaps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEED_LOG = path.join(__dirname, '..', 'content-db', 'monitoring', 'feed-monitor-log.json');
const SITEMAP_LOG = path.join(__dirname, '..', 'content-db', 'monitoring', 'sitemap-discovery.json');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'keyword-radar.json');

// Keyword patterns to detect
const KEYWORD_PATTERNS = [
    // Import/China
    { pattern: /1688/gi, keyword: '1688', category: 'alibaba-1688' },
    { pattern: /alibaba/gi, keyword: 'alibaba', category: 'alibaba-1688' },
    { pattern: /import.*china/gi, keyword: 'import from china', category: 'import-from-china' },
    { pattern: /china.*sourc/gi, keyword: 'china sourcing', category: 'import-from-china' },
    { pattern: /wholesale.*china/gi, keyword: 'wholesale china', category: 'import-from-china' },
    { pattern: /buy.*1688/gi, keyword: 'buy from 1688', category: 'alibaba-1688' },
    { pattern: /sourcing.*agent/gi, keyword: 'sourcing agent', category: 'import-from-china' },
    { pattern: /factory.*china/gi, keyword: 'china factory', category: 'import-from-china' },
    
    // Dropshipping
    { pattern: /dropship/gi, keyword: 'dropshipping', category: 'dropshipping' },
    { pattern: /aliexpress/gi, keyword: 'aliexpress', category: 'dropshipping' },
    { pattern: /shopify/gi, keyword: 'shopify', category: 'dropshipping' },
    { pattern: /fulfillment/gi, keyword: 'fulfillment', category: 'dropshipping' },
    { pattern: /product.*research/gi, keyword: 'product research', category: 'product-tips' },
    { pattern: /winning.*product/gi, keyword: 'winning product', category: 'product-tips' },
    { pattern: /trending.*product/gi, keyword: 'trending product', category: 'product-tips' },
    
    // Money/Business
    { pattern: /make.*money.*online/gi, keyword: 'make money online', category: 'make-money-online' },
    { pattern: /passive.*income/gi, keyword: 'passive income', category: 'make-money-online' },
    { pattern: /side.*hustle/gi, keyword: 'side hustle', category: 'make-money-online' },
    { pattern: /amazon.*fba/gi, keyword: 'amazon fba', category: 'make-money-online' },
    
    // PT-BR specific
    { pattern: /importação.*china/gi, keyword: 'importação china', category: 'import-from-china' },
    { pattern: /comprar.*1688/gi, keyword: 'comprar 1688', category: 'alibaba-1688' },
    { pattern: /dropshipping.*brasil/gi, keyword: 'dropshipping brasil', category: 'dropshipping' },
    { pattern: /remessa.*conforme/gi, keyword: 'remessa conforme', category: 'import-from-china' },
];

function analyzeText(text) {
    const detected = {};
    for (const { pattern, keyword, category } of KEYWORD_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) {
            if (!detected[keyword]) {
                detected[keyword] = { count: 0, category };
            }
            detected[keyword].count += matches.length;
        }
    }
    return detected;
}

function run() {
    console.log('=== Keyword Radar ===\n');
    
    // Load feed data
    let feedItems = [];
    if (fs.existsSync(FEED_LOG)) {
        const feedData = JSON.parse(fs.readFileSync(FEED_LOG, 'utf8'));
        feedItems = feedData.new_items || [];
    }
    
    // Load sitemap data
    let sitemapUrls = [];
    if (fs.existsSync(SITEMAP_LOG)) {
        const sitemapData = JSON.parse(fs.readFileSync(SITEMAP_LOG, 'utf8'));
        for (const source of Object.values(sitemapData.sources || {})) {
            sitemapUrls.push(...(source.sample_urls || []));
        }
    }
    
    // Combine all text
    const allText = [
        ...feedItems.map(i => `${i.title || ''} ${i.source || ''}`),
        ...sitemapUrls.map(u => u.replace(/https?:\/\/[^/]+/, '').replace(/-/g, ' ')),
    ].join(' ');
    
    // Detect keywords
    const keywords = analyzeText(allText);
    
    // Sort by frequency
    const sorted = Object.entries(keywords)
        .sort((a, b) => b[1].count - a[1].count);
    
    console.log('Keywords detected from competitor content:');
    for (const [keyword, data] of sorted) {
        console.log(`  ${keyword}: ${data.count} mentions (${data.category})`);
    }
    
    // Generate gap analysis
    const gaps = sorted.filter(([kw, data]) => data.count >= 2).map(([kw, data]) => ({
        keyword: kw,
        competitor_mentions: data.count,
        category: data.category,
        our_content: 'check',
    }));
    
    const results = {
        timestamp: new Date().toISOString(),
        keywords_detected: sorted.length,
        top_keywords: sorted.slice(0, 10).map(([kw, data]) => ({ keyword: kw, count: data.count, category: data.category })),
        gaps_to_fill: gaps,
        sources_analyzed: feedItems.length + sitemapUrls.length,
    };
    
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
    
    console.log(`\n${results.keywords_detected} keywords detected from ${results.sources_analyzed} sources`);
    console.log(`${gaps.length} gaps to fill (keywords mentioned 2+ times by competitors)`);
    console.log(`Saved to: ${OUTPUT}`);
}

run();
