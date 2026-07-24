import { useState } from 'react'
import Layout from '../components/Layout'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'

export async function getStaticProps() {
  const contentDir = path.join(process.cwd(), '..', 'content-db')
  const articles = []
  
  for (const tier of ['bronze', 'silver']) {
    const dir = path.join(contentDir, tier)
    if (!fs.existsSync(dir)) continue
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8')
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '')
      
      // Extract first paragraph as excerpt
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'))
      const excerpt = (lines[0] || '').substring(0, 150)
      
      articles.push({
        slug: file.replace('.md', ''),
        title,
        tier,
        excerpt
      })
    }
  }
  
  return { props: { articles } }
}

export default function Blog({ articles }) {
  const [filter, setFilter] = useState('all')
  
  const filtered = filter === 'all' 
    ? articles 
    : articles.filter(a => a.tier === filter)
  
  return (
    <Layout title="Blog" description="Import guides and sourcing tips">
      <section className="blog-page">
        <div className="container">
          <h1>Blog</h1>
          <p className="subtitle">Import guides, product finds, and sourcing tips from China</p>
          
          <div className="filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({articles.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'bronze' ? 'active' : ''}`}
              onClick={() => setFilter('bronze')}
            >
              Bronze ({articles.filter(a => a.tier === 'bronze').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'silver' ? 'active' : ''}`}
              onClick={() => setFilter('silver')}
            >
              Silver ({articles.filter(a => a.tier === 'silver').length})
            </button>
          </div>
          
          <div className="articles-grid">
            {filtered.map(article => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="article-card">
                <span className={`tier-badge tier-${article.tier}`}>{article.tier}</span>
                <h2>{article.title}</h2>
                <p>{article.excerpt}...</p>
                <span className="read-more">Read more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .blog-page { padding: 40px 20px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .filters { display: flex; gap: 10px; margin-bottom: 30px; }
        .filter-btn { padding: 8px 16px; border: 2px solid #ddd; background: white; border-radius: 20px; cursor: pointer; }
        .filter-btn.active { background: #667eea; color: white; border-color: #667eea; }
        .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .article-card { background: white; border-radius: 12px; padding: 20px; text-decoration: none; color: inherit; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .article-card:hover { transform: translateY(-5px); }
        .article-card h2 { font-size: 1.2rem; margin: 10px 0; }
        .article-card p { color: #666; font-size: 0.9rem; }
        .read-more { color: #667eea; font-weight: bold; }
        .tier-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
        .tier-bronze { background: #cd7f32; color: white; }
        .tier-silver { background: #c0c0c0; color: #333; }
      `}</style>
    </Layout>
  )
}
