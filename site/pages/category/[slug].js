import Layout from '../../components/Layout'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'

export async function getStaticPaths() {
  const categories = ['electronics', 'fashion', 'home', 'fitness', 'beauty', 'pet', 'car', 'kitchen']
  
  const paths = categories.map(slug => ({
    params: { slug }
  }))
  
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const { slug } = params
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
      
      // Check if article belongs to this category
      const contentLower = content.toLowerCase()
      const categoryKeywords = {
        electronics: ['bluetooth', 'earbuds', 'led', 'charger', 'cable'],
        fashion: ['clothing', 'shoes', 'accessories', 'jewelry'],
        home: ['home', 'decor', 'kitchen', 'furniture'],
        fitness: ['yoga', 'fitness', 'resistance', 'bands', 'mat'],
        beauty: ['beauty', 'skincare', 'makeup', 'tools'],
        pet: ['pet', 'dog', 'cat', 'animal'],
        car: ['car', 'auto', 'vehicle', 'accessories'],
        kitchen: ['kitchen', 'gadget', 'cooking', 'food']
      }
      
      const keywords = categoryKeywords[slug] || []
      const matches = keywords.some(kw => contentLower.includes(kw))
      
      if (matches) {
        const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'))
        articles.push({
          slug: file.replace('.md', ''),
          title,
          tier,
          excerpt: (lines[0] || '').substring(0, 150)
        })
      }
    }
  }
  
  return {
    props: {
      category: slug,
      articles
    }
  }
}

export default function CategoryPage({ category, articles }) {
  return (
    <Layout title={`${category} Guides`} description={`Import guides for ${category} products from China`}>
      <section className="category-page">
        <div className="container">
          <h1>{category.charAt(0).toUpperCase() + category.slice(1)} Guides</h1>
          <p className="subtitle">Import guides and sourcing tips for {category} products</p>
          
          {articles.length === 0 ? (
            <p className="no-articles">No articles found for this category yet.</p>
          ) : (
            <div className="articles-grid">
              {articles.map(article => (
                <Link key={article.slug} href={`/articles/${article.slug}`} className="article-card">
                  <span className={`tier-badge tier-${article.tier}`}>{article.tier}</span>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}...</p>
                  <span className="read-more">Read more →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <style jsx>{`
        .category-page { padding: 40px 20px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .article-card { background: white; border-radius: 12px; padding: 20px; text-decoration: none; color: inherit; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .article-card:hover { transform: translateY(-5px); }
        .article-card h2 { font-size: 1.2rem; margin: 10px 0; }
        .article-card p { color: #666; font-size: 0.9rem; }
        .read-more { color: #667eea; font-weight: bold; }
        .tier-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
        .tier-bronze { background: #cd7f32; color: white; }
        .tier-silver { background: #c0c0c0; color: #333; }
        .no-articles { color: #666; text-align: center; margin-top: 40px; }
      `}</style>
    </Layout>
  )
}
