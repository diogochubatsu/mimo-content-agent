#!/usr/bin/env node
/**
 * FAQ Generator — auto-generates FAQ entries from article content
 * Reads H2/H3 headings and content to create Q&A pairs
 * Outputs FAQPage schema and markdown FAQ sections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');

function generateQuestionsFromContent(content, title) {
    const questions = [];
    const lines = content.split('\n');
    
    // Pattern 1: Convert H2/H3 headings into questions
    for (const line of lines) {
        if (line.startsWith('## ') || line.startsWith('### ')) {
            const heading = line.replace(/^#{2,3}\s*/, '').trim();
            if (heading && heading !== 'FAQ' && heading !== 'Table of Contents' && heading !== 'Sources' && heading !== 'Related Guides') {
                const question = headingToQuestion(heading);
                if (question) {
                    // Find the answer in the next few lines
                    const idx = lines.indexOf(line);
                    const answer = extractAnswer(lines, idx + 1);
                    if (answer) {
                        questions.push({ question, answer });
                    }
                }
            }
        }
    }
    
    // Pattern 2: Look for existing FAQ patterns
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^(?:\*\*)?Q[:.]/i)) {
            let q = line.replace(/^(?:\*\*)?Q[:.]\s*/i, '').trim();
            // Get answer
            let a = '';
            for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                if (lines[j].trim().match(/^(?:\*\*)?A[:.]/i)) {
                    a = lines[j].trim().replace(/^(?:\*\*)?A[:.]\s*/i, '').trim();
                    break;
                }
            }
            if (q && a) questions.push({ question: q, answer: a });
        }
    }
    
    // Pattern 3: Generate from title keywords
    const titleKeywords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const commonPrefixes = ['how to', 'what is', 'why', 'when', 'can you', 'is it'];
    const category = detectCategory(title);
    
    if (!questions.some(q => q.question.toLowerCase().includes('how to'))) {
        questions.unshift({
            question: `How to ${title.toLowerCase().replace(/[^\w\s]/g, '')}?`,
            answer: `This guide covers everything you need to know about ${title.toLowerCase()}. Follow the step-by-step instructions in the sections above.`
        });
    }
    
    return questions.slice(0, 7); // Max 7 FAQs
}

function headingToQuestion(heading) {
    const h = heading.toLowerCase();
    
    // Already a question
    if (h.endsWith('?')) return heading;
    
    // Convert declarative headings to questions
    if (h.startsWith('how ')) return heading + '?';
    if (h.startsWith('what ')) return heading + '?';
    if (h.startsWith('why ')) return heading + '?';
    
    // Convert "X Guide" or "X Tutorial" patterns
    if (h.includes('guide') || h.includes('tutorial') || h.includes('overview')) {
        return `What is ${heading.replace(/[-–]?\s*(guide|tutorial|overview)/gi, '').trim().toLowerCase()}?`;
    }
    
    // Convert "X vs Y" patterns
    if (h.includes(' vs ') || h.includes(' versus ')) {
        return `What's the difference between ${heading}?`;
    }
    
    // Convert "Best X" patterns
    if (h.startsWith('best ') || h.startsWith('top ')) {
        return `What are the best ${heading.replace(/^(best|top)\s+/i, '')}?`;
    }
    
    // Convert "X Cost/Price" patterns
    if (h.includes('cost') || h.includes('price') || h.includes('fee')) {
        return `How much does ${heading.toLowerCase().replace(/[-–]?\s*(cost|price|fee).*/gi, '')} cost?`;
    }
    
    // Default: wrap in question
    return `What should you know about ${heading.toLowerCase()}?`;
}

function extractAnswer(lines, startIdx) {
    let answer = '';
    for (let i = startIdx; i < Math.min(startIdx + 10, lines.length); i++) {
        const line = lines[i].trim();
        if (line.startsWith('#')) break;
        if (line && !line.startsWith('|') && !line.startsWith('-')) {
            answer = line.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 200);
            break;
        }
    }
    return answer || null;
}

function detectCategory(title) {
    const lower = title.toLowerCase();
    if (lower.includes('1688') || lower.includes('alibaba')) return 'alibaba-1688';
    if (lower.includes('dropship')) return 'dropshipping';
    if (lower.includes('import')) return 'import-from-china';
    if (lower.includes('product')) return 'product-tips';
    if (lower.includes('money') || lower.includes('make money')) return 'make-money-online';
    return 'general';
}

function generateFAQMarkdown(questions) {
    let md = '\n## Frequently Asked Questions (FAQ)\n\n';
    for (const qa of questions) {
        md += `### ${qa.question}\n\n${qa.answer}\n\n`;
    }
    return md;
}

function generateFAQSchema(questions, url) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map(qa => ({
            "@type": "Question",
            "name": qa.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": qa.answer
            }
        }))
    };
}

function processArticle(file) {
    const filePath = path.join(SILVER_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has FAQ
    if (content.includes('## Frequently Asked Questions') || content.includes('### Q:') || content.includes('FAQ')) {
        return { file, status: 'already has FAQ', questions: 0 };
    }
    
    const titleMatch = content.match(/^title:\s*["']?([^"'\n]+)["']?\s*$/m);
    const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '');
    
    const questions = generateQuestionsFromContent(content, title);
    
    if (questions.length < 3) {
        return { file, status: 'insufficient questions generated', questions: questions.length };
    }
    
    // Generate FAQ markdown
    const faqMd = generateFAQMarkdown(questions);
    
    // Append to article
    const updated = content.trimEnd() + '\n' + faqMd;
    fs.writeFileSync(filePath, updated);
    
    // Generate schema
    const slug = file.replace('.md', '');
    const schema = generateFAQSchema(questions, `https://importguide1688.com/articles/${slug}`);
    
    return { file, status: 'FAQ added', questions: questions.length, schema };
}

function run() {
    const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    
    console.log('=== FAQ Generator ===\n');
    
    let added = 0;
    let skipped = 0;
    let insufficient = 0;
    
    for (const file of files) {
        const result = processArticle(file);
        if (result.status === 'FAQ added') {
            added++;
            console.log(`  ✓ ${result.file}: ${result.questions} Q&A pairs added`);
        } else if (result.status === 'already has FAQ') {
            skipped++;
        } else {
            insufficient++;
        }
    }
    
    console.log(`\nResults:`);
    console.log(`  FAQ added: ${added}`);
    console.log(`  Already has FAQ: ${skipped}`);
    console.log(`  Insufficient questions: ${insufficient}`);
    console.log(`  Total: ${files.length}`);
}

run();
