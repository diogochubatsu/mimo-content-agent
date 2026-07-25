#!/usr/bin/env node
/**
 * Source Discovery — finds new sources by analyzing existing content
 * Extracts URLs, mentions, and references from Bronze articles
 * to discover new sources we should track
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOGS_DIR = path.join(__dirname, '..', 'content-db', 'blogs');
const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'discovered-sources.json');

function extractDomains(content) {
    const urls = content.match(/https?:\/\/[^\s\)"']+/g) || [];
    const domains = new Set();
    for (const url of urls) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            if (!domain.includes('importguide1688.com') && !domain.includes('google.com') && !domain.includes('facebook.com')) {
                domains.add(domain);
            }
        } catch {}
    }
    return [...domains];
}

function run() {
    const allDomains = new Map(); // domain -> count
    
    // Scan all Silver articles for external links
    for (const file of fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'))) {
        const content = fs.readFileSync(path.join(SILVER_DIR, file), 'utf8');
        const domains = extractDomains(content);
        for (const domain of domains) {
            allDomains.set(domain, (allDomains.get(domain) || 0) + 1);
        }
    }
    
    // Scan all Bronze articles
    for (const dir of fs.readdirSync(BLOGS_DIR, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        for (const file of fs.readdirSync(path.join(BLOGS_DIR, dir.name)).filter(f => f.endsWith('.md'))) {
            const content = fs.readFileSync(path.join(BLOGS_DIR, dir.name, file), 'utf8');
            const domains = extractDomains(content);
            for (const domain of domains) {
                allDomains.set(domain, (allDomains.get(domain) || 0) + 1);
            }
        }
    }
    
    // Sort by frequency
    const sorted = [...allDomains.entries()].sort((a, b) => b[1] - a[1]);
    
    // Save results
    const results = {
        timestamp: new Date().toISOString(),
        total_domains: sorted.length,
        top_20: sorted.slice(0, 20).map(([domain, count]) => ({ domain, mentions: count })),
        all_domains: sorted.map(([domain, count]) => ({ domain, mentions: count })),
    };
    
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
    
    console.log('=== Source Discovery ===');
    console.log(`Total domains found: ${sorted.length}`);
    console.log('\nTop 20 most mentioned:');
    for (const [domain, count] of sorted.slice(0, 20)) {
        console.log(`  ${domain}: ${count} mentions`);
    }
}

run();
