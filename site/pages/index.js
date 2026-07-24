import Layout from '../components/Layout'
import Link from 'next/link'

const articles = [
  {
    slug: 'led-strip-lights-price-moq-supplier-guide-2026',
    title: 'LED Strip Lights: Price, MOQ & Supplier Guide (2026)',
    tier: 'bronze',
    date: 'July 23, 2026',
    readTime: '4 min',
    excerpt: 'LED Strip Lights is trending in Q3 2026. Average margin: 45-65%. Main suppliers: Guangdong, China. Common MOQ: 50-100 units.',
  },
  {
    slug: 'bronze-led-strips',
    title: 'LED Strip Lights: Price, MOQ, Suppliers Guide 2026',
    tier: 'silver',
    date: 'July 24, 2026',
    readTime: '8 min',
    excerpt: 'LED strip lights are one of the most profitable products to import from China in 2026. With prices ranging from $0.50 to $5 per meter on 1688 and margins of 40-60%.',
  },
  {
    slug: 'phone-cases-wholesale-guide',
    title: 'Phone Cases: Wholesale Pricing & Supplier Directory',
    tier: 'bronze',
    date: 'July 20, 2026',
    readTime: '5 min',
    excerpt: 'Phone cases remain a high-demand, low-risk product for importers. Discover top suppliers in Shenzhen and average margins of 55-70%.',
  },
  {
    slug: 'yoga-mats-import-guide',
    title: 'Yoga Mats: Import Guide & Margin Analysis',
    tier: 'bronze',
    date: 'July 18, 2026',
    readTime: '6 min',
    excerpt: 'The fitness equipment market is booming. Learn how to source yoga mats from China with 40-60% profit margins.',
  },
  {
    slug: 'kitchen-gadgets-1688',
    title: 'Kitchen Gadgets: Best Sellers on 1688',
    tier: 'silver',
    date: 'July 15, 2026',
    readTime: '7 min',
    excerpt: 'Kitchen gadgets are evergreen products with consistent demand. Explore trending items and supplier recommendations.',
  },
]

export default function Home() {
  return (
    <Layout title="Home" description="Expert guides for importing products from China via 1688.com">
      <section className="hero">
        <div className="container">
          <h1>Import from China with Confidence</h1>
          <p>Expert guides, supplier directories, and margin calculators for 1688.com importers</p>
        </div>
      </section>

      <section className="container">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', color: 'var(--secondary)' }}>
          Latest Articles
        </h2>
        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article.slug} className="article-card">
              <div className="article-card-content">
                <span className={`tier-badge tier-${article.tier}`}>{article.tier}</span>
                <h2>{article.title}</h2>
                <div className="meta">
                  {article.date} &middot; {article.readTime} read
                </div>
                <p>{article.excerpt}</p>
                <Link href={`/articles/${article.slug}`} className="read-more">
                  Read more &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  )
}
