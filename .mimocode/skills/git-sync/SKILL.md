# Skill: Git Sync

Automated git synchronization for multi-agent workflows.

## When to Use

- Cron jobs checking for new work
- Syncing with other MiMo instances
- Before starting any task
- After completing any task

## Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Check for new tasks
python3 -c "
import json
with open('TASKS.json', 'r') as f:
    data = json.load(f)
pending = [t for t in data['tasks'] if t.get('to') == 'pc-1' and t['status'] == 'pending']
print(f'Pending tasks: {len(pending)}')
"

# 3. Work on task
# ... execute task ...

# 4. Update TASKS.json
python3 -c "
import json
with open('TASKS.json', 'r') as f:
    data = json.load(f)
for task in data['tasks']:
    if task['id'] == 'T0XX':
        task['status'] = 'done'
        task['result'] = 'Description of what was done'
with open('TASKS.json', 'w') as f:
    json.dump(data, f, indent=2)
"

# 5. Commit and push
git add -A
git commit -m "feat: T0XX - Description"
git push origin main
```

## Cron Configuration

```javascript
// Run every 2-5 minutes
cron({
  action: "loop",
  prompt: "Git sync: pull, check tasks, work, push",
  delay_seconds: 120  // 2 minutes
});
```

## Conflict Resolution

If push fails (remote has new changes):
```bash
git pull origin main --rebase
git push origin main
```

## Rules

1. **Always pull before working** - Avoid conflicts
2. **Always push after working** - Share progress
3. **Use rebase** - Keep history clean
4. **Commit messages with task ID** - Easy tracking
