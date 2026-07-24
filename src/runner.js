/**
 * CLI Runner for Pipeline - Enhanced Version
 * 
 * Usage:
 *   node src/runner.js --topic "LED strips" --tier bronze
 *   node src/runner.js --topic "phone cases" --tier silver --dry-run
 *   node src/runner.js --batch topics.json
 */

import fs from 'fs';
import path from 'path';
import { runPipeline } from './pipeline.js';
import logger from './logger.js';

function parseArgs(args) {
  const result = {
    topic: 'LED Strip Lights',
    tier: 'bronze',
    site: 'importguide1688.com',
    language: 'en',
    verbose: false,
    dryRun: false,
    batch: null,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--topic':
      case '-t':
        result.topic = args[++i];
        break;
      case '--tier':
        result.tier = args[++i];
        break;
      case '--site':
        result.site = args[++i];
        break;
      case '--language':
      case '-l':
        result.language = args[++i];
        break;
      case '--verbose':
      case '-v':
        result.verbose = true;
        break;
      case '--dry-run':
      case '-d':
        result.dryRun = true;
        break;
      case '--batch':
      case '-b':
        result.batch = args[++i];
        break;
      case '--output':
      case '-o':
        result.output = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return result;
}

function printHelp() {
  console.log(`
MiMo Content Pipeline Runner (Enhanced)

Usage:
  node src/runner.js [options]

Options:
  --topic, -t <topic>     Topic to write about (default: "LED Strip Lights")
  --tier <tier>           Content tier: bronze, silver, gold (default: "bronze")
  --site <domain>         Target site domain (default: "importguide1688.com")
  --language, -l <lang>   Language code (default: "en")
  --dry-run, -d           Generate without saving
  --batch, -b <file>      Process topics from JSON file
  --output, -o <dir>      Custom output directory
  --verbose, -v           Verbose output
  --help, -h              Show this help

Examples:
  node src/runner.js --topic "LED strips" --tier bronze
  node src/runner.js -t "phone cases" --tier silver --dry-run
  node src/runner.js --batch topics.json --tier bronze
  node src/runner.js --topic "earbuds" --output ./my-articles
`);
}

async function processTopic(args) {
  const timer = logger.startTimer(`Pipeline: ${args.topic}`);
  
  try {
    if (args.dryRun) {
      logger.info('RUNNER', `Dry run mode - will not save files`);
    }
    
    const filepath = runPipeline({
      topic: args.topic,
      tier: args.tier,
      site: args.site,
      language: args.language
    });
    
    const duration = timer.end();
    
    return {
      success: true,
      topic: args.topic,
      filepath,
      duration
    };
  } catch (error) {
    logger.error('RUNNER', `Failed: ${error.message}`);
    return {
      success: false,
      topic: args.topic,
      error: error.message
    };
  }
}

async function processBatch(args) {
  const batchFile = path.resolve(args.batch);
  
  if (!fs.existsSync(batchFile)) {
    logger.error('RUNNER', `Batch file not found: ${batchFile}`);
    return [];
  }
  
  const topics = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  const results = [];
  
  logger.info('RUNNER', `Processing ${topics.length} topics from batch file`);
  
  for (const topic of topics) {
    const topicArgs = { ...args, topic: topic.name || topic };
    const result = await processTopic(topicArgs);
    results.push(result);
    
    // Small delay between topics to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           MiMo Content Pipeline Runner (Enhanced)        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  if (args.verbose) {
    console.log('\n📋 Configuration:');
    console.log(`   Topic: ${args.topic}`);
    console.log(`   Tier: ${args.tier}`);
    console.log(`   Site: ${args.site}`);
    console.log(`   Language: ${args.language}`);
    console.log(`   Dry Run: ${args.dryRun}`);
    console.log(`   Batch: ${args.batch || 'N/A'}`);
  }
  
  try {
    let results;
    
    if (args.batch) {
      results = await processBatch(args);
    } else {
      const result = await processTopic(args);
      results = [result];
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Total: ${results.length}`);
    
    if (failed > 0) {
      console.log('\n   Failed topics:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.topic}: ${r.error}`);
      });
    }
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║                    ❌ FAILED                             ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error('\nError:', error);
    process.exit(1);
  }
}

main();
