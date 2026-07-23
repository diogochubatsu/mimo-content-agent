export const meta = {
  name: "github-connector",
  description: "GitHub Issues as communication channel between MiMo instances"
};

import { execSync } from 'child_process';

const REPO = process.env.GITHUB_REPO || 'diogochubatsu/mimo-content-agent';
const TOKEN = process.env.GITHUB_TOKEN;

function githubAPI(endpoint, method = 'GET', body = null) {
  const cmd = `gh api ${endpoint} --method ${method}`;
  
  if (body) {
    const bodyJson = JSON.stringify(body).replace(/'/g, "'\\''");
    return JSON.parse(execSync(`${cmd} -f body='${bodyJson}'`, { encoding: 'utf8' }));
  }
  
  return JSON.parse(execSync(cmd, { encoding: 'utf8' }));
}

function createIssue(title, body, labels = []) {
  const args = [
    'issue', 'create',
    '--repo', REPO,
    '--title', title,
    '--body', body
  ];
  
  if (labels.length > 0) {
    args.push('--label', labels.join(','));
  }
  
  return execSync(`gh ${args.join(' ')}`, { encoding: 'utf8' });
}

function getIssues(state = 'open', label = null) {
  let cmd = `gh issue list --repo ${REPO} --state ${state} --json number,title,body,labels,state,createdAt`;
  
  if (label) {
    cmd += ` --label "${label}"`;
  }
  
  return JSON.parse(execSync(cmd, { encoding: 'utf8' }));
}

function addComment(issueNumber, body) {
  return execSync(
    `gh issue comment ${issueNumber} --repo ${REPO} --body "${body.replace(/"/g, '\\"')}"`,
    { encoding: 'utf8' }
  );
}

function closeIssue(issueNumber) {
  return execSync(`gh issue close ${issueNumber} --repo ${REPO}`, { encoding: 'utf8' });
}

export default async function(args) {
  const { action, article, issueNumber } = args || {};

  // Send article to publish
  if (action === 'send' && article) {
    phase("Sending article via GitHub Issue");
    
    const title = `[PUBLISH] ${article.title}`;
    const body = `## Article to Publish

**Site:** ${article.site}
**Tier:** ${article.tier || 'bronze'}
**Status:** pending

### Content

${article.content}

### Metadata

\`\`\`json
${JSON.stringify(article.metadata || {}, null, 2)}
\`\`\`

---
*Sent by MiMo Local at ${new Date().toISOString()}*`;

    const result = createIssue(title, body, ['publish', 'pending']);
    log(`✓ Issue created: ${result}`);
    
    return { success: true, issue: result };
  }

  // Get pending articles
  if (action === 'pending') {
    phase("Fetching pending articles from GitHub Issues");
    
    const issues = getIssues('open', 'pending');
    log(`Found ${issues.length} pending articles`);
    
    return { issues, count: issues.length };
  }

  // Mark as published
  if (action === 'published' && issueNumber) {
    phase(`Marking issue #${issueNumber} as published`);
    
    addComment(issueNumber, `✓ Published at ${new Date().toISOString()}`);
    closeIssue(issueNumber);
    log(`✓ Issue #${issueNumber} closed`);
    
    return { success: true };
  }

  // Report status
  if (action === 'status') {
    phase("Checking communication status");
    
    const pending = getIssues('open', 'pending');
    const published = getIssues('closed', 'publish');
    
    log(`Pending: ${pending.length}`);
    log(`Published: ${published.length}`);
    
    return { pending: pending.length, published: published.length };
  }

  log('Usage:');
  log('  action: send       - Send article to publish');
  log('  action: pending    - Get pending articles');
  log('  action: published  - Mark issue as published');
  log('  action: status     - Check communication status');
}
