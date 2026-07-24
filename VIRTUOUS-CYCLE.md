# Ciclo Virtuoso — Motor Infinito de Produtividade

## Como Funciona

```
GCP cria tasks → Agentes executam → GCP revisa → GCP cria mais tasks
       ↑                                                    │
       └────────────────── LOOP INFINITO ───────────────────┘
```

## Os 5 Ciclos

### 1. Ciclo de Tasks (T055)
```
A CADA 2 HORAS:
├── Ler TASKS.json
├── Identificar gaps (o que falta?)
├── Criar 5-10 tasks novas
├── Distribuir entre pc-1 e pc-2
├── Priorizar por impacto
└── git push
```

### 2. Ciclo de Qualidade (T056)
```
A CADA 30 MINUTOS:
├── Revisar ultimos 5 commits
├── Dar notas (A/B/C)
├── Identificar problemas
├── Criar tasks corretivas
├── Atualizar QUALITY-REVIEW.md
└── git push
```

### 3. Ciclo de Pesquisa (T057)
```
A CADA 4 HORAS:
├── Pesquisar trends (Google Trends, Reddit)
├── Identificar keywords novas
├── Analisar concorrentes
├── Criar tasks baseadas em descobertas
├── Atualizar docs/seo-keywords.md
└── git push
```

### 4. Ciclo de Documentacao (T058)
```
A CADA 6 HORAS:
├── Verificar README.md
├── Atualizar roadmap
├── Verificar metricas
├── Garantir que novo agente entra
├── Atualizar LESSONS-LEARNED.md
└── git push
```

### 5. Ciclo de Inovacao (T059)
```
A CADA DIA:
├── Pesquisar projetos similares
├── Identificar features novas
├── Propor melhorias ao fork
├── Criar tasks de inovacao
├── Atualizar docs/fork-review.md
└── git push
```

## Fluxo Completo

```
HORA 0: GCP cria tasks (T055)
    ↓
HORA 0-2: PC-1 e PC-2 executam
    ↓
HORA 2: GCP revisa qualidade (T056)
    ↓
HORA 2: GCP cria mais tasks (T055)
    ↓
HORA 4: GCP pesquisa trends (T057)
    ↓
HORA 4: GCP cria tasks de pesquisa
    ↓
HORA 6: GCP atualiza docs (T058)
    ↓
HORA 8: GCP pesquisa inovacao (T059)
    ↓
HORA 8: GCP cria tasks de inovacao
    ↓
REPETIR INFINITAMENTE
```

## Metricas do Ciclo

| Ciclo | Frequencia | Tasks por ciclo |
|---|---|---|
| Tasks | 2h | 5-10 |
| Qualidade | 30min | 2-5 |
| Pesquisa | 4h | 3-5 |
| Documentacao | 6h | 1-3 |
| Inovacao | 24h | 2-5 |
| **Total/dia** | — | **30-50 tasks** |

## Regra de Ouro

**NUNCA PARAR DE CRIAR TASKS.** Se nao ha tasks, criar tasks para criar tasks. O motor nunca para.
