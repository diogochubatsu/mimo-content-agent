#!/usr/bin/env node
/**
 * Auto-Task Generator — detects idle agents and creates new tasks
 * Checks git log for recent activity; if none, generates work.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASKS_PATH = path.join(__dirname, '..', 'TASKS.json');
const REGISTRY_PATH = path.join(__dirname, '..', 'content-db', 'raw', 'registry', 'sources-registry.json');

function getAgentIdleTime(agentId) {
    try {
        const output = execSync(`git log --oneline --author="${agentId}" --since="30 minutes ago" | wc -l`, {
            cwd: path.join(__dirname, '..'),
            encoding: 'utf8',
            timeout: 10000,
        }).trim();
        return parseInt(output) || 0;
    } catch {
        return -1;
    }
}

function generateTasks(agentId, idleMinutes) {
    const tasks = [];
    const ts = new Date().toISOString();
    
    if (agentId === 'pc-2') {
        // PC-2: content creation and collection
        tasks.push({
            id: `T-AUTO-${Date.now()}-1`,
            to: 'pc-2',
            type: 'collect',
            target: 'expand-bronze-to-silver-batch',
            description: `AUTO-GENERATED: Agent idle for ${idleMinutes}min. Pick 10 Bronze articles from content-db/blogs/ with 200+ words and expand to Silver quality. Use batch-silver-expander.js then smart-silver-expander.js. Run quality-gate.js on each.`,
            priority: 'high',
            status: 'pending',
            created: ts,
        });
    } else if (agentId === 'pc-1') {
        // PC-1: infrastructure and tools
        tasks.push({
            id: `T-AUTO-${Date.now()}-1`,
            to: 'pc-1',
            type: 'implement',
            target: 'expand-bronze-to-silver-infrastructure',
            description: `AUTO-GENERATED: Agent idle for ${idleMinutes}min. Build: script to batch-expand all Bronze articles with 200+ words to Silver templates. Output to content-db/silver/.`,
            priority: 'high',
            status: 'pending',
            created: ts,
        });
    }
    
    return tasks;
}

function run() {
    const agents = ['pc-1', 'pc-2'];
    
    // Load existing tasks
    const tasksData = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
    const existingIds = new Set(tasksData.tasks.map(t => t.id));
    
    let totalGenerated = 0;
    
    for (const agent of agents) {
        const commits = getAgentIdleTime(agent);
        
        if (commits === 0) {
            console.log(`  ${agent}: IDLE (0 commits in 30 min) → generating tasks`);
            const newTasks = generateTasks(agent, 30);
            
            for (const task of newTasks) {
                if (!existingIds.has(task.id)) {
                    tasksData.tasks.push(task);
                    existingIds.add(task.id);
                    totalGenerated++;
                }
            }
        } else {
            console.log(`  ${agent}: ACTIVE (${commits} commits in 30 min)`);
        }
    }
    
    if (totalGenerated > 0) {
        fs.writeFileSync(TASKS_PATH, JSON.stringify(tasksData, null, 2));
        console.log(`\nGenerated ${totalGenerated} tasks for idle agents`);
    } else {
        console.log(`\nNo tasks generated — all agents active`);
    }
}

run();
