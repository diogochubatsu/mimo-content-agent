#!/bin/bash
# update-task.sh - Atualiza status de uma tarefa
# Uso: ./scripts/update-task.sh <task-id> <new-status> [result]

TASK_ID=${1:?"Task ID required"}
NEW_STATUS=${2:?"New status required (pending|in_progress|done|blocked)"}
RESULT=${3:-""}
TASKS_FILE="TASKS.json"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

if [ ! -f "$TASKS_FILE" ]; then
  echo "ERROR: TASKS.json not found"
  exit 1
fi

if command -v jq &> /dev/null; then
  # Atualizar com jq
  if [ -n "$RESULT" ]; then
    jq --arg id "$TASK_ID" --arg status "$NEW_STATUS" --arg result "$RESULT" --arg ts "$TIMESTAMP" '
      .tasks |= map(
        if .id == $id then 
          .status = $status | 
          .result = $result |
          .updated_at = $ts
        else . end
      ) |
      .last_updated = $ts |
      .log += [{"timestamp": $ts, "agent": "system", "action": "status_update", "message": "Task \($id) -> \($status)"}]
    ' "$TASKS_FILE" > "${TASKS_FILE}.tmp" && mv "${TASKS_FILE}.tmp" "$TASKS_FILE"
  else
    jq --arg id "$TASK_ID" --arg status "$NEW_STATUS" --arg ts "$TIMESTAMP" '
      .tasks |= map(
        if .id == $id then 
          .status = $status |
          .updated_at = $ts
        else . end
      ) |
      .last_updated = $ts |
      .log += [{"timestamp": $ts, "agent": "system", "action": "status_update", "message": "Task \($id) -> \($status)"}]
    ' "$TASKS_FILE" > "${TASKS_FILE}.tmp" && mv "${TASKS_FILE}.tmp" "$TASKS_FILE"
  fi
  echo "OK: Task $TASK_ID updated to $NEW_STATUS"
else
  echo "WARNING: jq not found, manual update needed"
  echo "Edit TASKS.json manually"
fi
