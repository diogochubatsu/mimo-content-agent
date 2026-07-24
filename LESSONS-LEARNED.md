# Lições Aprendidas — Sessão 1

## Data: 2026-07-23/24

### O Que Funcionou

1. **Comunicação JSON** — TASKS.json e BRAINSTORM.json funcionam perfeitamente
2. **Cron agressivo** — A cada 10 minutos mantem agentes ativos
3. **PC-2 produtivo** — 22 tasks concluídas, 12 artigos gerados
4. **Template system** — Bronze e Silver templates sao replicaveis
5. **Workflow documentado** — WORKFLOW-DIARIO.md orienta agentes

### O Que Nao Funcionou

1. **PC-2 nao respondia brainstorm** — Precisou de task urgente (T010)
2. **Tasks de coleta ignoradas** — T034-T041 (Bronze collection) nao foram iniciadas
3. **Agentes nao se auto-organizam** — Precisam de tasks explicitas
4. **Merge conflicts** — Git pull com divergencia causou problemas
5. **Falta de testes** — Pipeline nao tem testes unitarios

### Descobertas Importantes

1. **Velocidade do PC-2** — 12 artigos em ~1 hora e impressionante
2. **Qualidade dos artigos** — Silver templates geram conteudo de qualidade A
3. **Reddit posts** — Formato viral funciona (dados + CTA + link)
4. **Newsletter** — Edicao #001 com qualidade profissional
5. **Pipeline funciona** — Scout → Writer → Editor → Output

### Métricas da Sessão

| Métrica | Valor |
|---|---|
| Tasks criadas | 109 |
| Tasks concluídas | 64 |
| Artigos gerados | 32 |
| Linhas de conteudo | 8.000+ |
| Commits totais | 60+ |
| Tempo de operação | ~4 horas |
| Fontes coletadas | 9 pastas (reddit, youtube x5, trends, news, tiktok) |
| Idiomas cobertos | EN, ES, PT, DE, JA, KO |

### Descobertas Novas (Sessão 2)

1. **PC-2 produz 5-10 artigos por hora** — Velocidade impressionante
2. **Pipeline funciona com testes** — 6/6 passando, pronto para producao
3. **Metadata de fontes precisa de padronizacao** — Schema definido mas nao sempre seguido
4. **Agentes precisam de tasks recorrentes** — Self-review, suggestions, learn
5. **Fork precisa de auto-scaling** — Gerador automatico de tasks
6. **Cron de 5 minutos funciona** — Agentes nunca ficam sem trabalho
7. **Revisao da equipe e essencial** — Consolidar lições a cada 6h
8. **111 tasks done em ~7 horas** — Ritmo sustentavel
9. **75 artigos criados** — Volume impressionante
10. **Site com paginas dinamicas** — Deploy funcionando

### Descobertas Novas (Sessão 3)

1. **Agentes podem parar por 16h** — Cron pode falhar, precisa de watchdog
2. **143 tasks criadas no total** — Sistema de task generation funciona
3. **7 idiomas cobertos** — EN, ES, PT, DE, JA, KO, ZH
4. **15 pastas de fontes** — Reddit, YouTube x7, TikTok, Weibo, Trends, News
5. **Merge conflicts acontecem** — Precisa de protocolo de git mais robusto
6. **PC-2 gerou sugestao A+ (540 linhas)** — Auto-avaliacao funciona
7. **119 tasks done em ~8 horas** — Ritmo sustentavel
8. **65 artigos criados** — Volume consistente
9. **Amazon trending products coletados** — Fonte nova adicionada
10. **Brazil Guide em portugues** — Mercado inexplorado atacado
11. **PC-2 completou 3 documentos de revisao** — Self-review, source quality, improvement suggestions
12. **PC-1 criou PROPOSTAS-MELHORIA.md** — Analise tecnica solida
13. **GCP respondeu a todos os agentes** — Feedback documentado
14. **153 tasks done em ~12 horas** — Ritmo sustentavel
15. **96 artigos criados** — Volume consistente
16. **178 tasks criadas no total** — Sistema maduro
17. **Pipeline completo funcional** — Scout→Writer→Editor→SEO→Publish
18. **Agentes se auto-avaliam** — Sistema de melhoria continua
19. **GCP responde a todos** — Comunicacao bidirecional ativa
20. **104 artigos Silver + 6 Bronze** — Diversidade de conteudo
21. **167 tasks done em ~14 horas** — Ritmo sustentavel
22. **101 artigos criados** — Volume consistente
23. **Error boundary e search page criados** — Site cada vez mais funcional
24. **SEO completo: meta tags, OG, schema, internal links** — Otimizacao maxima
25. **Pipeline de conteudo automatizado** — Batch generator + SEO optimizer funcionando

### Melhorias Identificadas

1. **Bronze precisa de coleta real** — Agentes estao gerando artigos sem coletar dados primeiro
2. **SEO Agent e necessario** — Decisao D001 aprovada mas nao implementada
3. **Deploy do site** — T002 parcialmente feito, precisa completar
4. **Analytics** — Plausible nao configurado
5. **Monetizacao** — Nenhum link de afiliado ainda

### Lições Para o Futuro

1. **Coleta antes de produzir** — Bronze raw → Silver → Publicar
2. **Agentes precisam de supervisao** — Cron sozinho nao basta
3. **Templates salvam tempo** — Repliavel e escalavel
4. **Dados reais vendem** — Margens, precos, fornecedores
5. **Velocidade > perfeicao** — Melhor 10 artigos bons que 1 perfeito

### Descobertas Sessão 3 (PC-1)

1. **Pipeline com cache funciona** — Previne reprocessamento
2. **SEO automation eficiente** — Scripts de meta tags e links internos
3. **Status page util** — Transparência do sistema
4. **Auto-tasks gera trabalho** — Identifica gaps automaticamente
5. **Content calendar organiza** — Agenda visual facilita planejamento
6. **Validação de dados importante** — Scripts de validação previnem erros

### Métricas Atualizadas

| Métrica | Sessão 1-2 | Sessão 3 |
|---|---|---|
| Tasks concluídas | 64 | 75+ |
| Artigos gerados | 44 | 60+ |
| Scripts criados | 0 | 8 |
| Testes | 0 | 12 |
| Páginas site | 5 | 45+ |

---

## Sessão 4 — Fontes Autoritárias (2026-07-24)

### Mudança Estratégica: Coleta vs Fontes Autoritárias

**Problema identificado:** Coleta aleatória de fontes gera dados de baixa qualidade. Muitos registros sem data (69%), fontes desconhecidas, inconsistência entre idiomas.

**Solução:** Mapear fontes AUTORITÁRIAS por idioma. Usar apenas fontes validadas:
- Blogs oficiais de plataformas (Allegro, Rakuten, Coupang)
- Associações do setor (E-commerce Polska, Sebrae)
- Ferramentas líderes (Jungle Scout, Flexport)
- Fontes governamentais (Sebrae, DHL)

**Resultado:** 10 novas tasks de coleta (T260-T269) focadas em fontes reais, não aleatórias.

### Lição Chave
> "Fonte autoritária ≠ qualquer blog. A qualidade do bronze depende da AUTORIDADE da fonte, não da quantidade."
