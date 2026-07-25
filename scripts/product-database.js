#!/usr/bin/env node
/**
 * Product Comparison Database
 * Reads bronze source files and creates a searchable product index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '..', 'content-db', 'raw');
const OUTPUT = path.join(__dirname, '..', 'content-db', 'product-database.json');

function loadSources() {
    const products = [];
    
    function walkDir(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                walkDir(fullPath);
            } else if (file.name.endsWith('.json')) {
                try {
                    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    const items = Array.isArray(data) ? data : (data.items || data.products || data.videos || []);
                    for (const item of items) {
                        if (item && typeof item === 'object' && item.title) {
                            products.push({
                                title: item.title,
                                url: item.url || '',
                                source: file.name.replace('.json', ''),
                                language: (item.language || 'en').toLowerCase(),
                                category: item.category || item.cat_produto || 'general',
                                date: item.date || '',
                                path: path.relative(path.join(__dirname, '..'), fullPath),
                            });
                        }
                    }
                } catch (e) {
                    // skip invalid JSON
                }
            }
        }
    }
    
    walkDir(RAW_DIR);
    return products;
}

function buildIndex(products) {
    const byLanguage = {};
    const byCategory = {};
    const bySource = {};
    
    for (const p of products) {
        byLanguage[p.language] = (byLanguage[p.language] || 0) + 1;
        byCategory[p.category] = (byCategory[p.category] || 0) + 1;
        bySource[p.source] = (bySource[p.source] || 0) + 1;
    }
    
    return {
        total: products.length,
        byLanguage,
        byCategory,
        bySource,
        products,
    };
}

// Run
const products = loadSources();
const db = buildIndex(products);
fs.writeFileSync(OUTPUT, JSON.stringify(db, null, 2));

console.log('Product Database Built:');
console.log('  Total products:', db.total);
console.log('  Languages:', Object.keys(db.byLanguage).join(', '));
console.log('  Categories:', Object.keys(db.byCategory).length);
console.log('  Sources:', Object.keys(db.bySource).length);
