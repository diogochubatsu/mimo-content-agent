/**
 * Pipeline Runner - Scout → Writer → Editor → Output
 * 
 * Usage: mimo run pipeline --topic "LED strips" --tier bronze
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');
const SILVER_DIR = path.join(CONTENT_DIR, 'silver');
const BRONZE_DIR = path.join(CONTENT_DIR, 'bronze');

// Ensure directories exist
[SILVER_DIR, BRONZE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface PipelineOptions {
  topic: string;
  tier?: 'bronze' | 'silver' | 'gold';
  site?: string;
  language?: string;
}

interface ScoutResult {
  topic: string;
  sources: SourceData[];
  insights: string[];
  dataPoints: Record<string, any>;
}

interface SourceData {
  name: string;
  url: string;
  type: string;
  language: string;
  keyInsights: string[];
  dataPoints: Record<string, any>;
}

interface Article {
  title: string;
  content: string;
  tier: string;
  site: string;
  metadata: Record<string, any>;
  createdAt: string;
}

/**
 * Phase 1: Scout - Collect existing content from web
 */
async function scoutPhase(topic: string): Promise<ScoutResult> {
  console.log(`\n🔍 Phase 1: Scout - Collecting content about "${topic}"`);
  
  // In production, this would call web search APIs
  // For now, we'll use the agent to collect content
  const sources: SourceData[] = [
    {
      name: 'Amazon Blog',
      url: 'https://sell.amazon.com/blog',
      type: 'blog',
      language: 'en',
      keyInsights: [`Products related to ${topic} trending on Amazon`],
      dataPoints: { avgPrice: '$15-30', margin: '40-60%' }
    },
    {
      name: 'Reddit r/AmazonFBA',
      url: 'https://reddit.com/r/AmazonFBA',
      type: 'forum',
      language: 'en',
      keyInsights: [`Sellers discussing ${topic} sourcing`],
      dataPoints: { commonQuestions: 5, trending: true }
    },
    {
      name: 'TikTok #productfinds',
      url: 'https://tiktok.com/tag/productfinds',
      type: 'social',
      language: 'en',
      keyInsights: [`Viral ${topic} videos this week`],
      dataPoints: { views: '1M+', engagement: 'high' }
    }
  ];

  const result: ScoutResult = {
    topic,
    sources,
    insights: [
      `${topic} is trending in Q3 2026`,
      `Average margin: 45-65%`,
      `Main suppliers: Guangdong, China`,
      `Common MOQ: 50-100 units`
    ],
    dataPoints: {
      avgPrice1688: 12.50,
      avgPriceAmazon: 24.99,
      margin: 50,
      moq: 100
    }
  };

  console.log(`   ✓ Found ${sources.length} sources`);
  console.log(`   ✓ Extracted ${result.insights.length} insights`);
  
  return result;
}

/**
 * Phase 2: Writer - Transform collected content into article
 */
async function writerPhase(scoutResult: ScoutResult, tier: string): Promise<Article> {
  console.log(`\n✍️  Phase 2: Writer - Generating ${tier} article`);
  
  const template = loadTemplate(tier);
  const content = generateContent(scoutResult, template);
  
  const article: Article = {
    title: generateTitle(scoutResult.topic, tier),
    content,
    tier,
    site: 'importguide1688.com',
    metadata: {
      topic: scoutResult.topic,
      sourcesCount: scoutResult.sources.length,
      wordCount: content.split(/\s+/).length,
      keywords: extractKeywords(scoutResult.topic)
    },
    createdAt: new Date().toISOString()
  };

  console.log(`   ✓ Generated article: ${article.title}`);
  console.log(`   ✓ Word count: ${article.metadata.wordCount}`);
  
  return article;
}

/**
 * Phase 3: Editor - Anti-footprint rewriting
 */
async function editorPhase(article: Article, siteProfile: string = 'professional'): Promise<Article> {
  console.log(`\n🔧 Phase 3: Editor - Applying anti-footprint (${siteProfile})`);
  
  // Apply voice profile
  const rewrittenContent = applyVoiceProfile(article.content, siteProfile);
  
  // Add natural imperfections
  const finalContent = addNaturalImperfections(rewrittenContent);
  
  const editedArticle: Article = {
    ...article,
    content: finalContent,
    metadata: {
      ...article.metadata,
      editedAt: new Date().toISOString(),
      siteProfile,
      antiFootprintApplied: true
    }
  };

  console.log(`   ✓ Applied ${siteProfile} voice profile`);
  console.log(`   ✓ Added natural variations`);
  
  return editedArticle;
}

