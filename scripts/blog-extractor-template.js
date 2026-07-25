#!/usr/bin/env node
/**
 * Blog Extractor Template
 * Given a blog URL, fetches the page, extracts article content,
 * and outputs JSON matching the Bronze schema.
 *
 * Usage: node blog-extractor-template.js <url> [--output <path>]
 * Or import as module: import { extractArticle } from './blog-extractor-template.js'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRONZE_SCHEMA = {
    required: ['source_id', 'title', 'url', 'language', 'category', 'published_date', 'collected_date', 'word_count', 'content'],
    recommended: ['description', 'images', 'links_external', 'links_internal', 'key_takeaways', 'topic_tags', 'author'],
};

function extractTitle(html) {
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitle) return ogTitle[1].trim();
    
    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1) return h1[1].trim();
    
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTag) return titleTag[1].trim();
    
    return '';
}

function extractDescription(html) {
    const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    if (ogDesc) return ogDesc[1].trim();
    
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (metaDesc) return metaDesc[1].trim();
    
    return '';
}

function extractImages(html) {
    const images = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const src = match[1];
        if (src && !src.includes('logo') && !src.includes('icon') && !src.includes('avatar') && !src.includes('svg')) {
            images.push(src);
        }
    }
    return [...new Set(images)].slice(0, 10);
}

function extractLinks(html, baseUrl) {
    const links = [];
    const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const href = match[1];
        const text = match[2].trim();
        if (href && text && !href.startsWith('#') && !href.startsWith('javascript:')) {
            let fullUrl = href;
            try { fullUrl = new URL(href, baseUrl).href; } catch {}
            links.push({ url: fullUrl, text: text.substring(0, 100) });
        }
    }
    return links.slice(0, 50);
}

function extractBodyText(html) {
    // Remove script, style, nav, header, footer
    let cleaned = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
    
    // Extract article or main content
    const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const content = articleMatch ? articleMatch[1] : (mainMatch ? mainMatch[1] : cleaned);
    
    // Strip HTML tags
    const text = content
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    return text;
}

function detectLanguage(text) {
    const ptWords = /\b(por|para|como|mais|também|então|porém|muito|pode|desde|sobre|entre|depois|antes|quando|onde|qual|quem)\b/gi;
    const esWords = /\b(por|para|como|más|también|entonces|sin embargo|muy|puede|desde|sobre|entre|después|antes|cuando|donde|cual|quien)\b/gi;
    const deWords = /\b(und|die|der|das|ist|ein|eine|auf|mit|für|von|nicht|auch|aber|noch|nach|bei|über|kann|haben|werden)\b/gi;
    
    const ptMatches = (text.match(ptWords) || []).length;
    const esMatches = (text.match(esWords) || []).length;
    const deMatches = (text.match(deWords) || []).length;
    
    if (ptMatches > esMatches && ptMatches > deMatches) return 'pt';
    if (esMatches > ptMatches && esMatches > deMatches) return 'es';
    if (deMatches > ptMatches && deMatches > esMatches) return 'de';
    return 'en';
}

export async function extractArticle(url) {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MiMoBot/1.0)' },
            signal: AbortSignal.timeout(15000),
            redirect: 'follow',
        });
        
        if (!response.ok) return { error: `HTTP ${response.status}` };
        
        const html = await response.text();
        const bodyText = extractBodyText(html);
        const links = extractLinks(html, url);
        
        const domain = new URL(url).hostname;
        
        const article = {
            // Required fields
            source_id: domain,
            title: extractTitle(html) || 'Untitled',
            url: url,
            language: detectLanguage(bodyText),
            category: 'import-from-china',
            published_date: new Date().toISOString().split('T')[0],
            collected_date: new Date().toISOString().split('T')[0],
            word_count: bodyText.split(/\s+/).filter(w => w.length > 0).length,
            content: bodyText,
            
            // Recommended fields
            description: extractDescription(html),
            images: extractImages(html),
            links_external: links.filter(l => !l.url.includes(domain)).slice(0, 10),
            links_internal: links.filter(l => l.url.includes(domain)).slice(0, 10),
            key_takeaways: [],
            topic_tags: [],
            author: '',
        };
        
        return article;
    } catch (e) {
        return { error: e.message };
    }
}

// CLI mode
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const url = process.argv[2];
    const outputPath = process.argv[3] || null;
    
    if (!url) {
        console.log('Usage: node blog-extractor-template.js <url> [output-path]');
        process.exit(1);
    }
    
    console.log(`Extracting: ${url}`);
    const article = await extractArticle(url);
    
    if (article.error) {
        console.error(`Error: ${article.error}`);
        process.exit(1);
    }
    
    console.log(`Title: ${article.title}`);
    console.log(`Language: ${article.language}`);
    console.log(`Words: ${article.word_count}`);
    console.log(`Images: ${article.images.length}`);
    console.log(`Links: ${article.links_external.length} external, ${article.links_internal.length} internal`);
    
    if (outputPath) {
        fs.writeFileSync(outputPath, JSON.stringify(article, null, 2));
        console.log(`Saved to: ${outputPath}`);
    }
}
