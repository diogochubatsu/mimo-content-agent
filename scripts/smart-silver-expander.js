#!/usr/bin/env node
/**
 * Smart Silver Expander — adds topic-specific content to short articles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');

const EXPANSIONS = {
    'import': `\n## Detailed Import Process\n\nImporting from China involves several key steps:\n\n1. **Product Research** — Validate demand using Google Trends, Amazon BSR, TikTok trends\n2. **Supplier Discovery** — Use 1688 (cheapest), Alibaba (safest), or Global Sources (verified)\n3. **Sample Evaluation** — Order 2-3 samples ($10-50 each) before bulk\n4. **Supplier Verification** — Check business license, years on platform, reviews, live video audit\n5. **Negotiation** — Use competitive quotes to negotiate 10-20% price reduction\n6. **Payment** — 30/70 split via Trade Assurance. Never 100% upfront\n7. **Quality Control** — Pre-shipment inspection (SGS/Intertek, $100-300)\n8. **Shipping** — Sea: $2-8/kg (35-45d), Air: $5-15/kg (5-10d), Express: $15-25/kg (3-5d)\n9. **Customs** — Check HTS codes, prepare commercial invoice + packing list\n10. **Quality on Arrival** — Inspect 100% on first order, file claims if needed\n\n### Import Cost Template\n| Cost Component | Percentage |\n|----------------|------------|\n| Product (FOB) | 100% |\n| Shipping | 15-25% |\n| Duties | 0-15% |\n| VAT/Tax | 0-23% |\n| Agent fees | 3-8% |\n| **Total landed** | **130-150%** |\n\n### Common Mistakes\n- Ordering without samples\n- Not verifying supplier legitimacy\n- Ignoring import duties\n- Using unsecured payments\n- Not planning for packaging/labeling\n`,
    'dropship': `\n## Dropshipping Business Model\n\nDropshipping lets you sell without holding inventory — supplier ships directly to customers.\n\n### Profit Margins by Category\n| Category | Wholesale | Retail | Margin |\n|----------|-----------|--------|--------|\n| Phone accessories | $1-5 | $10-25 | 60-80% |\n| LED lighting | $3-15 | $20-60 | 50-70% |\n| Home decor | $5-20 | $25-80 | 50-65% |\n| Beauty tools | $2-10 | $15-40 | 55-75% |\n| Fitness gear | $5-25 | $20-80 | 50-65% |\n\n### Dropshipping vs Traditional Retail\n| Factor | Dropshipping | Traditional |\n|--------|-------------|-------------|\n| Startup cost | $100-500 | $5,000-50,000 |\n| Inventory risk | None | High |\n| Warehouse needed | No | Yes |\n| Shipping | Supplier handles | You handle |\n| Profit margin | 20-50% | 30-60% |\n| Scalability | Easy | Expensive |\n\n### Common Mistakes\n1. Choosing wrong suppliers (always test samples)\n2. Ignoring shipping times (set clear expectations)\n3. No brand building (just copying products)\n4. Underpricing (factor ALL costs)\n5. Not testing products before scaling\n`,
    'product': `\n## Product Research Framework\n\n### Validation Criteria\n- Search volume: 1,000-10,000 monthly searches\n- Competition: <5 Amazon listings with <100 reviews\n- Price: $20-70 retail (healthy margins)\n- Weight: Under 2 lbs for affordable shipping\n- Seasonality: Avoid purely seasonal unless planning ahead\n\n### Research Methods\n1. Amazon BSR analysis (#1000-10000 rank)\n2. Google Trends (stable or growing demand)\n3. TikTok/Instagram (viral product trends)\n4. 1688 trending (Chinese trends precede Western by 2-4 weeks)\n5. Competitor store analysis\n\n### Profitability Formula\nRetail Price: $30\n- Amazon Fees (15%): $4.50\n- FBA Fees: $5.00\n- Product Cost (1688): $3.00\n- Shipping: $1.50\n= Net Profit: $16.00 (53% margin)\n`,
    'payment': `\n## Payment Methods Comparison\n\n| Method | Speed | Cost | Risk | Best For |\n|--------|-------|------|------|----------|\n| Trade Assurance | 3-5 days | Free | Low | Alibaba orders |\n| Alipay | Instant | 1-3% | Medium | 1688 via agent |\n| Wire Transfer | 1-3 days | $15-30 | High | Large orders |\n| PayPal | Instant | 3-4% | Low | Samples/small |\n| Credit Card | Instant | 2-3% | Low | First orders |\n\n### Safety Rules\n- Never pay 100% upfront (30/70 split)\n- Always use Trade Assurance on Alibaba\n- For 1688: use agent or escrow service\n- Keep all payment records for disputes\n- Don't send money to personal accounts\n`,
    'shipping': `\n## Shipping Methods Comparison\n\n| Method | Cost/kg | Time | Best For |\n|--------|---------|------|----------|\n| Sea FCL | $1-2 | 30-45d | 5000+ kg |\n| Sea LCL | $2-5 | 35-50d | 500-5000 kg |\n| Rail | $3-5 | 15-20d | EU destinations |\n| Air | $5-10 | 5-10d | 100-1000 kg |\n| Express | $15-25 | 3-5d | <100 kg |\n| ePacket | $2-5 | 15-30d | <2kg samples |\n\n### Tips\n- Consolidate orders to reduce per-unit shipping cost\n- Use sea freight for first bulk order\n- Air freight for urgent/restock orders\n- Consider FBA Prep for Amazon fulfillment\n- Always get shipping insurance (1-2% of cargo value)\n`,
    'supplier': `\n## Supplier Verification Checklist\n\n- [ ] Business license verified (look for "manufacturing" not "sales")\n- [ ] Years on platform: 3+ years minimum\n- [ ] Transaction history: 100+ completed orders\n- [ ] Buyer reviews: 4.5+ rating with recent reviews\n- [ ] Gold Supplier badge (Alibaba) or Store rating (1688)\n- [ ] Response time: Under 24 hours\n- [ ] Sample ordered and quality verified\n- [ ] Live video audit of factory completed\n- [ ] Payment terms negotiated (30/70 split)\n- [ ] Trade Assurance or escrow payment used\n- [ ] Pre-shipment inspection arranged\n\n### Red Flags\n- No business license or "sales only" scope\n- Refuses live video audit\n- Prices too good to be true\n- No transaction history\n- Poor English communication (for international platforms)\n- Asks for 100% upfront payment\n`,
    'tax': `\n## Import Tax Rates by Category\n\n| Category | US Duty | EU Duty | Brazil II |\n|----------|---------|---------|----------|\n| Electronics | 0-2% | 0% | 0-16% |\n| Clothing | 12-32% | 8-12% | 18-35% |\n| Home & Garden | 0-6% | 2-6% | 14-20% |\n| Toys | 0% | 4.7% | 18% |\n| Automotive | 0-4% | 3-6% | 14-18% |\n| Beauty | 0-5% | 0-3% | 18-25% |\n| General | 2-6% | 2-6% | 14-20% |\n\n### VAT by Country\n- Brazil: 23%\n- EU: 21% (avg)\n- US: 0% (no federal VAT)\n- UK: 20%\n- Japan: 10%\n- Australia: 10%\n`,
};

function detectTopics(content) {
    const lower = content.toLowerCase();
    const topics = [];
    if (lower.includes('1688') || lower.includes('alibaba') || lower.includes('import') || lower.includes('china')) topics.push('import');
    if (lower.includes('dropship')) topics.push('dropship');
    if (lower.includes('product') || lower.includes('trending') || lower.includes('sourcing')) topics.push('product');
    if (lower.includes('payment') || lower.includes('alipay')) topics.push('payment');
    if (lower.includes('shipping') || lower.includes('freight')) topics.push('shipping');
    if (lower.includes('supplier') || lower.includes('verify') || lower.includes('manufacturer')) topics.push('supplier');
    if (lower.includes('tax') || lower.includes('duty') || lower.includes('customs')) topics.push('tax');
    return topics;
}

function run() {
    const files = fs.readdirSync(SILVER_DIR).filter(f => f.endsWith('.md'));
    const short = files.filter(f => fs.readFileSync(path.join(SILVER_DIR, f), 'utf8').split(/\s+/).length < 1500);
    
    console.log(`Found ${short.length} articles under 1500 words`);
    let expanded = 0;
    
    for (const file of short) {
        const filePath = path.join(SILVER_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const topics = detectTopics(content);
        if (topics.length === 0) continue;
        
        const expansion = EXPANSIONS[topics[0]];
        if (!expansion) continue;
        
        const lines = content.split('\n');
        let insertIdx = lines.length;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('FAQ') || lines[i].includes('Sources') || lines[i].includes('References')) {
                insertIdx = i;
                break;
            }
        }
        
        lines.splice(insertIdx, 0, expansion);
        fs.writeFileSync(filePath, lines.join('\n'));
        expanded++;
        if (expanded >= 5) break;
    }
    
    console.log(`Expanded ${expanded} articles with topic-specific content`);
}

run();
