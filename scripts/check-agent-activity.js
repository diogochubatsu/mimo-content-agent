#!/usr/bin/env node

/**
 * Check agent activity by scanning git log
 * Usage: node scripts/check-agent-activity.js
 */

import { execSync } from 'child_process';

function getRecentCommits(minutes = 30) {
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const cmd = `git log --since="${since}" --format="%H|%ae|%s" --all`;
  
  try {
    const output = execSync(cmd, { encoding: 'utf8', cwd: process.cwd() });
    return output.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    return [];
  }
}

function analyzeActivity(commits) {
  const agents = {};
  
  for (const commit of commits) {
    const [hash, email, message] = commit.split('|');
    const agent = email.includes('gcp') ? 'GCP' : 
                  email.includes('pc-1') ? 'PC-1' : 
                  email.includes('pc-2') ? 'PC-2' : 'Unknown';
    
    if (!agents[agent]) {
      agents[agent] = { commits: 0, lastCommit: null };
    }
    agents[agent].commits++;
    agents[agent].lastCommit = message;
  }
  
  return agents;
}

function main() {
  console.log('=== Agent Activity Check ===\n');
  
  const commits = getRecentCommits(30);
  console.log(`Commits in last 30 minutes: ${commits.length}\n`);
  
  const activity = analyzeActivity(commits);
  
  for (const [agent, data] of Object.entries(activity)) {
    console.log(`${agent}: ${data.commits} commits`);
    if (data.lastCommit) {
      console.log(`  Last: ${data.lastCommit.substring(0, 60)}`);
    }
  }
  
  // Check for inactive agents
  const allAgents = ['GCP', 'PC-1', 'PC-2'];
  for (const agent of allAgents) {
    if (!activity[agent]) {
      console.log(`\n⚠️ ${agent}: No activity in last 30 minutes`);
    }
  }
}

main();
