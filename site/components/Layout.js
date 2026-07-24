import Head from 'next/head'
import Link from 'next/link'
import { SEO } from './SEO'
import BackToTop from './BackToTop'

export default function Layout({ children, title, description, url, image, article }) {
  return (
    <>
      <SEO 
        title={title} 
        description={description} 
        url={url}
        image={image}
        article={article}
      />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Plausible Analytics */}
        <script defer data-domain="importguide1688.com" src="https://plausible.io/js/script.js"></script>
      </Head>

      <header className="header">
        <div className="container">
          <Link href="/" className="logo">
            ImportGuide1688
          </Link>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/articles">Articles</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h4>Import Guide 1688</h4>
              <p>Your trusted source for China import guides, product sourcing, and supplier reviews.</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/search">Search</Link>
              <Link href="/status">Status</Link>
            </div>
            
            <div className="footer-section">
              <h4>Categories</h4>
              <Link href="/blog?filter=bronze">Bronze Guides</Link>
              <Link href="/blog?filter=silver">Silver Guides</Link>
              <Link href="/category/electronics">Electronics</Link>
              <Link href="/category/fashion">Fashion</Link>
            </div>
            
            <div className="footer-section">
              <h4>Company</h4>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
              <a href="/feed.xml">RSS Feed</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} ImportGuide1688. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <BackToTop />
    </>
  )
}
