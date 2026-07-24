import Head from 'next/head'
import Link from 'next/link'

export default function Layout({ children, title, description }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} | ImportGuide1688` : 'ImportGuide1688 - China Import Guides'}</title>
        <meta name="description" content={description || 'Expert guides for importing products from China via 1688.com'} />
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
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} ImportGuide1688. All rights reserved.</p>
            <p>Your trusted source for China import guides</p>
          </div>
        </div>
      </footer>
    </>
  )
}
