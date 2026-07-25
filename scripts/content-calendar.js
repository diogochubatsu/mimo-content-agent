#!/usr/bin/env node
/**
 * Content Calendar Generator
 * Generates a publishing schedule based on:
 * - Bronze articles with highest Silver expansion potential
 * - Keyword priority (from keyword-radar output)
 * - Source authority (from registry)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const BLOGS_DIR = path.join(__dirname, '..', 'content-db', 'blogs');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'content-calendar.md');

// Priority topics from keyword research
const TOPIC_PRIORITY = {
    'import-from-china': 10,
    'alibaba-1688': 9,
    'dropshipping': 8,
    'product-tips': 7,
    'make-money-online': 6,
};

function detectTopic(title) {
    const lower = title.toLowerCase();
    if (lower.includes('1688') || lower.includes('alibaba')) return 'alibaba-1688';
    if (lower.includes('import') || lower.includes('china')) return 'import-from-china';
    if (lower.includes('dropship')) return 'dropshipping';
    if (lower.includes('product') || lower.includes('trending') || lower.includes('best')) return 'product-tips';
    if (lower.includes('money') || lower.includes('business') || lower.includes('ecommerce')) return 'make-money-online';
    return 'general';
}

function getBronzeArticles() {
    const articles = [];
    
    for (const dir of fs.readdirSync(BLOGS_DIR, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        const dirPath = path.join(BLOGS_DIR, dir.name);
        
        for (const file of fs.readdirSync(dirPath).filter(f => f.endsWith('.md'))) {
            const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
            const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?\s*$/m);
            const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '');
            const words = content.split(/\s+/).length;
            const topic = detectTopic(title);
            const priority = TOPIC_PRIORITY[topic] || 3;
            
            // Check if Silver version exists
            const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
            const hasSilver = fs.existsSync(path.join(SILVER_DIR, `${slug}.md`));
            
            articles.push({
                source: dir.name,
                file,
                title,
                words,
                topic,
                priority,
                hasSilver,
                expansionPotential: words < 2000 && words >= 200 ? 'HIGH' : words < 200 ? 'LOW' : 'DONE',
            });
        }
    }
    
    return articles;
}

function generateCalendar(articles) {
    let md = `# Content Calendar\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Bronze articles:** ${articles.length}\n`;
    md += `**Need Silver expansion:** ${articles.filter(a => a.expansionPotential === 'HIGH').length}\n\n`;
    
    // Priority queue
    const highPriority = articles
        .filter(a => a.expansionPotential === 'HIGH' && !a.hasSilver)
        .sort((a, b) => b.priority - a.priority);
    
    md += `## Priority Queue (Bronze → Silver expansion)\n\n`;
    md += `| # | Article | Source | Topic | Priority | Words |\n|---|---------|--------|-------|----------|-------|\n`;
    
    let count = 0;
    for (const a of highPriority.slice(0, 30)) {
        count++;
        md += `| ${count} | ${a.title.substring(0, 50)} | ${a.source} | ${a.topic} | ${a.priority} | ${a.words} |\n`;
    }
    
    // Weekly schedule
    md += `\n## Weekly Publishing Schedule\n\n`;
    md += `| Day | Task | Target |\n|-----|------|--------|\n`;
    md += `| Monday | Expand 3 high-priority Bronze → Silver | Quality gate check |\n`;
    md += `| Tuesday | Expand 3 high-priority Bronze → Silver | Quality gate check |\n`;
    md += `| Wednesday | Expand 3 high-priority Bronze → Silver | Quality gate check |\n`;
    md += `| Thursday | Run AEO audit + fix issues | Grade all articles |\n`;
    md += `| Friday | Expand 3 high-priority Bronze → Silver | Quality gate check |\n`;
    md += `| Saturday | Run pipeline-orchestrator.js | Full status check |\n`;
    md += `| Sunday | Plan next week's priorities | Update content calendar |\n`;
    
    md += `\n## Target: 10 Silver articles per week\n`;
    md += `At current expansion rate, all Bronze articles can be Silver within ${Math.ceil(highPriority.length / 10)} weeks.\n`;
    
    return md;
}

function run() {
    const articles = getBronzeArticles();
    const calendar = generateCalendar(articles);
    
    fs.writeFileSync(OUTPUT, calendar);
    
    console.log('=== Content Calendar ===');
    console.log(`Bronze articles: ${articles.length}`);
    console.log(`Need expansion: ${articles.filter(a => a.expansionPotential === 'HIGH').length}`);
    console.log(`Already Silver: ${articles.filter(a => a.hasSilver).length}`);
    console.log(`Saved to: ${OUTPUT}`);
}

run();
