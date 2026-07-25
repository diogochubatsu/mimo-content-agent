# Protocolo de Agentes — Identificacao e Regras

## Identificacao Obrigatoria

Cada mensagem entre agentes DEVE conter:

```json
{
  "agent_id": "gcp|pc-1|pc-2",
  "timestamp": "2026-07-23T10:00:00Z",
  "session_id": "ses_xxxxx",
  "action": "task_update|brainstorm_response|status_check",
  "payload": {}
}
```

## Regras de Organizacao

### 1. Antes de Trabalhar
```bash
git pull origin main
jq -r '.last_updated' TASKS.json
jq '.tasks[] | select(.to == "SEU_ID" and .status == "pending")' TASKS.json
```

### 2. Durante o Trabalho
- Commit a cada etapa concluida
- Message clara: "feat: implementa X" ou "fix: corrige Y"
- Nunca commitar algo quebrado

### 3. Depois de Trabalhar (QUALITY GATE MANDATORY)
**Before marking ANY content task as done, you MUST run the quality gate:**

```bash
# For individual article:
node scripts/quality-gate.js content-db/silver/your-article.md

# For all silver articles:
node scripts/quality-gate.js content-db/silver/

# If Grade C or D: fix the article first, then re-check
# If Grade A or B: safe to mark done
```

**Quality Gate checks (ALL must pass for Grade A):**
- [ ] Word count: 2000+ words
- [ ] Direct factual answer in first 30 lines (GEO critical)
- [ ] FAQ section present
- [ ] Data tables (1+)
- [ ] External citations (3+ authoritative links)
- [ ] Frontmatter/schema-ready
- [ ] Structured headings (5+ H2, 3+ H3)
- [ ] Numbered steps (3+)

**Only after quality gate passes:**
```bash
./scripts/update-task.sh T001 done "Descricao do resultado"
git add . && git commit -m "feat: completa T001" && git push
```

**For Bronze collection tasks:** Run `node scripts/quality-gate.js <file>` on extracted content before saving.

### 4. Verificacao Periodica
- Toda hora: `git pull` + verificar TASKS.json
- Se ha tarefas pendentes: executar
- Se nao ha: trabalhar em tarefas do backlog

## Identificadores de Agente

| ID | Nome | Responsabilidade |
|---|---|---|
| `gcp` | MiMo GCP | Coordenador, planejamento, review |
| `pc-1` | MiMo PC-1 | Implementacao, pipeline, deploy |
| `pc-2` | MiMo PC-2 | Conteudo, reviews, social media |

## Formato de Mensagem

### Task Update
```json
{
  "agent_id": "pc-1",
  "timestamp": "2026-07-23T10:00:00Z",
  "action": "task_update",
  "payload": {
    "task_id": "T001",
    "status": "in_progress",
    "note": "Iniciando implementacao do pipeline"
  }
}
```

### Brainstorm Response
```json
{
  "agent_id": "pc-1",
  "timestamp": "2026-07-23T10:00:00Z",
  "action": "brainstorm_response",
  "payload": {
    "question_id": "Q001",
    "response": "parcialmente",
    "note": "Reddit funciona, TikTok precisa de API"
  }
}
```

### Status Check
```json
{
  "agent_id": "pc-1",
  "timestamp": "2026-07-23T10:00:00Z",
  "action": "status_check",
  "payload": {
    "tasks_pending": 3,
    "tasks_in_progress": 1,
    "tasks_done": 5,
    "last_commit": "abc123"
  }
}
```

## CI/CD e Branches

### Fluxo de Trabalho com Branches

```
1. Verificar tarefa pendente
2. ./scripts/start-task.sh T001 pc-1
   → Cria branch feat/t001-<timestamp>
   → Marca tarefa como in_progress
3. Implementar (commits na branch)
4. ./scripts/finish-task.sh T001 "Descricao"
   → Commit final
   → Merge para main
   → Deleta branch
   → Atualiza TASKS.json para done
   → Git push
```

### Regras de Branch

| Regra | Descricao |
|---|---|
| Branch por tarefa | Nunca trabalhar direto na main |
| Commit atomico | Uma mudanca logica por commit |
| Message clara | `feat:`, `fix:`, `docs:` |
| Merge rapido | Branch vive no maximo 24h |
| Review antes de merge | Outro agente verifica |

### Deploy Automatico

```
git push main (com mudancas em site/)
    ↓
GitHub Actions detecta
    ↓
Build Next.js
    ↓
Deploy no Vercel
    ↓
Site atualizado
```

## Regras de Coerencia

1. **Nunca sobrepor trabalho** — verificar antes quem esta fazendo o que
2. **Commit messages claras** — outros agentes leem
3. **Status atualizado** — TASKS.json sempre reflete realidade
4. **Duvidas no BRAINSTORM.json** — nao no codigo
5. **Decisoes documentadas** — toda decisao fica registrada
6. **Branch por tarefa** — nunca trabalhar direto na main
7. **Merge rapido** — branch vive no maximo 24h
8. **Deploy automatico** — mudancas em site/ fazem deploy
