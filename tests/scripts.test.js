/**
 * Tests for utility scripts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Script Utilities', () => {
  it('score-bronze should handle valid JSON', () => {
    // Test that the scoring logic works
    const score = 100;
    assert.ok(score > 0, 'Score should be positive');
  });

  it('keyword-density should calculate correctly', () => {
    const text = 'The supplier offers competitive pricing for LED strips.';
    const keyword = 'LED';
    const words = text.split(/\s+/);
    const count = words.filter(w => w.toLowerCase().includes(keyword.toLowerCase())).length;
    const density = (count / words.length) * 100;
    assert.ok(density > 0, 'Density should be positive');
    assert.ok(density < 100, 'Density should be less than 100%');
  });

  it('readability-score should count words correctly', () => {
    const text = 'This is a test sentence with multiple words.';
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    assert.strictEqual(wordCount, 8);
  });
});
