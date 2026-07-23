export const meta = {
  name: "api-endpoint",
  description: "HTTP API for direct communication between MiMo instances"
};

import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.MIMO_API_PORT || 8888;
const ARTICLES_DIR = path.join(process.cwd(), 'content-db/articles');
const API_KEY = process.env.MIMO_API_KEY || 'your-secret-key-here';

// Ensure articles directory exists
if (!fs.existsSync(ARTICLES_DIR)) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

function verifyAuth(req) {
  const auth = req.headers['authorization'];
  return auth === `Bearer ${API_KEY}`;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export default async function() {
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    // Health check
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ 
        status: 'ok', 
        instance: 'mimo-gcp',
        timestamp: new Date().toISOString()
      }));
    }

    // Auth check for all other routes
    if (!verifyAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    // Publish article
    if (req.method === 'POST' && req.url === '/publish') {
      try {
        const article = await parseBody(req);
        
        // Validate required fields
        if (!article.title || !article.content || !article.site) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            error: 'Missing required fields: title, content, site' 
          }));
        }

        // Generate filename
        const slug = article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        
        const filename = `${Date.now()}-${slug}.json`;
        const filepath = path.join(ARTICLES_DIR, filename);

        // Add metadata
        const articleData = {
          ...article,
          id: filename.replace('.json', ''),
          received_at: new Date().toISOString(),
          status: 'pending'
        };

        // Save article
        fs.writeFileSync(filepath, JSON.stringify(articleData, null, 2));

        log(`Article received: ${article.title} (site: ${article.site})`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          success: true, 
          id: articleData.id,
          message: 'Article received and queued for publishing'
        }));

      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: error.message }));
      }
    }

    // Batch publish
    if (req.method === 'POST' && req.url === '/publish/batch') {
      try {
        const { articles } = await parseBody(req);
        
        if (!Array.isArray(articles)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'articles must be an array' }));
        }

        const results = [];
        for (const article of articles) {
          const slug = article.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          
          const filename = `${Date.now()}-${slug}.json`;
          const filepath = path.join(ARTICLES_DIR, filename);

          const articleData = {
            ...article,
            id: filename.replace('.json', ''),
            received_at: new Date().toISOString(),
            status: 'pending'
          };

          fs.writeFileSync(filepath, JSON.stringify(articleData, null, 2));
          results.push({ id: articleData.id, status: 'received' });
        }

        log(`Batch received: ${articles.length} articles`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          success: true, 
          count: results.length,
          results 
        }));

      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: error.message }));
      }
    }

    // Get pending articles
    if (req.method === 'GET' && req.url === '/articles/pending') {
      const files = fs.readdirSync(ARTICLES_DIR)
        .filter(f => f.endsWith('.json'));
      
      const articles = files.map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f)));
        return { id: data.id, title: data.title, site: data.site, status: data.status };
      }).filter(a => a.status === 'pending');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ articles, count: articles.length }));
    }

    // Mark article as published
    if (req.method === 'POST' && req.url.startsWith('/articles/') && req.url.endsWith('/publish')) {
      const id = req.url.split('/')[2];
      const filepath = path.join(ARTICLES_DIR, `${id}.json`);
      
      if (!fs.existsSync(filepath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Article not found' }));
      }

      const article = JSON.parse(fs.readFileSync(filepath));
      article.status = 'published';
      article.published_at = new Date().toISOString();
      
      fs.writeFileSync(filepath, JSON.stringify(article, null, 2));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, id }));
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(PORT, '0.0.0.0', () => {
    log(`\n=== MiMo API Endpoint Started ===`);
    log(`Port: ${PORT}`);
    log(`Health: http://localhost:${PORT}/health`);
    log(`Publish: POST http://localhost:${PORT}/publish`);
    log(`Batch: POST http://localhost:${PORT}/publish/batch`);
    log(`Pending: GET http://localhost:${PORT}/articles/pending`);
    log(`\nWaiting for connections...`);
  });
}
