import Layout from '../components/Layout'
import fs from 'fs'
import path from 'path'

export async function getStaticProps() {
  const contentDir = path.join(process.cwd(), '..', 'content-db')
  
  // Count articles
  let bronzeCount = 0
  let silverCount = 0
  
  const bronzeDir = path.join(contentDir, 'bronze')
  const silverDir = path.join(contentDir, 'silver')
  
  if (fs.existsSync(bronzeDir)) {
    bronzeCount = fs.readdirSync(bronzeDir).filter(f => f.endsWith('.md')).length
  }
  
  if (fs.existsSync(silverDir)) {
    silverCount = fs.readdirSync(silverDir).filter(f => f.endsWith('.md')).length
  }
  
  // Count raw sources
  let rawSources = 0
  const rawDir = path.join(contentDir, 'raw')
  if (fs.existsSync(rawDir)) {
    const countFiles = (dir) => {
      let count = 0
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const itemPath = path.join(dir, item)
        if (fs.statSync(itemPath).isDirectory()) {
          count += countFiles(itemPath)
        } else if (item.endsWith('.json')) {
          count++
        }
      }
      return count
    }
    rawSources = countFiles(rawDir)
  }
  
  return {
    props: {
      bronzeCount,
      silverCount,
      totalArticles: bronzeCount + silverCount,
      rawSources,
      lastUpdated: new Date().toISOString()
    }
  }
}

export default function Status({ bronzeCount, silverCount, totalArticles, rawSources, lastUpdated }) {
  return (
    <Layout title="System Status" description="Real-time status of the content pipeline">
      <section className="status-page">
        <div className="container">
          <h1>System Status</h1>
          <p className="last-updated">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          
          <div className="status-grid">
            <div className="status-card">
              <h2>Content Database</h2>
              <div className="stat">
                <span className="label">Total Articles</span>
                <span className="value">{totalArticles}</span>
              </div>
              <div className="stat">
                <span className="label">Bronze Articles</span>
                <span className="value">{bronzeCount}</span>
              </div>
              <div className="stat">
                <span className="label">Silver Articles</span>
                <span className="value">{silverCount}</span>
              </div>
            </div>
            
            <div className="status-card">
              <h2>Raw Sources</h2>
              <div className="stat">
                <span className="label">Source Files</span>
                <span className="value">{rawSources}</span>
              </div>
              <div className="stat">
                <span className="label">Platforms</span>
                <span className="value">Reddit, YouTube, TikTok, 1688</span>
              </div>
            </div>
            
            <div className="status-card">
              <h2>Pipeline</h2>
              <div className="stat">
                <span className="label">Status</span>
                <span className="value status-active">Active</span>
              </div>
              <div className="stat">
                <span className="label">Agents</span>
                <span className="value">Scout, Writer, Editor</span>
              </div>
              <div className="stat">
                <span className="label">Cache</span>
                <span className="value">Enabled</span>
              </div>
            </div>
          </div>
          
          <div className="status-footer">
            <p>Powered by MiMo Content Agent Pipeline</p>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .status-page {
          padding: 40px 20px;
        }
        .last-updated {
          color: #666;
          font-size: 0.9rem;
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .status-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        .status-card h2 {
          margin-top: 0;
          color: #333;
        }
        .stat {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .stat:last-child {
          border-bottom: none;
        }
        .label {
          color: #666;
        }
        .value {
          font-weight: bold;
        }
        .status-active {
          color: #28a745;
        }
        .status-footer {
          margin-top: 40px;
          text-align: center;
          color: #999;
        }
      `}</style>
    </Layout>
  )
}
