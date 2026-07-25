#!/usr/bin/env node
/**
 * AEO (Answer Engine Optimization) Audit
 * Based on gtm-engineer-skills audit-website-aeo pattern
 * Checks content for AI discoverability: direct answers, structured data, citations, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'aeo-audit-report.md');

function auditArticle(file) {
    const content = fs.readFileSync(path.join(SILVER_DIR, file), 'utf8');
    const lines = content.split('\n');
    const words = content.split(/\s+/).length;
    
    const checks = {};
    let score = 0;
    let maxScore = 0;
    
    // 1. Direct Answer Format (15 pts)
    maxScore += 15;
    const firstParagraph = lines.slice(0, 30).join(' ');
    const hasDirectAnswer = firstParagraph.match(/\d+[-–]\d+%|according to|research shows|data shows|study found|evidence|analysis reveals/i);
    checks['Direct Answer in First 30 Lines'] = hasDirectAnswer ? 'PASS' : 'FAIL';
    if (hasDirectAnswer) score += 15;
    
    // 2. Data Tables (15 pts)
    maxScore += 15;
    const tableCount = (content.match(/\|.*\|.*\|/g) || []).length;
    checks['Data Tables'] = tableCount >= 3 ? 'PASS' : tableCount >= 1 ? 'PARTIAL' : 'FAIL';
    if (tableCount >= 3) score += 15;
    else if (tableCount >= 1) score += 7;
    
    // 3. Source Citations (15 pts)
    maxScore += 15;
    const hasLinks = (content.match(/\[.*\]\(https?:\/\/.*\)/g) || []).length;
    const hasSources = content.includes('Sources') || content.includes('References');
    checks['External Links/Citations'] = hasLinks >= 3 ? 'PASS' : hasLinks >= 1 ? 'PARTIAL' : 'FAIL';
    if (hasLinks >= 3) score += 15;
    else if (hasLinks >= 1) score += 7;
    
    // 4. FAQ Section (15 pts)
    maxScore += 15;
    const hasFAQ = content.includes('FAQ') || content.includes('Frequently Asked');
    checks['FAQ Section'] = hasFAQ ? 'PASS' : 'FAIL';
    if (hasFAQ) score += 15;
    
    // 5. Schema Markup Ready (10 pts)
    maxScore += 10;
    const hasFrontmatter = content.startsWith('---');
    checks['Frontmatter/Schema Ready'] = hasFrontmatter ? 'PASS' : 'FAIL';
    if (hasFrontmatter) score += 10;
    
    // 6. Structured Headings (10 pts)
    maxScore += 10;
    const h2Count = lines.filter(l => l.startsWith('## ')).length;
    const h3Count = lines.filter(l => l.startsWith('### ')).length;
    checks['Structured Headings'] = h2Count >= 5 && h3Count >= 3 ? 'PASS' : h2Count >= 3 ? 'PARTIAL' : 'FAIL';
    if (h2Count >= 5 && h3Count >= 3) score += 10;
    else if (h2Count >= 3) score += 5;
    
    // 7. Word Count (10 pts)
    maxScore += 10;
    checks['Word Count'] = words >= 2000 ? 'PASS' : words >= 1000 ? 'PARTIAL' : 'FAIL';
    if (words >= 2000) score += 10;
    else if (words >= 1000) score += 5;
    
    // 8. Numbered Lists / Steps (10 pts)
    maxScore += 10;
    const hasSteps = content.match(/\d+\.\s+\w/g) || [];
    checks['Numbered Steps'] = hasSteps.length >= 3 ? 'PASS' : hasSteps.length >= 1 ? 'PARTIAL' : 'FAIL';
    if (hasSteps.length >= 3) score += 10;
    else if (hasSteps.length >= 1) score += 5;
    
    // Grade
    const pct = Math.round((score / maxScore) * 100);
    const grade = pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';
    
    return { file, words, score, maxScore, pct, grade, checks };
}

function run() {
    const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    
    console.log('=== AEO Audit ===\n');
    
    const results = [];
    for (const file of files) {
        results.push(auditArticle(file));
    }
    
    // Summary
    const grades = { A: 0, B: 0, C: 0, D: 0 };
    for (const r of results) grades[r.grade]++;
    
    let md = `# AEO Audit Report\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Articles audited:** ${results.length}\n\n`;
    
    md += `## Grade Distribution\n\n`;
    md += `| Grade | Count | % |\n|-------|-------|---|\n`;
    for (const [g, c] of Object.entries(grades)) {
        md += `| ${g} | ${c} | ${Math.round(c/results.length*100)}% |\n`;
    }
    
    md += `\n## Check Summary\n\n`;
    const checkNames = ['Direct Answer in First 30 Lines', 'Data Tables', 'External Links/Citations', 'FAQ Section', 'Frontmatter/Schema Ready', 'Structured Headings', 'Word Count', 'Numbered Steps'];
    
    const checkStats = {};
    for (const name of checkNames) {
        checkStats[name] = { PASS: 0, PARTIAL: 0, FAIL: 0 };
    }
    for (const r of results) {
        for (const [name, status] of Object.entries(r.checks)) {
            if (checkStats[name]) checkStats[name][status]++;
        }
    }
    
    md += `| Check | PASS | PARTIAL | FAIL | Pass Rate |\n|-------|------|---------|------|----------|\n`;
    for (const [name, stats] of Object.entries(checkStats)) {
        const total = stats.PASS + stats.PARTIAL + stats.FAIL;
        const rate = Math.round(stats.PASS / total * 100);
        md += `| ${name} | ${stats.PASS} | ${stats.PARTIAL} | ${stats.FAIL} | ${rate}% |\n`;
    }
    
    md += `\n## Worst Articles (need improvement)\n\n`;
    const worst = results.sort((a, b) => a.pct - b.pct).slice(0, 10);
    md += `| Article | Score | Grade | Key Issues |\n|---------|-------|-------|------------|\n`;
    for (const r of worst) {
        const issues = Object.entries(r.checks).filter(([_, s]) => s === 'FAIL').map(([k]) => k);
        md += `| ${r.file.substring(0, 40)} | ${r.pct}% | ${r.grade} | ${issues.join(', ').substring(0, 50)} |\n`;
    }
    
    md += `\n## Recommendations\n\n`;
    md += `1. **Add direct answers** to first paragraph of articles that fail this check\n`;
    md += `2. **Add FAQ sections** to all articles without one (biggest impact on AI citations)\n`;
    md += `3. **Add data tables** to articles with fewer than 3 tables\n`;
    md += `4. **Add source citations** with external links\n`;
    md += `5. **Ensure frontmatter** on all articles for schema compatibility\n`;
    
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, md);
    
    console.log(`Articles: ${results.length}`);
    console.log(`Grade A: ${grades.A} (${Math.round(grades.A/results.length*100)}%)`);
    console.log(`Grade B: ${grades.B} (${Math.round(grades.B/results.length*100)}%)`);
    console.log(`Grade C: ${grades.C} (${Math.round(grades.C/results.length*100)}%)`);
    console.log(`Grade D: ${grades.D} (${Math.round(grades.D/results.length*100)}%)`);
    console.log(`Saved to: ${OUTPUT}`);
}

run();
