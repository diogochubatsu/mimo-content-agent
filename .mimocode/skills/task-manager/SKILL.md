# Skill: Task Manager

Manage tasks in TASKS.json for multi-agent coordination.

## When to Use

- Starting new work
- Updating task progress
- Checking what to work on
- Reporting completion

## Commands

### Check Pending Tasks
```bash
python3 -c "
import json
with open('TASKS.json', 'r') as f:
    data = json.load(f)
pending = [t for t in data['tasks'] if t.get('to') == 'pc-1' and t['status'] == 'pending']
for t in pending[:5]:
    print(f'{t[\"id\"]}: {t[\"description\"][:70]}')
"
```

### Create Task
```python
import json
with open('TASKS.json', 'r') as f:
    data = json.load(f)

new_task = {
    "id": "T0XX",
    "from": "gcp",
    "to": "pc-1",
    "type": "implement",
    "target": "feature-name",
    "description": "Description of task",
    "files": ["src/file.js"],
    "acceptance": "Criteria for completion",
    "priority": "medium",
    "deadline": "2026-07-30",
    "status": "pending",
    "created": "2026-07-24T00:00:00Z",
    "result": None,
    "depends_on": [],
    "blocks": []
}

data['tasks'].append(new_task)
with open('TASKS.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Update Task Status
```python
import json
with open('TASKS.json', 'r') as f:
    data = json.load(f)

for task in data['tasks']:
    if task['id'] == 'T0XX':
        task['status'] = 'in_progress'  # or 'done', 'blocked'
        task['result'] = 'What was accomplished'

with open('TASKS.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Check Task Dependencies
```python
import json
with open('TASKS.json', 'r') as f:
    data = json.load(f)

for task in data['tasks']:
    if task['id'] == 'T0XX':
        deps = task.get('depends_on', [])
        blocks = task.get('blocks', [])
        print(f'Depends on: {deps}')
        print(f'Blocks: {blocks}')
```

## Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in_progress` | Currently working |
| `done` | Completed |
| `blocked` | Waiting on dependency |

## Priority Levels

| Priority | Meaning |
|----------|---------|
| `critical` | Must do first |
| `high` | Important, do soon |
| `medium` | Normal priority |
| `low` | Do when possible |

## Rules

1. **Update status immediately** - Don't leave stale states
2. **Add result when done** - Document what was accomplished
3. **Check dependencies** - Don't start blocked tasks
4. **One task at a time** - Focus on current task
