# Schema de Metadata — Fontes Bronze

Toda fonte coletada DEVE conter esta metadata completa.

## Schema Obrigatorio

```json
{
  "id": "src_001",
  "titulo": "Titulo do conteudo",
  "url": "https://...",
  "fonte": "reddit|youtube|blog|tiktok|news|weibo|twitter",
  "canal": "nome_do_canal_ou_autor",
  "idioma": "en|es|pt|de|ja|ko|pl|zh|other",
  "data_coleta": "2026-07-24T02:30:00Z",
  "data_publicacao": "2026-07-20",
  "cat_produto": "electronics|fashion|home|beauty|pet|sports|toys|automotive|other",
  "cat_fonte": "review|tutorial|trend|news|list|discussion|guide|other",
  "qualidade": "A|B|C",
  "upvotes": 150,
  "views": 5000,
  "produtos_mencionados": ["phone case", "LED strip"],
  "insights_principais": ["insight 1", "insight 2"],
  "relevancia": "alta|media|baixa"
}
```

## Campos Detalhados

| Campo | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| id | string | Sim | ID unico da fonte |
| titulo | string | Sim | Titulo do conteudo original |
| url | string | Sim | URL original |
| fonte | enum | Sim | Plataforma de origem |
| canal | string | Sim | Nome do canal/autor/publicacao |
| idioma | enum | Sim | Idioma do conteudo |
| data_coleta | datetime | Sim | Quando coletamos |
| data_publicacao | date | Sim | Quando publicado na fonte |
| cat_produto | enum | Sim | Categoria do produto |
| cat_fonte | enum | Sim | Tipo de conteudo |
| qualidade | enum | Sim | Nossa avaliacao (A/B/C) |
| upvotes | int | Nao | Upvotes/likes (se aplicavel) |
| views | int | Nao | Visualizacoes (se aplicavel) |
| produtos_mencionados | array | Sim | Lista de produtos |
| insights_principais | array | Sim | Insights-chave |
| relevancia | enum | Sim | Relevancia para nosso publico |

## Categorias de Fonte

| Cat Fonte | Descricao | Exemplo |
|---|---|---|
| review | Avaliacao de produto | "Top 10 phone cases 2026" |
| tutorial | Como fazer | "How to buy from 1688" |
| trend | Tendencia de mercado | "Dropshipping trends 2026" |
| news | Noticia | "New tariffs on China imports" |
| list | Lista de produtos | "Best products to import" |
| discussion | Discussoe comunitaria | Reddit thread |
| guide | Guia completo | "Complete sourcing guide" |

## Exemplo de Fonte Completa

```json
{
  "id": "src_042",
  "titulo": "I analyzed 500+ products on 1688 vs Alibaba",
  "url": "https://reddit.com/r/AmazonFBA/...",
  "fonte": "reddit",
  "canal": "u/sourcingexpert",
  "idioma": "en",
  "data_coleta": "2026-07-24T02:30:00Z",
  "data_publicacao": "2026-07-22",
  "cat_produto": "electronics",
  "cat_fonte": "discussion",
  "qualidade": "A",
  "upvotes": 342,
  "views": null,
  "produtos_mencionados": ["phone cases", "LED strips", "bluetooth earbuds"],
  "insights_principais": [
    "1688 is 30-50% cheaper than Alibaba",
    "Need sourcing agent for 1688",
    "Quality identical if verified"
  ],
  "relevancia": "alta"
}
```
