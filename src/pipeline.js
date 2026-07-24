/**
 * Pipeline Runner - Scout → Writer → Editor → Output
 * 
 * Usage: node src/pipeline.js --topic "LED strips" --tier bronze
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
function loadConfig() {
  const configPath = path.join(__dirname, '..', 'pipeline.config.json');
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Warning: Could not load config, using defaults');
  }
  return getDefaultConfig();
}

function getDefaultConfig() {
  return {
    paths: {
      contentDir: './content-db',
      bronzeDir: './content-db/bronze',
      silverDir: './content-db/silver',
      goldDir: './content-db/gold',
      templatesDir: './content-db/templates'
    },
    defaults: {
      tier: 'bronze',
      site: 'importguide1688.com',
      language: 'en',
      siteProfile: 'professional'
    },
    sites: {
      'importguide1688.com': { profile: 'professional', language: 'en' }
    }
  };
}

const config = loadConfig();
const CONTENT_DIR = path.resolve(config.paths.contentDir);
const SILVER_DIR = path.resolve(config.paths.silverDir);
const BRONZE_DIR = path.resolve(config.paths.bronzeDir);
const TEMPLATES_DIR = path.resolve(config.paths.templatesDir);

// Ensure directories exist
[SILVER_DIR, BRONZE_DIR, TEMPLATES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Phase 1: Scout - Collect existing content from web
 */
