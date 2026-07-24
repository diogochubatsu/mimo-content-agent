export default function ShareButtons({ title, url }) {
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)
  
  const shareLinks = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: '🐦'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      icon: '💼'
    },
    {
      name: 'Reddit',
      url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: '🔴'
    },
    {
      name: 'Pinterest',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      icon: '📌'
    }
  ]

  return (
    <div className="share-buttons">
      <span className="share-label">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="share-button"
          aria-label={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
      
      <style jsx>{`
        .share-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 0;
          border-top: 1px solid #eee;
          margin-top: 30px;
        }
        .share-label {
          color: #666;
          font-weight: 500;
        }
        .share-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f8f9fa;
          text-decoration: none;
          font-size: 1.2rem;
          transition: background 0.2s, transform 0.2s;
        }
        .share-button:hover {
          background: #e9ecef;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}
