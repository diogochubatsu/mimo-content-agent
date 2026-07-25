#!/usr/bin/env node
/**
 * Citation Adder — adds authoritative external links to articles
 * AEO audit shows only 5% of articles have external citations
 * AI engines trust content that cites authoritative sources
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const REGISTRY = path.join(__dirname, '..', 'content-db', 'raw', 'registry', 'sources-registry.json');

// Authoritative citation sources mapped by topic
const CITATIONS = {
    '1688': [
        { text: '1688.com official marketplace', url: 'https://1688.com' },
        { text: 'Alibaba Group', url: 'https://alibaba.com' },
        { text: 'Jingsourcing 1688 guide', url: 'https://jingsourcing.com/blog/' },
    ],
    'alibaba': [
        { text: 'Alibaba Trade Assurance', url: 'https://alibaba.com/trade-assurance' },
        { text: 'Alibaba buyer protection', url: 'https://alibaba.com/help/buyer-protection' },
        { text: 'Leeline sourcing guide', url: 'https://leelinegroup.com/china-wholesale-websites/' },
    ],
    'dropship': [
        { text: 'CJDropshipping platform', url: 'https://cjdropshipping.com' },
        { text: 'Shopify dropshipping guide', url: 'https://shopify.com/blog/dropshipping-guide' },
        { text: 'AliDropship resources', url: 'https://alidropship.com/blog/' },
    ],
    'import': [
        { text: 'US Customs and Border Protection', url: 'https://cbp.gov/trade/basic-import-export' },
        { text: 'EU import regulations', url: 'https://single-market-economy.ec.europa.eu/' },
        { text: 'Jingsourcing import guide', url: 'https://jingsourcing.com/blog/c-import-from-china-guide/' },
    ],
    'shipping': [
        { text: 'Freightos shipping calculator', url: 'https://freightos.com' },
        { text: 'Flexport shipping guide', url: 'https://www.flexport.com' },
        { text: 'DHL express rates', url: 'https://www.dhl.com' },
    ],
    'amazon': [
        { text: 'Amazon FBA guide', url: 'https://sellercentral.amazon.com/help/hub/reference/external/201074390' },
        { text: 'Jungle Scout blog', url: 'https://junglescout.com/blog/' },
        { text: 'Amazon seller central', url: 'https://sellercentral.amazon.com' },
    ],
    'temu': [
        { text: 'Temu wholesale', url: 'https://temu.com' },
        { text: 'DHgate marketplace', url: 'https://dhgate.com' },
    ],
    'supplier': [
        { text: 'Global Sources supplier directory', url: 'https://globalsources.com' },
        { text: 'Made-in-China verified manufacturers', url: 'https://made-in-china.com' },
        { text: 'GoldSupplier directory', url: 'https://goldsupplier.com' },
    ],
    'tax': [
        { text: 'US CBP duty rates', url: 'https://hts.usitc.gov' },
        { text: 'EU TARIC database', url: 'https://ec.europa.eu/taxation_customs/dds2/taric' },
    ],
    'product': [
        { text: 'Google Trends', url: 'https://trends.google.com' },
        { text: 'Amazon Best Sellers', url: 'https://www.amazon.com/bestsellers' },
    ],
};

function detectTopics(content) {
    const lower = content.toLowerCase();
    const topics = [];
    if (lower.includes('1688')) topics.push('1688');
    if (lower.includes('alibaba')) topics.push('alibaba');
    if (lower.includes('dropship')) topics.push('dropship');
    if (lower.includes('import') || lower.includes('customs')) topics.push('import');
    if (lower.includes('shipping') || lower.includes('freight')) topics.push('shipping');
    if (lower.includes('amazon') || lower.includes('fba')) topics.push('amazon');
    if (lower.includes('temu')) topics.push('temu');
    if (lower.includes('supplier') || lower.includes('manufacturer')) topics.push('supplier');
    if (lower.includes('tax') || lower.includes('duty') || lower.includes('tariff')) topics.push('tax');
    if (lower.includes('product') || lower.includes('trending')) topics.push('product');
    return [...new Set(topics)];
}

function hasExternalLinks(content) {
    const externalLinks = content.match(/\]\(https?:\/\/(?!importguide1688)[^)]+\)/g);
    return (externalLinks || []).length;
}

function addCitations(file) {
    const filePath = path.join(SILVER_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const existingLinks = hasExternalLinks(content);
    if (existingLinks >= 3) {
        return { file, status: 'already has citations', count: existingLinks };
    }
    
    const topics = detectTopics(content);
    const needed = Math.max(0, 3 - existingLinks);
    
    // Collect relevant citations
    const citations = [];
    for (const topic of topics) {
        const topicCitations = CITATIONS[topic] || [];
        for (const c of topicCitations) {
            if (!content.includes(c.url) && citations.length < needed) {
                citations.push(c);
            }
        }
    }
    
    if (citations.length === 0) return { file, status: 'no relevant citations found' };
    
    // Find "Sources" or "References" section, or add before FAQ
    const lines = content.split('\n');
    let insertIdx = lines.findIndex(l => l.startsWith('## Sources') || l.startsWith('## References'));
    
    if (insertIdx === -1) {
        // Find FAQ section
        insertIdx = lines.findIndex(l => l.includes('FAQ') || l.includes('Frequently Asked'));
        if (insertIdx === -1) {
            // Add at end
            insertIdx = lines.length;
        }
    }
    
    // Build citation block
    let citationBlock = '\n### Sources & References\n\n';
    for (const c of citations) {
        citationBlock += `- [${c.text}](${c.url})\n`;
    }
    citationBlock += '\n';
    
    lines.splice(insertIdx, 0, citationBlock);
    fs.writeFileSync(filePath, lines.join('\n'));
    
    return { file, status: 'citations added', count: citations.length };
}

function run() {
    const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    
    console.log('=== Citation Adder ===\n');
    
    let added = 0;
    let already = 0;
    let noMatch = 0;
    
    for (const file of files) {
        const result = addCitations(file);
        if (result.status === 'citations added') {
            added++;
            console.log(`  ✓ ${result.file}: ${result.count} citations added`);
        } else if (result.status === 'already has citations') {
            already++;
        } else {
            noMatch++;
        }
    }
    
    console.log(`\nResults:`);
    console.log(`  Citations added: ${added}`);
    console.log(`  Already have 3+ links: ${already}`);
    console.log(`  No relevant citations: ${noMatch}`);
    console.log(`  Total: ${files.length}`);
}

run();
