#!/usr/bin/env node
/**
 * Coverage Report — generates a markdown report of Bronze datalake coverage
 * Shows extraction % by language, type, and topic
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY = path.join(__dirname, '..', 'content-db', 'raw', 'registry', 'sources-registry.json');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'COVERAGE-REPORT.md');

function loadRegistry() {
    return JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
}

function run() {
    const registry = loadRegistry();
    const sources = registry.sources || [];
    
    const byLanguage = {};
    const byType = {};
    const byTopic = {};
    let totalExtracted = 0;
    let totalEstimated = 0;
    
    for (const source of sources) {
        const lang = source.language;
        const type = source.type;
        const topics = source.topics || [];
        
        if (!byLanguage[lang]) byLanguage[lang] = { sources: 0, extracted: 0, estimated: 0 };
        byLanguage[lang].sources++;
        
        if (!byType[type]) byType[type] = { sources: 0, extracted: 0, estimated: 0 };
        byType[type].sources++;
        
        for (const topic of topics) {
            if (!byTopic[topic]) byTopic[topic] = { sources: 0, extracted: 0 };
            byTopic[topic].sources++;
        }
        
        const stats = source.content_stats;
        const totalKey = Object.keys(stats).find(k => k.startsWith('total_'));
        const total = totalKey ? stats[totalKey] : 0;
        const extracted = stats.extracted_count || 0;
        
        byLanguage[lang].extracted += extracted;
        byLanguage[lang].estimated += total;
        byType[type].extracted += extracted;
        byType[type].estimated += total;
        totalExtracted += extracted;
        totalEstimated += total;
    }
    
    // Generate markdown
    let md = `# Bronze Datalake Coverage Report\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Total sources | ${sources.length} |\n`;
    md += `| Total extracted | ${totalExtracted} |\n`;
    md += `| Estimated total | ${totalEstimated} |\n`;
    md += `| Overall coverage | ${totalEstimated > 0 ? ((totalExtracted / totalEstimated) * 100).toFixed(1) : 0}% |\n\n`;
    
    md += `## Coverage by Language\n\n`;
    md += `| Language | Sources | Extracted | Estimated | Coverage % |\n|----------|---------|-----------|-----------|------------|\n`;
    for (const [lang, data] of Object.entries(byLanguage).sort()) {
        const pct = data.estimated > 0 ? ((data.extracted / data.estimated) * 100).toFixed(1) : '0';
        md += `| ${lang} | ${data.sources} | ${data.extracted} | ${data.estimated} | ${pct}% |\n`;
    }
    
    md += `\n## Coverage by Type\n\n`;
    md += `| Type | Sources | Extracted | Estimated | Coverage % |\n|------|---------|-----------|-----------|------------|\n`;
    for (const [type, data] of Object.entries(byType).sort()) {
        const pct = data.estimated > 0 ? ((data.extracted / data.estimated) * 100).toFixed(1) : '0';
        md += `| ${type} | ${data.sources} | ${data.extracted} | ${data.estimated} | ${pct}% |\n`;
    }
    
    md += `\n## Coverage by Topic\n\n`;
    md += `| Topic | Sources |\n|-------|----------|\n`;
    for (const [topic, data] of Object.entries(byTopic).sort((a, b) => b[1].sources - a[1].sources)) {
        md += `| ${topic} | ${data.sources} |\n`;
    }
    
    md += `\n## Priority Actions\n\n`;
    md += `1. Fill gaps in languages with 0 sources (ZH, KO, JA)\n`;
    md += `2. Increase extraction % for LOW_COVERAGE sources\n`;
    md += `3. Collect from NEVER_COLLECTED sources\n`;
    md += `4. Refresh STALE sources\n`;
    
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, md);
    
    console.log('Coverage Report Generated');
    console.log(`  Sources: ${sources.length}`);
    console.log(`  Extracted: ${totalExtracted}`);
    console.log(`  Coverage: ${totalEstimated > 0 ? ((totalExtracted / totalEstimated) * 100).toFixed(1) : 0}%`);
}

run();
