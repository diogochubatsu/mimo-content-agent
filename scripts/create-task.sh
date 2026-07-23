#!/bin/bash
# create-task.sh - Cria uma nova tarefa
# Uso: ./scripts/create-task.sh <from> <to> <type> <target> <description>

FROM=${1:?"From agent required (gcp|pc-1|pc-2)"}
TO=${2:?"To agent required (gcp|pc-1|pc-2)"}
TYPE=${3:?"Task type required (implement|review|test|deploy)"}
TARGET=${4:?"Target required (agent name or file)"}
DESCRIPTION=${5:?"Description required"}
TASKS_FILE="TASKS.json"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Gerar ID unico
if command -v jq &> /dev/null; then
  TASK_ID=$(jq -r '.tasks | length' "$TASKS_FILE")
  TASK_ID="T$(printf '%03d' $((TASK_ID + 1)))"
  
  jq --arg id "$TASK_ID" --arg from "$FROM" --arg to "$TO" --arg type "$TYPE" \
     --arg target "$TARGET" --arg desc "$DESCRIPTION" --arg ts "$TIMESTAMP" '
    .tasks += [{
      "id": $id,
      "from": $from,
      "to": $to,
      "type": $type,
      "target": $target,
      "description": $desc,
      "files": [],
      "acceptance": "",
      "priority": "medium",
      "status": "pending",
      "created": $ts,
      "result": null
    }] |
    .last_updated = $ts |
    .log += [{"timestamp": $ts, "agent": $from, "action": "task_created", "message": "Created task \($id) for \($to)"}]
  ' "$TASKS_FILE" > "${TASKS_FILE}.tmp" && mv "${TASKS_FILE}.tmp" "$TASKS_FILE"
  
  echo "OK: Task $TASK_ID created for $TO"
else
  echo "ERROR: jq required for creating tasks"
  exit 1
fi