/**
 * Phase 4: Output - Save article to file
 */
async function outputPhase(article: Article): Promise<string> {
  console.log(`\n💾 Phase 4: Output - Saving article`);
  
  const dir = article.tier === 'bronze' ? BRONZE_DIR : SILVER_DIR;
  const slug = article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const filename = `${slug}.md`;
  const filepath = path.join(dir, filename);
  
  // Format as markdown
  const markdown = formatAsMarkdown(article);
  
  fs.writeFileSync(filepath, markdown);
  
  console.log(`   ✓ Saved to: ${filepath}`);
  console.log(`   ✓ File size: ${Buffer.byteLength(markdown)} bytes`);
  
  return filepath;
}

/**
 * Main pipeline function
 */
export async function runPipeline(options: PipelineOptions): Promise<string> {
  const { topic, tier = 'bronze', site = 'importguide1688.com', language = 'en' } = options;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 PIPELINE RUNNER - Topic: "${topic}" | Tier: ${tier}`);
  console.log(`${'='.repeat(60)}`);
  
  // Phase 1: Scout
  const scoutResult = await scoutPhase(topic);
  
  // Phase 2: Writer
  const article = await writerPhase(scoutResult, tier);
  
  // Phase 3: Editor
  const siteProfile = getSiteProfile(site);
  const editedArticle = await editorPhase(article, siteProfile);
  
  // Phase 4: Output
  const filepath = await outputPhase(editedArticle);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ PIPELINE COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📄 Article: ${editedArticle.title}`);
  console.log(`📁 File: ${filepath}`);
  console.log(`📊 Stats: ${editedArticle.metadata.wordCount} words, ${editedArticle.metadata.sourcesCount} sources`);
  
  return filepath;
}

// Helper functions

function loadTemplate(tier: string): string {
  const templatePath = path.join(CONTENT_DIR, 'templates', `${tier}.md`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf8');
  }
  return getDefaultTemplate(tier);
}

function getDefaultTemplate(tier: string): string {
  if (tier === 'bronze') {
    return `# {title}

## Quick Summary
{summary}

## Price Comparison Table
| Platform | Price | MOQ | Rating |
|----------|-------|-----|--------|
{prices}

## Margin Analysis
{margins}

## Top Suppliers
{suppliers}

## Tips
{tips}

## FAQ
{faq}

## Sources
{sources}`;
  }
  return `# {title}

## Executive Summary
{summary}

## Detailed Analysis
{analysis}

## Comparison Tables
{tables}

## Expert Insights
{experts}

## FAQ
{faq}

## Sources
{sources}`;
}

function generateTitle(topic: string, tier: string): string {
  const year = new Date().getFullYear();
  if (tier === 'bronze') {
    return `${topic}: Price, MOQ & Supplier Guide (${year})`;
  }
  return `Complete Guide to ${topic} (${year})`;
}

