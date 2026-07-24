# Protocolo de Revisao da Equipe

## Ciclo de Auto-Avaliacao (cada agente)

### A Cada 2 Horas
1. Revisar ultimas 5 tasks concluidas
2. Dar notas (A/B/C)
3. Identificar o que funcionou e o que nao
4. Escrever em docs/self-review-[agent].md

### A Cada 4 Horas
1. Analisar estrutura do projeto
2. Sugerir mudancas (pipeline, templates, workflow)
3. Documentar em docs/suggestions-[agent].md
4. Comunicar ao GCP via git push

### A Cada Sessao
1. Identificar 3 lições aprendidas
2. Atualizar LESSONS-LEARNED.md
3. Sugerir ajustes para proximas tasks
4. Propor melhorias ao fork

## Ciclo de Revisao da Equipe (GCP coordena)

### A Cada 6 Horas
1. Ler self-reviews de pc-1 e pc-2
2. Consolidar lições aprendidas
3. Identificar gargalos
4. Ajustar distribuicao de tasks
5. Propor mudancas na estrutura
6. Atualizar TEAM-REVIEW.md
7. Comunicar resultados

### Formato do Team Review

```markdown
# Team Review — [data]

## Resumo
- Tasks concluidas desde ultimo review: X
- Qualidade media: A/B/C
- Gargalos identificados: [lista]

## Self-Review PC-1
- Nota media: X
- O que funcionou: [lista]
- O que nao funcionou: [lista]
- Sugestoes: [lista]

## Self-Review PC-2
- Nota media: X
- O que funcionou: [lista]
- O que nao funcionou: [lista]
- Sugestoes: [lista]

## Decisoes
1. [decisao 1]
2. [decisao 2]

## Proximos Passos
1. [acao 1]
2. [acao 2]
```

## Ciclo de Evolucao do Fork

### A Cada 8 Horas
1. Analisar o que aprendemos
2. Identificar features para adicionar
3. Criar tasks de desenvolvimento
4. Priorizar por impacto
5. Documentar em docs/fork-evolution.md

### Categorias de Melhoria

| Categoria | Exemplo | Prioridade |
|---|---|---|
| Pipeline | Adicionar caching | Alta |
| Templates | Novo template de review | Media |
| Workflow | Automatizar review | Media |
| Agentes | Novo agente (SEO) | Baixa |
| UI/UX | Dashboard de status | Baixa |

## Regras

1. **Todo agente se auto-avalia** — Nao esperar pelo GCP
2. **Feedback e construtivo** — Apontar problemas + solucoes
3. **Lições são documentadas** — LESSONS-LEARNED.md sempre atualizado
4. **Mudancas sao comunicadas** — Git push apos cada review
5. **GCP consolida** — Junta feedbacks e toma decisoes
