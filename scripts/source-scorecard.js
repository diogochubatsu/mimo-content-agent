#!/usr/bin/env node
/**
 * Source Scorecard — generates a detailed scorecard for each source
 * Shows authority, freshness, extraction %, content volume, priority
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY = path.join(__dirname, '..', 'content-db', 'raw', 'registry', 'sources-registry.json');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'SOURCE-SCORECARD.md');

function loadRegistry() {
    return JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
}

function scoreSource(source) {
    let score = 0;
    const details = {};

    // Authority (0-25 pts)
    const authScore = { A: 25, B: 15, C: 5 };
    score += authScore[source.authority_score] || 0;
    details.authority = `${source.authority_score} (${authScore[source.authority_score] || 0}/25)`;

    // Priority (0-20 pts)
    const priScore = { critical: 20, high: 15, medium: 10, low: 5 };
    score += priScore[source.collection_priority] || 0;
    details.priority = `${source.collection_priority} (${priScore[source.collection_priority] || 0}/20)`;

    // Extraction (0-30 pts)
    const stats = source.content_stats || {};
    const totalKey = Object.keys(stats).find(k => k.startsWith('total_'));
    const total = totalKey ? stats[totalKey] : 0;
    const extracted = stats.extracted_count || 0;
    const pct = total > 0 ? (extracted / total) * 100 : 0;
    const extractionPts = Math.min(30, Math.round(pct * 0.6));
    score += extractionPts;
    details.extraction = `${extracted}/${total} (${pct.toFixed(1)}%) = ${extractionPts}/30 pts`;

    // Freshness (0-15 pts)
    if (stats.last_extracted) {
        const daysSince = Math.floor((Date.now() - new Date(stats.last_extracted).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince <= 7) { score += 15; details.freshness = `${daysSince}d ago (15/15)`;
        } else if (daysSince <= 30) { score += 10; details.freshness = `${daysSince}d ago (10/15)`;
        } else { score += 5; details.freshness = `${daysSince}d ago (5/15)`;
        }
    } else {
        details.freshness = 'never collected (0/15)';
    }

    // Metadata completeness (0-10 pts)
    const meta = source.metadata_completeness || {};
    const metaFields = ['has_transcripts', 'has_images', 'has_internal_links', 'has_external_links'];
    const metaCount = metaFields.filter(f => meta[f]).length;
    const metaPts = Math.round((metaCount / metaFields.length) * 10);
    score += metaPts;
    details.metadata = `${metaCount}/${metaFields.length} fields (${metaPts}/10)`;

    return { score, details };
}

function run() {
    const registry = loadRegistry();
    const sources = registry.sources || [];

    let md = `# Source Scorecard\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Total sources:** ${sources.length}\n\n`;

    md += `## Score Breakdown\n\n`;
    md += `| Max Points | Category |\n|------------|----------|\n`;
    md += `| 25 | Authority (A/B/C) |\n`;
    md += `| 20 | Priority (critical/high/medium/low) |\n`;
    md += `| 30 | Extraction % |\n`;
    md += `| 15 | Freshness (days since last extraction) |\n`;
    md += `| 10 | Metadata completeness |\n`;
    md += `| **100** | **Total** |\n\n`;

    // Score all sources
    const scored = sources.map(s => ({
        ...s,
        ...scoreSource(s),
    })).sort((a, b) => b.score - a.score);

    md += `## Sources Ranked by Score\n\n`;
    md += `| Rank | Source | Language | Type | Score | Authority | Priority | Extraction | Freshness | Metadata |\n`;
    md += `|------|--------|----------|------|-------|-----------|----------|------------|-----------|----------|\n`;

    for (let i = 0; i < scored.length; i++) {
        const s = scored[i];
        md += `| ${i + 1} | ${s.name} | ${s.language} | ${s.type} | **${s.score}** | ${s.details.authority} | ${s.details.priority} | ${s.details.extraction} | ${s.details.freshness} | ${s.details.metadata} |\n`;
    }

    // Summary
    const avg = scored.reduce((sum, s) => sum + s.score, 0) / scored.length;
    const tier1 = scored.filter(s => s.score >= 60).length;
    const tier2 = scored.filter(s => s.score >= 30 && s.score < 60).length;
    const tier3 = scored.filter(s => s.score < 30).length;

    md += `\n## Summary\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Total sources | ${scored.length} |\n`;
    md += `| Average score | ${avg.toFixed(1)} |\n`;
    md += `| Tier 1 (60+) | ${tier1} sources |\n`;
    md += `| Tier 2 (30-59) | ${tier2} sources |\n`;
    md += `| Tier 3 (<30) | ${tier3} sources |\n\n`;

    md += `## Priority Actions\n\n`;
    const lowScore = scored.filter(s => s.score < 20);
    if (lowScore.length > 0) {
        md += `### Sources needing immediate attention (score <20):\n`;
        for (const s of lowScore) {
            md += `- **${s.name}** (${s.score}) — ${s.language}/${s.type}: ${s.details.extraction}\n`;
        }
        md += '\n';
    }

    const noExtraction = scored.filter(s => s.details.extraction.startsWith('0/'));
    if (noExtraction.length > 0) {
        md += `### Sources never collected (${noExtraction.length}):\n`;
        for (const s of noExtraction.slice(0, 10)) {
            md += `- ${s.name} (${s.language}) — estimated ${s.content_stats?.total_articles_12m || s.content_stats?.total_videos_12m || s.content_stats?.total_posts_12m || 0} items available\n`;
        }
        if (noExtraction.length > 10) md += `- ... and ${noExtraction.length - 10} more\n`;
    }

    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, md);

    console.log('=== Source Scorecard ===');
    console.log(`Sources: ${scored.length}`);
    console.log(`Average score: ${avg.toFixed(1)}/100`);
    console.log(`Tier 1: ${tier1} | Tier 2: ${tier2} | Tier 3: ${tier3}`);
    console.log(`Saved to: ${OUTPUT}`);

    // Also print top 5
    console.log('\nTop 5 sources:');
    for (let i = 0; i < Math.min(5, scored.length); i++) {
        const s = scored[i];
        console.log(`  ${i + 1}. ${s.name} (${s.language}) — ${s.score}/100`);
    }
}

run();
