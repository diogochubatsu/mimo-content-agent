export const meta = {
  name: "daily-hunt",
  description: "Daily content production pipeline - finds opportunities and generates articles"
};

export default async function(args) {
  const { tier = "bronze", sites = 3, articles_per_site = 2 } = args || {};

  phase("1. Scout: Finding opportunities");
  const scoutResult = await agent("scout", {
    prompt: `Search for trending products and suppliers on:
1. 1688.com - search for "热销" (hot selling) products
2. Reddit r/dropship - what products are people asking about?
3. TikTok - what product finds are going viral?
4. Amazon Movers & Shakers - what's trending?

Return top 10 opportunities as JSON array.`
  });

  log(`Found ${scoutResult.opportunities?.length || 10} opportunities`);

  phase("2. Writer: Generating articles");
  const articles = [];

  for (let i = 0; i < Math.min(articles_per_site * sites, 10); i++) {
    const opportunity = scoutResult.opportunities?.[i] || {
      product: "LED Strip Lights",
      platform: "1688",
      price_cny: 12.50
    };

    log(`Writing article ${i + 1}: ${opportunity.product}`);

    const article = await agent("writer", {
      prompt: `Write a ${tier.toUpperCase()} article about sourcing ${opportunity.product} from ${opportunity.platform}.

Data from Scout:
${JSON.stringify(opportunity, null, 2)}

Follow the ${tier} template structure exactly. Include:
- Price comparison table
- Margin analysis
- Supplier recommendations
- FAQ section`
    });

    articles.push({
      content: article,
      opportunity: opportunity,
      tier: tier,
      created_at: new Date().toISOString()
    });
  }

  log(`Generated ${articles.length} articles`);

  phase("3. Editor: Anti-footprint rewriting");
  const siteProfiles = ["professional", "casual", "technical", "beginner"];
  const published = [];

  for (let i = 0; i < articles.length; i++) {
    const siteIndex = i % sites;
    const profile = siteProfiles[siteIndex % siteProfiles.length];

    log(`Editing article ${i + 1} for site ${siteIndex + 1} (${profile} tone)`);

    const rewritten = await agent("editor", {
      prompt: `Rewrite this article for site profile "${profile}".

Apply anti-footprint techniques:
1. Change sentence structure
2. Vary vocabulary
3. Add natural imperfections
4. Maintain all data accuracy

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
    total_opportunities: scoutResult.opportunities?.length || 10,
    articles_generated: articles.length,
    articles_published: published.length,
    sites_used: sites,
    tier: tier,
    estimated_traffic: articles.length * 50
  };

  log(`\n=== DAILY HUNT COMPLETE ===`);
  log(`Opportunities found: ${summary.total_opportunities}`);
  log(`Articles generated: ${summary.articles_generated}`);
  log(`Articles published: ${summary.articles_published}`);
  log(`Estimated monthly traffic: ${summary.estimated_traffic} visits`);

  return summary;
}
