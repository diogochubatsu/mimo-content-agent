/**
 * Pipeline Tests
 * 
 * Run: node --test tests/pipeline.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runPipeline } from '../src/pipeline.js';
import { generateSEOMetadata, analyzeSEO, generateSchema } from '../src/agents/seo.js';

describe('Pipeline', () => {
  describe('runPipeline', () => {
    it('should generate a bronze article', () => {
      const filepath = runPipeline({ topic: 'Test Product', tier: 'bronze' });
      assert.ok(filepath);
      assert.ok(filepath.includes('test-product'));
    });

    it('should throw error for invalid topic', () => {
      assert.throws(() => {
        runPipeline({ topic: '' });
      }, /topic is required/i);
    });

    it('should throw error for invalid tier', () => {
      assert.throws(() => {
        runPipeline({ topic: 'Test', tier: 'invalid' });
      }, /Invalid tier/);
    });
  });
});

describe('SEO Agent', () => {
  describe('generateSEOMetadata', () => {
    it('should generate valid metadata', () => {
      const article = {
        title: 'Test Article Title',
        content: 'This is test content about importing from China.',
        createdAt: new Date().toISOString()
      };
      
      const metadata = generateSEOMetadata(article, { primaryKeyword: 'import china' });
      
      assert.ok(metadata.title);
      assert.ok(metadata.description);
      assert.ok(metadata.slug);
      assert.ok(metadata.keywords.includes('import china'));
    });

    it('should limit title to 60 chars', () => {
      const article = {
        title: 'A'.repeat(100),
        content: 'Test content',
        createdAt: new Date().toISOString()
      };
      
      const metadata = generateSEOMetadata(article);
      assert.ok(metadata.title.length <= 60);
    });

    it('should limit description to 160 chars', () => {
      const article = {
        title: 'Test',
        content: 'A'.repeat(300),
        createdAt: new Date().toISOString()
      };
      
      const metadata = generateSEOMetadata(article);
      assert.ok(metadata.description.length <= 160);
    });
  });

  describe('analyzeSEO', () => {
    it('should return score and issues', () => {
      const content = '# Test Article\n\nThis is test content.';
      const result = analyzeSEO(content, { primaryKeyword: 'test' });
      
      assert.ok(typeof result.score === 'number');
      assert.ok(Array.isArray(result.issues));
      assert.ok(Array.isArray(result.recommendations));
    });

    it('should detect missing H1', () => {
      const content = 'This is content without heading.';
      const result = analyzeSEO(content);
      
      assert.ok(result.issues.includes('No H1 heading found'));
    });

    it('should detect short content', () => {
      const content = 'Short.';
      const result = analyzeSEO(content);
      
      assert.ok(result.issues.includes('Content too short (under 300 words)'));
    });
  });

  describe('generateSchema', () => {
    it('should generate valid Article schema', () => {
      const article = {
        title: 'Test Article',
        content: 'Test content',
        createdAt: '2026-07-24T00:00:00Z'
      };
      
      const schema = generateSchema(article, 'test-article');
      
      assert.strictEqual(schema['@type'], 'Article');
      assert.strictEqual(schema.headline, 'Test Article');
      assert.ok(schema.author);
      assert.ok(schema.publisher);
    });
  });
});
