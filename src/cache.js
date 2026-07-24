/**
 * Cache Module - Avoid reprocessing already processed topics
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'processed-topics.json');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('Warning: Could not load cache');
  }
  return {};
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.warn('Warning: Could not save cache');
  }
}

/**
 * Check if topic has been processed
 */
export function isTopicProcessed(topic, tier) {
  const cache = loadCache();
  const key = `${topic.toLowerCase()}:${tier}`;
  return !!cache[key];
}

/**
 * Mark topic as processed
 */
export function markTopicProcessed(topic, tier, filepath) {
  const cache = loadCache();
  const key = `${topic.toLowerCase()}:${tier}`;
  cache[key] = {
    processed_at: new Date().toISOString(),
    filepath
  };
  saveCache(cache);
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  const cache = loadCache();
  const entries = Object.keys(cache).length;
  
  const byTier = {};
  Object.values(cache).forEach(entry => {
    // Extract tier from key (format: topic:tier)
  });
  
  return {
    total_entries: entries,
    cache_file: CACHE_FILE
  };
}

/**
 * Clear cache
 */
export function clearCache() {
  saveCache({});
}

export default {
  isTopicProcessed,
  markTopicProcessed,
  getCacheStats,
  clearCache
};
