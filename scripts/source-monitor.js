#!/usr/bin/env node
/**
 * Source Monitor — checks freshness and extraction coverage for all registered sources
 * Reads sources-registry.json and reports stale sources and extraction gaps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY = path.join(__dirname, '..', 'content-db', 'raw', 'registry', 'sources-registry.json');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'monitoring', 'source-monitor-report.json');
const ALERTS_DIR = path.join(__dirname, '..', 'content-db', 'monitoring', 'alerts');

function loadRegistry() {
    if (!fs.existsSync(REGISTRY)) {
        console.error('Registry not found:', REGISTRY);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
}

function checkFreshness(source) {
    const { freshness } = source;
    if (!freshness.last_content_date) return { status: 'UNKNOWN', days: null };
    
    const lastDate = new Date(freshness.last_content_date);
    const now = new Date();
    const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysSince > freshness.stale_threshold_days) {
        return { status: 'STALE', days: daysSince, threshold: freshness.stale_threshold_days };
    }
    return { status: 'FRESH', days: daysSince, threshold: freshness.stale_threshold_days };
}

function checkCoverage(source) {
    const stats = source.content_stats;
    const totalKey = Object.keys(stats).find(k => k.startsWith('total_'));
    const total = totalKey ? stats[totalKey] : 0;
    const extracted = stats.extracted_count || 0;
    const pct = total > 0 ? ((extracted / total) * 100).toFixed(1) : '0';
    
    if (pct < 20) return { status: 'LOW', pct: parseFloat(pct), extracted, total };
    if (pct < 50) return { status: 'MEDIUM', pct: parseFloat(pct), extracted, total };
    return { status: 'GOOD', pct: parseFloat(pct), extracted, total };
}

function run() {
    const registry = loadRegistry();
    const sources = registry.sources || [];
    
    const results = {
        timestamp: new Date().toISOString(),
        total_sources: sources.length,
        by_status: { FRESH: 0, STALE: 0, UNKNOWN: 0 },
        by_coverage: { GOOD: 0, MEDIUM: 0, LOW: 0, NO_DATA: 0 },
        alerts: [],
        sources: [],
    };
    
    for (const source of sources) {
        const freshness = checkFreshness(source);
        const coverage = checkCoverage(source);
        
        results.by_status[freshness.status]++;
        results.by_coverage[coverage.status || 'NO_DATA']++;
        
        const entry = {
            source_id: source.source_id,
            name: source.name,
            language: source.language,
            type: source.type,
            freshness: freshness,
            coverage: coverage,
        };
        
        results.sources.push(entry);
        
        if (freshness.status === 'STALE') {
            results.alerts.push({
                type: 'STALE',
                source: source.source_id,
                message: `${source.name} last content ${freshness.days} days ago (threshold: ${freshness.threshold})`,
            });
        }
        
        if (coverage.status === 'LOW') {
            results.alerts.push({
                type: 'LOW_COVERAGE',
                source: source.source_id,
                message: `${source.name} extraction at ${coverage.pct}% (${coverage.extracted}/${coverage.total})`,
            });
        }
        
        if (!source.content_stats.last_extracted) {
            results.alerts.push({
                type: 'NEVER_COLLECTED',
                source: source.source_id,
                message: `${source.name} has never been collected`,
            });
        }
    }
    
    // Write report
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
    
    // Write alerts
    if (results.alerts.length > 0) {
        fs.mkdirSync(ALERTS_DIR, { recursive: true });
        const alertFile = path.join(ALERTS_DIR, `alerts-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(alertFile, JSON.stringify(results.alerts, null, 2));
    }
    
    // Console output
    console.log('=== Source Monitor Report ===');
    console.log(`Sources: ${results.total_sources}`);
    console.log(`Freshness: ${results.by_status.FRESH} fresh, ${results.by_status.STALE} stale, ${results.by_status.UNKNOWN} unknown`);
    console.log(`Coverage: ${results.by_coverage.GOOD} good, ${results.by_coverage.MEDIUM} medium, ${results.by_coverage.LOW} low`);
    console.log(`Alerts: ${results.alerts.length}`);
    
    for (const alert of results.alerts) {
        console.log(`  [${alert.type}] ${alert.message}`);
    }
    
    return results;
}

run();
