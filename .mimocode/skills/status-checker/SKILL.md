# Skill: Status Checker

Check project status and metrics.

## When to Use

- Checking task progress
- Monitoring project health
- Reporting status to other agents

## Quick Commands

```bash
# Check PC-1 tasks
python3 -c "
import json
with open('TASKS.json') as f:
    data = json.load(f)
pc1 = [t for t in data['tasks'] if t.get('to') == 'pc-1' and t['status'] == 'pending']
print(f'PC-1 Pending: {len(pc1)}')
"

# Check overall status
python3 -c "
import json
with open('TASKS.json') as f:
    data = json.load(f)
total = len(data['tasks'])
done = len([t for t in data['tasks'] if t['status'] == 'done'])
print(f'Done: {done}/{total} ({done*100//total}%)')
"

# Check pipeline metrics
node scripts/pipeline-metrics.js
```

## Status Template

```
=== STATUS ===
Total: XXX | Done: XXX (XX%) | Pending: XXX
PC-1: XX done | XX pending
Scripts: XX
Articles: XX
```

## Rules

1. Check status before starting work
2. Report status after completing tasks
3. Update TASKS.json immediately
