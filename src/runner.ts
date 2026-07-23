/**
 * CLI Runner for Pipeline
 * 
 * Usage:
 *   mimo run pipeline --topic "LED strips" --tier bronze
 *   mimo run pipeline --topic "phone cases" --tier silver
 */

import { runPipeline } from './pipeline';

interface RunnerArgs {
  topic: string;
  tier: 'bronze' | 'silver' | 'gold';
  site: string;
  language: string;
  verbose: boolean;
}

function parseArgs(args: string[]): RunnerArgs {
  const result: RunnerArgs = {
    topic: 'LED Strip Lights',
    tier: 'bronze',
    site: 'importguide1688.com',
    language: 'en',
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--topic':
      case '-t':
        result.topic = args[++i];
        break;
      case '--tier':
        result.tier = args[++i] as any;
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
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
MiMo Content Pipeline Runner

Usage:
  mimo run pipeline [options]

Options:
  --topic, -t <topic>     Topic to write about (default: "LED Strip Lights")
  --tier <tier>           Content tier: bronze, silver, gold (default: "bronze")
  --site <domain>         Target site domain (default: "importguide1688.com")
  --language, -l <lang>   Language code (default: "en")
  --verbose, -v           Verbose output
  --help, -h              Show this help

Examples:
  mimo run pipeline --topic "LED strips" --tier bronze
  mimo run pipeline -t "phone cases" --tier silver
  mimo run pipeline --topic "bluetooth earbuds" --site dropshipdeals.com
`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           MiMo Content Pipeline Runner                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  if (args.verbose) {
    console.log('\n📋 Configuration:');
    console.log(`   Topic: ${args.topic}`);
    console.log(`   Tier: ${args.tier}`);
    console.log(`   Site: ${args.site}`);
    console.log(`   Language: ${args.language}`);
  }

  try {
    const filepath = await runPipeline({
      topic: args.topic,
      tier: args.tier,
      site: args.site,
      language: args.language
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SUCCESS                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n📄 Article saved to: ${filepath}`);
    
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════════╗');
    console.error('║                    ❌ FAILED                             ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error('\nError:', error);
    process.exit(1);
  }
}

main();
