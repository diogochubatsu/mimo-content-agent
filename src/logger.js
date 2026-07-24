/**
 * Logger Module - Structured logging for pipeline phases
 */

import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'pipeline.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

function formatTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, phase, message, data = null) {
  const timestamp = formatTimestamp();
  const base = `[${timestamp}] [${level}] [${phase}] ${message}`;
  
  if (data) {
    return `${base} ${JSON.stringify(data)}`;
  }
  return base;
}

function writeLog(level, phase, message, data) {
  const formatted = formatMessage(level, phase, message, data);
  
  // Console output
  if (LOG_LEVELS[level] >= currentLevel) {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m'  // Red
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}${formatted}${reset}`);
  }
  
  // File output
  try {
    fs.appendFileSync(LOG_FILE, formatted + '\n');
  } catch (error) {
    // Silently fail if can't write to log file
  }
}

export const logger = {
  debug: (phase, message, data) => writeLog('DEBUG', phase, message, data),
  info: (phase, message, data) => writeLog('INFO', phase, message, data),
  warn: (phase, message, data) => writeLog('WARN', phase, message, data),
  error: (phase, message, data) => writeLog('ERROR', phase, message, data),
  
  // Convenience methods for pipeline phases
  scout: (message, data) => writeLog('INFO', 'SCOUT', message, data),
  writer: (message, data) => writeLog('INFO', 'WRITER', message, data),
  editor: (message, data) => writeLog('INFO', 'EDITOR', message, data),
  output: (message, data) => writeLog('INFO', 'OUTPUT', message, data),
  
  // Performance tracking
  startTimer: (label) => {
    const start = Date.now();
    return {
      end: () => {
        const duration = Date.now() - start;
        writeLog('INFO', 'PERF', `${label} completed in ${duration}ms`);
        return duration;
      }
    };
  },
  
  // Get log file path
  getLogFile: () => LOG_FILE
};

export default logger;
