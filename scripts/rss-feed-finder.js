#!/usr/bin/env node
/**
 * RSS Feed Finder — discovers RSS/Atom feeds for any domain
 * Checks common paths + parses HTML <link> tags for feed autodiscovery
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'discovered-feeds.json');

const COMMON_PATHS = [
    '/feed', '/feed/', '/rss', '/rss/', '/rss.xml', '/feed.xml', '/atom.xml',
    '/feeds/posts/default', '/blog/feed', '/blog/feed/', '/blog/rss',
    '/blog/rss.xml', '/blog/atom.xml', '/index.xml', '/?feed=rss2',
    '/wp-json/wp/v2/posts', '/sitemap.xml',
];

async function fetchWithTimeout(url, timeoutMs = 8000) {
    try {
        const r = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MiMoBot/1.0)' },
            signal: AbortSignal.timeout(timeoutMs),
            redirect: 'follow',
        });
        if (!r.ok) return null;
        const text = await r.text();
        return text;
    } catch { return null; }
}

function isFeed(text) {
    if (!text) return false;
    const feedIndicators = ['<rss', '<feed', '<channel', '<entry', '<item', 'xmlns:atom'];
    return feedIndicators.some(i => text.toLowerCase().includes(i));
}

function extractFeedLinks(html) {
    const links = [];
    const regex = /<link[^>]+(?:type=["']application\/rss\+xml["']|type=["']application\/atom\+xml["'])[^>]*>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);
        if (hrefMatch) links.push(hrefMatch[1]);
    }
    // Also try reverse pattern
    const regex2 = /<link[^>]+href=["']([^"']+)["'][^>]*(?:type=["']application\/rss\+xml["']|type=["']application\/atom\+xml["'])[^>]*>/gi;
    while ((match = regex2.exec(html)) !== null) {
        links.push(match[1]);
    }
    return [...new Set(links)];
}

async function findFeeds(domain) {
    const base = domain.startsWith('http') ? domain : `https://${domain}`;
    const results = { domain, feeds: [], method: '' };

    // Method 1: Check HTML for feed autodiscovery
    const html = await fetchWithTimeout(base);
    if (html) {
        const feedLinks = extractFeedLinks(html);
        if (feedLinks.length > 0) {
            for (const link of feedLinks) {
                const feedUrl = link.startsWith('http') ? link : new URL(link, base).href;
                const feedText = await fetchWithTimeout(feedUrl);
                if (feedText && isFeed(feedText)) {
                    results.feeds.push({ url: feedUrl, type: 'autodiscovery' });
                }
            }
            if (results.feeds.length > 0) {
                results.method = 'html_autodiscovery';
                return results;
            }
        }
    }

    // Method 2: Check common paths
    for (const feedPath of COMMON_PATHS) {
        const feedUrl = new URL(feedPath, base).href;
        const text = await fetchWithTimeout(feedUrl);
        if (text && isFeed(text)) {
            results.feeds.push({ url: feedUrl, type: 'common_path' });
            results.method = 'common_path';
            return results;
        }
    }

    results.method = 'not_found';
    return results;
}

async function run() {
    console.log('=== RSS Feed Finder ===\n');

    const domains = [
        'shopify.com', 'goldenshiny.com', 'leelinegroup.com', 'autods.com',
        'alidropship.com', 'cjdropshipping.com', 'nichedropshipping.com',
        'junglescout.com', 'ecommercebrasil.com.br', 'agenciasebrae.com.br',
        'ecommercepolska.pl', 'importlizenz.de', 'bansarchina.com',
    ];

    const results = { timestamp: new Date().toISOString(), domains: {} };
    let found = 0;

    for (const domain of domains) {
        process.stdout.write(`  ${domain}... `);
        const result = await findFeeds(domain);
        results.domains[domain] = result;
        
        if (result.feeds.length > 0) {
            found++;
            console.log(`FOUND ${result.feeds.length} feed(s) via ${result.method}`);
            for (const feed of result.feeds) {
                console.log(`    ${feed.url}`);
            }
        } else {
            console.log('no feed found');
        }
    }

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));

    console.log(`\n${found}/${domains.length} domains have feeds`);
    console.log(`Saved to: ${OUTPUT}`);
}

run();
