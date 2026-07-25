#!/usr/bin/env node
/**
 * Import Checklist Generator
 * Generates a downloadable import checklist from key topics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECKLIST = {
    title: "Complete Import Checklist — China to Your Country",
    sections: [
        {
            name: "1. Research & Planning",
            items: [
                "Identify target product category",
                "Research market demand (Google Trends, Amazon BSR)",
                "Calculate target landed cost (use our calculator)",
                "Set budget (product + shipping + taxes + agent fees)",
                "Identify 3-5 potential suppliers on 1688 or Alibaba",
            ]
        },
        {
            name: "2. Supplier Verification",
            items: [
                "Check supplier years on platform (min 3 years)",
                "Verify gold/supplier rating (min 4.5/5)",
                "Read recent buyer reviews (last 6 months)",
                "Request business license copy",
                "Verify manufacturing capability (not just trading)",
                "Check response time (under 24h preferred)",
                "Request product photos (not stock photos)",
            ]
        },
        {
            name: "3. Sample & Quality",
            items: [
                "Order samples from top 2-3 suppliers",
                "Compare sample quality vs listing photos",
                "Test product functionality",
                "Check packaging quality",
                "Verify dimensions and weight match listing",
                "Request certifications (CE, FCC, etc.)",
            ]
        },
        {
            name: "4. Pricing & MOQ",
            items: [
                "Negotiate price for bulk order",
                "Clarify MOQ (minimum order quantity)",
                "Confirm price includes packaging",
                "Ask about volume discounts",
                "Get quote for customization/branding",
                "Confirm payment methods accepted",
            ]
        },
        {
            name: "5. Compliance & Legal",
            items: [
                "Check import duties for your country",
                "Verify product certifications required",
                "Ensure labeling compliance (CE, FCC, etc.)",
                "Check restricted/prohibited items list",
                "Understand warranty obligations",
                "Register for import tax ID if required",
            ]
        },
        {
            name: "6. Payment & Protection",
            items: [
                "Use Trade Assurance (Alibaba) or safe payment",
                "Never pay 100% upfront (30-50% deposit is standard)",
                "Get proforma invoice before payment",
                "Keep all communication documented",
                "Use written contracts for large orders",
                "Consider escrow for first orders",
            ]
        },
        {
            name: "7. Shipping & Logistics",
            items: [
                "Choose shipping method (sea/air/rail)",
                "Get quotes from 3+ freight forwarders",
                "Understand Incoterms (FOB, CIF, DDP)",
                "Plan for customs clearance",
                "Arrange product inspection (SGS, Intertek)",
                "Get shipping insurance",
                "Track shipment until delivery",
            ]
        },
        {
            name: "8. Post-Delivery",
            items: [
                "Inspect received goods immediately",
                "Compare to samples ordered",
                "Document any damages/defects",
                "File claims within supplier's time limit",
                "Rate supplier on platform",
                "Plan reorder timing based on sales velocity",
            ]
        },
    ]
};

// Generate markdown
let md = `# ${CHECKLIST.title}\n\n`;
md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;
md += `Print this checklist and check off each item as you complete it.\n\n`;

for (const section of CHECKLIST.sections) {
    md += `## ${section.name}\n\n`;
    for (const item of section.items) {
        md += `- [ ] ${item}\n`;
    }
    md += `\n`;
}

const output = path.join(__dirname, '..', 'content-db', 'import-checklist.md');
fs.writeFileSync(output, md);
console.log(`Import checklist generated: ${CHECKLIST.sections.length} sections, ${CHECKLIST.sections.reduce((a, s) => a + s.items.length, 0)} items`);
console.log('Saved to: content-db/import-checklist.md');
