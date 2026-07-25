#!/usr/bin/env node
/**
 * Blog RSS Monitor — watches competitor blogs for new content
 * Uses feedparser to detect new posts → trend radar
 * When Jingsourcing publishes about "LED strips from 1688", we know that keyword will trend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY = path.join(__dirname, '..', 'content-db', 'raw', 'registry', 'sources-registry.json');
const FEED_LOG = path.join(__dirname, '..', 'content-db', 'monitoring', 'feed-monitor-log.json');
const ALERTS = path.join(__dirname, '..', 'content-db', 'monitoring', 'alerts');

// RSS feeds for major competitor blogs (discovered via sitemap analysis)
const RSS_FEEDS = {
    "blog-shopify-en": "https://shopify.com/blog/feed",
    "blog-jingsourcing-en": "https://goldenshiny.com/feed/",
    "blog-leeline-en": "https://leelinegroup.com/feed/",
    "blog-autods-en": "https://autods.com/blog/feed/",
    "blog-alidropship-en": "https://alidropship.com/feed/",
    "blog-nichedropshipping-en": "https://nichedropshipping.com/feed/",
    "blog-junglescout-en": "https://junglescout.com/blog/feed/",
    "blog-cjdropshipping-en": "https://cjdropshipping.com/feed/",
    "blog-ecommercebrasil-pt": "https://ecommercebrasil.com.br/feed/",
    "blog-sebrae-pt": "https://agenciasebrae.com.br/feed/",
    "blog-ecommercepolska-pl": "https://ecommercepolska.pl/feed/",
    "blog-importlizenz-de": "https://importlizenz.de/feed/",
};

// Topic keywords for trend detection
const TOPIC_KEYWORDS = {
    "import-from-china": ["import", "china", "1688", "alibaba", "sourcing", "supplier", "fob", "container", "importação", "china", "importar"],
    "dropshipping": ["dropship", "dropshipping", "aliexpress", "shopify", "fulfillment", "dropshipping"],
    "product-tips": ["best product", "trending", "winning product", "product research", "product find", "produto", "trending"],
    "alibaba-1688": ["1688", "alibaba", "wholesale", "moq", "bulk", "atacado", "fornecedor"],
    "make-money-online": ["make money", "passive income", "side hustle", "renda", "negócio", "lucro"],
};

function detectTopics(title) {
    const lower = title.toLowerCase();
    const matched = [];
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) {
            matched.push(topic);
        }
    }
    return matched;
}

async function fetchFeed(url) {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MiMoBot/1.0)' },
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return null;
        const text = await response.text();
        // Simple RSS/Atom XML parsing — extract items
        const items = [];
        const itemRegex = /<item>|<entry>/gi;
        const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
        const linkRegex = /<link[^>]*>([^<]+)<\/link>|<link[^>]+href="([^"]+)"/i;
        const pubDateRegex = /<pubDate[^>]*>([^<]+)<\/pubDate>|<published[^>]*>([^<]+)<\/published>/i;

        const parts = text.split(/<item>|<entry>/i);
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i].split(/<\/item>|<\/entry>/i)[0];
            const title = titleRegex.exec(part);
            const link = linkRegex.exec(part);
            const date = pubDateRegex.exec(part);
            if (title) {
                items.push({
                    title: title[1]?.trim(),
                    url: link ? (link[1] || link[2])?.trim() : '',
                    date: date ? (date[1] || date[2])?.trim() : '',
                    topics: detectTopics(title[1] || ''),
                });
            }
        }
        return items;
    } catch (e) {
        return null;
    }
}

async function run() {
    console.log('=== Blog RSS Monitor ===\n');
    console.log(`Monitoring ${Object.keys(RSS_FEEDS).length} feeds...\n`);

    const results = {
        timestamp: new Date().toISOString(),
        feeds_checked: 0,
        feeds_ok: 0,
        feeds_failed: 0,
        total_items: 0,
        new_items: [],
        trending_topics: {},
    };

    for (const [sourceId, feedUrl] of Object.entries(RSS_FEEDS)) {
        results.feeds_checked++;
        const items = await fetchFeed(feedUrl);
        
        if (items && items.length > 0) {
            results.feeds_ok++;
            results.total_items += items.length;
            
            // Show latest items
            const latest = items.slice(0, 3);
            console.log(`  [${sourceId}] ${items.length} items, latest:`);
            for (const item of latest) {
                console.log(`    - ${item.title?.substring(0, 60)}... [${item.topics.join(', ')}]`);
                // Track trending topics
                for (const topic of item.topics) {
                    results.trending_topics[topic] = (results.trending_topics[topic] || 0) + 1;
                }
            }
            results.new_items.push(...latest.map(i => ({ source: sourceId, ...i })));
            console.log('');
        } else {
            results.feeds_failed++;
            console.log(`  [${sourceId}] FAILED to fetch`);
        }
    }

    // Trending topic summary
    console.log('\n=== Trending Topics from Competitor Content ===');
    const sorted = Object.entries(results.trending_topics).sort((a, b) => b[1] - a[1]);
    for (const [topic, count] of sorted) {
        console.log(`  ${topic}: ${count} mentions across ${results.feeds_ok} blogs`);
    }

    // Save results
    fs.mkdirSync(path.dirname(FEED_LOG), { recursive: true });
    fs.writeFileSync(FEED_LOG, JSON.stringify(results, null, 2));

    // Save trend alerts
    if (sorted.length > 0) {
        fs.mkdirSync(ALERTS, { recursive: true });
        const alertFile = path.join(ALERTS, `trends-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(alertFile, JSON.stringify({
            timestamp: results.timestamp,
            trending: sorted.map(([topic, count]) => ({ topic, count })),
            new_content: results.new_items.slice(0, 10),
        }, null, 2));
    }

    console.log(`\nFeeds: ${results.feeds_ok}/${results.feeds_checked} ok, ${results.feeds_failed} failed`);
    console.log(`Total items found: ${results.total_items}`);
    console.log(`Feed log saved to: ${FEED_LOG}`);
}

run();
