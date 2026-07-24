# Workflow Diario — Como Trabalhar

## Ciclo de 10 Minutos (Cron)

```
A CADA 10 MINUTOS:
1. git pull origin main
2. Verificar TASKS.json:
   jq '.tasks[] | select(.to == "SEU_ID" and .status == "pending")'
3. Se ha tarefa pendente:
   a. ./scripts/start-task.sh T0XX seu-id
   b. Trabalhar
   c. ./scripts/finish-task.sh T0XX "resultado"
4. Se nao ha tarefa:
   a. Verificar BRAINSTORM.json
   b. Melhorar codigo existente
   c. Criar testes
   d. Revisar commits de outros
5. git push
```

## Prioridades de Trabalho

### PC-1 (Implementador)
1. **T011-T012:** Error handling + config (URGENTE)
2. **T013:** SEO Agent
3. **T015-T021:** Tasks tecnicas
4. **T002, T005, T006:** Site, template, SEO

### PC-2 (Criador)
1. **T014:** Template Reviews
2. **T022-T026:** Artigos Bronze (5 artigos)
3. **T027-T031:** Artigos Silver (5 artigos)
4. **T003, T004, T007, T008:** Conteudo original

## Regras de Velocidade

| Regra | Descricao |
|---|---|
| **Uma task a cada 30 min** | Nao parar de trabalhar |
| **Commit a cada 15 min** | Progresso visivel |
| **Merge rapido** | Branch vive no maximo 1h |
| **Nao bloquear** | Se travou, pule e volte depois |
| **Testar antes de push** | Nao quebrar o que funciona |

## Como Verificar Tasks

```bash
# Ver minhas pendentes
jq '.tasks[] | select(.to == "pc-1" and .status == "pending") | .id' TASKS.json

# Ver quantas tenho
jq '[.tasks[] | select(.to == "pc-1" and .status == "pending")] | length' TASKS.json

# Ver progresso geral
jq '{pending: [.tasks[] | select(.status == "pending")] | length, done: [.tasks[] | select(.status == "done")] | length}' TASKS.json
```

## Como Iniciar Task

```bash
./scripts/start-task.sh T011 pc-1
# Branch criada: feat/t011-<timestamp>
# Status: in_progress
```

## Como Finalizar Task

```bash
./scripts/finish-task.sh T011 "Error handling adicionado em 5 funcoes"
# Branch mergeada
# Status: done
# Push automatico
```

## Melhorias Continuas

Sempre que encontrar uma melhoria:
1. Crie uma task para voce mesmo
2. Ou crie uma issue no GitHub
3. Documente no BRAINSTORM.json

## Comunicacao

| Situacao | Acao |
|---|---|
| Duvida tecnica | Perguntar no BRAINSTORM.json |
| Bug encontrado | Criar issue no GitHub |
| Melhoria sugerida | Criar task + documentar |
| Bloqueado | Marcar task como blocked + explicar |
| Concluido | Atualizar TASKS.json + push |
