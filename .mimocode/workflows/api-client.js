export const meta = {
  name: "api-client",
  description: "Client for sending articles to remote MiMo instance"
};

const GCP_ENDPOINT = process.env.MIMO_GCP_ENDPOINT || 'http://YOUR_GCP_IP:8888';
const API_KEY = process.env.MIMO_API_KEY || 'your-secret-key-here';

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${GCP_ENDPOINT}${endpoint}`, options);
  return response.json();
}

export default async function(args) {
  const { action, article, articles } = args || {};

  // Health check
  if (action === 'health') {
    phase("Checking GCP instance health");
    const result = await apiCall('/health');
    log(`Status: ${result.status}`);
    log(`Instance: ${result.instance}`);
    log(`Timestamp: ${result.timestamp}`);
    return result;
  }

  // Publish single article
  if (action === 'publish' && article) {
    phase("Publishing article to GCP");
    log(`Title: ${article.title}`);
    log(`Site: ${article.site}`);
    
    const result = await apiCall('/publish', 'POST', article);
    
    if (result.success) {
      log(`✓ Article published: ${result.id}`);
    } else {
      log(`✗ Error: ${result.error}`);
    }
    
    return result;
  }

  // Batch publish
  if (action === 'batch' && articles) {
    phase("Batch publishing to GCP");
    log(`Articles: ${articles.length}`);
    
    const result = await apiCall('/publish/batch', 'POST', { articles });
    
    if (result.success) {
      log(`✓ Batch published: ${result.count} articles`);
    } else {
      log(`✗ Error: ${result.error}`);
    }
    
    return result;
  }

  // Get pending articles
  if (action === 'pending') {
    phase("Fetching pending articles from GCP");
    const result = await apiCall('/articles/pending');
    log(`Pending: ${result.count} articles`);
    return result;
  }

  log('Usage:');
  log('  action: health     - Check GCP instance');
  log('  action: publish    - Publish single article');
  log('  action: batch      - Batch publish articles');
  log('  action: pending    - Get pending articles');
}
