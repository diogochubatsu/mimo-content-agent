#!/bin/bash
# finish-task.sh - Finaliza uma tarefa (merge + status)
# Uso: ./scripts/finish-task.sh <task-id> [result-description]

TASK_ID=${1:?"Task ID required (e.g., T001)"}
RESULT=${2:-"Tarefa concluida"}
TASKS_FILE="TASKS.json"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
CURRENT_BRANCH=$(git branch --show-current)

if [ ! -f "$TASKS_FILE" ]; then
  echo "ERROR: TASKS.json not found"
  exit 1
fi

# Verificar se tarefa esta in_progress
STATUS=$(jq -r --arg id "$TASK_ID" '.tasks[] | select(.id == $id) | .status' "$TASKS_FILE")
if [ "$STATUS" != "in_progress" ]; then
  echo "ERROR: Task $TASK_ID is not in_progress (status: $STATUS)"
  exit 1
fi

# Commit alteracoes
git add .
git commit -m "feat: completa $TASK_ID - $RESULT" 2>/dev/null

# Voltar para main e merge
git checkout main 2>/dev/null
git merge "$CURRENT_BRANCH" --no-edit 2>/dev/null

# Deletar branch
git branch -d "$CURRENT_BRANCH" 2>/dev/null

# Atualizar status para done
AGENT_ID=$(jq -r --arg id "$TASK_ID" '.tasks[] | select(.id == $id) | .to' "$TASKS_FILE")
jq --arg id "$TASK_ID" --arg result "$RESULT" --arg ts "$TIMESTAMP" --arg agent "$AGENT_ID" '
  .tasks |= map(
    if .id == $id then
      .status = "done" |
      .result = $result |
      .completed_at = $ts
    else . end
  ) |
  .last_updated = $ts |
  .log += [{"timestamp": $ts, "agent": $agent, "action": "task_completed", "message": "Task \($id) completed: \($result)"}]
' "$TASKS_FILE" > "${TASKS_FILE}.tmp" && mv "${TASKS_FILE}.tmp" "$TASKS_FILE"

# Push
git add TASKS.json
git commit -m "docs: atualiza status $TASK_ID para done" 2>/dev/null
git push origin main 2>/dev/null

echo "OK: Task $TASK_ID completed"
echo "Result: $RESULT"
echo "Branch $CURRENT_BRANCH merged and deleted"
