import Layout from '../components/Layout'
import fs from 'fs'
import path from 'path'

export async function getStaticProps() {
  const contentDir = path.join(process.cwd(), '..', 'content-db')
  const tasksFile = path.join(process.cwd(), '..', 'TASKS.json')
  
  // Count articles by tier
  const tiers = { bronze: 0, silver: 0, gold: 0 }
  for (const tier of Object.keys(tiers)) {
    const dir = path.join(contentDir, tier)
    if (fs.existsSync(dir)) {
      tiers[tier] = fs.readdirSync(dir).filter(f => f.endsWith('.md')).length
    }
  }
  
  // Count raw sources
  let rawSources = 0
  const rawDir = path.join(contentDir, 'raw')
  if (fs.existsSync(rawDir)) {
    const countFiles = (dir) => {
      let count = 0
      try {
        const items = fs.readdirSync(dir)
        for (const item of items) {
          const itemPath = path.join(dir, item)
          if (fs.statSync(itemPath).isDirectory()) {
            count += countFiles(itemPath)
          } else if (item.endsWith('.json')) {
            count++
          }
        }
      } catch (e) {}
      return count
    }
    rawSources = countFiles(rawDir)
  }
  
  // Count tasks
  let tasks = { done: 0, pending: 0, in_progress: 0 }
  try {
    const tasksData = JSON.parse(fs.readFileSync(tasksFile, 'utf8'))
    tasks.done = tasksData.tasks.filter(t => t.status === 'done').length
    tasks.pending = tasksData.tasks.filter(t => t.status === 'pending').length
    tasks.in_progress = tasksData.tasks.filter(t => t.status === 'in_progress').length
  } catch (e) {}
  
  // Count scripts
  const scriptsDir = path.join(process.cwd(), '..', 'scripts')
  let scripts = 0
  if (fs.existsSync(scriptsDir)) {
    scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js')).length
  }
  
  // Count tests
  const testsDir = path.join(process.cwd(), '..', 'tests')
  let tests = 0
  if (fs.existsSync(testsDir)) {
    tests = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js')).length
  }
  
  return {
    props: {
      tiers,
      totalArticles: Object.values(tiers).reduce((a, b) => a + b, 0),
      rawSources,
      tasks,
      scripts,
      tests,
      lastUpdated: new Date().toISOString()
    }
  }
}

export default function Dashboard({ tiers, totalArticles, rawSources, tasks, scripts, tests, lastUpdated }) {
  return (
    <Layout title="Dashboard" description="System metrics and performance dashboard">
      <section className="dashboard">
        <div className="container">
          <h1>Dashboard</h1>
          <p className="last-updated">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Content</h3>
              <div className="metric-value">{totalArticles}</div>
              <div className="metric-label">Total Articles</div>
              <div className="metric-breakdown">
                <span>Bronze: {tiers.bronze}</span>
                <span>Silver: {tiers.silver}</span>
                <span>Gold: {tiers.gold}</span>
              </div>
            </div>
            
            <div className="metric-card">
              <h3>Sources</h3>
              <div className="metric-value">{rawSources}</div>
              <div className="metric-label">Raw Sources</div>
            </div>
            
            <div className="metric-card">
              <h3>Tasks</h3>
              <div className="metric-value">{tasks.done}</div>
              <div className="metric-label">Completed</div>
              <div className="metric-breakdown">
                <span>Pending: {tasks.pending}</span>
                <span>In Progress: {tasks.in_progress}</span>
              </div>
            </div>
            
            <div className="metric-card">
              <h3>Code</h3>
              <div className="metric-value">{scripts}</div>
              <div className="metric-label">Scripts</div>
              <div className="metric-breakdown">
                <span>Tests: {tests}</span>
              </div>
            </div>
          </div>
          
          <div className="progress-section">
            <h2>Progress</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(tasks.done / (tasks.done + tasks.pending)) * 100}%` }}></div>
            </div>
            <p>{Math.round((tasks.done / (tasks.done + tasks.pending)) * 100)}% tasks completed</p>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .dashboard {
          padding: 40px 20px;
        }
        .last-updated {
          color: #666;
          font-size: 0.9rem;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .metric-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .metric-card h3 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .metric-value {
          font-size: 2.5rem;
          font-weight: bold;
        }
        .metric-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 5px;
        }
        .metric-breakdown {
          margin-top: 10px;
          font-size: 0.8rem;
          opacity: 0.7;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .progress-section {
          margin-top: 40px;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
        }
        .progress-bar {
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          margin: 15px 0;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          transition: width 0.5s ease;
        }
      `}</style>
    </Layout>
  )
}
