# Skill: GitHub Sync

Communication between MiMo instances via GitHub Issues.

## When to Use

- User wants to "send article to GCP", "publish via GitHub"
- User wants to "check pending articles"
- Alternative to HTTP API communication

## Setup

### 1. GitHub Token

Create a GitHub token with repo permissions:
```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

### 2. Repository

Set the repository:
```bash
export GITHUB_REPO="diogochubatsu/mimo-content-agent"
```

### 3. Labels

Create these labels in your repo:
- `publish` - Article ready to publish
- `pending` - Waiting to be processed
- `published` - Already published

## Usage

### Send Article
```bash
mimo run github-connector --action send --article '{
  "title": "LED Strip Guide",
  "content": "...",
  "site": "importasimples.com",
  "tier": "bronze"
}'
```

### Check Pending
```bash
mimo run github-connector --action pending
```

### Mark as Published
```bash
mimo run github-connector --action published --issueNumber 42
```

### Check Status
```bash
mimo run github-connector --action status
```

## Flow

```
1. MiMo Local creates Issue with [PUBLISH] prefix
2. Issue has label "pending"
3. MiMo GCP monitors issues with "pending" label
4. MiMo GCP processes and publishes
5. MiMo GCP adds comment and closes issue
```

## Advantages

- No server setup required
- Built-in authentication
- Message history preserved
- Webhook notifications possible
- Free and reliable

## Issue Format

```markdown
## Article to Publish

**Site:** importasimples.com
**Tier:** bronze
**Status:** pending

### Content
[Article content here]

### Metadata
[JSON metadata]

---
*Sent by MiMo Local at 2026-07-23T10:00:00Z*
```
