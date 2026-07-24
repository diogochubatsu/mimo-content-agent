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
      
      // Extract keywords from content
      const keywords = []
      const contentLower = content.toLowerCase()
      const commonKeywords = ['1688', 'alibaba', 'amazon', 'import', 'china', 'supplier', 'dropship', 'fba', 'margin']
      commonKeywords.forEach(kw => {
        if (contentLower.includes(kw)) keywords.push(kw)
      })
      
      articles.push({
        slug: file.replace('.md', ''),
        title,
        tier,
        keywords
      })
    }
  }
  
  return { props: { articles } }
}

export default function Search({ articles }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  
  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.toLowerCase()
    
    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(q) ||
      article.keywords.some(kw => kw.includes(q))
    )
    
    setResults(filtered)
  }
  
  return (
    <Layout title="Search" description="Search our import guides">
      <section className="search-page">
        <div className="container">
          <h1>Search Articles</h1>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, suppliers, guides..."
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
          
          {results.length > 0 && (
            <div className="results">
              <p>{results.length} results found</p>
              {results.map(article => (
                <Link key={article.slug} href={`/articles/${article.slug}`} className="result-item">
                  <span className="tier-badge tier-${article.tier}">{article.tier}</span>
                  <h3>{article.title}</h3>
                  <p>Keywords: {article.keywords.join(', ')}</p>
                </Link>
              ))}
            </div>
          )}
          
          {query && results.length === 0 && (
            <p className="no-results">No articles found for "{query}"</p>
          )}
        </div>
      </section>
      
      <style jsx>{`
        .search-page { padding: 40px 20px; }
        .search-form { display: flex; gap: 10px; margin: 30px 0; }
        .search-input { flex: 1; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
        .search-button { padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; }
        .search-button:hover { background: #5a6fd6; }
        .results { margin-top: 30px; }
        .result-item { display: block; padding: 15px; margin: 10px 0; background: #f8f9fa; border-radius: 8px; text-decoration: none; color: inherit; }
        .result-item:hover { background: #e9ecef; }
        .tier-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-right: 10px; }
        .tier-bronze { background: #cd7f32; color: white; }
        .tier-silver { background: #c0c0c0; color: #333; }
        .no-results { color: #666; text-align: center; margin-top: 30px; }
      `}</style>
    </Layout>
  )
}
