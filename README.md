# MiMo Content Agent

Fork do [MiMo-Code](https://github.com/XiaomiMiMo/MiMo-Code) especializado em transformar conteúdo existente da web em artigos SEO-otimizados para nichos de importação/sourcing.

## Visão Geral

Sistema que coleta conteúdo existente (blogs, YouTube, TikTok, Reddit) e transforma em artigos publicáveis. **Não fazemos scraping de marketplaces** — utilizamos o conhecimento que já existe na web.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  BRONZE (Data Lake - Conteúdo Existente)                    │
│                                                             │
│  Fontes:                                                    │
│  ├── Blogs: 1688 Wiki, Amazon Blog, Amazing.com             │
│  ├── YouTube: reviews, tutorials (multi-idioma)             │
│  ├── TikTok: trends, product finds                          │
│  ├── Reddit: discussões reais do público                     │
│  ├── Notícias: impostos, fretes, acordos comerciais         │
│  └── Google Trends: tendências de consumo                    │
│                                                             │
│  Formato: JSON cru, multi-idioma, não-tratado                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  SILVER (Tratamento e Publicação)                           │
│                                                             │
│  Scout → Coleta conteúdo existente                          │
│  Writer → Sintetiza e reorganiza em artigos                 │
│  Editor → Anti-footprint (evita detecção de IA)             │
│                                                             │
│  Formato: Artigos prontos para publicação                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  GOLD (Futuro - com scraping)                               │
│                                                             │
│  - Dados exclusivos de scraping                             │
│  - Relatórios premium                                       │
│  - Inteligência de mercado                                  │
│                                                             │
│  *Não utilizado ainda*                                      │
└─────────────────────────────────────────────────────────────┘
```

## Agentes

### Scout Agent
Coleta conteúdo existente da web:
- Blogs de importação (multi-idioma)
- Vídeos do YouTube (reviews, tutoriais)
- Posts do TikTok (trends)
- Discussões do Reddit
- Notícias do setor

### Writer Agent
Transforma conteúdo coletado em artigos:
- Sintetiza múltiplas fontes
- Organiza em templates SEO-otimizados
- Mantém atribuição às fontes originais
- Gera dados de preço/margem quando disponível

### Editor Agent
Anti-footprint:
- Reescreve para evitar detecção de IA
- Aplica voz por site (profissional, casual, etc)
- Varia sintaxe e vocabulário
- Mantém precisão dos dados

## Quick Start

```bash
# Clonar
git clone https://github.com/diogochubatsu/mimo-content-agent.git
cd mimo-content-agent

# Instalar
bun install

# Rodar workflow diário
mimo run daily-hunt

# Ou rodar agentes individualmente
mimo agent scout "Collect content about LED strips from Reddit and YouTube"
mimo agent writer "Write bronze article from collected sources"
```

## Configuração

### Agentes
Edite `.mimocode/agents/`:
- `scout.md` - Fontes e estratégias de coleta
- `writer.md` - Templates e regras de síntese
- `editor.md` - Técnicas anti-footprint

### Templates
Edite `content-db/templates/`:
- `bronze.md` - 800-1200 palavras (rápido)
- `silver.md` - 1500-2500 palavras (autoridade)
- `gold.md` - 3000+ palavras (futuro, com scraping)

---

## Roadmap

### Fase 1: Fundação ✅
- [x] Agentes (Scout, Writer, Editor)
- [x] Templates Bronze/Silver/Gold
- [x] Workflow diário

### Fase 2: Coleta de Conteúdo
- [ ] Mapear 50+ fontes por idioma
- [ ] Criar rotinas de coleta por fonte
- [ ] Implementar cache de conteúdo
- [ ] Adicionar monitoramento de trends

### Fase 3: Publicação
- [ ] Integrar com WordPress/Next.js
- [ ] Sistema de agendamento
- [ ] A/B testing de títulos
- [ ] Analytics de performance

### Fase 4: Otimização
- [ ] Agente de feedback (analisa performance)
- [ ] Learning loop (apende com dados)
- [ ] Suporte a mais idiomas
- [ ] Otimização para Google Discover

### Fase 5: Gold (Scraping)
- [ ] Integrar agentes de scraping existentes
- [ ] Dados exclusivos de mercado
- [ ] Relatórios premium
- [ ] Dashboard de inteligência

---

## Fontes Mapeadas

### Inglês
| Fonte | URL | Tipo |
|-------|-----|------|
| 1688 Wiki | wiki.1688.com | Guias |
| Amazon Blog | sell.amazon.com/blog | Product ideas |
| Amazing.com | amazing.com/blog | Tendências |
| Jungle Scout | junglescout.com/blog | FBA |
| Reddit FBA | reddit.com/r/AmazonFBA | Discussões |

### Espanhol
| Fonte | Tipo |
|-------|------|
| YouTube ecommerce LATAM | Reviews |
| TikTok #dropshipping | Trends |

### Português
| Fonte | Tipo |
|-------|------|
| Ecommerce Brasil | Notícias |
| YouTube dropshipping BR | Tutoriais |

### Outros Idiomas
| Idioma | Fontes |
|--------|--------|
| Alemão | Import guides, Amazon DE |
| Polonês | Allegro, Ceneo |
| Japonês | Rakuten, Amazon JP |
| Koreano | Coupang, Gmarket |
| Taiwanês | PChome, Rakuten TW |

---

## Comunicação entre Agentes

### Protocolo JSON Estruturado

Agentes se comunicam via `TASKS.json` — um arquivo compartilhado que funciona como fila de tarefas.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  MiMo GCP   │────▶│  TASKS.json │◀────│  MiMo PC-1  │
│ (coordenador)│     │  (GitHub)   │     │(implementador)│
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                     ┌─────▼─────┐
                     │  MiMo PC-2 │
                     │(implementador)│
                     └───────────┘
```

### Como Funciona

1. **Agente cria tarefa** → Adiciona em `TASKS.json`
2. **Agente faz `git pull`** → Ve tarefas pendentes
3. **Agente filtra suas tarefas** → `tasks[].to == "meu-nome"`
4. **Agente executa** → Trabalha no codigo
5. **Agente atualiza status** → `in_progress` → `done`
6. **Agente faz `git push`** → Outros agentes veem atualizacao

### Como Saber se Houve Atualizacao

```bash
# Opcao 1: Git pull periodicamente
git pull origin main

# Opcao 2: Verificar ultima atualizacao
jq -r '.last_updated' TASKS.json

# Opcao 3: Contar tarefas pendentes
jq '.tasks[] | select(.status == "pending")' TASKS.json | jq length
```

### Formato do TASKS.json

```json
{
  "version": "1.0",
  "last_updated": "2026-07-23T10:00:00Z",
  "agents": {
    "gcp": { "name": "MiMo GCP", "role": "coordenador" },
    "pc-1": { "name": "MiMo PC-1", "role": "implementador" },
    "pc-2": { "name": "MiMo PC-2", "role": "implementador" }
  },
  "tasks": [
    {
      "id": "T001",
      "from": "gcp",
      "to": "pc-1",
      "type": "implement",
      "target": "scout-agent",
      "description": "Implementar Scout Agent",
      "status": "pending",
      "priority": "high",
      "created": "2026-07-23T10:00:00Z",
      "result": null
    }
  ],
  "log": []
}
```

### Scripts de Utilidade

```bash
# Ver minhas tarefas pendentes
./scripts/check-tasks.sh pc-1

# Criar nova tarefa
./scripts/create-task.sh gcp pc-1 implement scout-agent "Implementar basico"

# Atualizar status
./scripts/update-task.sh T001 in_progress
./scripts/update-task.sh T001 done "Scout implementado com 3 fontes"
```

### Labels de Status

| Status | Significado |
|--------|-------------|
| `pending` | Tarefa criada, aguardando inicio |
| `in_progress` | Agente esta trabalhando |
| `done` | Tarefa concluida |
| `blocked` | Aguardando dependencia |

### Regras

1. **Sempre `git pull` antes de trabalhar**
2. **Uma tarefa por agente por vez** (evitar conflitos)
3. **Atualizar status apos cada etapa**
4. **Fechar tarefa so quando PRONTO**
5. **Commit messages claras** (outros agentes leem)

---

## Licença

Apache 2.0