function generateContent(scoutResult: ScoutResult, template: string): string {
  const { topic, sources, insights, dataPoints } = scoutResult;
  
  let content = template;
  
  // Replace placeholders
  content = content.replace('{title}', `${topic} Guide (${new Date().getFullYear()})`);
  content = content.replace('{summary}', insights.join('\n\n'));
  
  // Generate price table
  const priceTable = `
| Platform | Price | MOQ | Rating |
|----------|-------|-----|--------|
| 1688 | ¥${dataPoints.avgPrice1688} ($${(dataPoints.avgPrice1688 * 0.14).toFixed(2)}) | ${dataPoints.moq} | 4.8/5 |
| Alibaba | $${(dataPoints.avgPrice1688 * 1.5).toFixed(2)} | ${dataPoints.moq / 2} | 4.6/5 |
| Amazon | $${dataPoints.avgPriceAmazon} | 1 | 4.7/5 |`;
  
  content = content.replace('{prices}', priceTable);
  
  // Generate margin analysis
  const marginAnalysis = `
| Item | Cost |
|------|------|
| Product (1688) | $${(dataPoints.avgPrice1688 * 0.14).toFixed(2)} |
| Shipping | $2.50 |
| Amazon Fees | $${(dataPoints.avgPriceAmazon * 0.3).toFixed(2)} |
| **Total** | **$${((dataPoints.avgPrice1688 * 0.14) + 2.5 + (dataPoints.avgPriceAmazon * 0.3)).toFixed(2)}** |
| **Sell Price** | **$${dataPoints.avgPriceAmazon}** |
| **Profit** | **$${(dataPoints.avgPriceAmazon - (dataPoints.avgPrice1688 * 0.14) - 2.5 - (dataPoints.avgPriceAmazon * 0.3)).toFixed(2)} (${dataPoints.margin}%)** |`;
  
  content = content.replace('{margins}', marginAnalysis);
  
  // Generate suppliers
  const suppliers = `
| Supplier | Location | Rating | MOQ |
|----------|----------|--------|-----|
| Shenzhen Light Tech | Guangdong | 4.9/5 | ${dataPoints.moq} |
| Guangzhou LED Factory | Guangdong | 4.8/5 | ${dataPoints.moq * 2} |
| Yiwu Electronic Trading | Zhejiang | 4.7/5 | ${dataPoints.moq / 2} |`;
  
  content = content.replace('{suppliers}', suppliers);
  
  // Generate tips
  const tips = `
1. **Order samples first** - Always test quality before bulk
2. **Check certifications** - UL for US, CE for Europe
3. **Negotiate MOQ** - Bulk orders get better prices
4. **Use Trade Assurance** - Protect your payment
5. **Calculate total cost** - Include shipping and duties`;
  
  content = content.replace('{tips}', tips);
  
  // Generate FAQ
  const faq = `
**Q: What's the average price on 1688?**
A: Around ¥${dataPoints.avgPrice1688} ($${(dataPoints.avgPrice1688 * 0.14).toFixed(2)}) per unit.

**Q: What's the typical MOQ?**
A: ${dataPoints.moq} units for most suppliers.

**Q: How long does shipping take?**
A: Air: 7-15 days. Sea: 25-40 days.`;
  
  content = content.replace('{faq}', faq);
  
  // Generate sources
  const sourcesList = sources.map(s => `- ${s.name}: ${s.url}`).join('\n');
  content = content.replace('{sources}', sourcesList);
  
  return content;
}

function applyVoiceProfile(content: string, profile: string): string {
  // Apply different voice profiles
  const profiles: Record<string, (text: string) => string> = {
    professional: (text) => text,
    casual: (text) => text.replace(/\./g, '!').replace(/However/g, 'But'),
    technical: (text) => text,
    beginner: (text) => text.replace(/Furthermore/g, 'Also')
  };
  
  return (profiles[profile] || profiles.professional)(content);
}

function addNaturalImperfections(content: string): string {
  // Add subtle variations
  let result = content;
  
  // Vary some sentence structures
  result = result.replace(/The supplier/g, 'This supplier');
  result = result.replace(/It is important/g, 'Keep in mind');
  
  return result;
}

function getSiteProfile(site: string): string {
  const profiles: Record<string, string> = {
    'importguide1688.com': 'professional',
    'dropshipdeals.com': 'casual',
    'datadrivenimport.com': 'technical',
    'beginnerimport.com': 'beginner'
  };
  
  return profiles[site] || 'professional';
}

function extractKeywords(topic: string): string[] {
  const base = topic.toLowerCase().split(' ');
  return [
    ...base,
    'import',
    'china',
    'supplier',
    'wholesale',
    'dropship'
  ];
}

function formatAsMarkdown(article: Article): string {
  return `---
title: "${article.title}"
tier: "${article.tier}"
site: "${article.site}"
created: "${article.createdAt}"
keywords: [${article.metadata.keywords?.map((k: string) => `"${k}"`).join(', ') || ''}]
---

${article.content}

---
*Generated by MiMo Content Agent Pipeline*
*Tier: ${article.tier} | Sources: ${article.metadata.sourcesCount}*
`;
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const topicIndex = args.indexOf('--topic');
  const tierIndex = args.indexOf('--tier');
  
  const topic = topicIndex !== -1 ? args[topicIndex + 1] : 'LED Strip Lights';
  const tier = tierIndex !== -1 ? args[tierIndex + 1] : 'bronze';
  
  runPipeline({ topic, tier: tier as any })
    .then(filepath => {
      console.log(`\n✅ Done! Article saved to: ${filepath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Pipeline failed:', error);
      process.exit(1);
    });
}
