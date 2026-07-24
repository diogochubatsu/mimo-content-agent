/**
 * SEO Agent - TypeScript Version
 * Keyword research + meta tags + schema.org
 */

export interface SEOConfig {
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  targetAudience?: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  slug: string;
  canonical: string;
  og: {
    title: string;
    description: string;
    type: string;
    image: string;
  };
}

export interface Article {
  title: string;
  content: string;
  createdAt: string;
  metadata?: {
    editedAt?: string;
    [key: string]: any;
  };
}

export interface SchemaOrg {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface SEOAnalysis {
  score: number;
  issues: string[];
  recommendations: string[];
  wordCount: number;
  headingCount: number;
  imageCount: number;
}

/**
 * Generate SEO-optimized metadata for an article
 */
export function generateSEOMetadata(article: Article, config: SEOConfig = {}): SEOMetadata {
  const { primaryKeyword = '', secondaryKeywords = [] } = config;

  const title = optimizeTitle(article.title, primaryKeyword);
  const description = optimizeDescription(article.content, primaryKeyword);
  const keywords = extractKeywords(article.content, primaryKeyword, secondaryKeywords);
  const slug = generateSlug(article.title);

  return {
    title,
    description,
    keywords,
    slug,
    canonical: `https://importguide1688.com/articles/${slug}`,
    og: {
      title,
      description,
      type: 'article',
      image: `/og/${slug}.png`
    }
  };
}

function optimizeTitle(title: string, primaryKeyword: string): string {
  if (!primaryKeyword) return title.substring(0, 60);
  if (title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    return title.substring(0, 60);
  }
  return `${primaryKeyword}: ${title}`.substring(0, 60);
}

function optimizeDescription(content: string, primaryKeyword: string): string {
  const lines = content.split('\n').filter(line => 
    line.trim() && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('```')
  );
  
  let description = lines[0] || '';
  if (primaryKeyword && !description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    description = `${primaryKeyword}. ${description}`;
  }
  return description.substring(0, 160);
}

function extractKeywords(content: string, primaryKeyword: string, secondaryKeywords: string[]): string[] {
  const keywords = new Set<string>();
  
  if (primaryKeyword) keywords.add(primaryKeyword);
  secondaryKeywords.forEach(kw => keywords.add(kw));
  
  const commonKeywords = ['import', 'china', 'supplier', 'wholesale', 'dropship', '1688', 'alibaba', 'amazon', 'fba', 'margin'];
  const contentLower = content.toLowerCase();
  commonKeywords.forEach(kw => {
    if (contentLower.includes(kw)) keywords.add(kw);
  });
  
  return Array.from(keywords).slice(0, 10);
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
}

/**
 * Generate schema.org markup
 */
export function generateSchema(article: Article, url: string): SchemaOrg {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.content.substring(0, 200),
    author: { '@type': 'Organization', name: 'Import Guide 1688' },
    publisher: {
      '@type': 'Organization',
      name: 'Import Guide 1688',
      logo: { '@type': 'ImageObject', url: 'https://importguide1688.com/logo.png' }
    },
    datePublished: article.createdAt,
    dateModified: article.metadata?.editedAt || article.createdAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://importguide1688.com/articles/${url}` }
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): SchemaOrg | null {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  };
}

/**
 * Analyze content for SEO issues
 */
export function analyzeSEO(content: string, metadata: SEOConfig = {}): SEOAnalysis {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (metadata.primaryKeyword) {
    const first100Words = content.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    if (!first100Words.includes(metadata.primaryKeyword.toLowerCase())) {
      issues.push('Primary keyword not found in first 100 words');
      recommendations.push(`Add "${metadata.primaryKeyword}" to the beginning`);
    }
  }
  
  const h1Count = (content.match(/^# /gm) || []).length;
  if (h1Count === 0) {
    issues.push('No H1 heading found');
    recommendations.push('Add an H1 heading');
  } else if (h1Count > 1) {
    issues.push('Multiple H1 headings found');
    recommendations.push('Use only one H1 heading');
  }
  
  const imageCount = (content.match(/!\[/g) || []).length;
  if (imageCount === 0) {
    issues.push('No images found');
    recommendations.push('Add relevant images');
  }
  
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) {
    issues.push('Content too short (under 300 words)');
    recommendations.push('Expand to at least 800 words');
  }
  
  return {
    score: Math.max(0, 100 - (issues.length * 10)),
    issues,
    recommendations,
    wordCount,
    headingCount: h1Count,
    imageCount
  };
}

export default {
  generateSEOMetadata,
  generateSchema,
  generateFAQSchema,
  analyzeSEO
};
