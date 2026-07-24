export default function TableOfContents({ content }) {
  // Extract headings from markdown content
  const headings = []
  const regex = /^(#{2,3})\s+(.+)$/gm
  let match
  
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
      id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-')
    })
  }
  
  if (headings.length === 0) return null
  
  return (
    <nav className="table-of-contents">
      <h3>Table of Contents</h3>
      <ul>
        {headings.map((heading, index) => (
          <li key={index} className={`level-${heading.level}`}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
      
      <style jsx>{`
        .table-of-contents {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .table-of-contents h3 {
          margin: 0 0 15px 0;
          font-size: 1rem;
          color: #333;
        }
        .table-of-contents ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .table-of-contents li {
          margin-bottom: 8px;
        }
        .table-of-contents a {
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
        }
        .table-of-contents a:hover {
          text-decoration: underline;
        }
        .level-3 {
          padding-left: 20px;
        }
      `}</style>
    </nav>
  )
}
