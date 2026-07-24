import Layout from '../components/Layout'
import Link from 'next/link'
import Newsletter from '../components/Newsletter'

const featuredArticles = [
  {
    slug: 'led-strip-lights-price-moq-supplier-guide-2026',
    title: 'LED Strip Lights: Price, MOQ & Supplier Guide (2026)',
    tier: 'bronze',
    readTime: '4 min',
    excerpt: 'LED Strip Lights is trending in Q3 2026. Average margin: 45-65%. Main suppliers: Guangdong, China.',
  },
  {
    slug: 'bronze-led-strips',
    title: 'LED Strip Lights: Complete Import Guide',
    tier: 'silver',
    readTime: '8 min',
    excerpt: 'LED strip lights are one of the most profitable products to import from China in 2026.',
  },
  {
    slug: 'phone-cases-wholesale-guide',
    title: 'Phone Cases: Wholesale Pricing & Supplier Directory',
    tier: 'bronze',
    readTime: '5 min',
    excerpt: 'Phone cases remain a high-demand, low-risk product for importers.',
  },
]

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '📱' },
  { name: 'Fashion', slug: 'fashion', icon: '👕' },
  { name: 'Home & Kitchen', slug: 'home', icon: '🏠' },
  { name: 'Fitness', slug: 'fitness', icon: '💪' },
  { name: 'Beauty', slug: 'beauty', icon: '✨' },
  { name: 'Pet Products', slug: 'pet', icon: '🐾' },
]

const latestArticles = [
  {
    slug: 'yoga-mats-import-guide',
    title: 'Yoga Mats: Import Guide & Margin Analysis',
    tier: 'bronze',
    readTime: '6 min',
  },
  {
    slug: 'kitchen-gadgets-1688',
    title: 'Kitchen Gadgets: Best Sellers on 1688',
    tier: 'silver',
    readTime: '7 min',
  },
  {
    slug: 'resistance-bands-import',
    title: 'Resistance Bands: Import Guide',
    tier: 'bronze',
    readTime: '5 min',
  },
  {
    slug: 'bluetooth-earbuds-comparison',
    title: 'Bluetooth Earbuds: Price Comparison',
    tier: 'silver',
    readTime: '6 min',
  },
]

export default function Home() {
  return (
    <Layout title="Home" description="Expert guides for importing products from China via 1688.com">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Import from China with Confidence</h1>
          <p>Expert guides, supplier directories, and margin calculators for 1688.com importers</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Guides</span>
            </div>
            <div className="stat">
              <span className="stat-number">100+</span>
              <span className="stat-label">Suppliers</span>
            </div>
            <div className="stat">
              <span className="stat-number">40-70%</span>
              <span className="stat-label">Avg Margin</span>
            </div>
          </div>
          <div className="hero-cta-group">
            <Link href="/blog" className="hero-cta primary">Explore Guides →</Link>
            <Link href="/search" className="hero-cta secondary">Search Products</Link>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="section container">
        <div className="section-header">
          <h2>Featured Articles</h2>
          <p>Our most popular guides for importers</p>
        </div>
        <div className="featured-grid">
          {featuredArticles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`} className="featured-card">
              <span className={`tier-badge tier-${article.tier}`}>{article.tier}</span>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <span className="read-time">{article.readTime} read</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section container">
        <div className="section-header">
          <h2>Browse by Category</h2>
          <p>Find guides for your niche</p>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="category-card">
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section container">
        <Newsletter />
      </section>

      {/* Latest Articles */}
      <section className="section container">
        <div className="section-header">
          <h2>Latest Articles</h2>
          <Link href="/blog" className="view-all">View all →</Link>
        </div>
        <div className="articles-grid">
          {latestArticles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`} className="article-card">
              <span className={`tier-badge tier-${article.tier}`}>{article.tier}</span>
              <h3>{article.title}</h3>
              <span className="read-time">{article.readTime} read</span>
            </Link>
          ))}
        </div>
      </section>

      <style jsx>{`
        .hero {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
        }
        .hero h1 { font-size: 2.5rem; margin-bottom: 15px; }
        .hero p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 30px; }
        .hero-stats { display: flex; justify-content: center; gap: 40px; margin-bottom: 30px; }
        .stat { text-align: center; }
        .stat-number { display: block; font-size: 2rem; font-weight: bold; color: #667eea; }
        .stat-label { font-size: 0.9rem; opacity: 0.8; }
        .hero-cta-group { display: flex; gap: 15px; justify-content: center; }
        .hero-cta { padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
        .hero-cta.primary { background: #667eea; color: white; }
        .hero-cta.primary:hover { background: #5a6fd6; }
        .hero-cta.secondary { border: 2px solid white; color: white; }
        .hero-cta.secondary:hover { background: white; color: #1a1a2e; }
        
        .section { padding: 60px 20px; }
        .section-header { margin-bottom: 30px; }
        .section-header h2 { font-size: 1.75rem; color: #1a1a2e; margin-bottom: 5px; }
        .section-header p { color: #666; }
        .view-all { color: #667eea; text-decoration: none; font-weight: bold; }
        
        .featured-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .featured-card { background: white; border-radius: 12px; padding: 25px; text-decoration: none; color: inherit; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
        .featured-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .featured-card h3 { font-size: 1.1rem; margin: 15px 0 10px; }
        .featured-card p { color: #666; font-size: 0.9rem; margin-bottom: 10px; }
        
        .categories-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .category-card { display: flex; flex-direction: column; align-items: center; padding: 25px 15px; background: #f8f9fa; border-radius: 12px; text-decoration: none; color: inherit; transition: background 0.2s; }
        .category-card:hover { background: #e9ecef; }
        .category-icon { font-size: 2rem; margin-bottom: 10px; }
        .category-name { font-weight: 500; }
        
        .articles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .article-card { background: white; border-radius: 10px; padding: 20px; text-decoration: none; color: inherit; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.2s; }
        .article-card:hover { transform: translateY(-3px); }
        .article-card h3 { font-size: 1rem; margin: 10px 0; }
        
        .tier-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .tier-bronze { background: #cd7f32; color: white; }
        .tier-silver { background: #c0c0c0; color: #333; }
        .read-time { display: block; font-size: 0.8rem; color: #999; margin-top: 8px; }
      `}</style>
    </Layout>
  )
}
