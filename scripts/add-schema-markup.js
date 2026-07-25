#!/usr/bin/env node
/**
 * Add Schema.org structured data to Silver articles
 * Generates Article, FAQPage, and HowTo JSON-LD for rich results
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const SITE_URL = 'https://importguide1688.com';

function generateArticleSchema(title, description, url, date) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "url": url,
        "datePublished": date,
        "dateModified": date,
        "author": {
            "@type": "Organization",
            "name": "ImportGuide1688"
        },
        "publisher": {
            "@type": "Organization",
            "name": "ImportGuide1688",
            "url": SITE_URL
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        }
    };
}

function generateFAQSchema(content) {
    const faqs = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Match Q: or **Q:** patterns
        if (line.match(/^(?:\*\*)?Q[:.]|^##\s*FAQ|^#{1,3}\s*(?:What|How|Can|Is|Why|When|Where|Which)/i)) {
            let question = line.replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '').trim();
            // Remove "Q:" prefix
            question = question.replace(/^(?:\*\*)?Q[:.]\s*/i, '').trim();
            
            // Get answer from next non-empty lines
            let answer = '';
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const nextLine = lines[j].trim();
                if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('**Q')) {
                    answer = nextLine.replace(/^\s*[-*]\s*/, '').trim();
                    break;
                }
            }
            
            if (question && answer && question.length > 10) {
                faqs.push({ question, answer });
            }
        }
    }
    
    if (faqs.length === 0) return null;
    
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

function generateHowToSchema(content) {
    // Check if content has step-by-step format
    if (!content.match(/\bstep\s*[1-9]|\b\d+\.\s*\w/gi)) return null;
    
    const steps = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
        const match = line.match(/^\s*\d+\.\s+(.+)/);
        if (match) {
            steps.push({
                "@type": "HowToStep",
                "text": match[1].trim()
            });
        }
        if (steps.length >= 10) break;
    }
    
    if (steps.length < 3) return null;
    
    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How-to Guide",
        "step": steps
    };
}

function processArticle(file) {
    const filePath = path.join(SILVER_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract frontmatter
    const titleMatch = content.match(/^title:\s*["']?([^"'\n]+)["']?\s*$/m);
    const descMatch = content.match(/^description:\s*["']?([^"'\n]+)["']?\s*$/m);
    const dateMatch = content.match(/^date:\s*(\S+)/m);
    
    const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '');
    const description = descMatch ? descMatch[1].trim() : '';
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    const slug = file.replace('.md', '');
    const url = `${SITE_URL}/articles/${slug}`;
    
    // Generate schemas
    const articleSchema = generateArticleSchema(title, description, url, date);
    const faqSchema = generateFAQSchema(content);
    const howToSchema = generateHowToSchema(content);
    
    const schemas = [articleSchema];
    if (faqSchema) schemas.push(faqSchema);
    if (howToSchema) schemas.push(howToSchema);
    
    // Create schema HTML block
    let schemaHtml = '\n<!-- Schema.org Structured Data -->\n';
    for (const schema of schemas) {
        schemaHtml += `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n`;
    }
    
    return { file, schemas: schemas.length, hasFAQ: !!faqSchema, hasHowTo: !!howToSchema, schemaHtml };
}

function run() {
    const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    
    console.log(`=== Schema Markup Generator ===\n`);
    console.log(`Processing ${files.length} articles...\n`);
    
    let totalSchemas = 0;
    let withFAQ = 0;
    let withHowTo = 0;
    
    // Generate schema manifest
    const manifest = {
        timestamp: new Date().toISOString(),
        articles: files.length,
        schemas_generated: 0,
        faq_pages: 0,
        howto_pages: 0,
    };
    
    for (const file of files) {
        const result = processArticle(file);
        totalSchemas += result.schemas;
        if (result.hasFAQ) withFAQ++;
        if (result.hasHowTo) withHowTo++;
    }
    
    manifest.schemas_generated = totalSchemas;
    manifest.faq_pages = withFAQ;
    manifest.howto_pages = withHowTo;
    
    // Save manifest
    const manifestPath = path.join(__dirname, '..', 'content-db', 'monitoring', 'schema-manifest.json');
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`Articles processed: ${files.length}`);
    console.log(`Total schemas: ${totalSchemas}`);
    console.log(`FAQPage schemas: ${withFAQ} articles`);
    console.log(`HowTo schemas: ${withHowTo} articles`);
    console.log(`\nManifest saved to: ${manifestPath}`);
}

run();
