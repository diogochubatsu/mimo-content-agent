#!/usr/bin/env node

/**
 * Generate social media posts from silver articles
 * Usage: node scripts/generate-social-posts.js <article-file>
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');
const SOCIAL_DIR = path.join(CONTENT_DIR, 'social');

if (!fs.existsSync(SOCIAL_DIR)) {
  fs.mkdirSync(SOCIAL_DIR, { recursive: true });
}

function extractData(article) {
  const title = article.match(/^#\s+(.+)$/m)?.[1] || 'Article';
  const prices = article.match(/\$\d+\.\d+/g) || [];
  const margin = article.match(/(\d+)%/g)?.[0] || '40%';
  
  return { title, prices, margin };
}

function generateRedditPost(data) {
  return `## ${data.title}

Just published a comprehensive guide on this topic. Here are the key findings:

${data.prices.length > 0 ? `**Price Range:** ${data.prices[0]} - ${data.prices[data.prices.length - 1]}` : ''}
**Average Margin:** ${data.margin}

Key takeaways:
- Real pricing data from multiple platforms
- Supplier comparison with ratings
- Step-by-step ordering guide

Full guide: [Link to article]

What's your experience with this product?`;
}

function generateTwitterThread(data) {
  return `🧵 Thread: ${data.title}

1/ Quick breakdown of what I found...

2/ Price comparison across platforms:
${data.prices.slice(0, 3).map(p => `• ${p}`).join('\n')}

3/ Average margin: ${data.margin}

4/ Full analysis in our latest guide 👇

5/ What questions do you have about sourcing this product?`;
}

function generateLinkedInPost(data) {
  return `📊 New Research: ${data.title}

We analyzed pricing data across multiple platforms and found some interesting insights:

✅ Price range: ${data.prices[0] || 'N/A'} - ${data.prices[data.prices.length - 1] || 'N/A'}
✅ Average margin: ${data.margin}
✅ Top suppliers identified with ratings

This data can help importers make better sourcing decisions.

Read the full analysis: [Link]

#ecommerce #importing #sourcing #china #1688`;
}

function main() {
  const articlePath = process.argv[2];
  
  if (!articlePath) {
    console.log('Usage: node scripts/generate-social-posts.js <article-file>');
    process.exit(1);
  }
  
  console.log('=== Social Post Generator ===\n');
  
  const article = fs.readFileSync(articlePath, 'utf8');
  const data = extractData(article);
  
  console.log(`Article: ${data.title}\n`);
  
  // Generate posts
  const redditPost = generateRedditPost(data);
  const twitterThread = generateTwitterThread(data);
  const linkedinPost = generateLinkedInPost(data);
  
  // Save posts
  const slug = path.basename(articlePath, '.md');
  
  fs.writeFileSync(path.join(SOCIAL_DIR, `${slug}-reddit.md`), redditPost);
  fs.writeFileSync(path.join(SOCIAL_DIR, `${slug}-twitter.md`), twitterThread);
  fs.writeFileSync(path.join(SOCIAL_DIR, `${slug}-linkedin.md`), linkedinPost);
  
  console.log(`✓ Reddit post: social/${slug}-reddit.md`);
  console.log(`✓ Twitter thread: social/${slug}-twitter.md`);
  console.log(`✓ LinkedIn post: social/${slug}-linkedin.md`);
}

main();
