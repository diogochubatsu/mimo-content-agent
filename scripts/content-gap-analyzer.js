#!/usr/bin/env node
/**
 * Content Gap Analyzer
 * Compares our content against competitor content (from bronze sources)
 * to find topics competitors cover that we don't have Silver articles for
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const BLOGS_DIR = path.join(__dirname, '..', 'content-db', 'blogs');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'content-gap-analysis.md');

// Common topic patterns
const TOPIC_PATTERNS = [
    { pattern: /1688.*alibaba|alibaba.*1688/gi, topic: '1688 vs Alibaba' },
    { pattern: /dropship/gi, topic: 'Dropshipping' },
    { pattern: /import.*china|china.*import/gi, topic: 'Import from China' },
    { pattern: /sourcing.*agent|agent.*sourcing/gi, topic: 'Sourcing Agents' },
    { pattern: /shipping.*china|china.*shipping/gi, topic: 'Shipping from China' },
    { pattern: /product.*research|research.*product/gi, topic: 'Product Research' },
    { pattern: /temu|shein/gi, topic: 'Temu/Shein' },
    { pattern: /amazon.*fba|fba.*amazon/gi, topic: 'Amazon FBA' },
    { pattern: /aliexpress/gi, topic: 'AliExpress' },
    { pattern: /wholesale.*china|china.*wholesale/gi, topic: 'Wholesale from China' },
    { pattern: /supplier.*verif|verif.*supplier/gi, topic: 'Supplier Verification' },
    { pattern: /payment.*1688|1688.*payment/gi, topic: '1688 Payment' },
    { pattern: /private.*label|white.*label/gi, topic: 'Private Label' },
    { pattern: /trending.*product|product.*trending/gi, topic: 'Trending Products' },
    { pattern: /make.*money|passive.*income/gi, topic: 'Make Money Online' },
    { pattern: /dhl|fedex|ups.*shipping/gi, topic: 'Express Shipping' },
    { pattern: /customs|import.*tax|duty/gi, topic: 'Import Taxes/Customs' },
    { pattern: /yiwu|guangzhou|shenzhen/gi, topic: 'Chinese Markets' },
    { pattern: /ecommerce.*guide|guide.*ecommerce/gi, topic: 'Ecommerce Guide' },
    { pattern: /niches?|what.*sell/gi, topic: 'Product Niches' },
];

function extractTopics(content) {
    const topics = new Set();
    for (const { pattern, topic } of TOPIC_PATTERNS) {
        if (pattern.test(content)) {
            topics.add(topic);
        }
    }
    return topics;
}

function run() {
    console.log('=== Content Gap Analyzer ===\n');

    // Collect Silver article topics
    const silverFiles = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    const silverTopics = new Map(); // topic -> count of articles

    for (const file of silverFiles) {
        const content = fs.readFileSync(path.join(SILVER_DIR, file), 'utf8');
        const topics = extractTopics(content);
        for (const topic of topics) {
            silverTopics.set(topic, (silverTopics.get(topic) || 0) + 1);
        }
    }

    // Collect Bronze article topics
    const bronzeTopics = new Map();

    for (const dir of fs.readdirSync(BLOGS_DIR, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        const dirPath = path.join(BLOGS_DIR, dir.name);
        
        for (const file of fs.readdirSync(dirPath).filter(f => f.endsWith('.md'))) {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
            const topics = extractTopics(content);
            for (const topic of topics) {
                bronzeTopics.set(topic, (bronzeTopics.get(topic) || 0) + 1);
            }
        }
    }

    // Find gaps
    const allTopics = new Set([...silverTopics.keys(), ...bronzeTopics.keys()]);
    const gaps = [];

    for (const topic of allTopics) {
        const silver = silverTopics.get(topic) || 0;
        const bronze = bronzeTopics.get(topic) || 0;
        const ratio = silver > 0 ? bronze / silver : bronze;
        
        if (ratio > 1.5 || (silver === 0 && bronze > 2)) {
            gaps.push({ topic, silver, bronze, ratio: ratio.toFixed(1) });
        }
    }

    gaps.sort((a, b) => b.ratio - a.ratio);

    // Generate report
    let md = `# Content Gap Analysis\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Silver articles:** ${silverFiles.length}\n`;
    md += `**Topics found:** ${allTopics.size}\n`;
    md += `**Gaps identified:** ${gaps.length}\n\n`;

    md += `## Content Gaps (competitor topics we're under-serving)\n\n`;
    md += `| Topic | Silver Articles | Bronze References | Gap Ratio | Priority |\n`;
    md += `|-------|----------------|-------------------|-----------|----------|\n`;

    for (const gap of gaps) {
        const priority = gap.ratio >= 3 ? 'HIGH' : gap.ratio >= 2 ? 'MEDIUM' : 'LOW';
        md += `| ${gap.topic} | ${gap.silver} | ${gap.bronze} | ${gap.ratio}x | ${priority} |\n`;
    }

    md += `\n## Topic Coverage Heatmap\n\n`;
    md += `| Topic | Silver | Bronze | Status |\n|-------|--------|--------|--------|\n`;

    for (const topic of [...allTopics].sort()) {
        const s = silverTopics.get(topic) || 0;
        const b = bronzeTopics.get(topic) || 0;
        const status = s >= 3 ? 'STRONG' : s >= 1 ? 'ADEQUATE' : b > 0 ? 'NEEDS WORK' : 'EMPTY';
        md += `| ${topic} | ${s} | ${b} | ${status} |\n`;
    }

    md += `\n## Recommendations\n\n`;
    const top3 = gaps.filter(g => g.ratio >= 2).slice(0, 5);
    for (const gap of top3) {
        md += `1. **${gap.topic}** — Create ${Math.ceil(gap.ratio)} Silver articles to match competitor coverage\n`;
    }

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, md);

    console.log(`Silver topics: ${silverTopics.size}`);
    console.log(`Bronze topics: ${bronzeTopics.size}`);
    console.log(`Gaps: ${gaps.length}`);
    console.log(`Saved to: ${OUTPUT}`);
}

run();
