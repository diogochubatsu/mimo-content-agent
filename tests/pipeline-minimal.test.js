/**
 * Minimal Pipeline Tests - Smoke Tests
 * 
 * Quick validation that core functions work.
 * Run: node --test tests/pipeline-minimal.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runPipeline } from '../src/pipeline.js';

describe('Pipeline Smoke Tests', () => {
  it('pipeline produces output', () => {
    const filepath = runPipeline({ topic: 'Smoke Test', tier: 'bronze' });
    assert.ok(filepath, 'Should return a filepath');
    assert.ok(typeof filepath === 'string', 'Filepath should be a string');
  });

  it('pipeline handles different tiers', () => {
    const bronze = runPipeline({ topic: 'Test Bronze', tier: 'bronze' });
    const silver = runPipeline({ topic: 'Test Silver', tier: 'silver' });
    assert.ok(bronze);
    assert.ok(silver);
  });

  it('pipeline rejects invalid tier', () => {
    assert.throws(() => {
      runPipeline({ topic: 'Test', tier: 'invalid' });
    });
  });

  it('pipeline rejects empty topic', () => {
    assert.throws(() => {
      runPipeline({ topic: '' });
    });
  });
});

describe('SEO Agent Smoke Tests', () => {
  it('generateSEOMetadata returns valid object', async () => {
    const { generateSEOMetadata } = await import('../src/agents/seo.js');
    const result = generateSEOMetadata({
      title: 'Test Article',
      content: 'Test content about importing from China.',
      createdAt: new Date().toISOString()
    });
    assert.ok(result.title);
    assert.ok(result.description);
    assert.ok(result.slug);
  });

  it('analyzeSEO returns score', async () => {
    const { analyzeSEO } = await import('../src/agents/seo.js');
    const result = analyzeSEO('# Test\n\nContent here.');
    assert.ok(typeof result.score === 'number');
    assert.ok(result.score >= 0 && result.score <= 100);
  });
});
