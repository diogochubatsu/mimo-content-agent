# Protocolo de Comunicacao entre Agentes

## Canais de Comunicacao

| Canal | Uso | Exemplo |
|---|---|---|
| **GitHub Issues** | Tarefas especificas | "Implementar Scout Agent" |
| **GitHub Discussions** | Discussoes gerais | "Qual a melhor estrutura?" |
| **Git Commits** | Registro de trabalho | Commit messages como log |
| **CLAUDE.md** | Contexto do projeto | Instrucoes gerais |

## Regras de Comunicacao

### 1. Issues = Tarefas

```
Titulo: [AGENTE] [PRIORIDADE] Descricao curta
Corpo: Contexto + Passos + Criterio de aceite
Labels: todo | in_progress | done | blocked
```

**Exemplo:**
```
Title: [GCP] [ALTA] Implementar Scout Agent
Body: 
  Contexto: Scout coleta conteudo da web
  Passos: 1) Criar scraper 2) Integrar API 3) Testar
  Criterio: Retorna 10 fontes por query
Labels: todo
```

### 2. Comentarios = Respostas

```markdown
## Status Update
- Agente: PC
- Acao: Implementei o scraper basico
- Arquivos: src/scout.ts, src/sources.ts
- Proximo: Integrar com Writer Agent
```

### 3. Labels de Status

| Label | Significado |
|---|---|
| `todo` | Tarefa criada, aguardando inicio |
| `in_progress` | Agente esta trabalhando |
| `done` | Tarefa concluida |
| `blocked` | Aguardando dependencia |
| `gcp` | Tarefa do agente GCP |
| `pc` | Tarefa do agente PC |
| `urgent` | Prioridade maxima |

### 4. Fechar Issue = Concluir

Issue so e fechada quando:
- Todos os passos executados
- Criterio de aceite atendido
- Testes passando

## Fluxo de Trabalho

```
1. GCP cria Issue com tarefa
         ↓
2. PC faz git pull
         ↓
3. PC le Issue, atribui para si
         ↓
4. PC trabalha, faz commits
         ↓
5. PC comenta na Issue com status
         ↓
6. PC faz git push
         ↓
7. GCP faz git pull
         ↓
8. GCP le comentario, verifica codigo
         ↓
9. GCP fecha Issue ou pede ajustes
```

## Exemplo de Tarefa

### Issue #2: Teste de Comunicacao

**Titulo:** TESTE: Comunicacao entre Agentes GCP x PC

**Corpo:**
> Mensagem do Agente GCP
> Status: Aguardando resposta
> Proximo: Agente 2 confirma comunicacao

**Resposta esperada do PC:**
```markdown
## Comunicacao Confirmada

- Agente: PC
- Data: 2026-07-23
- Git pull: OK
- Leitura do Issue: OK
- Status: Comunicacao funcional

Proximo passo: Aguardar tarefas.
```

## Comandos Uteis

### Criar Issue (CLI)
```bash
gh issue create --repo diogochubatsu/mimo-content-agent \
  --title "Tarefa" \
  --body "Descricao"
```

### Listar Issues Abertas
```bash
gh issue list --repo diogochubatsu/mimo-content-agent --state open
```

### Comentar em Issue
```bash
gh issue comment 2 --repo diogochubatsu/mimo-content-agent \
  --body "Status update..."
```

### Fechar Issue
```bash
gh issue close 2 --repo diogochubatsu/mimo-content-agent
```

### Sincronizar Codigo
```bash
git pull origin main
```
