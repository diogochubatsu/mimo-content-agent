import Layout from '../components/Layout'
import fs from 'fs'
import path from 'path'

export async function getStaticProps() {
  const contentDir = path.join(process.cwd(), '..', 'content-db')
  
  // Count bronze by grade
  const bronzeDir = path.join(contentDir, 'raw')
  let gradeA = 0, gradeB = 0, gradeC = 0, gradeF = 0
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const itemPath = path.join(dir, item)
      if (fs.statSync(itemPath).isDirectory()) {
        scanDir(itemPath)
      } else if (item.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(itemPath, 'utf8'))
          const firstItem = Array.isArray(data) ? data[0] : data
          const hasDate = firstItem?.date
          const hasLang = firstItem?.language
          const hasPlatform = firstItem?.platform
          
          if (hasDate && hasLang && hasPlatform) gradeA++
          else if (hasDate || hasLang) gradeB++
          else gradeC++
        } catch (e) { gradeF++ }
      }
    }
  }
  scanDir(bronzeDir)
  
  // Count silver articles
  const silverDir = path.join(contentDir, 'silver')
  const silverCount = fs.existsSync(silverDir)
    ? fs.readdirSync(silverDir).filter(f => f.endsWith('.md')).length
    : 0
  
  // Count scripts
  const scriptsDir = path.join(process.cwd(), '..', 'scripts')
  const scriptsCount = fs.existsSync(scriptsDir)
    ? fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js')).length
    : 0
  
  return {
    props: {
      bronzeQuality: { a: gradeA, b: gradeB, c: gradeC, f: gradeF },
      silverCount,
      scriptsCount,
      lastUpdated: new Date().toISOString()
    }
  }
}

export default function QualityDashboard({ bronzeQuality, silverCount, scriptsCount, lastUpdated }) {
  const totalBronze = bronzeQuality.a + bronzeQuality.b + bronzeQuality.c + bronzeQuality.f
  
  return (
    <Layout title="Quality Dashboard" description="Bronze and Silver quality metrics">
      <section className="dashboard">
        <div className="container">
          <h1>Quality Dashboard</h1>
          <p className="last-updated">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          
          <div className="metrics-grid">
            <div className="metric-card grade-a">
              <h3>Grade A</h3>
              <div className="metric-value">{bronzeQuality.a}</div>
              <div className="metric-label">sources</div>
            </div>
            <div className="metric-card grade-b">
              <h3>Grade B</h3>
              <div className="metric-value">{bronzeQuality.b}</div>
              <div className="metric-label">sources</div>
            </div>
            <div className="metric-card grade-c">
              <h3>Grade C</h3>
              <div className="metric-value">{bronzeQuality.c}</div>
              <div className="metric-label">sources</div>
            </div>
            <div className="metric-card grade-f">
              <h3>Grade F</h3>
              <div className="metric-value">{bronzeQuality.f}</div>
              <div className="metric-label">sources</div>
            </div>
          </div>
          
          <div className="section">
            <h2>Summary</h2>
            <p>Total bronze sources: {totalBronze}</p>
            <p>Silver articles: {silverCount}</p>
            <p>Scripts: {scriptsCount}</p>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .dashboard { padding: 40px 20px; }
        .last-updated { color: #666; font-size: 0.9rem; }
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .metric-card { border-radius: 12px; padding: 20px; text-align: center; color: white; }
        .grade-a { background: #28a745; }
        .grade-b { background: #ffc107; color: #333; }
        .grade-c { background: #dc3545; }
        .grade-f { background: #6c757d; }
        .metric-card h3 { margin: 0 0 10px 0; }
        .metric-value { font-size: 2.5rem; font-weight: bold; }
        .metric-label { font-size: 0.9rem; opacity: 0.8; }
        .section { margin-top: 30px; }
      `}</style>
    </Layout>
  )
}
