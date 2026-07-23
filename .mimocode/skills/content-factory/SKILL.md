# Skill: Content Factory

Automated content production pipeline for sourcing/import/export niche sites.

## When to Use

- User asks to "create content", "write article", "generate blog post"
- User asks to "find trending products", "research suppliers"
- User asks to "optimize content", "improve SEO"
- User mentions "bronze", "silver", or "gold" content tiers

## Agents

### Scout Agent
**Purpose:** Find opportunities, products, suppliers, trends
**Input:** Search query or topic
**Output:** Structured JSON with findings

### Writer Agent
**Purpose:** Generate SEO-optimized articles
**Input:** Scout findings + template tier
**Output:** Complete article in Markdown/HTML

### Editor Agent
**Purpose:** Anti-footprint rewriting
**Input:** Article + site voice profile
**Output:** Unique, human-like article

## Workflow

```
1. SCOUT: Find opportunities
   ↓
2. WRITER: Generate article (bronze/silver/gold)
   ↓
3. EDITOR: Rewrite for target site
   ↓
4. PUBLISH: Deploy to site
```

## Content Tiers

### Bronze (800-1200 words)
- High volume
- Long-tail keywords
- Quick production
- Data tables

### Silver (1500-2500 words)
- Authority building
- Medium-tail keywords
- Detailed analysis
- Expert insights

### Gold (3000+ words)
- Premium content
- Link magnet
- Original research
- Definitive guides

## Commands

### /hunt
Run Scout Agent to find new opportunities

### /write [tier] [topic]
Generate article of specified tier

### /edit [site-profile]
Rewrite article for specific site voice

### /publish
Deploy to satellite sites

### /report
Generate performance report

## Configuration

Edit `.mimocode/agents/*.md` to customize agent behavior.

Edit `content-db/templates/*.md` to customize article templates.
