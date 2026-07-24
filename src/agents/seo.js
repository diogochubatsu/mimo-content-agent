/**
 * SEO Agent - Keyword Research + Meta Tags + Schema.org
 */

import fs from 'fs';
import path from 'path';

/**
 * Generate SEO-optimized metadata for an article
 */
export function generateSEOMetadata(article, config = {}) {
  const { 
    primaryKeyword = '',
    secondaryKeywords = [],
    targetAudience = 'importers'
  } = config;

  // Generate title (max 60 chars)
  const title = optimizeTitle(article.title, primaryKeyword);
  
  // Generate meta description (max 160 chars)
  const description = optimizeDescription(article.content, primaryKeyword);
  
  // Generate keywords
  const keywords = extractKeywords(article.content, primaryKeyword, secondaryKeywords);
  
  // Generate slug
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

/**
 * Optimize title for SEO
 */
function optimizeTitle(title, primaryKeyword) {
  if (!primaryKeyword) return title.substring(0, 60);
  
  // Ensure primary keyword is in title
  if (title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    return title.substring(0, 60);
  }
  
  // Add keyword if not present
  const optimized = `${primaryKeyword}: ${title}`;
  return optimized.substring(0, 60);
}

/**
 * Optimize meta description
 */
function optimizeDescription(content, primaryKeyword) {
  // Extract first meaningful paragraph
  const lines = content.split('\n').filter(line => 
    line.trim() && 
    !line.startsWith('#') && 
    !line.startsWith('|') &&
    !line.startsWith('```')
  );
  
  let description = lines[0] || '';
  
  // Ensure primary keyword is included
  if (primaryKeyword && !description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    description = `${primaryKeyword}. ${description}`;
  }
  
  return description.substring(0, 160);
}

/**
 * Extract keywords from content
 */
function extractKeywords(content, primaryKeyword, secondaryKeywords) {
  const keywords = new Set();
  
  // Add primary keyword
  if (primaryKeyword) {
    keywords.add(primaryKeyword);
  }
  
  // Add secondary keywords
  secondaryKeywords.forEach(kw => keywords.add(kw));
  
  // Extract common import/sourcing keywords
  const commonKeywords = [
    'import', 'china', 'supplier', 'wholesale', 'dropship',
    '1688', 'alibaba', 'amazon', 'fba', 'margin', 'profit'
  ];
  
  const contentLower = content.toLowerCase();
  commonKeywords.forEach(kw => {
    if (contentLower.includes(kw)) {
      keywords.add(kw);
    }
  });
  
  return Array.from(keywords).slice(0, 10);
}

/**
 * Generate URL slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

/**
 * Generate schema.org markup
 */
export function generateSchema(article, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.content.substring(0, 200),
    author: {
      '@type': 'Organization',
      name: 'Import Guide 1688'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Import Guide 1688',
      logo: {
        '@type': 'ImageObject',
        url: 'https://importguide1688.com/logo.png'
      }
    },
    datePublished: article.createdAt,
    dateModified: article.metadata?.editedAt || article.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://importguide1688.com/articles/${url}`
    }
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Analyze content for SEO issues
 */
export function analyzeSEO(content, metadata = {}) {
  const issues = [];
  const recommendations = [];
  
  // Check title length
  if (metadata.title && metadata.title.length > 60) {
    issues.push('Title exceeds 60 characters');
    recommendations.push('Shorten title to under 60 characters');
  }
  
  // Check description length
  if (metadata.description && metadata.description.length > 160) {
    issues.push('Meta description exceeds 160 characters');
    recommendations.push('Shorten description to under 160 characters');
  }
  
  // Check for primary keyword in first 100 words
  if (metadata.primaryKeyword) {
    const first100Words = content.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    if (!first100Words.includes(metadata.primaryKeyword.toLowerCase())) {
      issues.push('Primary keyword not found in first 100 words');
      recommendations.push(`Add "${metadata.primaryKeyword}" to the beginning of the article`);
    }
  }
  
  // Check for headings
  const h1Count = (content.match(/^# /gm) || []).length;
  if (h1Count === 0) {
    issues.push('No H1 heading found');
    recommendations.push('Add an H1 heading to the article');
  } else if (h1Count > 1) {
    issues.push('Multiple H1 headings found');
    recommendations.push('Use only one H1 heading');
  }
  
  // Check for images
  const imageCount = (content.match(/!\[/g) || []).length;
  if (imageCount === 0) {
    issues.push('No images found');
    recommendations.push('Add relevant images to improve engagement');
  }
  
  // Check content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) {
    issues.push('Content too short (under 300 words)');
    recommendations.push('Expand content to at least 800 words for bronze tier');
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
