#!/usr/bin/env node
/**
 * Sitemap Explorer — discovers blog URLs from competitor sitemaps
 * More reliable than RSS for content discovery
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'sitemap-discovery.json');

const SITEMAPS = {
    "blog-shopify-en": "https://shopify.com/sitemap.xml",
    "blog-jingsourcing-en": "https://goldenshiny.com/sitemap.xml",
    "blog-leeline-en": "https://leelinegroup.com/sitemap.xml",
    "blog-autods-en": "https://autods.com/sitemap.xml",
    "blog-alidropship-en": "https://alidropship.com/sitemap.xml",
    "blog-cjdropshipping-en": "https://cjdropshipping.com/sitemap.xml",
    "blog-nichedropshipping-en": "https://nichedropshipping.com/sitemap.xml",
    "blog-junglescout-en": "https://junglescout.com/sitemap.xml",
    "blog-ecommercebrasil-pt": "https://ecommercebrasil.com.br/sitemap.xml",
    "blog-sebrae-pt": "https://agenciasebrae.com.br/sitemap.xml",
};

async function fetchUrl(url) {
    try {
        const r = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MiMoBot/1.0)' },
            signal: AbortSignal.timeout(10000),
            redirect: 'follow',
        });
        if (!r.ok) return null;
        return await r.text();
    } catch { return null; }
}

function extractUrls(xml) {
    const urls = [];
    const regex = /<loc>([^<]+)<\/loc>/gi;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        urls.push(match[1]);
    }
    return urls;
}

function filterBlogUrls(urls) {
    return urls.filter(u => 
        u.includes('/blog/') || 
        u.includes('/article/') ||
        u.includes('/guide/') ||
        u.includes('/post/') ||
        u.includes('/how-to/') ||
        u.includes('/tutorial/')
    );
}

async function run() {
    console.log('=== Sitemap Explorer ===\n');
    
    const results = {
        timestamp: new Date().toISOString(),
        sources: {},
        total_urls: 0,
        total_blog_urls: 0,
    };

    for (const [sourceId, sitemapUrl] of Object.entries(SITEMAPS)) {
        console.log(`Checking ${sourceId}...`);
        const xml = await fetchUrl(sitemapUrl);
        
        if (!xml) {
            console.log(`  FAILED to fetch sitemap`);
            results.sources[sourceId] = { status: 'failed', urls: 0, blog_urls: 0 };
            continue;
        }

        const allUrls = extractUrls(xml);
        const blogUrls = filterBlogUrls(allUrls);
        
        results.sources[sourceId] = {
            status: 'ok',
            sitemap_url: sitemapUrl,
            total_urls: allUrls.length,
            blog_urls: blogUrls.length,
            sample_urls: blogUrls.slice(0, 5),
        };
        results.total_urls += allUrls.length;
        results.total_blog_urls += blogUrls.length;
        
        console.log(`  ${allUrls.length} total URLs, ${blogUrls.length} blog URLs`);
        if (blogUrls.length > 0) {
            console.log(`  Sample: ${blogUrls[0].substring(0, 80)}`);
        }
        console.log('');
    }

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
    
    console.log(`\nSummary: ${results.total_urls} total URLs, ${results.total_blog_urls} blog URLs`);
    console.log(`Saved to: ${OUTPUT}`);
}

run();
