import Link from 'next/link'

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((item, index) => (
        <span key={index}>
          <span className="separator">›</span>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className="current">{item.label}</span>
          )}
        </span>
      ))}
      
      <style jsx>{`
        .breadcrumbs {
          padding: 15px 0;
          font-size: 0.9rem;
          color: #666;
        }
        .breadcrumbs a {
          color: #667eea;
          text-decoration: none;
        }
        .breadcrumbs a:hover {
          text-decoration: underline;
        }
        .separator {
          margin: 0 8px;
          color: #ccc;
        }
        .current {
          color: #333;
        }
      `}</style>
    </nav>
  )
}
