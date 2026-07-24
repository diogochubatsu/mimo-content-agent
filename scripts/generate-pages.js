#!/usr/bin/env node

/**
 * Generate Next.js pages from content-db articles
 * Usage: node scripts/generate-pages.js
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content-db');
const SITE_PAGES_DIR = path.join(process.cwd(), 'site', 'pages', 'articles');

// Ensure output directory exists
if (!fs.existsSync(SITE_PAGES_DIR)) {
  fs.mkdirSync(SITE_PAGES_DIR, { recursive: true });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    }
  }
  
  return frontmatter;
}

function extractContent(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function generateArticlePage(slug, frontmatter, content) {
  return `import Layout from '../../components/Layout'
import { SEO, ArticleSchema } from '../../components/SEO'

export async function getStaticProps() {
  return {
    props: {
      title: "${frontmatter.title || slug}",
      description: "${frontmatter.description || ''}",
      slug: "${slug}",
      tier: "${frontmatter.tier || 'silver'}",
      content: \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
    }
  }
}

export default function Article({ title, description, slug, tier, content }) {
  const article = {
    title,
    description,
    slug,
    createdAt: new Date().toISOString()
  }

  return (
    <Layout title={title} description={description} url={\`/articles/\${slug}\`}>
      <SEO title={title} description={description} url={\`/articles/\${slug}\`} />
      <ArticleSchema article={article} />
      
      <article className="article">
        <div className="container">
          <header className="article-header">
            <span className="tier-badge tier-\${tier}">{tier}</span>
            <h1>{title}</h1>
            <p className="description">{description}</p>
          </header>
          
          <div className="article-content" 
               dangerouslySetInnerHTML={{ __html: content.replace(/\\n/g, '<br/>') }} />
        </div>
      </article>
    </Layout>
  )
}
`;
}

// Process all content directories
const dirs = ['bronze', 'silver'];
let generated = 0;

for (const dir of dirs) {
  const dirPath = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    const frontmatter = parseFrontmatter(content);
    const articleContent = extractContent(content);
    
    const pageContent = generateArticlePage(slug, frontmatter, articleContent);
    const pagePath = path.join(SITE_PAGES_DIR, `${slug}.js`);
    
    fs.writeFileSync(pagePath, pageContent);
    console.log(`✓ Generated: articles/${slug}.js`);
    generated++;
  }
}

console.log(`\nGenerated ${generated} article pages`);
