# Skill: Remote Publish

Direct communication between MiMo instances for article publishing.

## When to Use

- User asks to "publish to GCP", "send article to server"
- User asks to "check GCP status", "verify remote instance"
- User wants to publish articles from local to remote

## Setup

### 1. Configure GCP Instance

Set environment variables on GCP:

```bash
export MIMO_API_PORT=8888
export MIMO_API_KEY="your-secret-key-here"
```

### 2. Start API Endpoint on GCP

```bash
mimo run api-endpoint
```

### 3. Configure Local Instance

Set environment variables locally:

```bash
export MIMO_GCP_ENDPOINT="http://YOUR_GCP_IP:8888"
export MIMO_API_KEY="your-secret-key-here"
```

## Usage

### Check Health
```bash
mimo run api-client --action health
```

### Publish Single Article
```bash
mimo run api-client --action publish --article '{
  "title": "LED Strip Lights Guide",
  "content": "...",
  "site": "importasimples.com",
  "tier": "bronze"
}'
```

### Batch Publish
```bash
mimo run api-client --action batch --articles '[...]'
```

### Check Pending
```bash
mimo run api-client --action pending
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/publish` | POST | Publish single article |
| `/publish/batch` | POST | Batch publish articles |
| `/articles/pending` | GET | Get pending articles |
| `/articles/:id/publish` | POST | Mark as published |

## Article Format

```json
{
  "title": "Article Title",
  "content": "Article content in markdown...",
  "site": "domain.com",
  "tier": "bronze|silver|gold",
  "metadata": {
    "keywords": ["keyword1", "keyword2"],
    "category": "electronics"
  }
}
```

## Security

- API key authentication required
- Use HTTPS in production
- Restrict IP access if possible
