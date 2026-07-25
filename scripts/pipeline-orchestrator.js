#!/usr/bin/env node
/**
 * Pipeline Orchestrator — runs full Bronze datalake pipeline in sequence
 * source-monitor → blog-rss-monitor → keyword-radar → coverage-report
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptsDir = __dirname;

const PIPELINE = [
    { name: 'Source Monitor', script: 'source-monitor.js' },
    { name: 'Blog RSS Monitor', script: 'blog-rss-monitor.js' },
    { name: 'Keyword Radar', script: 'keyword-radar.js', depends: 'blog-rss-monitor.js' },
    { name: 'Coverage Report', script: 'coverage-report.js' },
    { name: 'Product Database', script: 'product-database.js' },
];

async function run() {
    console.log('========================================');
    console.log('  BRONZE DATALAKE PIPELINE');
    console.log(`  ${new Date().toISOString()}`);
    console.log('========================================\n');

    const results = [];
    
    for (const step of PIPELINE) {
        const scriptPath = path.join(scriptsDir, step.script);
        console.log(`\n>>> ${step.name} (${step.script})`);
        console.log('-'.repeat(50));
        
        try {
            const output = execSync(`node "${scriptPath}"`, {
                cwd: path.join(scriptsDir, '..'),
                encoding: 'utf8',
                timeout: 30000,
            });
            console.log(output.trim());
            results.push({ step: step.name, status: 'OK', script: step.script });
        } catch (e) {
            console.log(`FAILED: ${e.message.substring(0, 100)}`);
            results.push({ step: step.name, status: 'FAILED', script: step.script, error: e.message.substring(0, 100) });
        }
    }

    console.log('\n========================================');
    console.log('  PIPELINE SUMMARY');
    console.log('========================================');
    
    const ok = results.filter(r => r.status === 'OK').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    
    for (const r of results) {
        const icon = r.status === 'OK' ? '✓' : '✗';
        console.log(`  ${icon} ${r.step}`);
    }
    
    console.log(`\n  ${ok}/${results.length} steps OK, ${failed} failed`);
    console.log('========================================');
}

run();
