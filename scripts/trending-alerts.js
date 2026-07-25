#!/usr/bin/env node

/**
 * Alert system for trending products
 * Usage: node scripts/trending-alerts.js
 */

import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'content-db', 'raw');
const ALERTS_DIR = path.join(process.cwd(), 'content-db', 'alerts');

if (!fs.existsSync(ALERTS_DIR)) {
  fs.mkdirSync(ALERTS_DIR, { recursive: true });
}

function loadTrendingData() {
  const trending = [];
  
  // Check TikTok trending
  const tiktokFile = path.join(RAW_DIR, 'tiktok-trending.json');
  if (fs.existsSync(tiktokFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(tiktokFile, 'utf8'));
      if (data.hashtags) {
        for (const [tag, videos] of Object.entries(data.hashtags)) {
          for (const video of videos) {
            if (video.views && parseInt(video.views.replace(/[^0-9]/g, '')) > 1000000) {
              trending.push({
                source: 'tiktok',
                tag,
                title: video.title,
                views: video.views,
                product: video.product
              });
            }
          }
        }
      }
    } catch (e) {}
  }
  
  // Check Amazon trending
  const amazonFile = path.join(RAW_DIR, 'amazon', 'trending-products-2026.json');
  if (fs.existsSync(amazonFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(amazonFile, 'utf8'));
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.trend_score && item.trend_score > 90) {
            trending.push({
              source: 'amazon',
              title: item.product,
              trend_score: item.trend_score,
              price_range: item.price_range
            });
          }
        }
      }
    } catch (e) {}
  }
  
  return trending;
}

function generateAlert(trending) {
  return {
    timestamp: new Date().toISOString(),
    alert_type: 'trending_products',
    message: `Found ${trending.length} trending products`,
    products: trending.map(t => ({
      source: t.source,
      title: t.title || t.product,
      metric: t.views || t.trend_score
    }))
  };
}

function main() {
  console.log('=== Trending Products Alert ===\n');
  
  const trending = loadTrendingData();
  
  console.log(`Found ${trending.length} trending products:\n`);
  
  for (const t of trending.slice(0, 10)) {
    console.log(`- [${t.source}] ${t.title || t.product}`);
    if (t.views) console.log(`  Views: ${t.views}`);
    if (t.trend_score) console.log(`  Trend Score: ${t.trend_score}`);
  }
  
  if (trending.length > 0) {
    const alert = generateAlert(trending);
    const alertPath = path.join(ALERTS_DIR, `trending-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(alertPath, JSON.stringify(alert, null, 2));
    console.log(`\nAlert saved to: ${alertPath}`);
  }
}

main();
