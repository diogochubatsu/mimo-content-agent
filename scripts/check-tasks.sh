#!/bin/bash
# check-tasks.sh - Verifica tarefas pendentes para um agente
# Uso: ./scripts/check-tasks.sh <agent-name>

AGENT=${1:-"pc-1"}
TASKS_FILE="TASKS.json"

if [ ! -f "$TASKS_FILE" ]; then
  echo "ERROR: TASKS.json not found"
  exit 1
fi

echo "=== Tarefas pendentes para: $AGENT ==="
echo ""

# Usar jq para filtrar tarefas pendentes
if command -v jq &> /dev/null; then
  jq -r --arg agent "$AGENT" '
    .tasks[] | 
    select(.to == $agent and .status == "pending") |
    "ID: \(.id)\nTipo: \(.type)\nAlvo: \(.target)\nDescricao: \(.description)\nPrioridade: \(.priority)\n---"
  ' "$TASKS_FILE"
else
  # Fallback sem jq
  grep -A5 "\"to\": \"$AGENT\"" "$TASKS_FILE" | grep -B1 -A4 "\"status\": \"pending\""
fi

echo ""
echo "=== Para atualizar status ==="
echo "Use: ./scripts/update-task.sh <task-id> <new-status> [result]"
