/**
 * Cache Module Tests
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { isTopicProcessed, markTopicProcessed, getCacheStats, clearCache } from '../src/cache.js';

describe('Cache Module', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should return false for unprocessed topic', () => {
    assert.strictEqual(isTopicProcessed('test topic', 'bronze'), false);
  });

  it('should return true after marking topic as processed', () => {
    markTopicProcessed('test topic', 'bronze', '/path/to/file.md');
    assert.strictEqual(isTopicProcessed('test topic', 'bronze'), true);
  });

  it('should be case insensitive', () => {
    markTopicProcessed('Test Topic', 'bronze', '/path/to/file.md');
    assert.strictEqual(isTopicProcessed('test topic', 'bronze'), true);
    assert.strictEqual(isTopicProcessed('TEST TOPIC', 'bronze'), true);
  });

  it('should differentiate between tiers', () => {
    markTopicProcessed('test topic', 'bronze', '/path/to/file.md');
    assert.strictEqual(isTopicProcessed('test topic', 'bronze'), true);
    assert.strictEqual(isTopicProcessed('test topic', 'silver'), false);
  });

  it('should return cache stats', () => {
    markTopicProcessed('topic1', 'bronze', '/path1.md');
    markTopicProcessed('topic2', 'silver', '/path2.md');
    
    const stats = getCacheStats();
    assert.strictEqual(stats.total_entries, 2);
  });

  it('should clear cache', () => {
    markTopicProcessed('test topic', 'bronze', '/path/to/file.md');
    clearCache();
    assert.strictEqual(isTopicProcessed('test topic', 'bronze'), false);
  });
});
