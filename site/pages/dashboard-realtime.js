import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import fs from 'fs'
import path from 'path'

export async function getStaticProps() {
  const contentDir = path.join(process.cwd(), '..', 'content-db')
  
  // Count bronze by language
  const bronzeByLang = {}
  const rawDir = path.join(contentDir, 'raw')
  if (fs.existsSync(rawDir)) {
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const itemPath = path.join(dir, item)
        if (fs.statSync(itemPath).isDirectory()) {
          scanDir(itemPath)
        } else if (item.endsWith('.json')) {
          try {
            const data = JSON.parse(fs.readFileSync(itemPath, 'utf8'))
            const lang = data.language || 'unknown'
            bronzeByLang[lang] = (bronzeByLang[lang] || 0) + 1
          } catch (e) {}
        }
      }
    }
    scanDir(rawDir)
  }
  
  // Count articles by tier
  const silverCount = fs.existsSync(path.join(contentDir, 'silver'))
    ? fs.readdirSync(path.join(contentDir, 'silver')).filter(f => f.endsWith('.md')).length
    : 0
  
  const bronzeCount = fs.existsSync(path.join(contentDir, 'bronze'))
    ? fs.readdirSync(path.join(contentDir, 'bronze')).filter(f => f.endsWith('.md')).length
    : 0
  
  // Count scripts
  const scriptsDir = path.join(process.cwd(), '..', 'scripts')
  const scriptsCount = fs.existsSync(scriptsDir)
    ? fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js')).length
    : 0
  
  return {
    props: {
      bronzeByLang,
      silverCount,
      bronzeCount,
      scriptsCount,
      lastUpdated: new Date().toISOString()
    }
  }
}

export default function DashboardRealtime({ bronzeByLang, silverCount, bronzeCount, scriptsCount, lastUpdated }) {
  const [refreshing, setRefreshing] = useState(false)
  
  const totalBronze = Object.values(bronzeByLang).reduce((a, b) => a + b, 0)
  
  return (
    <Layout title="Real-time Dashboard" description="Live metrics for the content pipeline">
      <section className="dashboard">
        <div className="container">
          <h1>Real-time Dashboard</h1>
          <p className="last-updated">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Bronze Sources</h3>
              <div className="metric-value">{totalBronze}</div>
              <div className="metric-label">Total Files</div>
            </div>
            
            <div className="metric-card">
              <h3>Silver Articles</h3>
              <div className="metric-value">{silverCount}</div>
              <div className="metric-label">Generated</div>
            </div>
            
            <div className="metric-card">
              <h3>Bronze Articles</h3>
              <div className="metric-value">{bronzeCount}</div>
              <div className="metric-label">Published</div>
            </div>
            
            <div className="metric-card">
              <h3>Scripts</h3>
              <div className="metric-value">{scriptsCount}</div>
              <div className="metric-label">Automation</div>
            </div>
          </div>
          
          <div className="section">
            <h2>Bronze Sources by Language</h2>
            <div className="lang-grid">
              {Object.entries(bronzeByLang).map(([lang, count]) => (
                <div key={lang} className="lang-card">
                  <span className="lang-code">{lang.toUpperCase()}</span>
                  <span className="lang-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .dashboard { padding: 40px 20px; }
        .last-updated { color: #666; font-size: 0.9rem; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px; }
        .metric-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; padding: 20px; text-align: center; }
        .metric-card h3 { margin: 0 0 10px 0; font-size: 0.9rem; opacity: 0.8; }
        .metric-value { font-size: 2.5rem; font-weight: bold; }
        .metric-label { font-size: 0.9rem; opacity: 0.8; }
        .section { margin-top: 40px; }
        .section h2 { margin-bottom: 20px; }
        .lang-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
        .lang-card { display: flex; flex-direction: column; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .lang-code { font-weight: bold; color: #667eea; }
        .lang-count { font-size: 1.5rem; font-weight: bold; }
      `}</style>
    </Layout>
  )
}