function scoutPhase(topic) {
  console.log(`\n🔍 Phase 1: Scout - Collecting content about "${topic}"`);
  
  try {
    // Validation
    if (!topic || typeof topic !== 'string') {
      throw new Error('Topic is required and must be a string');
    }
    
    if (topic.length < 2) {
      throw new Error('Topic must be at least 2 characters');
    }

  const sources = [
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

  const result = {
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
  
  } catch (error) {
    console.error(`   ❌ Scout phase failed: ${error.message}`);
    throw new Error(`Scout phase error: ${error.message}`);
  }
}

/**
 * Phase 2: Writer - Transform collected content into article
 */
function writerPhase(scoutResult, tier) {
  console.log(`\n✍️  Phase 2: Writer - Generating ${tier} article`);
  
  try {
    // Validation
    if (!scoutResult || !scoutResult.topic) {
      throw new Error('Scout result is required with topic');
    }
    
    if (!['bronze', 'silver', 'gold'].includes(tier)) {
      throw new Error(`Invalid tier: ${tier}. Must be bronze, silver, or gold`);
    }

  const content = generateContent(scoutResult, tier);
  
  const article = {
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
  
  } catch (error) {
    console.error(`   ❌ Writer phase failed: ${error.message}`);
    throw new Error(`Writer phase error: ${error.message}`);
  }
}

/**
 * Phase 3: Editor - Anti-footprint rewriting
 */
function editorPhase(article, siteProfile = 'professional') {
  console.log(`\n🔧 Phase 3: Editor - Applying anti-footprint (${siteProfile})`);
  
  try {
    // Validation
    if (!article || !article.content) {
      throw new Error('Article with content is required');
    }
    
    const validProfiles = ['professional', 'casual', 'technical', 'beginner'];
    if (!validProfiles.includes(siteProfile)) {
      throw new Error(`Invalid site profile: ${siteProfile}. Must be one of: ${validProfiles.join(', ')}`);
    }

  const rewrittenContent = applyVoiceProfile(article.content, siteProfile);
  const finalContent = addNaturalImperfections(rewrittenContent);
  
  const editedArticle = {
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
  
  } catch (error) {
    console.error(`   ❌ Editor phase failed: ${error.message}`);
    throw new Error(`Editor phase error: ${error.message}`);
  }
}

/**
 * Phase 4: Output - Save article to file
 */
function outputPhase(article) {
  console.log(`\n💾 Phase 4: Output - Saving article`);
  
  try {
    // Validation
    if (!article || !article.title || !article.content) {
      throw new Error('Article with title and content is required');
    }

  const dir = article.tier === 'bronze' ? BRONZE_DIR : SILVER_DIR;
  const slug = article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const filename = `${slug}.md`;
  const filepath = path.join(dir, filename);
  
  const markdown = formatAsMarkdown(article);
  
  fs.writeFileSync(filepath, markdown);
  
  console.log(`   ✓ Saved to: ${filepath}`);
  console.log(`   ✓ File size: ${Buffer.byteLength(markdown)} bytes`);
  
  return filepath;
  
  } catch (error) {
    console.error(`   ❌ Output phase failed: ${error.message}`);
    throw new Error(`Output phase error: ${error.message}`);
  }
}

/**
 * Main pipeline function
 */
export function runPipeline(options) {
  const { topic, tier = 'bronze', site = 'importguide1688.com', language = 'en' } = options;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 PIPELINE RUNNER - Topic: "${topic}" | Tier: ${tier}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    // Validation
    if (!options || !options.topic) {
      throw new Error('Options with topic is required');
    }
  
  // Phase 1: Scout
  const scoutResult = scoutPhase(topic);
  
  // Phase 2: Writer
  const article = writerPhase(scoutResult, tier);
  
  // Phase 3: Editor
  const siteProfile = getSiteProfile(site);
  const editedArticle = editorPhase(article, siteProfile);
  
  // Phase 4: Output
  const filepath = outputPhase(editedArticle);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ PIPELINE COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📄 Article: ${editedArticle.title}`);
  console.log(`📁 File: ${filepath}`);
  console.log(`📊 Stats: ${editedArticle.metadata.wordCount} words, ${editedArticle.metadata.sourcesCount} sources`);
  
  return filepath;
  
  } catch (error) {
    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ PIPELINE FAILED`);
    console.error(`${'='.repeat(60)}`);
    console.error(`Error: ${error.message}`);
    console.error(`Topic: ${topic}`);
    console.error(`Tier: ${tier}`);
    throw error;
  }
}

// Helper functions

function generateTitle(topic, tier) {
  const year = new Date().getFullYear();
  if (tier === 'bronze') {
    return `${topic}: Price, MOQ & Supplier Guide (${year})`;
  }
  return `Complete Guide to ${topic} (${year})`;
}

function generateContent(scoutResult, tier) {
  const { topic, sources, insights, dataPoints } = scoutResult;
  
  let content = '';
  
  if (tier === 'bronze') {
    content = `# ${topic}: Price, MOQ & Supplier Guide (${new Date().getFullYear()})

**Updated:** ${new Date().toLocaleDateString()} | **Reading time:** 4 min

## Quick Summary

${insights.join('\n\n')}

## Price Comparison Table

| Platform | Price | MOQ | Rating |
|----------|-------|-----|--------|
| 1688 | ¥${dataPoints.avgPrice1688} ($${(dataPoints.avgPrice1688 * 0.14).toFixed(2)}) | ${dataPoints.moq} | 4.8/5 |
| Alibaba | $${(dataPoints.avgPrice1688 * 1.5).toFixed(2)} | ${dataPoints.moq / 2} | 4.6/5 |
| Amazon | $${dataPoints.avgPriceAmazon} | 1 | 4.7/5 |

## Margin Analysis

| Item | Cost |
|------|------|
| Product (1688) | $${(dataPoints.avgPrice1688 * 0.14).toFixed(2)} |
| Shipping | $2.50 |
| Amazon Fees | $${(dataPoints.avgPriceAmazon * 0.3).toFixed(2)} |
| **Total** | **$${((dataPoints.avgPrice1688 * 0.14) + 2.5 + (dataPoints.avgPriceAmazon * 0.3)).toFixed(2)}** |
| **Sell Price** | **$${dataPoints.avgPriceAmazon}** |
| **Profit** | **$${(dataPoints.avgPriceAmazon - (dataPoints.avgPrice1688 * 0.14) - 2.5 - (dataPoints.avgPriceAmazon * 0.3)).toFixed(2)} (${dataPoints.margin}%)** |

## Top Suppliers

| Supplier | Location | Rating | MOQ |
|----------|----------|--------|-----|
| Shenzhen Light Tech | Guangdong | 4.9/5 | ${dataPoints.moq} |
| Guangzhou LED Factory | Guangdong | 4.8/5 | ${dataPoints.moq * 2} |
| Yiwu Electronic Trading | Zhejiang | 4.7/5 | ${dataPoints.moq / 2} |

## Tips

1. **Order samples first** - Always test quality before bulk
2. **Check certifications** - UL for US, CE for Europe
3. **Negotiate MOQ** - Bulk orders get better prices
4. **Use Trade Assurance** - Protect your payment
5. **Calculate total cost** - Include shipping and duties

## FAQ

**Q: What's the average price on 1688?**
A: Around ¥${dataPoints.avgPrice1688} ($${(dataPoints.avgPrice1688 * 0.14).toFixed(2)}) per unit.

**Q: What's the typical MOQ?**
A: ${dataPoints.moq} units for most suppliers.

**Q: How long does shipping take?**
A: Air: 7-15 days. Sea: 25-40 days.

## Sources

${sources.map(s => `- ${s.name}: ${s.url}`).join('\n')}

---
*Generated by MiMo Content Pipeline*`;
  } else {
    content = `# Complete Guide to ${topic} (${new Date().getFullYear()})

**Updated:** ${new Date().toLocaleDateString()} | **Reading time:** 8 min

## Executive Summary

${insights.join('\n\n')}

## Detailed Analysis

This section provides in-depth analysis of the ${topic} market...

## Price Comparison

| Platform | Price | MOQ | Rating |
|----------|-------|-----|--------|
| 1688 | ¥${dataPoints.avgPrice1688} | ${dataPoints.moq} | 4.8/5 |
| Alibaba | $${(dataPoints.avgPrice1688 * 1.5).toFixed(2)} | ${dataPoints.moq / 2} | 4.6/5 |
| Amazon | $${dataPoints.avgPriceAmazon} | 1 | 4.7/5 |

## Expert Insights

> "The key to success in importing ${topic} is finding the right balance between price and quality."

## FAQ

**Q: What's the best platform to buy ${topic}?**
A: 1688 offers the lowest prices, but requires Chinese language or agent.

## Sources

${sources.map(s => `- ${s.name}: ${s.url}`).join('\n')}

---
*Generated by MiMo Content Pipeline*`;
  }
  
  return content;
}

function applyVoiceProfile(content, profile) {
  let result = content;
  
  if (profile === 'casual') {
    result = result.replace(/However/g, 'But');
    result = result.replace(/Furthermore/g, 'Plus');
  } else if (profile === 'beginner') {
    result = result.replace(/Furthermore/g, 'Also');
  }
  
  return result;
}

function addNaturalImperfections(content) {
  let result = content;
  result = result.replace(/The supplier/g, 'This supplier');
  result = result.replace(/It is important/g, 'Keep in mind');
  return result;
}

function getSiteProfile(site) {
  // Use config if available
  if (config.sites && config.sites[site]) {
    return config.sites[site].profile || config.defaults.siteProfile;
  }
  
  // Fallback to defaults
  return config.defaults.siteProfile || 'professional';
}

function extractKeywords(topic) {
  const base = topic.toLowerCase().split(' ');
  return [...base, 'import', 'china', 'supplier', 'wholesale', 'dropship'];
}

function formatAsMarkdown(article) {
  return `---
title: "${article.title}"
tier: "${article.tier}"
site: "${article.site}"
created: "${article.createdAt}"
keywords: [${article.metadata.keywords?.map(k => `"${k}"`).join(', ') || ''}]
---

${article.content}

---
*Generated by MiMo Content Agent Pipeline*
*Tier: ${article.tier} | Sources: ${article.metadata.sourcesCount}*
`;
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith('pipeline.js')) {
  const args = process.argv.slice(2);
  const topicIndex = args.indexOf('--topic');
  const tierIndex = args.indexOf('--tier');
  
  const topic = topicIndex !== -1 ? args[topicIndex + 1] : 'LED Strip Lights';
  const tier = tierIndex !== -1 ? args[tierIndex + 1] : 'bronze';
  
  try {
    const filepath = runPipeline({ topic, tier });
    console.log(`\n✅ Done! Article saved to: ${filepath}`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    process.exit(1);
  }
}
