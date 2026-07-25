#!/usr/bin/env node
/**
 * Internal Link Graph — analyzes cross-linking between articles
 * Finds missing internal links and suggests new connections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'internal-link-graph.md');

function loadArticles() {
    const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    const articles = [];
    
    for (const file of files) {
        const content = fs.readFileSync(path.join(SILVER_DIR, file), 'utf8');
        const slug = file.replace('.md', '');
        const titleMatch = content.match(/^title:\s*["']?([^"'\n]+)["']?\s*$/m);
        const title = titleMatch ? titleMatch[1].trim() : slug;
        
        // Extract internal links
        const links = [];
        const linkRegex = /\[([^\]]+)\]\((\/articles\/[^)]+|https?:\/\/importguide1688\.com\/articles\/[^)]+)\)/g;
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
            const target = match[2].replace(/https?:\/\/importguide1688\.com/, '').replace(/^\/articles\//, '');
            links.push(target);
        }
        
        // Extract keywords from title and content
        const keywords = extractKeywords(content);
        
        articles.push({
            file,
            slug,
            title,
            links: [...new Set(links)],
            linkCount: links.length,
            keywords,
            wordCount: content.split(/\s+/).length,
        });
    }
    
    return articles;
}

function extractKeywords(content) {
    const lower = content.toLowerCase();
    const keywords = new Set();
    
    const patterns = [
        /1688/g, /alibaba/g, /import/g, /china/g, /dropship/g,
        /supplier/g, /shipping/g, /product/g, /sourcing/g,
        /amazon/g, /shopify/g, /wholesale/g, /moq/g,
        /payment/g, /tax/g, /customs/g, /logistic/g,
        /temu/g, /aliexpress/g, /dhgate/g,
    ];
    
    for (const pattern of patterns) {
        const matches = lower.match(pattern);
        if (matches) {
            keywords.add(pattern.source.replace(/\\/g, ''));
        }
    }
    
    return [...keywords];
}

function findMissingLinks(articles) {
    const suggestions = [];
    const articleMap = {};
    for (const a of articles) articleMap[a.slug] = a;
    
    for (const article of articles) {
        for (const other of articles) {
            if (article.slug === other.slug) continue;
            if (article.links.includes(other.slug)) continue;
            
            // Check keyword overlap
            const overlap = article.keywords.filter(k => other.keywords.includes(k));
            if (overlap.length >= 2) {
                suggestions.push({
                    from: article.slug,
                    fromTitle: article.title,
                    to: other.slug,
                    toTitle: other.title,
                    sharedKeywords: overlap,
                    strength: overlap.length,
                });
            }
        }
    }
    
    return suggestions.sort((a, b) => b.strength - a.strength);
}

function run() {
    const articles = loadArticles();
    const suggestions = findMissingLinks(articles);
    
    let md = `# Internal Link Graph\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Articles:** ${articles.length}\n\n`;
    
    // Stats
    const linked = articles.filter(a => a.linkCount > 0).length;
    const unlinked = articles.filter(a => a.linkCount === 0).length;
    const avgLinks = (articles.reduce((s, a) => s + a.linkCount, 0) / articles.length).toFixed(1);
    
    md += `## Statistics\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Total articles | ${articles.length} |\n`;
    md += `| Articles with internal links | ${linked} |\n`;
    md += `| Articles with NO internal links | ${unlinked} |\n`;
    md += `| Average links per article | ${avgLinks} |\n`;
    md += `| Suggested new links | ${suggestions.length} |\n\n`;
    
    // Top linked articles
    md += `## Most Linked Articles (link authority hubs)\n\n`;
    const sorted = [...articles].sort((a, b) => b.linkCount - a.linkCount);
    for (const a of sorted.slice(0, 10)) {
        md += `- **${a.title}** — ${a.linkCount} outgoing links\n`;
    }
    
    // Unlinked articles
    if (unlinked > 0) {
        md += `\n## Articles with NO internal links (fix this!)\n\n`;
        for (const a of articles.filter(a => a.linkCount === 0)) {
            md += `- **${a.title}** (${a.wordCount}w)\n`;
        }
    }
    
    // Top suggestions
    md += `\n## Top 20 Internal Link Suggestions\n\n`;
    md += `| # | From | To | Shared Keywords | Strength |\n|---|------|-----|----------------|----------|\n`;
    
    const seen = new Set();
    let count = 0;
    for (const s of suggestions) {
        const key = `${s.from}->${s.to}`;
        const reverseKey = `${s.to}->${s.from}`;
        if (seen.has(key) || seen.has(reverseKey)) continue;
        seen.add(key);
        count++;
        if (count > 20) break;
        md += `| ${count} | ${s.fromTitle.substring(0, 40)} | ${s.toTitle.substring(0, 40)} | ${s.sharedKeywords.join(', ')} | ${s.strength} |\n`;
    }
    
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, md);
    
    console.log('=== Internal Link Graph ===');
    console.log(`Articles: ${articles.length}`);
    console.log(`With links: ${linked} | Without: ${unlinked}`);
    console.log(`Avg links/article: ${avgLinks}`);
    console.log(`Suggested new links: ${suggestions.length}`);
    console.log(`Saved to: ${OUTPUT}`);
}

run();
