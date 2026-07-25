#!/usr/bin/env node
/**
 * Generate LLMs.txt — tells AI models how to understand your site
 * See: https://llmstxt.org/
 * AI models (ChatGPT, Perplexity, Claude, Gemini) use this to cite your content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const OUTPUT = path.join(__dirname, '..', 'site', 'public', 'llms.txt');
const OUTPUT_FULL = path.join(__dirname, '..', 'site', 'public', 'llms-full.txt');

function getArticles() {
    const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    const articles = [];
    
    for (const file of files) {
        const content = fs.readFileSync(path.join(SILVER_DIR, file), 'utf8');
        const titleMatch = content.match(/^title:\s*["']?([^"'\n]+)["']?\s*$/m);
        const descMatch = content.match(/^description:\s*["']?([^"'\n]+)["']?\s*$/m);
        const wordCount = content.split(/\s+/).length;
        
        const slug = file.replace('.md', '');
        articles.push({
            title: titleMatch ? titleMatch[1].trim() : slug,
            description: descMatch ? descMatch[1].trim() : '',
            url: `/articles/${slug}`,
            wordCount,
        });
    }
    
    return articles;
}

function generateLLMsTxt(articles) {
    let txt = `# importguide1688.com

> Import from China, 1688, Alibaba, and Dropshipping guides. Multi-language content covering sourcing, shipping, taxes, and product tips for importers worldwide.

## Site Overview
- Multi-language content site (EN, PT, ES, DE, PL)
- Focus: Import from China, 1688 vs Alibaba, dropshipping, product sourcing, make money online
- Content types: Guides, comparisons, tutorials, tools, product tips
- Total articles: ${articles.length}

## Key Topics
- How to import from China
- 1688 vs Alibaba comparison
- Dropshipping from China guide
- China sourcing agents
- Import taxes and shipping costs
- Product sourcing and research
- Make money with import/dropshipping

## Tools
- Landed Cost Calculator: Calculate total import costs (product + shipping + taxes)
- Import Checklist: 49-item checklist for first import from China
- Product Database: Searchable database of sourced products

## Latest Articles
`;

    // Add 10 most recent
    for (const article of articles.slice(0, 10)) {
        txt += `- [${article.title}](https://importguide1688.com${article.url}): ${article.description.substring(0, 120)}\n`;
    }

    txt += `\n## Full Article Index\n`;
    
    // Group by topic
    const topics = {
        'import-china': [],
        'alibaba-1688': [],
        'dropshipping': [],
        'product-tips': [],
        'money-online': [],
    };

    for (const article of articles) {
        const titleLower = article.title.toLowerCase();
        if (titleLower.includes('1688') || titleLower.includes('alibaba') || titleLower.includes('supplier')) {
            topics['alibaba-1688'].push(article);
        } else if (titleLower.includes('import') || titleLower.includes('china') || titleLower.includes('shipping')) {
            topics['import-china'].push(article);
        } else if (titleLower.includes('dropship')) {
            topics['dropshipping'].push(article);
        } else if (titleLower.includes('product') || titleLower.includes('best') || titleLower.includes('guide')) {
            topics['product-tips'].push(article);
        } else {
            topics['money-online'].push(article);
        }
    }

    for (const [topic, arts] of Object.entries(topics)) {
        if (arts.length > 0) {
            txt += `\n### ${topic.replace(/-/g, ' ')}\n`;
            for (const a of arts) {
                txt += `- [${a.title}](https://importguide1688.com${a.url})\n`;
            }
        }
    }

    return txt;
}

function generateLLMsFullTxt(articles) {
    let txt = `# Full Site Description — importguide1688.com

## About
importguide1688.com is a comprehensive multi-language content platform focused on helping importers and dropshippers source products from China. We cover 1688.com (Alibaba's domestic platform), Alibaba.com, AliExpress, and the entire China import ecosystem.

## Target Audience
- Entrepreneurs looking to import products from China
- Dropshippers sourcing from Chinese suppliers
- Amazon FBA sellers sourcing from 1688/Alibaba
- People wanting to make money online through import/dropshipping
- Brazilian/LATAM importers (PT content)
- European importers (DE, PL content)

## Content Quality Standards
- All articles: 2000+ words minimum
- Data-driven: real prices, real suppliers, real case studies
- Multi-language: EN, PT, ES, DE, PL
- Updated regularly with fresh data
- Expert-reviewed content

## Key Differentiators
- 8-language coverage (competitors are usually EN-only)
- Real product data from 1688 and Alibaba
- Price comparisons with actual numbers
- Import cost calculators and tools
- Country-specific import guides

## Total Content
- ${articles.length} Silver articles
- 50+ Bronze source files
- 59 tracked content sources
- 8 languages covered
`;

    for (const article of articles) {
        txt += `\n## ${article.title}\n`;
        txt += `URL: https://importguide1688.com${article.url}\n`;
        txt += `${article.description}\n`;
        txt += `Words: ${article.wordCount}\n`;
    }

    return txt;
}

function run() {
    const articles = getArticles();
    console.log(`Found ${articles.length} Silver articles`);
    
    // Generate llms.txt
    const llmsTxt = generateLLMsTxt(articles);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, llmsTxt);
    console.log(`Generated: ${OUTPUT} (${llmsTxt.length} chars)`);
    
    // Generate llms-full.txt
    const llmsFullTxt = generateLLMsFullTxt(articles);
    fs.writeFileSync(OUTPUT_FULL, llmsFullTxt);
    console.log(`Generated: ${OUTPUT_FULL} (${llmsFullTxt.length} chars)`);
}

run();
