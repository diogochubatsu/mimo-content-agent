# Correcao Estrategica — Bronze Datalake Completo

**Ultima atualizacao:** 2026-07-25

## Evolucao da Estrategia

| Fase | Bronze era... | Status |
|------|--------------|--------|
| Fase 1 | Scraping de marketplaces | ABANDONADA |
| Fase 2 | Coleta superficial de web | SUPERADA |
| **Fase 3** | **Datalake completo e monitorado** | **ATUAL** |

### O Que Mudou Agora

**ANTES:** Bronze = coleta de titulos e URLs (163 registros rasos)
**AGORA:** Bronze = datalake completo com transcricoes, links, imagens, metadata, monitoramento

### Por Que Agora

1. Silver so e forte se Bronze e profundo
2. Nao sabemos "quanto existe la fora" — precisamos de baseline
3. Fontes ficam obsoletas sem monitoramento
4. 8 idiomas = 8x mais fontes para mapear
5. Dados completos = conteudo unico que concorrentes nao tem
6. Meta de $10k/mes depende de Bronze solido

## Por Que

1. Scraping e complexo demais para agora
2. Conteudo relevante JA EXISTE na web
3. So nao esta estruturado e facil de encontrar
4. Nossa forca e CURIOSAR, REAGRUPAR e REESTRUTURAR

## Topics Principais

| Topic | Keywords Primarias | Prioridade |
|-------|-------------------|-----------|
| Import from China | import from china, buying from china, china supplier | CRITICO |
| Make Money Online | make money online, passive income, side hustle | ALTA |
| Dropshipping | dropshipping, dropship, fulfillment | ALTA |
| Product Tips | best products, product review, top 10 | ALTA |
| Alibaba/1688 | 1688 vs alibaba, buy from 1688, 1688 agent | CRITICO |

## Fontes do Bronze (Datalake)

### Fontes Mapeadas (ver content-db/raw/registry/sources-registry.json)

| Idioma | YouTube | Blogs | Reddit | TikTok | Total |
|--------|---------|-------|--------|--------|-------|
| PT-BR | 2 canais | 2 blogs | - | - | 4 |
| EN | 3 canais | 3 blogs | 2 subs | - | 8 |
| ES | 1 canal | - | - | - | 1 |
| DE | - | 1 blog | - | - | 1 |
| PL | - | 2 blogs | - | - | 2 |
| ZH | - | - | - | - | 0 (expandir) |
| KO | - | - | - | - | 0 (expandir) |
| JA | - | - | - | - | 0 (expandir) |

### Schema Unificado de Itens

Cada item Bronze DEVE ter:
- source_id, title, url, language, category
- published_date, collected_date
- word_count, transcript/content
- images (recomendado), links internos/externos
- description, key_takeaways, topic_tags

**Criterio de qualidade:** Completeness score >80 = A-grade

## Fluxo de Dados Atualizado

```
REGISTRY (GCP mapeia fontes)
    ↓
COLETA (PC-1 YouTube + PC-2 Blogs)
    ↓ content-db/raw/ com schema padrao
ENRIQUECIMENTO (PC-1 auto-enrich)
    ↓ metadata completa, deduplicacao
MONITORAMENTO (scripts automaticos)
    ↓ freshness, coverage, extraction %
QUALIDADE (GCP review semanal)
    ↓ scoring, feedback, ajustes
PRONTO PARA SILVER
```

## O Que NAO Fazemos (Ainda)

- Scraping de precos de marketplaces
- Matching cross-platform automatizado
- Alertas de preco em tempo real

**Isso e GOLD — futuro.**

## Sistema de Monitoramento

| Metrica | Script | Alerta |
|---------|--------|--------|
| Freshness | source-monitor.js | >14 dias = stale |
| Coverage | coverage-report.js | <20% extraction = prioritario |
| Volume | pipeline-metrics.js | Queda >50% = verificar |
| Completeness | score-bronze.js | <70% = enriquecer
