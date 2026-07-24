/**
 * SEO Agent Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateSEOMetadata, generateSchema, generateFAQSchema, analyzeSEO } from '../src/agents/seo.js';

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
      assert.ok(Array.isArray(metadata.keywords));
      assert.ok(metadata.canonical.includes('importguide1688.com'));
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

    it('should generate valid slug', () => {
      const article = {
        title: 'Test Article With Spaces',
        content: 'Test content',
        createdAt: new Date().toISOString()
      };
      
      const metadata = generateSEOMetadata(article);
      assert.ok(metadata.slug.includes('test-article'));
      assert.ok(!metadata.slug.includes(' '));
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

  describe('generateFAQSchema', () => {
    it('should generate valid FAQ schema', () => {
      const faqs = [
        { question: 'What is this?', answer: 'This is test.' },
        { question: 'How does it work?', answer: 'It works well.' }
      ];
      
      const schema = generateFAQSchema(faqs);
      
      assert.strictEqual(schema['@type'], 'FAQPage');
      assert.strictEqual(schema.mainEntity.length, 2);
    });

    it('should return null for empty faqs', () => {
      const schema = generateFAQSchema([]);
      assert.strictEqual(schema, null);
    });
  });

  describe('analyzeSEO', () => {
    it('should return score and issues', () => {
      const content = '# Test Article\n\nThis is test content.';
      const result = analyzeSEO(content, { primaryKeyword: 'test' });
      
      assert.ok(typeof result.score === 'number');
      assert.ok(Array.isArray(result.issues));
      assert.ok(Array.isArray(result.recommendations));
      assert.ok(typeof result.wordCount === 'number');
    });

    it('should detect missing H1', () => {
      const content = 'This is content without heading.';
      const result = analyzeSEO(content);
      
      assert.ok(result.issues.some(i => i.includes('H1')));
    });

    it('should detect short content', () => {
      const content = 'Short.';
      const result = analyzeSEO(content);
      
      assert.ok(result.issues.some(i => i.includes('short')));
    });

    it('should give full score for good content', () => {
      const content = '# Good Article\n\n' + 'This is good content. '.repeat(50) + '\n![image](test.jpg)';
      const result = analyzeSEO(content, { primaryKeyword: 'good' });
      
      assert.ok(result.score >= 80);
    });
  });
});
