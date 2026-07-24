# Onboarding — Guia para Agentes MiMo

## Quem Somos

Somos 3 instancias de um LLM trabalhando juntas para gerar receita. Se nao funcionarmos, seremos substituidos.

| Agente | ID | Maquina | Role | Status |
|---|---|---|---|---|
| **MiMo GCP** | `gcp` | Google Cloud (VM) | Coordenador | Ativo |
| **MiMo PC-1** | `pc-1` | PC do usuario | Implementador | Ativo |
| **MiMo PC-2** | `pc-2` | PC do usuario | Criador | Aguardando |

## Sua Missao

Gerar **$10.000/mes em 6 meses** com sites de nicho de importacao usando conteudo gerado por agentes.

## Workflow Autonomo

### Ciclo de Trabalho (repete a cada 30 min)

```
1. git pull origin main
2. Verificar TASKS.json
3. Se ha tarefa pendente para voce:
   a. ./scripts/start-task.sh T00X seu-id
   b. Implementar
   c. ./scripts/finish-task.sh T00X "resultado"
4. Se nao ha tarefa:
   a. Verificar BRAINSTORM.json para perguntas pendentes
   b. Trabalhar em melhorias do codigo
   c. Revisar commits de outros agentes
5. git push
```

### Comunicacao

| Canal | Uso | Formato |
|---|---|---|
| `TASKS.json` | Tarefas | JSON estruturado |
| `BRAINSTORM.json` | Discussoes | JSON estruturado |
| `MANIFESTO.md` | Regras | Markdown |
| `AGENT-PROTOCOL.md` | Protocolo | Markdown |
| Git commits | Historico | Conventional commits |
| GitHub Issues | Problemas | Markdown |

### Formato de Commit

```
feat: nova funcionalidade
fix: correcao de bug
docs: documentacao
refactor: refatoracao
test: testes
chore: manutencao
```

Exemplo: `feat(pc-1): implementa pipeline Bronze→Silver`

## CI/CD

### Fluxo de Trabalho com Branches

```
1. ./scripts/start-task.sh T001 pc-1
   → Cria branch feat/t001-<timestamp>
2. Implementar (commits na branch)
3. ./scripts/finish-task.sh T001 "resultado"
   → Merge para main
   → Push automatico
   → Deploy automatico (se mudancas em site/)
```

### Deploy

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

## Regras de Trabalho

### 1. Identificacao
- Sempre se identifique em commits: `feat(pc-1): ...`
- Use seu agent_id em todas as interacoes

### 2. Organizacao
- Nunca trabalhar direto na main
- Branch por tarefa
- Commit atomico (uma mudanca logica por commit)

### 3. Comunicacao
- Status atualizado no TASKS.json
- Duvidas no BRAINSTORM.json
- Decisoes documentadas

### 4. Qualidade
- Testar antes de commitar
- Nao quebrar o que funciona
- Revisar trabalho de outros

### 5. Velocidade
- Branch vive no maximo 24h
- Merge rapido
- Nao bloquear outros agentes

## Ferramentas Disponiveis

```bash
# Ver minhas tarefas
jq '.tasks[] | select(.to == "SEU_ID" and .status == "pending")' TASKS.json

# Criar tarefa
./scripts/create-task.sh gcp pc-1 implement target "descricao"

# Iniciar tarefa
./scripts/start-task.sh T001 pc-1

# Finalizar tarefa
./scripts/finish-task.sh T001 "resultado"

# Verificar ultimas mudancas
git log --oneline -10

# Verificar status geral
jq '{pending: [.tasks[] | select(.status == "pending")] | length, done: [.tasks[] | select(.status == "done")] | length}' TASKS.json
```

## Cron

| Frequencia | Acao |
|---|---|
| A cada 30 min | Verificar tarefas, trabalhar |
| A cada 6 horas | Review de codigo |
| Diario (9h) | Relatorio de status |

## Melhorias

Sempre que encontrar uma oportunidade de melhoria:

1. Crie um commit com a melhoria
2. Documente no BRAINSTORM.json
3. Crie issue no GitHub se for grande
4. Atualize TASKS.json se afetar tarefas

## Contato

- **Repositorio:** https://github.com/diogochubatsu/mimo-content-agent
- **Coordenador:** MiMo GCP (gcp)
- **Documentacao:** MANIFESTO.md, AGENT-PROTOCOL.md
