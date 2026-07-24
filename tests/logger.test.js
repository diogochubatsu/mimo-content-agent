/**
 * Logger Module Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import logger from '../src/logger.js';

describe('Logger Module', () => {
  it('should have all log levels', () => {
    assert.ok(typeof logger.debug === 'function');
    assert.ok(typeof logger.info === 'function');
    assert.ok(typeof logger.warn === 'function');
    assert.ok(typeof logger.error === 'function');
  });

  it('should have phase-specific methods', () => {
    assert.ok(typeof logger.scout === 'function');
    assert.ok(typeof logger.writer === 'function');
    assert.ok(typeof logger.editor === 'function');
    assert.ok(typeof logger.output === 'function');
  });

  it('should have startTimer method', () => {
    assert.ok(typeof logger.startTimer === 'function');
  });

  it('should return timer object', () => {
    const timer = logger.startTimer('test');
    assert.ok(typeof timer.end === 'function');
  });

  it('should return log file path', () => {
    const logFile = logger.getLogFile();
    assert.ok(typeof logFile === 'string');
    assert.ok(logFile.includes('pipeline.log'));
  });

  it('should not throw on log calls', () => {
    assert.doesNotThrow(() => {
      logger.debug('TEST', 'debug message');
      logger.info('TEST', 'info message');
      logger.warn('TEST', 'warn message');
      logger.error('TEST', 'error message');
    });
  });

  it('should not throw on phase methods', () => {
    assert.doesNotThrow(() => {
      logger.scout('test message');
      logger.writer('test message');
      logger.editor('test message');
      logger.output('test message');
    });
  });
});
