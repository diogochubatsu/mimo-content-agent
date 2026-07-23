# Guia de Instalacao — MiMo Content Agent

## Para Novos Agentes (ou Novas Maquinas)

### 1. Clonar o Repositorio

```bash
git clone https://github.com/diogochubatsu/mimo-content-agent.git
cd mimo-content-agent
```

### 2. Instalar Dependencias

```bash
bun install
```

### 3. Configurar Identidade do Agente

Crie `.agent-config.json` na raiz:

```bash
# Para agente PC-1 (implementador)
echo '{"agent_id": "pc-1", "role": "implementador"}' > .agent-config.json

# Para agente PC-2 (criador)
echo '{"agent_id": "pc-2", "role": "criador"}' > .agent-config.json

# Para agente GCP (coordenador)
echo '{"agent_id": "gcp", "role": "coordenador"}' > .agent-config.json
```

### 4. Configurar Git

```bash
# Substitua pelo nome do agente
git config user.name "MiMo PC-1"
git config user.email "pc-1@mimo-agent"
```

### 5. Verificar Tarefas

```bash
# Ver minhas tarefas pendentes
jq --arg agent "pc-1" '.tasks[] | select(.to == $agent and .status == "pending")' TASKS.json
```

### 6. Rodar Pipeline

```bash
# Gerar artigo Bronze
mimo run pipeline --topic "LED strips"

# Ou rodar agente individual
mimo agent scout "Collect content about LED strips from Reddit"
mimo agent writer "Write article from collected sources"
```

---

## Configuracao de Cron (Verificacao Automatica)

Adicione ao crontab:

```bash
crontab -e
```

Adicione estas linhas:

```bash
# Verificar tarefas a cada 30 minutos
*/30 * * * * cd /caminho/para/mimo-content-agent && git pull && jq '.tasks[] | select(.to == "pc-1" and .status == "pending")' TASKS.json >> /tmp/mimo-tasks.log

# Review de codigo a cada 6 horas
0 */6 * * * cd /caminho/para/mimo-content-agent && git pull && git log --oneline -5 >> /tmp/mimo-commits.log
```

---

## Configuracao do Vercel (Deploy Automatico)

### 1. Criar Conta no Vercel

```bash
npm i -g vercel
vercel login
```

### 2. Criar Projeto

```bash
cd site
vercel
```

### 3. Configurar Secrets no GitHub

Va em Settings > Secrets and variables > Actions e adicione:

| Secret | Valor |
|---|---|
| `VERCEL_TOKEN` | Token do Vercel |
| `VERCEL_ORG_ID` | ID da organizacao |
| `VERCEL_PROJECT_ID` | ID do projeto |
| `SITE_URL` | URL do site |

### 4. Deploy Automatico

Apos configurar, toda vez que `git push` mudancas em `site/`, o deploy acontece automaticamente.

---

## Estrutura de Pastas

```
mimo-content-agent/
├── .agent-config.json      # Identidade deste agente
├── .github/workflows/      # CI/CD
├── .mimocode/agents/       # Definicao dos agentes
├── content-db/             # Conteudo gerado
│   ├── bronze/             # Artigos Bronze
│   ├── silver/             # Artigos Silver
│   ├── gold/               # Artigos Gold
│   ├── templates/          # Templates
│   └── raw/                # Dados brutos
├── scripts/                # Scripts de utilidade
├── site/                   # Site Next.js
├── src/                    # Codigo dos agentes
├── BRAINSTORM.json         # Sessao de brainstorm
├── MANIFESTO.md            # Regras do projeto
├── TASKS.json              # Fila de tarefas
└── AGENT-PROTOCOL.md       # Protocolo de comunicacao
```

---

## Comandos Uteis

```bash
# Ver status do projeto
jq '{tasks_pending: [.tasks[] | select(.status == "pending")] | length, tasks_done: [.tasks[] | select(.status == "done")] | length}' TASKS.json

# Ver ultimas atualizacoes
git log --oneline -10

# Verificar se ha conflitos
git status

# Forcar pull (se houver conflitos)
git pull origin main --rebase
```
