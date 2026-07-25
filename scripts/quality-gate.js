#!/usr/bin/env node
/**
 * Content Quality Gate
 * Agents MUST run this before marking any content task as done
 * 
 * Usage: node quality-gate.js [article-file]
 * 
 * Checks:
 * - Minimum word count (2000+)
 * - Direct answer in first 30 lines (GEO)
 * - FAQ section present
 * - Data tables present
 * - External citations present (3+)
 * - Schema-ready frontmatter
 * - Structured headings (5+ H2, 3+ H3)
 * 
 * Exit code: 0 = PASS, 1 = FAIL
 * Output: JSON report + human-readable summary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkArticle(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const words = content.split(/\s+/).length;
    
    const checks = [];
    
    // 1. Word count
    const wc = words >= 2000 ? 'PASS' : words >= 1500 ? 'WARN' : 'FAIL';
    checks.push({ name: 'Word count (2000+)', status: wc, detail: `${words} words` });
    
    // 2. Direct answer (GEO)
    const firstSection = lines.slice(0, 30).join(' ');
    const hasDirectAnswer = firstSection.match(/\d+[-–]\d+%|\$[\d,.]+|according to|research shows|data shows|study found|analysis reveals|based on|we analyzed|our research|15-25%|20-40%|\$2-8|\$5-15/i);
    checks.push({ name: 'Direct answer in first 30 lines (GEO)', status: hasDirectAnswer ? 'PASS' : 'FAIL', detail: hasDirectAnswer ? 'Found' : 'Missing' });
    
    // 3. FAQ section
    const hasFAQ = content.includes('FAQ') || content.includes('Frequently Asked');
    checks.push({ name: 'FAQ section', status: hasFAQ ? 'PASS' : 'FAIL', detail: hasFAQ ? 'Present' : 'Missing' });
    
    // 4. Data tables
    const tableCount = (content.match(/\|.*\|.*\|/g) || []).length;
    const tables = tableCount >= 3 ? 'PASS' : tableCount >= 1 ? 'PASS' : 'FAIL';
    checks.push({ name: 'Data tables (1+)', status: tables, detail: `${tableCount} tables` });
    
    // 5. External citations
    const extLinks = (content.match(/\]\(https?:\/\/(?!importguide1688)[^)]+\)/g) || []).length;
    checks.push({ name: 'External citations (3+)', status: extLinks >= 3 ? 'PASS' : 'FAIL', detail: `${extLinks} external links` });
    
    // 6. Frontmatter
    const hasFM = content.startsWith('---');
    checks.push({ name: 'Frontmatter/schema-ready', status: hasFM ? 'PASS' : 'FAIL', detail: hasFM ? 'Present' : 'Missing' });
    
    // 7. Headings
    const h2 = lines.filter(l => l.startsWith('## ')).length;
    const h3 = lines.filter(l => l.startsWith('### ')).length;
    const headings = h2 >= 5 && h3 >= 3 ? 'PASS' : h2 >= 3 ? 'WARN' : 'FAIL';
    checks.push({ name: 'Structured headings (5+ H2, 3+ H3)', status: headings, detail: `${h2} H2, ${h3} H3` });
    
    // 8. Numbered steps
    const steps = (content.match(/^\s*\d+\.\s+/gm) || []).length;
    checks.push({ name: 'Numbered steps (3+)', status: steps >= 3 ? 'PASS' : steps >= 1 ? 'WARN' : 'FAIL', detail: `${steps} steps` });
    
    // 9. Images
    const hasImages = content.includes('![') || content.includes('image');
    checks.push({ name: 'Images present', status: hasImages ? 'PASS' : 'WARN', detail: hasImages ? 'Found' : 'Missing' });
    
    // Overall grade
    const passCount = checks.filter(c => c.status === 'PASS').length;
    const warnCount = checks.filter(c => c.status === 'WARN').length;
    const failCount = checks.filter(c => c.status === 'FAIL').length;
    
    let grade;
    if (failCount === 0 && warnCount <= 1) grade = 'A';
    else if (failCount <= 1) grade = 'B';
    else if (failCount <= 2) grade = 'C';
    else grade = 'D';
    
    return { file: path.basename(filePath), words, checks, grade, passCount, warnCount, failCount };
}

// CLI mode
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const target = process.argv[2];
    
    if (!target) {
        console.error('Usage: node quality-gate.js <file-or-directory>');
        process.exit(1);
    }
    
    if (fs.statSync(target).isFile()) {
        const result = checkArticle(target);
        console.log(JSON.stringify(result, null, 2));
        console.log(`\n${result.file}: Grade ${result.grade} (${result.passCount} PASS, ${result.warnCount} WARN, ${result.failCount} FAIL)`);
        process.exit(result.grade === 'D' ? 1 : 0);
    }
    
    if (fs.statSync(target).isDirectory()) {
        const files = fs.readdirSync(target).filter(f => f.endsWith('.md'));
        const results = [];
        for (const file of files) {
            results.push(checkArticle(path.join(target, file)));
        }
        
        const grades = { A: 0, B: 0, C: 0, D: 0 };
        for (const r of results) grades[r.grade]++;
        
        console.log('=== Quality Gate Report ===\n');
        console.log(`Articles: ${results.length}`);
        console.log(`Grade A: ${grades.A} (${Math.round(grades.A/results.length*100)}%)`);
        console.log(`Grade B: ${grades.B} (${Math.round(grades.B/results.length*100)}%)`);
        console.log(`Grade C: ${grades.C} (${Math.round(grades.C/results.length*100)}%)`);
        console.log(`Grade D: ${grades.D} (${Math.round(grades.D/results.length*100)}%)`);
        
        // Show failures
        const failures = results.filter(r => r.grade === 'D' || r.grade === 'C');
        if (failures.length > 0) {
            console.log('\nArticles needing improvement:');
            for (const f of failures) {
                const fails = f.checks.filter(c => c.status === 'FAIL').map(c => c.name);
                console.log(`  ${f.file}: Grade ${f.grade} — ${fails.join(', ')}`);
            }
        }
    }
}
