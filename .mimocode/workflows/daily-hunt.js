export const meta = {
  name: "daily-hunt",
  description: "Daily content collection and production pipeline"
};

export default async function(args) {
  const { tier = "bronze", topics = 5 } = args || {};

  phase("1. Scout: Collecting existing content");
  const scoutResult = await agent("scout", {
    prompt: `Collect content from these sources about import/export and sourcing:

1. Reddit r/AmazonFBA - What products are people discussing?
2. Reddit r/dropship - What questions are being asked?
3. Amazon Blog sell.amazon.com/blog - Recent product ideas
4. TikTok #productfinds - What's trending?
5. Google Trends - What's rising in search?

For each source, extract:
- Key insights
- Products mentioned
- Prices or data points
- Actionable tips

Return as JSON array with source URLs.`
  });

  log(`Collected from ${scoutResult.sources?.length || topics} sources`);

  phase("2. Writer: Transforming to articles");
  const articles = [];

  for (let i = 0; i < Math.min(topics, 5); i++) {
    const source = scoutResult.sources?.[i] || {
      topic: "Trending products",
      insights: ["Sample insight"]
    };

    log(`Writing article ${i + 1}: ${source.topic}`);

    const article = await agent("writer", {
      prompt: `Write a ${tier.toUpperCase()} article based on this collected content:

Source: ${JSON.stringify(source, null, 2)}

Transform this into a valuable, SEO-optimized article. Include:
- Synthesized insights from the source
- Practical tips for readers
- Data points extracted
- Source attribution

Follow the ${tier} template structure.`
    });

    articles.push({
      content: article,
      source: source,
      tier: tier,
      created_at: new Date().toISOString()
    });
  }

  log(`Generated ${articles.length} articles`);

  phase("3. Editor: Anti-footprint rewriting");
  const siteProfiles = ["professional", "casual", "technical", "beginner"];
  const published = [];

  for (let i = 0; i < articles.length; i++) {
    const siteIndex = i % 3;
    const profile = siteProfiles[siteIndex % siteProfiles.length];

    log(`Editing article ${i + 1} for site ${siteIndex + 1} (${profile} tone)`);

    const rewritten = await agent("editor", {
      prompt: `Rewrite this article for site profile "${profile}".

Apply anti-footprint techniques:
1. Change sentence structure
2. Vary vocabulary
3. Add natural imperfections
4. Maintain all data accuracy and source attribution

Article to rewrite:
${articles[i].content}

Site profile: ${profile}`
    });

    published.push({
      content: rewritten,
      site: siteIndex,
      profile: profile,
      tier: tier
    });
  }

  phase("4. Summary");
  const summary = {
    sources_collected: scoutResult.sources?.length || topics,
    articles_generated: articles.length,
    articles_published: published.length,
    tier: tier
  };

  log(`\n=== DAILY HUNT COMPLETE ===`);
  log(`Sources collected: ${summary.sources_collected}`);
  log(`Articles generated: ${summary.articles_generated}`);
  log(`Articles published: ${summary.articles_published}`);

  return summary;
}
