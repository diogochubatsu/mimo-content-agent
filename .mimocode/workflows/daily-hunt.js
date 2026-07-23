export const meta = {
  name: "daily-hunt",
  description: "Daily content collection and production pipeline"
};

export default async function(args) {
  const { tier = "bronze", topics = ["LED Strip Lights", "Phone Cases", "Bluetooth Earbuds"] } = args || {};

  phase("1. Pipeline: Generating articles");
  
  const results = [];
  
  for (const topic of topics) {
    log(`\n📝 Processing: ${topic}`);
    
    // Run the pipeline for each topic
    const result = await agent("general", {
      prompt: `Run the content pipeline for topic: "${topic}" with tier: ${tier}

Execute these steps:
1. Scout: Collect content from Reddit, Amazon Blog, TikTok about "${topic}"
2. Writer: Transform collected content into a ${tier} article
3. Editor: Apply anti-footprint rewriting
4. Output: Save to content-db/${tier}/

Use the templates in content-db/templates/${tier}.md

Return the filepath of the generated article.`
    });
    
    results.push({ topic, result });
    log(`✓ Completed: ${topic}`);
  }

  phase("2. Summary");
  
  log(`\n${'='.repeat(60)}`);
  log(`📊 DAILY HUNT COMPLETE`);
  log(`${'='.repeat(60)}`);
  log(`Articles generated: ${results.length}`);
  log(`Tier: ${tier}`);
  log(`Topics: ${topics.join(', ')}`);
  
  return {
    articles: results.length,
    tier,
    topics,
    results
  };
}
