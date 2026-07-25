#!/usr/bin/env node
/**
 * Silver Batch Expander — expands under-2000-word silver articles to 2000+ words
 * Adds comprehensive sections, data tables, FAQ, case studies, and internal links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SILVER_DIR = path.join(__dirname, '..', 'content-db', 'silver');

// Comprehensive expansion templates by topic
const EXPANSIONS = {
    'import': {
        sections: [
            {
                title: '## Complete Import Process Breakdown',
                content: `Importing products from international suppliers involves a systematic 10-step process that, when followed correctly, minimizes risk and maximizes profit margins.

### Step 1: Market Research and Product Validation
Before contacting any supplier, validate market demand using data-driven methods:
- **Google Trends**: Check if search interest is stable or growing (target: 50+ score)
- **Amazon BSR Analysis**: Look for products ranked #1000-#10000 (proven demand, manageable competition)
- **TikTok/Instagram Trends**: Identify viral products 2-4 weeks before they peak
- **1688 Trending**: Chinese domestic trends often precede Western markets by 3-6 weeks

### Step 2: Supplier Discovery and Shortlisting
Use multiple platforms to find and compare suppliers:

| Platform | Price Level | MOQ | Buyer Protection | Best For |
|----------|-------------|-----|------------------|----------|
| 1688 | Cheapest (15-25% below Alibaba) | Low (50+) | Limited (needs agent) | Bulk orders, experienced buyers |
| Alibaba | Mid-range | Medium (100+) | Trade Assurance | International buyers, beginners |
| AliExpress | Budget | None | Basic | Single items, testing |
| Global Sources | Factory-level | High (5000+) | Verified | Large enterprises |

### Step 3: Sample Evaluation Protocol
Always order 2-3 samples ($10-50 each) before committing to bulk:
1. Order from 2-3 different suppliers
2. Test product quality, packaging, and functionality
3. Measure actual weight and dimensions (verify shipping costs)
4. Test with target audience if possible
5. Document differences between samples

### Step 4: Supplier Verification Checklist
- [ ] Business license verified (look for "manufacturing" scope)
- [ ] 3+ years on platform
- [ ] 100+ completed transactions
- [ ] 4.5+ buyer rating
- [ ] Live video audit completed
- [ ] Trade Assurance or escrow available

### Step 5-10: Negotiation, Payment, QC, Shipping, Customs, Receiving
Each step has specific best practices that can make or break your import business. The key is following a rigid operational sequence rather than rushing to place orders.`
            },
            {
                title: '## Import Cost Calculator',
                content: `Understanding total landed cost is critical for maintaining profitable margins. Here is a detailed breakdown:

### Cost Components

| Cost Component | Percentage of FOB | Notes |
|----------------|-------------------|-------|
| Product (FOB price) | 100% | Base cost from supplier |
| Shipping (sea freight) | 15-25% | $2-8/kg depending on volume |
| Import duties | 0-15% | Varies by HS code and country |
| VAT/Tax | 0-23% | Country-specific |
| Agent fees | 3-8% | If using sourcing agent |
| Quality inspection | 1-2% | $100-300 per inspection |
| **Total landed cost** | **130-150%** | **Budget 1.3-1.5x FOB price** |

### Real-World Example
Product: Bluetooth Earbuds
- FOB Price (1688): $1.75/unit
- Shipping (sea, 1000 units): $2.50/unit
- Import duty (2%): $0.04/unit
- Agent fee (5%): $0.09/unit
- **Total landed: $4.38/unit**
- **Amazon selling price: $24.99**
- **Profit margin: 82%**

### Common Cost Mistakes
1. **Ignoring shipping weight** — Always get actual weight, not estimated
2. **Forgetting import duties** — Check HTS codes before ordering
3. **Underestimating packaging** — Custom packaging adds $0.20-1.00/unit
4. **Not accounting for returns** — Budget 5-10% for returns/refunds
5. **Currency fluctuation** — Lock in exchange rates for large orders`
            }
        ],
        faq: [
            { q: 'What is the minimum order quantity (MOQ) for importing from China?', a: 'MOQ varies by supplier and product. On 1688, MOQs are typically 50-100 units. On Alibaba, expect 100-500 units. For custom/OEM orders, MOQs can be 500-5000 units. Always negotiate — many suppliers reduce MOQ for first orders or samples.' },
            { q: 'How long does shipping from China take?', a: 'Sea freight: 35-45 days door-to-door. Air freight: 5-10 days. Express courier (DHL/FedEx): 3-5 days. Rail to Europe: 15-20 days. Transit times vary by destination port and season.' },
            { q: 'What are the biggest risks when importing from China?', a: 'Top 5 risks: (1) Supplier fraud — mitigate with Trade Assurance and samples, (2) Quality issues — mitigate with pre-shipment inspection, (3) Shipping delays — mitigate with buffer time and insurance, (4) Customs issues — mitigate with proper documentation, (5) Currency fluctuations — mitigate with fixed-price contracts.' },
            { q: 'Do I need a business license to import from China?', a: 'For personal use: No. For commercial import: Yes, you need a business entity. In the US, an LLC or corporation is recommended. In the EU, you need an EORI number. In Brazil, you need CNPJ and proper import registration.' },
            { q: 'How do I calculate import duties?', a: 'Import duties depend on: (1) HS code of your product, (2) Country of origin, (3) Destination country. Use your country\'s customs tariff database (e.g., USITC for US, TARIC for EU) to look up the exact duty rate.' },
            { q: 'What payment methods are safest for importing?', a: 'Safest to riskiest: (1) Trade Assurance on Alibaba — free buyer protection, (2) Escrow via agent — funds released after inspection, (3) PayPal — buyer protection but limited for B2B, (4) Credit card — chargeback protection, (5) Wire transfer — no protection, use only with verified suppliers.' },
            { q: 'Can I import without a Chinese sourcing agent?', a: 'Yes, but it is more difficult. You can order directly from Alibaba using Trade Assurance. For 1688 (cheapest prices), you need an agent because the platform is in Chinese and requires Chinese payment methods. Agents charge 3-8% but handle negotiation, QC, and logistics.' },
            { q: 'What documentation do I need for customs clearance?', a: 'Essential documents: Commercial Invoice, Packing List, Bill of Lading/Airway Bill, Certificate of Origin (for preferential duty rates), and any product-specific certifications (CE, FCC, UL). Keep all documents organized — customs delays cost $200-500/day in storage fees.' },
            { q: 'How do I handle product returns from imports?', a: 'For defective products: File claim within 30 days with photos/videos. Use Trade Assurance for Alibaba orders. For ongoing returns: Budget 5-10% of revenue. Consider return address in your country for faster processing. Some suppliers offer replacement rather than refund.' },
            { q: 'What is the best shipping method for first-time importers?', a: 'For first orders: Use air freight for 100-500 units (faster, lower risk, 5-10 days). For sample orders: Express courier like DHL (3-5 days, $15-25/kg). Once you have proven products and steady demand: Switch to sea freight for 30-50% shipping cost savings.' }
        ],
        internalLinks: [
            '/articles/1688-vs-alibaba-comparison',
            '/articles/supplier-verification-checklist',
            '/articles/shipping-from-china-guide',
            '/articles/import-taxes-by-country',
            '/articles/quality-control-inspection'
        ]
    },
    'dropship': {
        sections: [
            {
                title: '## Dropshipping Business Model Deep Dive',
                content: `Dropshipping is a retail fulfillment model where you sell products without holding inventory. When a customer places an order, you purchase from a supplier who ships directly to the customer.

### How Dropshipping Works
1. **You list products** on your store (Shopify, WooCommerce, Amazon)
2. **Customer places order** and pays you retail price
3. **You order from supplier** at wholesale price
4. **Supplier ships directly** to your customer
5. **You keep the margin** (retail - wholesale - fees)

### Profit Margins by Category

| Category | Wholesale Cost | Retail Price | Gross Margin | Net Margin (after fees) |
|----------|---------------|--------------|--------------|------------------------|
| Phone accessories | $1-5 | $10-25 | 60-80% | 40-60% |
| LED lighting | $3-15 | $20-60 | 50-70% | 30-50% |
| Home decor | $5-20 | $25-80 | 50-65% | 30-45% |
| Beauty tools | $2-10 | $15-40 | 55-75% | 35-55% |
| Fitness gear | $5-25 | $20-80 | 50-65% | 30-45% |
| Pet products | $3-15 | $15-50 | 55-70% | 35-50% |

### Dropshipping vs Traditional Retail

| Factor | Dropshipping | Traditional Retail |
|--------|-------------|-------------------|
| Startup cost | $100-500 | $5,000-50,000 |
| Inventory risk | None | High |
| Warehouse needed | No | Yes |
| Shipping | Supplier handles | You handle |
| Profit margin | 20-50% | 30-60% |
| Scalability | Easy | Expensive |
| Time to start | 1-2 weeks | 3-6 months |
| Location independence | Yes | No |

### Pros of Dropshipping
- **Low startup cost** — No inventory investment required
- **No warehouse** — Supplier handles storage and shipping
- **Wide product range** — Test 100+ products without buying stock
- **Location independent** — Run from anywhere with internet
- **Easy to scale** — Add products without operational complexity

### Cons of Dropshipping
- **Lower margins** — Competition drives prices down
- **Supplier dependency** — Quality and shipping out of your control
- **Customer service burden** — You handle all issues despite not shipping
- **Complex returns** — Coordinating returns with suppliers is challenging
- **Brand building harder** — No control over unboxing experience`
            },
            {
                title: '## Step-by-Step Dropshipping Setup Guide',
                content: `### Phase 1: Foundation (Week 1-2)
1. **Choose your niche** — Focus on products with $20-70 retail price, 50%+ margins
2. **Set up your store** — Shopify ($29/mo) or WooCommerce (free + hosting)
3. **Install essential apps** — DSers, Oberlo, or AutoDS for supplier integration
4. **Create brand identity** — Logo, colors, About Us page

### Phase 2: Product Research (Week 2-3)
1. **Use product research tools** — Jungle Scout, Helium 10, or Minea
2. **Analyze competition** — Check Amazon BSR, Shopify store counts
3. **Validate demand** — Google Trends, social media engagement
4. **Order samples** — Test quality before listing

### Phase 3: Launch (Week 3-4)
1. **List 10-20 products** — Start with proven winners
2. **Set up payment processing** — Stripe, PayPal
3. **Configure shipping** — Set clear delivery expectations (7-21 days)
4. **Create policies** — Returns, privacy, terms of service

### Phase 4: Marketing (Week 4+)
1. **Facebook/Instagram Ads** — Start with $5-10/day testing budget
2. **TikTok organic** — Post product demonstrations daily
3. **Google Shopping** — For established products with search volume
4. **Email marketing** — Build list from day one

### Common Dropshipping Mistakes to Avoid
1. **Choosing wrong suppliers** — Always test samples first
2. **Ignoring shipping times** — Set clear customer expectations
3. **No brand building** — Just copying products from AliExpress
4. **Underpricing** — Factor ALL costs (ads, fees, returns)
5. **Not testing products** — Scale only proven winners
6. **Ignoring customer service** — Fast response = higher retention`
            }
        ],
        faq: [
            { q: 'How much money do I need to start dropshipping?', a: 'Minimum startup: $100-300 (domain + Shopify + initial ads). Recommended: $500-1000 (includes samples, better apps, 1 month of ads). Budget breakdown: Shopify $29/mo, domain $12/year, apps $30/mo, ads $300/mo, samples $50-100.' },
            { q: 'Is dropshipping legal?', a: 'Yes, dropshipping is completely legal. It is a legitimate business model used by major retailers. However, you must: (1) Pay taxes on profits, (2) Not sell prohibited items, (3) Comply with consumer protection laws, (4) Handle product liability appropriately.' },
            { q: 'How long does shipping take from China?', a: 'Typical shipping times: ePacket: 15-30 days, AliExpress Standard: 15-25 days, CJ Dropshipping: 7-15 days, AliExpress Premium: 7-12 days. For faster shipping: Use US/EU warehouses (2-5 days) or local suppliers.' },
            { q: 'What are the best dropshipping products in 2026?', a: 'Trending categories: (1) Home automation/smart home gadgets, (2) Pet tech products, (3) Sustainable/eco-friendly products, (4) Health & wellness accessories, (5) Phone accessories with unique features. Avoid: fragile items, oversized products, regulated items.' },
            { q: 'How do I handle customer returns in dropshipping?', a: 'Options: (1) Offer refund without return for items under $20 (cheaper than return shipping), (2) Use supplier return address, (3) Offer store credit instead of refund, (4) Partner with local return centers for faster processing. Budget 5-10% for returns.' },
            { q: 'Can I dropship on Amazon?', a: 'Yes, but with strict rules. Amazon requires: (1) You must be the seller of record, (2) No other retailer names on invoices/packaging, (3) Ship within promised timeframe, (4) Handle customer service. Amazon FBA with dropshipping suppliers is a popular hybrid model.' },
            { q: 'How do I find reliable dropshipping suppliers?', a: 'Best sources: (1) CJ Dropshipping — fast shipping, good quality, (2) Spocket — US/EU suppliers, (3) SaleHoo — vetted supplier directory, (4) 1688 via agent — cheapest prices, (5) Alibaba — for bulk orders. Always order samples and test quality before scaling.' },
            { q: 'What is the average dropshipping profit margin?', a: 'Average margins by model: AliExpress dropshipping: 20-40%, CJ Dropshipping: 30-50%, 1688 via agent: 40-60%, Private label: 50-70%. After accounting for ads (15-25% of revenue), expect net profit of 10-30%.' },
            { q: 'How do I handle customs and taxes in dropshipping?', a: 'For US: Orders under $800 are duty-free (de minimis). For EU: IOSS scheme handles VAT for orders under €150. For other countries: Check local thresholds. Always collect sales tax where required (use TaxJar or similar).' },
            { q: 'What platform is best for dropshipping?', a: 'Shopify: Best overall (easy setup, huge app ecosystem). WooCommerce: Best for budget (free, but requires hosting). Amazon: Best for traffic (built-in customers, but strict rules). TikTok Shop: Best for viral products (social commerce integration).' }
        ],
        internalLinks: [
            '/articles/supplier-verification-checklist',
            '/articles/shipping-from-china-guide',
            '/articles/import-taxes-by-country',
            '/articles/product-research-guide',
            '/articles/facebook-ads-guide'
        ]
    },
    'product': {
        sections: [
            {
                title: '## Product Research Framework',
                content: `Successful product research combines data analysis with market intuition. Use this systematic framework to identify winning products.

### Validation Criteria
- **Search volume**: 1,000-10,000 monthly searches (proven demand)
- **Competition**: <5 Amazon listings with <100 reviews
- **Price point**: $20-70 retail (healthy margins after fees)
- **Weight**: Under 2 lbs for affordable shipping
- **Seasonality**: Avoid purely seasonal unless planning ahead

### Research Methods
1. **Amazon BSR Analysis** — Products ranked #1000-#10000 have proven demand
2. **Google Trends** — Stable or growing demand over 12+ months
3. **TikTok/Instagram** — Viral product trends (2-4 week lead time)
4. **1688 Trending** — Chinese trends precede Western by 2-4 weeks
5. **Competitor Store Analysis** — See what successful stores are selling

### Product Scoring Matrix

| Criterion | Weight | Score (1-10) | Weighted Score |
|-----------|--------|--------------|----------------|
| Demand (search volume) | 25% | ? | ? |
| Competition level | 20% | ? | ? |
| Profit margin potential | 20% | ? | ? |
| Shipping feasibility | 15% | ? | ? |
| Trend stability | 10% | ? | ? |
| Supplier availability | 10% | ? | ? |
| **Total** | **100%** | | **?/10** |

### Profitability Formula
Retail Price: $30
- Amazon Fees (15%): $4.50
- FBA Fees: $5.00
- Product Cost (1688): $3.00
- Shipping: $1.50
- **Net Profit: $16.00 (53% margin)**

### Red Flags to Avoid
- Products with <20% margin after all fees
- Items weighing >5 lbs (expensive shipping)
- Regulated products (electronics, supplements, toys)
- Fragile items (high damage/return rates)
- Trending products past their peak`
            },
            {
                title: '## Niche Selection Strategy',
                content: `Choosing the right niche is more important than choosing the right product. A good niche has passionate buyers, recurring purchases, and room for branding.

### High-Performing Niches for 2026

| Niche | Avg. Order Value | Repeat Purchase Rate | Competition Level |
|-------|-----------------|---------------------|-------------------|
| Pet tech gadgets | $25-60 | High (accessories) | Medium |
| Home automation | $30-100 | Medium | Low-Medium |
| Fitness accessories | $15-50 | High (consumables) | Medium |
| Beauty tools | $20-80 | Medium | High |
| Kitchen gadgets | $15-40 | Medium | Medium |
| Phone accessories | $10-30 | High (cases, chargers) | High |

### Niche Evaluation Checklist
- [ ] Passionate audience willing to spend money
- [ ] Multiple product extensions possible
- [ ] Not dominated by major brands
- [ ] Good affiliate/commission potential
- [ ] Content creation opportunities (blog, social)
- [ ] Seasonal stability (not purely holiday-dependent)

### Building a Niche Store vs General Store
**Niche Store Pros**: Higher conversion rates, better branding, easier marketing, loyal customers
**Niche Store Cons**: Limited product range, dependent on one market
**General Store Pros**: Wider audience, more testing opportunities, diversified risk
**General Store Cons**: Lower conversion, harder to brand, scattered marketing`
            }
        ],
        faq: [
            { q: 'How do I find winning products to sell?', a: 'Use this 5-step process: (1) Check Amazon BSR for products ranked #1000-#10000, (2) Analyze Google Trends for stable/growing demand, (3) Browse TikTok for viral products, (4) Check 1688 trending for Chinese market leads, (5) Validate with Jungle Scout or Helium 10 data.' },
            { q: 'What is a good profit margin for dropshipping?', a: 'Target 40-60% gross margin minimum. After accounting for ads (15-25%), platform fees (5-15%), and returns (5-10%), aim for 15-30% net profit. Products under $20 retail are hard to profit from due to fixed costs.' },
            { q: 'How many products should I start with?', a: 'Start with 10-20 products in your niche. This gives enough variety for testing while keeping management simple. After 2-4 weeks, cut underperformers and scale winners. Most successful stores have 50-200 products after 6 months.' },
            { q: 'Should I sell trending or evergreen products?', a: 'For beginners: Start with evergreen products (steady demand year-round). For experienced sellers: Trending products offer higher volume but shorter windows. Best strategy: Mix 70% evergreen + 30% trending for stability + growth.' },
            { q: 'How do I validate a product idea before investing?', a: 'Validation steps: (1) Create a landing page and drive $50 in ads, (2) Run a pre-order campaign, (3) List on eBay/Facebook Marketplace first, (4) Order 5-10 samples and sell locally, (5) Survey your target audience. Don\'t invest heavily until you have proven demand.' },
            { q: 'What tools help with product research?', a: 'Top tools: Jungle Scout ($49/mo) — Amazon product data, Helium 10 ($39/mo) — keyword research + product tracking, Minea ($49/mo) — ad spy tool, Google Trends (free) — search trend analysis, 1688 Trending (free) — Chinese market data.' },
            { q: 'How do I calculate true product profitability?', a: 'Formula: Retail Price - (Product Cost + Shipping + Platform Fees + Ad Cost + Returns Buffer) = Net Profit. Example: $30 - ($3 + $1.50 + $5 + $4.50 + $1.50) = $14.50 net (48% margin). Always include ALL costs.' },
            { q: 'What are the best niches for beginners?', a: 'Best beginner niches: (1) Home organization — simple products, clear use case, (2) Pet accessories — passionate buyers, repeat purchases, (3) Phone cases — low cost, high margin, easy to ship, (4) Kitchen gadgets — viral potential, broad audience, (5) Fitness accessories — growing market, loyal buyers.' },
            { q: 'How do I know if competition is too high?', a: 'Signs of oversaturated market: (1) Top 10 Amazon listings all have 1000+ reviews, (2) Multiple established Shopify stores, (3) CPC for keywords >$2.00, (4) Major brands dominating, (5) Margins below 30%. Look for niches with 3-5 competitors, not 50+.' },
            { q: 'Should I use private label or generic products?', a: 'Generic (dropshipping): Lower risk, faster to start, but no branding. Private label: Higher margins long-term, brand building, but requires MOQ and investment. Recommendation: Start with generic to validate, then private label your winning products.' }
        ],
        internalLinks: [
            '/articles/supplier-verification-checklist',
            '/articles/dropshipping-complete-guide',
            '/articles/shipping-from-china-guide',
            '/articles/amazon-fba-guide',
            '/articles/private-label-guide'
        ]
    },
    'supplier': {
        sections: [
            {
                title: '## Supplier Verification Deep Dive',
                content: `Verifying suppliers is the most critical step in the import process. 73% of first-time importers lose money due to supplier issues. Follow this comprehensive verification protocol.

### Platform-Specific Verification

#### Alibaba Verification
1. **Gold Supplier Badge** — Paid membership, verified manufacturer
2. **Trade Assurance** — Up to $50,000 buyer protection
3. **Verified Manufacturer** — Third-party factory audit completed
4. **Response Time** — Under 24 hours indicates active business
5. **Transaction History** — 100+ completed orders minimum

#### 1688 Verification
1. **Store Rating** — 4.5+ stars with 100+ reviews
2. **Business License** — Verify "manufacturing" scope
3. **Years on Platform** — 3+ years minimum
4. **Live Video Audit** — Demand real-time factory walkthrough
5. **Agent Verification** — Use trusted agent for factory visits

### Supplier Red Flags
- No business license or "sales only" scope
- Refuses live video audit
- Prices too good to be true (below manufacturing cost)
- No transaction history or reviews
- Poor communication (for international platforms)
- Asks for 100% upfront payment
- No physical address or factory
- Pushes for Western Union payment

### Supplier Evaluation Scorecard

| Criterion | Weight | Score (1-10) |
|-----------|--------|--------------|
| Years in business | 15% | ? |
| Transaction history | 20% | ? |
| Buyer reviews | 20% | ? |
| Response time | 10% | ? |
| Sample quality | 25% | ? |
| Communication | 10% | ? |
| **Total** | **100%** | **?/10** |

### Building Long-Term Supplier Relationships
- Start small and scale gradually
- Pay on time consistently
- Provide clear specifications and feedback
- Visit factories when possible
- Build personal relationships (WeChat, visits)
- Offer exclusivity for better pricing`
            },
            {
                title: '## Negotiation Tactics with Chinese Suppliers',
                content: `Negotiation is expected in Chinese business culture. Here are proven tactics to get the best prices.

### Negotiation Principles
1. **Never accept the first price** — Initial quotes are 10-30% above final price
2. **Use competition** — Get 3-5 quotes and play suppliers against each other
3. **Volume commitment** — Promise future orders for current discounts
4. **Relationship building** — Personal connection leads to better deals
5. **Timing** — End of month/quarter, suppliers may offer discounts for targets

### Price Reduction Tactics

| Tactic | Expected Savings | Difficulty |
|--------|-----------------|------------|
| Volume discount (100+ units) | 10-20% | Easy |
| Long-term contract | 15-25% | Medium |
| Competitive quotes | 5-15% | Easy |
| Off-season ordering | 10-20% | Medium |
| Cash payment | 3-5% | Easy |
| Reduced packaging | 2-5% | Easy |

### Sample Negotiation Script
"Thank you for the quote of $5/unit. I've received quotes from 3 other suppliers at $3.50-4.00/unit. I prefer working with you because of your good reviews. Can you match $4.00/unit for an order of 500 units? I'm planning to order 2000 units next month if this first order goes well."

### What to Negotiate Beyond Price
- MOQ reduction for first orders
- Payment terms (30/70 instead of 100% upfront)
- Free samples or sample cost credit
- Custom packaging inclusion
- Quality inspection arrangements
- Shipping terms (FOB vs CIF)
- Warranty period extension`
            }
        ],
        faq: [
            { q: 'How do I verify a Chinese supplier is legitimate?', a: 'Verification steps: (1) Check business license on Tianyancha or Qichacha, (2) Verify Gold Supplier badge on Alibaba, (3) Request live video factory audit, (4) Order samples to test quality, (5) Check transaction history and buyer reviews, (6) Use third-party verification services like SGS or Bureau Veritas.' },
            { q: 'What is the difference between a manufacturer and a trading company?', a: 'Manufacturer: Owns the factory, direct production control, better prices, but may have higher MOQ. Trading Company: Middleman, lower MOQ, more product variety, but higher prices. For volume orders: Choose manufacturer. For small orders or variety: Trading company is fine.' },
            { q: 'How do I find manufacturers on 1688?', a: 'Steps: (1) Search product keywords, (2) Filter by "实力商家" (verified merchant), (3) Check "源头工厂" (source factory) badge, (4) Verify business license shows manufacturing scope, (5) Use an agent for factory verification and communication.' },
            { q: 'What payment methods do Chinese suppliers accept?', a: 'Common methods: Trade Assurance (Alibaba) — safest, T/T wire transfer — standard for larger orders, Alipay — for 1688 via agent, PayPal — for samples/small orders, L/C — for large orders ($10K+), Western Union — avoid (no buyer protection).' },
            { q: 'How do I protect myself from supplier fraud?', a: 'Protection methods: (1) Use Trade Assurance or escrow, (2) Never pay 100% upfront (30/70 split), (3) Order samples first, (4) Get factory verification, (5) Use detailed purchase agreements, (6) Document everything in writing, (7) Start with small orders.' },
            { q: 'What is the typical MOQ for Chinese suppliers?', a: 'MOQ varies: Stock products on 1688: 1-50 units, Alibaba suppliers: 50-500 units, Custom/OEM orders: 500-5000 units, Private label: 100-1000 units. MOQ is negotiable — always ask for lower MOQ on first orders.' },
            { q: 'How do I handle quality issues with suppliers?', a: 'Steps: (1) Document issues with photos/videos immediately, (2) Contact supplier within 7 days, (3) Provide clear evidence of defects, (4) Request replacement or refund, (5) Use Trade Assurance for dispute resolution, (6) Leave honest review to protect other buyers.' },
            { q: 'Should I use a sourcing agent?', a: 'Use an agent if: (1) You buy from 1688 (Chinese platform), (2) You need factory visits, (3) You want QC inspection, (4) You don\'t speak Chinese. Skip the agent if: (1) Buying from Alibaba with Trade Assurance, (2) Small orders, (3) You have Chinese language skills.' },
            { q: 'How do I negotiate lower prices with suppliers?', a: 'Tactics: (1) Get 3-5 competing quotes, (2) Order larger quantities for volume discounts, (3) Commit to long-term partnership, (4) Order during off-peak seasons, (5) Pay via T/T instead of credit card (saves 2-3%), (6) Simplify packaging to reduce costs.' },
            { q: 'What certifications should I require from suppliers?', a: 'Required certifications: CE (Europe), FCC (US), RoHS (EU hazardous materials), REACH (EU chemical safety), UL (US safety), ISO 9001 (quality management). Always request copies of certificates and verify them independently.' }
        ],
        internalLinks: [
            '/articles/1688-vs-alibaba-comparison',
            '/articles/shipping-from-china-guide',
            '/articles/quality-control-inspection',
            '/articles/private-label-guide',
            '/articles/yiwu-market-guide'
        ]
    },
    'shipping': {
        sections: [
            {
                title: '## Shipping Methods Complete Comparison',
                content: `Choosing the right shipping method balances cost, speed, and reliability. Here is a comprehensive comparison:

### Shipping Method Comparison Table

| Method | Cost/kg | Transit Time | Best For | Capacity |
|--------|---------|-------------|----------|----------|
| Sea FCL (Full Container) | $1-2 | 30-45 days | 5000+ kg | 20-40 tons |
| Sea LCL (Less Container) | $2-5 | 35-50 days | 500-5000 kg | 1-20 tons |
| Rail (China-Europe) | $3-5 | 15-20 days | EU destinations | 500-5000 kg |
| Air Freight | $5-10 | 5-10 days | 100-1000 kg | 100-5000 kg |
| Express (DHL/FedEx) | $15-25 | 3-5 days | <100 kg | 1-100 kg |
| ePacket | $2-5 | 15-30 days | <2kg samples | 1-2 kg |

### When to Use Each Method
- **Sea FCL**: Large orders (5000+ kg), not time-sensitive, best per-unit cost
- **Sea LCL**: Medium orders (500-5000 kg), cost-effective, flexible
- **Rail**: EU destinations, faster than sea, cheaper than air
- **Air Freight**: Urgent orders, high-value products, time-sensitive launches
- **Express**: Samples, small orders, urgent restocks
- **ePacket**: Dropshipping samples, testing products

### Shipping Cost Calculator

#### Example: 1000 units of Bluetooth Earbuds (50g each = 50kg total)
| Method | Cost | Total Cost | Per Unit | Transit |
|--------|------|-----------|----------|---------|
| Sea LCL | $3/kg | $150 | $0.15 | 35-50 days |
| Air | $7/kg | $350 | $0.35 | 5-10 days |
| Express | $20/kg | $1,000 | $1.00 | 3-5 days |

### Shipping Tips
- Consolidate orders to reduce per-unit shipping cost
- Use sea freight for first bulk order (lower risk)
- Air freight for urgent restock orders
- Consider FBA Prep for Amazon fulfillment
- Always get shipping insurance (1-2% of cargo value)
- Track shipments and coordinate customs clearance in advance`
            },
            {
                title: '## Customs Clearance Guide',
                content: `Customs clearance is often the most confusing part of importing. Here is a step-by-step guide:

### Required Documents
1. **Commercial Invoice** — Itemized list of products with values
2. **Packing List** — Contents, weights, and dimensions of each package
3. **Bill of Lading (sea) or Airway Bill (air)** — Shipping contract
4. **Certificate of Origin** — For preferential duty rates
5. **Product Certifications** — CE, FCC, UL as required

### Customs Clearance Process
1. **Pre-clearance** — Submit documents to customs broker before arrival
2. **Duty assessment** — Customs calculates duties based on HS codes
3. **Payment** — Pay duties, taxes, and fees
4. **Inspection** — Customs may inspect shipment (1-5% of shipments)
5. **Release** — Shipment released for delivery

### Common Customs Issues and Solutions
| Issue | Cause | Solution | Cost of Delay |
|-------|-------|----------|---------------|
| Documentation error | Incorrect values | Double-check all docs | $200-500/day |
| Wrong HS code | Misclassified product | Verify HS code before shipping | Re-assessment + penalties |
| Missing certifications | No CE/FCC docs | Prepare certifications upfront | Shipment held |
| Value underdeclared | Trying to avoid duties | Always declare true value | Fines + seizure |
| Prohibited items | Restricted products | Check import regulations beforehand | Seizure + fines |

### Tips for Smooth Customs Clearance
- Use a customs broker for first few shipments
- Keep all documentation organized and accessible
- Declare accurate values (underdeclaring risks fines)
- Verify HS codes before shipping
- Build relationship with customs broker for faster processing`
            }
        ],
        faq: [
            { q: 'What is the cheapest way to ship from China?', a: 'Sea freight is cheapest at $1-5/kg with 30-45 day transit. For smaller orders, ePacket costs $2-5/kg for items under 2kg. Rail to Europe is $3-5/kg with 15-20 day transit. Always compare FOB vs CIF pricing with your supplier.' },
            { q: 'How do I calculate shipping costs?', a: 'Formula: (Actual weight or volumetric weight, whichever is higher) × rate per kg. Volumetric weight = (L × W × H in cm) / 5000 for air, /6000 for sea. Example: Box 40×30×20cm = 4.8 kg volumetric. If actual weight is 3kg, charge is based on 4.8kg.' },
            { q: 'What is FOB and CIF pricing?', a: 'FOB (Free On Board): Price includes product + delivery to port of origin. You pay for shipping from there. CIF (Cost, Insurance, Freight): Price includes product + shipping + insurance to destination port. FOB is more common and gives you control over shipping.' },
            { q: 'How do I handle customs duties?', a: 'Steps: (1) Determine HS code for your product, (2) Look up duty rate in destination country, (3) Calculate duties: Product value × duty rate, (4) Add VAT/GST if applicable, (5) Pay via customs broker or directly. Budget 10-25% of product value for duties + taxes.' },
            { q: 'What is a customs broker and do I need one?', a: 'A customs broker handles documentation, duty calculation, and clearance with customs authorities. You need one if: (1) First time importing, (2) Large shipments, (3) Complex products requiring certifications. Cost: $100-300 per shipment. Worth it for peace of mind.' },
            { q: 'How long does customs clearance take?', a: 'Typical timeline: Normal clearance: 1-3 days, With inspection: 3-7 days, Document issues: 7-14 days, Complex products: 2-4 weeks. Tip: Submit documents 3-5 days before shipment arrives to speed up clearance.' },
            { q: 'What HS code should I use for my product?', a: 'HS codes are 6-10 digit classifications. Find yours: (1) Search your product on your country\'s tariff database (USITC, TARIC), (2) Check similar products on Amazon, (3) Ask your supplier for the Chinese export HS code, (4) Consult your customs broker. Wrong codes = penalties.' },
            { q: 'Can I ship directly to Amazon FBA from China?', a: 'Yes, but with requirements: (1) Use Amazon\'s freight forwarding partner or your own, (2) Products must be labeled with FNSKU, (3) Packaging must meet Amazon requirements, (4) Provide commercial invoice with Amazon as consignee. Many sellers use prep centers in China.' },
            { q: 'What happens if my shipment is held at customs?', a: 'If held: (1) Contact your customs broker immediately, (2) Provide any requested documents, (3) Pay any additional duties/fees, (4) Wait for inspection if required. Typical resolution: 3-7 days. If you don\'t respond, shipment may be returned or destroyed after 30-90 days.' },
            { q: 'Do I need insurance for international shipping?', a: 'Highly recommended. Shipping insurance costs 1-2% of cargo value and covers: (1) Damage during transit, (2) Loss or theft, (3) Natural disasters. For orders over $1000, insurance is essential. Many freight forwarders offer built-in insurance options.' }
        ],
        internalLinks: [
            '/articles/import-taxes-by-country',
            '/articles/1688-vs-alibaba-comparison',
            '/articles/supplier-verification-checklist',
            '/articles/amazon-fba-guide',
            '/articles/shipping-sea-vs-air'
        ]
    },
    'tax': {
        sections: [
            {
                title: '## Import Tax Rates by Country',
                content: `Import duties and taxes vary significantly by country and product category. Here is a comprehensive comparison:

### Duty Rates by Product Category

| Category | US Duty | EU Duty | Brazil II | UK Duty | Japan Duty |
|----------|---------|---------|-----------|---------|------------|
| Electronics | 0-2% | 0% | 0-16% | 0% | 0% |
| Clothing | 12-32% | 8-12% | 18-35% | 12% | 10-20% |
| Home & Garden | 0-6% | 2-6% | 14-20% | 2-6% | 0-5% |
| Toys | 0% | 4.7% | 18% | 4.7% | 0% |
| Automotive | 0-4% | 3-6% | 14-18% | 3-6% | 0% |
| Beauty | 0-5% | 0-3% | 18-25% | 0-3% | 5-10% |
| General | 2-6% | 2-6% | 14-20% | 2-6% | 0-5% |

### VAT/GST Rates by Country

| Country | VAT/GST Rate | Threshold |
|---------|-------------|-----------|
| Brazil | 23% (ICMS) + others | None |
| EU | 21% (avg) | €150 (IOSS) |
| US | 0% (no federal) | N/A |
| UK | 20% | £135 |
| Japan | 10% | ¥200,000 |
| Australia | 10% (GST) | AUD 1,000 |
| Canada | 5-15% (GST/HST) | CAD 40 |

### Total Landed Cost Examples

#### Example: $1000 electronics order to US
| Component | Amount |
|-----------|--------|
| Product (FOB) | $1,000 |
| Shipping (air) | $150 |
| Duty (2%) | $20 |
| VAT (0%) | $0 |
| Agent fee (5%) | $50 |
| **Total** | **$1,220 (22% above FOB)** |

#### Example: $1000 electronics order to Brazil
| Component | Amount |
|-----------|--------|
| Product (FOB) | $1,000 |
| Shipping (sea) | $200 |
| II (0-16%) | $160 |
| IPI (5%) | $50 |
| PIS/COFINS (9.25%) | $92.50 |
| ICMS (18%) | $180 |
| **Total** | **$1,682.50 (68% above FOB)** |`
            },
            {
                title: '## Tax Optimization Strategies',
                content: `Legal ways to reduce your import tax burden:

### 1. Use Correct HS Codes
Many products have multiple possible HS codes with different duty rates. Ensure your product is classified correctly — not over-classified.

### 2. Free Trade Agreements
Check if your origin country has FTAs with the destination:
- US: USMCA (Canada, Mexico), various bilateral agreements
- EU: Extensive FTA network (South Korea, Japan, etc.)
- China: RCEP (Asia-Pacific), bilateral agreements

### 3. De Minimis Thresholds
Many countries have duty-free thresholds for small shipments:
- US: $800
- EU: €150 (for commercial imports)
- UK: £135
- Australia: AUD 1,000

### 4. Special Economic Zones
Import into free trade zones for duty deferral:
- UAE: Jebel Ali Free Zone
- Singapore: Free Trade Zones
- China: Shanghai Free Trade Zone

### 5. Temporary Import
For samples, exhibitions, or testing:
- ATA Carnet allows duty-free temporary import
- Useful for trade shows and product testing

### 6. Bonded Warehouse
Store goods without paying duties until sold:
- Reduces upfront cash requirements
- Useful for testing market before committing`
            }
        ],
        faq: [
            { q: 'What are import duties and how are they calculated?', a: 'Import duties are taxes on imported goods, calculated as a percentage of the CIF value (Cost + Insurance + Freight). Formula: Duty = CIF Value × Duty Rate. The duty rate depends on: (1) Product HS code, (2) Country of origin, (3) Destination country tariff schedule.' },
            { q: 'Do I have to pay VAT on imports?', a: 'Yes, most countries charge VAT/GST on imports. In the EU, you pay import VAT (21% avg) plus customs duty. In Brazil, you pay ICMS (18-25%) plus other taxes. In the US, there is no federal VAT. Some countries offer VAT recovery for businesses.' },
            { q: 'What is the de minimis threshold?', a: 'The de minimis threshold is the value below which no import duties are charged. US: $800, EU: €150, UK: £135. Shipments under these values enter duty-free. This is why many dropshippers split orders to stay under thresholds.' },
            { q: 'How do I find the HS code for my product?', a: 'Methods: (1) Search your country\'s tariff database (USITC for US, TARIC for EU), (2) Check similar products on Amazon, (3) Ask your supplier for the Chinese export code, (4) Use HS code lookup tools online, (5) Consult your customs broker for complex products.' },
            { q: 'Can I claim back import VAT?', a: 'In the EU: Yes, businesses can reclaim import VAT through their VAT return. In the UK: Yes, through VAT reclaim. In the US: No federal VAT system. In Brazil: Limited recovery through credits. Keep all import documents for VAT recovery claims.' },
            { q: 'What happens if I underdeclare the value of goods?', a: 'Underdeclaring is illegal and risky: (1) Customs can seize your shipment, (2) You face fines of 2-4x the unpaid duties, (3) Your supplier may be flagged, (4) You could face criminal charges for large amounts. Always declare true value.' },
            { q: 'Do I need to register for import duties?', a: 'For commercial imports: Yes, you typically need an importer of record number (EORI in EU, Importer Number in US). For personal imports under de minimis: No registration needed. For regular business imports: Register with customs authority in your country.' },
            { q: 'How do I calculate total landed cost including taxes?', a: 'Formula: Product Cost + Shipping + Insurance + Customs Duty + VAT/GST + Agent Fees + Inspection = Total Landed Cost. Example: $100 product + $15 shipping + $2 duty + $21 VAT + $5 agent = $143 total (43% above product cost).' },
            { q: 'Are there duty-free import options?', a: 'Options: (1) De minimis thresholds (ship under $800 in US), (2) Free trade zones, (3) Temporary import (ATA Carnet), (4) Re-export programs, (5) Certain product categories (some electronics, medical devices). Always verify eligibility.' },
            { q: 'What documentation do I need for customs?', a: 'Essential documents: Commercial Invoice (with CIF value), Packing List, Bill of Lading/Airway Bill, Certificate of Origin, Product Certifications (CE/FCC), Import Declaration Form, EORI/Importer Number. Keep all documents for 5+ years for audits.' }
        ],
        internalLinks: [
            '/articles/import-china-guide',
            '/articles/shipping-from-china',
            '/articles/supplier-verification',
            '/articles/amazon-fba-guide',
            '/articles/dropshipping-complete-guide'
        ]
    }
};

function detectTopic(content) {
    const lower = content.toLowerCase();
    if (lower.includes('1688') || lower.includes('alibaba') || lower.includes('import') || lower.includes('china')) return 'import';
    if (lower.includes('dropship')) return 'dropship';
    if (lower.includes('product') || lower.includes('trending') || lower.includes('sourcing') || lower.includes('niche')) return 'product';
    if (lower.includes('supplier') || lower.includes('verify') || lower.includes('manufacturer') || lower.includes('agent')) return 'supplier';
    if (lower.includes('shipping') || lower.includes('freight') || lower.includes('customs')) return 'shipping';
    if (lower.includes('tax') || lower.includes('duty') || lower.includes('duties') || lower.includes('vat')) return 'tax';
    return 'import'; // default
}

function expandArticle(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount >= 2000) {
        return { expanded: false, reason: 'already 2000+ words' };
    }
    
    const topic = detectTopic(content);
    const expansion = EXPANSIONS[topic];
    
    if (!expansion) {
        return { expanded: false, reason: 'no expansion template for topic' };
    }
    
    // Find insertion point (before FAQ or Sources)
    const lines = content.split('\n');
    let insertIdx = lines.length;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^## (FAQ|Frequently Asked|Sources|References|Related)/i)) {
            insertIdx = i;
            break;
        }
    }
    
    // Build expansion content
    let expansionContent = '\n\n';
    
    // Add new sections
    for (const section of expansion.sections) {
        expansionContent += section.title + '\n\n';
        expansionContent += section.content + '\n\n';
    }
    
    // Insert expansion
    lines.splice(insertIdx, 0, expansionContent);
    
    // Check if FAQ exists, if not add it
    const hasFAQ = lines.some(l => l.match(/^## (FAQ|Frequently Asked)/i));
    if (!hasFAQ && expansion.faq) {
        let faqContent = '\n## Frequently Asked Questions (FAQ)\n\n';
        for (const faq of expansion.faq) {
            faqContent += `### ${faq.q}\n${faq.a}\n\n`;
        }
        
        // Find insertion point for FAQ (before Sources or end)
        let faqInsertIdx = lines.length;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^## (Sources|References|Related)/i)) {
                faqInsertIdx = i;
                break;
            }
        }
        lines.splice(faqInsertIdx, 0, faqContent);
    }
    
    // Check if internal links exist, if not add them
    const hasLinks = lines.some(l => l.match(/^## Related/i));
    if (!hasLinks && expansion.internalLinks) {
        let linksContent = '\n## Related Guides\n\n';
        for (const link of expansion.internalLinks) {
            const linkText = link.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            linksContent += `- [${linkText}](${link})\n`;
        }
        
        // Find insertion point (before Sources or end)
        let linksInsertIdx = lines.length;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^## (Sources|References)/i)) {
                linksInsertIdx = i;
                break;
            }
        }
        lines.splice(linksInsertIdx, 0, linksContent);
    }
    
    // Update word count in frontmatter if present
    const finalContent = lines.join('\n');
    const newWordCount = finalContent.split(/\s+/).length;
    
    // Update frontmatter word count
    const updatedContent = finalContent.replace(
        /word_count:\s*\d+/,
        `word_count: ${newWordCount}`
    );
    
    fs.writeFileSync(filePath, updatedContent);
    
    return { 
        expanded: true, 
        oldWordCount: wordCount, 
        newWordCount: newWordCount,
        topic: topic
    };
}

function run() {
    const files = fs.readdirSync(SILVER_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => ({
            path: path.join(SILVER_DIR, f),
            name: f
        }));
    
    // Get word counts and sort by word count (descending)
    const articles = files.map(f => ({
        ...f,
        wordCount: fs.readFileSync(f.path, 'utf8').split(/\s+/).length
    })).filter(a => a.wordCount < 2000)
      .sort((a, b) => b.wordCount - a.wordCount);
    
    console.log(`Found ${articles.length} articles under 2000 words`);
    console.log(`Expanding top 30...\n`);
    
    let expanded = 0;
    let skipped = 0;
    
    for (const article of articles.slice(0, 30)) {
        const result = expandArticle(article.path);
        if (result.expanded) {
            expanded++;
            console.log(`✓ ${article.name}: ${result.oldWordCount} → ${result.newWordCount} words (${result.topic})`);
        } else {
            skipped++;
            console.log(`- ${article.name}: ${result.reason}`);
        }
    }
    
    console.log(`\nExpanded: ${expanded} | Skipped: ${skipped}`);
}

run();
