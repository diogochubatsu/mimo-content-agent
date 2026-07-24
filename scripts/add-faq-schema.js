#!/usr/bin/env node

/**
 * Add FAQ schema to silver articles
 * Usage: node scripts/add-faq-schema.js
 */

import fs from 'fs';
import path from 'path';

const SILVER_DIR = path.join(process.cwd(), 'content-db', 'silver');

function extractFAQs(content) {
  const faqs = [];
  const faqRegex = /\*\*Q:\s*(.+?)\*\*\s*\n\s*A:\s*(.+)/g;
  let match;
  
  while ((match = faqRegex.exec(content)) !== null) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }
  
  return faqs;
}

function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

function addFAQSchema(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if FAQ schema already exists
  if (content.includes('FAQPage')) {
    return false;
  }
  
  const faqs = extractFAQs(content);
  if (faqs.length === 0) {
    return false;
  }
  
  const schema = generateFAQSchema(faqs);
  const schemaScript = `\n\n<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  
  fs.writeFileSync(filePath, content + schemaScript);
  return true;
}

// Main execution
let updated = 0;

if (fs.existsSync(SILVER_DIR)) {
  const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(SILVER_DIR, file);
    
    if (addFAQSchema(filePath)) {
      console.log(`✓ ${file} - FAQ schema added`);
      updated++;
    }
  }
}

console.log(`\nAdded FAQ schema to ${updated} articles`);
