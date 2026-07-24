# Correcao Estrategica — Bronze = Coleta, Nao Scraping

## O Que Mudou

**ANTES:** Bronze = scraping de marketplaces (1688, Alibaba, Amazon)
**AGORA:** Bronze = coleta de conteudo existente da web

## Por Que

1. Scraping e complexo demais para agora
2. Conteudo relevante JA EXISTE na web
3. So nao esta estruturado e facil de encontrar
4. Nossa forca e CURIOSAR, REAGRUPAR e REESTRUTURAR

## Fontes do Bronze (Datalake)

### Blogs e Artigos
| Fonte | URL | Idioma | Tipo |
|---|---|---|---|
| 1688 Wiki | wiki.1688.com | Chines | Guias de compra |
| Amazon Seller Blog | sell.amazon.com/blog/product-ideas | Ingles | Product ideas |
| Amazing.com | amazing.com/blog | Ingles | Tendencias ecommerce |
| NicheDropshipping | nichedropshipping.com/china-wholesale | Ingles | Wholesale guides |

### Reddit
| Subreddit | URL | Tipo |
|---|---|---|
| r/AmazonFBA | reddit.com/r/AmazonFBA | Discussoes |
| r/FulfillmentByAmazon | reddit.com/r/FulfillmentByAmazon | Reviews |
| r/dropship | reddit.com/r/dropship | Produtos trending |
| r/ecommerce | reddit.com/r/ecommerce | Estrategias |
| r/Alibaba | reddit.com/r/Alibaba | Fornecedores |

### YouTube (Multi-idioma)
| Idioma | Canais | Tipo |
|---|---|---|
| Ingles | Jungle Scout, Wholesale Ted | Reviews, tutoriais |
| Espanhol | Yomi Denzel, Ecommerce Latino | LATAM |
| Portugues | Sandro Ferreira, Luccas e Gi | Brasil |
| Alemao | Ecommerce Deutschland | Europa |
| Japones | Amazon JP seller channels | Asia |
| Polones | Polish dropshipping channels | Europa Oriental |
| Coreano | Korean ecommerce channels | Asia |
| Taiwanês | PChome, Rakuten TW | Asia |

### TikTok
| Hashtag | Idioma | Tipo |
|---|---|---|
| #productfinds | Multi | Produtos trending |
| #dropshipping | Multi | Negocios |
| #1688 | Multi | Sourcing |
| #amazonfba | Multi | FBA |

### Noticias e Tendencias
| Fonte | Tipo |
|---|---|
| Google Trends | Tendencias de busca |
| Import/export news | Impostos, fretes |
| Trade agreements | Acordos comerciais |
| Consumer trends | Mercados em expansao/queda |

## Fluxo de Dados

```
COLETA (Bronze)              TRATAMENTO (Silver)           PUBLICACAO
      │                              │                          │
      ├── Blogs ──────────┐          │                          │
      ├── YouTube ────────┤          │                          │
      ├── Reddit ─────────┤          │                          │
      ├── TikTok ─────────┼──→ content-db/raw/ ──→ Filtrar ──→ Merge ──→ Categorizar ──→ Publicar
      ├── Noticias ───────┤          │                          │
      ├── Google Trends ──┤          │                          │
      └── Guias 1688 ─────┘          │                          │
```

## O Que NAO Fazemos (Ainda)

- Scraping de precos de marketplaces
- Matching cross-platform automatizado
- Dados de margem em tempo real
- Alertas de preco

**Isso e GOLD — futuro.**

## O Que Fazemos AGORA

- Coletar conteudo existente
- Estruturar em Bronze
- Processar em Silver
- Publicar artigos
