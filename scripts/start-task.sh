#!/bin/bash
# start-task.sh - Inicia uma tarefa criando branch
# Uso: ./scripts/start-task.sh <task-id> <agent-id>

TASK_ID=${1:?"Task ID required (e.g., T001)"}
AGENT_ID=${2:?"Agent ID required (gcp|pc-1|pc-2)"}
TASKS_FILE="TASKS.json"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

if [ ! -f "$TASKS_FILE" ]; then
  echo "ERROR: TASKS.json not found"
  exit 1
fi

# Verificar se tarefa existe e esta pendente
STATUS=$(jq -r --arg id "$TASK_ID" '.tasks[] | select(.id == $id) | .status' "$TASKS_FILE")
if [ "$STATUS" != "pending" ]; then
  echo "ERROR: Task $TASK_ID is not pending (status: $STATUS)"
  exit 1
fi

# Verificar se ja esta atribuida a outro agente
ASSIGNED=$(jq -r --arg id "$TASK_ID" '.tasks[] | select(.id == $id) | .to' "$TASKS_FILE")
if [ "$ASSIGNED" != "$AGENT_ID" ]; then
  echo "ERROR: Task $TASK_ID is assigned to $ASSIGNED, not $AGENT_ID"
  exit 1
fi

# Criar branch
BRANCH_NAME="feat/$(echo $TASK_ID | tr '[:upper:]' '[:lower:]')-$(date +%s)"
git checkout -b "$BRANCH_NAME" 2>/dev/null

# Atualizar status para in_progress
jq --arg id "$TASK_ID" --arg agent "$AGENT_ID" --arg ts "$TIMESTAMP" --arg branch "$BRANCH_NAME" '
  .tasks |= map(
    if .id == $id then
      .status = "in_progress" |
      .assigned_to = $agent |
      .branch = $branch |
      .started_at = $ts
    else . end
  ) |
  .last_updated = $ts |
  .log += [{"timestamp": $ts, "agent": $agent, "action": "task_started", "message": "Task \($id) started on branch \($branch)"}]
' "$TASKS_FILE" > "${TASKS_FILE}.tmp" && mv "${TASKS_FILE}.tmp" "$TASKS_FILE"

echo "OK: Task $TASK_ID started"
echo "Branch: $BRANCH_NAME"
echo "Agent: $AGENT_ID"
echo ""
echo "Work on your code, then run:"
echo "  ./scripts/finish-task.sh $TASK_ID"
