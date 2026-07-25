#!/usr/bin/env node
/**
 * SEO + AEO Pipeline — runs ALL enhancements on Silver articles
 * One command: add-seo-aeo.js [file-or-directory]
 * 
 * Pipeline order:
 * 1. add-seo-meta.js — title, description, keywords
 * 2. add-internal-links.js — cross-linking
 * 3. citation-adder.js — external authoritative links
 * 4. aeo-fixer.js — direct factual answers in first paragraph
 * 5. faq-generator.js — FAQ sections (if missing)
 * 6. add-schema-markup.js — JSON-LD structured data
 * 7. add-faq-schema.js — FAQPage schema
 * 8. aeo-audit.js — final quality check
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptsDir = __dirname;

// Pipeline steps in order
const PIPELINE = [
    {
        name: 'SEO Meta Tags',
        script: 'add-seo-meta.js',
        description: 'Add title, description, keywords to frontmatter',
        category: 'traditional-seo',
    },
    {
        name: 'Internal Links',
        script: 'add-internal-links.js',
        description: 'Add cross-links between related articles',
        category: 'traditional-seo',
    },
    {
        name: 'External Citations',
        script: 'citation-adder.js',
        description: 'Add authoritative external links (Alibaba, 1688, government sources)',
        category: 'geo',
    },
    {
        name: 'Direct Answers (AEO)',
        script: 'aeo-fixer.js',
        description: 'Add data-driven factual opening lines for AI citation',
        category: 'geo',
    },
    {
        name: 'FAQ Generation',
        script: 'faq-generator.js',
        description: 'Generate FAQ sections from article headings',
        category: 'geo',
    },
    {
        name: 'Schema Markup',
        script: 'add-schema-markup.js',
        description: 'Add Article + FAQPage JSON-LD structured data',
        category: 'technical-seo',
    },
    {
        name: 'FAQ Schema',
        script: 'add-faq-schema.js',
        description: 'Add FAQPage schema for rich results',
        category: 'technical-seo',
    },
    {
        name: 'Open Graph Tags',
        script: 'add-og-tags.js',
        description: 'Add OG tags for social sharing and Google Discover',
        category: 'traditional-seo',
    },
];

async function runStep(step) {
    const scriptPath = path.join(scriptsDir, step.script);
    if (!fs.existsSync(scriptPath)) {
        return { step: step.name, status: 'SKIPPED', error: 'script not found' };
    }
    
    try {
        const output = execSync(`node "${scriptPath}"`, {
            cwd: path.join(scriptsDir, '..'),
            encoding: 'utf8',
            timeout: 30000,
        });
        // Count results from output
        const fixed = (output.match(/✓|added|fixed|generated/gi) || []).length;
        return { step: step.name, status: 'OK', category: step.category, results: fixed };
    } catch (e) {
        return { step: step.name, status: 'ERROR', category: step.category, error: e.message.substring(0, 100) };
    }
}

async function run() {
    console.log('========================================');
    console.log('  SEO + AEO ENHANCEMENT PIPELINE');
    console.log(`  ${new Date().toISOString()}`);
    console.log('========================================\n');
    
    console.log('Pipeline categories:');
    console.log('  [traditional-seo] Meta tags, internal links, OG tags');
    console.log('  [geo] Direct answers, citations, FAQ (AI search optimization)');
    console.log('  [technical-seo] Schema markup, structured data');
    console.log('');
    
    const results = [];
    
    for (const step of PIPELINE) {
        console.log(`>>> ${step.name} — ${step.description}`);
        const result = await runStep(step);
        results.push(result);
        
        if (result.status === 'OK') {
            console.log(`    ✓ ${result.results || 0} articles enhanced\n`);
        } else if (result.status === 'SKIPPED') {
            console.log(`    ⊘ Skipped (${result.error})\n`);
        } else {
            console.log(`    ✗ Error: ${result.error}\n`);
        }
    }
    
    // Final audit
    console.log('>>> Final AEO Quality Check');
    const auditResult = await runStep({ name: 'AEO Audit', script: 'aeo-audit.js' });
    console.log('');
    
    // Summary
    console.log('========================================');
    console.log('  PIPELINE SUMMARY');
    console.log('========================================');
    
    const traditional = results.filter(r => r.category === 'traditional-seo');
    const geo = results.filter(r => r.category === 'geo');
    const technical = results.filter(r => r.category === 'technical-seo');
    
    const ok = results.filter(r => r.status === 'OK').length;
    const errors = results.filter(r => r.status === 'ERROR').length;
    
    console.log(`  Traditional SEO: ${traditional.filter(r => r.status === 'OK').length}/${traditional.length} steps OK`);
    console.log(`  GEO/AEO: ${geo.filter(r => r.status === 'OK').length}/${geo.length} steps OK`);
    console.log(`  Technical SEO: ${technical.filter(r => r.status === 'OK').length}/${technical.length} steps OK`);
    console.log(`  Overall: ${ok}/${results.length} steps OK, ${errors} errors`);
    console.log('========================================');
}

run();
